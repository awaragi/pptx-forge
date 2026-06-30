## Context

`lib.js` contains `defaultTheme.shape` with geometry constants (`radius`, `borderW`, `radiusLg`, `accentW`) and a drop shadow object. Components already reference `theme.shape.*` for these values — but `createLib` never includes `shape` in its override merge. A workspace `theme.js` that exports `shape: { radius: 0.2 }` has zero effect today.

Beyond geometry, every component hardcodes its color choices as scheme-slot string literals (`'accent6'`, `'tx1'`, `'bg1'`, etc.) directly inside function bodies and opts defaults. There is no workspace-level knob to change, say, every card's border color without touching `lib.js` or overriding at every call site.

## Goals / Non-Goals

**Goals:**
- Enable workspace-level overrides of per-component visual parameters (geometry + colors) via `theme.shape` in `theme.js`
- Create a single source of truth for component color defaults, eliminating hardcoded literals scattered across component functions
- Unify `smallCard` body text color with the rest of the card family (`tx2` instead of `accent5`)
- Remove the dead `shadowDark` constant (defined, never referenced)
- Move `shadow` from global scope into `card` namespace (its only actual users)
- Move `radiusLg` into `frame.badgeRadius` (its only actual user is `slideHeader`)

**Non-Goals:**
- Changing per-call `opts` API — opts already win over everything and remain unchanged
- Component function signature changes
- Supporting inheritance chains between namespaces (e.g., `card.*` falling back to a parent)
- Exporting `theme.shape` as a public API for slide files to read directly

## Decisions

### Decision: `deepMerge` helper instead of explicit per-namespace merge lines

Adding one line per namespace to `createLib`'s merge block (`card: { ...defaults.card, ...overrides.card }`, etc.) creates a maintenance trap — a new namespace added to `defaultTheme.shape` silently becomes non-overridable if the merge line is forgotten. A small recursive `deepMerge` (~10 lines) handles all current and future namespaces automatically, and handles the two-level nesting (`shape.card.shadow`) that a one-level merge would clobber.

Replaces all five current explicit top-level merges (`scheme`, `color`, `header`, `footer`, and the missing `shape`) with a single `deepMerge(defaultTheme, overrides)` call.

**Alternative rejected**: External merge library — adds a production dependency for 10 lines of straightforward recursion.

### Decision: Component namespaces live inside `theme.shape`, not a new top-level key

`theme.shape` already exists and is referenced ~20 times in `lib.js`. Introducing `theme.style` would require touching every existing reference for no net benefit.

### Decision: Shared `card` namespace for `smallCard`, `benefitCard`, `phaseBox`, `numberedStep`

All four share the same visual DNA (bg, border, shadow, title/body text). Separate namespaces would require workspaces to update multiple keys to change a global card style — defeating the purpose. `smallCard`'s previous `bodyColor: 'accent5'` default was an inconsistency relative to the family; unifying to `tx2` removes it.

**Trade-off**: `smallCard` body text shifts from `accent5` (green) to `tx2` (dark grey). Visual breaking change for existing workspaces, but intentional. Workspaces that want the old behavior set `shape: { card: { bodyColor: 'accent5' } }`.

### Decision: `accentBlock` removed

`accentBlock` was never called from any workspace or slide file — it existed only in `lib.js`, `lib.d.ts`, and documentation. Dead component; removed.

### Decision: `accentW` moves from global scope to `calloutBanner.accentW`

`accentW` was shared between `accentBlock` and `calloutBanner`. With `accentBlock` removed, `calloutBanner` is its only user. Placing it in `calloutBanner.accentW` makes the scope accurate and removes it from the global namespace.

### Decision: `artifactCard` gets its own namespace, not merged into `card`

`artifactCard` has meaningfully different visual semantics: `bg2` background (not `bg1`), no shadow, distinct color roles (`filenameColor`, `purposeColor`, `stepColor`). Folding it into the card family would require nullable fields or incorrect defaults.

## Risks / Trade-offs

- **`smallCard` body color visual change** → Intentional. No backward compatibility accommodation; workspaces re-generate decks from source.
- **`deepMerge` replaces arrays by reference** → Arrays inside `theme.shape` (none currently) would be replaced, not merged. Not a concern for the current data shape.
- **Increased `theme.shape` surface area** → Additive. Workspaces without a `shape` export are completely unaffected.

## Migration Plan

No workspace migration required. Existing `theme.js` files without a `shape` export continue working unchanged. The only visible effect for existing workspaces is the `smallCard` body color shift.

Implementation order in `lib.js`:
1. Add `deepMerge` helper above `createLib`
2. Restructure `defaultTheme.shape` with component namespaces (remove `radiusLg`, `shadowDark`, `accentW`; move `shadow` into `card`; move `accentW` into `calloutBanner`)
3. Replace the five explicit top-level merges in `createLib` with `deepMerge(defaultTheme, overrides)`
4. Update each component function to read from `theme.shape.<namespace>.*` instead of hardcoded strings
5. Update `lib.d.ts` — add `ThemeShape` and sub-interfaces; update `Lib.theme` type
6. Update `INSTRUCTIONS.md` — add `theme.shape` documentation section
