## ADDED Requirements

### Requirement: Build-time bundling of AI reference content
The build step (`scripts/build-browser.js`) SHALL read the repository's `INSTRUCTIONS.md` and `lib.d.ts` files and inline their combined text content into the produced `pptx-forge.html`, so the running page has no dependency on fetching either file at runtime.

#### Scenario: Built page contains the reference text with no network access
- **WHEN** `pptx-forge.html` is built and then opened via `file://`
- **THEN** the combined `INSTRUCTIONS.md` + `lib.d.ts` text is available to the page's JavaScript without any `fetch` or network request

### Requirement: AI button copies the bundled reference, with a visible fallback
The system SHALL provide an AI button that attempts to copy the bundled reference text to the clipboard via the Clipboard API, and SHALL fall back to displaying the text in a read-only, pre-selected textarea when the Clipboard API is unavailable or the copy attempt throws.

#### Scenario: Clipboard API succeeds
- **WHEN** the user clicks the AI button and `navigator.clipboard.writeText` succeeds
- **THEN** the reference text is copied to the clipboard and a status message confirms the copy

#### Scenario: Clipboard API unavailable or fails
- **WHEN** the user clicks the AI button and the Clipboard API is unavailable or the write attempt throws
- **THEN** a textarea containing the reference text is shown with its content pre-selected, so the user can copy it manually
