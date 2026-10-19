"""Construit la description YouTube (charte 5.5) à partir de metadata.json et de la timeline.

Usage : python pipeline/description.py videos/01-tesla  -> écrit build/description.txt
"""

import json
import sys
from pathlib import Path


def stamp(t):
    t = int(t)
    return f"{t // 3600}:{t // 60 % 60:02}:{t % 60:02}" if t >= 3600 else f"{t // 60:02}:{t % 60:02}"


def main():
    video = Path(sys.argv[1])
    meta = json.loads((video / "metadata.json").read_text())
    timeline = json.loads((video / "build" / "timeline.json").read_text())
    starts = {}
    for seg in timeline["segments"]:
        starts.setdefault(seg["chapter"], seg["start"])
    starts[0] = 0  # YouTube exige que le premier chapitre commence à 00:00
    chapters = [f"{stamp(starts[c])} {meta['chapter_titles'][str(c)]}" for c in sorted(starts)]
    parts = [
        meta["summary"],
        "Chapters\n" + "\n".join(chapters),
        "Sources\n" + "\n".join(f"- {s}" for s in meta["sources"]),
        "\n".join(meta["credits"]),
        "This video is for educational purposes and is not financial advice.\n"
        "Made with the help of AI tools, including a synthetic narrator voice.",
    ]
    text = "\n\n".join(parts) + "\n"
    if len(text) > 5000:
        sys.exit(f"Description trop longue pour YouTube : {len(text)} caractères (max 5000)")
    (video / "build" / "description.txt").write_text(text)
    print(text)


if __name__ == "__main__":
    main()
