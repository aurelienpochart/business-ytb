import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GRAD} from '../theme';
import {RevealWords, gold} from './fx';

// Progression 0 -> 1 d'une entrée animée, `delay` en secondes après le début du bloc.
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay * fps, fps, config: {damping}});
};

export const fade = (p: number) => ({
  opacity: Math.min(1, Math.max(0, p)),
  transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
  filter: p < 0.97 ? `blur(${(1 - Math.min(1, p)) * 8}px)` : undefined,
});

export const formatNumber = (v: number, decimals = 0) =>
  v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

export const colorOf = (name?: string) => (name ? (C as Record<string, string>)[name] ?? name : C.teal);
export const gradOf = (name?: string) => GRAD[name ?? 'teal'] ?? [name ?? C.teal, name ?? C.teal, 'transparent'];

// Panneau de verre : fond translucide, liseré lumineux, ombre profonde.
export const glass = (accent?: string): React.CSSProperties => ({
  background: 'linear-gradient(140deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.04) 100%)',
  border: `1.5px solid ${accent ?? 'rgba(255,255,255,0.10)'}`,
  boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)${accent ? `, 0 0 50px ${accent}33` : ''}`,
  borderRadius: 22,
});

export const Frame: React.FC<{children: React.ReactNode; title?: string; source?: string}> = ({children, title, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bar = spring({frame, fps, config: {damping: 200}});
  return (
    <div style={{position: 'absolute', inset: 0, padding: '150px 150px 130px', display: 'flex', flexDirection: 'column'}}>
      {title ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 46}}>
          <div style={{width: 8, height: 58 * bar, borderRadius: 4, background: 'linear-gradient(180deg, #FFE7B0, #F0B54E 50%, #A8701E)', boxShadow: '0 0 20px rgba(240,181,78,0.5)'}} />
          <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 54, color: C.paper, letterSpacing: -0.5}}>
            <RevealWords text={title} delay={0.05} stagger={0.045} />
          </div>
        </div>
      ) : null}
      <div style={{flex: 1, position: 'relative'}}>{children}</div>
      {source ? <Source text={source} /> : null}
    </div>
  );
};

export const Source: React.FC<{text: string}> = ({text}) => {
  const p = useEnter(0.8);
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        bottom: 62,
        opacity: p * 0.8,
        fontFamily: FONT.mono,
        fontSize: 19,
        color: C.mute,
        maxWidth: 1300,
        letterSpacing: 0.5,
        display: 'flex',
        gap: 14,
      }}
    >
      <span style={{color: C.gold, letterSpacing: 4}}>SOURCE</span>
      <span>{text}</span>
    </div>
  );
};

// Met en or les mots entre *astérisques* (sans animation).
export const Highlight: React.FC<{text: string; color?: string}> = ({text, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith('*') ? (
          <span key={i} style={color ? {color} : gold(frame, fps, i * 5)}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};
