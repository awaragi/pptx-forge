## 1. Source Module Split

- [x] 1.1 Create `src/theme.js` — extract `defaultTheme` and `deepMerge` from `src/lib.js`, export both
- [x] 1.2 Create `src/primitives.js` — extract `text`, `roundRect`, `fillRect`, `circle`, `hLine`, `vLine`, `bullets`; export a `makePrimitives(theme)` factory
- [x] 1.3 Create `src/components.js` — extract all existing comp functions (applying renames); export a `makeComponents(theme, prim)` factory
- [x] 1.4 Create `src/tables.js` — implement `dataTable` and `comparisonTable`; export a `makeTables(theme, prim)` factory
- [x] 1.5 Create `src/layout.js` — extract all existing layout functions plus new `labeledSection`; export a `makeLayout(theme, prim)` factory
- [x] 1.6 Create `src/frame.js` — extract `border`, `slideHeader`, `slideFooter`; export a `makeFrame(theme, prim)` factory
- [x] 1.7 Rewrite `src/lib.js` as the factory assembler — imports from all sibling modules, assembles and exports `createLib`
- [x] 1.8 Create `src/index.js` barrel — single `export { createLib } from './lib.js'`
- [x] 1.9 Verify: `npm run forge sample` compiles without errors after the split

## 2. Theme Defaults — New Shape Stanzas

- [x] 2.1 Add `iconStat` stanza to `defaultTheme.shape` (`valueColor: 'accent1'`, `labelColor: 'tx2'`)
- [x] 2.2 Add `iconBox` stanza (`bgColor: 'bg2'`, `borderColor: 'accent6'`, `iconColor: 'accent1'`, `titleColor: 'tx1'`, `bodyColor: 'tx2'`)
- [x] 2.3 Add `imageCard` stanza (`imageColor: 'bg2'`, `imageBorderColor: 'accent6'`, `bgColor: 'bg1'`, `borderColor: 'accent6'`, `titleColor: 'tx1'`, `bodyColor: 'tx2'`, plus shadow matching `card.shadow`)
- [x] 2.4 Add `progressBar` stanza (`fillColor: 'accent1'`, `trackColor: 'bg2'`, `labelColor: 'tx2'`, `pctColor: 'tx1'`)
- [x] 2.5 Add `tagBadge` stanza (`bgColor: 'accent1'`, `textColor: 'bg1'`)
- [x] 2.6 Add `dataTable` stanza (`headerBgColor: 'accent1'`, `headerTextColor: 'bg1'`, `rowBgColor: 'bg1'`, `altBgColor: 'bg2'`, `borderColor: 'accent6'`, `textColor: 'tx2'`, `headerFontSize` refs `theme.size.badge`)
- [x] 2.7 Add `comparisonTable` stanza (`headerBgColor: 'tx1'`, `headerTextColor: 'accent1'`, `criteriaColor: 'tx1'`, `valueColor: 'tx2'`, `borderColor: 'accent6'`)

## 3. Component Renames

- [x] 3.1 Rename `smallCard` → `infoCard` in `src/components.js`
- [x] 3.2 Rename `benefitCard` → `accentCard` in `src/components.js`
- [x] 3.3 Rename `miniCard` → `overlayCard` in `src/components.js`
- [x] 3.4 Rename `artifactCard` → `fileCard` in `src/components.js`
- [x] 3.5 Rename `phaseBox` → `stepBox` in `src/components.js`
- [x] 3.6 Update `return` object in `src/lib.js` `comp` namespace to use all new names

## 4. New `comp` Components

- [x] 4.1 Implement `iconStat(slide, box, { value, label, icon }, opts, name)` in `src/components.js`
- [x] 4.2 Implement `iconBox(slide, box, { icon, title, body }, opts, name)` in `src/components.js`
- [x] 4.3 Implement `bulletIconList(slide, box, items, opts, name)` in `src/components.js` — each item is `{ icon, text }`, renders as paired text runs per line
- [x] 4.4 Implement `imageCard(slide, box, { image, title, body, imageH }, opts, name)` in `src/components.js` — emoji placeholder in filled band
- [x] 4.5 Implement `twoColumnRow(slide, box, { label, content }, opts, name)` in `src/components.js` — `splitRatio` defaults to `0.35`
- [x] 4.6 Implement `progressBar(slide, box, { value, label, showPct }, opts, name)` in `src/components.js` — track + fill rects + optional pct text
- [x] 4.7 Implement `tagBadge(slide, box, { label }, opts, name)` in `src/components.js` — filled roundRect pill
- [x] 4.8 Implement `stepFlow(slide, box, items, opts, name)` in `src/components.js` — auto-distributes `flowBox`+`flowArrow` across `box.w`; handles `n=1` case
- [x] 4.9 Implement `imageHolder(slide, box, { icon, label }, opts, name)` in `src/components.js` — dashed/thin-border rect with centered emoji and small label
- [x] 4.10 Implement `labeledSection(slide, box, { title, subtitle }, opts, name)` in `src/layout.js` — composes `sectionTitle` + `darkPanelHeader`

## 5. New `tables` Components

- [x] 5.1 Implement `dataTable(slide, box, { headers, rows }, opts, name)` in `src/tables.js` — uses `slide.addTable()`, equal column widths, alternating row fills
- [x] 5.2 Implement `comparisonTable(slide, box, { headers, rows }, opts, name)` in `src/tables.js` — first column is `criteriaW` wide, remaining split equally; supports UTF-8 symbols as cell values

## 6. TypeScript Declaration Update

- [x] 6.1 Add `TablesGroup` interface to `lib.d.ts` with `dataTable` and `comparisonTable` signatures
- [x] 6.2 Add `TablesDataContent` and `TablesComparisonContent` interfaces
- [x] 6.3 Add `IconStatShape`, `IconBoxShape`, `ImageCardShape`, `ProgressBarShape`, `TagBadgeShape`, `DataTableShape`, `ComparisonTableShape` interfaces
- [x] 6.4 Add all new shape interfaces as properties on `ThemeShape`
- [x] 6.5 Update `CompGroup` in `lib.d.ts` — replace old 9 names with 19 new names and add signatures for all 10 new components
- [x] 6.6 Update `LayoutGroup` in `lib.d.ts` — add `labeledSection` signature
- [x] 6.7 Update top-level `Lib` interface — add `tables: TablesGroup`
- [x] 6.8 Update renamed content object interfaces (`SmallCardContent→InfoCardContent`, etc.) and update all references

## 7. Rename Summary File

- [x] 7.1 Create `workspaces/RENAME-SUMMARY.md` — table with old name, new name, and find/replace pattern for each of the 5 renames

## 8. Sample Showcase

- [x] 8.1 Rewrite `src/sample/slides/deck.js` — Slide 1: Primitives (text, roundRect, circle, hLine, vLine, bullets)
- [x] 8.2 Add Slide 2: Cards & Icon Components (infoCard, accentCard, overlayCard, fileCard, iconBox, imageCard, imageHolder)
- [x] 8.3 Add Slide 3: Flow & Steps (flowBox, flowArrow, stepFlow, numberedStep, stepBox, phaseLabel)
- [x] 8.4 Add Slide 4: Stats, Progress & Tags (iconStat, progressBar, tagBadge, bulletIconList, twoColumnRow)
- [x] 8.5 Add Slide 5: Layout Blocks (sectionTitle, darkPanelHeader, labeledDivider, calloutBanner, pullQuote, labeledSection)
- [x] 8.6 Add Slide 6: Tables (dataTable, comparisonTable)
- [x] 8.7 Add Slide 7: Full Frame Example (explicit border + header + footer with annotated content)
- [x] 8.8 Verify: `npm run forge sample -- --open` produces a 7-slide deck with all components visible
