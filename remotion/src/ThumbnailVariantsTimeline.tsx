import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Brand, Halo, Photo, Vignette, WhiteLogo, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour une vidéo « Timeline » / ascension et chute.
// Même charte (nuit teintée, or, verre, lumière) ; tout vient de thumbnail.json, elles servent à n'importe quelle vidéo.
//   courbe     : une courbe qui plonge sous zéro (points), deux étiquettes chiffrées, words en haut à gauche.
//   couronne   : une couronne d'or qui bascule et tombe du logo (blanc), words et chiffre à gauche.
//   croisement : deux courbes qui se croisent (series), logos blancs en bout de courbe, words en haut.
//   fissure    : une plaquette (photo) fendue par une fissure lumineuse, logo blanc, words et chiffre à gauche.
export const TIMELINE_VARIANTS = ['courbe', 'couronne', 'croisement', 'fissure'] as const;
export type TimelineVariant = (typeof TIMELINE_VARIANTS)[number];
export const isTimelineVariant = (v?: string): v is TimelineVariant => (TIMELINE_VARIANTS as readonly string[]).includes(v ?? '');

type Pt = [number, number];
type Point = {x: string; y: number; label?: string; sub?: string; color?: 'gold' | 'red'};
type Series = {logo?: string; logoRatio?: number; values: number[]; color: 'gold' | 'teal'; end?: string};
export type ThumbTimelineProps = {
  variant: TimelineVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  logo?: string;
  logoRatio?: number;
  photo?: string;
  photoPosition?: string;
  points?: Point[];
  years?: string[];
  series?: Series[];
};

const GOLD_NUM = '#FFD98A';
const RED_NUM = '#FF8A75';
const TEAL = '#7FE3FF';

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

const Floor = () => (
  <svg width={1280} height={720} style={{position: 'absolute', inset: 0, opacity: 0.7}}>
    <g stroke="rgba(160,200,255,0.10)" strokeWidth={1.2}>
      {Array.from({length: 29}, (_, k) => k - 14).map((k) => (
        <line key={k} x1={640 + k * 18} y1={520} x2={640 + k * 230} y2={760} />
      ))}
      {[1.2, 1.6, 2.3, 3.5, 6].map((z) => (
        <line key={z} x1={0} x2={1280} y1={520 + 200 / z} y2={520 + 200 / z} />
      ))}
    </g>
  </svg>
);

const Num: React.FC<{text: string; size: number; color?: string; glow?: string; style?: React.CSSProperties}> = ({text, size, color = GOLD_NUM, glow = 'rgba(240,181,78,0.6)', style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.03, color, textShadow: `0 0 ${size * 0.45}px ${glow}`, lineHeight: 1, ...style}}>{text}</div>
);

const smooth = (pts: Pt[]) => {
  // Courbe lissée (Catmull-Rom vers Bézier).
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

// A : la courbe qui plonge (ex. bénéfice net), zéro en pointillé, étiquettes or (haut) et rouge (bas).
const Courbe: React.FC<ThumbTimelineProps> = ({words = 'From *profit* to loss', points = [], logo, logoRatio = 2.5}) => {
  const x0 = 120;
  const x1 = 1080;
  const vals = points.map((p) => p.y);
  const hi = Math.max(0, ...vals);
  const lo = Math.min(0, ...vals);
  const top = 300;
  const bottom = 590;
  const Y = (v: number) => top + ((hi - v) / (hi - lo || 1)) * (bottom - top);
  const X = (i: number) => x0 + (i / Math.max(1, points.length - 1)) * (x1 - x0);
  const pts: Pt[] = points.map((p, i) => [X(i), Y(p.y)]);
  const zero = Y(0);
  const d = smooth(pts);
  return (
    <Night glow="30% 70%">
      <Floor />
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="cv-stroke" x1="0" y1={top} x2="0" y2={bottom} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFE7B0" />
            <stop offset={((zero - top) / (bottom - top)).toFixed(3)} stopColor="#F0B54E" />
            <stop offset={Math.min(1, (zero - top) / (bottom - top) + 0.08).toFixed(3)} stopColor="#FF6A55" />
            <stop offset="1" stopColor="#FF8A75" />
          </linearGradient>
          <linearGradient id="cv-fill" x1="0" y1={top} x2="0" y2={bottom} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgba(240,181,78,0.30)" />
            <stop offset={((zero - top) / (bottom - top)).toFixed(3)} stopColor="rgba(240,181,78,0.02)" />
            <stop offset="1" stopColor="rgba(255,106,85,0.28)" />
          </linearGradient>
          <filter id="cv-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <line x1={60} x2={1220} y1={zero} y2={zero} stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="10 12" />
        <text x={1220} y={zero - 14} textAnchor="end" fontFamily={FONT.mono} fontSize={24} fill="rgba(255,255,255,0.55)">$0</text>
        <path d={d} fill="none" stroke="url(#cv-stroke)" strokeWidth={22} opacity={0.55} filter="url(#cv-glow)" />
        <path d={d} fill="none" stroke="url(#cv-stroke)" strokeWidth={9} strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={points[i].label ? 16 : 9} fill={points[i].y >= 0 ? '#FFE7B0' : '#FF8A75'} />
            <circle cx={p[0]} cy={p[1]} r={points[i].label ? 30 : 0} fill="none" stroke={points[i].y >= 0 ? 'rgba(255,217,138,0.6)' : 'rgba(255,138,117,0.6)'} strokeWidth={3} />
            <line x1={p[0]} x2={p[0]} y1={p[1] + (points[i].label ? 30 : 9)} y2={650} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
            <text x={p[0]} y={684} textAnchor="middle" fontFamily={FONT.mono} fontWeight={600} fontSize={26} fill="rgba(255,255,255,0.7)">
              {points[i].x}
            </text>
          </g>
        ))}
      </svg>
      {points.map((p, i) =>
        p.label ? (
          <div key={i} style={{position: 'absolute', left: i === points.length - 1 ? pts[i][0] - 50 - 400 : pts[i][0] + 50, top: pts[i][1] - 52, width: 400, textAlign: i === points.length - 1 ? 'right' : 'left'}}>
            <Num text={p.label} size={84} color={p.y >= 0 ? GOLD_NUM : RED_NUM} glow={p.y >= 0 ? 'rgba(240,181,78,0.6)' : 'rgba(255,106,85,0.6)'} />
            {p.sub ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 28, color: C.paper, marginTop: 4}}>{p.sub}</div> : null}
          </div>
        ) : null,
      )}
      <Words text={words} size={118} style={{position: 'absolute', left: 60, top: 40, width: 820, lineHeight: 0.9}} />
      {logo ? (
        <div style={{position: 'absolute', right: 150, top: 54}}>
          <WhiteLogo file={logo} height={190 / logoRatio} width={190} />
        </div>
      ) : null}
    </Night>
  );
};

// Couronne d'or (SVG), avec gemmes.
const Crown: React.FC<{w: number}> = ({w}) => {
  const h = w * 0.72;
  return (
    <svg width={w} height={h} viewBox="0 0 300 216" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="crown-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF3D0" />
          <stop offset="0.35" stopColor="#F0B54E" />
          <stop offset="0.7" stopColor="#A8701E" />
          <stop offset="1" stopColor="#FFD98A" />
        </linearGradient>
        <filter id="crown-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <path d="M 10 200 L 0 62 L 72 120 L 150 12 L 228 120 L 300 62 L 290 200 Z" fill="rgba(240,181,78,0.8)" filter="url(#crown-glow)" />
      <path d="M 10 200 L 0 62 L 72 120 L 150 12 L 228 120 L 300 62 L 290 200 Z" fill="url(#crown-g)" stroke="#FFF3D0" strokeWidth={3} strokeLinejoin="round" />
      <rect x={10} y={168} width={280} height={34} rx={6} fill="#A8701E" opacity={0.55} />
      {[
        [0, 62],
        [150, 12],
        [300, 62],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={14} fill="#FFF8E6" stroke="#A8701E" strokeWidth={3} />
      ))}
      {[70, 150, 230].map((x, i) => (
        <circle key={i} cx={x} cy={185} r={10} fill={i === 1 ? '#7FE3FF' : '#FF8A75'} stroke="#FFF3D0" strokeWidth={2} />
      ))}
    </svg>
  );
};

// B : la couronne bascule et tombe du logo.
const Couronne: React.FC<ThumbTimelineProps> = ({words = 'Lost the *crown*', logo = 'logo_intel.svg', logoRatio = 2.53, number, numberLabel}) => {
  const lw = 520;
  const lx = 880;
  const ly = 470;
  return (
    <Night glow="70% 55%">
      <Floor />
      <Halo x={lx} y={ly - 60} r={460} />
      {/* traînées de chute */}
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={1010 + i * 34} y1={40 + i * 10} x2={1040 + i * 34} y2={210 + i * 12} stroke="rgba(255,217,138,0.35)" strokeWidth={4 - i} strokeLinecap="round" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: lx - lw / 2, top: ly - lw / logoRatio / 2, filter: 'drop-shadow(0 0 40px rgba(170,220,255,0.35))'}}>
        <WhiteLogo file={logo} height={lw / logoRatio} width={lw} />
      </div>
      <div style={{position: 'absolute', left: 930, top: 120, transform: 'rotate(28deg)', transformOrigin: '50% 50%'}}>
        <Crown w={250} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 600, height: 720, background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.8) 30%, transparent)`}} />
      <Words text={words} size={150} style={{position: 'absolute', left: 60, top: number ? 80 : 150, width: 560, lineHeight: 0.88}} />
      {number ? (
        <div style={{position: 'absolute', left: 60, bottom: 62}}>
          <Num text={number} size={92} color={number.startsWith('−') || number.startsWith('-') ? RED_NUM : GOLD_NUM} glow={number.startsWith('−') || number.startsWith('-') ? 'rgba(255,106,85,0.6)' : 'rgba(240,181,78,0.6)'} />
          {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper, marginTop: 8}}>{numberLabel}</div> : null}
        </div>
      ) : null}
    </Night>
  );
};

// C : deux courbes qui se croisent ; un « X » lumineux au croisement ; logos blancs en bout de courbe.
const Croisement: React.FC<ThumbTimelineProps> = ({words = 'Overtaken', series = [], years = []}) => {
  const x0 = 90;
  const x1 = 930;
  const top = 250;
  const bottom = 620;
  const all = series.flatMap((s) => s.values);
  const hi = Math.max(...all);
  const lo = Math.min(0, ...all);
  const n = Math.max(...series.map((s) => s.values.length));
  const X = (i: number) => x0 + (i / Math.max(1, n - 1)) * (x1 - x0);
  const Y = (v: number) => top + ((hi - v) / (hi - lo || 1)) * (bottom - top);
  // Croisement : premier intervalle où l'écart change de signe.
  let cross: Pt | null = null;
  if (series.length === 2) {
    const [a, b] = series.map((s) => s.values);
    for (let i = 0; i < n - 1 && !cross; i++) {
      const d0 = a[i] - b[i];
      const d1 = a[i + 1] - b[i + 1];
      if (d0 * d1 < 0) {
        const t = d0 / (d0 - d1);
        cross = [X(i + t), Y(a[i] + (a[i + 1] - a[i]) * t)];
      }
    }
  }
  return (
    <Night glow="65% 50%">
      <Floor />
      {cross ? <Halo x={cross[0]} y={cross[1]} r={260} /> : null}
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="cx-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>
        {years.map((y, i) => (
          <text key={y} x={X(i)} y={668} textAnchor="middle" fontFamily={FONT.mono} fontWeight={600} fontSize={24} fill="rgba(255,255,255,0.55)">
            {y}
          </text>
        ))}
        {series.map((s, k) => {
          const d = smooth(s.values.map((v, i) => [X(i), Y(v)] as Pt));
          const col = s.color === 'teal' ? TEAL : '#F0B54E';
          return (
            <g key={k}>
              <path d={d} fill="none" stroke={col} strokeWidth={24} opacity={0.45} filter="url(#cx-glow)" />
              <path d={d} fill="none" stroke={col} strokeWidth={10} strokeLinecap="round" />
              <circle cx={X(s.values.length - 1)} cy={Y(s.values[s.values.length - 1])} r={15} fill={col} stroke="#FFFFFF" strokeWidth={3} />
            </g>
          );
        })}
        {cross ? (
          <g>
            <circle cx={cross[0]} cy={cross[1]} r={34} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={4} />
            <circle cx={cross[0]} cy={cross[1]} r={10} fill="#FFFFFF" />
          </g>
        ) : null}
      </svg>
      {series.map((s, k) => {
        const yEnd = Y(s.values[s.values.length - 1]);
        const lw = 210;
        const ratio = s.logoRatio ?? 2.5;
        return (
          <div key={k} style={{position: 'absolute', left: x1 + 44, top: yEnd - 70, width: 300, display: 'flex', flexDirection: 'column', gap: 8}}>
            {s.logo ? <WhiteLogo file={s.logo} height={Math.min(80, lw / ratio)} width={lw} /> : null}
            {s.end ? <Num text={s.end} size={60} color={s.color === 'teal' ? TEAL : GOLD_NUM} glow={s.color === 'teal' ? 'rgba(0,199,253,0.5)' : 'rgba(240,181,78,0.6)'} /> : null}
          </div>
        );
      })}
      <Words text={words} size={130} style={{position: 'absolute', left: 60, top: 44, width: 900, lineHeight: 0.9}} />
    </Night>
  );
};

// Fissure lumineuse déterministe.
const crackPts = (a: Pt, b: Pt, n: number, amp: number, seed: number): Pt[] => {
  const pts: Pt[] = [a];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const r = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const off = ((r - Math.floor(r)) * 2 - 1) * amp * (i % 2 ? 1 : -0.7);
    pts.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
  }
  pts.push(b);
  return pts;
};
const path = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');

// D : la plaquette fendue.
const Fissure: React.FC<ThumbTimelineProps> = ({words = 'Where it *broke*', photo = 'wafer_black.jpg', photoPosition = '50% 50%', logo, logoRatio = 2.53, number, numberLabel}) => {
  const cx = 900;
  const cy = 370;
  const R = 330;
  const main = crackPts([cx - 250, cy - 230], [cx + 230, cy + 250], 9, 46, 3);
  const br1 = crackPts(main[4], [cx + 300, cy - 120], 5, 26, 7);
  const br2 = crackPts(main[6], [cx - 140, cy + 300], 4, 22, 11);
  return (
    <Night glow="72% 50%">
      <Halo x={cx} y={cy} r={470} />
      <div style={{position: 'absolute', left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.8), 0 0 80px rgba(127,227,255,0.25)', border: '2px solid rgba(255,255,255,0.25)'}}>
        <Photo file={photo} position={photoPosition} style={{filter: 'saturate(0.55) contrast(1.15) brightness(0.7)', transform: 'scale(1.25)'}} />
        <AbsoluteFill style={{background: AMB.photoGrade, mixBlendMode: 'color'}} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.16), transparent 45%), radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
      </div>
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="fs-clip">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
          <filter id="fs-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <g clipPath="url(#fs-clip)" fill="none" strokeLinejoin="miter" strokeLinecap="round">
          {[main, br1, br2].map((p, i) => {
            const w = i ? 4 : 7;
            return (
              <g key={i}>
                <path d={path(p)} stroke="rgba(240,181,78,0.9)" strokeWidth={w * 5} filter="url(#fs-glow)" />
                <path d={path(p)} stroke="#FFF1C9" strokeWidth={w * 1.9} />
                <path d={path(p)} stroke="#140C02" strokeWidth={w * 0.75} />
              </g>
            );
          })}
        </g>
      </svg>
      {logo ? (
        <div style={{position: 'absolute', left: 64, top: number ? 372 : 430, zIndex: 2}}>
          <WhiteLogo file={logo} height={170 / logoRatio} width={170} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, top: 0, width: 560, height: 720, background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.85) 35%, transparent)`}} />
      <Words text={words} size={150} style={{position: 'absolute', left: 60, top: number ? 80 : 150, width: 540, lineHeight: 0.88}} />
      {number ? (
        <div style={{position: 'absolute', left: 60, bottom: 62}}>
          <Num text={number} size={92} />
          {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper, marginTop: 8}}>{numberLabel}</div> : null}
        </div>
      ) : null}
    </Night>
  );
};

export const ThumbnailVariantTimeline: React.FC<ThumbTimelineProps> = (p) => {
  switch (p.variant) {
    case 'courbe':
      return <Courbe {...p} />;
    case 'couronne':
      return <Couronne {...p} />;
    case 'croisement':
      return <Croisement {...p} />;
    case 'fissure':
      return <Fissure {...p} />;
  }
};

