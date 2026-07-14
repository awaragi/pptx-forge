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

// A slide .js file can call pptx.addSlide() more than once (the sample
// showcase deck does this deliberately), so "one slide file" can compile to
// more than one actual slide. Clamps a remembered sub-slide index into the
// valid [0, slideCount-1] range — e.g. after an edit removes a trailing
// addSlide() call that the user was currently viewing.
export function clampSlideIndex(index, slideCount) {
  if (!Number.isFinite(slideCount) || slideCount <= 0) return 0;
  return Math.min(slideCount - 1, Math.max(0, index));
}

// Whether the remembered sub-slide index should reset to 0: only when the
// previewed file itself changed, not when the same file was just recompiled
// after an edit (which should preserve whichever sub-slide was being viewed).
export function shouldResetSlideIndex(previousName, nextName) {
  return previousName !== nextName;
}
