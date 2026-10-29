import React from 'react';
import {Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, glass, gradOf} from './common';
import {Kicker, RevealWords} from './fx';
import {Logo, useMedia} from './media';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Chronologie animée (gabarit « The Timeline ») ----------
// Un axe des années qui défile (fenêtre visible qui glisse de `view` à `viewEnd`), des époques en bandes,
// des événements qui s'allument avec carte, logo ou vignette photo, une tête de lecture dorée qui les suit.
// Mode « couloirs » (lanes) : plusieurs pistes parallèles (ex. Intel contre TSMC) et des promesses qui
// glissent d'année en année (slips) en laissant des fantômes barrés derrière elles.

type ChronoEvent = {
  year: number;
  label: string;
  sub?: string;
  date?: string; // texte de date affiché (par défaut l'année)
  color?: string;
  image?: string; // logo (blanc uni)
  photo?: string; // vignette photo
  at?: number; // seconde d'apparition (sinon start + i * stagger)
  level?: number; // 0, 1 : au-dessus ; -1, -2 : en dessous (mode simple)
  lane?: number;
  big?: boolean;
};
type Era = {from: number; to: number; label: string; color?: string};
type Lane = {label: string; logo?: string; logoH?: number; color?: string};
type Slip = {lane: number; path: {year: number; tag: string}[]; at: number; step?: number; color?: string; final?: string};

const W = 1620;

const tickStep = (span: number) => (span > 45 ? 10 : span > 18 ? 5 : span > 8 ? 2 : 1);

export const Chrono: React.FC<{
  title?: string;
  kicker?: string;
  from: number;
  to: number;
  view?: [number, number];
  viewEnd?: [number, number];
  pan?: [number, number];
  eras?: Era[];
  events: ChronoEvent[];
  lanes?: Lane[];
  slips?: Slip[];
  stagger?: number;
  start?: number;
  playhead?: boolean;
  source?: string;
}> = ({title, kicker, from, to, view, viewEnd, pan = [0.3, 6], eras = [], events, lanes, slips = [], stagger = 1.2, start = 0.5, playhead = true, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const v0 = view ?? [from, to];
  const v1 = viewEnd ?? v0;
  const k = interpolate(t, pan, [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const a = v0[0] + (v1[0] - v0[0]) * k;
  const b = v0[1] + (v1[1] - v0[1]) * k;
  const laneMode = !!lanes?.length;
  const gutter = laneMode ? 300 : 0;
  const AW = W - gutter;
  const x = (y: number) => gutter + ((y - a) / (b - a)) * AW;
  const inView = (y: number) => y >= a - 0.01 && y <= b + 0.01;
  const grid = interpolate(frame, [0, 0.9 * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const timeOf = (e: ChronoEvent, i: number) => e.at ?? start + i * stagger;

  // Tête de lecture : glisse vers l'année du dernier événement apparu.
  const shown = events.map((e, i) => ({e, i, t0: timeOf(e, i)})).filter((o) => o.t0 <= t).sort((p, q) => p.t0 - q.t0);
  let headYear = a;
  {
    let prevYear = a;
    let prevT = 0;
    for (const o of events.map((e, i) => ({e, t0: timeOf(e, i)})).sort((p, q) => p.t0 - q.t0)) {
      const p = interpolate(t, [o.t0 - 0.1, o.t0 + 0.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
      if (t >= o.t0 - 0.1) {
        headYear = prevYear + (o.e.year - prevYear) * p;
        prevYear = o.e.year;
        prevT = o.t0;
      }
    }
    void prevT;
  }
  void shown;

  // Géométrie verticale (zone utile du cadre : environ 1620 x 700).
  const axisY = laneMode ? 0 : 400;
  const laneH = laneMode ? Math.min(300, 620 / lanes!.length) : 0;
  const laneTop = laneMode && lanes!.length === 1 ? 200 : 150;
  const laneY = (i: number) => laneTop + i * laneH + laneH * 0.62;
  const tickTop = laneMode ? laneY(lanes!.length - 1) + 46 : axisY + 26;

  const step = tickStep(b - a);
  const ticks: number[] = [];
  for (let y = Math.ceil(a / step) * step; y <= b; y += step) ticks.push(y);

  const axis = (y: number, color = '#F0B54E', fillTo?: number) => (
    <>
      <div style={{position: 'absolute', left: gutter, width: AW * grid, top: y - 1, height: 2, background: 'rgba(255,255,255,0.12)'}} />
      {playhead && fillTo !== undefined ? (
        <div style={{position: 'absolute', left: gutter, width: Math.max(0, Math.min(AW, x(fillTo) - gutter)), top: y - 2.5, height: 5, background: `linear-gradient(90deg, ${color}22, ${color})`, boxShadow: `0 0 22px ${color}aa`, borderRadius: 3}} />
      ) : null}
    </>
  );

  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', top: title ? -10 : 20, left: 0}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* Époques */}
        {eras.map((er, i) => {
          const x0 = Math.max(gutter, x(er.from));
          const x1 = Math.min(W, x(er.to));
          if (x1 <= x0) return null;
          const [, hi, halo] = gradOf(er.color ?? 'slate');
          const p = spring({frame: frame - (0.2 + i * 0.25) * fps, fps, config: {damping: 200}});
          return (
            <div key={`era${i}`} style={{position: 'absolute', left: x0, width: x1 - x0, top: laneMode ? 110 : 90, bottom: laneMode ? 0 : 70, background: `linear-gradient(180deg, ${halo.replace(/[\d.]+\)$/, '0.16)')}, transparent 85%)`, borderLeft: `1px solid ${hi}44`, opacity: Math.min(1, p)}}>
              <div style={{position: 'absolute', left: 18, top: 14, fontFamily: FONT.mono, fontSize: 22, letterSpacing: 4, color: hi, whiteSpace: 'nowrap', opacity: 0.9}}>{er.label.toUpperCase()}</div>
            </div>
          );
        })}
        {/* Graduations */}
        {ticks.map((y) => {
          const xx = x(y);
          const edge = Math.min(1, (xx - gutter) / 60, (gutter + AW - xx) / 60);
          return (
            <div key={`t${y}`} style={{position: 'absolute', left: xx - 50, width: 100, top: tickTop, textAlign: 'center', fontFamily: FONT.mono, fontSize: 22, color: C.mute, opacity: Math.max(0, edge) * grid * 0.85}}>
              {laneMode ? null : <div style={{width: 1, height: 12, background: 'rgba(255,255,255,0.3)', margin: '-26px auto 12px'}} />}
              {y}
            </div>
          );
        })}
        {laneMode ? (
          lanes!.map((ln, i) => {
            const y = laneY(i);
            const [, hi] = gradOf(ln.color ?? 'amber');
            const p = spring({frame: frame - (0.2 + i * 0.3) * fps, fps, config: {damping: 200}});
            return (
              <React.Fragment key={`lane${i}`}>
                <div style={{position: 'absolute', left: 0, width: gutter - 40, top: y - 50, height: 100, display: 'flex', alignItems: 'center', ...fade(p)}}>
                  {ln.logo ? <Logo id={ln.logo} height={ln.logoH ?? 54} style={{maxWidth: gutter - 60}} /> : <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 44, color: hi}}>{ln.label}</div>}
                </div>
                {axis(y, hi)}
              </React.Fragment>
            );
          })
        ) : (
          axis(axisY, '#F0B54E', headYear)
        )}
        {/* Tête de lecture */}
        {playhead && !laneMode && t > start - 0.1 ? (
          <div style={{position: 'absolute', left: x(headYear) - 9, top: axisY - 9, width: 18, height: 18, borderRadius: 9, background: C.goldLight, boxShadow: '0 0 30px #FFD27F, 0 0 70px rgba(240,181,78,0.6)'}} />
        ) : null}
        {/* Promesses qui glissent */}
        {laneMode
          ? slips.map((s, si) => {
              const stepS = s.step ?? 1.4;
              const y = laneY(s.lane);
              const [, hi, halo] = gradOf(s.color ?? 'brick');
              const n = s.path.length;
              const idx = Math.max(-1, Math.min(n - 1, Math.floor((t - s.at) / stepS)));
              if (idx < 0) return null;
              const local = t - s.at - idx * stepS;
              const pMove = idx === 0 ? 1 : interpolate(local, [0, 0.55], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
              const yr = idx === 0 ? s.path[0].year : s.path[idx - 1].year + (s.path[idx].year - s.path[idx - 1].year) * pMove;
              const pop = spring({frame: frame - (s.at + idx * stepS) * fps, fps, config: {damping: 12}});
              const last = idx === n - 1;
              return (
                <React.Fragment key={`slip${si}`}>
                  {s.path.slice(0, idx).map((g, gi) => (
                    <div key={gi} style={{position: 'absolute', left: x(g.year) - 13, top: y - 13, width: 26, height: 26, borderRadius: 13, border: `3px dashed ${hi}`, opacity: 0.55}}>
                      <div style={{position: 'absolute', left: -60, width: 146, top: -62, textAlign: 'center', fontFamily: FONT.mono, fontSize: 24, color: C.paper, opacity: 0.6, textDecoration: 'line-through', textDecorationColor: hi}}>{g.tag}</div>
                    </div>
                  ))}
                  {idx > 0 ? (
                    <div style={{position: 'absolute', left: x(s.path[0].year), width: Math.max(0, x(yr) - x(s.path[0].year)), top: y - 1.5, height: 3, background: `repeating-linear-gradient(90deg, ${hi} 0 10px, transparent 10px 18px)`, opacity: 0.7}} />
                  ) : null}
                  <div style={{position: 'absolute', left: x(yr) - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: last && s.final ? C.goldLight : hi, boxShadow: `0 0 30px ${last && s.final ? 'rgba(255,210,127,0.9)' : halo}`, transform: `scale(${0.7 + 0.3 * Math.min(1.2, pop)})`}} />
                  <div style={{position: 'absolute', left: x(yr) - 160, width: 320, top: y - 92, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: 32, color: last && s.final ? C.goldLight : hi, textShadow: `0 0 20px ${halo}`, opacity: Math.min(1, pop)}}>
                    {last && s.final ? s.final : s.path[idx].tag}
                  </div>
                </React.Fragment>
              );
            })
          : null}
        {/* Événements */}
        {events.map((e, i) => {
          const t0 = timeOf(e, i);
          if (t < t0 - 0.05 || !inView(e.year)) return null;
          const p = spring({frame: frame - t0 * fps, fps, config: {damping: 16, mass: 0.8}});
          const q = Math.min(1, Math.max(0, p));
          const ring = interpolate(t, [t0, t0 + 1.2], [0, 1], clamp);
          const [, hi, halo] = gradOf(e.color ?? 'amber');
          const xx = x(e.year);
          const y = laneMode ? laneY(e.lane ?? 0) : axisY;
          const level = laneMode ? 1 : e.level ?? (i % 2 === 0 ? 1 : -1);
          const up = level > 0;
          const cardW = laneMode ? 300 : e.big ? 420 : 340;
          const stem = laneMode ? 40 : 60 + (Math.abs(level) - 1) * 150;
          const cardLeft = Math.max(laneMode ? gutter - 20 : -20, Math.min(W - cardW + 20, xx - cardW / 2));
          const media = e.photo ? <Thumb id={e.photo} w={cardW - 36} h={laneMode ? 0 : 150} /> : null;
          const card = (
            <div style={{width: cardW, padding: laneMode ? '14px 18px' : '18px 20px 20px', ...glass(`${hi}66`), display: 'flex', flexDirection: 'column', gap: 6}}>
              {media}
              {e.image ? (
                <div style={{height: 54, display: 'flex', alignItems: 'center', marginBottom: 4}}>
                  <Logo id={e.image} height={46} style={{maxWidth: cardW - 40}} />
                </div>
              ) : null}
              <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: laneMode ? 30 : 38, color: hi, textShadow: `0 0 22px ${halo}`, lineHeight: 1}}>{e.date ?? String(e.year)}</div>
              <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: laneMode ? 26 : 29, color: C.paper, lineHeight: 1.2}}>
                <RevealWords text={e.label} delay={t0 + 0.15} stagger={0.035} />
              </div>
              {e.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 23, color: C.paper, opacity: 0.75 * q, lineHeight: 1.25}}>{e.sub}</div> : null}
            </div>
          );
          return (
            <React.Fragment key={`ev${i}`}>
              <div style={{position: 'absolute', left: xx - 1, width: 2, top: up ? y - stem : y, height: stem * q, background: `linear-gradient(${up ? 0 : 180}deg, ${hi}, ${hi}00)`, opacity: 0.8}} />
              <div style={{position: 'absolute', left: xx - 14, top: y - 14, width: 28, height: 28}}>
                <div style={{position: 'absolute', inset: -46 * ring, borderRadius: '50%', border: `2px solid ${hi}`, opacity: (1 - ring) * 0.8}} />
                <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.ink, border: `5px solid ${hi}`, transform: `scale(${q})`, boxShadow: `0 0 26px ${halo}`}} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: cardLeft,
                  ...(up ? {bottom: `calc(100% - ${y - stem}px)`} : {top: y + stem}),
                  opacity: q,
                  transform: `translateY(${(1 - p) * (up ? 40 : -40)}px) scale(${0.92 + 0.08 * q})`,
                  transformOrigin: up ? '50% 100%' : '50% 0%',
                  filter: q < 0.97 ? `blur(${(1 - q) * 8}px)` : undefined,
                }}
              >
                {card}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Frame>
  );
};

const Thumb: React.FC<{id: string; w: number; h: number}> = ({id, w, h}) => {
  const m = useMedia(id);
  if (!m || !h) return null;
  return (
    <div style={{width: w, height: h, borderRadius: 12, overflow: 'hidden', marginBottom: 8, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)'}}>
      <Img src={m.src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.05)'}} />
    </div>
  );
};
