#!/usr/bin/env bash
# Commite le résultat d'un envoi YouTube (build/youtube.json, build/description.txt, config/calendar.json) et pousse, même si un autre
# workflow a modifié le calendrier entre-temps : en cas de conflit, on repart de la branche distante,
# on remet ces fichiers et on réinscrit l'envoi dans le calendrier à partir de build/youtube.json.
# Usage : pipeline/commit_upload.sh <dossier> <long|short> <message>
set -euo pipefail
folder=$1 kind=$2 msg=$3
branch=$(git rev-parse --abbrev-ref HEAD)
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
save=$(mktemp -d)
for f in youtube.json description.txt; do [ -f "$folder/build/$f" ] && cp "$folder/build/$f" "$save/"; done
for i in 1 2 3 4 5 6; do
  git fetch -q origin "$branch"
  git reset -q --hard "origin/$branch"
  mkdir -p "$folder/build" && cp "$save"/* "$folder/build/"
  python3 - "$folder" "$kind" <<'PY'
import json, sys
from pathlib import Path
sys.path.insert(0, "pipeline")
import schedule
folder, kind = sys.argv[1], sys.argv[2]
yt = json.loads((Path(folder) / "build" / "youtube.json").read_text())
when = schedule._parse(yt["publish_at"]) if yt.get("publish_at") else None
schedule.record(folder, kind, yt["video_id"], when)
PY
  git add "$folder/build/youtube.json" config/calendar.json
  [ -f "$folder/build/description.txt" ] && git add "$folder/build/description.txt" || true
  git diff --cached --quiet && exit 0
  git commit -q -m "$msg"
  git push -q origin "HEAD:$branch" && exit 0
  sleep $((i * 5))
done
exit 1
