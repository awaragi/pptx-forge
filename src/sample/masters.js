// Workspace slide-master overrides — copied into every new workspace by `bin/create.js`,
// and used as the browser tool's default masters.js placeholder (see build-browser.js).
// Default export is a factory function, `(theme) => SlideMasterProps[]`, called once per
// compile — a workspace-defined master with a matching title replaces a library default
// wholesale; a new title is added alongside it. Uncomment and edit the example below.
// See INSTRUCTIONS.md ("lib.masters") and lib.d.ts for the full reference.
export default function (theme) {
  return [
    // { title: 'FRAMED', objects: [
    //   // `rect` is always a sharp-cornered rectangle inside a master — pptxgenjs has
    //   // no roundRect variant for master objects (unlike prim.roundRect on a slide).
    //   { rect: { x: theme.shape.borderW / 2, y: theme.shape.borderW / 2,
    //             w: theme.grid.slideW - theme.shape.borderW, h: theme.grid.slideH - theme.shape.borderW,
    //             line: { color: theme.shape.frame.borderColor, width: theme.shape.borderW } } },
    // ] },
  ];
}
