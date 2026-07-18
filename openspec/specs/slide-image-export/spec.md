### Requirement: Every compiled slide is rendered to a PNG
When `--images`/`-i` is passed to `forge`, the system SHALL render each slide produced by the workspace's slide files to a PNG image using the same `pptxviewjs` canvas renderer used by the browser preview pane, driven by a headless `chromium-headless-shell` browser instance.

#### Scenario: Multi-slide workspace exports one PNG per slide
- **WHEN** user runs `npm run forge my-deck --images` on a workspace whose slide files compile to 5 slides
- **THEN** the system writes 5 PNG files, one per slide, in slide order

#### Scenario: A slide file producing multiple addSlide() calls exports each as a separate image
- **WHEN** a single slide `.js` file calls `pptx.addSlide()` more than once
- **THEN** each resulting slide is exported as its own numbered PNG, consistent with the deck's overall slide order

### Requirement: Image filenames follow the base-timestamp-index convention
Exported image filenames SHALL be `<workspaceSlug>-NN.png` by default, or `<workspaceSlug>_<timestamp>-NN.png` when `--snapshot` is also passed, reusing the exact timestamp string `--snapshot` computes for the `.pptx` filename. `NN` SHALL be the slide's 1-based index, zero-padded to at least 2 digits.

#### Scenario: Default filenames have no timestamp
- **WHEN** user runs `npm run forge my-deck --images` (no `--snapshot`)
- **THEN** files are named `my-deck-01.png`, `my-deck-02.png`, etc.

#### Scenario: Snapshot filenames include the shared timestamp
- **WHEN** user runs `npm run forge my-deck --images --snapshot`
- **THEN** files are named `my-deck_2026-06-29_14-30-00-01.png`, `my-deck_2026-06-29_14-30-00-02.png`, etc., using the identical timestamp as the `.pptx` written in the same run

### Requirement: Images are written to the workspace output folder and overwrite existing files
Exported PNGs SHALL be written to the same `out/` directory as the generated `.pptx` for that workspace. If a file already exists at the target path, it SHALL be overwritten.

#### Scenario: Images land next to the pptx
- **WHEN** user runs `npm run forge my-deck --images`
- **THEN** the PNG files are written to `workspaces/my-deck/out/`, the same directory as `my-deck.pptx`

#### Scenario: Re-running overwrites prior images
- **WHEN** user runs `npm run forge my-deck --images` twice in a row without `--snapshot`
- **THEN** the second run's PNG files replace the first run's files of the same name without error

### Requirement: Missing headless browser produces an actionable error
If the `chromium-headless-shell` browser binary required for image export is not installed, the system SHALL print an error identifying the missing binary and the exact command to install it (`npx playwright install chromium-headless-shell`), and exit with a non-zero code, without silently skipping image export or attempting to auto-install the browser.

#### Scenario: Browser not installed
- **WHEN** user runs `npm run forge my-deck --images` on a machine where `chromium-headless-shell` has never been installed
- **THEN** the system prints an error naming `chromium-headless-shell` and instructing the user to run `npx playwright install chromium-headless-shell`, and exits non-zero

#### Scenario: Browser already installed via e2e test setup
- **WHEN** user has previously run `npx playwright install` (which installs both `chromium` and `chromium-headless-shell` by default) for the e2e test suite, then runs `npm run forge my-deck --images`
- **THEN** image export succeeds with no additional install step

#### Scenario: Pptx is still written even if image export fails
- **WHEN** `chromium-headless-shell` is missing and `npm run forge my-deck --images` is run
- **THEN** the `.pptx` file is still generated successfully before the image-export error is reported
