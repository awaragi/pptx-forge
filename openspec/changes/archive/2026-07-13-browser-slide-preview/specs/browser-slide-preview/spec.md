## ADDED Requirements

### Requirement: Live preview pane under the editor
The system SHALL show a preview pane in the bottom half of the editor pane, rendering the currently active slide file by compiling it (together with the active workspace's `theme.js` and `masters.js`) through the same `compileDeck` pipeline used by "⚡ Forge", and rendering the resulting `.pptx` bytes onto a canvas.

#### Scenario: Selecting a slide shows its rendered preview
- **WHEN** the user selects a slide file in the sidebar
- **THEN** the preview pane renders that slide, reflecting its current (possibly unsaved) editor content

#### Scenario: Editing the active slide updates the preview
- **WHEN** the user edits the content of the currently active slide file in the editor
- **THEN** the preview pane recompiles and re-renders that slide to reflect the edit, without requiring a manual refresh action

### Requirement: Live-typing preview updates are debounced
The system SHALL debounce recompilation while the user is actively typing in the editor, waiting for a brief pause in input before recompiling and re-rendering the preview, rather than recompiling on every keystroke.

#### Scenario: Rapid typing does not trigger a compile per keystroke
- **WHEN** the user types continuously without pausing
- **THEN** no preview recompilation occurs until typing pauses

#### Scenario: A stale in-flight compile does not overwrite a newer result
- **WHEN** the user makes a further edit while an earlier preview compile triggered by a previous edit is still in progress
- **THEN** only the result of the most recent edit's compile is applied to the preview once it completes; the superseded in-flight result, if it resolves later, is discarded

### Requirement: Editing theme.js or masters.js previews the last-viewed slide
The system SHALL, while `theme.js` or `masters.js` is the active editor file, continue rendering the most recently viewed slide file in the preview pane, recompiled with the in-progress `theme.js`/`masters.js` content, instead of showing an empty or placeholder preview.

#### Scenario: Editing theme.js re-renders the last slide viewed
- **WHEN** the user was previously viewing a slide, switches to editing `theme.js`, and changes a color value
- **THEN** the preview pane re-renders that same slide using the updated theme, without the user needing to reselect it

#### Scenario: No slide has been viewed yet in the current session
- **WHEN** the user opens a workspace and immediately edits `theme.js` or `masters.js` without having selected any slide file first
- **THEN** the preview pane shows a message indicating no slide is selected, rather than an error

### Requirement: Compile errors are surfaced in the preview pane
The system SHALL, when compiling the previewed slide fails, display the error message in the preview pane's status area instead of silently showing a stale or blank render, using the same error detail (file name and location, where available) already produced for "⚡ Forge" failures.

#### Scenario: A syntax error in the active slide is shown in the preview
- **WHEN** the active slide file has a JavaScript error that fails compilation
- **THEN** the preview pane's status area shows the error message and the canvas retains its last successful render rather than going blank

### Requirement: No slide exists to preview
The system SHALL, when the active workspace has no slide files at all, show a message in the preview pane indicating there is nothing to preview, rather than attempting to compile.

#### Scenario: Empty workspace shows a no-slides message
- **WHEN** the active workspace contains no slide files
- **THEN** the preview pane shows a message indicating no slide exists to preview

### Requirement: Resizable preview pane with persisted height
The system SHALL provide a draggable divider between the editor and the preview pane that resizes both, and SHALL persist the resulting split position as a percentage of the editor pane's total height in `localStorage`, restoring it on subsequent loads so the split scales correctly regardless of window size.

#### Scenario: Dragging the divider resizes both panes
- **WHEN** the user drags the divider between the editor and the preview pane
- **THEN** the editor pane and preview pane resize accordingly, with the divider following the pointer

#### Scenario: Persisted height survives a reload
- **WHEN** the user resizes the preview pane and reloads the page
- **THEN** the preview pane opens at the same proportional height as before the reload

#### Scenario: Persisted height scales with a different window size
- **WHEN** the persisted height percentage was saved in a window of one size, and the tool is later opened in a window of a different size
- **THEN** the preview pane occupies the same percentage of the editor pane's height as before, not a fixed pixel amount

#### Scenario: Dragging cannot shrink either pane below a usable minimum
- **WHEN** the user drags the divider toward either extreme (attempting to shrink the editor or the preview pane to near-zero)
- **THEN** the resize is clamped so neither pane shrinks below a usable minimum size

### Requirement: The rendered preview tracks the pane's actual size, not just the pane's own dimensions
The system SHALL re-render the preview at its current displayed size whenever that size changes — via divider drag or a browser window resize — rather than continuing to display a render sized for a previous, no-longer-current pane size.

#### Scenario: Dragging the divider changes the rendered preview's size
- **WHEN** the user drags the divider to make the preview pane taller or shorter
- **THEN** the rendered preview's visible size changes accordingly, not just the empty space around it

#### Scenario: Resizing the browser window changes the rendered preview's size
- **WHEN** the user resizes the browser window while a preview is showing
- **THEN** the preview re-renders to match the pane's new size

### Requirement: Collapsible preview pane with persisted visibility
The system SHALL provide a toolbar button that collapses the preview pane to a slim strip (hiding the rendered canvas while leaving the toolbar visible) and expands it again, and SHALL persist the collapsed/expanded state in `localStorage`, restoring it on subsequent loads.

#### Scenario: Collapsing hides the canvas but keeps the toolbar
- **WHEN** the user clicks the collapse button
- **THEN** the preview canvas is hidden, the editor pane expands to use the reclaimed space, and the preview toolbar (with an expand control) remains visible

#### Scenario: Expanding restores the previous height
- **WHEN** the user clicks the expand control after having collapsed the preview pane
- **THEN** the preview pane reopens at the same height percentage it had before being collapsed, and re-renders the current preview immediately

#### Scenario: Collapsed state survives a reload
- **WHEN** the user collapses the preview pane and reloads the page
- **THEN** the preview pane loads in its collapsed state

### Requirement: Compiling pauses while the preview pane is collapsed
The system SHALL NOT recompile or re-render the preview in response to editor input while the preview pane is collapsed, and SHALL perform one immediate recompile and re-render when the pane is expanded again.

#### Scenario: Edits while collapsed do not trigger compilation
- **WHEN** the preview pane is collapsed and the user edits the active slide file
- **THEN** no preview compilation occurs until the pane is expanded again

#### Scenario: Expanding triggers an immediate refresh
- **WHEN** the user expands a previously collapsed preview pane after having edited the active slide while it was collapsed
- **THEN** the preview pane immediately compiles and renders the current content, without waiting for a further edit

### Requirement: Copy preview as PNG to the clipboard
The system SHALL provide a toolbar button that copies the currently rendered preview to the system clipboard as a PNG image, when the browser supports the clipboard image-write API, and SHALL hide or disable this control when that support is not available rather than failing silently on click.

#### Scenario: Copy button copies the rendered slide
- **WHEN** the user clicks the copy button with a slide currently rendered in the preview
- **THEN** a PNG image of the rendered slide is placed on the system clipboard and a success confirmation is shown

#### Scenario: Copy control is unavailable in unsupported browsers
- **WHEN** the browser does not support writing images to the clipboard
- **THEN** the copy button is hidden or disabled, and clicking elsewhere in the toolbar does not attempt the copy action

### Requirement: Download preview as PNG
The system SHALL provide a toolbar button that downloads the currently rendered preview as a PNG file, using the active slide's name as the base of the downloaded filename.

#### Scenario: Download button saves a PNG file
- **WHEN** the user clicks the download button with a slide currently rendered in the preview
- **THEN** a PNG file of the rendered slide is downloaded, named after the active slide file

### Requirement: Preview rendering makes no network requests
The system SHALL render the preview entirely from local, already-bundled code and data, making no network requests of any kind, consistent with the browser tool's overall offline, local-only execution guarantee.

#### Scenario: Rendering a preview issues no network requests
- **WHEN** a slide is compiled and rendered in the preview pane
- **THEN** no HTTP/HTTPS requests are made by the page during that render
