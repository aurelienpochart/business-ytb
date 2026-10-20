import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {LogoCurve} from './components/special';
import {C, FONT, GOLD_TEXT} from './theme';

// Variantes de miniature 1280 x 720 avec le logo Tesla, pour choisir un style.
export type ThumbVariantProps = {variant: 'or' | 'photo' | 'rivaux'};

const gold: React.CSSProperties = {
  backgroundImage: GOLD_TEXT,
  backgroundSize: '200% 100%',
  backgroundPosition: '30% 0',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 0 26px rgba(240,181,78,0.55))',
};

const Words: React.FC<{text: string; size: number; style?: React.CSSProperties}> = ({text, size, style}) => (
  <div style={{fontFamily: FONT.display, fontSize: size, lineHeight: 0.95, color: C.paper, textShadow: '0 6px 30px rgba(0,0,0,0.7)', ...style}}>
    {text.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith('*') ? <span key={i} style={gold}>{p.slice(1, -1)}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}
  </div>
);

// « T » de Tesla en or (masque sur dégradé).
const GoldT: React.FC<{size: number; glow?: number}> = ({size, glow = 0.6}) => (
  <div style={{filter: `drop-shadow(0 0 ${size / 8}px rgba(240,181,78,${glow}))`}}>
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: GOLD_TEXT,
        backgroundSize: '200% 100%',
        backgroundPosition: '20% 0',
        WebkitMaskImage: `url("${staticFile('media/logo_tesla_t.svg')}")`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  </div>
);

const WhiteLogo: React.FC<{file: string; height: number; width?: number; color?: boolean}> = ({file, height, width, color}) => (
  <Img
    src={staticFile(`media/${file}`)}
    style={{height, width: width ?? 'auto', objectFit: 'contain', filter: color ? undefined : 'brightness(0) invert(1)'}}
  />
);

const Photo: React.FC<{file: string; position?: string; style?: React.CSSProperties}> = ({file, position = '50% 50%', style}) => (
  <Img src={staticFile(`media/${file}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, ...style}} />
);

const Vignette = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />;

const Brand = () => (
  <div style={{position: 'absolute', right: 30, top: 24}}>
    <LogoCurve size={96} progress={1} />
  </div>
);

// A : le « T » en or, monumental, sur une Tesla dans la pénombre.
const Or = () => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    <Photo file="model_s.jpg" position="40% 60%" style={{filter: 'saturate(0.5) brightness(0.45) contrast(1.2)', transform: 'scale(1.15) translateX(120px)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(3,6,12,0.97) 0%, rgba(3,6,12,0.8) 45%, rgba(3,6,12,0.25) 100%)'}} />
    <div style={{position: 'absolute', right: 40, top: 70, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,181,78,0.35) 0%, transparent 62%)'}} />
    <div style={{position: 'absolute', right: 90, top: 110}}>
      <GoldT size={500} />
    </div>
    <Words text={'Who *really* pays Tesla?'} size={128} style={{position: 'absolute', left: 64, top: 70, width: 640}} />
    <div style={{position: 'absolute', left: 64, bottom: 60, fontFamily: FONT.mono, fontWeight: 600, fontSize: 96, letterSpacing: -3, color: '#FFD98A', textShadow: '0 0 40px rgba(240,181,78,0.55)'}}>$1.58B</div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// B : une vraie Tesla rouge plein cadre, le texte à gauche, le logo en blanc.
const PhotoV = () => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    <Photo file="model_3.jpg" position="50% 100%" style={{filter: 'saturate(1.15) contrast(1.15) brightness(0.9)', transform: 'scale(1.5) translate(170px, 40px)', transformOrigin: '50% 100%'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(3,6,12,1) 0%, rgba(3,6,12,0.92) 38%, rgba(3,6,12,0.2) 70%, transparent 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(3,6,12,0.7) 0%, transparent 35%)'}} />
    <div style={{position: 'absolute', left: 64, top: 60, display: 'flex', alignItems: 'center', gap: 22}}>
      <WhiteLogo file="logo_tesla_t.svg" height={74} width={74} />
      <WhiteLogo file="logo_tesla_word.svg" height={30} />
    </div>
    <Words text={'Paid by its *rivals*'} size={136} style={{position: 'absolute', left: 64, top: 190, width: 640}} />
    <div style={{position: 'absolute', left: 64, bottom: 60}}>
      <span style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 84, letterSpacing: -2, color: '#FFD98A', textShadow: '0 0 40px rgba(240,181,78,0.55)'}}>$1.58B</span>
    </div>
    <Brand />
    <Vignette />
  </AbsoluteFill>
);

// C : l'argent des concurrents qui converge vers le « T » doré.
const RIVALS: {file: string; color?: boolean; wide?: boolean}[] = [
  {file: 'logo_stellantis.png', wide: true},
  {file: 'logo_toyota.svg'},
  {file: 'logo_ford.svg', color: true},
  {file: 'logo_gm.svg'},
];
const Rivaux = () => {
  const tx = 930;
  const ty = 330;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 72% 45%, #172C52 0%, ${C.ink} 68%)`, overflow: 'hidden'}}>
      <Photo file="traffic.jpg" position="20% 50%" style={{filter: 'saturate(0.3) brightness(0.3) blur(2px)', opacity: 0.4}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(3,6,12,0.6) 0%, transparent 60%)'}} />
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(240,181,78,0.15)" />
            <stop offset="1" stopColor="rgba(255,217,138,0.95)" />
          </linearGradient>
        </defs>
        {RIVALS.map((_, i) => {
          const y = 110 + i * 150;
          return <path key={i} d={`M 190 ${y} C 520 ${y}, 640 ${ty}, ${tx - 150} ${ty}`} stroke="url(#flow)" strokeWidth={7} fill="none" strokeLinecap="round" />;
        })}
        {RIVALS.map((_, i) =>
          [0.3, 0.58].map((k) => {
            const y = 110 + i * 150;
            // point sur la courbe de Bézier, paramètre k
            const bx = (1 - k) ** 3 * 190 + 3 * (1 - k) ** 2 * k * 520 + 3 * (1 - k) * k ** 2 * 640 + k ** 3 * (tx - 150);
            const by = (1 - k) ** 3 * y + 3 * (1 - k) ** 2 * k * y + 3 * (1 - k) * k ** 2 * ty + k ** 3 * ty;
            return (
              <text key={`${i}-${k}`} x={bx} y={by + 12} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#FFD98A" style={{filter: 'drop-shadow(0 0 8px rgba(240,181,78,0.9))'}}>
                $
              </text>
            );
          }),
        )}
      </svg>
      {RIVALS.map((r, i) => (
        <div key={i} style={{position: 'absolute', left: 40, top: 110 + i * 150 - 55, width: 150, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.18)'}}>
          <WhiteLogo file={r.file} height={r.wide ? 40 : 70} width={r.wide ? 134 : 110} color={r.color} />
        </div>
      ))}
      <div style={{position: 'absolute', left: tx - 260, top: ty - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,181,78,0.4) 0%, transparent 62%)'}} />
      <div style={{position: 'absolute', left: tx - 160, top: ty - 175}}>
        <GoldT size={320} glow={0.8} />
      </div>
      <div style={{position: 'absolute', left: tx - 300, width: 600, top: 540, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: 104, letterSpacing: -3, color: '#FFD98A', textShadow: '0 0 40px rgba(240,181,78,0.6)'}}>$1.58B</div>
      <Brand />
      <Vignette />
    </AbsoluteFill>
  );
};

export const ThumbnailVariant: React.FC<ThumbVariantProps> = ({variant}) =>
  variant === 'photo' ? <PhotoV /> : variant === 'rivaux' ? <Rivaux /> : <Or />;
