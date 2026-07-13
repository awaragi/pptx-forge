// Pure decision logic for the preview pane, split out from preview.js so it
// can be unit-tested without a DOM (preview.js touches `document`/pptxviewjs
// at module scope and can't be imported outside a browser).

// Which slide name the preview should render: the active file if it's a
// slide, else the last-viewed slide if it still exists, else null (nothing
// to preview).
export function pickPreviewSlideName(activeName, slideNames, lastViewedSlideName) {
  if (slideNames.includes(activeName)) return activeName;
  if (lastViewedSlideName && slideNames.includes(lastViewedSlideName)) return lastViewedSlideName;
  return null;
}
