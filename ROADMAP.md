# Roadmap

## Campaign play

- Build a playable campaign view with a persistent adventure log and player actions.
- Add API-powered game-master narration and story progression informed by campaign state.
- Track characters, inventory, NPCs, locations and unresolved story threads across sessions.
- Add dice rolls and rules-based outcomes before narrating their consequences.
- Support party turns, shared campaign updates and reconnecting to an ongoing session.

## Multi-device play and shared screen

- Let players join the same campaign from phones, tablets or laptops, with a campaign link or QR code.
- Give each player a personal view for their character sheet, inventory, actions and dice rolls.
- Add a shared display for a laptop or TV showing the map, party situation, public rolls and current story.
- Synchronize campaign state and relevant updates across player devices and the shared display.
- Enforce game visibility on the server: character secret objectives, undiscovered items and unrevealed map areas are sent only to the players entitled to see them, and kept off the shared display until revealed in play.
- Support reconnecting and resuming play without losing actions or duplicating dice rolls.
- Provide a readable, large-screen layout and a simple way to pair the shared display with a campaign.

## AI integration

- Choose a provider and model for ordinary narration API calls.
- Keep provider credentials on the server and support streamed responses, cancellation and retries.
- Manage story context, summaries and request costs for longer campaigns.
- Add occasional scene and character images, with caching and source records.
- This plan uses existing model APIs; it does not include model training, evaluation or benchmarking.

## Characters and rules

- Complete character progression, equipment, spells and character-sheet views.
- Show source credits alongside rules content and maintain notices when updating imported sources.
- Improve rules search, filtering and empty/loading states.

## Interface and setup

- Redesign the landing page, onboarding and campaign interface with clear navigation.
- Improve mobile layouts, accessibility, feedback and dice animations.
- Add campaign export/import and backup/recovery for local data.
- Keep fresh database setup reproducible and modernize dependencies as needed.
