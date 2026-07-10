// Theme defaults and deep-merge utility.
// Import into lib.js; do not import directly in slide files.

export const defaultTheme = {
  // 10 PowerPoint theme slot hex defaults — patched into ppt/theme/theme1.xml by compile.js
  scheme: {
    dk1:     '111827', // Dark 1
    lt1:     'FFFFFF', // Light 1
    dk2:     '374151', // Dark 2
    lt2:     'F9FAFB', // Light 2
    accent1: '86BC25', // Accent 1
    accent2: 'EF4444', // Accent 2
    accent3: 'F59E0B', // Accent 3
    accent4: '5B9BD5', // Accent 4
    accent5: '70AD47', // Accent 5
    accent6: 'A5A5A5', // Accent 6
  },

  // Workspace-defined semantic color names — workspaces populate this in their theme.color.
  color: {},

  font: {
    body: 'Arial',
    mono: 'Courier New',
  },

  size: {
    h1: 28, h2: 22, h3: 15, h4: 13, h5: 12, h6: 11,
    bodyLg: 11.5, body: 10, small: 9.5, xsmall: 8.6,
    sectionLabel: 10.5, phaseLabel: 8.0, cardTitle: 10.3,
    cardBody: 8.6, badge: 8.5, caption: 7.8, pullQuote: 13.5,
  },

  grid: {
    slideW:        13.333,
    slideH:         7.5,
    marginX:        0.73,
    contentW:      11.87,
    colRight:       7.18,
    colLeftW:       5.85,
    colRightW:      5.42,
    contentTop:     0.88,
    contentBottom:  6.86,
    footerY:        7.18,
  },

  shape: {
    radius:  0.08,
    borderW: 0.8,

    card: {
      bgColor:     'bg1',
      borderColor: 'accent6',
      accentColor: 'accent1',
      titleColor:  'tx1',
      bodyColor:   'tx2',
      shadow: {
        type:    'outer',
        color:   '1F2937',
        opacity: 0.08,
        blur:    1,
        angle:   45,
        offset:  1,
      },
    },

    // renamed from artifactCard
    fileCard: {
      bgColor:       'bg2',
      borderColor:   'accent6',
      filenameColor: 'accent1',
      purposeColor:  'tx2',
      stepColor:     'accent1',
    },

    // renamed from miniCard
    overlayCard: {
      titleColor: 'accent1',
      bodyColor:  'bg1',
    },

    phaseLabel: {
      badgeColor:     'accent1',
      badgeTextColor: 'bg1',
      lineColor:      'accent6',
    },

    flowBox: {
      bgColor:            'bg2',
      borderColor:        'accent6',
      textColor:          'tx2',
      highlightBgColor:   'accent1',
      highlightTextColor: 'bg1',
    },

    flowArrow: {
      color: 'accent1',
    },

    divider: {
      color:          'accent1',
      badgeTextColor: 'bg1',
      lineWidth:      1.5,
      badgeW:         1.20,
      badgeH:         0.24,
      gap:            0.10,
    },

    calloutBanner: {
      bgColor:     'tx1',
      accentColor: 'accent1',
      textColor:   'bg1',
      accentW:     0.07,
    },

    darkPanelHeader: {
      bgColor:       'tx1',
      titleColor:    'accent1',
      subtitleColor: 'bg1',
    },

    pullQuote: {
      color: 'accent1',
    },

    sectionTitle: {
      color: 'tx1',
    },

    frame: {
      badgeRadius:     0.15,
      borderColor:     'accent6',
      badgeColor:      'accent1',
      badgeTextColor:  'bg1',
      wordmarkColor:   'accent5',
      footerLineColor: 'accent6',
      footerTextColor: 'accent5',
    },

    // ── New component shape stanzas ────────────────────────────────────────────

    iconStat: {
      valueColor: 'accent1',
      labelColor: 'tx2',
    },

    iconBox: {
      bgColor:     'bg2',
      borderColor: 'accent6',
      iconColor:   'accent1',
      titleColor:  'tx1',
      bodyColor:   'tx2',
    },

    imageCard: {
      imageColor:  'bg2',
      bgColor:     'bg1',
      borderColor: 'accent6',
      titleColor:  'tx1',
      bodyColor:   'tx2',
      shadow: {
        type:    'outer',
        color:   '1F2937',
        opacity: 0.08,
        blur:    1,
        angle:   45,
        offset:  1,
      },
    },

    progressBar: {
      fillColor:  'accent1',
      trackColor: 'bg2',
      labelColor: 'tx2',
      pctColor:   'tx1',
    },

    tagBadge: {
      bgColor:   'accent1',
      textColor: 'bg1',
    },

    dataTable: {
      headerBgColor:   'accent1',
      headerTextColor: 'bg1',
      rowBgColor:      'bg1',
      altBgColor:      'bg2',
      borderColor:     'accent6',
      textColor:       'tx2',
    },

    darkStat: {
      bgColor:     'tx1',
      valueColor:  'accent1',
      labelColor:  'bg1',
      sourceColor: 'accent6',
    },

    teamCard: {
      avatarBgColor:   'accent6',
      avatarTextColor: 'bg1',
    },

    comparisonTable: {
      headerBgColor:   'tx1',
      headerTextColor: 'accent1',
      criteriaColor:   'tx1',
      valueColor:      'tx2',
      borderColor:     'accent6',
    },
  },

  header: {
    wordmark: 'DECK TITLE',
    badge:    'DECK',
  },

  footer: {
    left:  'Deck  |  Subtitle',
    right: 'Tag  •  Tag  •  Tag',
  },
};

export function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    const isPlain = v => v && typeof v === 'object' && !Array.isArray(v);
    result[key] = (isPlain(overrides[key]) && isPlain(defaults[key]))
      ? deepMerge(defaults[key], overrides[key])
      : overrides[key];
  }
  return result;
}

// pptxgenjs only recognizes its own scheme-name enum (tx1/tx2/bg1/bg2/accent1-6) or a
// hex string in color fields — it rejects the raw OOXML slot names dk1/lt1/dk2/lt2 that
// theme.scheme is keyed by, silently falling back to black. dk1/lt1/dk2/lt2 and
// tx1/bg1/tx2/bg2 are the same theme slots under PowerPoint's own role-alias rule, so
// translate the former to the latter wherever a color is actually consumed
// (theme.color, theme.shape) — theme.scheme itself is left alone since its values are
// literal hex, not scheme-name references.
const SCHEME_ROLE_ALIAS = { dk1: 'tx1', lt1: 'bg1', dk2: 'tx2', lt2: 'bg2' };

function resolveSchemeRoleAliases(node) {
  if (typeof node === 'string') return SCHEME_ROLE_ALIAS[node] || node;
  if (Array.isArray(node)) return node.map(resolveSchemeRoleAliases);
  if (node && typeof node === 'object') {
    const out = {};
    for (const key of Object.keys(node)) out[key] = resolveSchemeRoleAliases(node[key]);
    return out;
  }
  return node;
}

export function resolveThemeColors(theme) {
  return {
    ...theme,
    color: resolveSchemeRoleAliases(theme.color),
    shape: resolveSchemeRoleAliases(theme.shape),
  };
}
