## Why

`pptxgenjs` only recognizes its own scheme-name enum (`tx1`/`tx2`/`bg1`/`bg2`/`accent1`-`accent6`) or a raw hex string in color fields. It rejects the OOXML slot names `dk1`/`lt1`/`dk2`/`lt2` — the very keys `theme.scheme` is defined with — and silently falls back to black (`000000`) instead of erroring. Workspace `theme.js` files that pointed `theme.color`/`theme.shape` entries at `dk1`/`lt1`/`dk2`/`lt2` (a natural choice, since those are the keys visible in `theme.scheme`) rendered black instead of the intended color. This surfaced concretely in `workspaces/rfp-mcn-openstack/theme.js`, where `color.surface: 'lt1'` produced a black slide background instead of white.

## What Changes

- `src/lib/theme.js` gains an exported `resolveThemeColors(theme)` function that recursively walks `theme.color` and `theme.shape` and rewrites any string value equal to `dk1`/`lt1`/`dk2`/`lt2` to its role-alias equivalent `tx1`/`bg1`/`tx2`/`bg2` (`dk1`→`tx1`, `lt1`→`bg1`, `dk2`→`tx2`, `lt2`→`bg2`). `theme.scheme` itself is left untouched since its values are literal hex, not scheme-name references.
- `src/lib/lib.js`'s `createLib` now applies `resolveThemeColors` to the merged theme before returning it: `resolveThemeColors(deepMerge(defaultTheme, overrides))`.
- Net effect: workspace `theme.js` authors may write `theme.color`/`theme.shape` color values using either the scheme slot names (`dk1`/`lt1`/`dk2`/`lt2`) or the role-alias names (`tx1`/`bg1`/`tx2`/`bg2`) interchangeably; both now resolve correctly. Previously only the role-alias form (plus `accent1`-`accent6` and raw hex) worked reliably in those two places.
- `src/sample/theme.js` (the template copied into new workspaces by `bin/create.js`) updated to use `dk1`/`lt1`/`dk2`/`lt2` in its example `color` block, with a comment clarifying both forms work.
- `INSTRUCTIONS.md` updated to document that `createLib` normalizes slot names to role aliases automatically.

No breaking changes — this is a strict widening of previously-accepted values; every value that resolved correctly before still resolves the same way.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `theme-scheme-injection`: `createLib` now normalizes `dk1`/`lt1`/`dk2`/`lt2` string values found in `theme.color`/`theme.shape` to their `tx1`/`bg1`/`tx2`/`bg2` role-alias equivalents before the theme is used by slide/primitive code, in addition to the existing `deepMerge` behavior.

## Impact

- `src/lib/theme.js` — new `resolveThemeColors` export.
- `src/lib/lib.js` — `createLib` wires in `resolveThemeColors`.
- `src/sample/theme.js` — example `color` block updated.
- `INSTRUCTIONS.md` — `theme.scheme` / `theme.color` sections updated.
- All existing workspaces (`rfp-mcn-openstack`, `agentic-rfp-workshop`, `jira-kpi`, `ref-rfx`) rebuilt with no warnings or output differences, confirming no regressions.
