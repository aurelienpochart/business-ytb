import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

// Progression 0 -> 1 d'une entrée animée, `delay` en secondes après le début du bloc.
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay * fps, fps, config: {damping}});
};

export const fade = (p: number) => ({
  opacity: p,
  transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`,
});

export const formatNumber = (v: number, decimals = 0) =>
  v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

export const Frame: React.FC<{children: React.ReactNode; title?: string; source?: string}> = ({
  children,
  title,
  source,
}) => {
  const p = useEnter(0);
  return (
    <div style={{position: 'absolute', inset: 0, padding: '110px 140px 120px', display: 'flex', flexDirection: 'column'}}>
      {title ? (
        <div style={{...fade(p), fontFamily: FONT.title, fontWeight: 800, fontSize: 54, color: C.paper, marginBottom: 40}}>
          {title}
        </div>
      ) : null}
      <div style={{flex: 1, position: 'relative'}}>{children}</div>
      {source ? <Source text={source} /> : null}
    </div>
  );
};

export const Source: React.FC<{text: string}> = ({text}) => {
  const p = useEnter(0.6);
  return (
    <div
      style={{
        position: 'absolute',
        right: 60,
        bottom: 36,
        opacity: p * 0.75,
        fontFamily: FONT.mono,
        fontSize: 20,
        color: C.slate,
        maxWidth: 1100,
        textAlign: 'right',
      }}
    >
      Source: {text}
    </div>
  );
};

// Met en ambre les mots entre *astérisques*.
export const Highlight: React.FC<{text: string; color?: string}> = ({text, color = C.amber}) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith('*') ? (
        <span key={i} style={{color}}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);
