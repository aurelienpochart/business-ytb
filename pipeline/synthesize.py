"""Synthétise la narration d'une vidéo, segment par segment, avec la voix de la chaîne.

Entrée : <video>/build/segments.json (pipeline/narration.py) et config/voice.json.
Sorties dans <video>/build/ :
  narration.wav   audio sans perte (48 kHz, 24 bits, mono), pauses comprises,
                  normalisé à -14 LUFS (niveau de lecture YouTube), crête vraie -1,5 dB
  timeline.json   début et fin de chaque segment, en secondes
  captions.srt    sous-titres exacts (texte du script), calés sur la timeline
Le jeton Google est lu dans GOOGLE_ACCESS_TOKEN (fourni par le workflow).
"""

import base64
import io
import json
import os
import re
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path

API = "https://texttospeech.googleapis.com/v1/text:synthesize"
PAUSE_SEGMENT = 0.45  # entre deux paragraphes
PAUSE_CHAPTER = 1.1   # entre deux chapitres
LEAD_IN = 0.3
IDENT = 3.6          # trou après l'accroche (chapitre 0) pour l'ident de 3 s
MAX_CUE_CHARS = 84
LOUDNESS = "I=-14:TP=-1.5:LRA=11"  # YouTube ramène tout à -14 LUFS : on y est déjà, sans perte


def normalize(path):
    """Normalisation de sonie en deux passes (ffmpeg loudnorm, mode linéaire : durée inchangée)."""
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", f"loudnorm={LOUDNESS}:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True, check=True).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    out = path.with_suffix(".norm.wav")
    af = (f"loudnorm={LOUDNESS}:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(path), "-af", af,
                    "-ar", "48000", "-c:a", "pcm_s24le", str(out)], check=True)
    out.replace(path)
    print(f"Sonie : {m['input_i']} LUFS -> -14 LUFS")


def synthesize(text, voice, token):
    body = {
        "input": {"text": text},
        "voice": {"languageCode": voice["language_code"], "name": voice["voice"]},
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": voice["sample_rate_hertz"],
                        "speakingRate": voice.get("speaking_rate", 1.0)},
    }
    req = urllib.request.Request(API, data=json.dumps(body).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as resp:
        audio = base64.b64decode(json.load(resp)["audioContent"])
    with wave.open(io.BytesIO(audio)) as w:  # la réponse LINEAR16 contient un en-tête WAV
        return w.readframes(w.getnframes())


def split_cues(text):
    """Coupe un paragraphe en sous-titres d'au plus MAX_CUE_CHARS, aux fins de phrase, puis en
    morceaux équilibrés (coupure de préférence après une virgule ou deux-points)."""
    cues = []
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        words = sentence.split()
        while words:
            rest = " ".join(words)
            if len(rest) <= MAX_CUE_CHARS:
                cues.append(rest)
                break
            n = -(-len(rest) // MAX_CUE_CHARS)  # nombre de morceaux restants
            target = len(rest) / n
            best, best_score, length = 1, None, -1
            for i, word in enumerate(words[:-1], 1):
                length += 1 + len(word)
                if length > MAX_CUE_CHARS:
                    break
                score = abs(length - target) - (12 if word[-1] in ",:;" else 0)
                if best_score is None or score < best_score:
                    best, best_score = i, score
            cues.append(" ".join(words[:best]))
            words = words[best:]
    return cues


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main():
    video = Path(sys.argv[1])
    build = video / "build"
    segments = json.loads((build / "segments.json").read_text())
    voice = json.loads(Path("config/voice.json").read_text())
    token = os.environ["GOOGLE_ACCESS_TOKEN"]
    rate = voice["sample_rate_hertz"]
    frame_bytes = 2

    pcm, timeline, cursor, ident_start = bytearray(), [], 0.0, None
    pcm += bytes(int(LEAD_IN * rate) * frame_bytes)
    cursor = LEAD_IN
    for i, seg in enumerate(segments):
        if i:
            pause = PAUSE_CHAPTER if seg["chapter"] != segments[i - 1]["chapter"] else PAUSE_SEGMENT
            if segments[i - 1]["chapter"] == 0 and seg["chapter"] != 0:
                pause = IDENT
                ident_start = round(cursor + 0.3, 3)
            pcm += bytes(int(pause * rate) * frame_bytes)
            cursor += int(pause * rate) / rate
        audio = synthesize(seg["text"], voice, token)
        duration = len(audio) / frame_bytes / rate
        timeline.append({**seg, "start": round(cursor, 3), "end": round(cursor + duration, 3)})
        pcm += audio
        cursor += duration
        print(f"{seg['id']}: {duration:.1f} s")
    pcm += bytes(int(1.0 * rate) * frame_bytes)

    with wave.open(str(build / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(frame_bytes)
        w.setframerate(rate)
        w.writeframes(bytes(pcm))
    normalize(build / "narration.wav")

    total = len(pcm) / frame_bytes / rate
    (build / "timeline.json").write_text(json.dumps({"duration": round(total, 3), "ident": ident_start, "segments": timeline},
                                                    indent=2, ensure_ascii=False) + "\n")

    # Sous-titres : durée de chaque segment répartie entre ses cues au prorata des caractères.
    lines, n = [], 1
    for seg in timeline:
        cues = split_cues(seg["text"])
        span, total_chars, t = seg["end"] - seg["start"], sum(len(c) for c in cues), seg["start"]
        for cue in cues:
            d = span * len(cue) / total_chars
            lines.append(f"{n}\n{srt_time(t)} --> {srt_time(t + d)}\n{cue}\n")
            n, t = n + 1, t + d
    (build / "captions.srt").write_text("\n".join(lines))
    chars = sum(len(s["text"]) for s in segments)
    print(f"Narration : {total / 60:.1f} min, {chars} caractères facturés (offre gratuite : 1 M/mois).")


if __name__ == "__main__":
    main()
