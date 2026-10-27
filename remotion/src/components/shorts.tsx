import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AMB, C, FONT, photoTint} from '../theme';
import {colorOf, fade, glass, gradOf, useEnter, useLayout} from './common';
import {IconDraw} from './blocks';
import {gold, LightSweep, Odometer, RevealWords, TechRing} from './fx';
import {Logo, useMedia} from './media';

// Plan de Short « une idée, un chiffre » (type "shot" dans visuals.json) : photo plein cadre sous un voile
// sombre, et au centre de la scène (zone entre l'accroche et les sous-titres) un seul message lisible en
// une seconde sur téléphone : un nombre géant, ou une phrase, ou une grille d'icônes, ou deux moitiés.
// Utilisé seulement par les Shorts dont visuals.json le demande ; les autres types de blocs sont inchangés.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SIDE = 90; // marge latérale (px) : rien de rogné, et rien sous la colonne de boutons Shorts
const WIDTH = 1080 - 2 * SIDE;

type BarPart = {value: number; color?: string; display?: string};
type Bar = {parts: BarPart[]; upto: number; focus?: number; extra?: BarPart; caption?: string; delay?: number};
type Item = {icon: string; label: string; delay?: number; color?: string};
type Half = {icon: string; big: string; label: string; color?: string; delay?: number};

export type ShotProps = {
  photo?: string;
  focus?: string; // cadrage de la photo (object-position)
  dim?: number; // voile sombre sur la photo (0 à 1)
  zoom?: 'in' | 'out';
  logo?: string; // logo en blanc au-dessus du contenu
  kicker?: string;
  icon?: string;
  number?: string; // nombre géant (texte affiché tel quel)
  numberDelay?: number;
  color?: string; // couleur du nombre : gold, teal, slate, paper...
  label?: string;
  sub?: string;
  text?: string; // phrase (mots entre *astérisques* en or)
  bar?: Bar;
  items?: Item[];
  header?: {number: string; label: string; color?: string};
  halves?: Half[];
  image?: string; // photo encadrée (objet, ex. la carte de membre) au-dessus du texte
  source?: string;
  align?: 'center' | 'bottom';
};

// Couleur pleine et halo d'une couleur de la charte (les dégradés suivent la teinte de la vidéo).
const tone = (name = 'gold') => {
  const [lo, hi, halo] = gradOf(name);
  return {lo, hi, halo, solid: colorOf(name)};
};

const numberStyle = (color: string, frame: number, fps: number): React.CSSProperties =>
  color === 'gold' || color === 'amber'
    ? {color: '#FFD27F', textShadow: '0 0 50px rgba(240,181,78,0.55), 0 0 4px rgba(255,231,176,0.5), 0 8px 30px rgba(0,0,0,0.6)'}
    : {color: tone(color).hi, textShadow: `0 0 50px ${tone(color).halo}, 0 8px 30px rgba(0,0,0,0.6)`};

// Taille du nombre : la plus grande qui tient dans la largeur utile (chasse fixe IBM Plex Mono : 0,6 em).
const fitSize = (text: string, max: number, width = WIDTH - 40) => Math.min(max, Math.floor(width / (text.length * 0.6 - 0.02 * text.length)));

const BigNumber: React.FC<{text: string; color: string; delay: number; max?: number}> = ({text, color, delay, max = 300}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay * fps, fps, config: {damping: 14, mass: 0.8, stiffness: 120}});
  const size = fitSize(text, max);
  return (
    <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: -0.02 * size, lineHeight: 1, whiteSpace: 'nowrap', transform: `scale(${0.7 + 0.3 * Math.min(1.05, p)})`, opacity: Math.min(1, p * 1.5)}}>
      <span style={numberStyle(color, frame, fps)}>
        <Odometer text={text} delay={delay} />
      </span>
    </div>
  );
};

// Barre « les 100 $ » : chaque tranche apparaît, la tranche du plan est vive, les autres atténuées ;
// une flèche désigne la tranche du plan (utile pour les tranches très fines).
const MoneyBar: React.FC<Bar> = ({parts, upto, focus = upto, extra, caption, delay = 0.5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const total = parts.reduce((a, b) => a + b.value, 0);
  const W = WIDTH - (extra ? 70 : 0);
  const H = 64;
  const grow = interpolate(frame, [delay * fps, (delay + 0.7) * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const pExtra = spring({frame: frame - (delay + 0.5) * fps, fps, config: {damping: 13, stiffness: 110}});
  let x = 0;
  const segs = parts.map((p, i) => {
    const w = (p.value / total) * W;
    const s = {x, w, part: p, i};
    x += w;
    return s;
  });
  const target = focus === -1 && extra ? {x: W + 10, w: 44} : segs[focus];
  const arrowX = target ? target.x + target.w / 2 : 0;
  const pArrow = spring({frame: frame - (delay + 0.6) * fps, fps, config: {damping: 200}});
  const focusPart = focus === -1 ? extra : parts[focus];
  return (
    <div style={{position: 'relative', width: WIDTH, height: H + 120, ...fade(useEnter(delay - 0.2))}}>
      {/* Flèche et montant au-dessus de la tranche du plan */}
      {target && focusPart ? (
        <div style={{position: 'absolute', left: Math.min(WIDTH - 40, Math.max(40, arrowX)), top: 0, transform: 'translateX(-50%)', opacity: pArrow, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `20px solid ${tone(focusPart.color).hi}`, filter: `drop-shadow(0 0 10px ${tone(focusPart.color).halo})`, transform: `translateY(${(1 - pArrow) * -14}px)`}} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, top: 30, width: W, height: H, borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.18)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        {segs.map(({x: sx, w, part, i}) => {
          if (i > upto) return null;
          const t = tone(part.color);
          const on = i === focus;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: sx,
                top: 0,
                height: H,
                width: Math.max(0, Math.min(w, grow * W - sx)),
                background: `linear-gradient(180deg, ${t.hi}, ${t.lo})`,
                opacity: on ? 1 : 0.32,
                boxShadow: on ? `0 0 40px ${t.halo}, inset 0 2px 0 rgba(255,255,255,0.35)` : undefined,
                borderRight: '2px solid rgba(0,0,0,0.5)',
              }}
            />
          );
        })}
      </div>
      {extra ? (
        <div
          style={{
            position: 'absolute',
            left: W + 10,
            top: 30,
            width: 44,
            height: H,
            borderRadius: 12,
            background: `linear-gradient(180deg, ${tone(extra.color).hi}, ${tone(extra.color).lo})`,
            boxShadow: `0 0 40px ${tone(extra.color).halo}`,
            transform: `scale(${Math.max(0, pExtra)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.title,
            fontWeight: 900,
            fontSize: 40,
            color: C.ink,
          }}
        >
          +
        </div>
      ) : null}
      {caption ? (
        <div style={{position: 'absolute', left: 0, width: W, top: 30 + H + 16, display: 'flex', justifyContent: 'center', fontFamily: FONT.mono, fontSize: 32, letterSpacing: 3, color: C.paper, opacity: 0.85}}>
          <span>{caption.toUpperCase()}</span>
        </div>
      ) : null}
    </div>
  );
};

// Grille d'icônes (3 puis 2 par ligne) : chaque tuile arrive quand la narration la nomme.
const IconGrid: React.FC<{items: Item[]}> = ({items}) => {
  const rows = items.length > 3 ? [items.slice(0, 3), items.slice(3)] : [items];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center'}}>
      {rows.map((row, r) => (
        <div key={r} style={{display: 'flex', gap: 24, justifyContent: 'center'}}>
          {row.map((it, i) => (
            <IconTile key={i} item={it} index={r * 3 + i} />
          ))}
        </div>
      ))}
    </div>
  );
};

const IconTile: React.FC<{item: Item; index: number}> = ({item, index}) => {
  const delay = item.delay ?? 0.3 + index * 0.3;
  const p = useEnter(delay, 14);
  const t = tone(item.color ?? 'teal');
  return (
    <div style={{width: 272, height: 250, ...glass(`${t.hi}77`), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: Math.min(1, Math.max(0, p) * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})`}}>
      <IconDraw name={item.icon} size={100} delay={delay} color={t.hi} uid={`grid${index}${item.icon}`} />
      <div style={{fontFamily: FONT.title, fontWeight: 700, fontSize: 38, color: C.paper, textAlign: 'center', lineHeight: 1.1}}>{item.label}</div>
    </div>
  );
};

// Deux moitiés égales d'un même bloc, qui se séparent puis se remplissent chacune à son tour.
const Halves: React.FC<{halves: Half[]; cut?: number}> = ({halves, cut = 0.4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pIn = useEnter(0.1);
  const split = spring({frame: frame - cut * fps, fps, config: {damping: 16, stiffness: 90}});
  const gap = 8 + 28 * split;
  const w = (WIDTH - gap) / 2;
  return (
    <div style={{position: 'relative', width: WIDTH, height: 470, ...fade(pIn)}}>
      {halves.map((h, i) => {
        const t = tone(h.color);
        const d = h.delay ?? cut + 0.4 + i * 0.8;
        const p = useEnter(d, 14);
        const lit = Math.min(1, Math.max(0, p));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              height: 470,
              width: w,
              left: i === 0 ? 0 : w + gap,
              borderRadius: i === 0 ? '26px 8px 8px 26px' : '8px 26px 26px 8px',
              background: `linear-gradient(170deg, ${t.hi}${lit > 0.5 ? '40' : '18'} 0%, ${t.lo}30 100%)`,
              border: `2px solid ${t.hi}${lit > 0.5 ? 'cc' : '44'}`,
              boxShadow: lit > 0.5 ? `0 0 60px ${t.halo}, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div style={{opacity: lit, transform: `translateY(${(1 - p) * 30}px)`}}>
              <IconDraw name={h.icon} size={110} delay={d} color={t.hi} uid={`half${i}${h.icon}`} />
            </div>
            <div style={{fontFamily: FONT.title, fontWeight: 900, fontSize: 92, letterSpacing: -2, lineHeight: 1, opacity: lit, transform: `scale(${0.8 + 0.2 * lit})`, ...(h.color === 'gold' ? gold(frame, fps) : {color: t.hi}), filter: `drop-shadow(0 0 26px ${t.halo})`}}>{h.big}</div>
            <div style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 44, color: C.paper, opacity: lit, textAlign: 'center', lineHeight: 1.1}}>{h.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Source : courte, lisible, en bas de la scène (au-dessus des sous-titres).
const ShotSource: React.FC<{text: string}> = ({text}) => {
  const p = useEnter(0.7);
  const L = useLayout();
  return (
    <div style={{position: 'absolute', left: SIDE, right: SIDE, top: L.top + L.height - 46, display: 'flex', justifyContent: 'center', gap: 14, fontFamily: FONT.mono, fontSize: 30, letterSpacing: 0.5, color: C.paper, opacity: 0.9 * p, textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
      <span style={{color: C.gold, letterSpacing: 3}}>SOURCE</span>
      <span>{text}</span>
    </div>
  );
};

// Photo de fond pleine hauteur : voile sombre uniforme, à peine plus dense en haut (accroche) et tout en bas
// (interface Shorts) ; la photo reste visible derrière les sous-titres.
const ShotPhoto: React.FC<{id: string; dim: number; focus?: string; zoom?: 'in' | 'out'}> = ({id, dim, focus = '50% 50%', zoom = 'in'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = useMedia(id);
  if (!m) return null;
  const t = frame / fps;
  const s = zoom === 'in' ? 1.04 + t * 0.014 : 1.16 - Math.min(0.12, t * 0.014);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img src={m.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${s})`, filter: `saturate(0.85) contrast(1.08) brightness(0.9) ${photoTint(id)}`}} />
      <AbsoluteFill style={{background: `rgba(${AMB.inkRgb},${dim})`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(${AMB.inkRgb},0.55) 0%, transparent 20%, transparent 78%, rgba(${AMB.inkRgb},0.5) 100%)`}} />
      <AbsoluteFill style={{background: AMB.photoGrade, mixBlendMode: 'color'}} />
    </AbsoluteFill>
  );
};

// Photo encadrée qui entre en basculant légèrement (3D), puis flotte.
const Inset: React.FC<{id: string}> = ({id}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = useMedia(id);
  const p = spring({frame: frame - 0.05 * fps, fps, config: {damping: 15, stiffness: 90}});
  if (!m) return null;
  return (
    <div style={{perspective: 1600, opacity: Math.min(1, p * 1.4)}}>
      <Img
        src={m.src}
        style={{
          width: 820,
          height: 520,
          objectFit: 'cover',
          objectPosition: '50% 30%',
          borderRadius: 30,
          border: '2px solid rgba(255,255,255,0.25)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.7), 0 0 80px rgba(240,181,78,0.25)',
          transform: `rotateX(${(1 - p) * 30 + Math.sin(frame / fps) * 2}deg) rotateZ(${-3 + (1 - p) * -6}deg) scale(${0.8 + 0.2 * p})`,
        }}
      />
    </div>
  );
};

export const Shot: React.FC<ShotProps> = ({image, photo, focus, dim = 0.62, zoom, logo, kicker, icon, number, numberDelay = 0.2, color = 'gold', label, sub, text, bar, items, header, halves, source, align = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const pLogo = useEnter(0.05);
  const pKick = useEnter(0.1);
  const pIcon = useEnter(0.15, 16);
  const pLabel = useEnter(numberDelay + 0.25);
  const pSub = useEnter(numberDelay + 0.5);
  const pHeader = useEnter(0.1);
  const t = tone(color);
  const bottomPad = source ? 70 : 20;
  return (
    <AbsoluteFill>
      {photo ? <ShotPhoto id={photo} dim={dim} focus={focus} zoom={zoom} /> : null}
      {/* Voile central : le texte reste lisible quelle que soit la photo */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 38% at 50% 42%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)'}} />
      <LightSweep delay={0.15} strength={0.14} />
      <div
        style={{
          position: 'absolute',
          left: SIDE,
          right: SIDE,
          top: L.top,
          height: L.height - bottomPad,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: align === 'bottom' ? 'flex-end' : 'center',
          textAlign: 'center',
          gap: 26,
        }}
      >
        {logo ? (
          <div style={{...fade(pLogo), marginBottom: 6}}>
            <Logo id={logo} height={86} />
          </div>
        ) : null}
        {image ? <Inset id={image} /> : null}
        {kicker ? (
          <div style={{...fade(pKick), fontFamily: FONT.mono, fontWeight: 600, fontSize: 34, letterSpacing: 7, color: C.gold, textShadow: '0 2px 16px rgba(0,0,0,0.9)'}}>{kicker.toUpperCase()}</div>
        ) : null}
        {icon ? (
          <div style={{position: 'relative', width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', ...fade(pIcon)}}>
            <div style={{position: 'absolute', inset: 18, ...glass(`${t.hi}66`), borderRadius: '50%'}} />
            <TechRing size={190} delay={0.15} color={t.hi} />
            <div style={{transform: `translateY(${Math.sin(frame / fps) * 5}px)`}}>
              <IconDraw name={icon} size={86} delay={0.2} color={t.hi} uid={`shot${icon}${number ?? ''}`} />
            </div>
          </div>
        ) : null}
        {header ? (
          <div style={{display: 'flex', alignItems: 'baseline', gap: 22, ...fade(pHeader)}}>
            <span style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 120, letterSpacing: -4, lineHeight: 1, ...numberStyle(header.color ?? 'gold', frame, fps)}}>{header.number}</span>
            <span style={{fontFamily: FONT.title, fontWeight: 600, fontSize: 44, color: C.paper, textAlign: 'left', lineHeight: 1.1, maxWidth: 380}}>{header.label}</span>
          </div>
        ) : null}
        {number ? <BigNumber text={number} color={color} delay={numberDelay} /> : null}
        {label ? (
          <div style={{...fade(pLabel), fontFamily: FONT.title, fontWeight: 700, fontSize: 58, lineHeight: 1.1, color: C.paper, letterSpacing: -0.5, textShadow: '0 4px 24px rgba(0,0,0,0.8)', marginTop: number ? -6 : 0}}>{label}</div>
        ) : null}
        {sub ? (
          <div style={{...fade(pSub), fontFamily: FONT.title, fontWeight: 400, fontSize: 40, lineHeight: 1.25, color: C.paper, opacity: 0.86 * Math.min(1, Math.max(0, pSub)), maxWidth: 860, textShadow: '0 3px 18px rgba(0,0,0,0.85)'}}>{sub}</div>
        ) : null}
        {text ? (
          <div style={{fontFamily: FONT.display, fontSize: 112, lineHeight: 1.0, color: C.paper, letterSpacing: -1, textShadow: '0 8px 40px rgba(0,0,0,0.75)', maxWidth: WIDTH}}>
            <RevealWords text={text} delay={0.2} stagger={0.08} />
          </div>
        ) : null}
        {items ? <IconGrid items={items} /> : null}
        {halves ? <Halves halves={halves} /> : null}
        {bar ? (
          <div style={{marginTop: 18}}>
            <MoneyBar {...bar} />
          </div>
        ) : null}
      </div>
      {source ? <ShotSource text={source} /> : null}
    </AbsoluteFill>
  );
};
