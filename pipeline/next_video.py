"""Choisit la vidéo « à voir ensuite » montrée dans l'écran de fin d'une vidéo longue et liée dans sa description.

Depuis le 28/11/2026, rien n'est plus réglé à la main dans YouTube Studio : l'API YouTube Data v3 ne permet
de poser ni les éléments d'écran de fin ni la « vidéo associée » d'un Short. La fin est donc entièrement
dans l'image (remotion/src/components/special.tsx, EndScreen) et le lien cliquable dans la description.

Choix :
1. metadata.json de la vidéo, champ "next_video" : dossier d'une vidéo longue déjà envoyée
   (ex. "videos/09-eggs"), à préférer quand une vidéo du même pilier ou du même thème existe ;
2. sinon la dernière vidéo longue envoyée (config/calendar.json), hors la vidéo elle-même.
La vidéo choisie a déjà un ID YouTube et sort avant la vidéo en cours, donc son lien marche le jour J.

Le choix est figé dans <video>/build/next.json (rendu et description lisent le même fichier).
Usage : python3 pipeline/next_video.py videos/11-starbucks [dossier_public_remotion]
  -> écrit build/next.json ; avec un dossier public, y copie next.json et la miniature (next-thumb.png).
"""

import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALENDAR = ROOT / "config" / "calendar.json"
CHANNEL_URL = "https://www.youtube.com/@thecostcurvetv"
SUBSCRIBE_URL = CHANNEL_URL + "?sub_confirmation=1"


def _rel(path):
    return str(Path(path).resolve().relative_to(ROOT))


def _long_items():
    items = json.loads(CALENDAR.read_text())["items"] if CALENDAR.exists() else []
    return [i for i in items if i["kind"] == "long" and i.get("video_id")]


def _entry(folder, video_id):
    d = ROOT / folder
    title = json.loads((d / "metadata.json").read_text())["title"]
    thumb = d / "build" / "thumbnail.png"
    return {"folder": folder, "video_id": video_id, "url": f"https://youtu.be/{video_id}", "title": title,
            "thumbnail": _rel(thumb) if thumb.exists() else None}


def choose(video):
    """Vidéo à voir ensuite (dict) ou None s'il n'y en a aucune (première vidéo de la chaîne)."""
    me = _rel(video)
    longs = [i for i in _long_items() if i["folder"] != me]
    ids = {i["folder"]: i["video_id"] for i in longs}
    wanted = json.loads((Path(video) / "metadata.json").read_text()).get("next_video")
    if wanted:
        wanted = wanted.rstrip("/")
        if wanted not in ids:
            sys.exit(f"next_video {wanted} : pas de vidéo longue envoyée à ce dossier dans config/calendar.json")
        return _entry(wanted, ids[wanted])
    if not longs:
        return None
    last = max(longs, key=lambda i: i.get("publish_at") or "")
    return _entry(last["folder"], last["video_id"])


def load(video):
    """Choix figé (build/next.json), calculé et écrit s'il n'existe pas encore."""
    f = Path(video) / "build" / "next.json"
    if f.exists():
        return json.loads(f.read_text()) or None
    nxt = choose(video)
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(nxt or {}, indent=2, ensure_ascii=False) + "\n")
    return nxt


def main():
    video = Path(sys.argv[1])
    nxt = load(video)
    print(f"À voir ensuite : {nxt['title']} ({nxt['url']})" if nxt else "Aucune autre vidéo : écran de fin sans renvoi")
    if len(sys.argv) > 2:
        public = Path(sys.argv[2])
        card = dict(nxt or {})
        if nxt and nxt.get("thumbnail"):
            shutil.copy(ROOT / nxt["thumbnail"], public / "next-thumb.png")
            card["thumbnail"] = "next-thumb.png"
        (public / "next.json").write_text(json.dumps(card, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
