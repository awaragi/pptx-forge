// Shared design system — primitives, components, and frame functions.
// Call createLib(themeOverrides) to get all functions bound to a merged theme.

const defaultTheme = {
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
    radius:    0.08,
    radiusLg:  0.15,
    borderW:   0.8,
    accentW:   0.07,
    shadow: {
      type:    'outer',
      color:   '1F2937',
      opacity: 0.08,
      blur:    1,
      angle:   45,
      offset:  1,
    },
    shadowDark: {
      type:    'outer',
      color:   '111827',
      opacity: 0.22,
      blur:    2,
      angle:   45,
      offset:  2,
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

export function createLib(overrides = {}) {
  function run(textOrRun, opts = {}) {
    if (typeof textOrRun === 'string') {
      return { text: textOrRun, options: { ...opts } };
    }
    return { text: textOrRun.text, options: { ...textOrRun.options, ...opts } };
  }
  run.bold   = (textOrRun)           => run(textOrRun, { bold: true });
  run.italic = (textOrRun)           => run(textOrRun, { italic: true });
  run.color  = (textOrRun, colorVal) => run(textOrRun, { color: colorVal });

  const theme = {
    ...defaultTheme,
    scheme: { ...defaultTheme.scheme, ...(overrides.scheme ?? {}) },
    color:  { ...defaultTheme.color,  ...(overrides.color  ?? {}) },
    header: { ...defaultTheme.header, ...(overrides.header ?? {}) },
    footer: { ...defaultTheme.footer, ...(overrides.footer ?? {}) },
  };

  // ── Internal helpers ─────────────────────────────────────────────────────────

  function on(name) { return name ? { objectName: name } : {}; }
  function unpack(val, key) {
    if (Array.isArray(val)) return val;
    return (val !== null && typeof val === 'object') ? val[key] : val;
  }

  // ── Primitives ───────────────────────────────────────────────────────────────

  function text(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    const val = unpack(content, 'text');
    slide.addText(val, {
      x, y, w, h,
      fontFace: theme.font.body,
      margin: 0,
      breakLine: false,
      fit: 'shrink',
      ...on(name),
      ...opts,
    });
  }

  function roundRect(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    slide.addShape('roundRect', { x, y, w, h, rectRadius: theme.shape.radius, ...on(name), ...opts });
  }

  function fillRect(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    slide.addShape('rect', { x, y, w, h, ...on(name), ...opts });
  }

  // box.w is the diameter; box.h is ignored
  function circle(slide, box, content, opts = {}, name) {
    const { x, y, w } = box;
    slide.addShape('ellipse', { x, y, w, h: w, ...on(name), ...opts });
  }

  // box.h is ignored; color and lineWidth come from opts
  function hLine(slide, box, content, opts = {}, name) {
    const { x, y, w } = box;
    const { color, lineWidth = theme.shape.borderW } = opts;
    slide.addShape('line', { x, y, w, h: 0, line: { color, width: lineWidth }, ...on(name) });
  }

  // box.w is ignored; color and lineWidth come from opts
  // cx=0 triggers PowerPoint's repair dialog; 0.01" (9144 EMU) is visually zero.
  function vLine(slide, box, content, opts = {}, name) {
    const { x, y, h } = box;
    const { color, lineWidth = theme.shape.borderW } = opts;
    slide.addShape('line', { x, y, w: 0.01, h, line: { color, width: lineWidth }, ...on(name) });
  }

  function bullets(slide, box, items, opts = {}, name) {
    const { x, y, w, h } = box;
    const { color = 'tx2', fontSize = theme.size.small, ...rest } = opts;
    slide.addText(
      items.map((t, i) => ({
        text: t,
        options: { bullet: true, breakLine: i < items.length - 1, color },
      })),
      { x, y, w, h, fontFace: theme.font.body, fontSize, ...rest, ...on(name) },
    );
  }

  // ── Components ───────────────────────────────────────────────────────────────

  function accentBlock(slide, box, { bgColor, border = bgColor, accent, title, titleColor = 'tx1' }, opts = {}, name) {
    const { x, y, w, h } = box;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: bgColor },
      line: { color: border, width: theme.shape.borderW },
    }, `${name}-bg`);
    fillRect(slide, { x, y, w: theme.shape.accentW, h }, undefined, {
      fill: { color: accent },
      line: { color: accent },
    }, `${name}-accent`);
    const ix = x + 0.26, iw = w - 0.36;
    if (title) {
      text(slide, { x: ix, y: y + 0.18, w: iw, h: 0.22 }, title,
        { fontSize: theme.size.h6, bold: true, color: titleColor },
        `${name}-title`);
    }
    return { ix, iw, contentY: y + (title ? 0.50 : 0.18) };
  }

  // box: { x, y, w } — x is left edge, w is total span for the divider line
  function phaseLabel(slide, box, label, opts = {}, name) {
    const { x, y, w } = box;
    const bw = 1.72;
    roundRect(slide, { x, y, w: bw, h: 0.26 }, undefined, {
      fill: { color: 'accent1' },
      line: { color: 'accent1' },
    }, `${name}-badge`);
    text(slide, { x, y, w: bw, h: 0.26 }, label,
      { fontSize: theme.size.phaseLabel, bold: true, color: 'bg1', align: 'center', valign: 'middle' },
      `${name}-label`);
    hLine(slide, { x: x + bw + 0.10, y: y + 0.13, w: w - bw - 0.10 }, undefined,
      { color: 'accent6', lineWidth: theme.shape.borderW },
      `${name}-line`);
  }

  function flowBox(slide, box, { label, highlight }, opts = {}, name) {
    const { x, y, w, h } = box;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: highlight ? 'accent1' : 'bg2' },
      line: { color: highlight ? 'accent1' : 'accent6', width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x, y, w, h }, label,
      {
        fontSize: theme.size.badge,
        bold: highlight,
        color: highlight ? 'bg1' : 'tx2',
        align: 'center',
        valign: 'middle',
      },
      `${name}-lbl`);
  }

  // box: { x, y } — direction controlled via opts.vertical
  function flowArrow(slide, box, content, opts = {}, name) {
    const { x, y } = box;
    const { vertical = false } = opts;
    const [char, aw, ah] = vertical ? ['↓', 0.24, 0.28] : ['→', 0.22, 0.34];
    text(slide, { x, y, w: aw, h: ah }, char,
      { fontSize: 10, bold: true, color: 'accent1', align: 'center' },
      name);
  }

  function smallCard(slide, box, { title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg1' },
      line: { color: 'accent6', width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x: x + 0.16, y: y + 0.14, w: w - 0.24, h: 0.20 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: 'tx1' },
      `${name}-title`);
    if (body) {
      text(slide, { x: x + 0.16, y: y + 0.40, w: w - 0.24, h: h - 0.50 }, body,
        { fontSize: theme.size.xsmall, color: 'accent5' },
        `${name}-body`);
    }
  }

  function artifactCard(slide, box, { filename, purpose, step }, opts = {}, name) {
    const { x, y, w, h } = box;
    const { filenameColor = 'accent1' } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg2' },
      line: { color: 'accent6', width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x: x + 0.16, y: y + 0.14, w: w - 0.24, h: 0.22 }, filename,
      { fontSize: theme.size.small, bold: true, color: filenameColor, fontFace: theme.font.mono },
      `${name}-file`);
    text(slide, { x: x + 0.16, y: y + 0.42, w: w - 0.24, h: h - 0.72 }, purpose,
      { fontSize: theme.size.xsmall, color: 'tx2' },
      `${name}-purpose`);
    text(slide, { x: x + 0.16, y: y + h - 0.28, w: w - 0.24, h: 0.20 }, `→ ${step}`,
      { fontSize: theme.size.badge, bold: true, color: 'accent1' },
      `${name}-step`);
  }

  function benefitCard(slide, box, { title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg1' },
      line: { color: 'accent6', width: theme.shape.borderW },
      shadow: { ...theme.shape.shadow },
    }, `${name}-bg`);
    roundRect(slide, { x, y, w, h: 0.06 }, undefined, {
      rectRadius: 0.03,
      fill: { color: 'accent1' },
      line: { color: 'accent1' },
    }, `${name}-accent`);
    text(slide, { x: x + 0.22, y: y + 0.20, w: w - 0.32, h: 0.24 }, title,
      { fontSize: theme.size.h5, bold: true, color: 'tx1' },
      `${name}-title`);
    text(slide, { x: x + 0.22, y: y + 0.54, w: w - 0.32, h: h - 0.64 }, body,
      { fontSize: theme.size.body, color: 'tx2' },
      `${name}-body`);
  }

  // w and h read from box — no longer hardcoded
  function miniCard(slide, box, { title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    const { titleColor = 'accent1', bodyColor = 'bg1' } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg1', transparency: 88 },
      line: { color: 'bg1', transparency: 80, width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x: x + 0.18, y: y + 0.14, w: w - 0.24, h: 0.2 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: titleColor },
      `${name}-title`);
    text(slide, { x: x + 0.18, y: y + 0.4, w: w - 0.24, h: h - 0.48 }, body,
      { fontSize: theme.size.cardBody, color: bodyColor },
      `${name}-body`);
  }

  // steps is string[] — joined with ' · ' internally
  function phaseBox(slide, box, { label, steps }, opts = {}, name) {
    const { x, y, w, h } = box;
    const stepsText = Array.isArray(steps) ? steps.join(' · ') : steps;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg1' },
      line: { color: 'accent6', width: theme.shape.borderW },
      shadow: { ...theme.shape.shadow },
    }, `${name}-bg`);
    roundRect(slide, { x, y, w, h: 0.06 }, undefined, {
      rectRadius: 0.03,
      fill: { color: 'accent1' },
      line: { color: 'accent1' },
    }, `${name}-accent`);
    text(slide, { x: x + 0.22, y: y + 0.16, w: w - 0.32, h: 0.22 }, label,
      { fontSize: theme.size.sectionLabel, bold: true, color: 'tx1' },
      `${name}-label`);
    text(slide, { x: x + 0.22, y: y + 0.46, w: w - 0.32, h: 0.65 }, stepsText,
      { fontSize: theme.size.body, color: 'tx2' },
      `${name}-steps`);
  }

  // h read from box — no longer hardcoded
  function numberedStep(slide, box, { num, title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg1' },
      line: { color: 'accent6', width: theme.shape.borderW },
      shadow: { ...theme.shape.shadow },
    }, `${name}-bg`);
    circle(slide, { x: x + 0.19, y: y + 0.20, w: 0.28 }, undefined, {
      fill: { color: 'accent1' },
      line: { color: 'accent1' },
    }, `${name}-circle`);
    text(slide, { x: x + 0.19, y: y + 0.265, w: 0.28, h: 0.1 }, String(num),
      { fontSize: 9, bold: true, color: 'bg1', align: 'center' },
      `${name}-num`);
    text(slide, { x: x + 0.50, y: y + 0.25, w: w - 0.65, h: 0.2 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: 'tx1' },
      `${name}-title`);
    text(slide, { x: x + 0.20, y: y + 0.62, w: w - 0.35, h: 0.35 }, body,
      { fontSize: theme.size.badge, color: 'tx2' },
      `${name}-body`);
  }

  // ── Layout ───────────────────────────────────────────────────────────────────

  // box fields default to theme grid values when omitted
  function sectionTitle(slide, box, content, opts = {}, name) {
    const { x = theme.grid.marginX, y = theme.grid.contentTop, w = theme.grid.contentW, h = 0.34 } = box ?? {};
    const { fontSize = theme.size.h2, color = 'tx1', ...rest } = opts;
    text(slide, { x, y, w, h }, content, { fontSize, bold: true, color, ...rest }, name);
  }

  // box: { x, y, w, h? } — h defaults to 0.44 when not provided in box
  function darkPanelHeader(slide, box, { title, subtitle }, opts = {}, name) {
    const { x, y, w, h: boxH = 0.44 } = box;
    const {
      bgColor = 'tx1',
      borderColor,
      titleColor = 'accent1',
      subtitleColor = 'bg1',
      titleW = 1.60,
    } = opts;
    const h = boxH;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: bgColor },
      line: { color: borderColor ?? bgColor },
    }, `${name}-bg`);
    const hasSub = subtitle != null && subtitle !== '';
    const tW = hasSub ? titleW : w - 0.30;
    text(slide, { x: x + 0.22, y, w: tW, h }, title,
      { fontSize: theme.size.h4, bold: true, color: titleColor, valign: 'middle' },
      `${name}-title`);
    if (hasSub) {
      text(slide, { x: x + 0.22 + tW + 0.06, y, w: w - tW - 0.40, h }, subtitle,
        { fontSize: theme.size.small, italic: true, color: subtitleColor, valign: 'middle' },
        `${name}-subtitle`);
    }
  }

  // box: { x, y, h } — y1 = box.y, y2 = box.y + box.h, x = box.x
  function labeledDivider(slide, box, label, opts = {}, name) {
    const { x, y: y1, h } = box;
    const y2 = y1 + h;
    const {
      color = 'accent1',
      lineWidth = 1.5,
      badgeW = 1.20,
      badgeH = 0.24,
      gap = 0.10,
    } = opts;
    const midY = y1 + (y2 - y1) / 2 - badgeH / 2;
    const bx = x - badgeW / 2;
    vLine(slide, { x, y: y1, h: midY - y1 - gap }, undefined, { color, lineWidth }, `${name}-top`);
    roundRect(slide, { x: bx, y: midY, w: badgeW, h: badgeH }, undefined,
      { fill: { color }, line: { color } }, `${name}-badge`);
    text(slide, { x: bx, y: midY, w: badgeW, h: badgeH }, label,
      { fontSize: theme.size.caption, bold: true, color: 'bg1', align: 'center', valign: 'middle' },
      `${name}-badge-txt`);
    vLine(slide, { x, y: midY + badgeH + gap, h: y2 - (midY + badgeH + gap) }, undefined,
      { color, lineWidth }, `${name}-bot`);
  }

  function calloutBanner(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      bgColor = 'tx1',
      accent = 'accent1',
      textColor = 'bg1',
      fontSize = theme.size.bodyLg,
      italic = true,
      bold = true,
      align = 'center',
    } = opts;
    const val = unpack(content, 'text');
    roundRect(slide, { x, y, w, h }, undefined, { fill: { color: bgColor }, line: { color: bgColor } }, `${name}-bg`);
    fillRect(slide, { x, y, w: theme.shape.accentW, h }, undefined, { fill: { color: accent }, line: { color: accent } }, `${name}-accent`);
    text(slide, { x: x + 0.26, y, w: w - 0.36, h }, val,
      { fontSize, bold, italic, color: textColor, valign: 'middle', align },
      `${name}-text`);
  }

  // box comes before content (text) in this signature
  function pullQuote(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      color = 'accent1',
      fontSize = theme.size.pullQuote,
      italic = true,
      bold = false,
      align = 'left',
    } = opts;
    const val = unpack(content, 'text');
    text(slide, { x, y, w, h }, val, { fontSize, italic, bold, color, align }, name);
  }

  // ── Frame functions ──────────────────────────────────────────────────────────

  // box is ignored — renders at fixed position; pass undefined
  function border(slide, box, opts = {}, name) {
    roundRect(slide, { x: 0.12, y: 0.12, w: 13.09, h: 7.26 }, undefined, {
      fill: { color: 'bg1', transparency: 100 },
      line: { color: 'accent6', width: theme.shape.borderW },
    }, name);
  }

  // box is ignored — renders at fixed position; pass undefined
  // name is a slide-level prefix (e.g. 's01'); sub-element names are derived from it
  function slideHeader(slide, box, opts = {}, name) {
    const pfx = name ?? 'header';
    text(slide, { x: theme.grid.marginX, y: 0.42, w: 5.5, h: 0.25 }, theme.header.wordmark,
      { fontSize: theme.size.sectionLabel, bold: true, color: 'accent5', charSpace: 1.4 },
      `${pfx}-header-wordmark`);
    roundRect(slide, { x: 11.65, y: 0.31, w: 1.0, h: 0.36 }, undefined, {
      rectRadius: theme.shape.radiusLg,
      fill: { color: 'accent1' },
      line: { color: 'accent1' },
    }, `${pfx}-header-badge`);
    text(slide, { x: 11.65, y: 0.405, w: 1.0, h: 0.17 }, theme.header.badge,
      { fontSize: theme.size.sectionLabel, bold: true, color: 'bg1', align: 'center' },
      `${pfx}-header-badge-text`);
  }

  // box is ignored — renders at fixed position; pass undefined
  function slideFooter(slide, box, opts = {}, name) {
    const pfx = name ?? 'footer';
    hLine(slide, { x: theme.grid.marginX, y: theme.grid.footerY, w: theme.grid.contentW }, undefined,
      { color: 'accent6', lineWidth: theme.shape.borderW },
      `${pfx}-footer-rule`);
    text(slide, { x: theme.grid.marginX, y: 7.31, w: 5.5, h: 0.12 }, theme.footer.left,
      { fontSize: theme.size.caption, color: 'accent5' },
      `${pfx}-footer-left`);
    text(slide, { x: 7.9, y: 7.31, w: 4.7, h: 0.12 }, theme.footer.right,
      { fontSize: theme.size.caption, color: 'accent5', align: 'right' },
      `${pfx}-footer-right`);
  }

  return {
    theme,
    run,
    prim:   { text, roundRect, fillRect, circle, hLine, vLine, bullets },
    comp:   { accentBlock, phaseLabel, flowBox, flowArrow, smallCard, artifactCard, benefitCard, miniCard, phaseBox, numberedStep },
    layout: { sectionTitle, darkPanelHeader, labeledDivider, calloutBanner, pullQuote },
    frame:  { border, slideHeader, slideFooter },
  };
}
