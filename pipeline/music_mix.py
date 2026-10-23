"""Ajoute une musique de fond sous la bande son d'une vidéo déjà rendue (image copiée sans réencodage).

Usage : python3 pipeline/music_mix.py entree.mp4 sortie.mp4 <piste> [--lufs -28] [--start 0]
- La piste = music/<piste>/clip-*.flac (voir music_gen.py), extraits enchaînés en fondu, en boucle.
- La musique est d'abord calée à --lufs (sonie seule), puis baissée automatiquement quand la voix
  (ou un effet) joue (compresseur déclenché par la bande son d'origine) : elle remonte dans les
  pauses, l'ouverture, les changements de chapitre et l'écran de fin.
- Mixage final ramené à -14 LUFS, crête vraie -1,5 dB, AAC 320 kb/s 48 kHz.
--start : décale l'ordre des extraits (pour que deux vidéos de la même piste ne commencent pas pareil).
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XF = 4.0  # fondu enchaîné entre extraits (s)


def run(args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"] + args, check=True)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                          str(path)], capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def loudness(path, extra=""):
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn", "-af",
           f"{extra}loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]
    err = subprocess.run(cmd, capture_output=True, text=True, check=True).stderr
    return json.loads(err[err.rindex("{"):err.rindex("}") + 1])


def build_bed(clips, need, tmp):
    """Enchaîne les extraits (en boucle) en fondu jusqu'à couvrir `need` secondes."""
    lens = [duration(c) for c in clips]
    seq, total = [], 0.0
    while total < need + 1:
        i = len(seq) % len(clips)
        seq.append(clips[i])
        total += lens[i] - (XF if len(seq) > 1 else 0)
    bed = tmp / "bed.wav"
    args = []
    for c in seq:
        args += ["-i", str(c)]
    if len(seq) == 1:
        filt = "[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a]"
    else:
        parts, prev = [], "[0:a]"
        for i in range(1, len(seq)):
            lab = "[b]" if i == len(seq) - 1 else f"[x{i}]"
            parts.append(f"{prev}[{i}:a]acrossfade=d={XF}:c1=qsin:c2=qsin{lab}")
            prev = lab
        filt = ";".join(parts) + ";[b]aformat=sample_rates=48000:channel_layouts=stereo[a]"
    run(args + ["-filter_complex", filt, "-map", "[a]", "-t", f"{need:.3f}", "-c:a", "pcm_s24le", str(bed)])
    return bed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("track")
    ap.add_argument("--lufs", type=float, default=-28.0)
    ap.add_argument("--start", type=int, default=0)
    a = ap.parse_args()

    clips = sorted((ROOT / "music" / a.track).glob("clip-*.flac"))
    if not clips:
        sys.exit(f"Aucun extrait dans music/{a.track}")
    k = a.start % len(clips)
    clips = clips[k:] + clips[:k]
    dur = duration(a.src)

    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        bed = build_bed(clips, dur, tmp)
        gain = a.lufs - float(loudness(bed)["input_i"])
        fade_out = max(dur - 4.0, 0)
        # Voix + effets d'origine (non modifiés) ; musique calée, baissée sous la voix, fondus début/fin.
        mix = (
            "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voice][key];"
            f"[1:a]volume={gain:.2f}dB[mus];"
            "[mus][key]sidechaincompress=threshold=0.03:ratio=6:knee=6:attack=40:release=900:makeup=1[duck];"
            f"[duck]afade=t=in:d=1.5,afade=t=out:st={fade_out:.3f}:d=4[bg];"
            "[voice][bg]amix=inputs=2:normalize=0:duration=first[m]"
        )
        raw = tmp / "mix.wav"
        run(["-i", a.src, "-i", str(bed), "-filter_complex", mix, "-map", "[m]", "-c:a", "pcm_s24le", str(raw)])
        m = loudness(raw)
        norm = (f"loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I={m['input_i']}:"
                f"measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
                f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
        run(["-i", a.src, "-i", str(raw), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", norm,
             "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", "-shortest", a.dst])
    print(json.dumps({"track": a.track, "start": k, "music_lufs": a.lufs, "gain_db": round(gain, 2),
                      "duration": round(dur, 2)}))


if __name__ == "__main__":
    main()
