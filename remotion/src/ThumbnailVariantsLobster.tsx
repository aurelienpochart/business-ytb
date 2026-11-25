import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT} from './theme';
import {Brand, Photo, Vignette, WhiteLogo, Words} from './ThumbnailVariants';

// Compositions de miniature (1280 x 720) pensées pour la vidéo 10 Red Lobster (The Timeline, Rise & Fall).
// Même charte (nuit teintée, or, verre, lumière), compositions nouvelles par rapport aux vidéos 01 à 09.
//   addition : l'addition du restaurant, la ligne des crevettes petite, celle du loyer entourée en rouge.
//   naufrage : le logo (blanc) qui sombre sous une ligne de flottaison, bulles, chiffre en or.
//   assiette : une photo d'assiette de crevettes, un ticket « ALL YOU CAN EAT $20 » barré, words à gauche.
export const LOBSTER_VARIANTS = ['addition', 'naufrage', 'assiette'] as const;
export type LobsterVariant = (typeof LOBSTER_VARIANTS)[number];
export const isLobsterVariant = (v?: string): v is LobsterVariant => (LOBSTER_VARIANTS as readonly string[]).includes(v ?? '');

type Row = {label: string; value: string; mark?: boolean};
export type ThumbLobsterProps = {
  variant: LobsterVariant;
  words?: string;
  number?: string;
  numberLabel?: string;
  logo?: string;
  photo?: string;
  photoPosition?: string;
  rows?: Row[];
};

const GOLD_NUM = '#FFD98A';
const RED = '#E8372B';

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 72%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

const Num: React.FC<{text: string; size: number; style?: React.CSSProperties}> = ({text, size, style}) => (
  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.04, color: GOLD_NUM, textShadow: `0 0 ${size * 0.45}px rgba(240,181,78,0.6)`, lineHeight: 1, ...style}}>{text}</div>
);

// A : l'addition. Les crevettes en petit, le loyer entouré.
const Addition: React.FC<ThumbLobsterProps> = ({
  words = "It wasn't the *shrimp*",
  photo,
  photoPosition = '50% 50%',
  rows = [
    {label: 'Endless shrimp', value: '$11M'},
    {label: 'Rent, 2023', value: '$190M', mark: true},
  ],
}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {photo ? <Photo file={photo} position={photoPosition} style={{filter: 'saturate(0.65) brightness(0.38) blur(2px)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.96) 0%, rgba(${AMB.inkRgb},0.75) 48%, rgba(${AMB.inkRgb},0.25) 100%)`}} />
    <div
      style={{
        position: 'absolute',
        right: 80,
        top: 110,
        width: 520,
        padding: '34px 40px 40px',
        background: 'linear-gradient(175deg, #FFFDF7, #ECE4D4)',
        boxShadow: '0 40px 90px rgba(0,0,0,0.75), 0 0 90px rgba(240,181,78,0.28)',
        transform: 'rotate(-4deg)',
        clipPath: 'polygon(0 0, 100% 0, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%)',
      }}
    >
      <div style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: 8, color: '#5B5146', textAlign: 'center'}}>THE CHECK</div>
      <div style={{borderTop: '3px dashed #B9AE9C', margin: '18px 0 22px'}} />
      {rows.map((r, i) => (
        <div key={i} style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: i ? 26 : 0}}>
          <div style={{fontFamily: FONT.mono, fontSize: r.mark ? 40 : 34, fontWeight: r.mark ? 600 : 400, color: r.mark ? '#1E1A15' : '#7A6F62'}}>{r.label}</div>
          <div style={{fontFamily: FONT.mono, fontSize: r.mark ? 64 : 40, fontWeight: 600, color: r.mark ? '#B3151D' : '#7A6F62'}}>{r.value}</div>
          {r.mark ? (
            <svg width={560} height={150} style={{position: 'absolute', left: -30, top: -42, overflow: 'visible'}}>
              <ellipse cx={280} cy={74} rx={272} ry={62} fill="none" stroke={RED} strokeWidth={7} transform="rotate(-2 280 74)" strokeLinecap="round" strokeDasharray="1500" strokeDashoffset="60" />
            </svg>
          ) : null}
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 64, top: 180, width: 560}}>
      <Words text={words} size={118} />
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// B : le logo qui sombre sous la ligne de flottaison.
const Naufrage: React.FC<ThumbLobsterProps> = ({words = 'What *really* sank it?', number = '$1.5B', numberLabel = 'the buildings, sold in 2014', logo}) => (
  <Night glow="70% 30%">
    <div style={{position: 'absolute', left: 620, right: 0, top: 330, bottom: 0, background: 'linear-gradient(180deg, rgba(40,150,160,0.32) 0%, rgba(2,20,26,0.92) 70%)'}} />
    <div style={{position: 'absolute', left: 620, right: 0, top: 326, height: 6, background: 'linear-gradient(90deg, transparent, rgba(190,245,240,0.85), transparent)', filter: 'blur(1px)'}} />
    {logo ? (
      <div style={{position: 'absolute', left: 700, top: 230, transform: 'rotate(-16deg)', opacity: 0.95}}>
        <WhiteLogo file={logo} height={250} width={480} />
      </div>
    ) : null}
    <div style={{position: 'absolute', left: 620, right: 0, top: 330, bottom: 0, background: 'linear-gradient(180deg, rgba(20,110,120,0.35), rgba(1,10,14,0.7))', mixBlendMode: 'multiply'}} />
    {[
      [760, 300, 14],
      [820, 250, 10],
      [1040, 280, 16],
      [990, 210, 9],
      [1110, 240, 12],
      [890, 190, 8],
    ].map(([x, y, r], i) => (
      <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', border: '2px solid rgba(200,250,245,0.7)', boxShadow: '0 0 12px rgba(160,240,235,0.5)'}} />
    ))}
    <div style={{position: 'absolute', left: 64, top: 120, width: 600}}>
      <Words text={words} size={112} />
      <Num text={number} size={130} style={{marginTop: 34}} />
      <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 30, color: C.paper, opacity: 0.9, marginTop: 8}}>{numberLabel}</div>
    </div>
  </Night>
);

// C : l'assiette de crevettes et le ticket barré.
const Assiette: React.FC<ThumbLobsterProps> = ({words = 'Not the *shrimp*', number = '$20', numberLabel = 'ALL YOU CAN EAT', photo, photoPosition = '50% 50%'}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {photo ? <Photo file={photo} position={photoPosition} style={{left: 420, width: 860, filter: 'saturate(1.05) brightness(0.8)'}} /> : null}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},1) 0%, rgba(${AMB.inkRgb},0.92) 36%, rgba(${AMB.inkRgb},0.15) 70%, rgba(${AMB.inkRgb},0.35) 100%)`}} />
    <div style={{position: 'absolute', right: 90, top: 380, padding: '18px 34px 22px', background: '#FFF8EC', borderRadius: 14, transform: 'rotate(-7deg)', boxShadow: '0 30px 70px rgba(0,0,0,0.7)'}}>
      <div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 5, color: '#5B5146'}}>{numberLabel}</div>
      <div style={{position: 'relative', fontFamily: FONT.mono, fontWeight: 600, fontSize: 130, lineHeight: 1, color: '#B3151D'}}>
        {number}
        <div style={{position: 'absolute', left: -14, right: -14, top: '50%', height: 12, background: RED, transform: 'rotate(-10deg)', borderRadius: 6, boxShadow: '0 0 16px rgba(232,55,43,0.6)'}} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 64, top: 200, width: 560}}>
      <Words text={words} size={124} />
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

export const ThumbnailVariantLobster: React.FC<ThumbLobsterProps> = (p) => {
  if (p.variant === 'naufrage') return <Naufrage {...p} />;
  if (p.variant === 'assiette') return <Assiette {...p} />;
  return <Addition {...p} />;
};
