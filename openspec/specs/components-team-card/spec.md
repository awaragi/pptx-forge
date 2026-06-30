## Purpose

Defines the `teamCard` primitive component, which renders a name/role tile with a circular avatar placeholder, used to introduce team members on a slide.

## Requirements

### Requirement: teamCard renders a name/role tile with circular avatar
The system SHALL render a card containing a filled circle as an avatar placeholder, a name text below it, a role text, and an optional bio line. The avatar circle is centered horizontally within the box.

Content fields: `{ name, role, bio }`. `name` and `role` are required strings. `bio` is optional; when omitted, no bio element is rendered.

#### Scenario: Name and role provided, no bio
- **WHEN** `teamCard` is called with `{ name: 'Jane Smith', role: 'Engagement Lead' }`
- **THEN** the slide contains an avatar circle, a name text element, and a role text element; no bio element is added

#### Scenario: Bio provided
- **WHEN** `teamCard` is called with `{ name: 'Jane Smith', role: 'Engagement Lead', bio: 'CX transformation expert' }`
- **THEN** the slide contains an avatar circle, name, role, and bio text elements

### Requirement: teamCard uses theme.shape.teamCard tokens
The system SHALL read `avatarBgColor` and `avatarTextColor` from `theme.shape.teamCard`, with defaults `accent6` and `bg1` respectively. Name uses `theme.shape.card.titleColor`; role uses `accent1`; bio uses `theme.shape.card.bodyColor`.

#### Scenario: Theme token for avatar background
- **WHEN** a workspace sets `theme.shape.teamCard.avatarBgColor` to a custom color
- **THEN** the avatar circle uses that color as its fill
