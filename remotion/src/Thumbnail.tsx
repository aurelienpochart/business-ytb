import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Highlight} from './components/common';
import {LogoCurve} from './components/special';
import {C, FONT} from './theme';

// Miniature 1280 x 720 (charte 2.5) : 3 à 5 mots, un mot en ambre, un chiffre fort, la courbe du logo en coin.
export type ThumbProps = {
  words: string;
  number?: string;
  numberLabel?: string;
  bars?: {value: number; color: string; label: string}[];
};

export const Thumbnail: React.FC<ThumbProps> = ({words, number, numberLabel, bars}) => {
  const max = bars ? Math.max(...bars.map((b) => b.value)) : 1;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.slate}33 2px, transparent 2px), linear-gradient(90deg, ${C.slate}33 2px, transparent 2px)`,
          backgroundSize: '64px 64px',
        }}
      />
      <div style={{position: 'absolute', left: 64, top: 70, width: 640, fontFamily: FONT.title, fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: C.paper}}>
        <Highlight text={words} />
      </div>
      {bars ? (
        <div style={{position: 'absolute', right: 70, bottom: 90, display: 'flex', alignItems: 'flex-end', gap: 26}}>
          {bars.map((b, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: 150, height: (b.value / max) * 360, background: b.color, borderRadius: '10px 10px 0 0'}} />
              <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 30, color: C.paper, marginTop: 12}}>{b.label}</div>
            </div>
          ))}
        </div>
      ) : null}
      {number ? (
        <div style={{position: 'absolute', left: 64, bottom: 70}}>
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 96, color: C.amber}}>{number}</div>
          {numberLabel ? <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 36, color: C.paper}}>{numberLabel}</div> : null}
        </div>
      ) : null}
      <div style={{position: 'absolute', right: 26, top: 22}}>
        <LogoCurve size={110} progress={1} />
      </div>
    </AbsoluteFill>
  );
};
