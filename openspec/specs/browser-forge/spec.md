## Purpose

Defines `pptx-forge.html`, a single self-contained, dependency-free HTML page that lets a user load `theme.js` and slide `.js` files (via drag-and-drop, click-to-select, or in-page editing), edit them in a VSCode-style sidebar-plus-editor layout, and compile them client-side into a downloadable `.pptx` — reusing the existing `src/` rendering library's forge pipeline entirely in the browser, with no install, server, or network access required.
## Requirements
### Requirement: Single self-contained HTML distribution
The system SHALL provide a single static `pptx-forge.html` file, produced by a build step, that contains all JavaScript needed to run the tool (including `pptxgenjs`, `jszip`, and the `src/` rendering library) inlined into the page with no external `<script src>` references and no relative-path ES module imports.

#### Scenario: Opened directly from disk
- **WHEN** a user double-clicks `pptx-forge.html` (opened via the `file://` protocol, no server running)
- **THEN** the page loads and is fully functional, with no network requests required and no console errors caused by blocked module loading

### Requirement: Permanent theme.js entry with default placeholder
The system SHALL always display a `theme.js` entry in the file sidebar, pre-populated with a default placeholder content if not otherwise supplied, and SHALL NOT allow this entry to be deleted.

#### Scenario: Initial load shows placeholder theme.js
- **WHEN** the page is opened for the first time (no files loaded yet)
- **THEN** the sidebar shows a `theme.js` entry whose content, if opened, is the default placeholder (parseable as a module with an empty-object default export)

#### Scenario: Placeholder theme.js is visually muted
- **WHEN** the `theme.js` entry's content is unchanged from the default placeholder
- **THEN** the sidebar renders that entry in a visually muted/gray style distinct from other entries

#### Scenario: Editing theme.js clears the muted style
- **WHEN** the user edits the `theme.js` content (directly in the editor, or by dropping/selecting a file named `theme.js`) so it no longer matches the default placeholder
- **THEN** the sidebar entry switches from muted to normal styling

#### Scenario: theme.js has no delete action
- **WHEN** the user views the `theme.js` sidebar entry
- **THEN** no control is offered to remove it from the sidebar

### Requirement: Permanent masters.js entry with default placeholder
The system SHALL always display a `masters.js` entry in the file sidebar, pre-populated with a default placeholder content sourced from `src/sample/masters.js` if not otherwise supplied, and SHALL NOT allow this entry to be deleted. This mirrors the existing `theme.js` permanent-entry treatment exactly, using the same mechanism rather than a bespoke one.

#### Scenario: Initial load shows placeholder masters.js
- **WHEN** the page is opened for the first time (no files loaded yet)
- **THEN** the sidebar shows a `masters.js` entry whose content, if opened, is the default placeholder (parseable as a module whose default export is a factory function)

#### Scenario: Placeholder masters.js is visually muted
- **WHEN** the `masters.js` entry's content is unchanged from the default placeholder
- **THEN** the sidebar renders that entry in the same visually muted/gray style used for an unedited `theme.js`

#### Scenario: Editing masters.js clears the muted style
- **WHEN** the user edits the `masters.js` content (directly in the editor, or by dropping/selecting a file named `masters.js`) so it no longer matches the default placeholder
- **THEN** the sidebar entry switches from muted to normal styling

#### Scenario: masters.js has no delete action
- **WHEN** the user views the `masters.js` sidebar entry
- **THEN** no control is offered to remove it from the sidebar

### Requirement: Load slide files by drag-and-drop or click-to-select
The system SHALL let the user add slide `.js` files via drag-and-drop onto the page or a file-select control, SHALL reject any dropped or selected file that does not have a `.js` extension, and SHALL show an inline message when a file is rejected.

#### Scenario: Drop a new slide file
- **WHEN** the user drops a file named `slide-01.js` that is not already in the sidebar
- **THEN** a new sidebar entry named `slide-01.js` is created containing that file's text content

#### Scenario: Click-to-select a slide file
- **WHEN** the user selects a `.js` file via the file picker
- **THEN** it is added to the sidebar the same way a dropped file would be

#### Scenario: Non-.js file is rejected
- **WHEN** the user drops or selects a file that does not end in `.js`
- **THEN** the file is not added to the sidebar and an inline message explains that only `.js` files are supported

### Requirement: Same-named file replaces existing entry in place
The system SHALL replace an existing sidebar entry's content, without changing its sidebar position, when a dropped or selected file's name exactly matches that entry's name.

#### Scenario: Drop replaces matching entry
- **WHEN** the sidebar already contains `slide-02.js` and the user drops a different file also named `slide-02.js`
- **THEN** the existing `slide-02.js` entry's content is replaced with the dropped file's content and no new entry is created

#### Scenario: Replacing theme.js clears the placeholder state
- **WHEN** the user drops a file named `theme.js` with non-placeholder content
- **THEN** the existing `theme.js` entry's content is replaced and it is no longer rendered in the muted placeholder style

#### Scenario: Replacing masters.js clears the placeholder state
- **WHEN** the user drops a file named `masters.js` with non-placeholder content
- **THEN** the existing `masters.js` entry's content is replaced and it is no longer rendered in the muted placeholder style

### Requirement: Sidebar order follows filename sort
The system SHALL display and compile non-`theme.js`, non-`masters.js` sidebar entries in ascending filename order. `theme.js` and `masters.js` are pinned entries, excluded from this sort, and always appear in that fixed relative order — `theme.js` first, then `masters.js` — ahead of every slide file.

#### Scenario: Entries sorted regardless of load order
- **WHEN** the user adds `slide-03.js` before `slide-01.js`
- **THEN** the sidebar displays `slide-01.js` before `slide-03.js`

#### Scenario: theme.js and masters.js are not part of the alphabetical sort
- **WHEN** the sidebar is rendered
- **THEN** `theme.js` and `masters.js` appear in their fixed pinned positions, not interleaved alphabetically among slide files

#### Scenario: theme.js is pinned above masters.js
- **WHEN** the sidebar is rendered
- **THEN** `theme.js` appears above `masters.js`, regardless of load order or which was edited more recently

### Requirement: Editing the active file
The system SHALL let the user select any sidebar entry to load its content into a single active editor pane, and SHALL let the user edit that content directly.

#### Scenario: Selecting an entry loads it into the editor
- **WHEN** the user clicks a sidebar entry
- **THEN** that entry's current content is displayed in the editor pane, replacing whatever was previously shown

#### Scenario: Edits update the in-memory file content
- **WHEN** the user types in the editor pane for the active entry
- **THEN** that entry's stored content is updated to match, and is used as-is the next time Forge runs, whether or not the file has been saved

### Requirement: Editor toolbar provides download, discard, and rename actions
The system SHALL present the currently active file's actions as icon buttons in the editor toolbar: Download, and either Discard or Reset depending on the active file, plus Rename. The Rename affordance (a pencil icon) SHALL be displayed immediately next to the active filename, and clicking the filename text itself SHALL also trigger rename. When the active file is `theme.js` or `masters.js`, Discard and Rename SHALL NOT be available, and a Reset action SHALL be shown in Discard's toolbar position instead.

#### Scenario: Icon buttons shown for a slide file
- **WHEN** the active file is a slide file (not `theme.js` or `masters.js`)
- **THEN** the Download and Discard icon buttons, and the inline rename pencil next to the filename, are all available

#### Scenario: Rename triggered from the filename or the pencil icon
- **WHEN** the active file is a slide file and the user clicks either the filename text or the pencil icon next to it
- **THEN** rename mode is entered (see "Rename changes a slide file's name")

#### Scenario: Discard and Rename unavailable for theme.js, Reset shown instead
- **WHEN** the active file is `theme.js`
- **THEN** the Discard icon and the rename pencil are not shown, clicking the filename text does not enter rename mode, and a Reset icon button is shown in the toolbar position Discard would otherwise occupy

#### Scenario: Discard and Rename unavailable for masters.js, Reset shown instead
- **WHEN** the active file is `masters.js`
- **THEN** the Discard icon and the rename pencil are not shown, clicking the filename text does not enter rename mode, and a Reset icon button is shown in the toolbar position Discard would otherwise occupy

### Requirement: Download saves the active file
The system SHALL provide a Download action that downloads the currently active file's current content as a file named after that entry, using the browser's normal file-download mechanism.

#### Scenario: Download triggers a browser download
- **WHEN** the user edits the active file and clicks Download
- **THEN** the browser downloads a file whose name matches the active sidebar entry's name and whose content matches the current editor content

### Requirement: Discard moves the active slide file to trash
The system SHALL provide a Discard action that, after the user confirms the action, moves the active slide file from the sidebar's "Slides" list into the workspace's Trash list instead of deleting it, excluding it from subsequent Forge runs and workspace export while it remains in trash. This action is unavailable for `theme.js` and `masters.js`. The confirmation prompt SHALL indicate the file is being moved to trash and can be restored, rather than stating the action cannot be undone.

#### Scenario: Discard moves a slide file to trash after confirmation
- **WHEN** the user clicks Discard on a slide file and confirms the prompt
- **THEN** that file's entry is removed from the "Slides" list and appears in the "Trash" list instead, and it is excluded from subsequent Forge runs

#### Scenario: Discard is cancellable
- **WHEN** the user clicks Discard and declines the confirmation prompt
- **THEN** the file is not moved and no state changes

#### Scenario: Discard is unavailable for masters.js
- **WHEN** the active file is `masters.js`
- **THEN** no Discard control is shown for it

### Requirement: Rename changes a slide file's name via an inline text box
The system SHALL let the user rename the active slide file by editing its basename directly in an inline text input (not a modal dialog). The `.js` extension SHALL be displayed as a fixed, non-editable suffix outside the input rather than being part of the editable text. The input SHALL be pre-filled with the current basename and focused/selected when rename mode is entered. This action is unavailable for `theme.js` and `masters.js`. The resulting name (typed basename + `.js`) SHALL NOT be empty, SHALL NOT contain `/` or `\`, SHALL NOT equal `theme.js` or `masters.js`, and SHALL NOT collide with another existing slide file's name.

#### Scenario: Entering rename mode
- **WHEN** the user triggers rename on a slide file
- **THEN** the filename display is replaced by an editable text input containing the current basename (without `.js`) plus a fixed `.js` label next to it, with the input's text selected and focused

#### Scenario: Enter key commits a valid new name
- **WHEN** the user edits the inline input to a valid, non-colliding basename and presses Enter
- **THEN** the sidebar entry's name updates to `<typed basename>.js`, its content is unchanged, it now compiles in filename-sorted position accordingly, and the input closes back to the normal filename display

#### Scenario: Escape key cancels without changing the name
- **WHEN** the user edits the inline input and presses Escape
- **THEN** rename mode exits, the file's name is unchanged, and no error is shown

#### Scenario: Enter with an invalid or colliding basename stays in edit mode
- **WHEN** the user presses Enter with a basename that is empty, contains `/` or `\`, resolves to `theme.js` or `masters.js`, or collides with another loaded file
- **THEN** the rename is rejected, an inline error message explains why, the file's original name is unchanged, and the input remains open (focused) so the user can correct it

#### Scenario: Editing the input again clears a prior error
- **WHEN** an inline error message is showing from a rejected rename attempt and the user modifies the input's text again (without yet committing)
- **THEN** the error message is cleared immediately, before any new commit attempt

#### Scenario: Clicking away commits a pending valid rename
- **WHEN** the user has edited the inline input to a valid basename and then clicks elsewhere on the page (without pressing Enter)
- **THEN** the rename is committed the same as pressing Enter

#### Scenario: Clicking away with an invalid pending basename reverts
- **WHEN** the user has edited the inline input to an invalid or colliding basename and then clicks elsewhere on the page
- **THEN** the rename is rejected, an inline message explains why, and the file's original name is restored (the input cannot remain focused once focus has moved)

### Requirement: Forge compiles loaded files into a downloadable .pptx
The system SHALL provide a Forge action that compiles the `theme.js` entry's default export as theme overrides, the `masters.js` entry's default export as the master-definition factory function (passed to `createLib` as `masterOverrides`, then registered via `applyMasters` — never executed as a slide module), and every other loaded entry's default export as a slide module receiving `(pptx, lib)`, executed in sidebar (filename-sorted) order, and SHALL offer the resulting presentation as a `.pptx` download.

#### Scenario: Forge produces a downloadable file
- **WHEN** the user has loaded a `theme.js` and at least one valid slide file, and clicks Forge
- **THEN** the browser downloads a `.pptx` file reflecting the slides added by each loaded file's default export, in sidebar order

#### Scenario: Forge patches theme scheme colors
- **WHEN** `theme.js` overrides include `scheme` colors
- **THEN** the downloaded `.pptx`'s `ppt/theme/theme1.xml` reflects those scheme colors, matching the CLI's theme-patching behavior

#### Scenario: Forge with placeholder theme.js uses library defaults
- **WHEN** the user runs Forge without having changed `theme.js` from its default placeholder
- **THEN** the compiled deck uses the rendering library's default theme, equivalent to running the CLI with no `theme.js` present

#### Scenario: Forge with placeholder masters.js uses the library's default master only
- **WHEN** the user runs Forge without having changed `masters.js` from its default placeholder
- **THEN** the compiled deck's registered masters are exactly the library's default (`BLANK`), equivalent to running the CLI with no workspace `masters.js` present

#### Scenario: Forge registers masters before compiling slides
- **WHEN** the user clicks Forge with a non-placeholder `masters.js`
- **THEN** `applyMasters` runs (registering the merged masters on the `pptx` instance) before any slide file's default export runs, so slide files may reference `masterName` values the `masters.js` entry defines

#### Scenario: Forge output filename derives from the active workspace name
- **WHEN** the user clicks Forge
- **THEN** the downloaded file's base name is the active workspace's name, sanitized for use as a filename, with a `.pptx` extension

#### Scenario: A failing file surfaces a readable error
- **WHEN** one of the loaded files throws an error while being imported or executed (e.g. a syntax error or a runtime exception)
- **THEN** Forge does not produce a download, and an inline error message identifies which file failed and includes the error's message

#### Scenario: Forge requires at least one slide file
- **WHEN** the user clicks Forge with no slide files loaded (only the `theme.js` and `masters.js` entries present)
- **THEN** no download is produced and an inline message explains that at least one slide file is required

### Requirement: Reset restores theme.js to the default placeholder
The system SHALL provide a Reset action, available only when the active file is `theme.js` or `masters.js`, that after confirmation replaces that entry's content with its default placeholder content and returns its sidebar styling to the muted placeholder state.

#### Scenario: Reset restores the theme.js placeholder after confirmation
- **WHEN** the user has edited `theme.js` away from its default content, clicks Reset, and confirms the prompt
- **THEN** the `theme.js` entry's content is replaced with the default placeholder, the editor pane updates to show it, and the sidebar entry returns to its muted placeholder styling

#### Scenario: Reset restores the masters.js placeholder after confirmation
- **WHEN** the user has edited `masters.js` away from its default content, clicks Reset, and confirms the prompt
- **THEN** the `masters.js` entry's content is replaced with the default placeholder (sourced from `src/sample/masters.js`), the editor pane updates to show it, and the sidebar entry returns to its muted placeholder styling

#### Scenario: Reset is cancellable
- **WHEN** the user clicks Reset (on either `theme.js` or `masters.js`) and declines the confirmation prompt
- **THEN** that entry's content is unchanged

### Requirement: Optional timestamp suffix on forge output filename
The system SHALL provide a toggle control, off by default, that when enabled appends a timestamp to the forge output filename after the active workspace's sanitized name, and does not otherwise affect the active workspace's name or identity.

#### Scenario: Timestamp toggle appends a timestamp
- **WHEN** the user enables the timestamp toggle and clicks Forge
- **THEN** the downloaded file's name is the active workspace's sanitized name followed by a timestamp, before the `.pptx` extension

#### Scenario: Timestamp toggle off uses the workspace name alone
- **WHEN** the timestamp toggle is off (its default state) and the user clicks Forge
- **THEN** the downloaded file's name matches the active workspace's sanitized name alone, with no timestamp appended
