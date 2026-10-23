"""Construit la description YouTube (charte 5.5) à partir de metadata.json et de la timeline.

Usage : python pipeline/description.py videos/01-tesla  -> écrit build/description.txt
"""

import json
import sys
from pathlib import Path


def stamp(t):
    t = int(t)
    return f"{t // 3600}:{t // 60 % 60:02}:{t % 60:02}" if t >= 3600 else f"{t // 60:02}:{t % 60:02}"


def image_credits(video, subject="Tesla, Inc."):
    """Crédits des images Wikimedia réellement utilisées (obligatoires pour CC BY / BY-SA)."""
    media_file = video / "media.json"
    if not media_file.exists():
        return None
    used = (video / "visuals.json").read_text()
    lines = []
    logos = False
    for m in json.loads(media_file.read_text()):
        if f'"{m["id"]}"' not in used:
            continue
        lic = m.get("license", "")
        if m["id"].startswith("logo_") or ("trademark" in (m.get("restrictions") or "") and not lic.startswith("CC BY")):
            logos = True
            continue
        if "trademark" in (m.get("restrictions") or ""):
            logos = True  # photo sous licence CC BY montrant une marque : créditée quand même
        if lic.startswith("CC BY"):
            artist = " ".join((m.get("artist") or "Unknown").split())
            lines.append(f"- {artist}, {lic}: {m['page']}")
    parts = []
    if lines:
        parts.append("Images (Wikimedia Commons)\n" + "\n".join(lines) + "\nOther images: public domain or CC0.")
    if logos:
        parts.append(
            "Logos are trademarks of their respective owners, shown for identification only. "
            f"This channel is independent and not affiliated with or endorsed by {subject} "
            "or any company mentioned."
        )
    return "\n\n".join(parts) or None


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
        image_credits(video, meta.get("subject_company", "Tesla, Inc.")),
        "This video is for educational purposes and is not financial advice.\n"
        "Made with the help of AI tools, including a synthetic narrator voice"
        + (" and original background music generated with Google Lyria." if (video / "build" / "music.json").exists() else "."),
    ]
    text = "\n\n".join(p for p in parts if p) + "\n"
    size = len(text.encode())
    if size > 5000:
        sys.exit(f"Description trop longue pour YouTube : {size} octets (max 5000)")
    (video / "build" / "description.txt").write_text(text)
    print(text)


if __name__ == "__main__":
    main()
