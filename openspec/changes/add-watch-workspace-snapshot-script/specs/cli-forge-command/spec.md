## ADDED Requirements

### Requirement: Watch command integrates with forge snapshot generation
The system SHALL expose a watch-oriented invocation path that uses the existing forge snapshot generation flow for each qualifying workspace source change.

#### Scenario: Watch cycle uses forge snapshot output contract
- **WHEN** watch mode triggers generation after a qualifying source change
- **THEN** the generated file follows the same timestamped snapshot output contract defined for forge snapshot mode

#### Scenario: One-shot forge behavior remains unchanged
- **WHEN** the user runs one-shot forge commands without watch mode
- **THEN** existing compile/open/snapshot behavior remains unchanged
