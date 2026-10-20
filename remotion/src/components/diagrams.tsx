import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, formatNumber, glass, gradOf, useEnter} from './common';
import {Odometer, TechRing} from './fx';
import {IconDraw} from './blocks';
import {Logo} from './media';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Anneau (parts d'un total) ----------
// Les arcs se dessinent l'un après l'autre ; légende à droite ; `focus` met une part en avant.
type Slice = {label: string; value: number; color?: string; sub?: string};
export const Donut: React.FC<{
  title?: string;
  parts: Slice[];
  center?: string; // texte au centre (ex. « $89B »)
  centerLabel?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  focus?: number;
  stagger?: number;
  start?: number;
  source?: string;
}> = ({title, parts, center, centerLabel, prefix = '', suffix = '', decimals = 0, focus, stagger = 1.1, start = 0.4, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sum = parts.reduce((a, b) => a + b.value, 0);
  const R = 250;
  const W = 92;
  const size = 2 * R + W + 80;
  const cx = size / 2;
  const circ = 2 * Math.PI * R;
  const pCenter = useEnter(start + 0.1);
  const focusP = focus === undefined ? 0 : spring({frame: frame - (start + parts.length * stagger + 0.3) * fps, fps, config: {damping: 200}});
  const gapDeg = 1.6;
  let acc = 0;
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 110}}>
        <div style={{position: 'relative', width: size, height: size, transform: `perspective(1800px) rotateY(${-8 + Math.sin(frame / fps / 4) * 3}deg) rotateX(${6 + Math.sin(frame / fps / 3) * 1.5}deg)`}}>
          <TechRing size={size + 40} delay={start} />
          <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <circle cx={cx} cy={cx} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={W} />
            {parts.map((part, i) => {
              const share = part.value / sum;
              const from = acc;
              acc += share;
              const delay = start + i * stagger;
              const p = interpolate(frame, [delay * fps, (delay + 1.1) * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
              const len = Math.max(0, share * circ - (gapDeg / 360) * circ) * p;
              const [lo, hi, halo] = gradOf(part.color);
              const isFocus = focus === i;
              const dim = focus !== undefined && !isFocus ? focusP : 0;
              const w = W + (isFocus ? 26 * focusP : 0);
              return (
                <g key={i} transform={`rotate(${-90 + from * 360 + gapDeg / 2} ${cx} ${cx})`} opacity={1 - 0.6 * dim}>
                  <defs>
                    <linearGradient id={`donut${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={hi} />
                      <stop offset="100%" stopColor={lo} />
                    </linearGradient>
                  </defs>
                  <circle cx={cx} cy={cx} r={R} fill="none" stroke={hi} strokeOpacity={0.45} strokeWidth={w + 10} strokeDasharray={`${len} ${circ}`} style={{filter: 'blur(16px)'}} />
                  <circle cx={cx} cy={cx} r={R} fill="none" stroke={`url(#donut${i})`} strokeWidth={w} strokeDasharray={`${len} ${circ}`} />
                  <circle cx={cx} cy={cx} r={R + w / 2 - 3} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray={`${len} ${circ}`} />
                  {isFocus ? <circle cx={cx} cy={cx} r={R} fill="none" stroke={halo} strokeWidth={w + 40 * focusP} strokeOpacity={0.25 * focusP} strokeDasharray={`${len} ${circ}`} /> : null}
                </g>
              );
            })}
          </svg>
          {center ? (
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fade(pCenter)}}>
              <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: center.length > 5 ? 96 : 118, letterSpacing: -3, color: C.paper, textShadow: '0 0 40px rgba(255,255,255,0.25)'}}>
                <Odometer text={center} delay={start + 0.15} />
              </div>
              {centerLabel ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 30, color: C.paper, opacity: 0.8, marginTop: 8, maxWidth: 330, textAlign: 'center', lineHeight: 1.2}}>{centerLabel}</div> : null}
            </div>
          ) : null}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 34, width: 640}}>
          {parts.map((part, i) => (
            <Legend key={i} part={part} delay={start + i * stagger + 0.4} dim={focus !== undefined && focus !== i ? focusP : 0} text={`${prefix}${formatNumber(part.value, decimals)}${suffix}`} />
          ))}
        </div>
      </div>
    </Frame>
  );
};

const Legend: React.FC<{part: Slice; delay: number; dim: number; text: string}> = ({part, delay, dim, text}) => {
  const p = useEnter(delay);
  const [, hi, halo] = gradOf(part.color);
  return (
    <div style={{...fade(p), opacity: Math.min(1, Math.max(0, p)) * (1 - 0.6 * dim), paddingLeft: 26, borderLeft: `4px solid ${hi}`}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 76, letterSpacing: -2, color: hi, textShadow: `0 0 36px ${halo}`}}>
        <Odometer text={text} delay={delay} />
      </div>
      <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 38, color: C.paper, marginTop: 4}}>{part.label}</div>
      {part.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 27, color: C.paper, opacity: 0.75, marginTop: 6, lineHeight: 1.3}}>{part.sub}</div> : null}
    </div>
  );
};

// ---------- Boucle (flux circulaire entre acteurs) ----------
// Étapes posées sur un cercle, flèches courbes qui se dessinent, puis des « $ » qui circulent.
type Node = {label: string; sub?: string; icon?: string; image?: string; color?: string};
export const Loop: React.FC<{title?: string; nodes: Node[]; center?: string; centerImage?: string; stagger?: number; start?: number; flowAt?: number; source?: string}> = ({
  title,
  nodes,
  center,
  centerImage,
  stagger = 1.2,
  start = 0.3,
  flowAt,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = nodes.length;
  const W = 1620;
  const H = 760;
  const cx = W / 2;
  const cy = H / 2 - 10;
  const rx = 600;
  const ry = 280;
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pos = (a: number) => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  const flowStart = flowAt ?? start + n * stagger + 0.4;
  const flow = interpolate(frame, [flowStart * fps, (flowStart + 0.8) * fps], [0, 1], clamp);
  const pCenter = useEnter(flowStart);
  // Arc entre deux étapes, raccourci aux extrémités pour ne pas passer sous les cartes.
  const margin = (Math.PI * 2) / n * 0.3;
  const arcPts = (i: number, k: number) => pos(ang(i) + margin + k * ((Math.PI * 2) / n - 2 * margin));
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', left: 0, top: -20, width: W, height: H}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <marker id="loopHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={C.gold} />
            </marker>
          </defs>
          {nodes.map((_, i) => {
            const delay = start + i * stagger + 0.5;
            const p = interpolate(frame, [delay * fps, (delay + 0.9) * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
            const steps = 24;
            const pts = Array.from({length: steps + 1}, (_, s) => arcPts(i, (s / steps) * p));
            const d = pts.map((pt, s) => `${s ? 'L' : 'M'} ${pt[0]} ${pt[1]}`).join(' ');
            return (
              <g key={i} opacity={p > 0 ? 1 : 0}>
                <path d={d} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={16} style={{filter: 'blur(10px)'}} />
                <path d={d} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" markerEnd={p > 0.95 ? 'url(#loopHead)' : undefined} />
              </g>
            );
          })}
        </svg>
        {/* Argent qui circule une fois la boucle bouclée */}
        {Array.from({length: n * 3}, (_, j) => {
          const t = ((frame / fps) * 0.09 + j / (n * 3)) % 1;
          const seg = Math.floor(t * n);
          const k = t * n - seg;
          const [x, y] = arcPts(seg, k);
          const o = flow * Math.sin(k * Math.PI);
          return (
            <div key={j} style={{position: 'absolute', left: x - 20, top: y - 26, width: 40, textAlign: 'center', fontFamily: FONT.title, fontWeight: 800, fontSize: 40, color: C.goldLight, opacity: o, textShadow: '0 0 16px rgba(240,181,78,0.95)'}}>
              $
            </div>
          );
        })}
        {nodes.map((node, i) => {
          const [x, y] = pos(ang(i));
          const delay = start + i * stagger;
          const p = spring({frame: frame - delay * fps, fps, config: {damping: 18, mass: 0.8}});
          const q = Math.min(1, Math.max(0, p));
          const [, hi] = gradOf(node.color ?? 'amber');
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - 190,
                top: y - 95,
                width: 380,
                minHeight: 190,
                padding: '22px 26px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                ...glass(i === 0 ? 'rgba(240,181,78,0.55)' : undefined),
                opacity: q,
                transform: `scale(${0.7 + 0.3 * q})`,
                filter: q < 0.97 ? `blur(${(1 - q) * 8}px)` : undefined,
              }}
            >
              {node.image ? (
                <div style={{height: 70, display: 'flex', alignItems: 'center', marginBottom: 12}}>
                  <Logo id={node.image} height={60} style={{maxWidth: 260}} />
                </div>
              ) : node.icon ? (
                <div style={{marginBottom: 10}}>
                  <IconDraw name={node.icon} size={62} delay={delay + 0.1} color={hi} uid={`loop${i}${node.icon}`} />
                </div>
              ) : null}
              <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 36, color: C.paper, lineHeight: 1.1}}>{node.label}</div>
              {node.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 25, color: C.paper, opacity: 0.75, marginTop: 8, lineHeight: 1.25}}>{node.sub}</div> : null}
            </div>
          );
        })}
        {center || centerImage ? (
          <div style={{position: 'absolute', left: cx - 260, top: cy - 90, width: 520, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fade(pCenter)}}>
            {centerImage ? <Logo id={centerImage} height={70} color="gold" width={160} /> : null}
            {center ? <div style={{fontFamily: FONT.display, fontStyle: 'italic', fontSize: 64, color: C.paper, marginTop: 10, textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>{center}</div> : null}
          </div>
        ) : null}
      </div>
    </Frame>
  );
};
