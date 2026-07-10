## 1. Write COMPONENTS.md

- [x] 1.1 Create `COMPONENTS.md` at the project root with a short intro (what it is, that it's an optional companion to `INSTRUCTIONS.md` + `lib.d.ts`).
- [x] 1.2 Move the `comp` catalog tables (Cards, KPI & Stats, Flow & Process, Insight & Callout, Lists & Tables, Indicators & Placeholders) from `INSTRUCTIONS.md` into `COMPONENTS.md`, using the current real function names (`infoCard`, `overlayCard`, `accentCard`, `challengeCard`, `fileCard`, `numberedStep`, `stepBox`, `imageCard`, `iconBox`, `teamCard`, `iconStat`, `darkStat`, `flowBox`, `flowArrow`, `stepFlow`, `phaseLabel`, `calloutQuote`, `bulletIconList`, `twoColumnRow`, `progressBar`, `tagBadge`, `imageHolder`).
- [x] 1.3 Move the `layout` group table (`sectionTitle`, `darkPanelHeader`, `labeledDivider`, `calloutBanner`, `pullQuote`) into `COMPONENTS.md`.
- [x] 1.4 Move the `frame` group table (`border`, `slideHeader`, `slideFooter`) and its "always pass `undefined` as box" note into `COMPONENTS.md`.
- [x] 1.5 Move the component-specific `theme.shape` namespace docs (`frame`, `card`, `fileCard`, `overlayCard`, `phaseLabel`, `flowBox`, `flowArrow`, `divider`, `calloutBanner`, `darkPanelHeader`, `pullQuote`, `sectionTitle`, `iconStat`, `iconBox`, `imageCard`, `progressBar`, `tagBadge`, `dataTable`, `darkStat`, `teamCard`, `comparisonTable`) into `COMPONENTS.md`, keeping the partial-override example pattern.
- [x] 1.6 Write a worked example in `COMPONENTS.md` that uses at least one `comp` function, one `layout` function, and the `frame` group alongside `prim`, and verify it compiles (`npm run forge <slug>` against a scratch workspace).

## 2. Trim INSTRUCTIONS.md

- [x] 2.1 Remove the `## comp — Components`, `## layout — Layout`, and `## frame — Frame Chrome` sections and their tables.
- [x] 2.2 Remove all namespaced `theme.shape` entries from the `theme.shape` table, keeping only the two global keys (`radius`, `borderW`).
- [x] 2.3 Update the `theme.shape` partial-override example to use a global-key override (e.g. `borderW`) instead of a `card`-namespace one.
- [x] 2.4 Add a short note in the Overview section referencing `COMPONENTS.md` as an optional companion file for the pre-built `comp`/`layout`/`frame` catalog, to be used only when the author wants standard components and/or slide chrome.
- [x] 2.5 Update the `lib` destructuring guidance to show `const { theme, run, prim } = lib;` (no `comp`/`layout`/`frame`), with a note that `comp`/`layout`/`frame` exist and are documented in `COMPONENTS.md`.
- [x] 2.6 Rewrite the Worked Example to use only `prim` calls (drop the `infoCard`, `pullQuote`, `border`/`slideHeader`/`slideFooter` calls), and verify it still compiles.
- [x] 2.7 Confirm the "Custom Components & Full Creative Flexibility" section remains intact and still reads correctly with the comp/layout/frame catalog no longer immediately preceding it.

## 3. Update AI-CHAT.md

- [x] 3.1 Reword the instruction paragraph to refer generically to "the reference sections below" instead of naming `INSTRUCTIONS.md`/`lib.d.ts` specifically, so it reads correctly whether or not a `COMPONENTS.md` section is appended.

## 4. Update the build script

- [x] 4.1 In `scripts/build-browser.js`, read `COMPONENTS.md` and inject it as a new esbuild `define` (`__COMPONENTS_REFERENCE__`), separate from the existing `__AI_REFERENCE__`.
- [x] 4.2 Leave `__AI_REFERENCE__`'s composition unchanged (`AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts`) other than picking up the trimmed `INSTRUCTIONS.md` content.

## 5. Update the browser tool UI and logic

- [x] 5.1 In `src/tools/browser/index.html`, add an "Include components" checkbox/toggle control next to the `#ai-btn` button; update the button's `title` attribute to no longer hardcode "INSTRUCTIONS.md + lib.d.ts" wording that would be wrong when components are included.
- [x] 5.2 In `src/tools/browser/app.js`, read `__COMPONENTS_REFERENCE__` (mirroring how `__AI_REFERENCE__`/`__THEME_PLACEHOLDER__` are read) into a `COMPONENTS_REFERENCE` constant.
- [x] 5.3 Add in-memory (non-persisted) toggle state, defaulting to `false`, with no read/write to `storage.js`/`sessionStorage`.
- [x] 5.4 Update `copyAiReference`/`showAiReferenceFallback` (or equivalent) to build the assembled text as `AI_REFERENCE` plus `COMPONENTS_REFERENCE` (as a `# COMPONENTS.md` section) appended only when the toggle is on at click time.
- [x] 5.5 Ensure `newProject()` resets the toggle to off, consistent with "always resets, never persisted."

## 6. Rebuild and verify

- [ ] 6.1 Run `npm run build:browser` to regenerate `pptx-forge.html`.
- [ ] 6.2 Open `pptx-forge.html` in a browser; verify the AI button copies the base reference (no `COMPONENTS.md` content) when the toggle is off.
- [ ] 6.3 Toggle "include components" on, click the AI button again, and verify the copied/shown text includes the `COMPONENTS.md` content appended after the base reference.
- [ ] 6.4 Verify the clipboard-unavailable fallback textarea shows the same conditional content (toggle both states and check the overlay textarea).
- [ ] 6.5 Reload the page and confirm the toggle resets to off even when a prior workspace is restored from `sessionStorage`.
