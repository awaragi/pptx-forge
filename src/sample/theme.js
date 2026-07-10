// Workspace theme overrides — copied into every new workspace by `bin/create.js`,
// and used as the browser tool's default theme.js placeholder (see build-browser.js).
// Uncomment and edit any section below to override the library defaults.
// See INSTRUCTIONS.md ("Theme Object") and lib.d.ts for the full reference.
export default {
  // PowerPoint theme slot hex values — injected into ppt/theme/theme1.xml by compile.js.
  // scheme: {
  //   dk1: '111827', lt1: 'FFFFFF', dk2: '374151', lt2: 'F9FAFB',
  //   accent1: '86BC25',  // primary brand color
  //   accent2: 'EF4444',  // danger / highlight
  //   accent3: 'F59E0B',  // warning
  //   accent4: '5B9BD5',  // link / secondary
  //   accent5: '70AD47',  // subtle text
  //   accent6: 'A5A5A5',  // border grey
  // },

  // Semantic color names used in slide files. Values can be hex strings ('EEF7DF')
  // or scheme-slot shorthands: the six accents above, the slot names 'dk1'/'lt1'/'dk2'/'lt2',
  // or their role-alias equivalents 'tx1'/'bg1'/'tx2'/'bg2' — createLib normalizes slot
  // names to role aliases automatically, so either form works (see INSTRUCTIONS.md's
  // "theme.scheme" section for how those resolve).
  // color: {
  //   primary:    'accent1',
  //   danger:     'accent2',
  //   warning:    'accent3',
  //   link:       'accent4',
  //   ink:        'dk1',
  //   surface:    'lt1',
  //   bodyText:   'dk2',
  //   surfaceAlt: 'lt2',
  // },

  // Font faces — reference via theme.font.body / theme.font.mono instead of hardcoding names.
  // font: {
  //   body: 'Arial',
  //   mono: 'Courier New',
  // },

  // Header text shown in the top bar on every slide.
  // header: {
  //   wordmark: 'MY DECK',
  //   badge:    'TAG',
  // },

  // Footer text shown in the bottom bar on every slide.
  // footer: {
  //   left:  'My Deck  |  Subtitle',
  //   right: 'Tag  •  Tag  •  Tag',
  // },

  // Per-component visual defaults (colors, borders, shadows). One example shown below —
  // see INSTRUCTIONS.md's "theme.shape" table or lib.d.ts for the full set of
  // namespaces (card, fileCard, flowBox, divider, progressBar, dataTable, ...).
  // shape: {
  //   card: {
  //     bgColor:     'bg1',
  //     borderColor: 'accent6',
  //     accentColor: 'accent1',
  //   },
  // },
};
