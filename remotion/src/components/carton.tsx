import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter, useLayout} from './common';
import {Kicker} from './fx';

// ---------- Boîte d'œufs (vidéo 09) ----------
// Une boîte de douze vue de dessus (2 rangées de 6 alvéoles). Les œufs se posent un à un, puis les `share`
// premiers (fraction possible) s'allument dans la couleur `color` : la part du prix payé qui revient à
// quelqu'un (la ferme, par exemple) ; les autres restent ternes. Deux cartouches de légende en dessous.
type Legend = {label: string; value: string; color?: string; sub?: string};

const unit = (p: number) => Math.min(1, Math.max(0, p));
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Carton: React.FC<{
  title?: string;
  kicker?: string;
  share: number; // nombre d'œufs allumés (0 à 12, fraction possible)
  color?: string;
  start?: number; // pose du premier œuf (s)
  stagger?: number; // entre deux œufs (s)
  lightAt?: number; // allumage de la part (s)
  on?: Legend; // légende de la part allumée
  off?: Legend; // légende du reste
  source?: string;
}> = ({title, kicker, share, color = 'amber', start = 0.3, stagger = 0.09, lightAt = 2.0, on, off, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const P = useLayout().portrait;
  const pIn = useEnter(0.05);
  const cols = P ? 4 : 6;
  const rows = 12 / cols;
  const cell = P ? 170 : 200;
  const gap = P ? 18 : 22;
  const W = cols * cell + (cols - 1) * gap + 60;
  const H = rows * cell + (rows - 1) * gap + 60;
  const [lo, hi, halo] = gradOf(color);
  const light = interpolate(frame, [lightAt * fps, (lightAt + 0.9) * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const legendIn = (d: number) => spring({frame: frame - d * fps, fps, config: {damping: 200}});

  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: -10, ...fade(pIn)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: P ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: P ? 50 : 80}}>
        <div
          style={{
            position: 'relative',
            width: W,
            height: H,
            ...glass('rgba(240,181,78,0.25)'),
            borderRadius: 40,
            background: 'linear-gradient(160deg, rgba(255,240,214,0.10), rgba(255,240,214,0.03) 60%, rgba(255,240,214,0.06))',
            transform: `perspective(1800px) rotateX(${14 + Math.sin(frame / fps / 3) * 1.5}deg) rotateZ(${-2 + Math.sin(frame / fps / 4)}deg) scale(${0.94 + 0.06 * unit(pIn)})`,
            opacity: unit(pIn),
          }}
        >
          {Array.from({length: 12}, (_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const x = 30 + c * (cell + gap);
            const y = 30 + r * (cell + gap);
            const drop = spring({frame: frame - (start + i * stagger) * fps, fps, config: {damping: 13, mass: 0.7}});
            const lit = unit(share - i); // 1 : œuf entier allumé ; fraction : œuf partiellement allumé
            const glow = lit * light;
            const ew = cell * 0.6;
            const eh = cell * 0.76;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y, width: cell, height: cell}}>
                {/* alvéole */}
                <div style={{position: 'absolute', inset: 8, borderRadius: '46%', background: 'radial-gradient(circle at 50% 60%, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 70%)', boxShadow: 'inset 0 10px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08)'}} />
                {/* œuf */}
                <div
                  style={{
                    position: 'absolute',
                    left: (cell - ew) / 2,
                    top: (cell - eh) / 2,
                    width: ew,
                    height: eh,
                    borderRadius: '50% 50% 50% 50% / 58% 58% 42% 42%',
                    overflow: 'hidden',
                    opacity: unit(drop * 1.6),
                    transform: `translateY(${(1 - unit(drop)) * -60}px) scale(${0.7 + 0.3 * drop})`,
                    background: 'radial-gradient(circle at 35% 28%, #FFF6E6 0%, #E9D2B0 45%, #A98762 100%)',
                    filter: glow > 0 ? `drop-shadow(0 0 ${22 * glow}px ${halo})` : 'saturate(0.55) brightness(0.72)',
                    boxShadow: '0 14px 24px rgba(0,0,0,0.45)',
                  }}
                >
                  {lit > 0 ? (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        height: `${lit * 100}%`,
                        opacity: light,
                        background: `radial-gradient(circle at 35% 25%, #FFF3C9 0%, ${hi} 45%, ${lo} 100%)`,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', flexDirection: P ? 'row' : 'column', gap: 28}}>
          {[on, off].map((l, k) => {
            if (!l) return null;
            const p = legendIn(lightAt + 0.4 + k * 0.7);
            const [, top, h] = gradOf(l.color ?? (k === 0 ? color : 'slate'));
            return (
              <div key={k} style={{...fade(p), minWidth: P ? 380 : 420, padding: '26px 34px 24px', ...glass(k === 0 ? 'rgba(240,181,78,0.55)' : undefined), display: 'flex', flexDirection: 'column'}}>
                <div style={{fontFamily: FONT.mono, fontSize: 21, letterSpacing: 4, color: C.mute}}>{l.label.toUpperCase()}</div>
                <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 80, letterSpacing: -2, color: top, textShadow: `0 0 36px ${h}`, marginTop: 6}}>{l.value}</div>
                {l.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 26, color: C.paper, opacity: 0.82, marginTop: 4}}>{l.sub}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
};
