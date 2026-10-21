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

PUNCT_COST = {".": 0.0, "?": 0.0, "!": 0.0, ":": 0.004, ";": 0.004, ",": 0.008, "—": 0.006}


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
    return len(re.sub(r"[^\w$%]", "", word)) + 2.5


def align(words, t0, t1, gaps):
    """Débuts et fins de chaque mot. Les pauses détectées sont associées à des frontières entre mots
    (de préférence après une ponctuation) ; la parole entre deux repères est répartie au poids."""
    n = len(words)
    w = [weight(x) for x in words]
    total_w = sum(w)
    cum = [0.0]
    for x in w:
        cum.append(cum[-1] + x)
    speech = (t1 - t0) - sum(b - a for a, b in gaps)
    # Position de chaque pause dans le temps de parole (pauses précédentes retirées), entre 0 et 1.
    pos, removed = [], 0.0
    for a, b in gaps:
        pos.append((a - t0 - removed) / speech if speech > 0 else 0)
        removed += b - a
    bounds = list(range(1, n))  # frontière j = après le mot j-1

    def bound_cost(j):
        last = words[j - 1][-1:]
        if words[j - 1].endswith(('."', '?"', '!"', ',"')):
            last = words[j - 1][-2]
        return PUNCT_COST.get(last, 0.05)

    # dp[k][j] : coût minimal en ayant traité k pauses et j frontières.
    K, J = len(gaps), len(bounds)
    INF = float("inf")
    dp = [[INF] * (J + 1) for _ in range(K + 1)]
    back = [[None] * (J + 1) for _ in range(K + 1)]
    dp[0][0] = 0.0
    for k in range(K + 1):
        for j in range(J + 1):
            cur = dp[k][j]
            if cur == INF:
                continue
            if j < J:  # frontière sans pause (pénalité si ponctuation forte)
                b = bounds[j]
                skip = {".": 0.02, "?": 0.02, "!": 0.02, ":": 0.01, ";": 0.01}.get(words[b - 1][-1:], 0.0)
                if cur + skip < dp[k][j + 1]:
                    dp[k][j + 1], back[k][j + 1] = cur + skip, (k, j, None)
            if k < K:  # pause parasite (non associée)
                if cur + 0.03 < dp[k + 1][j]:
                    dp[k + 1][j], back[k + 1][j] = cur + 0.03, (k, j, None)
            if k < K and j < J:  # pause k associée à la frontière j
                b = bounds[j]
                c = cur + abs(cum[b] / total_w - pos[k]) + bound_cost(b)
                if c < dp[k + 1][j + 1]:
                    dp[k + 1][j + 1], back[k + 1][j + 1] = c, (k, j, b)
    anchors = {}
    k, j = K, J
    while (k, j) != (0, 0):
        pk, pj, b = back[k][j]
        if b is not None:
            anchors[b] = gaps[pk]
        k, j = pk, pj
    # Découpe en tronçons de parole continue.
    cuts = sorted(anchors)
    times = [None] * n
    edges = [0] + cuts + [n]
    for s in range(len(edges) - 1):
        a, b = edges[s], edges[s + 1]
        start = t0 if a == 0 else anchors[a][1]
        end = t1 if b == n else anchors[b][0]
        span_w = cum[b] - cum[a]
        for i in range(a, b):
            ws = start + (end - start) * (cum[i] - cum[a]) / span_w
            we = start + (end - start) * (cum[i + 1] - cum[a]) / span_w
            times[i] = (round(ws, 3), round(we, 3))
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
        "Made with the help of AI tools, including a synthetic narrator voice.",
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
        threshold = sorted(db)[int(len(db) * 0.95)] - 24  # 24 dB sous les passages forts
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
