"""Envoie une vidéo sur YouTube, toujours en PRIVÉ, avec miniature et sous-titres.

Usage : python pipeline/upload_youtube.py <dossier_video> <fichier.mp4> <miniature.png>
Secrets (GitHub Actions) : YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
Le passage en public reste une action manuelle d'aurelien dans YouTube Studio (validation C-08).
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

CHUNK = 64 * 1024 * 1024


def access_token():
    data = urllib.parse.urlencode({
        "client_id": os.environ["YT_CLIENT_ID"],
        "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    with urllib.request.urlopen("https://oauth2.googleapis.com/token", data=data, timeout=60) as resp:
        return json.load(resp)["access_token"]


def request(method, url, token, body=None, headers=None):
    req = urllib.request.Request(url, data=body, method=method,
                                 headers={"Authorization": f"Bearer {token}", **(headers or {})})
    return urllib.request.urlopen(req, timeout=600)


def upload_video(token, path, meta, description):
    resource = {
        "snippet": {
            "title": meta["title"],
            "description": description,
            "tags": meta["tags"],
            "categoryId": meta["category_id"],
            "defaultLanguage": "en",
            "defaultAudioLanguage": "en",
        },
        "status": {
            "privacyStatus": "private",
            "selfDeclaredMadeForKids": meta["made_for_kids"],
            "containsSyntheticMedia": meta["contains_synthetic_media"],
        },
    }
    size = path.stat().st_size
    init = request(
        "POST",
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        token,
        json.dumps(resource).encode(),
        {"Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Length": str(size),
         "X-Upload-Content-Type": "video/mp4"},
    )
    session = init.headers["Location"]
    with path.open("rb") as f:
        offset = 0
        while offset < size:
            chunk = f.read(CHUNK)
            end = offset + len(chunk) - 1
            try:
                resp = request("PUT", session, token, chunk,
                               {"Content-Length": str(len(chunk)), "Content-Range": f"bytes {offset}-{end}/{size}"})
                return json.load(resp)  # 200/201 : envoi terminé
            except urllib.error.HTTPError as err:
                if err.code != 308:  # 308 = morceau reçu, continuer
                    raise
            offset = end + 1
            print(f"  {offset * 100 // size} %")
    raise RuntimeError("Envoi interrompu")


def main():
    video_dir, mp4, thumb = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    meta = json.loads((video_dir / "metadata.json").read_text())
    # Grille C-13 : musique générée par IA (music.json présent) => divulgation obligatoire.
    if (video_dir / "build" / "music.json").exists():
        meta["contains_synthetic_media"] = True
    description = (video_dir / "build" / "description.txt").read_text()
    token = access_token()

    video = upload_video(token, mp4, meta, description)
    video_id = video["id"]
    print(f"Vidéo envoyée en privé : https://youtu.be/{video_id}")

    request("POST", f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={video_id}",
            token, thumb.read_bytes(), {"Content-Type": "image/png"})
    print("Miniature ajoutée")

    srt = (video_dir / "build" / "captions.srt").read_bytes()
    boundary = "thecostcurve-caption"
    caption_meta = {"snippet": {"videoId": video_id, "language": "en", "name": "English", "isDraft": False}}
    body = (
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json.dumps(caption_meta)}\r\n"
        f"--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n"
    ).encode() + srt + f"\r\n--{boundary}--\r\n".encode()
    request("POST", "https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet",
            token, body, {"Content-Type": f"multipart/related; boundary={boundary}"})
    print("Sous-titres anglais ajoutés")

    (video_dir / "build" / "youtube.json").write_text(json.dumps(
        {"video_id": video_id, "url": f"https://youtu.be/{video_id}", "privacy": "private"}, indent=2) + "\n")


if __name__ == "__main__":
    main()
