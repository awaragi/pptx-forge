// Starter slide — replace or duplicate this file to build your deck.
// Full API reference: INSTRUCTIONS.md and lib.d.ts

export default function Slide01_Intro(pptx, lib) {
  const { theme, prim, layout, frame } = lib;
  const { text } = prim;
  const { sectionTitle } = layout;
  const { border, slideHeader, slideFooter } = frame;
  const C = theme.color;
  const G = theme.grid;

  const slide = pptx.addSlide();
  slide.background = { color: C.surface };

  border(slide, undefined, {}, 's01-border');
  slideHeader(slide, undefined, {}, 's01');
  slideFooter(slide, undefined, {}, 's01');

  sectionTitle(slide, null, 'Slide Title', {}, 's01-title');

  text(slide,
    { x: G.marginX, y: 1.4, w: G.contentW, h: 0.5 },
    'Body text goes here. Edit this slide or add new files to slides/ — files are sorted alphabetically.',
    { fontSize: theme.size.body, color: C.bodyText },
    's01-body',
  );
}
