## MODIFIED Requirements

### Requirement: Build-time bundling of AI reference content
The build step (`scripts/build-browser.js`) SHALL read the repository's `AI-CHAT.md`, `INSTRUCTIONS.md`, and `lib.d.ts` files and inline their combined text content, in that order, into the produced `pptx-forge.html`, so the running page has no dependency on fetching any of the three files at runtime.

#### Scenario: Built page contains the reference text with no network access
- **WHEN** `pptx-forge.html` is built and then opened via `file://`
- **THEN** the combined `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts` text is available to the page's JavaScript without any `fetch` or network request

#### Scenario: Chatbot instruction precedes the API reference
- **WHEN** the combined reference text is assembled
- **THEN** the content of `AI-CHAT.md` appears before the content of `INSTRUCTIONS.md`, which appears before the content of `lib.d.ts`

### Requirement: AI button copies the bundled reference, with a visible fallback
The system SHALL provide an AI button that attempts to copy the bundled `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts` reference text to the clipboard via the Clipboard API, and SHALL fall back to displaying the text in a read-only, pre-selected textarea when the Clipboard API is unavailable or the copy attempt throws.

#### Scenario: Clipboard API succeeds
- **WHEN** the user clicks the AI button and `navigator.clipboard.writeText` succeeds
- **THEN** the combined reference text (including the chatbot instruction) is copied to the clipboard and a status message confirms the copy

#### Scenario: Clipboard API unavailable or fails
- **WHEN** the user clicks the AI button and the Clipboard API is unavailable or the write attempt throws
- **THEN** a textarea containing the combined reference text (including the chatbot instruction) is shown with its content pre-selected, so the user can copy it manually
