import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {icons} from 'lucide-react';
import {C, FONT} from '../theme';
import {Frame, fade, glass, gradOf, useEnter} from './common';
import {Kicker} from './fx';

// ---------- Parcours (gabarit The Journey) ----------
// Les arrêts du voyage reliés par une route ; un avion avance de l'arrêt `from` à l'arrêt `current`.
// Arrêts passés en or (coche), arrêt en cours entouré d'un anneau lumineux, arrêts à venir en ardoise.
// En dessous, facultatif : le « reçu » du passager, des cartes (libellé + montant) qui apparaissent une à une.
type Stop = {icon: string; label: string};
type Tally = {label: string; value: string; color?: string; sub?: string; delay?: number; strong?: boolean};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const unit = (p: number) => Math.min(1, Math.max(0, p));

export const Journey: React.FC<{
  title?: string;
  kicker?: string;
  stops: Stop[];
  current: number; // arrêt atteint (−1 : avant le départ ; stops.length : arrivée)
  from?: number; // arrêt de départ de l'avion (défaut : current − 1)
  travelAt?: number; // début du trajet de l'avion (s)
  travel?: number; // durée du trajet (s)
  tally?: Tally[];
  tallyTitle?: string;
  stagger?: number;
  start?: number;
  source?: string;
}> = ({title, kicker, stops, current, from, travelAt = 0.5, travel = 1.6, tally, tallyTitle, stagger = 0.9, start = 1.2, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = stops.length;
  const W = 1620;
  const hasTally = !!tally?.length;
  const routeY = hasTally ? 190 : 330;
  const x0 = 90;
  const x1 = W - 90;
  // Position de l'arrêt k (k peut être fractionnaire) : route en légère vague.
  const pos = (k: number) => {
    const t = n === 1 ? 0.5 : k / (n - 1);
    const x = x0 + (x1 - x0) * t;
    const y = routeY - Math.sin(t * Math.PI) * 70 + Math.sin(t * Math.PI * 3) * 14;
    return {x, y};
  };
  const start0 = from ?? current - 1;
  const move = interpolate(frame, [travelAt * fps, (travelAt + travel) * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const kPlane = Math.max(-0.6, Math.min(n - 1 + 0.6, start0 + (current - start0) * move));
  const pIn = useEnter(0.05);

  // Tracé de la route (polyligne fine).
  const STEPS = 120;
  const pts = Array.from({length: STEPS + 1}, (_, i) => pos(-0.4 + ((n - 1 + 0.8) * i) / STEPS));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const doneUpto = (kPlane + 0.4) / (n - 1 + 0.8); // part de la route parcourue
  const planeP = pos(kPlane);
  const ahead = pos(Math.min(kPlane + 0.05, n - 1 + 0.6));
  const angle = (Math.atan2(ahead.y - planeP.y, ahead.x - planeP.x) * 180) / Math.PI;
  const Plane = icons.Plane as React.FC<any>;
  const Check = icons.Check as React.FC<any>;

  return (
    <Frame title={title} source={source}>
      {kicker ? (
        <div style={{position: 'absolute', left: 0, top: -10, ...fade(pIn)}}>
          <Kicker text={kicker} />
        </div>
      ) : null}
      <svg width={W} height={800} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="jr-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#A8701E" />
            <stop offset="0.5" stopColor="#FFD27F" />
            <stop offset="1" stopColor="#F0B54E" />
          </linearGradient>
          <filter id="jr-glow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" opacity={pIn} />
        <path d={d} fill="none" stroke="url(#jr-gold)" strokeWidth={10} pathLength={1} strokeDasharray={`${doneUpto} 1`} filter="url(#jr-glow)" opacity={0.55 * pIn} />
        <path d={d} fill="none" stroke="url(#jr-gold)" strokeWidth={4} pathLength={1} strokeDasharray={`${doneUpto} 1`} strokeLinecap="round" opacity={pIn} />
      </svg>
      {stops.map((s, k) => {
        const p = pos(k);
        const reached = kPlane >= k - 0.02;
        const isCur = k === current && reached;
        const appear = spring({frame: frame - (0.1 + k * 0.06) * fps, fps, config: {damping: 200}});
        const hit = spring({frame: frame - ((travelAt + travel * ((k - start0) / Math.max(0.001, current - start0))) * fps), fps, config: {damping: 12, mass: 0.6}});
        const pop = isCur && k > start0 ? 1 + 0.12 * Math.sin(Math.min(1, hit) * Math.PI) : 1;
        const Icon = (icons as Record<string, React.FC<any>>)[s.icon];
        const size = isCur ? 118 : 92;
        const col = reached ? C.gold : C.slate;
        const pulse = isCur ? 0.5 + 0.5 * Math.sin(frame / 9) : 0;
        return (
          <div key={k} style={{position: 'absolute', left: p.x - 110, top: p.y - size / 2, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: unit(appear), transform: `translateY(${(1 - unit(appear)) * 20}px)`}}>
            <div style={{position: 'relative', width: size, height: size, transform: `scale(${pop})`}}>
              {isCur ? <div style={{position: 'absolute', inset: -16 - pulse * 6, borderRadius: '50%', border: `2px solid rgba(240,181,78,${0.55 - pulse * 0.3})`, boxShadow: '0 0 40px rgba(240,181,78,0.35)'}} /> : null}
              <div style={{position: 'absolute', inset: 0, borderRadius: '50%', ...glass(reached ? 'rgba(240,181,78,0.55)' : undefined), background: reached ? 'radial-gradient(circle at 35% 30%, rgba(255,215,140,0.28), rgba(10,20,36,0.85) 70%)' : 'rgba(10,20,36,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {Icon ? <Icon size={size * 0.46} color={col} strokeWidth={1.6} style={{filter: reached ? 'drop-shadow(0 0 12px rgba(240,181,78,0.6))' : undefined}} /> : null}
              </div>
              {reached && !isCur ? (
                <div style={{position: 'absolute', right: -6, top: -6, width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(180deg,#FFE7B0,#F0B54E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(240,181,78,0.6)'}}>
                  <Check size={22} color={C.ink} strokeWidth={3} />
                </div>
              ) : null}
            </div>
            <div style={{marginTop: 18, fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: reached ? C.gold : C.mute, opacity: 0.9}}>{k === n - 1 && s.label.toLowerCase().includes('land') ? 'ARRIVAL' : `STOP ${k + 1}`}</div>
            <div style={{marginTop: 6, fontFamily: FONT.title, fontWeight: isCur ? 800 : 600, fontSize: isCur ? 30 : 25, lineHeight: 1.15, textAlign: 'center', color: reached ? C.paper : C.mute}}>{s.label}</div>
          </div>
        );
      })}
      {kPlane > -0.6 && kPlane < n - 1 + 0.6 ? (
        <div style={{position: 'absolute', left: planeP.x - 34, top: planeP.y - 34 - 74, width: 68, height: 68, transform: `rotate(${angle + 45}deg)`, opacity: unit(pIn * 2), filter: 'drop-shadow(0 0 16px rgba(255,231,176,0.8))'}}>
          <Plane size={68} color={C.goldLight} fill={C.goldLight} strokeWidth={1.2} />
        </div>
      ) : null}
      {hasTally ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {tallyTitle ? <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: 6, color: C.mute, marginBottom: 22, opacity: unit(pIn)}}>{tallyTitle.toUpperCase()}</div> : null}
          <div style={{display: 'flex', gap: 28, justifyContent: 'center'}}>
            {tally!.map((t, i) => {
              const dl = t.delay ?? start + i * stagger;
              const p = spring({frame: frame - dl * fps, fps, config: {damping: 200}});
              const [, top, halo] = gradOf(t.color ?? 'amber');
              return (
                <div key={i} style={{...fade(p), minWidth: 300, padding: '26px 34px 24px', ...glass(t.strong ? 'rgba(240,181,78,0.6)' : undefined), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <div style={{fontFamily: FONT.mono, fontSize: 21, letterSpacing: 4, color: C.mute}}>{t.label.toUpperCase()}</div>
                  <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: t.strong ? 84 : 74, letterSpacing: -2, color: top, textShadow: `0 0 36px ${halo}`, marginTop: 6}}>{t.value}</div>
                  {t.sub ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 24, color: C.paper, opacity: 0.8, marginTop: 4}}>{t.sub}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </Frame>
  );
};
