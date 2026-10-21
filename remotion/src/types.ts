export type Segment = {
  id: string;
  chapter: number;
  chapter_title: string;
  text: string;
  start: number;
  end: number;
};

export type Timeline = {duration: number; ident: number | null; segments: Segment[]};

export type Visual = {at: string; after?: string; type: string; bg?: string; props: Record<string, unknown>};

export type VideoProps = {timeline: Timeline; visuals: Visual[]; audio: string; media?: {id: string; file?: string; license?: string; artist?: string}[]; tint?: string; tintRegrade?: string[]};
