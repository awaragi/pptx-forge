## ADDED Requirements

### Requirement: Help button in the topbar
The system SHALL provide a `?` icon button positioned immediately next to the brand/version tag in the topbar, which opens the help modal on click.

#### Scenario: Help button is visible next to the brand
- **WHEN** the browser tool loads
- **THEN** a `?` button is shown immediately adjacent to the "pptx-forge" brand/version text, before the workspace group

#### Scenario: Clicking the help button opens the modal
- **WHEN** the user clicks the `?` button
- **THEN** the help modal becomes visible, showing screen 1 ("Welcome")

### Requirement: Paginated help modal with six screens
The system SHALL present help content as six screens, in this order: Welcome, Workspaces, Slides & Editor, Import/Export, AI Tooling, Forge & Download. Each screen SHALL show a heading and explanatory content for its topic. Only one screen is visible at a time.

#### Scenario: Screens appear in the defined order
- **WHEN** the user pages forward from screen 1 through screen 6 using Next
- **THEN** the screens appear in the order Welcome, Workspaces, Slides & Editor, Import/Export, AI Tooling, Forge & Download

#### Scenario: AI Tooling screen explains the copy/paste bridge
- **WHEN** the user navigates to the "AI Tooling" screen
- **THEN** the content explains that the ✨ AI button copies a reference bundle to the clipboard for pasting into an external AI chat, and that generated slide code must be pasted back into the editor manually — there is no live/embedded connection

#### Scenario: Help content references real icon glyphs
- **WHEN** a screen's content refers to a specific toolbar or sidebar action that has an icon button in the app (e.g. rename, import, export, move, copy)
- **THEN** the content renders that action's actual icon glyph inline, using the same `.icon-btn`/`.icon-<name>` CSS classes the real button uses, rather than only naming the action in text

### Requirement: Welcome screen states the local-only execution guarantee prominently
The Welcome screen (screen 1) SHALL state, as the most prominent content on that screen — ahead of any other explanatory text, in a visually distinct callout rather than buried inside a regular paragraph — that the tool runs entirely locally in the browser: user scripts, slide content, and workspace data are never transmitted anywhere, and the tool makes no network requests of any kind.

#### Scenario: Local-only statement is the first thing shown on Welcome
- **WHEN** the user views screen 1 ("Welcome")
- **THEN** a visually distinct statement (e.g. a callout or banner, not a plain sentence mid-paragraph) appears before any other body content, declaring that all execution is local and no user data (scripts, slide content, workspace files) is ever transmitted off the user's machine

#### Scenario: Statement covers scripts, data, and content without qualification
- **WHEN** the local-only statement is read on its own, out of context
- **THEN** it unambiguously covers all user-authored input (slide `.js` files, `theme.js`, any pasted/imported content) and does not imply any exception, opt-in analytics, or "phone home" behavior

### Requirement: Prev/Next screen navigation
The system SHALL provide Prev and Next buttons in the modal that move to the adjacent screen. The Prev button SHALL be disabled on screen 1, and the Next button SHALL be disabled on screen 6. Navigation does not wrap around.

#### Scenario: Next advances by one screen
- **WHEN** the user clicks Next while on screen N (N < 6)
- **THEN** the modal shows screen N+1

#### Scenario: Prev goes back by one screen
- **WHEN** the user clicks Prev while on screen N (N > 1)
- **THEN** the modal shows screen N-1

#### Scenario: Prev is disabled on the first screen
- **WHEN** the modal is showing screen 1
- **THEN** the Prev button is disabled

#### Scenario: Next is disabled on the last screen
- **WHEN** the modal is showing screen 6
- **THEN** the Next button is disabled

### Requirement: Clickable dot indicators
The system SHALL show one dot indicator per screen along the bottom of the modal, reflecting which screen is currently active, and SHALL allow the user to click any dot to jump directly to that screen.

#### Scenario: The active screen's dot is visually distinguished
- **WHEN** the modal is showing screen N
- **THEN** the Nth dot is shown in an active/highlighted state and the others are not

#### Scenario: Clicking a dot jumps to that screen
- **WHEN** the user clicks the dot for screen M while on a different screen
- **THEN** the modal immediately shows screen M, regardless of whether M is adjacent to the current screen

### Requirement: Modal closing
The system SHALL close the help modal when the user clicks its close (✕) button, clicks the backdrop outside the panel, or presses Escape while the modal is open.

#### Scenario: Close button dismisses the modal
- **WHEN** the user clicks the ✕ button in the help modal
- **THEN** the modal is hidden

#### Scenario: Clicking the backdrop dismisses the modal
- **WHEN** the user clicks outside the modal panel, on the dimmed backdrop
- **THEN** the modal is hidden

#### Scenario: Escape key dismisses the modal
- **WHEN** the help modal is open and the user presses Escape
- **THEN** the modal is hidden

### Requirement: Arrow-key screen navigation while the modal is open
The system SHALL, while the help modal is open, move to the next screen on Right arrow and the previous screen on Left arrow, subject to the same first/last-screen limits as the Prev/Next buttons.

#### Scenario: Right arrow advances a screen
- **WHEN** the help modal is open on screen N (N < 6) and the user presses the Right arrow key
- **THEN** the modal shows screen N+1

#### Scenario: Left arrow goes back a screen
- **WHEN** the help modal is open on screen N (N > 1) and the user presses the Left arrow key
- **THEN** the modal shows screen N-1

#### Scenario: Arrow keys do nothing when the modal is closed
- **WHEN** the help modal is not open and the user presses Left or Right arrow
- **THEN** no screen navigation occurs and no other overlay is affected

### Requirement: Reopening always starts at the Welcome screen
The system SHALL show screen 1 ("Welcome") whenever the help modal is opened, regardless of which screen was showing when it was last closed.

#### Scenario: Reopening after closing on a later screen
- **WHEN** the user closes the modal while on screen 4, then reopens it via the `?` button
- **THEN** the modal opens showing screen 1

### Requirement: Auto-open once on true first-ever visit
The system SHALL automatically open the help modal on the very first page load for a given browser/origin — determined by the absence of any prior workspace data in `localStorage` at the moment the app initializes, checked before any default-workspace auto-create logic runs — and SHALL record that the modal has been auto-shown so it never auto-opens again on subsequent loads, independent of later workspace deletions.

#### Scenario: First-ever visit auto-opens the modal
- **WHEN** the browser tool loads in a browser/origin with no prior `localStorage` workspace data
- **THEN** the help modal opens automatically, showing screen 1, after the default workspace has been created

#### Scenario: Subsequent visits do not auto-open
- **WHEN** the browser tool loads and the "help seen" flag is already recorded in `localStorage`
- **THEN** the help modal does not open automatically

#### Scenario: Deleting the last workspace later does not retrigger auto-open
- **WHEN** a returning user (whose "help seen" flag is already recorded) deletes their last remaining workspace, triggering the default-workspace auto-create fallback, and reloads the page
- **THEN** the help modal still does not open automatically
