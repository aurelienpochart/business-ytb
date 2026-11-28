import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {Frame, fade, glass, useEnter, useLayout} from './common';
import {GoldText, LightSweep, RevealWords, gold} from './fx';
import {PhotoLayer} from './media';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Courbe du logo (charte 2.3), dessinée progressivement, avec halo doré.
export const LogoCurve: React.FC<{size: number; progress: number; dot?: number; glow?: boolean}> = ({size, progress, dot = 1, glow = true}) => (
  <svg width={size} height={size} viewBox="0 0 800 800" style={{overflow: 'visible'}}>
    <defs>
      <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE7B0" />
        <stop offset="55%" stopColor="#F0B54E" />
        <stop offset="100%" stopColor="#A8701E" />
      </linearGradient>
    </defs>
    <g stroke={C.slate} strokeWidth={6} opacity={0.6 * Math.min(1, progress * 3)}>
      <line x1={200} y1={250} x2={200} y2={600} />
      <line x1={200} y1={600} x2={620} y2={600} />
    </g>
    {glow ? (
      <path d="M 215 215 C 270 470, 380 540, 590 548" fill="none" stroke="#F0B54E" strokeOpacity={0.45} strokeWidth={90} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} style={{filter: 'blur(28px)'}} />
    ) : null}
    <path d="M 215 215 C 270 470, 380 540, 590 548" fill="none" stroke="url(#logoGold)" strokeWidth={58} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
    <circle cx={592} cy={548} r={46 * dot} fill={C.paper} style={glow ? {filter: 'drop-shadow(0 0 30px rgba(255,240,200,0.9))'} : undefined} />
  </svg>
);

// Ident d'ouverture, 3 s : la courbe se trace, éclat de lumière, nom en lettres qui se resserrent.
export const Ident: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(frame, [0, 1.3 * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const dot = spring({frame: frame - 1.2 * fps, fps, config: {damping: 9, stiffness: 160}});
  const text = spring({frame: frame - 1.35 * fps, fps, config: {damping: 200}});
  const flash = interpolate(frame, [1.2 * fps, 1.35 * fps, 1.9 * fps], [0, 1, 0], clamp);
  const out = interpolate(frame, [2.55 * fps, 3 * fps], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, ${C.navy} 0%, ${C.ink} 70%)`, alignItems: 'center', justifyContent: 'center', opacity: out}}>
      {/* Reflet anamorphique horizontal au moment où le point apparaît */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 590 - 3, height: 6, background: 'linear-gradient(90deg, transparent 5%, rgba(255,226,160,0.9) 50%, transparent 95%)', filter: 'blur(3px)', opacity: flash, transform: `scaleX(${0.3 + flash * 0.7})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 590 - 60, height: 120, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,210,127,0.35) 0%, transparent 60%)', opacity: flash}} />
      {Array.from({length: 26}, (_, i) => {
        const a = random(`ia${i}`) * Math.PI * 2;
        const d = interpolate(frame, [1.25 * fps, 2.6 * fps], [0, 200 + random(`id${i}`) * 420], {...clamp, easing: Easing.out(Easing.cubic)});
        const o = interpolate(frame, [1.25 * fps, 1.4 * fps, 2.6 * fps], [0, 1, 0], clamp);
        return <div key={i} style={{position: 'absolute', left: 460 + Math.cos(a) * d, top: 590 + Math.sin(a) * d, width: 4, height: 4, borderRadius: 2, background: C.goldLight, opacity: o, boxShadow: '0 0 12px #FFD27F'}} />;
      })}
      <div style={{display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${1 + frame / fps * 0.02})`}}>
        <LogoCurve size={300} progress={draw} dot={Math.max(0, dot)} />
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 104, letterSpacing: interpolate(text, [0, 1], [40, 6]), opacity: text, filter: text < 0.97 ? `blur(${(1 - text) * 12}px)` : undefined}}>
          <span style={{color: C.paper}}>THE COST </span>
          <GoldText>CURVE</GoldText>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Carte de chapitre : grand numéro doré en filigrane, titre qui se révèle, puis tout se dissout.
export const ChapterCard: React.FC<{num: number; title: string; duration: number; photo?: string}> = ({num, title, duration, photo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}});
  const out = interpolate(frame, [duration - 14, duration], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const line = interpolate(frame, [0.15 * fps, 0.9 * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 16}px)` : undefined, transform: `scale(${1 + out * 0.06})`}}>
      <AbsoluteFill style={{background: C.ink, opacity: enter}} />
      {photo ? (
        <AbsoluteFill style={{opacity: enter, transform: `scale(${1.15 - 0.1 * enter})`}}>
          <PhotoLayer id={photo} dim={0.6} />
        </AbsoluteFill>
      ) : null}
      <LightSweep strength={0.3} />
      <div style={{position: 'absolute', left: 150, top: 230, display: 'flex', alignItems: 'flex-end', gap: 60}}>
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 520,
            lineHeight: 0.8,
            ...gold(frame, fps),
            opacity: enter,
            transform: `perspective(1200px) translateZ(${(1 - enter) * -600}px) rotateY(${(1 - enter) * 35}deg)`,
            filter: 'drop-shadow(0 0 40px rgba(240,181,78,0.35))',
          }}
        >
          {String(num).padStart(2, '0')}
        </div>
        <div style={{paddingBottom: 40}}>
          <div style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: 8, color: C.gold, opacity: enter}}>CHAPTER {num}</div>
          <div style={{width: 640 * line, height: 2, background: 'linear-gradient(90deg, #F0B54E, transparent)', margin: '22px 0 26px'}} />
          <div style={{fontFamily: FONT.display, fontSize: 92, lineHeight: 1.02, color: C.paper, maxWidth: 1100}}>
            <RevealWords text={title} delay={0.25} stagger={0.07} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Habillage permanent : chapitre en haut à gauche, logo en haut à droite, barre de progression par chapitre.
export const Hud: React.FC<{chapters: {num: number; title: string; start: number}[]; total: number}> = ({chapters, total}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = frame / fps;
  const appear = interpolate(t, [chapters[1]?.start ?? 0, (chapters[1]?.start ?? 0) + 1], [0, 1], clamp);
  const trackW = width - 300;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', right: 150, top: 46, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.85 * appear}}>
        <LogoCurve size={52} progress={1} glow={false} />
        <span style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 19, letterSpacing: 5, color: C.paper}}>THE COST CURVE</span>
      </div>
      <div style={{position: 'absolute', left: 150, top: 1080 - 34, width: trackW, height: 2, background: 'rgba(255,255,255,0.08)', opacity: appear}}>
        <div style={{width: `${Math.min(1, t / total) * 100}%`, height: 2, background: 'linear-gradient(90deg, #A8701E, #FFD27F)', boxShadow: '0 0 10px rgba(240,181,78,0.7)'}} />
        {chapters.slice(1).map((c) => (
          <div key={c.num} style={{position: 'absolute', left: (c.start / total) * trackW - 1, top: -4, width: 2, height: 10, background: t >= c.start ? C.gold : 'rgba(255,255,255,0.25)'}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Vidéo à voir ensuite (pipeline/next_video.py -> public/next.json, miniature public/next-thumb.png).
export type NextVideo = {title: string; url: string; thumbnail?: string | null};

// Bouton « Subscribe » dessiné dans l'image (l'API YouTube ne pose pas d'éléments d'écran de fin).
const SubscribePill: React.FC<{delay: number; size?: number}> = ({delay, size = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay * fps, fps, config: {damping: 14, stiffness: 120}});
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps - delay) * 2.4);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 18 * size,
        padding: `${22 * size}px ${46 * size}px`,
        borderRadius: 999,
        background: 'linear-gradient(180deg, #FFE7B0 0%, #F0B54E 55%, #C98A2C 100%)',
        boxShadow: `0 0 ${40 + 30 * pulse}px rgba(240,181,78,${0.35 + 0.25 * pulse}), inset 0 2px 0 rgba(255,255,255,0.6), 0 18px 40px rgba(0,0,0,0.45)`,
        fontFamily: FONT.title,
        fontWeight: 800,
        fontSize: 40 * size,
        letterSpacing: 4 * size,
        color: C.ink,
        opacity: Math.min(1, Math.max(0, p)),
        transform: `scale(${0.7 + 0.3 * p})`,
      }}
    >
      <svg width={34 * size} height={34 * size} viewBox="0 0 24 24">
        <path d="M12 2a6 6 0 0 0-6 6v3.6L4.3 15a1 1 0 0 0 .9 1.5h13.6a1 1 0 0 0 .9-1.5L18 11.6V8a6 6 0 0 0-6-6Zm0 21a3 3 0 0 0 2.8-2H9.2a3 3 0 0 0 2.8 2Z" fill={C.ink} />
      </svg>
      SUBSCRIBE
    </div>
  );
};

// Écran de fin autonome (END_SCREEN_SECONDS), sans rien à régler dans YouTube Studio :
// à gauche la vidéo à voir ensuite (vraie miniature, titre, « lien dans la description ») ;
// à droite le logo et l'appel à l'abonnement. Sans autre vidéo (chaîne neuve) : version centrée.
export const EndScreen: React.FC<{next?: NextVideo | null; duration: number}> = ({next, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = useEnter(0.15);
  const pCard = useEnter(0.45, 22);
  const pTitle = useEnter(0.9);
  const pRight = useEnter(1.3);
  const pHint = useEnter(2.1);
  const out = interpolate(frame, [duration - 0.8 * fps, duration], [0, 1], clamp);
  const float = `translateY(${Math.sin(frame / fps * 1.1) * 8}px)`;
  const draw = interpolate(frame, [1.2 * fps, 2.4 * fps], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const shell: React.CSSProperties = {opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 10}px)` : undefined};
  if (!next) {
    return (
      <AbsoluteFill style={shell}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', ...fade(p)}}>
          <div style={{fontFamily: FONT.display, fontSize: 120, color: C.paper, lineHeight: 1}}>
            Thanks for <GoldText>watching.</GoldText>
          </div>
          <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 38, color: C.paper, opacity: 0.8, marginTop: 28}}>Sources are listed in the description.</div>
        </div>
        <div style={{position: 'absolute', left: 960 - 150, top: 430, opacity: pRight, transform: float}}>
          <LogoCurve size={300} progress={draw} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center'}}>
          <SubscribePill delay={1.6} />
        </div>
      </AbsoluteFill>
    );
  }
  const W = 940;
  const H = W * 9 / 16;
  const push = interpolate(frame, [0, duration], [1.02, 1.09]);
  const sweep = interpolate(frame, [1.1 * fps, 2.3 * fps], [-0.4, 1.4], clamp);
  const play = spring({frame: frame - 1.0 * fps, fps, config: {damping: 12, stiffness: 140}});
  return (
    <AbsoluteFill style={shell}>
      {/* Halo doré derrière la miniature */}
      <div style={{position: 'absolute', left: 60, top: 220, width: W + 160, height: H + 160, background: 'radial-gradient(ellipse at 50% 50%, rgba(240,181,78,0.20) 0%, transparent 65%)', opacity: pCard}} />
      <div style={{position: 'absolute', left: 140, top: 96, ...fade(p)}}>
        <div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 8, color: C.gold}}>THANKS FOR WATCHING</div>
        <div style={{fontFamily: FONT.display, fontSize: 96, color: C.paper, lineHeight: 1.05, marginTop: 10}}>
          Watch this <GoldText>next.</GoldText>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 300,
          width: W,
          height: H,
          overflow: 'hidden',
          ...glass('rgba(240,181,78,0.55)'),
          opacity: Math.min(1, Math.max(0, pCard)),
          transform: `perspective(1600px) translateY(${(1 - pCard) * 60}px) rotateY(${(1 - pCard) * 8}deg)`,
        }}
      >
        {next.thumbnail ? (
          <Img src={staticFile(next.thumbnail)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`}} />
        ) : (
          <AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 40%, ${C.navyLight} 0%, ${C.ink} 75%)`, alignItems: 'center', justifyContent: 'center'}}>
            <LogoCurve size={260} progress={1} />
          </AbsoluteFill>
        )}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${sweep * 100 - 18}%, rgba(255,240,205,0.28) ${sweep * 100}%, transparent ${sweep * 100 + 18}%)`}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(3,6,12,0.55) 100%)'}} />
        {/* Pastille « lecture », en bas à gauche pour ne pas masquer la miniature */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            bottom: 30,
            width: 104,
            height: 104,
            borderRadius: 52,
            background: 'rgba(3,6,12,0.55)',
            border: '3px solid rgba(255,231,176,0.9)',
            boxShadow: '0 0 40px rgba(240,181,78,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: Math.min(1, Math.max(0, play)),
            transform: `scale(${0.5 + 0.5 * play})`,
          }}
        >
          <svg width={44} height={44} viewBox="0 0 24 24" style={{marginLeft: 7}}>
            <path d="M5 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 5 3.5Z" fill={C.goldLight} />
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 300 + H + 34, width: W, ...fade(pTitle)}}>
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 40, lineHeight: 1.15, color: C.paper, textWrap: "balance"} as React.CSSProperties}>{next.title}</div>
        <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: 5, color: C.gold, marginTop: 16, ...fade(pHint)}}>LINK IN THE DESCRIPTION ↓</div>
      </div>
      {/* Colonne de droite : abonnement */}
      <div style={{position: 'absolute', left: 1220, top: 300, width: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        <div style={{opacity: pRight, transform: float}}>
          <LogoCurve size={250} progress={draw} />
        </div>
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: 30, letterSpacing: 7, color: C.paper, marginTop: 6, ...fade(pRight)}}>
          THE COST <GoldText>CURVE</GoldText>
        </div>
        <div style={{marginTop: 44}}>
          <SubscribePill delay={1.8} size={0.95} />
        </div>
        <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 32, lineHeight: 1.35, color: "rgba(244,241,234,0.85)", marginTop: 40, ...fade(pHint)}}>
          New breakdowns every
          <br />
          <span style={{fontWeight: 600, color: C.goldLight}}>Tuesday and Friday.</span>
        </div>
        <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 26, color: C.mute, marginTop: 26, ...fade(pHint)}}>Sources are listed in the description.</div>
      </div>
    </AbsoluteFill>
  );
};

// Schéma des crédits réglementaires : flux de crédits (turquoise) vers le constructeur, flux d'argent (or) vers Tesla.
export const CreditsFlow: React.FC<{title: string; source?: string}> = ({title, source}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const P = useLayout().portrait;
  // Géométrie : paysage (largeur utile 1620) ou portrait (940) ; les deux colonnes et les flux suivent.
  const G = P ? {w: 940, boxA: 0, boxB: 470, left: 300, right: 640, label: 300} : {w: 1620, boxA: 80, boxB: 1080, left: 400, right: 1240, label: 650};
  const pLimit = useEnter(0.3);
  const pA = useEnter(1.2, 18);
  const pB = useEnter(2.6, 18);
  const flow = interpolate(frame, [4.2 * fps, 5.2 * fps], [0, 1], clamp);
  const box = (label: string, sub: string, emissions: number, color: 'brick' | 'teal', p: number, x: number) => {
    const grad = color === 'brick' ? ['#8E2A1D', '#FF8A75', 'rgba(255,106,85,0.45)'] : ['#12695E', '#5FF0DB', 'rgba(60,203,183,0.45)'];
    return (
      <div style={{position: 'absolute', left: x, bottom: 0, width: 470, opacity: Math.min(1, Math.max(0, p))}}>
        <div style={{height: 520, position: 'relative'}}>
          <div style={{position: 'absolute', bottom: 0, left: 120, width: 230, height: emissions * Math.max(0, p), background: `linear-gradient(180deg, ${grad[1]}, ${grad[0]})`, borderRadius: '12px 12px 0 0', boxShadow: `0 0 60px ${grad[2]}, inset 0 2px 0 rgba(255,255,255,0.35)`}} />
        </div>
        <div style={{fontFamily: FONT.title, fontWeight: 800, fontSize: P ? 42 : 44, color: C.paper, textAlign: 'center', marginTop: 22}}>{label}</div>
        <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: P ? 27 : 28, color: C.paper, opacity: 0.75, textAlign: 'center'}}>{sub}</div>
      </div>
    );
  };
  // Particules sur deux arcs : argent de gauche à droite (en haut), crédits de droite à gauche (en bas).
  const arc = (k: number, upper: boolean) => {
    const x0 = upper ? G.left : G.right;
    const x1 = upper ? G.right : G.left;
    const x = x0 + (x1 - x0) * k;
    const y = (upper ? 210 : 300) - Math.sin(k * Math.PI) * (upper ? 110 : -60);
    return {x, y};
  };
  const stream = (upper: boolean, color: string, glyph: string) =>
    Array.from({length: 7}, (_, i) => {
      const k = ((frame / fps) * 0.35 + i / 7) % 1;
      const {x, y} = arc(k, upper);
      const o = flow * Math.sin(k * Math.PI);
      return (
        <div key={`${upper}${i}`} style={{position: 'absolute', left: x - 20, top: y - 24, width: 40, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, color, opacity: o, textShadow: `0 0 18px ${color}`}}>
          {glyph}
        </div>
      );
    });
  return (
    <Frame title={title} source={source}>
      <div style={{position: 'absolute', inset: 0}}>
        {box('Other carmaker', 'Many gasoline vehicles', 440, 'brick', pA, G.boxA)}
        {box('Tesla', 'Electric vehicles only', 40, 'teal', pB, G.boxB)}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 370, borderTop: `3px dashed ${C.gold}`, opacity: pLimit, filter: 'drop-shadow(0 0 8px rgba(240,181,78,0.7))', transformOrigin: 'left', transform: `scaleX(${Math.min(1, pLimit)})`}} />
        <div style={{position: 'absolute', right: 0, bottom: P ? 330 : 386, fontFamily: FONT.mono, fontSize: 26, letterSpacing: 4, color: C.gold, opacity: pLimit}}>EMISSIONS LIMIT</div>
        <svg width={G.w} height={500} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: flow}}>
          <path d={`M ${G.left} 210 Q ${(G.left + G.right) / 2} -10 ${G.right} 210`} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
          <path d={`M ${G.right} 300 Q ${(G.left + G.right) / 2} 420 ${G.left} 300`} fill="none" stroke={C.teal} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
        </svg>
        {stream(true, C.goldLight, '$')}
        {stream(false, '#7FF5E4', '◆')}
        <div style={{position: 'absolute', left: G.label, top: 40, width: 340, textAlign: 'center', fontFamily: FONT.mono, fontSize: 28, letterSpacing: 3, color: C.gold, opacity: flow}}>MONEY →</div>
        <div style={{position: 'absolute', left: G.label, top: 400, width: 340, textAlign: 'center', fontFamily: FONT.mono, fontSize: 28, letterSpacing: 3, color: C.teal, opacity: flow}}>← CREDITS</div>
      </div>
    </Frame>
  );
};
