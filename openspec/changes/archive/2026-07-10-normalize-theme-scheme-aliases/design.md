## Context

`theme.scheme` holds the 10 PowerPoint theme slot hex defaults, keyed `dk1`/`lt1`/`dk2`/`lt2`/`accent1`-`accent6`. `theme.color` (workspace semantic names) and `theme.shape` (per-component color defaults) hold values that are handed straight through to `pptxgenjs`'s `color`/`fill.color`/`line.color` fields with no lookup step — there has never been a resolver that walks `theme.color.X` → `theme.scheme.Y` → hex. Instead, the codebase relies on `pptxgenjs` itself recognizing certain literal strings (`accent1`-`accent6`, `tx1`, `tx2`, `bg1`, `bg2`) as live references to `<a:schemeClr>` XML, resolved by PowerPoint at render time against `ppt/theme/theme1.xml` (which `bin/forge.js` patches from `theme.scheme`).

The problem: `pptxgenjs`'s accepted-value enum (`SchemeColor` in `pptxgenjs/dist/pptxgen.es.js`) only includes `tx1`/`tx2`/`bg1`/`bg2`/`accent1`-`accent6` — it does not include `dk1`/`lt1`/`dk2`/`lt2`, even though those are the OOXML slot names and the actual keys of `theme.scheme`. `tx1`/`bg1`/`tx2`/`bg2` are PowerPoint's fixed role-alias redirects onto `dk1`/`lt1`/`dk2`/`lt2` respectively — same underlying slots, different name. When a `theme.color`/`theme.shape` value used the slot name form (e.g. `'lt1'`), `pptxgenjs.createColorElement()` failed its validity check and silently substituted `DEF_FONT_COLOR = '000000'`, with only a `console.warn` as a trace. This produced a black background in `workspaces/rfp-mcn-openstack/theme.js` where `color.surface: 'lt1'` was expected to mean white.

## Goals / Non-Goals

**Goals:**
- Accept both the slot-name form (`dk1`/`lt1`/`dk2`/`lt2`) and the role-alias form (`tx1`/`bg1`/`tx2`/`bg2`) anywhere a color is consumed from `theme.color`/`theme.shape`, so workspace authors don't need to know `pptxgenjs`'s narrower enum.
- Fix this once, centrally, rather than requiring every workspace `theme.js` to avoid the slot-name form.
- Leave `theme.scheme` itself untouched — its values are literal hex, not scheme-name references, and are consumed differently (regex-patched into `theme1.xml` by `bin/forge.js`).

**Non-Goals:**
- Building a general alias-resolution/lookup system that follows arbitrary chains (e.g. `theme.color.surface` → `theme.scheme.lt1` → hex). The existing design intentionally leans on `pptxgenjs`/PowerPoint's own live `schemeClr` reference mechanism; this change only normalizes the two known-equivalent name spellings for that mechanism's accepted enum.
- Changing how `bin/forge.js` patches `theme1.xml` from `theme.scheme` — unaffected by this change.
- Validating/erroring on genuinely invalid color strings — `pptxgenjs`'s existing fallback-to-black-with-console-warn behavior is left as is for actual mistakes.

## Decisions

**Normalize at theme-construction time in `createLib`, not at each call site.** `theme.color` and `theme.shape` are the two places workspace-supplied color values enter the system, and every primitive/component/table/frame helper reads colors from the already-constructed `theme` object. Normalizing once when `createLib` assembles `theme` (immediately after `deepMerge`) guarantees every consumer downstream sees only `pptxgenjs`-safe values, without touching `primitives.js`, `components.js`, `tables.js`, `layout.js`, or `frame.js`. Alternative considered: wrap the `slide` object's `addShape`/`addText`/etc. methods to normalize colors at the `pptxgenjs` boundary — rejected because `slide` is a plain `pptxgenjs` instance never wrapped by this library, `slide.background = {...}` is a property assignment (not interceptable without a `Proxy`), and colors appear under many different opts keys (`color`, `fill.color`, `line.color`, `shadow.color`, ...), making a boundary-wrapper approach far more invasive than a one-time theme walk.

**Blanket string substitution, no path/key awareness.** `resolveSchemeRoleAliases` treats any string leaf under `theme.color`/`theme.shape` that exactly equals `dk1`/`lt1`/`dk2`/`lt2` as a scheme-slot reference and rewrites it. This is safe because those four tokens never appear as anything other than scheme-slot references within `theme.color`/`theme.shape` (the only other leaf types in those subtrees are hex strings, `accent1`-`accent6`/`tx1`/`bg1`/`tx2`/`bg2` strings, and numeric geometry values like `radius`/`borderW`/`opacity`). Alternative considered: only normalize known "color-ish" keys (`bgColor`, `titleColor`, `color`, etc.) by name — rejected as unnecessary extra complexity given the blanket approach is already provably safe for this data shape, and new component namespaces would otherwise need to remember to add their color keys to an allowlist.

**`theme.scheme` is excluded from the walk.** `resolveThemeColors` only recurses into `theme.color` and `theme.shape`, explicitly rebuilding the returned object as `{ ...theme, color: ..., shape: ... }` rather than deep-walking the whole theme. This avoids any risk of corrupting `theme.scheme`'s literal hex values (which happen to be stored under keys named `dk1`/`lt1`/`dk2`/`lt2` but are values, not references) or unrelated theme sections (`font`, `size`, `grid`, `header`, `footer`).

## Risks / Trade-offs

- **[Risk]** A future component namespace could store a color value as `'dk1'` intending it as plain text rather than a scheme reference (e.g. inside `header`/`footer` strings) → **Mitigation**: normalization is scoped to `theme.color`/`theme.shape` only, which by construction only ever hold color values, not display text; `header`/`footer` are excluded from the walk.
- **[Risk]** Silent normalization could mask a workspace author's intent if they genuinely meant the literal 4-char string `'dk1'` for some non-color purpose inside `shape` → **Mitigation**: every existing `shape.*` namespace's schema (documented in `INSTRUCTIONS.md`'s theme.shape table) only stores colors and numeric geometry; no namespace stores arbitrary strings, so this scenario doesn't arise in practice.

## Migration Plan

No migration needed — purely additive/widening at the library level. Existing workspaces using the role-alias form (`tx1`/`bg1`/`tx2`/`bg2`) are unaffected (`resolveSchemeRoleAliases` passes those strings through unchanged). Verified by rebuilding all four existing workspaces (`rfp-mcn-openstack`, `agentic-rfp-workshop`, `jira-kpi`, `ref-rfx`) — no warnings, no output differences.

## Open Questions

None.
