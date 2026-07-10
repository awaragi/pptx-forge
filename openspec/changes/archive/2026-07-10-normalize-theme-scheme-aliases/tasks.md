## 1. Library

- [x] 1.1 Add `resolveSchemeRoleAliases` helper and `resolveThemeColors` export to `src/lib/theme.js`, mapping `dk1`→`tx1`, `lt1`→`bg1`, `dk2`→`tx2`, `lt2`→`bg2`, recursing through `theme.color` and `theme.shape` only.
- [x] 1.2 Wire `resolveThemeColors` into `createLib` in `src/lib/lib.js`: `resolveThemeColors(deepMerge(defaultTheme, overrides))`.

## 2. Templates and Docs

- [x] 2.1 Update `src/sample/theme.js` example `color` block to use the slot-name form (`dk1`/`lt1`/`dk2`/`lt2`), with a comment noting both forms resolve.
- [x] 2.2 Update `INSTRUCTIONS.md`'s `theme.scheme`/`theme.color` sections to document that `createLib` normalizes slot names to role aliases automatically.

## 3. Verification

- [x] 3.1 Rebuild `workspaces/rfp-mcn-openstack` with `theme.color`/`theme.shape` using slot-name form (`dk1`/`lt1`/`dk2`/`lt2`) and confirm the generated `slide1.xml` background resolves to `<a:schemeClr val="bg1"/>` (white), not a black fallback.
- [x] 3.2 Rebuild the remaining workspaces (`agentic-rfp-workshop`, `jira-kpi`, `ref-rfx`), which already use the role-alias form, and confirm no warnings and no output differences.
