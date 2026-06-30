## Why

`src/lib.js` is a monolithic 750-line file that is hard to navigate and extend. The component library also has naming inconsistencies (domain-baked names, size-as-role names) and is missing many UI patterns that recur across real decks — KPI stats, icon boxes, progress bars, step flows, image-backed cards, and native tables — forcing slide authors to hand-compose low-level primitives for every new deck.

## What Changes

- **BREAKING** Rename 5 components in `comp`: `smallCard→infoCard`, `benefitCard→accentCard`, `miniCard→overlayCard`, `artifactCard→fileCard`, `phaseBox→stepBox`
- **BREAKING** Add `tables` as a new top-level namespace on the `Lib` object (was not present)
- Split `src/lib.js` into `src/theme.js`, `src/primitives.js`, `src/components.js`, `src/tables.js`, `src/layout.js`, `src/frame.js`, `src/lib.js` (factory), and `src/index.js` (barrel)
- Add 10 new components to `comp`: `iconStat`, `iconBox`, `bulletIconList`, `imageCard`, `twoColumnRow`, `progressBar`, `tagBadge`, `stepFlow`, `imageHolder`, `labeledSection`
- Add 2 new components to `tables`: `dataTable`, `comparisonTable`
- Replace single-slide sample with a 7-slide component showcase
- Add `workspaces/RENAME-SUMMARY.md` mapping old → new names with search patterns for updating existing slides

## Capabilities

### New Capabilities

- `lib-module-split`: Source code split into per-concern modules under `src/`, with a barrel `src/index.js` re-exporting `createLib`

### Modified Capabilities

- `lib-api-contract`: `comp` group exports change (5 renames + 10 additions); new `tables` namespace added to `Lib`
- `lib-components-v2`: 5 BREAKING renames; 12 new components added across `comp` (10) and `tables` (2)
- `sample-template`: Single starter slide replaced with 7-slide showcase demonstrating all library components

## Impact

- `src/lib.js` — rewritten as thin factory; logic moves to sibling modules
- `src/index.js` — new barrel file
- `src/theme.js`, `src/primitives.js`, `src/components.js`, `src/tables.js`, `src/layout.js`, `src/frame.js` — new files
- `lib.d.ts` — updated for renames, new components, new `tables` group, new `Lib` shape
- `src/sample/slides/deck.js` — replaced with 7-slide showcase
- `workspaces/RENAME-SUMMARY.md` — new reference file (temporary, not tracked as a spec capability)
- Existing workspaces (`ref-rfx`, `measurable-ai-kpi`, `test`) — NOT updated in this change; author uses rename summary to update separately
