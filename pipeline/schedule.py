"""Choisit la date de sortie (publishAt) d'une vidéo ou d'un Short, selon la charte, et tient le calendrier.

Règles (charte 5.1 et 6.5), heures UTC :
- vidéo longue : prochain mardi ou vendredi 15h libre, au moins 24 h après l'envoi ;
- Short extrait : 2 jours après la sortie de sa vidéo longue, 17h (jour suivant libre si déjà pris) ;
- Short original : prochain jour sans Short, 17h, au moins 24 h après l'envoi.
Un seul Short par jour. La vidéo est envoyée en privé avec publishAt : YouTube la publie seul à cette date,
et aurelien peut toujours la bloquer avant dans Studio (repasser en privé sans date).

Usage en bibliothèque : choose(folder, kind) -> datetime | None ; record(folder, kind, video_id, when).
"""

import datetime as dt
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALENDAR = ROOT / "config" / "calendar.json"
LONG_DAYS = (1, 4)  # mardi, vendredi
LONG_HOUR, SHORT_HOUR = 15, 17
MIN_DELAY = dt.timedelta(hours=24)
UTC = dt.timezone.utc


def _load():
    return json.loads(CALENDAR.read_text()) if CALENDAR.exists() else {"items": []}


def _parse(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def _taken(items, kind):
    return {_parse(i["publish_at"]).date() for i in items if i["kind"] == kind and i.get("publish_at")}


def _now():
    return dt.datetime.now(UTC)


def norm(folder):
    """Chemin relatif au dépôt, sans / final (clé du calendrier)."""
    path = Path(folder)
    if path.is_absolute():
        path = path.resolve().relative_to(ROOT)
    return path.as_posix().rstrip("/")


def choose(folder, kind, parent=None):
    """Date de sortie pour folder ; parent = dossier de la vidéo longue d'un Short extrait."""
    folder, parent = norm(folder), parent and norm(parent)
    override = os.environ.get("PUBLISH_AT", "auto").strip() or "auto"
    if override == "none":
        return None
    if override != "auto":
        return _parse(override).astimezone(UTC)
    items = [i for i in _load()["items"] if i["folder"] != folder]
    earliest = _now() + MIN_DELAY
    if kind == "long":
        taken = _taken(items, "long")
        day = earliest.date()
        while True:
            when = dt.datetime.combine(day, dt.time(LONG_HOUR), UTC)
            if day.weekday() in LONG_DAYS and day not in taken and when >= earliest:
                return when
            day += dt.timedelta(days=1)
    taken = _taken(items, "short")
    day = earliest.date()
    if parent:
        p = next((i for i in items if i["folder"] == parent and i.get("publish_at")), None)
        if p:
            day = max(day, _parse(p["publish_at"]).date() + dt.timedelta(days=2))
            earliest = min(earliest, _now() + dt.timedelta(hours=2))
    while True:
        when = dt.datetime.combine(day, dt.time(SHORT_HOUR), UTC)
        if day not in taken and when >= earliest:
            return when
        day += dt.timedelta(days=1)


def record(folder, kind, video_id, when):
    folder = norm(folder)
    data = _load()
    data["items"] = [i for i in data["items"] if i["folder"] != folder]
    data["items"].append({"kind": kind, "folder": folder, "video_id": video_id,
                          "publish_at": when.strftime("%Y-%m-%dT%H:%M:%SZ") if when else None})
    data["items"].sort(key=lambda i: i["publish_at"] or "9999")
    CALENDAR.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def rfc3339(when):
    return when.strftime("%Y-%m-%dT%H:%M:%SZ")
