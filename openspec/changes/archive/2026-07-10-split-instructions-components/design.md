## Context

`INSTRUCTIONS.md` + `lib.d.ts` are the sole reference given to AI chatbots authoring `pptx-forge` slide files (via the browser tool's "🤖 AI" button, which concatenates `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts` at build time into one baked-in string). Because `INSTRUCTIONS.md` documents the `comp`/`layout`/`frame` catalog with the same weight as the framework fundamentals, AI output defaults to reusing catalog components (`infoCard`, `flowBox`, `pullQuote`, `slideHeader`, etc.) rather than composing bespoke layouts from `prim`. This change splits the catalog into an optional `COMPONENTS.md`, bundled only when the browser-tool user opts in via a runtime toggle.

## Goals / Non-Goals

**Goals:**
- Make the `comp`/`layout`/`frame` catalog opt-in rather than always-on in the AI reference, so the default authoring path favors `prim`-driven creative composition.
- Keep `INSTRUCTIONS.md` self-contained for the framework fundamentals (grid, theme, `run`, `prim`, naming) — an AI reading only it (+ `lib.d.ts`) can still produce a compilable, well-structured deck, even without any chrome or pre-built components.
- Give the browser tool a low-friction way to include/exclude `COMPONENTS.md` per click, with no added persistence complexity.

**Non-Goals:**
- Splitting `lib.d.ts`. It stays a single file, fully bundled regardless of the toggle. Type signatures for `comp`/`layout` remain visible to the AI even with the toggle off — accepted as a minor leak since the prose/tables (not bare signatures) are what drive over-reliance on the catalog.
- Persisting the toggle state across reloads or workspaces. It always resets to off.
- Changing `lib.js`, `lib.d.ts`, or any slide-compilation behavior. This is purely a documentation-split and browser-tool bundling change.
- CLI-side changes. `bin/forge.js` and friends don't read `INSTRUCTIONS.md`/`COMPONENTS.md` at all; this only affects the browser tool's AI-reference feature.

## Decisions

**Boundary: what moves to COMPONENTS.md.** Everything that isn't a direct, thin wrap of a `pptxgenjs` primitive moves out — the `comp` catalog (cards, KPI/stats, flow, insight/callout, lists, indicators), the `layout` group (`sectionTitle`, `darkPanelHeader`, `labeledDivider`, `calloutBanner`, `pullQuote`), and, on reconsideration, the `frame` group (`border`, `slideHeader`, `slideFooter`) as well. `frame` was initially kept in `INSTRUCTIONS.md` as "required chrome, not a stylistic choice," but the dividing line settled on is stricter: `INSTRUCTIONS.md` keeps only true low-level utilities that wrap `pptxgenjs` primitives directly (`prim`, `run`, `theme`); anything pre-composed — cards, layout structure, *or* frame chrome — is opinionated packaging and belongs in `COMPONENTS.md`. Confirmed against the actual library code: `frame.js` only consumes `theme.shape.frame`, and nothing in `prim` depends on `frame` at all, so `frame` detaches cleanly.

**theme.shape docs travel with their functions.** Every component-specific `theme.shape` namespace — including `frame` now — moves to `COMPONENTS.md`: `frame`, `card`, `fileCard`, `overlayCard`, `phaseLabel`, `flowBox`, `flowArrow`, `divider`, `calloutBanner`, `darkPanelHeader`, `pullQuote`, `sectionTitle`, `iconStat`, `iconBox`, `imageCard`, `progressBar`, `tagBadge`, `dataTable`, `darkStat`, `teamCard`, `comparisonTable`. Only the two global keys (`radius`, `borderW`) stay in `INSTRUCTIONS.md`, because — verified in `src/lib/primitives.js:29,46,54` — they're consumed directly by `prim.roundRect`/`prim.hLine`/`prim.vLine`, independent of any `comp`/`layout`/`frame` call.

**Two worked examples, not one adjusted example.** `INSTRUCTIONS.md` keeps a components-free worked example, rewritten to use only `prim` calls — no `frame` chrome, no `layout`, no `comp` (all three moved out together). `COMPONENTS.md` gets its own worked example demonstrating `comp`/`layout`/`frame` usage. This avoids either file referencing functions it no longer documents.

**Creative-flexibility guidance stays in INSTRUCTIONS.md only, not duplicated.** The "write custom helpers / compose `prim` freely / drop to raw pptxgenjs" section is framework-level guidance that applies regardless of whether `COMPONENTS.md` is included, so it lives once, near `prim`, in `INSTRUCTIONS.md`.

**lib.d.ts is not split.** Splitting cleanly would require untangling shared interfaces (`ShadowOpts`, `CardOpts`, `*Content` interfaces used across `theme.shape` and `comp`/`layout` signatures) declared ahead of `CompGroup`/`LayoutGroup`. Decided to accept the leak (bare type signatures without behavioral prose) rather than take on that maintenance burden now.

**Runtime toggle, not a modal, no persistence.** A checkbox ("☐ Include components") sits next to the "🤖 AI" button in `src/tools/browser/index.html`, wired in `app.js`. Default: unchecked. It is plain in-memory UI state — not written to `storage.js`/sessionStorage — so it resets to unchecked on every reload, matching the "default to creative freedom" goal without adding a new persisted-state surface.

**Build-time bundling: two separate constants.** `scripts/build-browser.js` reads `COMPONENTS.md` and injects it as its own esbuild `define` (`__COMPONENTS_REFERENCE__`), separate from the existing `__AI_REFERENCE__` (which becomes `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts`, unchanged in composition otherwise). At runtime, `app.js` concatenates `AI_REFERENCE` with `COMPONENTS_REFERENCE` appended (as a `# COMPONENTS.md` section) only when the toggle is checked at copy/show time.

**AI-CHAT.md wording genericized.** Its instruction currently says "The `INSTRUCTIONS.md` and `lib.d.ts` sections that follow this file are your reference...". Since the bundle may or may not include a components section, this is reworded to refer generically to "the reference sections below" without naming specific files, so the instruction text stays correct whether the toggle is on or off.

## Risks / Trade-offs

- **Type signatures still leak `comp`/`layout` existence via `lib.d.ts` even with the toggle off** → Mitigated by relying on the fact that prose/tables (not bare signatures) are the primary driver of over-reuse; revisit splitting `lib.d.ts` later if this proves insufficient.
- **No persistence means users who always want components must re-toggle every session** → Accepted trade-off per explicit decision; simplicity over convenience for now. Can add persistence later without breaking this design.
- **Existing `openspec/specs/slide-authoring-guide/spec.md` and `openspec/specs/browser-ai-reference/spec.md` contain some requirement text that had already drifted from the actual `INSTRUCTIONS.md` content** (e.g. old component names like `smallCard`/`miniCard` vs. current `infoCard`/`accentCard`) → This change's delta specs correct that drift for the requirements they touch, but does not do a full audit of unrelated stale requirements in those files.

## Migration Plan

1. Write `COMPONENTS.md` (new file) with the catalog content moved out of `INSTRUCTIONS.md`, plus its worked example and theme.shape docs.
2. Trim `INSTRUCTIONS.md`: remove `comp`/`layout` sections and their `theme.shape` docs, rewrite the worked example to be components-free.
3. Update `AI-CHAT.md` wording.
4. Update `scripts/build-browser.js` to bundle `COMPONENTS.md` as a separate constant.
5. Update `src/tools/browser/index.html` (add toggle control) and `app.js` (wire toggle state, conditional concatenation, update button title text).
6. Rebuild `pptx-forge.html` via `npm run build:browser` and manually verify both toggle states in a browser.

No rollback complexity beyond reverting the commit — no data migrations, no persisted state format changes.

## Open Questions

None outstanding — boundary, persistence, and lib.d.ts scope were all resolved during exploration.
