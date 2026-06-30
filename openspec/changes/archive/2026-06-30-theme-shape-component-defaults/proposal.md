## Why

Component colors and visual parameters are hardcoded inside each component function in `lib.js`, making it impossible to restyle all cards, dividers, or frame chrome from `theme.js` without editing individual slide files or the library itself. As workspaces accumulate, the lack of a workspace-level style layer means teams must fork the library or accept its defaults permanently.

## What Changes

- Extend `defaultTheme.shape` in `lib.js` with per-component namespaces that hold both geometry and color defaults for every component
- Add a `deepMerge` helper inside `createLib` and wire `theme.shape` into the merge so workspace `theme.js` files can override any shape parameter
- Remove the dead `shadowDark` constant (never referenced)
- Remove `accentBlock` from `lib.comp` — it was never called from any workspace or slide file
- Replace all hardcoded color literals and opts defaults inside component functions with reads from `theme.shape.<namespace>.*`
- **BREAKING**: `smallCard` body text color changes from `'accent5'` → `'tx2'` (unified with the rest of the card family for visual consistency)
- Move `radiusLg` into `theme.shape.frame.badgeRadius` (was only ever used for the header badge)
- Move `shadow` from global `theme.shape` into `theme.shape.card.shadow`
- Move `accentW` from global `theme.shape` into `theme.shape.calloutBanner.accentW` (its only remaining user after `accentBlock` removal)
- Update `lib.d.ts` type declarations to describe the full `theme.shape` structure
- Update `INSTRUCTIONS.md` with a `theme.shape` authoring section

## Capabilities

### New Capabilities

- `theme-shape-component-defaults`: Workspace-overridable per-component style defaults (geometry + colors) via `theme.shape` in `theme.js`

### Modified Capabilities

- `lib-components-v2`: Component color and geometry defaults now sourced from `theme.shape` rather than hardcoded — behavior is equivalent except for the `smallCard` body color change; `accentBlock` removed (was unused)
- `theme-scheme-injection`: `theme.shape` is now merged from workspace overrides alongside `scheme`, `color`, `header`, `footer`
- `lib-api-contract`: `theme.shape` gains a documented, typed structure in `lib.d.ts`
- `slide-authoring-guide`: `INSTRUCTIONS.md` gains a `theme.shape` section covering all namespaces, their defaults, and override examples

## Impact

- `src/lib.js`: `defaultTheme.shape` restructured; `deepMerge` helper added; `createLib` merge updated; all component functions updated
- `lib.d.ts`: New `ThemeShape` interface and sub-interfaces added
- `INSTRUCTIONS.md`: New `theme.shape` documentation section
- Workspaces: No change required; existing `theme.js` files without `shape` export are unaffected. Workspaces using `smallCard` will see body text shift from accent5 to tx2.
