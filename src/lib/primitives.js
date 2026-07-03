// Primitive rendering helpers — thin wrappers over pptxgenjs shape/text APIs.
// Export makePrimitives(theme) to get the prim group.
// on() and unpack() are also exported for use by other modules.

export function on(name) { return name ? { objectName: name } : {}; }

export function unpack(val, key) {
  if (Array.isArray(val)) return val;
  return (val !== null && typeof val === 'object') ? val[key] : val;
}

export function makePrimitives(theme) {
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

  return { text, roundRect, fillRect, circle, hLine, vLine, bullets };
}
