import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Brand, Photo, Vignette, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour la vidéo 09 Œufs (The Journey, Supply Chain).
// Même charte (nuit teintée, or, verre, lumière), compositions nouvelles par rapport aux vidéos 01 à 08.
//   oeuf-or   : un œuf d'or monumental posé dans une alvéole, le chiffre des profits gravé dessus.
//   boite     : une boîte de douze vue de dessus ; un seul œuf en or, les onze autres ternes.
//   etiquette : une étiquette de rayon géante, l'ancien prix barré, le nouveau en or.
//   fissure   : un œuf qui se fend ; des pièces d'or tombent de la fêlure.
export const EGGS_VARIANTS = ['oeuf-or', 'boite', 'etiquette', 'fissure'] as const;
export type EggsVariant = (typeof EGGS_VARIANTS)[number];
export const isEggsVariant = (v?: string): v is EggsVariant => (EGGS_VARIANTS as readonly string[]).includes(v ?? '');

export type ThumbEggsProps = {
  variant: EggsVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  from?: string; // etiquette : ancien prix
  photo?: string;
  photoPosition?: string;
};

const GOLD_NUM = '#FFD98A';
const RED = '#FF4A3D';
const SHELL = 'radial-gradient(circle at 36% 28%, #FFF7EA 0%, #EBD5B4 42%, #A7845E 100%)';
const GOLD_SHELL = 'radial-gradient(circle at 34% 26%, #FFF6D8 0%, #FFD27F 28%, #F0B54E 55%, #8A5A14 100%)';
const EGG_RADIUS = '50% 50% 50% 50% / 58% 58% 42% 42%';

const Num: React.FC<{text: string; size: number; color?: string; style?: React.CSSProperties}> = ({text, size, color = GOLD_NUM, style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.04, color, textShadow: `0 0 ${size * 0.45}px ${color === GOLD_NUM ? 'rgba(240,181,78,0.6)' : 'rgba(255,74,61,0.6)'}`, lineHeight: 1, ...style}}>{text}</div>
);
const Label: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 30, color: C.paper, opacity: 0.9, ...style}}>{text}</div>
);

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 72%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

const Egg: React.FC<{w: number; gold?: boolean; style?: React.CSSProperties; children?: React.ReactNode}> = ({w, gold, style, children}) => (
  <div
    style={{
      width: w,
      height: w * 1.27,
      borderRadius: EGG_RADIUS,
      background: gold ? GOLD_SHELL : SHELL,
      boxShadow: gold ? `0 0 ${w * 0.5}px rgba(240,181,78,0.55), 0 ${w * 0.12}px ${w * 0.2}px rgba(0,0,0,0.6), inset -${w * 0.08}px -${w * 0.1}px ${w * 0.2}px rgba(120,70,10,0.5)` : `0 ${w * 0.1}px ${w * 0.18}px rgba(0,0,0,0.55), inset -${w * 0.06}px -${w * 0.08}px ${w * 0.16}px rgba(60,40,20,0.35)`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);

// A : l'œuf d'or monumental.
const OeufOr: React.FC<ThumbEggsProps> = ({words = 'Who *really* got paid?', number = '$1.22B', numberLabel = 'one egg giant’s profit in a year'}) => (
  <Night glow="72% 50%">
    <div style={{position: 'absolute', right: 150, top: 150, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,90,0.45) 0%, transparent 65%)'}} />
    <div style={{position: 'absolute', right: 250, bottom: 60, width: 380, height: 90, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.75), transparent 70%)'}} />
    <Egg w={330} gold style={{position: 'absolute', right: 270, top: 130, transform: 'rotate(-8deg)'}}>
      <Num text={number} size={78} color="#4A2A06" style={{textShadow: '0 1px 0 rgba(255,240,200,0.6)', transform: 'rotate(8deg)', marginTop: 40}} />
    </Egg>
    <Egg w={120} style={{position: 'absolute', right: 120, bottom: 90, filter: 'brightness(0.6) saturate(0.6)'}} />
    <Egg w={110} style={{position: 'absolute', right: 690, bottom: 80, filter: 'brightness(0.5) saturate(0.6)', transform: 'rotate(10deg)'}} />
    <div style={{position: 'absolute', left: 64, top: 150, width: 560}}>
      <Words text={words} size={108} />
      <Label text={numberLabel} style={{marginTop: 34, fontSize: 32, color: GOLD_NUM}} />
    </div>
  </Night>
);

// B : la boîte de douze, un seul œuf en or.
const Boite: React.FC<ThumbEggsProps> = ({words = 'Who got *paid*?', number = '$6.23', numberLabel = 'a dozen eggs, March 2025'}) => {
  const cell = 128;
  return (
    <Night glow="35% 55%">
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 190,
          width: 6 * cell + 60,
          height: 2 * cell + 60,
          borderRadius: 34,
          background: 'linear-gradient(160deg, rgba(255,240,214,0.16), rgba(255,240,214,0.05))',
          border: '2px solid rgba(240,181,78,0.3)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          transform: 'perspective(1400px) rotateX(24deg) rotateZ(-6deg)',
        }}
      >
        {Array.from({length: 12}, (_, i) => {
          const r = Math.floor(i / 6);
          const c = i % 6;
          const gold = i === 4;
          return (
            <div key={i} style={{position: 'absolute', left: 30 + c * cell, top: 30 + r * cell, width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{position: 'absolute', inset: 8, borderRadius: '46%', background: 'radial-gradient(circle at 50% 60%, rgba(0,0,0,0.6), rgba(0,0,0,0.15) 70%)'}} />
              <Egg w={cell * 0.6} gold={gold} style={gold ? undefined : {filter: 'brightness(0.55) saturate(0.5)'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 70, top: 120, width: 420, textAlign: 'right'}}>
        <Num text={number} size={150} />
        <Label text={numberLabel} style={{marginTop: 10}} />
      </div>
      <div style={{position: 'absolute', left: 64, top: 40, width: 760}}>
        <Words text={words} size={104} />
      </div>
    </Night>
  );
};

// C : l'étiquette de rayon géante.
const Etiquette: React.FC<ThumbEggsProps> = ({words = 'Who *really* got paid?', number = '$6.23', from = '$1.93', numberLabel = 'A DOZEN EGGS', photo, photoPosition = '50% 50%'}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {photo ? <Photo file={photo} position={photoPosition} style={{filter: 'saturate(0.7) brightness(0.42) blur(1px)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.95) 0%, rgba(${AMB.inkRgb},0.7) 45%, rgba(${AMB.inkRgb},0.2) 100%)`}} />
    <div
      style={{
        position: 'absolute',
        right: 70,
        top: 170,
        width: 560,
        padding: '30px 40px 34px',
        borderRadius: 18,
        background: 'linear-gradient(170deg, #FFF8EA, #EADCC4)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.7), 0 0 80px rgba(240,181,78,0.35)',
        transform: 'rotate(4deg)',
      }}
    >
      <div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: 6, color: '#5A4632'}}>{numberLabel}</div>
      <div style={{position: 'relative', display: 'inline-block', marginTop: 8}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 70, color: '#8A7760'}}>{from}</div>
        <div style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 8, background: RED, transform: 'rotate(-8deg)', borderRadius: 4}} />
      </div>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 168, letterSpacing: -6, lineHeight: 1, color: '#B5121B'}}>{number}</div>
    </div>
    <div style={{position: 'absolute', left: 64, top: 170, width: 560}}>
      <Words text={words} size={108} />
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// D : l'œuf fendu d'où tombent des pièces d'or.
const Fissure: React.FC<ThumbEggsProps> = ({words = 'Who got *paid*?', number = '$6.23', numberLabel = 'a dozen eggs at the peak'}) => (
  <Night glow="68% 40%">
    <div style={{position: 'absolute', right: 170, top: 60, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,90,0.35) 0%, transparent 65%)'}} />
    <Egg w={300} style={{position: 'absolute', right: 280, top: 60, transform: 'rotate(12deg)'}}>
      <svg width={300} height={381} style={{position: 'absolute', inset: 0}}>
        <path d="M 20 200 L 70 175 L 110 215 L 150 170 L 190 220 L 230 180 L 280 205" fill="none" stroke="#3A2410" strokeWidth={7} strokeLinejoin="round" />
        <path d="M 20 200 L 70 175 L 110 215 L 150 170 L 190 220 L 230 180 L 280 205" fill="none" stroke="#FFD27F" strokeWidth={2.5} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px #F0B54E)'}} />
      </svg>
    </Egg>
    {[
      [880, 470, 70, -20],
      [960, 540, 56, 15],
      [820, 590, 62, 40],
      [1010, 620, 48, -30],
      [900, 650, 44, 10],
    ].map(([x, y, s, r], i) => (
      <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s * 0.32 + s * 0.68 * Math.abs(Math.cos((r * Math.PI) / 180)), borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FFF0C0, #F0B54E 55%, #8A5A14)', boxShadow: '0 0 24px rgba(240,181,78,0.7)', transform: `rotate(${r}deg)`}} />
    ))}
    <div style={{position: 'absolute', left: 64, top: 130, width: 560}}>
      <Words text={words} size={108} />
      <Num text={number} size={120} style={{marginTop: 34}} />
      <Label text={numberLabel} style={{marginTop: 6}} />
    </div>
  </Night>
);

export const ThumbnailVariantEggs: React.FC<ThumbEggsProps> = (p) => {
  if (p.variant === 'boite') return <Boite {...p} />;
  if (p.variant === 'etiquette') return <Etiquette {...p} />;
  if (p.variant === 'fissure') return <Fissure {...p} />;
  return <OeufOr {...p} />;
};
