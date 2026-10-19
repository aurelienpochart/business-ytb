"""Test d'écoute : synthétise le même texte avec plusieurs voix Chirp 3 HD.

Usage : python pipeline/voice_test.py [config/voice-test.json]
Le jeton d'accès Google est lu dans GOOGLE_ACCESS_TOKEN (fourni par le workflow).
"""

import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

API = "https://texttospeech.googleapis.com/v1"
OUT_DIR = Path("samples/voix")


def call(method, path, token, body=None):
    req = urllib.request.Request(
        f"{API}/{path}",
        method=method,
        data=json.dumps(body).encode() if body else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


def main():
    config = json.loads(Path(sys.argv[1] if len(sys.argv) > 1 else "config/voice-test.json").read_text())
    token = os.environ["GOOGLE_ACCESS_TOKEN"]
    text = Path(config["text_file"]).read_text().strip()

    available = {
        v["name"]: v.get("ssmlGender", "?")
        for v in call("GET", f"voices?languageCode={config['language_code']}", token)["voices"]
        if "Chirp3-HD" in v["name"]
    }
    print(f"{len(available)} voix Chirp 3 HD disponibles en {config['language_code']} :")
    print(", ".join(sorted(n.rsplit("-", 1)[-1] for n in available)))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report = []
    for name in config["voices"]:
        if name not in available:
            print(f"!! {name} introuvable, ignorée")
            continue
        body = {
            "input": {"text": text},
            "voice": {"languageCode": config["language_code"], "name": name},
            "audioConfig": {"audioEncoding": "MP3", "speakingRate": config.get("speaking_rate", 1.0)},
        }
        audio = base64.b64decode(call("POST", "text:synthesize", token, body)["audioContent"])
        short = name.rsplit("-", 1)[-1].lower()
        path = OUT_DIR / f"{short}.mp3"
        path.write_bytes(audio)
        report.append({"voice": name, "gender": available[name], "file": str(path), "bytes": len(audio)})
        print(f"OK {name} ({available[name]}) -> {path}")

    (OUT_DIR / "rapport.json").write_text(
        json.dumps({"characters": len(text), "samples": report}, indent=2) + "\n"
    )
    print(f"{len(report)} échantillons, {len(text)} caractères chacun ({len(text) * len(report)} au total).")
    if not report:
        sys.exit(1)


if __name__ == "__main__":
    main()
