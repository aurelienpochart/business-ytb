import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LogoCurve} from './components/special';
import {AMB, C, FONT, GOLD_TEXT, GRAD, applyTint} from './theme';
import {ThumbnailVariant, ThumbVariantProps} from './ThumbnailVariants';
import {PlusVariant, ThumbnailVariantPlus, isPlusVariant} from './ThumbnailVariantsPlus';

// Miniature 1280 x 720 (charte 2.5) : 3 à 5 mots, un mot en or, un chiffre fort, la courbe du logo en coin.
export type ThumbProps = {
  words: string;
  number?: string;
  numberLabel?: string;
  bars?: {value: number; color: string; label: string}[];
  variant?: ThumbVariantProps['variant'] | PlusVariant; // miniature choisie parmi les variantes (prioritaire)
  ring?: number; // variante « anneau » : part remplie de l'anneau (0 à 1)
  tint?: string; // teinte d'ambiance de la vidéo (metadata.json)
} & Omit<Partial<ThumbVariantProps>, 'variant' | 'number' | 'numberLabel'>;

const goldText: React.CSSProperties = {
  backgroundImage: GOLD_TEXT,
  backgroundSize: '200% 100%',
  backgroundPosition: '30% 0',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

export const Thumbnail: React.FC<ThumbProps> = ({words, number, numberLabel, bars, variant, tint, ...custom}) => {
  applyTint(tint);
  // Compositions supplémentaires (portrait, puce, face-a-face, anneau) : tout vient de thumbnail.json.
  if (isPlusVariant(variant)) return <ThumbnailVariantPlus variant={variant} words={words} number={number} numberLabel={numberLabel} {...custom} />;
  // La vidéo 01 ne passe que `variant` : sa miniature validée reste identique.
  if (variant) return <ThumbnailVariant variant={variant} {...(custom.logo ? {...custom, number, numberLabel} : {})} />;
  const max = bars ? Math.max(...bars.map((b) => b.value)) : 1;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 40%, ${AMB.nightSoft} 0%, ${C.ink} 70%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -200, top: -150, width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,181,78,0.22) 0%, transparent 60%)'}} />
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        <g stroke="rgba(240,181,78,0.13)" strokeWidth={1.5}>
          {Array.from({length: 29}, (_, k) => k - 14).map((k) => (
            <line key={k} x1={640 + k * 18} y1={470} x2={640 + k * 230} y2={760} />
          ))}
          {[1.2, 1.6, 2.3, 3.5, 6].map((z) => (
            <line key={z} x1={0} x2={1280} y1={470 + 250 / z} y2={470 + 250 / z} />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 64, top: 60, width: 700, fontFamily: FONT.display, fontSize: 124, lineHeight: 0.95, color: C.paper, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>
        {words.split(/(\*[^*]+\*)/).map((part, i) =>
          part.startsWith('*') ? (
            <span key={i} style={{...goldText, filter: 'drop-shadow(0 0 24px rgba(240,181,78,0.5))'}}>
              {part.slice(1, -1)}
            </span>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          ),
        )}
      </div>
      {bars ? (
        <div style={{position: 'absolute', right: 80, bottom: 120, display: 'flex', alignItems: 'flex-end', gap: 30}}>
          {bars.map((b, i) => {
            const [lo, hi, halo] = GRAD[b.color] ?? GRAD.teal;
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{width: 150, height: (b.value / max) * 380, background: `linear-gradient(180deg, ${hi}, ${lo})`, borderRadius: '14px 14px 0 0', boxShadow: `0 0 70px ${halo}, inset 0 3px 0 rgba(255,255,255,0.4)`}} />
                <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 28, letterSpacing: 2, color: C.paper, marginTop: 14}}>{b.label.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {number ? (
        <div style={{position: 'absolute', left: 64, bottom: 64}}>
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 104, letterSpacing: -3, color: '#FFD98A', textShadow: '0 0 40px rgba(240,181,78,0.55)'}}>{number}</div>
          {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 34, color: C.paper}}>{numberLabel}</div> : null}
        </div>
      ) : null}
      <div style={{position: 'absolute', right: 30, top: 24}}>
        <LogoCurve size={110} progress={1} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)'}} />
    </AbsoluteFill>
  );
};
