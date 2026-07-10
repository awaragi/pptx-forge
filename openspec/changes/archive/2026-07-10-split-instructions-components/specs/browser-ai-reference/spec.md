## MODIFIED Requirements

### Requirement: Build-time bundling of AI reference content
The build step (`scripts/build-browser.js`) SHALL read the repository's `AI-CHAT.md`, `INSTRUCTIONS.md`, and `lib.d.ts` files and inline their combined text content, in that order, into the produced `pptx-forge.html`, so the running page has no dependency on fetching any of these files at runtime. It SHALL additionally read `COMPONENTS.md` and inline its text content as a separate, independently-addressable constant, so the running page's JavaScript can choose at runtime whether to append it to the base reference.

#### Scenario: Built page contains the base reference text with no network access
- **WHEN** `pptx-forge.html` is built and then opened via `file://`
- **THEN** the combined `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts` text is available to the page's JavaScript without any `fetch` or network request

#### Scenario: Built page contains the components reference text with no network access
- **WHEN** `pptx-forge.html` is built and then opened via `file://`
- **THEN** the `COMPONENTS.md` text is available to the page's JavaScript, as a value distinct from the base reference, without any `fetch` or network request

#### Scenario: Chatbot instruction precedes the API reference
- **WHEN** the base reference text is assembled
- **THEN** the content of `AI-CHAT.md` appears before the content of `INSTRUCTIONS.md`, which appears before the content of `lib.d.ts`

---

### Requirement: AI button copies the bundled reference, with a visible fallback
The system SHALL provide an AI button that attempts to copy the assembled reference text to the clipboard via the Clipboard API, and SHALL fall back to displaying the text in a read-only, pre-selected textarea when the Clipboard API is unavailable or the copy attempt throws. The assembled text SHALL be the base `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts` reference, with the `COMPONENTS.md` text appended when the "include components" toggle (see below) is on at the moment the button is clicked, and omitted when it is off.

#### Scenario: Clipboard API succeeds with components excluded
- **WHEN** the user clicks the AI button while the "include components" toggle is off, and `navigator.clipboard.writeText` succeeds
- **THEN** the base reference text (chatbot instruction + `INSTRUCTIONS.md` + `lib.d.ts`, no `COMPONENTS.md` content) is copied to the clipboard and a status message confirms the copy

#### Scenario: Clipboard API succeeds with components included
- **WHEN** the user clicks the AI button while the "include components" toggle is on, and `navigator.clipboard.writeText` succeeds
- **THEN** the base reference text with `COMPONENTS.md` content appended is copied to the clipboard and a status message confirms the copy

#### Scenario: Clipboard API unavailable or fails
- **WHEN** the user clicks the AI button and the Clipboard API is unavailable or the write attempt throws
- **THEN** a textarea containing the same assembled reference text (base reference, plus `COMPONENTS.md` if the toggle was on) is shown with its content pre-selected, so the user can copy it manually

## ADDED Requirements

### Requirement: Include-components toggle in the browser tool
The browser tool SHALL provide an "include components" toggle control adjacent to the AI button. It SHALL default to off on page load and on starting a new project. Its state SHALL NOT be persisted to `sessionStorage` or any other storage — reloading the page always resets it to off, independent of any other workspace state.

#### Scenario: Toggle defaults to off on load
- **WHEN** the browser tool loads for the first time, or a saved workspace is restored from `sessionStorage`
- **THEN** the "include components" toggle is unchecked

#### Scenario: Toggle resets on reload regardless of prior state
- **WHEN** the user checks the "include components" toggle and then reloads the page
- **THEN** the toggle is unchecked again after reload, even though other workspace state (slides, theme, output filename) is restored

#### Scenario: Toggling does not affect persisted workspace state
- **WHEN** the user changes the "include components" toggle
- **THEN** no write to `sessionStorage` occurs as a result of that change alone

### Requirement: AI-CHAT.md gives file-agnostic instructions
`AI-CHAT.md` SHALL instruct the assisting AI to use "the reference sections below" (or equivalent generic phrasing) without naming `INSTRUCTIONS.md`, `COMPONENTS.md`, or `lib.d.ts` specifically by name in its own instructional prose, since the assembled reference may or may not include a components section depending on the toggle state at copy time.

#### Scenario: Instruction is correct with components excluded
- **WHEN** the assembled reference has the toggle off (no `COMPONENTS.md` section) and a chatbot reads `AI-CHAT.md`'s instruction followed by the rest of the bundle
- **THEN** the instruction text accurately describes what follows without claiming a components section exists

#### Scenario: Instruction is correct with components included
- **WHEN** the assembled reference has the toggle on (with a `COMPONENTS.md` section appended) and a chatbot reads `AI-CHAT.md`'s instruction followed by the rest of the bundle
- **THEN** the instruction text accurately describes what follows, including the components section
