# browser-notifications Specification

## Purpose
TBD - created by archiving change growl-style-notifications. Update Purpose after archive.

## Requirements
### Requirement: Toast notifications are the sole feedback surface
The system SHALL render all user-facing feedback messages (confirmations, passive info, and errors) as toast notifications in a fixed, viewport-anchored container, and SHALL NOT include a persistent status-bar element anywhere in the browser tool UI.

#### Scenario: No persistent status line exists
- **WHEN** the browser tool is loaded and no notification is currently showing
- **THEN** no persistent status-bar element is present in the layout, and the editor pane occupies the space it previously ceded to that bar

#### Scenario: An action reports its outcome via a toast
- **WHEN** the user performs an action that previously reported its outcome via the status bar (e.g. downloading a file, exporting a workspace, a failed rename)
- **THEN** that outcome is reported via a toast notification instead

### Requirement: Three notification tiers
The system SHALL provide three visually distinct notification tiers — info, success, and error — each identifiable at a glance (e.g. via color and/or icon), independent of any other tier shown at the same time.

#### Scenario: Each tier is visually distinguishable
- **WHEN** an info, a success, and an error notification are all showing at once
- **THEN** each is visually identifiable as its own tier without reading its message text

### Requirement: Notifications stack rather than replace
The system SHALL display multiple concurrent notifications simultaneously, stacked in the same container, rather than a new notification replacing or hiding an earlier one that has not yet dismissed.

#### Scenario: Rapid-fire notifications all remain visible
- **WHEN** two or more notifications are triggered in quick succession, before the earliest has dismissed
- **THEN** all of them remain visible at once, stacked in the container

### Requirement: Tier-specific auto-dismiss timing
The system SHALL automatically dismiss each notification after a duration determined by its tier, in the absence of user interaction with that notification: approximately 4 seconds for info and success tiers, and approximately 8 seconds for the error tier.

#### Scenario: Info and success dismiss automatically
- **WHEN** an info or success notification is shown and the user does not interact with it
- **THEN** it disappears on its own after approximately 4 seconds

#### Scenario: Error notifications stay visible longer
- **WHEN** an error notification is shown and the user does not interact with it
- **THEN** it disappears on its own after approximately 8 seconds, longer than an info or success notification would

### Requirement: Hover pauses dismissal; manual close is always available
The system SHALL pause a notification's auto-dismiss timer while the pointer hovers over it, without affecting the timers of any other notification currently showing, and resume the timer once the pointer leaves. Independent of hover or timer state, the system SHALL provide a manual close control on every notification that dismisses it immediately when activated.

#### Scenario: Hovering pauses only that notification
- **WHEN** the pointer hovers over one notification while others are also showing
- **THEN** the hovered notification does not auto-dismiss while hovered, while the others' timers continue unaffected

#### Scenario: Manual close dismisses immediately
- **WHEN** the user activates a notification's close control
- **THEN** that notification is removed immediately, regardless of its tier or how long it has been showing

### Requirement: Notifications are announced to assistive technology
The system SHALL mark the notification container as a live region (`aria-live="polite"`) so that new notifications are announced to assistive technology without interrupting the user's current focus.

#### Scenario: A new notification is announced
- **WHEN** a notification appears while a screen reader is in use
- **THEN** the screen reader announces the notification's message once its current announcement finishes, without abruptly interrupting it

### Requirement: Non-blocking, top-right placement
The system SHALL render notifications anchored to the top-right of the viewport, overlaying above other page content, without blocking pointer or keyboard interaction with the rest of the UI.

#### Scenario: Notifications do not block editor interaction
- **WHEN** one or more notifications are showing
- **THEN** the user can still click into and type in the editor, and interact with the sidebar and toolbar, without any notification intercepting that interaction
