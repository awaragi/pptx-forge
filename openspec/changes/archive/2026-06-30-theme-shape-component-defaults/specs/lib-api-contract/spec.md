## ADDED Requirements

### Requirement: lib.d.ts declares ThemeShape and per-component sub-interfaces
`lib.d.ts` SHALL declare a `ThemeShape` interface describing the full structure of `theme.shape`, with nested interfaces for each component namespace. The `Lib` interface's `theme` property SHALL be updated to expose `theme.shape` as `ThemeShape`. All component namespace sub-interfaces (`CardShape`, `ArtifactCardShape`, `MiniCardShape`, `PhaseLabelShape`, `FlowBoxShape`, `FlowArrowShape`, `DividerShape`, `CalloutBannerShape`, `DarkPanelHeaderShape`, `PullQuoteShape`, `SectionTitleShape`, `FrameShape`) SHALL be declared. The `ShadowOpts` interface (already present) SHALL be reused for `CardShape.shadow`.

#### Scenario: ThemeShape is exported and complete
- **WHEN** `lib.d.ts` is inspected
- **THEN** it exports `ThemeShape` with top-level properties `radius`, `borderW`, `accentW`, `card`, `artifactCard`, `miniCard`, `phaseLabel`, `flowBox`, `flowArrow`, `divider`, `calloutBanner`, `darkPanelHeader`, `pullQuote`, `sectionTitle`, `frame`

#### Scenario: CardShape includes shadow
- **WHEN** `lib.d.ts` is inspected
- **THEN** `CardShape` contains `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, and `shadow: ShadowOpts`

#### Scenario: FrameShape includes all frame color and geometry fields
- **WHEN** `lib.d.ts` is inspected
- **THEN** `FrameShape` contains `badgeRadius`, `borderColor`, `badgeColor`, `badgeTextColor`, `wordmarkColor`, `footerLineColor`, `footerTextColor`

#### Scenario: DividerShape includes both geometry and color fields
- **WHEN** `lib.d.ts` is inspected
- **THEN** `DividerShape` contains `color`, `badgeTextColor`, `lineWidth`, `badgeW`, `badgeH`, `gap`

#### Scenario: theme.shape is typed as ThemeShape in Lib
- **WHEN** `lib.d.ts` is inspected
- **THEN** the `Lib` interface exposes `theme: { shape: ThemeShape; scheme: any; color: any; size: any; font: any; grid: any; header: any; footer: any; }` or equivalent
