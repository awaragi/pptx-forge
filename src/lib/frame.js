// Frame rendering functions — slide chrome (border, header, footer).
// Export makeFrame(theme, prim) to get the frame group.

export function makeFrame(theme, prim) {
  const { text, roundRect, hLine } = prim;

  // box is ignored — renders at fixed position; pass undefined
  function border(slide, box, opts = {}, name) {
    roundRect(slide, { x: 0.12, y: 0.12, w: 13.09, h: 7.26 }, undefined, {
      fill: { color: 'bg1', transparency: 100 },
      line: { color: theme.shape.frame.borderColor, width: theme.shape.borderW },
    }, name);
  }

  // box is ignored — renders at fixed position; pass undefined
  // name is a slide-level prefix (e.g. 's01'); sub-element names are derived from it
  function slideHeader(slide, box, opts = {}, name) {
    const pfx = name ?? 'header';
    const fr = theme.shape.frame;
    text(slide, { x: theme.grid.marginX, y: 0.42, w: 5.5, h: 0.25 }, theme.header.wordmark,
      { fontSize: theme.size.sectionLabel, bold: true, color: fr.wordmarkColor, charSpace: 1.4 },
      `${pfx}-header-wordmark`);
    roundRect(slide, { x: 11.65, y: 0.31, w: 1.0, h: 0.36 }, undefined, {
      rectRadius: fr.badgeRadius,
      fill: { color: fr.badgeColor },
      line: { color: fr.badgeColor },
    }, `${pfx}-header-badge`);
    text(slide, { x: 11.65, y: 0.405, w: 1.0, h: 0.17 }, theme.header.badge,
      { fontSize: theme.size.sectionLabel, bold: true, color: fr.badgeTextColor, align: 'center' },
      `${pfx}-header-badge-text`);
  }

  // box is ignored — renders at fixed position; pass undefined
  function slideFooter(slide, box, opts = {}, name) {
    const pfx = name ?? 'footer';
    const fr = theme.shape.frame;
    hLine(slide, { x: theme.grid.marginX, y: theme.grid.footerY, w: theme.grid.contentW }, undefined,
      { color: fr.footerLineColor, lineWidth: theme.shape.borderW },
      `${pfx}-footer-rule`);
    text(slide, { x: theme.grid.marginX, y: 7.31, w: 5.5, h: 0.12 }, theme.footer.left,
      { fontSize: theme.size.caption, color: fr.footerTextColor },
      `${pfx}-footer-left`);
    text(slide, { x: 7.9, y: 7.31, w: 4.7, h: 0.12 }, theme.footer.right,
      { fontSize: theme.size.caption, color: fr.footerTextColor, align: 'right' },
      `${pfx}-footer-right`);
  }

  return { border, slideHeader, slideFooter };
}
