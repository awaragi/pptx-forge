export default {
  // PowerPoint theme slot hex values — injected into ppt/theme/theme1.xml by compile.js.
  // Remove or leave empty to use the library defaults.
  // scheme: {
  //   dk1: '111827', lt1: 'FFFFFF', dk2: '374151', lt2: 'F9FAFB',
  //   accent1: '86BC25',  // primary brand color
  //   accent2: 'EF4444',  // danger / highlight
  //   accent3: 'F59E0B',  // warning
  //   accent4: '5B9BD5',  // link / secondary
  //   accent5: '70AD47',  // subtle text
  //   accent6: 'A5A5A5',  // border grey
  // },

  // Semantic color names used in slide files.
  // Values can be hex strings ('EEF7DF') or scheme-slot shorthands ('accent1', 'tx1', 'bg1', etc.).
  color: {
    primary:    'accent1',
    ink:        'tx1',
    surface:    'bg1',
    bodyText:   'tx2',
    surfaceAlt: 'bg2',
    border:     'accent6',
  },

  // Header text shown in the top bar on every slide.
  header: {
    wordmark: 'MY DECK',
    badge:    'TAG',
  },

  // Footer text shown in the bottom bar on every slide.
  footer: {
    left:  'My Deck  |  Subtitle',
    right: 'Tag  •  Tag  •  Tag',
  },
};
