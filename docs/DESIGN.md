# Adventure Oracle interface

## Direction

Use an old-school MMORPG interface, with World of Warcraft Classic as the user's
visual reference: dark stone/leather surfaces, aged metal frames, gold text,
compact red controls, atmospheric dungeon art, and custom metal/gauntlet cursors.
Use original assets; do not copy Blizzard art, logos, characters, or UI textures.
Copy should be plain and specific. Avoid marketing slogans, balanced sentence
fragments, and invented feature claims.

## Composition

The main screen is a full-screen dungeon viewport, not a website with a header,
hero, cards, and footer. `layouts/game.vue` supplies the viewport and a small
account HUD. Character and campaign panels float along the edges. The bottom
action bar opens existing character/campaign flows and the codex overlay.
The codex uses a wide native dialog with a searchable entry list and full rule
details in a 1:2 split. It loads complete local spell, magic-item, and weapon
categories on first open. Mobile uses list/detail navigation. I opens it outside
text fields, and Escape closes it.

The dungeon preview has three selectable locations and d20
investigation checks with local outcomes. This is a standalone preview: it does
not save campaign progress or claim to implement multiplayer campaign play.
Existing server-side campaigns and characters remain separate from the preview.

Account pages use one centered game panel against a landscape, with a small
back-to-camp control and no website header or footer. Character
creation has a live character summary, creation steps, and a framed stat sheet.
Shared dialogs use native `<dialog>` for focus trapping, Escape, and restoration.
Backdrop clicks and close buttons dismiss dialogs unless a mutation is busy.

## Assets and implementation

`assets/css/tailwind.css` contains shared semantic classes and color variables.
Use Georgia for headings and game captions, and local system sans-serif for
body/forms. No remote fonts, image requests, or new runtime packages are needed.
Original generated environment WebPs and exact prompts are documented in
`public/images/README.md`. Game icons are SVG in `components/ui/GameIcon.vue`;
custom cursors are in `public/cursors/` with native fallbacks. Fields retain
text cursors and disabled controls retain appropriate feedback.

Torch flicker, embers, portal light, panel entry, and dice rolls provide motion.
Honor `prefers-reduced-motion` and keep ambient layers decorative. Resolve rolls
immediately when reduced motion is requested.

## Responsive and accessibility checks

Use explicit labels, readable text contrast, keyboard focus, and useful
empty/error/loading states. On mobile, show the dungeon first, move panels below,
and retain a fixed action bar. Codex and modal content must stay within the
viewport and scroll when needed. Test focus/Escape, account flows, character
creation, codex categories, room selection, rolls, and browser errors.
Use the user's running development server; do not start another without approval.

## Character selection and loading

The character panel is a selector with a directly visible sheet: six abilities,
HP meter, armor, speed, and hit dice. Switching characters updates the preview's
investigation bonus; full details remain available in the sheet dialog.
Reserve panel dimensions before data arrives. Use animated skeletons for session,
roster, campaign, and codex loading; fade the background image in without changing
geometry. Do not flash empty states before initial requests finish.

On desktops of at least 1200px, the account HUD, side panels, and action bar are
about 50% larger than the compact treatment. Preserve scrollable panel content.
The removed circular minimap should not be reintroduced as a decorative control.

## Music

A locally bundled recording of “Mystery Forest” by Alexandr Zhelanov (CC BY 3.0)
loops after user interaction. Use licensed instrumental recordings rather than
procedural oscillator music for the soundtrack.
`components/ui/BackgroundMusic.vue` is mounted at the app root for uninterrupted
playback across navigation. Keep the mute toggle accessible, remember
preferences, and never require remote streaming. Track provenance and its
license are documented in `public/audio/README.md`.

The music player is global to `app.vue`, outside pages/layouts. Use
`useBackgroundMusic()` to pause/resume or mute/unmute from any page or dialog.
Page-level resume must respect the user's mute preference. Use Nuxt navigation
for internal routes; the credits screen lives at `/credits`. Sign-out updates
state without a document reload so playback remains continuous.

Music tunes to the current Unix timestamp modulo the track duration when it
starts or resumes, providing radio-style playback without resetting on routes.
