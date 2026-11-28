import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter, useLayout} from './common';
import {Kicker} from './fx';

// ---------- Gobelet à emporter (vidéo 11 Starbucks) ----------
// Un gobelet stylisé (sans logo, pas une reproduction) se remplit par couches, du fond vers le haut : chaque couche
// est une part du prix, de hauteur proportionnelle à sa valeur, avec sa légende à droite reliée par un trait.
// `shown` couches sont déjà pleines au début du plan ; les suivantes coulent à leur délai. `focus` met une couche
// en avant (les autres s'assombrissent). Le total s'affiche au-dessus du couvercle.
type Layer = {label: string; value: number; display: string; color?: string; sub?: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const unit = (p: number) => Math.min(1, Math.max(0, p));

export const Cup: React.FC<{
  title?: string;
  kicker?: string;
  total?: {display: string; label?: string; value?: number};
  layers: Layer[];
  shown?: number;
  delays?: number[];
  stagger?: number;
  start?: number;
  focus?: number;
  focusAt?: number; // instant (s) de la mise en avant ; défaut : après la dernière couche
  empty?: {label: string; display?: string}; // part non remplie (si total.value > somme des couches)
  source?: string;
}> = ({title, kicker, total, layers, shown = 0, delays, stagger = 1.4, start = 0.5, focus, focusAt, empty, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const P = useLayout().portrait;
  const pIn = useEnter(0.05);
  const sum = total?.value ?? layers.reduce((a, b) => a + b.value, 0);

  // Géométrie du gobelet (px) : trapèze plus large en haut, couvercle, manchon.
  const H = P ? 620 : 640;
  const TOP = P ? 330 : 400;
  const BOT = P ? 236 : 286;
  const LID = P ? 52 : 58;
  const W = TOP + 60;
  const cupTop = LID + 26;
  const xAt = (y: number) => (TOP - (TOP - BOT) * (y / H)) / 2; // demi-largeur à la hauteur y depuis le haut
  const cx = W / 2;

  const delayOf = (i: number) => (i < shown ? -10 : delays?.[i - shown] ?? start + (i - shown) * stagger);
  const fill = (i: number) =>
    interpolate(frame, [delayOf(i) * fps, (delayOf(i) + 0.9) * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lastDelay = Math.max(...layers.map((_, i) => delayOf(i)));
  const fAt = focusAt ?? lastDelay + 1.2;
  const fP = focus === undefined ? 0 : spring({frame: frame - fAt * fps, fps, config: {damping: 200}});
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 3.2);

  // Bornes de chaque couche (depuis le fond).
  let acc = 0;
  const bands = layers.map((l, i) => {
    const h = (l.value / sum) * H;
    const b = {y0: H - acc - h, y1: H - acc, h, i};
    acc += h;
    return b;
  });

  // Légendes : centrées sur leur couche, puis écartées (de haut en bas) pour ne pas se chevaucher, en restant
  // entre le haut et le bas du gobelet.
  const LH = P ? 92 : 96;
  const ys = bands.map((b) => cupTop + b.y0 + b.h / 2);
  const order = [...ys.keys()].sort((a, b) => ys[a] - ys[b]); // du haut vers le bas
  const placed: number[] = [...ys];
  const lo = cupTop + LH / 2 + (empty ? LH * 0.7 : 0);
  const hi = cupTop + H - LH / 2 + 10;
  for (let k = 0; k < order.length; k++) {
    const min = k === 0 ? lo : placed[order[k - 1]] + LH;
    placed[order[k]] = Math.max(placed[order[k]], min);
  }
  for (let k = order.length - 1; k >= 0; k--) {
    const max = k === order.length - 1 ? hi : placed[order[k + 1]] - LH;
    placed[order[k]] = Math.min(placed[order[k]], max);
  }

  const legendX = W + (P ? 40 : 70);
  const totalP = spring({frame: frame - 0.25 * fps, fps, config: {damping: 200}});

  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: -10, ...fade(pIn)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: W + (P ? 560 : 820), height: cupTop + H + 30, marginLeft: P ? 0 : 300, opacity: unit(pIn), transform: `scale(${0.95 + 0.05 * unit(pIn)})`}}>
          {/* Halo sous le gobelet */}
          <div style={{position: 'absolute', left: cx - TOP * 0.7, top: cupTop + H - 30, width: TOP * 1.4, height: 80, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(240,181,78,0.22), transparent 70%)', filter: 'blur(6px)'}} />
          <svg width={W} height={cupTop + H + 10} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <defs>
              <clipPath id="cupBody">
                <path d={`M ${cx - TOP / 2} ${cupTop} L ${cx + TOP / 2} ${cupTop} L ${cx + BOT / 2} ${cupTop + H} Q ${cx} ${cupTop + H + 8} ${cx - BOT / 2} ${cupTop + H} Z`} />
              </clipPath>
              <linearGradient id="cupGlass" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
                <stop offset="0.25" stopColor="rgba(255,255,255,0.03)" />
                <stop offset="0.8" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="1" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
              <linearGradient id="cupShine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="rgba(255,255,255,0)" />
                <stop offset="0.5" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="1" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              {layers.map((l, i) => {
                const [lo, hi] = gradOf(l.color ?? 'amber');
                return (
                  <linearGradient key={i} id={`layer${i}`} x1="0" x2="1" y1="0" y2="0.3">
                    <stop offset="0" stopColor={lo} />
                    <stop offset="0.45" stopColor={hi} />
                    <stop offset="1" stopColor={lo} />
                  </linearGradient>
                );
              })}
            </defs>
            {/* Corps vide (verre) */}
            <g clipPath="url(#cupBody)">
              <rect x={0} y={cupTop} width={W} height={H + 10} fill="url(#cupGlass)" />
              {bands.map((b) => {
                const p = fill(b.i);
                if (p <= 0) return null;
                const dim = focus !== undefined && focus !== b.i ? 1 - 0.6 * fP : 1;
                const lit = focus === b.i ? fP : 0;
                const hh = b.h * p;
                const y = cupTop + b.y1 - hh;
                return (
                  <g key={b.i} opacity={dim}>
                    <rect x={0} y={y} width={W} height={hh + 0.5} fill={`url(#layer${b.i})`} />
                    {/* surface qui ondule pendant le remplissage */}
                    <rect x={0} y={y} width={W} height={3} fill="rgba(255,255,255,0.35)" opacity={p < 1 ? 0.9 : 0.35} />
                    {lit > 0 ? <rect x={0} y={y} width={W} height={hh} fill="rgba(255,240,200,1)" opacity={0.12 * lit * (0.6 + 0.4 * pulse)} /> : null}
                  </g>
                );
              })}
              {/* Reflet vertical */}
              <rect x={cx - TOP * 0.36} y={cupTop} width={TOP * 0.12} height={H} fill="url(#cupShine)" opacity={0.55} />
            </g>
            {/* Manchon (bande carton) */}
            <path
              d={`M ${cx - xAt(H * 0.36)} ${cupTop + H * 0.36} L ${cx + xAt(H * 0.36)} ${cupTop + H * 0.36} L ${cx + xAt(H * 0.62)} ${cupTop + H * 0.62} L ${cx - xAt(H * 0.62)} ${cupTop + H * 0.62} Z`}
              fill="none"
              stroke="rgba(255,231,176,0.35)"
              strokeWidth={2}
              strokeDasharray="6 8"
            />
            {/* Contour du gobelet */}
            <path
              d={`M ${cx - TOP / 2} ${cupTop} L ${cx - BOT / 2} ${cupTop + H} Q ${cx} ${cupTop + H + 8} ${cx + BOT / 2} ${cupTop + H} L ${cx + TOP / 2} ${cupTop}`}
              fill="none"
              stroke="rgba(255,240,214,0.55)"
              strokeWidth={3}
            />
            {/* Couvercle */}
            <rect x={cx - TOP / 2 - 18} y={cupTop - 22} width={TOP + 36} height={24} rx={10} fill="rgba(255,240,214,0.16)" stroke="rgba(255,240,214,0.6)" strokeWidth={2.5} />
            <path d={`M ${cx - TOP / 2 + 6} ${cupTop - 22} L ${cx - TOP / 2 + 30} ${cupTop - LID} L ${cx + TOP / 2 - 30} ${cupTop - LID} L ${cx + TOP / 2 - 6} ${cupTop - 22} Z`} fill="rgba(255,240,214,0.10)" stroke="rgba(255,240,214,0.5)" strokeWidth={2.5} />
            <rect x={cx + TOP / 2 - 110} y={cupTop - LID - 2} width={46} height={8} rx={4} fill="rgba(255,240,214,0.45)" />
            {/* Traits vers les légendes */}
            {bands.map((b) => {
              const p = fill(b.i);
              if (p < 0.6) return null;
              const yMid = cupTop + b.y0 + b.h / 2;
              const xEdge = cx + xAt(b.y0 + b.h / 2) + 6;
              const dim = focus !== undefined && focus !== b.i ? 1 - 0.6 * fP : 1;
              return (
                <path
                  key={b.i}
                  d={`M ${xEdge} ${yMid} L ${legendX - 30} ${placed[b.i]} L ${legendX - 12} ${placed[b.i]}`}
                  fill="none"
                  stroke="rgba(255,231,176,0.55)"
                  strokeWidth={2}
                  opacity={unit((p - 0.6) / 0.4) * dim}
                  style={{overflow: 'visible'}}
                />
              );
            })}
          </svg>
          {/* Total : à gauche du gobelet, à hauteur du couvercle */}
          {total ? (
            <div style={{position: 'absolute', ...(P ? {left: 0, width: W, top: -LID - 70, textAlign: 'center' as const} : {right: '100%', marginRight: 36, top: cupTop - 34, textAlign: 'right' as const}), ...fade(totalP)}}>
              <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? 60 : 72, letterSpacing: -2, color: '#FFD98A', textShadow: '0 0 40px rgba(240,181,78,0.55)', lineHeight: 1, whiteSpace: 'nowrap'}}>{total.display}</div>
              {total.label ? <div style={{fontFamily: FONT.mono, fontSize: P ? 20 : 22, letterSpacing: 4, color: C.mute, marginTop: 10, whiteSpace: 'nowrap'}}>{total.label.toUpperCase()}</div> : null}
            </div>
          ) : null}
          {/* Légendes */}
          {layers.map((l, i) => {
            const p = fill(i);
            const lp = unit((p - 0.5) / 0.5);
            if (lp <= 0) return null;
            const [, top, halo] = gradOf(l.color ?? 'amber');
            const dim = focus !== undefined && focus !== i ? 1 - 0.6 * fP : 1;
            const big = focus === i ? 1 + 0.08 * fP : 1;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: legendX,
                  top: placed[i] - LH / 2 + 4,
                  height: LH - 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: P ? 18 : 26,
                  opacity: lp * dim,
                  transform: `translateX(${(1 - lp) * 30}px) scale(${big})`,
                  transformOrigin: 'left center',
                }}
              >
                <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: P ? 50 : 56, letterSpacing: -1.5, color: top, textShadow: `0 0 30px ${halo}`, minWidth: P ? 170 : 200, textAlign: 'right', whiteSpace: 'nowrap'}}>{l.display}</div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: P ? 30 : 34, color: C.paper, whiteSpace: 'nowrap'}}>{l.label}</div>
                  {l.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: P ? 22 : 25, color: C.mute, whiteSpace: P ? 'normal' : 'nowrap', maxWidth: P ? 340 : undefined}}>{l.sub}</div> : null}
                </div>
              </div>
            );
          })}
          {empty ? (
            <div style={{position: 'absolute', left: legendX, top: cupTop + 4, ...fade(unit(fill(layers.length - 1)))}}>
              <div style={{...glass(), padding: '10px 20px', fontFamily: FONT.mono, fontSize: P ? 22 : 24, letterSpacing: 2, color: C.mute}}>
                {(empty.display ? `${empty.display}  ` : '') + empty.label.toUpperCase()}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Frame>
  );
};
