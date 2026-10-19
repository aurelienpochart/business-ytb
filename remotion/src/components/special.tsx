import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, useEnter} from './common';

// Courbe du logo (charte 2.3), dessinée progressivement.
export const LogoCurve: React.FC<{size: number; progress: number; dot?: number}> = ({size, progress, dot = 1}) => (
  <svg width={size} height={size} viewBox="0 0 800 800">
    <g stroke={C.slate} strokeWidth={6} opacity={0.55 * Math.min(1, progress * 3)}>
      <line x1={200} y1={250} x2={200} y2={600} />
      <line x1={200} y1={600} x2={620} y2={600} />
    </g>
    <path
      d="M 215 215 C 270 470, 380 540, 590 548"
      fill="none"
      stroke={C.amber}
      strokeWidth={58}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
    <circle cx={592} cy={548} r={46 * dot} fill={C.paper} />
  </svg>
);

// Ident d'ouverture, 3 s (charte 2.6).
export const Ident: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(frame, [0, 1.4 * fps], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const dot = interpolate(frame, [1.3 * fps, 1.7 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  const text = interpolate(frame, [1.5 * fps, 2.1 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = interpolate(frame, [2.6 * fps, 3 * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.navy, alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
        <LogoCurve size={300} progress={draw} dot={dot} />
        <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 110, color: C.paper, letterSpacing: 2, opacity: text}}>
          THE COST CURVE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Écran de fin, 20 s : emplacements laissés libres pour les éléments de fin YouTube.
export const EndScreen: React.FC = () => {
  const p = useEnter(0.2);
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <div style={{position: 'absolute', left: 140, top: 140, ...fade(p)}}>
        <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 80, color: C.paper}}>Thanks for watching.</div>
        <div style={{fontFamily: FONT.title, fontSize: 40, color: C.paper, opacity: 0.8, marginTop: 20}}>
          Sources are listed in the description.
        </div>
      </div>
      {/* Zones des éléments de fin (vidéo suggérée à gauche, abonnement à droite), réglées dans YouTube. */}
      <div style={{position: 'absolute', left: 140, top: 430, width: 860, height: 484, border: `3px dashed ${C.slate}`, borderRadius: 12, opacity: 0.35 * p}} />
      <div style={{position: 'absolute', left: 1200, top: 500, opacity: p}}>
        <LogoCurve size={340} progress={1} />
      </div>
    </AbsoluteFill>
  );
};

// Schéma des crédits réglementaires : constructeur au-dessus de la limite -> crédits <- Tesla sous la limite.
export const CreditsFlow: React.FC<{title: string; source?: string}> = ({title, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pLimit = useEnter(0.3);
  const pA = useEnter(1.2);
  const pB = useEnter(2.6);
  const arrows = interpolate(frame, [4.2 * fps, 5.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const moneyX = interpolate(frame, [5.4 * fps, 7.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const box = (label: string, sub: string, emissions: number, color: string, p: number, x: number) => (
    <div style={{position: 'absolute', left: x, bottom: 0, width: 470, ...fade(p)}}>
      <div style={{height: 520, position: 'relative'}}>
        <div style={{position: 'absolute', bottom: 0, left: 120, width: 230, height: emissions * Math.min(1, p), background: color, borderRadius: '8px 8px 0 0'}} />
      </div>
      <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 44, color: C.paper, textAlign: 'center', marginTop: 20}}>{label}</div>
      <div style={{fontFamily: FONT.title, fontSize: 28, color: C.paper, opacity: 0.75, textAlign: 'center'}}>{sub}</div>
    </div>
  );
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', inset: 0}}>
        {box('Other carmaker', 'Many gasoline vehicles', 440, C.brick, pA, 80)}
        {box('Tesla', 'Electric vehicles only', 40, C.teal, pB, 1080)}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 370, borderTop: `5px dashed ${C.amber}`, opacity: pLimit}} />
        <div style={{position: 'absolute', right: 0, bottom: 385, fontFamily: FONT.mono, fontSize: 30, color: C.amber, opacity: pLimit}}>
          Emissions limit
        </div>
        <div style={{position: 'absolute', left: 620, top: 160, width: 400, textAlign: 'center', opacity: arrows}}>
          <div style={{fontFamily: FONT.mono, fontSize: 34, color: C.teal}}>← credits</div>
          <div style={{height: 8, background: C.teal, margin: '10px 0 40px', transform: `scaleX(${arrows})`}} />
          <div style={{height: 8, background: C.amber, marginBottom: 10, transform: `scaleX(${arrows})`}} />
          <div style={{fontFamily: FONT.mono, fontSize: 34, color: C.amber}}>$ money →</div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 205,
            left: interpolate(moneyX, [0, 1], [420, 1180]),
            fontFamily: FONT.mono,
            fontWeight: 600,
            fontSize: 70,
            color: C.amber,
            opacity: moneyX > 0 && moneyX < 1 ? 1 : 0,
          }}
        >
          $
        </div>
      </div>
    </Frame>
  );
};

// Fond commun : bleu nuit, grille légère qui dérive lentement.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.15) % 80;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.slate}22 1px, transparent 1px), linear-gradient(90deg, ${C.slate}22 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          backgroundPosition: `${shift}px ${shift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ChapterLabel: React.FC<{num: number; title: string}> = ({num, title}) => {
  const p = useEnter(0.1);
  return (
    <div style={{position: 'absolute', left: 140, top: 44, fontFamily: FONT.mono, fontSize: 24, color: C.slate, opacity: p, letterSpacing: 2}}>
      {String(num).padStart(2, '0')} · {title.toUpperCase()}
    </div>
  );
};
