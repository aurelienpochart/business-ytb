import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Brand, Photo, Vignette, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour la vidéo 11 Starbucks (The Teardown, Business Model).
// Même charte (nuit teintée, or, verre, lumière), compositions nouvelles par rapport aux vidéos 01 à 10.
//   gobelet : un gobelet à emporter en verre, seule une fine couche d'or au fond (« COFFEE 13¢ »), le reste vide.
//   ticket : le ticket « YOUR $9 ORDER », la ligne du café minuscule, celle du café-boutique entourée en rouge.
//   etiquette : une photo floutée à droite, le prix « $9 » en or et une petite étiquette « coffee: 13¢ ».
export const STARBUCKS_VARIANTS = ['gobelet', 'ticket', 'etiquette'] as const;
export type StarbucksVariant = (typeof STARBUCKS_VARIANTS)[number];
export const isStarbucksVariant = (v?: string): v is StarbucksVariant => (STARBUCKS_VARIANTS as readonly string[]).includes(v ?? '');

type Row = {label: string; value: string; mark?: boolean; faint?: boolean};
export type ThumbStarbucksProps = {
  variant: StarbucksVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  photo?: string;
  photoPosition?: string;
  rows?: Row[];
};

const GOLD_NUM = '#FFD98A';
const RED = '#E8372B';

const Num: React.FC<{text: string; size: number; style?: React.CSSProperties}> = ({text, size, style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.04, color: GOLD_NUM, textShadow: `0 0 ${size * 0.45}px rgba(240,181,78,0.6)`, lineHeight: 1, ...style}}>{text}</div>
);

// A : le gobelet presque vide, l'or au fond.
const Gobelet: React.FC<ThumbStarbucksProps> = ({words = 'Where your *$9* goes', number = '13¢', numberLabel = 'THE COFFEE'}) => {
  const L = 760;
  const T = 330;
  const B = 236;
  const H = 470;
  const top = 170;
  const gold = 46;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 74% 45%, ${AMB.night} 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: L + T / 2 - 260, top: top + H - 40, width: 520, height: 110, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(240,181,78,0.45), transparent 70%)', filter: 'blur(10px)'}} />
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="tb">
            <path d={`M ${L} ${top} L ${L + T} ${top} L ${L + T - (T - B) / 2} ${top + H} L ${L + (T - B) / 2} ${top + H} Z`} />
          </clipPath>
          <linearGradient id="tg" x1="0" x2="1">
            <stop offset="0" stopColor="#A8701E" />
            <stop offset="0.45" stopColor="#FFE7B0" />
            <stop offset="1" stopColor="#A8701E" />
          </linearGradient>
          <linearGradient id="tglass" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.3" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
        </defs>
        <g clipPath="url(#tb)">
          <rect x={L - 20} y={top} width={T + 40} height={H} fill="url(#tglass)" />
          <rect x={L - 20} y={top + H - gold} width={T + 40} height={gold} fill="url(#tg)" />
          <rect x={L + 46} y={top} width={30} height={H} fill="rgba(255,255,255,0.12)" />
        </g>
        <path d={`M ${L} ${top} L ${L + (T - B) / 2} ${top + H} L ${L + T - (T - B) / 2} ${top + H} L ${L + T} ${top}`} fill="none" stroke="rgba(255,240,214,0.75)" strokeWidth={5} />
        <rect x={L - 22} y={top - 30} width={T + 44} height={32} rx={12} fill="rgba(255,240,214,0.2)" stroke="rgba(255,240,214,0.8)" strokeWidth={4} />
        <path d={`M ${L - 12} ${top - 30} L ${L + 30} ${top - 74} L ${L + T - 30} ${top - 74} L ${L + T + 12} ${top - 30} Z`} fill="rgba(255,240,214,0.12)" stroke="rgba(255,240,214,0.7)" strokeWidth={4} />
        <line x1={L + T - 20} y1={top + H - gold / 2} x2={L + T + 70} y2={top + H - gold / 2 - 60} stroke={GOLD_NUM} strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: L + T + 60, top: top + H - 190}}>
        <div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 6, color: C.paper, opacity: 0.85}}>{numberLabel}</div>
        <Num text={number} size={120} />
      </div>
      <div style={{position: 'absolute', left: 64, top: 170, width: 640}}>
        <Words text={words} size={132} />
      </div>
      <Brand />
      <Vignette />
    </AbsoluteFill>
  );
};

// B : le ticket de la commande, la ligne du café minuscule, la boutique entourée.
const Ticket: React.FC<ThumbStarbucksProps> = ({
  words = 'The coffee is *13¢*',
  photo,
  photoPosition = '50% 50%',
  rows = [
    {label: 'Coffee', value: '$0.13', faint: true},
    {label: 'The store', value: '$4.08', mark: true},
    {label: 'Profit', value: '$0.60', faint: true},
  ],
}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {photo ? <Photo file={photo} position={photoPosition} style={{filter: 'saturate(0.9) brightness(0.5) blur(3px)', transform: 'scale(1.05)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.97) 0%, rgba(${AMB.inkRgb},0.82) 44%, rgba(${AMB.inkRgb},0.25) 100%)`}} />
    <div style={{position: 'absolute', right: 150, top: 120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,181,78,0.28) 0%, transparent 65%)'}} />
    <div
      style={{
        position: 'absolute',
        right: 70,
        top: 92,
        width: 560,
        padding: '28px 44px 56px',
        background: 'linear-gradient(175deg, #FFFDF7, #E9E0CF)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.75)',
        transform: 'rotate(3deg)',
        clipPath: 'polygon(0 0, 100% 0, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%)',
      }}
    >
      <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 8, color: '#5B5146', textAlign: 'center'}}>YOUR $9 ORDER</div>
      <div style={{borderTop: '3px dashed #B9AE9C', margin: '18px 0 22px'}} />
      {rows.map((r, i) => (
        <div key={i} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: i ? 26 : 0, padding: r.mark ? '12px 0' : 0}}>
          <div style={{fontFamily: FONT.mono, fontSize: r.mark ? 40 : 32, fontWeight: r.mark ? 600 : 400, color: r.mark ? '#1E1A15' : '#8A8074'}}>{r.label}</div>
          <div style={{fontFamily: FONT.mono, fontSize: r.mark ? 84 : 40, fontWeight: 600, letterSpacing: -2, color: r.mark ? '#B3151D' : '#8A8074'}}>{r.value}</div>
          {r.mark ? (
            <svg width={540} height={170} style={{position: 'absolute', left: -24, top: -18, overflow: 'visible'}}>
              <ellipse cx={250} cy={78} rx={262} ry={72} fill="none" stroke={RED} strokeWidth={8} transform="rotate(-3 250 78)" />
            </svg>
          ) : null}
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 64, top: 180, width: 560}}>
      <Words text={words} size={128} />
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// C : la photo floutée, le prix en or, la petite étiquette du café.
const Etiquette: React.FC<ThumbStarbucksProps> = ({words = 'Not the *coffee*', number = '$9', numberLabel = 'COFFEE: 13¢', photo, photoPosition = '50% 50%'}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {photo ? <Photo file={photo} position={photoPosition} style={{left: 420, width: 860, filter: 'saturate(1.0) brightness(0.72)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},1) 0%, rgba(${AMB.inkRgb},0.92) 36%, rgba(${AMB.inkRgb},0.2) 72%, rgba(${AMB.inkRgb},0.4) 100%)`}} />
    <div style={{position: 'absolute', right: 120, top: 150}}>
      <Num text={number} size={260} />
    </div>
    <div style={{position: 'absolute', right: 110, top: 440, padding: '16px 30px 18px', background: '#FFF8EC', borderRadius: 14, transform: 'rotate(-6deg)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)'}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 54, letterSpacing: 2, color: '#1E5B3A'}}>{numberLabel}</div>
    </div>
    <div style={{position: 'absolute', left: 64, top: 200, width: 560}}>
      <Words text={words} size={128} />
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

export const ThumbnailVariantStarbucks: React.FC<ThumbStarbucksProps> = (p) => {
  if (p.variant === 'ticket') return <Ticket {...p} />;
  if (p.variant === 'etiquette') return <Etiquette {...p} />;
  return <Gobelet {...p} />;
};
