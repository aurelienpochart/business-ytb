"""Génère les effets sonores de la chaîne (souffles de transition, signature de l'ident).

Tout est synthétisé ici (aucun fichier tiers, donc aucun droit à gérer).
Sortie : remotion/public/sfx/*.wav (48 kHz, 24 bits, stéréo).
Usage : python3 pipeline/sfx.py
"""

import wave
from pathlib import Path

import numpy as np

RATE = 48000
OUT = Path(__file__).resolve().parent.parent / "remotion" / "public" / "sfx"
rng = np.random.default_rng(7)


def bandpass_sweep(x, f_start, f_peak, f_end, q=1.2):
    """Filtre passe-bande à variable d'état dont la fréquence balaie start -> peak -> end."""
    n = len(x)
    t = np.linspace(0, 1, n)
    f = np.where(t < 0.6, f_start + (f_peak - f_start) * (t / 0.6) ** 1.5, f_peak + (f_end - f_peak) * ((t - 0.6) / 0.4))
    g = 2 * np.sin(np.pi * f / RATE)
    low = band = 0.0
    y = np.empty(n)
    for i in range(n):
        high = x[i] - low - band / q
        band += g[i] * high
        low += g[i] * band
        y[i] = band
    return y


def envelope(n, attack=0.6, curve=2.0):
    t = np.linspace(0, 1, n)
    up = (t / attack) ** curve
    down = ((1 - t) / (1 - attack)) ** 1.4
    return np.where(t < attack, up, down)


def pan(mono, start=-0.6, end=0.6):
    p = np.linspace(start, end, len(mono))
    left = mono * np.cos((p + 1) * np.pi / 4)
    right = mono * np.sin((p + 1) * np.pi / 4)
    return np.stack([left, right], axis=1)


def reverb(stereo, seconds=1.2, mix=0.25):
    """Réverbération simple : convolution avec un bruit à décroissance exponentielle (stéréo décorrélée)."""
    n = int(seconds * RATE)
    decay = np.exp(-np.linspace(0, 7, n))
    out = np.zeros((len(stereo) + n - 1, 2))
    for ch in range(2):
        ir = rng.standard_normal(n) * decay
        ir /= np.sqrt((ir**2).sum())
        out[:, ch] = np.convolve(stereo[:, ch], ir)
    dry = np.zeros_like(out)
    dry[: len(stereo)] = stereo
    return dry * (1 - mix) + out * mix


def normalize(x, peak_db=-3.0):
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


def save(name, stereo):
    OUT.mkdir(parents=True, exist_ok=True)
    data = (np.clip(stereo, -1, 1) * (2**23 - 1)).astype("<i4")
    raw = b"".join(int(v).to_bytes(4, "little", signed=True)[:3] for v in data.reshape(-1))
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(RATE)
        w.writeframes(raw)
    print(name, f"{len(stereo) / RATE:.2f} s")


def whoosh(seconds, f0, f1, f2, q):
    n = int(seconds * RATE)
    noise = rng.standard_normal(n)
    y = bandpass_sweep(noise, f0, f1, f2, q) * envelope(n)
    return pan(normalize(y), -0.5, 0.5)


def sine(freq, seconds, decay):
    t = np.arange(int(seconds * RATE)) / RATE
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * decay)


def main():
    save("whoosh.wav", normalize(reverb(whoosh(0.85, 500, 2600, 900, 1.6), 0.8, 0.2), -6))

    deep = whoosh(1.5, 160, 1100, 300, 1.1)
    boom = sine(48, 1.5, 3.5) + 0.5 * sine(96, 1.5, 6)
    boom = np.concatenate([np.zeros(int(0.85 * RATE)), boom])[: len(deep)]
    deep = deep + 0.6 * np.stack([boom, boom], axis=1)
    save("whoosh-deep.wav", normalize(reverb(deep, 1.6, 0.3), -4))

    # Ident : montée scintillante (accord qui s'éclaircit) puis impact grave au moment du point du logo.
    n = int(3.0 * RATE)
    t = np.arange(n) / RATE
    rise = np.clip(t / 1.25, 0, 1) ** 2.5 * (t < 1.25)
    chord = sum(np.sin(2 * np.pi * f * t * (1 + 0.02 * t)) for f in (523.25, 659.25, 783.99, 1046.5)) / 4
    shimmer = chord * rise * 0.35 + bandpass_sweep(rng.standard_normal(n), 2000, 7000, 7000, 3) * rise * 0.4
    hit_t = np.clip(t - 1.25, 0, None)
    hit = (t >= 1.25) * (np.sin(2 * np.pi * 52 * hit_t) * np.exp(-hit_t * 2.8) + 0.25 * rng.standard_normal(n) * np.exp(-hit_t * 18))
    tail = (t >= 1.25) * chord * np.exp(-hit_t * 1.6) * 0.3
    ident = pan(normalize(shimmer + hit + tail), -0.2, 0.2)
    save("ident.wav", normalize(reverb(ident, 2.0, 0.35), -3))


if __name__ == "__main__":
    main()
