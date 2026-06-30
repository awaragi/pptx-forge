// Component showcase — demonstrates every lib function across 7 slides.
// Full API reference: INSTRUCTIONS.md and lib.d.ts

export default function Showcase(pptx, lib) {
  const { theme, prim, comp, tables, layout, frame } = lib;
  const { text, roundRect, fillRect, circle, hLine, vLine, bullets } = prim;
  const {
    phaseLabel, flowBox, flowArrow, numberedStep,
    infoCard, accentCard, overlayCard, fileCard, stepBox,
    iconStat, iconBox, bulletIconList, imageCard, twoColumnRow,
    progressBar, tagBadge, stepFlow, imageHolder,
  } = comp;
  const { dataTable, comparisonTable } = tables;
  const { sectionTitle, darkPanelHeader, labeledDivider, calloutBanner, pullQuote, labeledSection } = layout;
  const { border, slideHeader, slideFooter } = frame;
  const G = theme.grid;

  function addChrome(slide, prefix) {
    border(slide, undefined, {}, `${prefix}-border`);
    slideHeader(slide, undefined, {}, prefix);
    slideFooter(slide, undefined, {}, prefix);
  }

  // ── Slide 1: Primitives ────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's01');
    sectionTitle(slide, null, 'Slide 1 — Primitives', {}, 's01-title');

    text(slide, { x: G.marginX, y: 1.4, w: 3.5, h: 0.30 }, 'prim.text — body copy', { fontSize: theme.size.body, color: 'tx2' }, 's01-text');
    roundRect(slide, { x: G.marginX, y: 1.9, w: 1.6, h: 0.44 }, undefined, { fill: { color: 'accent1' }, line: { color: 'accent1' } }, 's01-rrect');
    text(slide, { x: G.marginX, y: 1.9, w: 1.6, h: 0.44 }, 'roundRect', { fontSize: theme.size.badge, bold: true, color: 'bg1', align: 'center', valign: 'middle' }, 's01-rrect-lbl');
    fillRect(slide, { x: G.marginX + 1.8, y: 1.9, w: 1.6, h: 0.44 }, undefined, { fill: { color: 'accent4' }, line: { color: 'accent4' } }, 's01-frect');
    text(slide, { x: G.marginX + 1.8, y: 1.9, w: 1.6, h: 0.44 }, 'fillRect', { fontSize: theme.size.badge, bold: true, color: 'bg1', align: 'center', valign: 'middle' }, 's01-frect-lbl');
    circle(slide, { x: G.marginX + 3.6, y: 1.9, w: 0.44 }, undefined, { fill: { color: 'accent2' }, line: { color: 'accent2' } }, 's01-circle');
    text(slide, { x: G.marginX + 3.6, y: 2.42, w: 0.44, h: 0.18 }, 'circle', { fontSize: theme.size.caption, color: 'tx2', align: 'center' }, 's01-circle-lbl');
    hLine(slide, { x: G.marginX, y: 2.7, w: 5.0 }, undefined, { color: 'accent1', lineWidth: 1.5 }, 's01-hline');
    text(slide, { x: G.marginX + 5.1, y: 2.6, w: 1.4, h: 0.20 }, 'hLine', { fontSize: theme.size.xsmall, color: 'tx2' }, 's01-hline-lbl');
    vLine(slide, { x: G.marginX + 7.5, y: 1.4, h: 1.6 }, undefined, { color: 'accent1', lineWidth: 1.5 }, 's01-vline');
    text(slide, { x: G.marginX + 7.6, y: 2.0, w: 1.4, h: 0.20 }, 'vLine', { fontSize: theme.size.xsmall, color: 'tx2' }, 's01-vline-lbl');
    text(slide, { x: G.marginX, y: 3.1, w: 5.5, h: 0.22 }, 'prim.bullets', { fontSize: theme.size.small, bold: true, color: 'tx1' }, 's01-bull-lbl');
    bullets(slide, { x: G.marginX, y: 3.4, w: 5.5, h: 0.9 }, ['First bullet item', 'Second bullet item', 'Third bullet item'], { fontSize: theme.size.small }, 's01-bullets');
  }

  // ── Slide 2: Cards & Icon Components ──────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's02');
    sectionTitle(slide, null, 'Slide 2 — Cards & Icon Components', {}, 's02-title');

    const y1 = 1.30; const y2 = 2.90; const cw = 2.72; const ch = 1.40;

    infoCard(slide,   { x: G.marginX,                   y: y1, w: cw, h: ch }, { title: 'infoCard',   body: 'Title + body. Border overridable via opts.' }, {}, 's02-info');
    accentCard(slide, { x: G.marginX + cw + 0.12,       y: y1, w: cw, h: ch }, { title: 'accentCard', body: 'Accent stripe at top. Shadow enabled.' }, {}, 's02-accent');
    fileCard(slide,   { x: G.marginX + (cw + 0.12) * 2, y: y1, w: cw, h: ch }, { filename: 'report.md', purpose: 'fileCard — mono filename card.', step: 'Review' }, {}, 's02-file');

    stepBox(slide,    { x: G.marginX,             y: y2, w: cw, h: ch }, { label: 'stepBox', steps: ['Plan', 'Build', 'Ship'] }, {}, 's02-step');
    iconBox(slide,    { x: G.marginX + cw + 0.12, y: y2, w: cw, h: ch }, { icon: '✦', title: 'iconBox', body: 'UTF-8 icon + title + body.' }, {}, 's02-iconbox');
    fillRect(slide,   { x: G.marginX + (cw + 0.12) * 2, y: y2, w: cw, h: ch }, undefined, { fill: { color: 'accent1' }, line: { color: 'accent1' } }, 's02-oc-bg');
    overlayCard(slide,{ x: G.marginX + (cw + 0.12) * 2, y: y2, w: cw, h: ch }, { title: 'overlayCard', body: 'Semi-transparent over any background.' }, {}, 's02-overlay');

    const ix = G.colRight;
    imageCard(slide,   { x: ix,         y: y1, w: 2.6, h: 1.60 }, { image: '🏗', title: 'imageCard',   body: 'Emoji band at top.' }, {}, 's02-imgcard');
    imageHolder(slide, { x: ix + 2.72,  y: y1, w: 2.6, h: 1.60 }, { icon: '📊', label: 'chart placeholder' }, {}, 's02-imgholder');
  }

  // ── Slide 3: Flow & Steps ─────────────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's03');
    sectionTitle(slide, null, 'Slide 3 — Flow & Steps', {}, 's03-title');

    phaseLabel(slide, { x: G.marginX, y: 1.32, w: G.contentW }, 'PHASE 1', {}, 's03-phase');
    stepFlow(slide, { x: G.marginX, y: 1.82, w: G.contentW, h: 0.46 }, [
      { label: 'Discover' }, { label: 'Design', highlight: true }, { label: 'Build' }, { label: 'Deploy' },
    ], {}, 's03-flow');

    text(slide, { x: G.marginX, y: 2.56, w: 4.0, h: 0.20 }, 'flowBox + flowArrow (manual placement)', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's03-fb-lbl');
    flowBox(slide,   { x: G.marginX,         y: 2.84, w: 1.6, h: 0.44 }, { label: 'Step A' }, {}, 's03-fb1');
    flowArrow(slide, { x: G.marginX + 1.6,   y: 2.89 }, undefined, {}, 's03-fa1');
    flowBox(slide,   { x: G.marginX + 1.82,  y: 2.84, w: 1.6, h: 0.44 }, { label: 'Step B' }, {}, 's03-fb2');
    flowArrow(slide, { x: G.marginX + 3.42,  y: 2.89 }, undefined, {}, 's03-fa2');
    flowBox(slide,   { x: G.marginX + 3.64,  y: 2.84, w: 1.6, h: 0.44 }, { label: 'Step C', highlight: true }, {}, 's03-fb3');

    text(slide, { x: G.marginX, y: 3.54, w: 4.0, h: 0.20 }, 'numberedStep', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's03-ns-lbl');
    const nsW = 3.6; const nsH = 1.10;
    numberedStep(slide, { x: G.marginX,              y: 3.82, w: nsW, h: nsH }, { num: 1, title: 'Define Scope',       body: 'Establish objectives and constraints.' }, {}, 's03-ns1');
    numberedStep(slide, { x: G.marginX + nsW + 0.12, y: 3.82, w: nsW, h: nsH }, { num: 2, title: 'Align Stakeholders',  body: 'Run discovery and validate assumptions.' }, {}, 's03-ns2');
    numberedStep(slide, { x: G.marginX + (nsW + 0.12) * 2, y: 3.82, w: nsW, h: nsH }, { num: 3, title: 'Execute Plan', body: 'Deliver iteratively against milestones.' }, {}, 's03-ns3');
  }

  // ── Slide 4: Stats, Progress & Tags ───────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's04');
    sectionTitle(slide, null, 'Slide 4 — Stats, Progress & Tags', {}, 's04-title');

    const sw = 2.50; const sh = 1.50;
    [{ value: '94%', label: 'Adoption Rate', icon: '✓' }, { value: '3×', label: 'Faster Delivery' }, { value: '$2M', label: 'Cost Avoidance', icon: '↓' }, { value: '12', label: 'Teams Onboarded' }]
      .forEach(({ value, label, icon }, i) => iconStat(slide, { x: G.marginX + i * (sw + 0.12), y: 1.30, w: sw, h: sh }, { value, label, icon }, {}, `s04-stat${i}`));

    text(slide, { x: G.marginX, y: 3.06, w: 5.5, h: 0.20 }, 'progressBar', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's04-pb-lbl');
    progressBar(slide, { x: G.marginX, y: 3.32, w: 5.5, h: 0.38 }, { value: 0.72, label: 'Adoption',   showPct: true }, {}, 's04-pb1');
    progressBar(slide, { x: G.marginX, y: 3.82, w: 5.5, h: 0.38 }, { value: 0.45, label: 'Deployment', showPct: true }, {}, 's04-pb2');

    text(slide, { x: G.marginX, y: 4.46, w: 5.5, h: 0.20 }, 'tagBadge', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's04-tb-lbl');
    ['PRIMARY', 'BETA', 'IN PROGRESS', 'COMPLETE'].forEach((label, i) =>
      tagBadge(slide, { x: G.marginX + i * 1.52, y: 4.72, w: 1.40, h: 0.26 }, { label }, { bgColor: ['accent1','accent3','accent4','accent5'][i] }, `s04-tag${i}`));

    text(slide, { x: G.colRight, y: 3.06, w: G.colRightW, h: 0.20 }, 'bulletIconList', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's04-bil-lbl');
    bulletIconList(slide, { x: G.colRight, y: 3.32, w: G.colRightW, h: 1.20 }, [
      { icon: '✓', text: 'Reduce manual effort by 40%' },
      { icon: '✓', text: 'Unified data model across teams' },
      { icon: '→', text: 'Phase 2 roadmap underway' },
      { icon: '⚠', text: 'Legacy integration still pending' },
    ], {}, 's04-bil');

    text(slide, { x: G.colRight, y: 4.70, w: G.colRightW, h: 0.20 }, 'twoColumnRow', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's04-tcr-lbl');
    [{ label: 'Owner', content: 'Platform Engineering' }, { label: 'Timeline', content: 'Q3 2026 – Q1 2027' }, { label: 'Status', content: 'On track' }]
      .forEach(({ label, content }, i) => twoColumnRow(slide, { x: G.colRight, y: 4.96 + i * 0.30, w: G.colRightW, h: 0.28 }, { label, content }, {}, `s04-tcr${i}`));
  }

  // ── Slide 5: Layout Blocks ────────────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's05');
    sectionTitle(slide, null, 'Slide 5 — Layout Blocks', {}, 's05-title');

    darkPanelHeader(slide, { x: G.marginX, y: 1.34, w: G.contentW }, { title: 'darkPanelHeader', subtitle: 'Optional subtitle — italic, on the right' }, {}, 's05-dph');
    labeledSection(slide, { x: G.marginX, y: 2.10, w: G.contentW }, { title: 'labeledSection', subtitle: 'Combines sectionTitle + darkPanelHeader in one call' }, {}, 's05-ls');
    labeledDivider(slide, { x: 6.67, y: 2.06, h: 3.80 }, 'DIVIDER', {}, 's05-div');
    calloutBanner(slide, { x: G.marginX, y: 3.50, w: G.colLeftW, h: 0.56 }, '"calloutBanner — bold italic text in a dark banner with left accent stripe."', {}, 's05-cb');
    pullQuote(slide, { x: G.colRight, y: 3.50, w: G.colRightW, h: 0.90 }, '"pullQuote — large italic text for emphasizing a key insight or statistic."', {}, 's05-pq');
  }

  // ── Slide 6: Tables ───────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's06');
    sectionTitle(slide, null, 'Slide 6 — Tables', {}, 's06-title');

    text(slide, { x: G.marginX, y: 1.34, w: 8.0, h: 0.22 }, 'tables.dataTable', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's06-dt-lbl');
    dataTable(slide, { x: G.marginX, y: 1.62, w: G.contentW }, {
      headers: ['Initiative', 'Owner', 'Timeline', 'Status'],
      rows: [
        ['AI Platform Modernisation', 'Platform Eng.',    'Q3 2026', 'On Track'],
        ['Data Mesh Migration',       'Data & Analytics', 'Q4 2026', 'At Risk'],
        ['Zero Trust Security',       'Cyber Ops',        'Q1 2027', 'On Track'],
        ['Developer Portal',          'DevEx',            'Q2 2027', 'Planning'],
      ],
    }, {}, 's06-dt');

    text(slide, { x: G.marginX, y: 4.10, w: 8.0, h: 0.22 }, 'tables.comparisonTable', { fontSize: theme.size.xsmall, bold: true, color: 'tx2' }, 's06-ct-lbl');
    comparisonTable(slide, { x: G.marginX, y: 4.38, w: G.contentW }, {
      headers: ['Criteria', 'Option A — Build', 'Option B — Buy', 'Option C — Partner'],
      rows: [
        ['Total Cost',       '✓ Low upfront',  '✗ High licence', '~ Shared model'],
        ['Time to Value',    '✗ 12+ months',   '✓ 3–6 months',   '✓ 6–9 months'],
        ['Customisation',    '✓ Full control', '✗ Vendor locked', '~ Partial'],
        ['Operational Risk', '~ Moderate',     '✓ Vendor managed','~ Shared'],
      ],
    }, {}, 's06-ct');
  }

  // ── Slide 7: Full Frame Example ───────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    addChrome(slide, 's07');
    sectionTitle(slide, null, 'Slide 7 — Frame Chrome Reference', {}, 's07-title');

    text(slide, { x: G.marginX, y: 1.40, w: G.contentW, h: 0.34 },
      'Every slide uses frame.border + frame.slideHeader + frame.slideFooter. Annotations below show where each element renders.',
      { fontSize: theme.size.body, color: 'tx2' }, 's07-body');

    hLine(slide, { x: G.marginX + 0.20, y: 0.52, w: 2.5 }, undefined, { color: 'accent2', lineWidth: 0.5 }, 's07-wm-line');
    text(slide, { x: G.marginX + 0.20, y: 0.56, w: 2.5, h: 0.18 }, '← wordmark (header.wordmark)', { fontSize: theme.size.caption, color: 'accent2', italic: true }, 's07-wm-ann');

    hLine(slide, { x: 10.60, y: 0.52, w: 1.8 }, undefined, { color: 'accent2', lineWidth: 0.5 }, 's07-badge-line');
    text(slide, { x: 10.60, y: 0.56, w: 1.8, h: 0.18 }, 'badge (header.badge) →', { fontSize: theme.size.caption, color: 'accent2', italic: true, align: 'right' }, 's07-badge-ann');

    text(slide, { x: G.marginX, y: 6.94, w: 4.0, h: 0.18 }, '← footer.left', { fontSize: theme.size.caption, color: 'accent2', italic: true }, 's07-fl-ann');
    text(slide, { x: 8.5, y: 6.94, w: 4.1, h: 0.18 }, 'footer.right →', { fontSize: theme.size.caption, color: 'accent2', italic: true, align: 'right' }, 's07-fr-ann');

    calloutBanner(slide, { x: G.marginX, y: 2.10, w: G.contentW, h: 0.52 },
      'border(slide, undefined, {}, prefix)  ·  slideHeader(slide, undefined, {}, prefix)  ·  slideFooter(slide, undefined, {}, prefix)',
      { fontSize: theme.size.badge, italic: false }, 's07-code');
  }
}
