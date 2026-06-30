## 1. Restructure defaultTheme.shape in lib.js

- [x] 1.1 Remove `radiusLg`, `shadowDark`, and `accentW` from global `defaultTheme.shape`
- [x] 1.2 Move `shadow` from global `defaultTheme.shape` into `defaultTheme.shape.card.shadow`
- [x] 1.3 Add `card` namespace with `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, `shadow`
- [x] 1.4 Add `artifactCard` namespace with `bgColor`, `borderColor`, `filenameColor`, `purposeColor`, `stepColor`
- [x] 1.5 Add `miniCard` namespace with `titleColor`, `bodyColor`
- [x] 1.6 Add `phaseLabel` namespace with `badgeColor`, `badgeTextColor`, `lineColor`
- [x] 1.7 Add `flowBox` namespace with `bgColor`, `borderColor`, `textColor`, `highlightBgColor`, `highlightTextColor`
- [x] 1.8 Add `flowArrow` namespace with `color`
- [x] 1.9 Add `divider` namespace with `color`, `badgeTextColor`, `lineWidth`, `badgeW`, `badgeH`, `gap`
- [x] 1.10 Add `calloutBanner` namespace with `bgColor`, `accentColor`, `textColor`, `accentW` (moved from global)
- [x] 1.11 Add `darkPanelHeader` namespace with `bgColor`, `titleColor`, `subtitleColor`
- [x] 1.12 Add `pullQuote` namespace with `color`
- [x] 1.13 Add `sectionTitle` namespace with `color`
- [x] 1.14 Add `frame` namespace with `badgeRadius`, `borderColor`, `badgeColor`, `badgeTextColor`, `wordmarkColor`, `footerLineColor`, `footerTextColor`

## 2. Add deepMerge and wire into createLib

- [x] 2.1 Implement `deepMerge(defaults, overrides)` helper above `createLib` — recursively merges plain objects, replaces all other value types
- [x] 2.2 Replace the five explicit top-level merges (`scheme`, `color`, `header`, `footer`, and the missing `shape`) in `createLib` with a single `const theme = deepMerge(defaultTheme, overrides)` call
- [x] 2.3 Verify `theme.scheme`, `theme.color`, `theme.header`, `theme.footer`, and `theme.shape` all resolve correctly after the merge change

## 3. Update component functions to read from theme.shape

- [x] 3.1 `comp.smallCard` — read `bgColor`, `borderColor`, `titleColor`, `bodyColor` from `theme.shape.card` (body changes from `'accent5'` to `theme.shape.card.bodyColor`)
- [x] 3.2 `comp.benefitCard` — read `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, `shadow` from `theme.shape.card`
- [x] 3.3 `comp.phaseBox` — read `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, `shadow` from `theme.shape.card`
- [x] 3.4 `comp.numberedStep` — read `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, `shadow` from `theme.shape.card`
- [x] 3.5 `comp.artifactCard` — read `bgColor`, `borderColor`, `filenameColor`, `purposeColor`, `stepColor` from `theme.shape.artifactCard` (filenameColor still overridable via opts)
- [x] 3.6 `comp.miniCard` — read `titleColor`, `bodyColor` opts defaults from `theme.shape.miniCard`
- [x] 3.7 `comp.phaseLabel` — read `badgeColor`, `badgeTextColor`, `lineColor` from `theme.shape.phaseLabel`
- [x] 3.8 `comp.flowBox` — read all colors from `theme.shape.flowBox`
- [x] 3.9 `comp.flowArrow` — read `color` from `theme.shape.flowArrow`
- [x] 3.10 `layout.labeledDivider` — read `color`, `badgeTextColor`, `lineWidth`, `badgeW`, `badgeH`, `gap` opts defaults from `theme.shape.divider`
- [x] 3.11 `layout.calloutBanner` — read `bgColor`, `accentColor`, `textColor`, `accentW` opts defaults from `theme.shape.calloutBanner`
- [x] 3.12 `layout.darkPanelHeader` — read `bgColor`, `titleColor`, `subtitleColor` opts defaults from `theme.shape.darkPanelHeader`
- [x] 3.13 `layout.pullQuote` — read `color` opts default from `theme.shape.pullQuote`
- [x] 3.14 `layout.sectionTitle` — read `color` opts default from `theme.shape.sectionTitle`
- [x] 3.15 `frame.border` — read `borderColor` from `theme.shape.frame`
- [x] 3.16 `frame.slideHeader` — read `badgeRadius`, `badgeColor`, `badgeTextColor`, `wordmarkColor` from `theme.shape.frame`
- [x] 3.17 `frame.slideFooter` — read `footerLineColor`, `footerTextColor` from `theme.shape.frame`

## 4. Update lib.d.ts type declarations

- [x] 4.1 Add `ShadowShape` interface (or reuse `ShadowOpts`) for the shadow sub-object fields
- [x] 4.2 Add `CardShape`, `ArtifactCardShape`, `MiniCardShape`, `PhaseLabelShape`, `FlowBoxShape`, `FlowArrowShape` interfaces
- [x] 4.3 Add `DividerShape`, `CalloutBannerShape`, `DarkPanelHeaderShape`, `PullQuoteShape`, `SectionTitleShape`, `FrameShape` interfaces
- [x] 4.4 Add top-level `ThemeShape` interface referencing all component sub-interfaces and global fields (`radius`, `borderW`)
- [x] 4.5 Update the `Lib` interface's `theme` property to type `shape` as `ThemeShape`

## 5. Update INSTRUCTIONS.md

- [x] 5.1 Add `theme.shape` subsection under the Theme Object section — list global keys and all component namespaces with their properties and default values
- [x] 5.2 Document the three-level resolution order: `opts` → `theme.shape.<namespace>.<prop>` → system default
- [x] 5.3 Add a concrete `theme.js` example showing a partial `shape` export (e.g., changing `card.borderColor`, `card.shadow.opacity`, and `divider.lineWidth`)
- [x] 5.4 Note the `smallCard` body color change (`accent5` → `tx2`) and that workspaces can restore it via `shape.card.bodyColor`
