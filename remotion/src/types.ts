export type Word = {w: string; s: number; e: number};

export type Segment = {
  id: string;
  chapter: number;
  chapter_title: string;
  text: string;
  start: number;
  end: number;
  words?: Word[]; // Shorts : minutage mot à mot (pipeline/short.py)
};

// Carte de sous-titres d'un Short : unités affichées (mot, ou nombre écrit en chiffres) avec leur minutage.
export type CaptionCard = {start: number; end: number; units: {text: string; s: number; e: number}[]};

export type Timeline = {duration: number; ident: number | null; segments: Segment[]; captions?: CaptionCard[]};

export type Visual = {at: string; after?: string; type: string; bg?: string; props: Record<string, unknown>};

export type VideoProps = {timeline: Timeline; visuals: Visual[]; audio: string; media?: {id: string; file?: string; license?: string; artist?: string}[]; tint?: string; tintRegrade?: string[]};
