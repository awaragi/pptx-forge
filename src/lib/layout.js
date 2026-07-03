// Layout rendering functions — section-level blocks composed from primitives.
// Export makeLayout(theme, prim) to get the layout group.

import { unpack } from './primitives.js';

export function makeLayout(theme, prim) {
  const { text, roundRect, fillRect, hLine, vLine } = prim;

  // box fields default to theme grid values when omitted
  function sectionTitle(slide, box, content, opts = {}, name) {
    const { x = theme.grid.marginX, y = theme.grid.contentTop, w = theme.grid.contentW, h = 0.34 } = box ?? {};
    const { fontSize = theme.size.h2, color = theme.shape.sectionTitle.color, ...rest } = opts;
    text(slide, { x, y, w, h }, content, { fontSize, bold: true, color, ...rest }, name);
  }

  // box: { x, y, w, h? } — h defaults to 0.44 when not provided in box
  function darkPanelHeader(slide, box, { title, subtitle }, opts = {}, name) {
    const { x, y, w, h: boxH = 0.44 } = box;
    const {
      bgColor       = theme.shape.darkPanelHeader.bgColor,
      borderColor,
      titleColor    = theme.shape.darkPanelHeader.titleColor,
      subtitleColor = theme.shape.darkPanelHeader.subtitleColor,
      titleW        = 1.60,
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
    const dv = theme.shape.divider;
    const {
      color     = dv.color,
      lineWidth = dv.lineWidth,
      badgeW    = dv.badgeW,
      badgeH    = dv.badgeH,
      gap       = dv.gap,
    } = opts;
    const midY = y1 + (y2 - y1) / 2 - badgeH / 2;
    const bx = x - badgeW / 2;
    vLine(slide, { x, y: y1, h: midY - y1 - gap }, undefined, { color, lineWidth }, `${name}-top`);
    roundRect(slide, { x: bx, y: midY, w: badgeW, h: badgeH }, undefined,
      { fill: { color }, line: { color } }, `${name}-badge`);
    text(slide, { x: bx, y: midY, w: badgeW, h: badgeH }, label,
      { fontSize: theme.size.caption, bold: true, color: dv.badgeTextColor, align: 'center', valign: 'middle' },
      `${name}-badge-txt`);
    vLine(slide, { x, y: midY + badgeH + gap, h: y2 - (midY + badgeH + gap) }, undefined,
      { color, lineWidth }, `${name}-bot`);
  }

  function calloutBanner(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    const cb = theme.shape.calloutBanner;
    const {
      bgColor   = cb.bgColor,
      accent    = cb.accentColor,
      textColor = cb.textColor,
      fontSize  = theme.size.bodyLg,
      italic    = true,
      bold      = true,
      align     = 'center',
    } = opts;
    const val = unpack(content, 'text');
    roundRect(slide, { x, y, w, h }, undefined, { fill: { color: bgColor }, line: { color: bgColor } }, `${name}-bg`);
    fillRect(slide, { x, y, w: cb.accentW, h }, undefined, { fill: { color: accent }, line: { color: accent } }, `${name}-accent`);
    text(slide, { x: x + 0.26, y, w: w - 0.36, h }, val,
      { fontSize, bold, italic, color: textColor, valign: 'middle', align },
      `${name}-text`);
  }

  function pullQuote(slide, box, content, opts = {}, name) {
    const { x, y, w, h } = box;
    const {
      color    = theme.shape.pullQuote.color,
      fontSize = theme.size.pullQuote,
      italic   = true,
      bold     = false,
      align    = 'left',
    } = opts;
    const val = unpack(content, 'text');
    text(slide, { x, y, w, h }, val, { fontSize, italic, bold, color, align }, name);
  }

  // labeledSection — sectionTitle + optional darkPanelHeader in one call
  function labeledSection(slide, box, { title, subtitle }, opts = {}, name) {
    const { x = theme.grid.marginX, y = theme.grid.contentTop, w = theme.grid.contentW } = box ?? {};
    const { titleH = 0.34, panelH = 0.44, gap = 0.06, ...rest } = opts;
    sectionTitle(slide, { x, y, w, h: titleH }, title, rest, `${name}-title`);
    if (subtitle != null && subtitle !== '') {
      darkPanelHeader(slide, { x, y: y + titleH + gap, w, h: panelH }, { title: subtitle }, rest, `${name}-panel`);
    }
  }

  return { sectionTitle, darkPanelHeader, labeledDivider, calloutBanner, pullQuote, labeledSection };
}
