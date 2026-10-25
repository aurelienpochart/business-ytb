"""Prépare la narration d'un Short extrait d'une vidéo longue (charte 6.5).

Entrée : <short>/short.json (accroche, paragraphes lus), <short>/metadata.json, et la vidéo longue
deux dossiers plus haut (videos/<v>/shorts/<n>/ -> videos/<v>/) pour la teinte et le titre.

Paragraphes : texte lu tel quel, sauf les groupes {lu|affiché} : « {seven hundred and twenty-one
million dollars|$721 million} » est lu en toutes lettres et affiché en chiffres dans les sous-titres.

Même voix et même chaîne que la vidéo longue (pipeline/synthesize.py : Chirp 3 HD, LINEAR16,
-14 LUFS, crête vraie -1,5 dB). Un paragraphe = une requête, comme pour la vidéo longue ; les silences
de début et de fin de chaque réponse sont raccourcis pour le rythme du format court.

Minutage mot à mot : la voix Chirp 3 HD ne renvoie pas de repères temporels. On détecte les pauses
dans l'audio de chaque paragraphe et on les aligne (programmation dynamique) sur les ponctuations du
texte ; entre deux pauses, les mots sont répartis selon leur longueur.

Sorties dans <short>/build/ : narration.wav, timeline.json (paragraphes, mots, cartes de sous-titres),
captions.srt, short.json (accroche, teinte, titre et lien de la vidéo longue, pour Remotion).
Usage : python3 pipeline/short.py videos/01-tesla/shorts/1   (jeton dans GOOGLE_ACCESS_TOKEN)
"""

import array
import json
import math
import os
import re
import sys
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from synthesize import normalize, srt_time, synthesize  # noqa: E402

LEAD_IN = 0.12        # silence avant le premier mot : l'accroche démarre tout de suite
PAUSE = 0.32          # entre deux paragraphes
TAIL = 0.45           # après le dernier mot, avant la carte finale
KEEP_HEAD = 0.04      # silence gardé au début de chaque réponse de la voix
KEEP_END = 0.08       # et à la fin
WIN = 0.01            # fenêtre d'analyse de l'énergie (10 ms)
MIN_GAP = 0.11        # une pause plus courte n'est pas un repère
CARD_CHARS = 22       # sous-titres : environ 22 caractères et 4 unités au plus par carte
CARD_UNITS = 4



def parse(raw):
    """Paragraphe -> texte lu, mots lus, unités affichées (texte, premier mot, dernier mot)."""
    words, units = [], []
    for tok in re.findall(r"\{[^}]*\}\S*|\S+", raw):
        m = re.match(r"\{([^|}]*)\|([^}]*)\}(\S*)", tok)
        spoken, shown = (m.group(1) + m.group(3), m.group(2) + m.group(3)) if m else (tok, tok)
        first = len(words)
        words.extend(spoken.split())
        units.append({"text": shown, "first": first, "last": len(words) - 1})
    return " ".join(words), words, units


def energy(pcm, rate):
    """Énergie (dB) par fenêtre de 10 ms."""
    samples = array.array("h")
    samples.frombytes(pcm)
    n = int(rate * WIN)
    out = []
    for i in range(0, len(samples) - n + 1, n):
        chunk = samples[i:i + n]
        out.append(10 * math.log10(sum(s * s for s in chunk) / n + 1e-9))
    return out


def speech_bounds(db, threshold):
    voiced = [i for i, v in enumerate(db) if v > threshold]
    return (voiced[0], voiced[-1] + 1) if voiced else (0, len(db))


def find_gaps(db, threshold, lo, hi):
    """Pauses internes (début, fin, en secondes) entre lo et hi (indices de fenêtres)."""
    gaps, start = [], None
    for i in range(lo, hi):
        if db[i] <= threshold:
            start = i if start is None else start
        else:
            if start is not None and (i - start) * WIN >= MIN_GAP:
                gaps.append((start * WIN, i * WIN))
            start = None
    return gaps


def weight(word):
    """Durée relative d'un mot (modèle ajusté sur les paragraphes des vidéos 01 et 02)."""
    letters = len(re.sub(r"[^\w$%]", "", word))
    syllables = max(1, len(re.findall(r"[aeiouy]+", word.lower())))
    return 0.03 + 0.038 * letters + 0.087 * syllables


def pause_after(word):
    """Pause attendue après un mot, selon sa ponctuation (même modèle : ~0,7 s en fin de phrase)."""
    end = word.rstrip('"\u201d\u2019)')[-1:]
    return 0.45 if end in ".?!" else 0.25 if end in ",;:\u2014" else 0.0


def align(words, t0, t1, gaps):
    """Débuts et fins de chaque mot. Les pauses détectées sont associées à des frontières entre mots
    (de préférence après une ponctuation) ; la parole entre deux repères est répartie selon le modèle."""
    n = len(words)
    w = [weight(x) for x in words]
    p = [pause_after(x) for x in words]
    cum = [0.0]  # temps modèle au début de chaque mot (pauses comprises)
    for i in range(n):
        cum.append(cum[-1] + w[i] + p[i])
    scale = (t1 - t0) / (cum[n] - p[n - 1])
    expect = lambda b: t0 + (cum[b] - p[b - 1] / 2) * scale  # milieu attendu de la frontière après le mot b-1
    span = t1 - t0
    K, J = len(gaps), n - 1
    INF = float("inf")
    dp = [[INF] * (J + 1) for _ in range(K + 1)]
    back = [[None] * (J + 1) for _ in range(K + 1)]
    dp[0][0] = 0.0
    for k in range(K + 1):
        for j in range(J + 1):
            cur = dp[k][j]
            if cur == INF:
                continue
            if j < J:  # frontière sans pause détectée (pénalité si ponctuation forte)
                skip = 0.02 if p[j] >= 0.45 else 0.006 if p[j] > 0 else 0.0
                if cur + skip < dp[k][j + 1]:
                    dp[k][j + 1], back[k][j + 1] = cur + skip, (k, j, None)
            if k < K:  # pause parasite (non associée)
                if cur + 0.03 < dp[k + 1][j]:
                    dp[k + 1][j], back[k + 1][j] = cur + 0.03, (k, j, None)
            if k < K and j < J:  # pause k associée à la frontière après le mot j
                b = j + 1
                mid = (gaps[k][0] + gaps[k][1]) / 2
                c = cur + abs(mid - expect(b)) / span + (0.0 if p[j] else 0.02)
                if c < dp[k + 1][j + 1]:
                    dp[k + 1][j + 1], back[k + 1][j + 1] = c, (k, j, b)
    anchors = {}
    k, j = K, J
    while (k, j) != (0, 0):
        pk, pj, b = back[k][j]
        if b is not None:
            anchors[b] = gaps[pk]
        k, j = pk, pj
    # Tronçons de parole continue entre deux pauses associées : mots et petites pauses au prorata.
    times = [None] * n
    edges = [0] + sorted(anchors) + [n]
    for s in range(len(edges) - 1):
        a, b = edges[s], edges[s + 1]
        start = t0 if a == 0 else anchors[a][1]
        end = t1 if b == n else anchors[b][0]
        units = sum(w[a:b]) + sum(p[a:b - 1])
        k_ = (end - start) / units if units > 0 else 0
        t = start
        for i in range(a, b):
            times[i] = (round(t, 3), round(t + w[i] * k_, 3))
            t += (w[i] + (p[i] if i < b - 1 else 0)) * k_
    return times, len(anchors), K


def cards(units):
    """Regroupe les unités affichées en cartes de sous-titres courtes : on coupe à chaque ponctuation,
    puis chaque proposition trop longue est partagée en morceaux de longueurs égales."""
    clauses, cur = [], []
    for u in units:
        cur.append(u)
        if re.search(r"[.,;:!?]\W*$", u["text"]):
            clauses.append(cur)
            cur = []
    if cur:
        clauses.append(cur)
    out = []
    for cl in clauses:
        size = lambda g: sum(len(x["text"]) for x in g) + len(g) - 1
        n = max(-(-size(cl) // CARD_CHARS), -(-len(cl) // CARD_UNITS))
        while cl:
            if n <= 1:
                out.append(cl)
                break
            target = size(cl) / n
            best, best_score = 1, None
            for i in range(1, len(cl)):
                score = abs(size(cl[:i]) - target) + (50 if i > CARD_UNITS + 1 else 0)
                if best_score is None or score < best_score:
                    best, best_score = i, score
            out.append(cl[:best])
            cl, n = cl[best:], n - 1
    return out


def description(short, long_url):
    """Description du Short (charte 6.6) : une phrase, la source principale, le lien vers la vidéo longue,
    la mention IA."""
    meta = json.loads((short / "metadata.json").read_text())
    text = "\n\n".join([
        meta["sentence"],
        f"Source: {meta['source']}",
        f"Full video: {long_url}",
        "Made with the help of AI tools, including a synthetic narrator voice"
        + (" and AI-generated music (Google Lyria)." if (short / "build" / "music.json").exists() else "."),
    ]) + "\n"
    if len(meta["title"]) > 60:
        sys.exit(f"Titre trop long ({len(meta['title'])} caractères, 60 au plus) : {meta['title']}")
    return text


def main():
    short = Path(sys.argv[1])
    video = short.resolve().parent.parent
    spec = json.loads((short / "short.json").read_text())
    meta = json.loads((short / "metadata.json").read_text())
    parent = json.loads((video / "metadata.json").read_text())
    voice = json.loads(Path("config/voice.json").read_text())
    token = os.environ["GOOGLE_ACCESS_TOKEN"]
    rate = voice["sample_rate_hertz"]
    fb = 2
    build = short / "build"
    build.mkdir(exist_ok=True)

    pcm = bytearray(bytes(int(LEAD_IN * rate) * fb))
    cursor = int(LEAD_IN * rate) / rate
    segments, all_units = [], []
    for i, raw in enumerate(spec["paragraphs"]):
        if i:
            pcm += bytes(int(PAUSE * rate) * fb)
            cursor += int(PAUSE * rate) / rate
        text, words, units = parse(raw)
        audio = synthesize(text, voice, token)
        db = energy(audio, rate)
        threshold = sorted(db)[int(len(db) * 0.95)] - 30  # 30 dB sous les passages forts
        lo, hi = speech_bounds(db, threshold)
        cut_a = max(0, int((lo * WIN - KEEP_HEAD) * rate))
        cut_b = min(len(audio) // fb, int((hi * WIN + KEEP_END) * rate))
        gaps = [(a - cut_a / rate, b - cut_a / rate) for a, b in find_gaps(db, threshold, lo, hi)]
        audio = audio[cut_a * fb:cut_b * fb]
        t0, t1 = lo * WIN - cut_a / rate, hi * WIN - cut_a / rate
        times, used, found = align(words, t0, t1, gaps)
        dur = len(audio) / fb / rate
        seg_words = [{"w": w, "s": round(cursor + a, 3), "e": round(cursor + b, 3)} for w, (a, b) in zip(words, times)]
        for u in units:
            all_units.append({"text": u["text"], "s": seg_words[u["first"]]["s"], "e": seg_words[u["last"]]["e"]})
        segments.append({"id": f"p{i}", "chapter": 0, "chapter_title": "", "text": text,
                         "start": round(cursor, 3), "end": round(cursor + dur, 3), "words": seg_words})
        print(f"p{i}: {dur:.1f} s, {len(words)} mots, {used}/{found} pauses alignées")
        pcm += audio
        cursor += dur
    pcm += bytes(int(TAIL * rate) * fb)
    total = len(pcm) / fb / rate

    with wave.open(str(build / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(fb)
        w.setframerate(rate)
        w.writeframes(bytes(pcm))
    normalize(build / "narration.wav")

    groups = cards(all_units)
    caps = []
    for k, g in enumerate(groups):
        start, end = g[0]["s"], g[-1]["e"]
        nxt = groups[k + 1][0]["s"] if k + 1 < len(groups) else None
        hold = nxt if nxt is not None and nxt - end < 0.7 else end + 0.3
        caps.append({"start": round(start, 3), "end": round(min(hold, total), 3), "units": g})
    (build / "timeline.json").write_text(json.dumps(
        {"duration": round(total, 3), "ident": None, "segments": segments, "captions": caps},
        indent=1, ensure_ascii=False) + "\n")
    srt = [f"{k + 1}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{' '.join(u['text'] for u in c['units'])}\n"
           for k, c in enumerate(caps)]
    (build / "captions.srt").write_text("\n".join(srt))

    yt = video / "build" / "youtube.json"
    long_url = json.loads(yt.read_text())["url"] if yt.exists() else meta["long_video"]["url"]
    (build / "description.txt").write_text(description(short, long_url))
    (build / "short.json").write_text(json.dumps({
        "hook": spec["hook"],
        "longTitle": parent["title"],
        "longUrl": long_url,
        "tint": meta.get("tint", parent.get("tint")),
        "tintRegrade": meta.get("tint_regrade", parent.get("tint_regrade", [])),
    }, indent=2, ensure_ascii=False) + "\n")
    chars = sum(len(s["text"]) for s in segments)
    print(f"Short : {total:.1f} s de narration (+ carte finale), {chars} caractères facturés")
    if not 28 <= total <= 58.5:
        sys.exit(f"Durée hors charte (30 à 60 s avec la carte finale) : {total:.1f} s")


if __name__ == "__main__":
    main()
