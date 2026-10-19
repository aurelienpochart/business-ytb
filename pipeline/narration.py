"""Découpe un script de vidéo (script.md) en segments de narration.

Règles du format : chapitres « ## N. Titre » ; lignes « > » = indications d'image, non lues ;
repères [T1], [F2]… retirés ; on s'arrête à « ## Notes ». Un segment = un paragraphe lu.
Usage : python pipeline/narration.py videos/01-tesla  -> écrit build/segments.json
"""

import json
import re
import sys
from pathlib import Path


def parse(script: str):
    body = script.split("\n## 0.", 1)[1]
    body = "## 0." + body.split("\n## Notes", 1)[0]
    chapters, current = [], None
    for block in re.split(r"\n\s*\n", body):
        block = block.strip()
        if not block or block == "---":
            continue
        if block.startswith("## "):
            num, title = re.match(r"## (\d+)\.\s*(.*)", block).groups()
            current = {"chapter": int(num), "title": title, "segments": []}
            chapters.append(current)
            continue
        lines = [l for l in block.splitlines() if not l.startswith(">")]
        text = " ".join(l.strip() for l in lines).strip()
        if not text:
            continue
        text = re.sub(r"\s*\[[A-Z]\d+[a-z]?\]", "", text)
        text = text.replace("**", "").strip()
        current["segments"].append(text)
    segments = []
    for ch in chapters:
        for i, text in enumerate(ch["segments"]):
            segments.append({"id": f"c{ch['chapter']}p{i}", "chapter": ch["chapter"],
                             "chapter_title": ch["title"], "text": text})
    return segments


def main():
    video = Path(sys.argv[1])
    segments = parse((video / "script.md").read_text())
    out = video / "build"
    out.mkdir(exist_ok=True)
    (out / "segments.json").write_text(json.dumps(segments, indent=2, ensure_ascii=False) + "\n")
    words = sum(len(s["text"].split()) for s in segments)
    print(f"{len(segments)} segments, {words} mots, {sum(len(s['text']) for s in segments)} caractères")


if __name__ == "__main__":
    main()
