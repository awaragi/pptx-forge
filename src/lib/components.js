// Component rendering functions — composed from primitives.
// Export makeComponents(theme, prim) to get the comp group.

import { on } from './primitives.js';

export function makeComponents(theme, prim) {
  const { text, roundRect, fillRect, circle, hLine, vLine } = prim;

  // ── Existing components (5 renamed) ─────────────────────────────────────────

  // box: { x, y, w } — x is left edge, w is total span for the divider line
  function phaseLabel(slide, box, label, opts = {}, name) {
    const { x, y, w } = box;
    const bw = 1.72;
    roundRect(slide, { x, y, w: bw, h: 0.26 }, undefined, {
      fill: { color: theme.shape.phaseLabel.badgeColor },
      line: { color: theme.shape.phaseLabel.badgeColor },
    }, `${name}-badge`);
    text(slide, { x, y, w: bw, h: 0.26 }, label,
      { fontSize: theme.size.phaseLabel, bold: true, color: theme.shape.phaseLabel.badgeTextColor, align: 'center', valign: 'middle' },
      `${name}-label`);
    hLine(slide, { x: x + bw + 0.10, y: y + 0.13, w: w - bw - 0.10 }, undefined,
      { color: theme.shape.phaseLabel.lineColor, lineWidth: theme.shape.borderW },
      `${name}-line`);
  }

  function flowBox(slide, box, { label, highlight }, opts = {}, name) {
    const { x, y, w, h } = box;
    const fb = theme.shape.flowBox;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: highlight ? fb.highlightBgColor : fb.bgColor },
      line: { color: highlight ? fb.highlightBgColor : fb.borderColor, width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x, y, w, h }, label,
      {
        fontSize: theme.size.badge,
        bold: highlight,
        color: highlight ? fb.highlightTextColor : fb.textColor,
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
      { fontSize: 10, bold: true, color: theme.shape.flowArrow.color, align: 'center' },
      name);
  }

  // renamed: smallCard → infoCard
  function infoCard(slide, box, { title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    const { borderColor = theme.shape.card.borderColor, bodyColor = theme.shape.card.bodyColor } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: theme.shape.card.bgColor },
      line: { color: borderColor, width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x: x + 0.16, y: y + 0.14, w: w - 0.24, h: 0.20 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: theme.shape.card.titleColor },
      `${name}-title`);
    if (body) {
      text(slide, { x: x + 0.16, y: y + 0.40, w: w - 0.24, h: h - 0.50 }, body,
        { fontSize: theme.size.xsmall, color: bodyColor },
        `${name}-body`);
    }
  }

  // renamed: artifactCard → fileCard
  function fileCard(slide, box, { filename, purpose, step }, opts = {}, name) {
    const { x, y, w, h } = box;
    const fc = theme.shape.fileCard;
    const { filenameColor = fc.filenameColor } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: fc.bgColor },
      line: { color: fc.borderColor, width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x: x + 0.16, y: y + 0.14, w: w - 0.24, h: 0.22 }, filename,
      { fontSize: theme.size.small, bold: true, color: filenameColor, fontFace: theme.font.mono },
      `${name}-file`);
    text(slide, { x: x + 0.16, y: y + 0.42, w: w - 0.24, h: h - 0.72 }, purpose,
      { fontSize: theme.size.xsmall, color: fc.purposeColor },
      `${name}-purpose`);
    text(slide, { x: x + 0.16, y: y + h - 0.28, w: w - 0.24, h: 0.20 }, `→ ${step}`,
      { fontSize: theme.size.badge, bold: true, color: fc.stepColor },
      `${name}-step`);
  }

  // renamed: benefitCard → accentCard
  function accentCard(slide, box, { title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    const { borderColor = theme.shape.card.borderColor } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: theme.shape.card.bgColor },
      line: { color: borderColor, width: theme.shape.borderW },
      shadow: { ...theme.shape.card.shadow },
    }, `${name}-bg`);
    roundRect(slide, { x, y, w, h: 0.06 }, undefined, {
      rectRadius: 0.03,
      fill: { color: theme.shape.card.accentColor },
      line: { color: theme.shape.card.accentColor },
    }, `${name}-accent`);
    text(slide, { x: x + 0.22, y: y + 0.20, w: w - 0.32, h: 0.24 }, title,
      { fontSize: theme.size.h5, bold: true, color: theme.shape.card.titleColor },
      `${name}-title`);
    text(slide, { x: x + 0.22, y: y + 0.54, w: w - 0.32, h: h - 0.64 }, body,
      { fontSize: theme.size.body, color: theme.shape.card.bodyColor },
      `${name}-body`);
  }

  // renamed: miniCard → overlayCard
  function overlayCard(slide, box, { title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    const oc = theme.shape.overlayCard;
    const { titleColor = oc.titleColor, bodyColor = oc.bodyColor } = opts;
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

  // renamed: phaseBox → stepBox
  // steps is string[] — joined with ' · ' internally
  function stepBox(slide, box, { label, steps }, opts = {}, name) {
    const { x, y, w, h } = box;
    const { borderColor = theme.shape.card.borderColor } = opts;
    const stepsText = Array.isArray(steps) ? steps.join(' · ') : steps;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: theme.shape.card.bgColor },
      line: { color: borderColor, width: theme.shape.borderW },
      shadow: { ...theme.shape.card.shadow },
    }, `${name}-bg`);
    roundRect(slide, { x, y, w, h: 0.06 }, undefined, {
      rectRadius: 0.03,
      fill: { color: theme.shape.card.accentColor },
      line: { color: theme.shape.card.accentColor },
    }, `${name}-accent`);
    text(slide, { x: x + 0.22, y: y + 0.16, w: w - 0.32, h: 0.22 }, label,
      { fontSize: theme.size.sectionLabel, bold: true, color: theme.shape.card.titleColor },
      `${name}-label`);
    text(slide, { x: x + 0.22, y: y + 0.46, w: w - 0.32, h: 0.65 }, stepsText,
      { fontSize: theme.size.body, color: theme.shape.card.bodyColor },
      `${name}-steps`);
  }

  // h read from box — no longer hardcoded
  function numberedStep(slide, box, { num, title, body }, opts = {}, name) {
    const { x, y, w, h } = box;
    const { borderColor = theme.shape.card.borderColor, bodyColor = theme.shape.card.bodyColor } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: theme.shape.card.bgColor },
      line: { color: borderColor, width: theme.shape.borderW },
      shadow: { ...theme.shape.card.shadow },
    }, `${name}-bg`);
    circle(slide, { x: x + 0.19, y: y + 0.20, w: 0.28 }, undefined, {
      fill: { color: theme.shape.card.accentColor },
      line: { color: theme.shape.card.accentColor },
    }, `${name}-circle`);
    text(slide, { x: x + 0.19, y: y + 0.265, w: 0.28, h: 0.1 }, String(num),
      { fontSize: 9, bold: true, color: theme.shape.card.bgColor, align: 'center' },
      `${name}-num`);
    text(slide, { x: x + 0.50, y: y + 0.25, w: w - 0.65, h: 0.2 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: theme.shape.card.titleColor },
      `${name}-title`);
    text(slide, { x: x + 0.20, y: y + 0.62, w: w - 0.35, h: 0.35 }, body,
      { fontSize: theme.size.badge, color: bodyColor },
      `${name}-body`);
  }

  // ── New components ───────────────────────────────────────────────────────────

  // iconStat — large value + label KPI tile; optional UTF-8 icon above value
  function iconStat(slide, box, { value, label, icon } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const is = theme.shape.iconStat;
    const {
      valueColor = is.valueColor,
      labelColor = is.labelColor,
      fontSize = theme.size.h1,
    } = opts;
    const iconH = h * 0.28;
    const valueH = h * 0.44;
    const labelH = h * 0.22;
    let valueY = y + (h - valueH - labelH) / 2;
    if (icon) {
      text(slide, { x, y: y + (h - iconH - valueH - labelH) / 2, w, h: iconH }, icon,
        { fontSize: theme.size.h3, color: valueColor, align: 'center', valign: 'middle' },
        `${name}-icon`);
      valueY = y + (h - iconH - valueH - labelH) / 2 + iconH;
    }
    text(slide, { x, y: valueY, w, h: valueH }, value,
      { fontSize, bold: true, color: valueColor, align: 'center', valign: 'middle' },
      `${name}-value`);
    text(slide, { x, y: valueY + valueH, w, h: labelH }, label,
      { fontSize: theme.size.small, color: labelColor, align: 'center', valign: 'middle' },
      `${name}-label`);
  }

  // iconBox — rounded-rect card with large centered UTF-8 icon + title + optional body
  function iconBox(slide, box, { icon = '★', title, body } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const ib = theme.shape.iconBox;
    const {
      bgColor     = ib.bgColor,
      borderColor = ib.borderColor,
      iconColor   = ib.iconColor,
      titleColor  = ib.titleColor,
      bodyColor   = ib.bodyColor,
    } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: bgColor },
      line: { color: borderColor, width: theme.shape.borderW },
    }, `${name}-bg`);
    text(slide, { x, y: y + 0.18, w, h: 0.44 }, icon,
      { fontSize: theme.size.h2, color: iconColor, align: 'center', valign: 'middle' },
      `${name}-icon`);
    text(slide, { x: x + 0.14, y: y + 0.64, w: w - 0.28, h: 0.24 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: titleColor, align: 'center' },
      `${name}-title`);
    if (body) {
      text(slide, { x: x + 0.14, y: y + 0.94, w: w - 0.28, h: h - 1.06 }, body,
        { fontSize: theme.size.xsmall, color: bodyColor, align: 'center' },
        `${name}-body`);
    }
  }

  // bulletIconList — icon-prefixed bullet lines; items: [{ icon, text }]
  function bulletIconList(slide, box, items, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      iconColor = theme.shape.iconBox.iconColor,
      textColor = 'tx2',
      fontSize  = theme.size.small,
    } = opts;
    const lineH = h / items.length;
    items.forEach(({ icon, text: t }, i) => {
      slide.addText(
        [
          { text: `${icon}  `, options: { color: iconColor, bold: true } },
          { text: t,           options: { color: textColor } },
        ],
        { x, y: y + i * lineH, w, h: lineH, fontFace: theme.font.body, fontSize, valign: 'middle', ...on(`${name}-${i}`) },
      );
    });
  }

  // imageCard — card with emoji "image" band at top; user swaps emoji for real image in PPT
  function imageCard(slide, box, { image = '🖼', title, body, imageH = 1.0 } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const ic = theme.shape.imageCard;
    const {
      imageColor  = ic.imageColor,
      bgColor     = ic.bgColor,
      borderColor = ic.borderColor,
      titleColor  = ic.titleColor,
      bodyColor   = ic.bodyColor,
    } = opts;
    // card background
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: bgColor },
      line: { color: borderColor, width: theme.shape.borderW },
      shadow: { ...ic.shadow },
    }, `${name}-bg`);
    // image band (sits on top of bg inside the card)
    fillRect(slide, { x, y, w, h: imageH }, undefined, {
      fill: { color: imageColor },
      line: { color: imageColor },
    }, `${name}-img-bg`);
    text(slide, { x, y, w, h: imageH }, image,
      { fontSize: theme.size.h2, color: 'bg1', align: 'center', valign: 'middle' },
      `${name}-img`);
    // content below image band
    text(slide, { x: x + 0.16, y: y + imageH + 0.12, w: w - 0.32, h: 0.24 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: titleColor },
      `${name}-title`);
    if (body) {
      text(slide, { x: x + 0.16, y: y + imageH + 0.42, w: w - 0.32, h: h - imageH - 0.52 }, body,
        { fontSize: theme.size.xsmall, color: bodyColor },
        `${name}-body`);
    }
  }

  // twoColumnRow — left label / right content side by side; stack to build key-value tables
  function twoColumnRow(slide, box, { label, content }, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      splitRatio   = 0.35,
      labelColor   = 'tx1',
      contentColor = 'tx2',
      fontSize     = theme.size.body,
    } = opts;
    const lw = w * splitRatio;
    const rw = w - lw;
    text(slide, { x, y, w: lw, h }, label,
      { fontSize, bold: true, color: labelColor, valign: 'middle' },
      `${name}-label`);
    text(slide, { x: x + lw, y, w: rw, h }, content,
      { fontSize, color: contentColor, valign: 'middle' },
      `${name}-content`);
  }

  // progressBar — horizontal fill bar; value is 0–1
  function progressBar(slide, box, { value, label, showPct } = {}, opts = {}, name) {
    const { x, y, w } = box;
    const pb = theme.shape.progressBar;
    const {
      fillColor  = pb.fillColor,
      trackColor = pb.trackColor,
      labelColor = pb.labelColor,
      pctColor   = pb.pctColor,
      trackH     = 0.12,
    } = opts;
    const clampedVal = Math.min(1, Math.max(0, value ?? 0));
    const fillW = Math.max(0.01, w * clampedVal);
    // track background
    roundRect(slide, { x, y, w, h: trackH }, undefined, {
      fill: { color: trackColor },
      line: { color: trackColor },
    }, `${name}-track`);
    // fill bar
    roundRect(slide, { x, y, w: fillW, h: trackH }, undefined, {
      fill: { color: fillColor },
      line: { color: fillColor },
    }, `${name}-fill`);
    if (label) {
      text(slide, { x, y: y + trackH + 0.04, w: w * 0.75, h: 0.18 }, label,
        { fontSize: theme.size.xsmall, color: labelColor },
        `${name}-label`);
    }
    if (showPct) {
      const pct = Math.round(clampedVal * 100) + '%';
      const pctX = x + fillW + 0.05;
      if (pctX + 0.38 <= x + w) {
        text(slide, { x: pctX, y, w: 0.38, h: trackH }, pct,
          { fontSize: theme.size.xsmall, bold: true, color: pctColor, valign: 'middle' },
          `${name}-pct`);
      }
    }
  }

  // tagBadge — small filled rounded-rect pill with centered label
  function tagBadge(slide, box, { label }, opts = {}, name) {
    const { x, y, w, h } = box;
    const tb = theme.shape.tagBadge;
    const {
      bgColor   = tb.bgColor,
      textColor = tb.textColor,
      fontSize  = theme.size.badge,
    } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: bgColor },
      line: { color: bgColor },
    }, `${name}-bg`);
    text(slide, { x, y, w, h }, label,
      { fontSize, bold: true, color: textColor, align: 'center', valign: 'middle' },
      `${name}-label`);
  }

  // stepFlow — auto-distributes flowBox + flowArrow items across box.w
  function stepFlow(slide, box, items, opts = {}, name) {
    const { x, y, w, h } = box;
    const n = items.length;
    if (n === 0) return;
    const arrowW = 0.22;
    const itemW = n === 1 ? w : (w - (n - 1) * arrowW) / n;
    const arrowY = y + (h - 0.34) / 2;
    items.forEach((item, i) => {
      const ix = x + i * (itemW + arrowW);
      flowBox(slide, { x: ix, y, w: itemW, h }, item, opts, `${name}-box${i}`);
      if (i < n - 1) {
        flowArrow(slide, { x: ix + itemW, y: arrowY }, undefined, {}, `${name}-arrow${i}`);
      }
    });
  }

  // imageHolder — styled placeholder box; user swaps emoji for real image in PPT designer
  function imageHolder(slide, box, { icon = '🖼', label } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      borderColor = 'accent6',
      iconColor   = 'tx2',
      labelColor  = 'tx2',
    } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: 'bg2', transparency: 20 },
      line: { color: borderColor, width: theme.shape.borderW, dashType: 'dash' },
    }, `${name}-bg`);
    text(slide, { x, y: y + h * 0.08, w, h: h * 0.62 }, icon,
      { fontSize: theme.size.h1, color: iconColor, align: 'center', valign: 'middle' },
      `${name}-icon`);
    if (label) {
      text(slide, { x: x + 0.1, y: y + h * 0.72, w: w - 0.2, h: h * 0.22 }, label,
        { fontSize: theme.size.xsmall, color: labelColor, align: 'center', italic: true },
        `${name}-label`);
    }
  }

  // calloutQuote — left-accent insight/quote box
  // content: { label?, quote }
  function calloutQuote(slide, box, { label, quote } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const cb = theme.shape.calloutBanner;
    const {
      accentColor = cb.accentColor,
      labelColor  = cb.accentColor,
      quoteColor  = 'tx2',
    } = opts;
    const barW = cb.accentW ?? 0.07;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: theme.shape.card.bgColor },
      line: { color: theme.shape.card.borderColor, width: theme.shape.borderW },
    }, `${name}-bg`);
    fillRect(slide, { x, y, w: barW, h }, undefined, {
      fill: { color: accentColor },
      line: { color: accentColor, width: 0 },
    }, `${name}-bar`);
    const tx = x + barW + 0.16;
    const tw = w - barW - 0.24;
    if (label) {
      text(slide, { x: tx, y: y + 0.14, w: tw, h: 0.18 }, label,
        { fontSize: theme.size.xsmall, bold: true, color: labelColor, charSpace: 1.2 },
        `${name}-label`);
      text(slide, { x: tx, y: y + 0.36, w: tw, h: h - 0.48 }, quote,
        { fontSize: theme.size.body, color: quoteColor },
        `${name}-quote`);
    } else {
      text(slide, { x: tx, y: y + 0.14, w: tw, h: h - 0.28 }, quote,
        { fontSize: theme.size.body, color: quoteColor },
        `${name}-quote`);
    }
  }

  // darkStat — dark-background KPI tile; dark-bg counterpart to iconStat
  // content: { value, label, source? }
  function darkStat(slide, box, { value, label, source } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const ds = theme.shape.darkStat;
    const {
      bgColor     = ds.bgColor,
      valueColor  = ds.valueColor,
      labelColor  = ds.labelColor,
      sourceColor = ds.sourceColor,
    } = opts;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: bgColor },
      line: { color: bgColor },
    }, `${name}-bg`);
    const sourceH = source ? 0.18 : 0;
    const valueH  = h * 0.46;
    const labelH  = h * 0.22;
    const topPad  = (h - valueH - labelH - sourceH) / 2;
    text(slide, { x: x + 0.18, y: y + topPad, w: w - 0.36, h: valueH }, value,
      { fontSize: theme.size.h2, bold: true, color: valueColor, align: 'center', valign: 'middle' },
      `${name}-value`);
    text(slide, { x: x + 0.18, y: y + topPad + valueH, w: w - 0.36, h: labelH }, label,
      { fontSize: theme.size.small, color: labelColor, align: 'center', valign: 'middle' },
      `${name}-label`);
    if (source) {
      text(slide, { x: x + 0.18, y: y + h - sourceH - 0.10, w: w - 0.36, h: sourceH }, source,
        { fontSize: theme.size.caption, color: sourceColor, align: 'center' },
        `${name}-source`);
    }
  }

  // challengeCard — left-bar accent card for challenges or risks
  // content: { title, body }
  function challengeCard(slide, box, { title, body } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      accentColor = theme.shape.card.accentColor,
      bodyColor   = theme.shape.card.bodyColor,
    } = opts;
    const barW = 0.06;
    roundRect(slide, { x, y, w, h }, undefined, {
      fill: { color: theme.shape.card.bgColor },
      line: { color: theme.shape.card.borderColor, width: theme.shape.borderW },
      shadow: { ...theme.shape.card.shadow },
    }, `${name}-bg`);
    fillRect(slide, { x, y, w: barW, h }, undefined, {
      fill: { color: accentColor },
      line: { color: accentColor, width: 0 },
    }, `${name}-bar`);
    const tx = x + barW + 0.16;
    const tw = w - barW - 0.24;
    text(slide, { x: tx, y: y + 0.14, w: tw, h: 0.22 }, title,
      { fontSize: theme.size.cardTitle, bold: true, color: theme.shape.card.titleColor },
      `${name}-title`);
    text(slide, { x: tx, y: y + 0.42, w: tw, h: h - 0.54 }, body,
      { fontSize: theme.size.xsmall, color: bodyColor },
      `${name}-body`);
  }

  // teamCard — circular avatar placeholder + name + role + optional bio
  // content: { name, role, bio? }
  function teamCard(slide, box, { name: memberName, role, bio } = {}, opts = {}, name) {
    const { x, y, w, h } = box;
    const tc = theme.shape.teamCard;
    const {
      avatarBgColor   = tc.avatarBgColor,
      avatarTextColor = tc.avatarTextColor,
      nameColor       = theme.shape.card.titleColor,
      roleColor       = 'accent1',
      bioColor        = theme.shape.card.bodyColor,
    } = opts;
    const avatarD = Math.min(w * 0.55, 0.90);
    const avatarX = x + (w - avatarD) / 2;
    const avatarY = y + 0.18;
    const belowAvatar = avatarY + avatarD + 0.12;
    circle(slide, { x: avatarX, y: avatarY, w: avatarD }, undefined, {
      fill: { color: avatarBgColor },
      line: { color: avatarBgColor },
    }, `${name}-avatar`);
    text(slide, { x: avatarX, y: avatarY, w: avatarD, h: avatarD },
      memberName ? memberName[0].toUpperCase() : '?',
      { fontSize: theme.size.h3, bold: true, color: avatarTextColor, align: 'center', valign: 'middle' },
      `${name}-initial`);
    text(slide, { x: x + 0.10, y: belowAvatar, w: w - 0.20, h: 0.26 }, memberName,
      { fontSize: theme.size.h4, bold: true, color: nameColor, align: 'center' },
      `${name}-name`);
    text(slide, { x: x + 0.10, y: belowAvatar + 0.28, w: w - 0.20, h: 0.20 }, role,
      { fontSize: theme.size.small, color: roleColor, align: 'center' },
      `${name}-role`);
    if (bio) {
      text(slide, { x: x + 0.10, y: belowAvatar + 0.52, w: w - 0.20, h: h - (belowAvatar - y) - 0.60 }, bio,
        { fontSize: theme.size.xsmall, color: bioColor, align: 'center', italic: true },
        `${name}-bio`);
    }
  }

  return {
    phaseLabel, flowBox, flowArrow, numberedStep,
    infoCard, accentCard, overlayCard, fileCard, stepBox,
    iconStat, iconBox, bulletIconList, imageCard, twoColumnRow,
    progressBar, tagBadge, stepFlow, imageHolder,
    calloutQuote, darkStat, challengeCard, teamCard,
  };
}
