"""Génère les musiques de fond originales avec Lyria 2 (Vertex AI).

Usage : python3 pipeline/music_gen.py config/music.json [piste ...]
Sortie : music/<piste>/clip-<graine>.flac (sans perte) + samples/musique/<piste>.mp3 (écoute :
les extraits enchaînés en fondu). Les extraits déjà présents ne sont pas regénérés (0,06 $ / 30 s).
Env : GOOGLE_ACCESS_TOKEN, GOOGLE_PROJECT (défaut business-ytb).
"""
import base64
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CROSSFADE = 4.0


def generate(cfg, prompt, seed):
    url = (f"https://{cfg['location']}-aiplatform.googleapis.com/v1/projects/"
           f"{os.environ.get('GOOGLE_PROJECT', 'business-ytb')}/locations/{cfg['location']}"
           f"/publishers/google/models/{cfg['model']}:predict")
    body = {"instances": [{"prompt": prompt, "negative_prompt": cfg["negative_prompt"], "seed": seed}],
            "parameters": {}}
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST", headers={
        "Authorization": f"Bearer {os.environ['GOOGLE_ACCESS_TOKEN']}",
        "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Lyria : HTTP {e.code} {e.read().decode()[:800]}")
    preds = data.get("predictions") or []
    if not preds:
        sys.exit(f"Lyria : réponse vide {json.dumps(data)[:500]}")
    return base64.b64decode(preds[0]["bytesBase64Encoded"])


def preview(clips, out):
    """Enchaîne les extraits en fondu enchaîné, MP3 320 kb/s pour l'écoute."""
    out.parent.mkdir(parents=True, exist_ok=True)
    args = ["ffmpeg", "-loglevel", "error", "-y"]
    for c in clips:
        args += ["-i", str(c)]
    if len(clips) == 1:
        filt = "[0:a]anull[a]"
    else:
        parts, prev = [], "[0:a]"
        for i in range(1, len(clips)):
            lab = "[a]" if i == len(clips) - 1 else f"[x{i}]"
            parts.append(f"{prev}[{i}:a]acrossfade=d={CROSSFADE}:c1=tri:c2=tri{lab}")
            prev = lab
        filt = ";".join(parts)
    subprocess.run(args + ["-filter_complex", filt, "-map", "[a]", "-c:a", "libmp3lame", "-b:a", "320k",
                           str(out)], check=True)


def main():
    cfg = json.loads(Path(sys.argv[1]).read_text())
    wanted = sys.argv[2:] or list(cfg["tracks"])
    for name in wanted:
        track = cfg["tracks"][name]
        d = ROOT / "music" / name
        d.mkdir(parents=True, exist_ok=True)
        clips = []
        for seed in track["seeds"]:
            flac = d / f"clip-{seed}.flac"
            if not flac.exists():
                wav = d / f"clip-{seed}.wav"
                wav.write_bytes(generate(cfg, track["prompt"], seed))
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-c:a", "flac",
                                "-compression_level", "12", str(flac)], check=True)
                wav.unlink()
                print(f"{name} : graine {seed} générée")
            clips.append(flac)
        (d / "track.json").write_text(json.dumps({"prompt": track["prompt"], "model": cfg["model"],
                                                  "seeds": track["seeds"]}, indent=2) + "\n")
        preview(clips, ROOT / "samples" / "musique" / f"{name}.mp3")


if __name__ == "__main__":
    main()
