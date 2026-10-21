"""Envoie un Short sur YouTube, toujours en PRIVÉ, avec ses sous-titres.

Usage : python3 pipeline/upload_short.py <dossier_du_short> <fichier.mp4>
Secrets (GitHub Actions) : YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
Titre et description : <short>/metadata.json (description construite par pipeline/short.py, charte 6.6).
Catégorie 27 (Éducation) ; containsSyntheticMedia : même décision que la vidéo longue dont le Short est
extrait, sauf si le metadata.json du Short la précise.
Non automatisable : le lien « vidéo associée » (related video) d'un Short n'existe pas dans l'API YouTube
Data v3 (aucune propriété de la ressource videos) ; il se règle dans YouTube Studio. Le passage en public
reste une action manuelle d'aurelien (validation C-08).
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from short import description  # noqa: E402
from upload_youtube import access_token, request, upload_video  # noqa: E402


def main():
    short, mp4 = Path(sys.argv[1]), Path(sys.argv[2])
    video = short.resolve().parent.parent
    meta = json.loads((short / "metadata.json").read_text())
    parent = json.loads((video / "metadata.json").read_text())
    long_url = json.loads((video / "build" / "youtube.json").read_text())["url"]
    resource_meta = {
        "title": meta["title"],
        "tags": meta.get("tags", []),
        "category_id": meta.get("category_id", "27"),
        "made_for_kids": meta.get("made_for_kids", False),
        "contains_synthetic_media": meta.get("contains_synthetic_media", parent["contains_synthetic_media"]),
    }
    text = description(short, long_url)
    print(f"Titre : {meta['title']}\n{text}")
    token = access_token()
    result = upload_video(token, mp4, resource_meta, text)
    video_id = result["id"]
    print(f"Short envoyé en privé : https://youtu.be/{video_id}")

    srt = (short / "build" / "captions.srt").read_bytes()
    boundary = "thecostcurve-caption"
    caption_meta = {"snippet": {"videoId": video_id, "language": "en", "name": "English", "isDraft": False}}
    body = (
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json.dumps(caption_meta)}\r\n"
        f"--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n"
    ).encode() + srt + f"\r\n--{boundary}--\r\n".encode()
    request("POST", "https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet",
            token, body, {"Content-Type": f"multipart/related; boundary={boundary}"})
    print("Sous-titres anglais ajoutés")

    (short / "build" / "youtube.json").write_text(json.dumps(
        {"video_id": video_id, "url": f"https://youtu.be/{video_id}", "privacy": "private",
         "related_video": long_url, "related_video_set": False}, indent=2) + "\n")
    print(f"À faire dans YouTube Studio : vidéo associée -> {long_url}")


if __name__ == "__main__":
    main()
