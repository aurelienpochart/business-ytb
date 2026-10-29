#!/usr/bin/env bash
# Copie dans remotion/public/ les fichiers d'un Short (à lancer depuis remotion/) : narration, minutage et
# accroche du Short, ses visuels, et les images de la vidéo longue dont il est extrait ; un Short original
# (videos/shorts-originaux/<n-sujet>) a ses propres images (media.json et media/ dans son dossier).
# Usage : bash ../pipeline/remotion_public_short.sh ../videos/01-tesla/shorts/1
set -euo pipefail
S="$1"
V="$S/../.."
[ -f "$S/media.json" ] && V="$S"
rm -rf public/media public/*.json public/narration.wav
cp "$S/build/timeline.json" "$S/build/narration.wav" "$S/build/short.json" "$S/visuals.json" public/
if [ -f "$V/media.json" ]; then
  cp "$V/media.json" public/
  mkdir -p public/media
  find "$V/media" -maxdepth 1 -type f -exec cp {} public/media/ \;
fi
ls public
