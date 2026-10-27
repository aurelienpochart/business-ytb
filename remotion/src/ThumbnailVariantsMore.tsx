import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AMB, C, FONT, GOLD_TEXT} from './theme';
import {Brand, Halo, Photo, Vignette, WhiteLogo, Words, gold} from './ThumbnailVariants';

// Compositions de miniature supplémentaires (1280 x 720), même charte (nuit teintée, or, verre, lumière),
// pensées pour une vidéo « où va l'argent ». Tout vient de thumbnail.json : elles servent à n'importe quelle vidéo.
//   carte  : une carte de membre en verre noir et or, inclinée, le logo en blanc (logo, logoRatio), words à gauche.
//   ticket : un ticket de caisse dont deux lignes (lines) sont surlignées en or, words à gauche.
//   billet : un billet de 100 $ stylisé dont une fine tranche dorée se détache (slice : part de 0 à 1, number).
//   prix   : une photo plein cadre (photo) et un prix géant en or (number), words et logo blancs.
//   moitie : deux moitiés (halves) : une photo chacune, un chiffre chacune, « = » au milieu ; words en haut.
export const MORE_VARIANTS = ['carte', 'ticket', 'billet', 'prix', 'moitie'] as const;
export type MoreVariant = (typeof MORE_VARIANTS)[number];
export const isMoreVariant = (v?: string): v is MoreVariant => (MORE_VARIANTS as readonly string[]).includes(v ?? '');

type Line = {label: string; value: string; mark?: boolean};
type Half = {photo: string; position?: string; number: string; label: string};
export type ThumbMoreProps = {
  variant: MoreVariant;
  words?: string; // *mot* en or
  number?: string;
  numberLabel?: string;
  logo?: string;
  logoRatio?: number;
  photo?: string;
  photoPosition?: string;
  photoScale?: number;
  lines?: Line[];
  header?: string;
  slice?: number;
  halves?: Half[];
  cardLabel?: string;
};

const GOLD_NUM = '#FFD98A';

const Night: React.FC<{glow: string; children: React.ReactNode}> = ({glow, children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow}, ${AMB.night} 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
    {children}
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// Faisceaux de lumière discrets en éventail (profondeur du décor).
const Rays: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={1280} height={720} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
    <defs>
      <radialGradient id="rayFade" cx={x / 1280} cy={y / 720} r="0.7">
        <stop offset="0" stopColor="rgba(255,217,138,0.35)" />
        <stop offset="1" stopColor="rgba(255,217,138,0)" />
      </radialGradient>
    </defs>
    {Array.from({length: 14}, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.2;
      const b = a + 0.07;
      const R = 1400;
      return <path key={i} d={`M ${x} ${y} L ${x + Math.cos(a) * R} ${y + Math.sin(a) * R} L ${x + Math.cos(b) * R} ${y + Math.sin(b) * R} Z`} fill="url(#rayFade)" />;
    })}
  </svg>
);

// A : la carte de membre, objet héros.
const Carte: React.FC<ThumbMoreProps> = ({words = 'The real *product*', logo = 'logo_costco.svg', logoRatio = 2.8, number, numberLabel, cardLabel = 'MEMBER'}) => {
  const cw = 660;
  const ch = 416;
  const cx = 890;
  const cy = 350;
  const lw = 320;
  return (
    <Night glow="70% 45%">
      <Rays x={cx} y={cy} />
      <Halo x={cx} y={cy} r={420} />
      <div style={{position: 'absolute', left: cx - cw / 2, top: cy - ch / 2, width: cw, height: ch, perspective: 1400}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 30,
            transform: 'rotateY(-16deg) rotateX(8deg) rotateZ(-7deg)',
            background: 'linear-gradient(135deg, #2A2320 0%, #0E0B0A 45%, #1B1513 100%)',
            border: '3px solid rgba(255,217,138,0.9)',
            boxShadow: '0 50px 90px rgba(0,0,0,0.75), 0 0 90px rgba(240,181,78,0.45), inset 0 2px 0 rgba(255,255,255,0.25)',
            overflow: 'hidden',
          }}
        >
          {/* reflet de verre et guilloché doré */}
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(120deg, rgba(255,217,138,0.06) 0 2px, transparent 2px 12px)'}} />
          <div style={{position: 'absolute', left: -200, top: -260, width: 700, height: 500, transform: 'rotate(-20deg)', background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, backgroundImage: GOLD_TEXT, backgroundSize: '200% 100%', opacity: 0.95}} />
          <div style={{position: 'absolute', left: 44, top: 46}}>
            <WhiteLogo file={logo} height={lw / logoRatio} width={lw} />
          </div>
          {/* puce de la carte */}
          <div style={{position: 'absolute', right: 52, top: 52, width: 84, height: 64, borderRadius: 12, backgroundImage: GOLD_TEXT, backgroundSize: '200% 100%', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.25)'}}>
            <div style={{position: 'absolute', left: 28, top: 0, bottom: 0, borderLeft: '2px solid rgba(0,0,0,0.3)', borderRight: '2px solid rgba(0,0,0,0.3)', width: 24}} />
          </div>
          <div style={{position: 'absolute', left: 44, top: 190, fontFamily: FONT.mono, fontWeight: 600, fontSize: 34, letterSpacing: 10, color: 'rgba(255,255,255,0.85)'}}>•••• •••• 2026</div>
          <div style={{position: 'absolute', left: 44, bottom: 22, fontFamily: FONT.title, fontWeight: 900, fontSize: 44, letterSpacing: 12, color: '#1A1208'}}>{cardLabel}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 560, height: 720, background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.85) 35%, transparent)`}} />
      <Words text={words} size={150} style={{position: 'absolute', left: 60, top: number ? 90 : 150, width: 520, lineHeight: 0.88}} />
      {number ? (
        <div style={{position: 'absolute', left: 60, bottom: 66}}>
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 92, letterSpacing: -3, color: GOLD_NUM, textShadow: '0 0 40px rgba(240,181,78,0.6)', lineHeight: 1}}>{number}</div>
          {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper, marginTop: 8}}>{numberLabel}</div> : null}
        </div>
      ) : null}
    </Night>
  );
};

// B : le ticket de caisse, deux lignes surlignées.
const Ticket: React.FC<ThumbMoreProps> = ({words = 'Where the *profit* is', header = 'PER $100', lines = [], logo, logoRatio = 2.8}) => {
  const W = 560;
  const zig = Array.from({length: 25}, (_, i) => `${(i / 24) * 100}% ${i % 2 ? 100 : 'calc(100% - 16px)'}`).join(', ');
  return (
    <Night glow="72% 50%">
      <Halo x={930} y={360} r={400} />
      <div style={{position: 'absolute', left: 640, top: 96, width: W, transform: 'rotate(4deg)', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 50px rgba(240,181,78,0.25))'}}>
        <div style={{position: 'relative', background: 'linear-gradient(180deg, #F7F3EA 0%, #ECE5D6 100%)', clipPath: `polygon(0 0, 100% 0, ${zig}, 0 calc(100% - 16px))`, padding: '34px 40px 58px', color: '#1E1B16', fontFamily: FONT.mono}}>
          <div style={{textAlign: 'center', fontWeight: 600, fontSize: 40, letterSpacing: 10}}>{header}</div>
          <div style={{borderTop: '3px dashed rgba(30,27,22,0.5)', margin: '22px 0 14px'}} />
          {lines.map((l, i) => (
            <div key={i} style={{position: 'relative', height: l.mark ? 104 : 72, display: 'flex', alignItems: 'center', gap: 12}}>
              {l.mark ? <div style={{position: 'absolute', left: -18, right: -18, top: '12%', bottom: '12%', background: 'linear-gradient(90deg, rgba(240,181,78,0.9), rgba(255,210,127,0.8))', borderRadius: 8, transform: 'skewX(-8deg)'}} /> : null}
              <div style={{position: 'relative', fontSize: l.mark ? 38 : 32, fontWeight: l.mark ? 600 : 400, letterSpacing: 1, whiteSpace: 'nowrap', opacity: l.mark ? 1 : 0.55}}>{l.label.toUpperCase()}</div>
              <div style={{position: 'relative', flex: 1, borderBottom: '3px dotted rgba(30,27,22,0.35)', transform: 'translateY(10px)'}} />
              <div style={{position: 'relative', fontSize: l.mark ? 62 : 32, fontWeight: 600, whiteSpace: 'nowrap', opacity: l.mark ? 1 : 0.55, letterSpacing: -1}}>{l.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 640, height: 720, background: `linear-gradient(90deg, rgba(${AMB.inkRgb},0.8) 40%, transparent)`}} />
      {logo ? (
        <div style={{position: 'absolute', left: 64, top: 84}}>
          <WhiteLogo file={logo} height={250 / logoRatio} width={250} />
        </div>
      ) : null}
      <Words text={words} size={140} style={{position: 'absolute', left: 60, top: logo ? 200 : 150, width: 560, lineHeight: 0.88}} />
    </Night>
  );
};

// C : le billet de 100 $ stylisé (pas une reproduction), une fine tranche dorée qui s'en détache.
const Billet: React.FC<ThumbMoreProps> = ({words = 'Costco keeps *this*', number = '$1.94', numberLabel, slice = 0.0194, logo, logoRatio = 2.8}) => {
  const BW = 1040;
  const BH = 440;
  const bx = 120;
  const by = 250;
  const sw = Math.max(44, BW * slice);
  const sx = bx + BW - sw;
  const Bill: React.FC<{x0: number; w: number}> = ({x0, w}) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: BH, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: -x0, top: 0, width: BW, height: BH}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #3A4A3C 0%, #233126 55%, #18221A 100%)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(115deg, rgba(255,231,176,0.06) 0 2px, transparent 2px 10px), repeating-linear-gradient(65deg, rgba(255,231,176,0.05) 0 2px, transparent 2px 12px)'}} />
        <div style={{position: 'absolute', inset: 18, border: '3px solid rgba(240,181,78,0.6)', borderRadius: 10}} />
        <div style={{position: 'absolute', inset: 30, border: '1.5px solid rgba(240,181,78,0.3)', borderRadius: 8}} />
        {[0, 1].map((side) => (
          <div key={side} style={{position: 'absolute', top: 0, bottom: 0, [side ? 'right' : 'left']: 60, display: 'flex', alignItems: 'center', fontFamily: FONT.display, fontSize: 250, lineHeight: 1, backgroundImage: GOLD_TEXT, backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
            100
          </div>
        ))}
        <div style={{position: 'absolute', left: BW / 2 - 130, top: BH / 2 - 130, width: 260, height: 260, borderRadius: '50%', border: '3px solid rgba(240,181,78,0.5)', background: 'radial-gradient(circle at 40% 35%, rgba(255,231,176,0.18), rgba(0,0,0,0.3))'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontFamily: FONT.mono, fontSize: 30, letterSpacing: 14, color: 'rgba(255,231,176,0.75)'}}>ONE HUNDRED DOLLARS</div>
      </div>
    </div>
  );
  return (
    <Night glow="50% 70%">
      <Halo x={sx + sw / 2 + 40} y={by + BH / 2} r={340} />
      {/* billet entier moins la tranche, assombri */}
      <div style={{position: 'absolute', left: bx - 40, top: by, width: BW - sw, height: BH, borderRadius: '14px 0 0 14px', overflow: 'hidden', transform: 'rotate(-3deg)', transformOrigin: '100% 50%', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', filter: 'brightness(0.55) saturate(0.7)'}}>
        <Bill x0={0} w={BW - sw} />
      </div>
      {/* la tranche, dorée, qui se détache */}
      <div style={{position: 'absolute', left: sx + 30, top: by - 30, width: sw, height: BH, borderRadius: 6, overflow: 'hidden', transform: 'rotate(6deg)', boxShadow: '0 0 70px rgba(240,181,78,0.9), 0 0 20px rgba(255,231,176,0.9)', outline: '3px solid #FFE7B0'}}>
        <Bill x0={BW - sw} w={sw} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: GOLD_TEXT, backgroundSize: '100% 300%', mixBlendMode: 'hard-light', opacity: 0.9}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 300, background: `linear-gradient(180deg, rgba(${AMB.inkRgb},0.9) 40%, transparent)`}} />
      {logo ? (
        <div style={{position: 'absolute', left: 64, top: 64}}>
          <WhiteLogo file={logo} height={200 / logoRatio} width={200} />
        </div>
      ) : null}
      <Words text={words} size={124} style={{position: 'absolute', left: 64, top: logo ? 150 : 60, width: 820, lineHeight: 0.9}} />
      <div style={{position: 'absolute', right: 70, top: 120, textAlign: 'right'}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 110, letterSpacing: -4, color: GOLD_NUM, textShadow: '0 0 44px rgba(240,181,78,0.7), 0 4px 16px #000', lineHeight: 1}}>{number}</div>
        {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 32, color: C.paper, marginTop: 6, textShadow: '0 2px 10px #000'}}>{numberLabel}</div> : null}
      </div>
    </Night>
  );
};

// D : une photo plein cadre et un prix géant en or.
const Prix: React.FC<ThumbMoreProps> = ({words = 'Why so *cheap*?', number = '$1.50', numberLabel, photo = 'hotdog.jpg', photoPosition = '50% 50%', photoScale = 1, logo, logoRatio = 2.8}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 420, top: 0, right: 0, bottom: 0, overflow: 'hidden'}}>
      <Photo file={photo} position={photoPosition} style={{filter: 'saturate(1.05) contrast(1.15) brightness(0.85)', transform: `scale(${photoScale})`, transformOrigin: photoPosition}} />
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(${AMB.inkRgb},1) 0%, rgba(${AMB.inkRgb},0.6) 25%, transparent 55%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(${AMB.inkRgb},0.8) 0%, transparent 40%)`}} />
    </div>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 50% 70% at 20% 50%, ${AMB.night} 0%, transparent 70%)`, mixBlendMode: 'screen', opacity: 0.6}} />
    {logo ? (
      <div style={{position: 'absolute', left: 64, top: 64}}>
        <WhiteLogo file={logo} height={240 / logoRatio} width={240} />
      </div>
    ) : null}
    <Words text={words} size={128} style={{position: 'absolute', left: 60, top: logo ? 170 : 80, width: 620, lineHeight: 0.9}} />
    <div style={{position: 'absolute', left: 56, bottom: 50}}>
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 210, letterSpacing: -10, lineHeight: 1, color: GOLD_NUM, textShadow: '0 0 60px rgba(240,181,78,0.7), 0 6px 20px #000'}}>{number}</div>
      {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 36, color: C.paper, marginTop: 4, marginLeft: 8, textShadow: '0 2px 10px #000'}}>{numberLabel}</div> : null}
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// E : deux moitiés égales, chacune sa photo et son chiffre.
const Moitie: React.FC<ThumbMoreProps> = ({words = 'Half the *profit*', halves = [], logo, logoRatio = 2.8}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {halves.slice(0, 2).map((h, i) => (
      <div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: i ? 640 : 0, width: 640, overflow: 'hidden'}}>
        <Photo file={h.photo} position={h.position} style={{filter: i ? 'saturate(0.9) contrast(1.1) brightness(0.75)' : 'saturate(0.35) brightness(0.5) contrast(1.1)'}} />
        <AbsoluteFill style={{background: AMB.photoGrade, mixBlendMode: 'color'}} />
        <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(${AMB.inkRgb},0.95) 0%, rgba(${AMB.inkRgb},0.4) 50%, rgba(${AMB.inkRgb},0.85) 100%)`}} />
        {i ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 65%, rgba(240,181,78,0.3), transparent 60%)'}} /> : null}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center'}}>
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 132, letterSpacing: -5, lineHeight: 1, ...(i ? {color: GOLD_NUM, textShadow: '0 0 50px rgba(240,181,78,0.7)'} : {color: C.paper, opacity: 0.85})}}>{h.number}</div>
          <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 36, letterSpacing: 4, color: C.paper, marginTop: 10}}>{h.label.toUpperCase()}</div>
        </div>
      </div>
    ))}
    <div style={{position: 'absolute', left: 638, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, transparent, #FFE7B0 30%, #F0B54E 70%, transparent)', boxShadow: '0 0 30px rgba(240,181,78,0.8)'}} />
    <div style={{position: 'absolute', left: 640 - 62, top: 470 - 62, width: 124, height: 124, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle at 35% 30%, ${AMB.night}, ${C.ink})`, border: '2px solid rgba(255,217,138,0.8)', boxShadow: '0 0 50px rgba(240,181,78,0.6)'}}>
      <span style={{...gold, fontFamily: FONT.title, fontWeight: 900, fontSize: 80, lineHeight: 1, marginTop: -6, filter: 'none'}}>=</span>
    </div>
    {logo ? (
      <div style={{position: 'absolute', left: 64, top: 56}}>
        <WhiteLogo file={logo} height={180 / logoRatio} width={180} />
      </div>
    ) : null}
    <Words text={words} size={120} style={{position: 'absolute', left: 0, right: 0, top: logo ? 120 : 60, textAlign: 'center', lineHeight: 0.9}} />
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

export const ThumbnailVariantMore: React.FC<ThumbMoreProps> = (p) => {
  switch (p.variant) {
    case 'carte':
      return <Carte {...p} />;
    case 'ticket':
      return <Ticket {...p} />;
    case 'billet':
      return <Billet {...p} />;
    case 'prix':
      return <Prix {...p} />;
    default:
      return <Moitie {...p} />;
  }
};
