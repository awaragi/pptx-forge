// TypeScript declaration file for lib.js
// Provides IDE autocomplete and type checking for slide files consuming createLib().
// Box shapes are declared inline per function — each function only exposes the
// geometry fields it actually uses, communicating intent to both callers and AI.

// ── Run helpers ───────────────────────────────────────────────────────────────

/** A pptxgenjs text run object produced by the `run` helper. */
export interface RunObject {
  text: string;
  options: Record<string, any>;
}

/** The `run` helper and its shorthand sub-functions. */
export interface RunHelper {
  /** Create a new run from a string, or merge opts onto an existing run. */
  (textOrRun: string | RunObject, opts?: Record<string, any>): RunObject;
  /** Shorthand for `run(textOrRun, { bold: true })`. */
  bold(textOrRun: string | RunObject): RunObject;
  /** Shorthand for `run(textOrRun, { italic: true })`. */
  italic(textOrRun: string | RunObject): RunObject;
  /** Shorthand for `run(textOrRun, { color: colorVal })`. */
  color(textOrRun: string | RunObject, colorVal: string): RunObject;
}

// ── Shared opts interfaces ────────────────────────────────────────────────────

export interface TextOpts {
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  align?: string;
  valign?: string;
  charSpace?: number;
  fontFace?: string;
  fit?: string;
  margin?: number;
  breakLine?: boolean;
  [key: string]: any;
}

export interface LineOpts {
  color?: string;
  lineWidth?: number;
}

export interface CardOpts {
  borderColor?: string;
}

export interface ShadowOpts {
  type?: string;
  color?: string;
  opacity?: number;
  blur?: number;
  angle?: number;
  offset?: number;
}

// ── Content object types ──────────────────────────────────────────────────────

export interface InfoCardContent     { title: string; body?: string; }
export interface FileCardContent     { filename: string; purpose: string; step: string; }
export interface StepBoxContent      { label: string; steps: string[]; }
export interface NumberedStepContent { num: number; title: string; body: string; }
export interface DarkPanelHeaderContent { title: string; subtitle?: string; }
export interface FlowBoxContent      { label: string; highlight?: boolean; }
export interface IconStatContent     { value: string; label: string; icon?: string; }
export interface IconBoxContent      { icon?: string; title: string; body?: string; }
export interface BulletIconItem      { icon: string; text: string; }
export interface ImageCardContent    { image?: string; title: string; body?: string; imageH?: number; }
export interface TwoColumnRowContent { label: string; content: string; }
export interface ProgressBarContent  { value: number; label?: string; showPct?: boolean; }
export interface TagBadgeContent     { label: string; }
export interface ImageHolderContent  { icon?: string; label?: string; }
export interface LabeledSectionContent { title: string; subtitle?: string; }
export interface DataTableContent    { headers: string[]; rows?: string[][]; }
export interface ComparisonTableContent { headers: string[]; rows?: string[][]; }

// ── theme.shape interfaces ────────────────────────────────────────────────────

export interface CardShape {
  bgColor:     string;
  borderColor: string;
  accentColor: string;
  titleColor:  string;
  bodyColor:   string;
  shadow:      ShadowOpts;
}

/** renamed from ArtifactCardShape */
export interface FileCardShape {
  bgColor:       string;
  borderColor:   string;
  filenameColor: string;
  purposeColor:  string;
  stepColor:     string;
}

/** renamed from MiniCardShape */
export interface OverlayCardShape {
  titleColor: string;
  bodyColor:  string;
}

export interface PhaseLabelShape {
  badgeColor:     string;
  badgeTextColor: string;
  lineColor:      string;
}

export interface FlowBoxShape {
  bgColor:            string;
  borderColor:        string;
  textColor:          string;
  highlightBgColor:   string;
  highlightTextColor: string;
}

export interface FlowArrowShape {
  color: string;
}

export interface DividerShape {
  color:          string;
  badgeTextColor: string;
  lineWidth:      number;
  badgeW:         number;
  badgeH:         number;
  gap:            number;
}

export interface CalloutBannerShape {
  bgColor:     string;
  accentColor: string;
  textColor:   string;
  accentW:     number;
}

export interface DarkPanelHeaderShape {
  bgColor:       string;
  titleColor:    string;
  subtitleColor: string;
}

export interface PullQuoteShape {
  color: string;
}

export interface SectionTitleShape {
  color: string;
}

export interface FrameShape {
  badgeRadius:     number;
  borderColor:     string;
  badgeColor:      string;
  badgeTextColor:  string;
  wordmarkColor:   string;
  footerLineColor: string;
  footerTextColor: string;
}

export interface IconStatShape    { valueColor: string; labelColor: string; }
export interface IconBoxShape     { bgColor: string; borderColor: string; iconColor: string; titleColor: string; bodyColor: string; }
export interface ImageCardShape   { imageColor: string; bgColor: string; borderColor: string; titleColor: string; bodyColor: string; shadow: ShadowOpts; }
export interface ProgressBarShape { fillColor: string; trackColor: string; labelColor: string; pctColor: string; }
export interface TagBadgeShape    { bgColor: string; textColor: string; }
export interface DataTableShape   { headerBgColor: string; headerTextColor: string; rowBgColor: string; altBgColor: string; borderColor: string; textColor: string; }
export interface ComparisonTableShape { headerBgColor: string; headerTextColor: string; criteriaColor: string; valueColor: string; borderColor: string; }

export interface ThemeShape {
  radius:          number;
  borderW:         number;
  card:            CardShape;
  fileCard:        FileCardShape;
  overlayCard:     OverlayCardShape;
  phaseLabel:      PhaseLabelShape;
  flowBox:         FlowBoxShape;
  flowArrow:       FlowArrowShape;
  divider:         DividerShape;
  calloutBanner:   CalloutBannerShape;
  darkPanelHeader: DarkPanelHeaderShape;
  pullQuote:       PullQuoteShape;
  sectionTitle:    SectionTitleShape;
  frame:           FrameShape;
  // new component shape stanzas
  iconStat:        IconStatShape;
  iconBox:         IconBoxShape;
  imageCard:       ImageCardShape;
  progressBar:     ProgressBarShape;
  tagBadge:        TagBadgeShape;
  dataTable:       DataTableShape;
  comparisonTable: ComparisonTableShape;
}

// ── Namespace groups ──────────────────────────────────────────────────────────

export interface PrimGroup {
  /** Render text. `box.h` is the text frame height. Pass a `RunObject[]` for mixed styles. */
  text(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    text: string | { text: string } | RunObject[],
    opts?: TextOpts,
    name?: string,
  ): void;

  /** Render a rounded rectangle shape. */
  roundRect(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content?: any,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Render a filled rectangle shape. */
  fillRect(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content?: any,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Render a circle. `box.w` is the diameter; `box.h` is ignored. */
  circle(
    slide: any,
    box: { x: number; y: number; w: number },
    content?: any,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Render a horizontal line. `box.h` is ignored. Color and lineWidth come from opts. */
  hLine(
    slide: any,
    box: { x: number; y: number; w: number },
    content?: any,
    opts?: LineOpts,
    name?: string,
  ): void;

  /** Render a vertical line. `box.w` is ignored. Color and lineWidth come from opts. */
  vLine(
    slide: any,
    box: { x: number; y: number; h: number },
    content?: any,
    opts?: LineOpts,
    name?: string,
  ): void;

  /** Render a bulleted list. `items` is a string array. */
  bullets(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    items: string[],
    opts?: TextOpts,
    name?: string,
  ): void;
}

export interface CompGroup {
  /** Phase label badge + horizontal rule. `box.x` is left edge, `box.w` is total span. */
  phaseLabel(
    slide: any,
    box: { x: number; y: number; w: number },
    label: string,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Flow diagram box with optional highlight styling. */
  flowBox(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: FlowBoxContent,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Flow arrow. Direction controlled via `opts.vertical` (default false = →). */
  flowArrow(
    slide: any,
    box: { x: number; y: number },
    content?: any,
    opts?: { vertical?: boolean } & Record<string, any>,
    name?: string,
  ): void;

  /** Numbered step card. `box.h` sets height. */
  numberedStep(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: NumberedStepContent,
    opts?: CardOpts & Record<string, any>,
    name?: string,
  ): void;

  // ── Renamed components ──────────────────────────────────────────────────────

  /** Info card with title and optional body. (renamed from smallCard) */
  infoCard(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: InfoCardContent,
    opts?: CardOpts & { bodyColor?: string } & Record<string, any>,
    name?: string,
  ): void;

  /** Accent stripe card with title and body. (renamed from benefitCard) */
  accentCard(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: { title: string; body: string },
    opts?: CardOpts & Record<string, any>,
    name?: string,
  ): void;

  /** Semi-transparent overlay card. (renamed from miniCard) */
  overlayCard(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: { title: string; body: string },
    opts?: { titleColor?: string; bodyColor?: string },
    name?: string,
  ): void;

  /** Monospace filename card. (renamed from artifactCard) */
  fileCard(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: FileCardContent,
    opts?: { filenameColor?: string } & Record<string, any>,
    name?: string,
  ): void;

  /** Step box with label and steps array joined with ' · '. (renamed from phaseBox) */
  stepBox(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: StepBoxContent,
    opts?: CardOpts & Record<string, any>,
    name?: string,
  ): void;

  // ── New components ──────────────────────────────────────────────────────────

  /** KPI stat tile — large value in accent color with a small label below. Optional UTF-8 icon above. */
  iconStat(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: IconStatContent,
    opts?: { valueColor?: string; labelColor?: string; fontSize?: number },
    name?: string,
  ): void;

  /** Icon callout card — rounded rect with large centered UTF-8 icon, title, and optional body. */
  iconBox(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: IconBoxContent,
    opts?: { bgColor?: string; borderColor?: string; iconColor?: string; titleColor?: string; bodyColor?: string },
    name?: string,
  ): void;

  /** Icon-prefixed bullet list. Each item is `{ icon, text }`. */
  bulletIconList(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    items: BulletIconItem[],
    opts?: { iconColor?: string; textColor?: string; fontSize?: number },
    name?: string,
  ): void;

  /** Card with emoji image placeholder band at top. User swaps emoji in PPT designer. */
  imageCard(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: ImageCardContent,
    opts?: { imageColor?: string; bgColor?: string; borderColor?: string; titleColor?: string; bodyColor?: string },
    name?: string,
  ): void;

  /** Left label / right content row. Stack for key-value layouts. `opts.splitRatio` defaults to 0.35. */
  twoColumnRow(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: TwoColumnRowContent,
    opts?: { splitRatio?: number; labelColor?: string; contentColor?: string; fontSize?: number },
    name?: string,
  ): void;

  /** Horizontal progress bar. `value` is 0–1. */
  progressBar(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: ProgressBarContent,
    opts?: { fillColor?: string; trackColor?: string; labelColor?: string; pctColor?: string; trackH?: number },
    name?: string,
  ): void;

  /** Small filled rounded-rect pill badge with centered label. */
  tagBadge(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content: TagBadgeContent,
    opts?: { bgColor?: string; textColor?: string; fontSize?: number },
    name?: string,
  ): void;

  /** Auto-distributed horizontal step flow across `box.w`. */
  stepFlow(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    items: FlowBoxContent[],
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Styled placeholder box with centered emoji and label. User swaps in PPT designer. */
  imageHolder(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    content?: ImageHolderContent,
    opts?: { borderColor?: string; iconColor?: string; labelColor?: string },
    name?: string,
  ): void;
}

export interface LayoutGroup {
  /** Section title text. Box fields default to theme grid values when omitted. */
  sectionTitle(
    slide: any,
    box: { x?: number; y?: number; w?: number; h?: number } | undefined | null,
    text: string | { text: string },
    opts?: TextOpts,
    name?: string,
  ): void;

  /** Dark panel header with title and optional subtitle. `box.h` defaults to 0.44. */
  darkPanelHeader(
    slide: any,
    box: { x: number; y: number; w: number; h?: number },
    content: DarkPanelHeaderContent,
    opts?: {
      bgColor?: string;
      borderColor?: string;
      titleColor?: string;
      subtitleColor?: string;
      titleW?: number;
    },
    name?: string,
  ): void;

  /** Vertical divider with a centered label badge. `box.y` = top, `box.y + box.h` = bottom. */
  labeledDivider(
    slide: any,
    box: { x: number; y: number; h: number },
    label: string,
    opts?: LineOpts & { badgeW?: number; badgeH?: number; gap?: number },
    name?: string,
  ): void;

  /** Full-width callout banner with accent stripe. Content accepts string or `{ text }`. */
  calloutBanner(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    text: string | { text: string },
    opts?: {
      bgColor?: string;
      accent?: string;
      textColor?: string;
      fontSize?: number;
      italic?: boolean;
      bold?: boolean;
      align?: string;
    },
    name?: string,
  ): void;

  /** Pull quote text block. Content accepts string or `{ text }`. */
  pullQuote(
    slide: any,
    box: { x: number; y: number; w: number; h: number },
    text: string | { text: string },
    opts?: TextOpts,
    name?: string,
  ): void;

  /** Section title + optional dark panel header in one call. Box fields default to theme grid. */
  labeledSection(
    slide: any,
    box: { x?: number; y?: number; w?: number } | undefined | null,
    content: LabeledSectionContent,
    opts?: { titleH?: number; panelH?: number; gap?: number } & Record<string, any>,
    name?: string,
  ): void;
}

export interface TablesGroup {
  /** Standard table with accent header row and alternating data rows. */
  dataTable(
    slide: any,
    box: { x: number; y: number; w: number; h?: number },
    content: DataTableContent,
    opts?: {
      headerBgColor?: string; headerTextColor?: string;
      rowBgColor?: string; altBgColor?: string;
      borderColor?: string; textColor?: string;
      fontSize?: number; rowH?: number;
    },
    name?: string,
  ): void;

  /** Comparison table — wide criteria column + value columns. Supports UTF-8 symbols as values. */
  comparisonTable(
    slide: any,
    box: { x: number; y: number; w: number; h?: number },
    content: ComparisonTableContent,
    opts?: {
      headerBgColor?: string; headerTextColor?: string;
      criteriaColor?: string; valueColor?: string;
      borderColor?: string; criteriaW?: number;
      fontSize?: number; rowH?: number;
    },
    name?: string,
  ): void;
}

export interface FrameGroup {
  /** Slide border chrome. `box` is ignored — pass `undefined`. */
  border(
    slide: any,
    box: undefined,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Slide header (wordmark + badge). `box` is ignored — pass `undefined`.
   *  `name` is a slide prefix (e.g. `'s01'`); sub-elements are `${name}-header-*`. */
  slideHeader(
    slide: any,
    box: undefined,
    opts?: Record<string, any>,
    name?: string,
  ): void;

  /** Slide footer (rule + left/right text). `box` is ignored — pass `undefined`.
   *  `name` is a slide prefix (e.g. `'s01'`); sub-elements are `${name}-footer-*`. */
  slideFooter(
    slide: any,
    box: undefined,
    opts?: Record<string, any>,
    name?: string,
  ): void;
}

// ── Top-level Lib interface ───────────────────────────────────────────────────

export interface Lib {
  /** Merged theme object — access grid, size, color, font, shape constants. */
  theme: {
    scheme: Record<string, string>;
    color:  Record<string, string>;
    size:   Record<string, number>;
    font:   { body: string; mono: string };
    grid:   Record<string, number>;
    header: { wordmark: string; badge: string };
    footer: { left: string; right: string };
    shape:  ThemeShape;
  };
  /** Rich-text run helper. Use to build styled text runs for `prim.text`. */
  run:    RunHelper;
  prim:   PrimGroup;
  comp:   CompGroup;
  tables: TablesGroup;
  layout: LayoutGroup;
  frame:  FrameGroup;
}

export function createLib(overrides?: Record<string, any>): Lib;
