import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, GOLD_TEXT} from '../theme';
import {Source, fade, useEnter} from './common';
import {Kicker, LightSweep, Odometer, RevealWords} from './fx';

// Images de la vidéo (videos/<v>/media.json, copiées dans public/media par le workflow).
export type MediaItem = {id: string; file?: string; license?: string; artist?: string};
export const MediaContext = createContext<Record<string, MediaItem>>({});
export const useMedia = (id?: string) => {
  const all = useContext(MediaContext);
  if (!id) return null;
  const m = all[id];
  if (!m || !m.file) return null;
  return {src: staticFile(m.file.replace(/^media\//, 'media/')), credit: m.artist ? `${m.artist.replace(/\s+/g, ' ').slice(0, 60)} · ${m.license}` : m.license ?? ''};
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Logo en blanc uni (sobre, homogène, sans les couleurs de marque) ou en or métallique (masque).
export const Logo: React.FC<{id: string; height: number; width?: number; color?: 'white' | 'gold' | 'original'; style?: React.CSSProperties}> = ({id, height, width, color = 'white', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = useMedia(id);
  if (!m) return null;
  if (color === 'gold') {
    const k = ((frame % (5 * fps)) / (5 * fps));
    return (
      <div style={{filter: 'drop-shadow(0 0 34px rgba(240,181,78,0.55))', ...style}}>
        <div
          style={{
            width: width ?? height,
            height,
            backgroundImage: GOLD_TEXT,
            backgroundSize: '300% 100%',
            backgroundPosition: `${interpolate(k, [0, 0.4, 1], [100, 0, 0])}% 0`,
            WebkitMaskImage: `url("${m.src}")`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
      </div>
    );
  }
  const filter = color === 'original' ? 'drop-shadow(0 0 24px rgba(255,255,255,0.15))' : 'brightness(0) invert(1) drop-shadow(0 0 24px rgba(255,255,255,0.25))';
  return <Img src={m.src} style={{height, width: width ?? 'auto', objectFit: 'contain', filter, ...style}} />;
};

// Photo plein cadre avec lent travelling (Ken Burns) et étalonnage sombre « bleu nuit + or ».
export const PhotoLayer: React.FC<{id: string; dim?: number; blur?: number; zoom?: 'in' | 'out'; focus?: string}> = ({id, dim = 0.55, blur = 0, zoom = 'in', focus = '50% 50%'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = useMedia(id);
  if (!m) return null;
  const t = frame / fps;
  const s = zoom === 'in' ? 1.06 + t * 0.012 : 1.2 - Math.min(0.14, t * 0.012);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={m.src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: focus,
          transform: `scale(${s}) translateX(${Math.sin(t / 6) * 10}px)`,
          filter: `saturate(0.8) contrast(1.1) brightness(0.85)${blur ? ` blur(${blur}px)` : ''}`,
        }}
      />
      {/* Étalonnage : ombres bleu nuit, voile sombre, lumière dorée en haut */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(3,6,12,${dim * 0.7}) 0%, rgba(3,6,12,${dim * 0.5}) 40%, rgba(3,6,12,${Math.min(1, dim + 0.3)}) 100%)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(3,6,12,0.85) 0%, rgba(3,6,12,0.35) 45%, transparent 75%)', opacity: dim > 0.5 ? 1 : 0.7}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 75% 0%, rgba(240,181,78,0.18) 0%, transparent 55%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'rgba(20,40,80,0.25)', mixBlendMode: 'color'}} />
    </AbsoluteFill>
  );
};

export const PhotoCredit: React.FC<{id: string}> = ({id}) => {
  const m = useMedia(id);
  const p = useEnter(1);
  if (!m || !m.credit) return null;
  return (
    <div style={{position: 'absolute', right: 150, bottom: 62, fontFamily: FONT.mono, fontSize: 16, color: C.mute, opacity: 0.7 * p, letterSpacing: 0.5}}>
      PHOTO {m.credit}
    </div>
  );
};

// Plan photo : image plein cadre + phrase, logo éventuel.
export const Photo: React.FC<{photo: string; text?: string; kicker?: string; sub?: string; logo?: string; focus?: string; zoom?: 'in' | 'out'; source?: string}> = ({
  photo,
  text,
  kicker,
  sub,
  logo,
  focus,
  zoom,
  source,
}) => {
  const words = (text ?? '').replace(/\*/g, '').split(/\s+/).length;
  const pSub = useEnter(0.4 + words * 0.07);
  const pLogo = useEnter(0.1);
  return (
    <AbsoluteFill>
      <PhotoLayer id={photo} focus={focus} zoom={zoom} />
      <LightSweep delay={0.1} strength={0.18} />
      <div style={{position: 'absolute', left: 150, bottom: 190, maxWidth: 1300}}>
        {logo ? (
          <div style={{marginBottom: 40, ...fade(pLogo)}}>
            <Logo id={logo} height={90} />
          </div>
        ) : null}
        {kicker ? (
          <div style={{marginBottom: 30}}>
            <Kicker text={kicker} />
          </div>
        ) : null}
        {text ? (
          <div style={{fontFamily: FONT.display, fontSize: 124, lineHeight: 1.02, color: C.paper, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>
            <RevealWords text={text} delay={0.2} stagger={0.075} />
          </div>
        ) : null}
        {sub ? <div style={{...fade(pSub), fontFamily: FONT.title, fontWeight: 300, fontSize: 40, color: C.paper, opacity: 0.85 * Math.min(1, pSub), marginTop: 30}}>{sub}</div> : null}
      </div>
      <PhotoCredit id={photo} />
      {source ? <Source text={source} /> : null}
    </AbsoluteFill>
  );
};

// Ouverture : le « T » de Tesla se révèle dans la lumière au-dessus d'une Tesla, puis le chiffre.
export const Hero: React.FC<{photo: string; logo: string; wordmark?: string; number?: string; label?: string; kicker?: string; numberAt?: number; source?: string}> = ({
  photo,
  logo,
  wordmark,
  number,
  label,
  kicker,
  numberAt = 2.6,
  source,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame, [0.2 * fps, 2.2 * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const photoIn = interpolate(frame, [0, 1.6 * fps], [0, 1], clamp);
  const toSide = spring({frame: frame - numberAt * fps, fps, config: {damping: 200}});
  const pNum = spring({frame: frame - (numberAt + 0.3) * fps, fps, config: {damping: 200}});
  const glow = 0.5 + 0.5 * Math.sin(frame / fps * 1.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: photoIn}}>
        <PhotoLayer id={photo} dim={0.72} zoom="out" focus="50% 60%" />
      </AbsoluteFill>
      <LightSweep delay={0.9} strength={0.35} />
      <div
        style={{
          position: 'absolute',
          left: interpolate(toSide, [0, 1], [960, 470]),
          top: 470,
          transform: `translate(-50%, -50%) scale(${interpolate(reveal, [0, 1], [1.35, 1]) * interpolate(toSide, [0, 1], [1, 0.82])})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          opacity: reveal,
          filter: reveal < 0.97 ? `blur(${(1 - reveal) * 18}px)` : undefined,
        }}
      >
        <div style={{position: 'relative'}}>
          <div style={{position: 'absolute', inset: -120, borderRadius: '50%', background: `radial-gradient(circle, rgba(240,181,78,${0.22 + 0.1 * glow}) 0%, transparent 65%)`}} />
          <Logo id={logo} height={330} width={330} color="gold" />
        </div>
        {wordmark ? <Logo id={wordmark} height={44} style={{opacity: 0.9}} /> : null}
      </div>
      {number ? (
        <div style={{position: 'absolute', left: 900, top: 330, ...fade(pNum)}}>
          {kicker ? <Kicker text={kicker} delay={numberAt + 0.2} /> : null}
          <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 220, letterSpacing: -6, color: '#6FF2DF', textShadow: '0 0 50px rgba(60,203,183,0.5)', marginTop: 10}}>
            <Odometer text={number} delay={numberAt + 0.35} />
          </div>
          {label ? <div style={{fontFamily: FONT.title, fontWeight: 300, fontSize: 46, color: C.paper, marginTop: 10}}>{label}</div> : null}
        </div>
      ) : null}
      <PhotoCredit id={photo} />
      {source ? <Source text={source} /> : null}
    </AbsoluteFill>
  );
};
