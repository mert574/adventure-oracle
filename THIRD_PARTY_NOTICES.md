# Third-party notices

Original application code is MIT. Dependencies retain their package licenses.

## Game data — CC BY 4.0

The importer accepts only the Wizards of the Coast SRD 5.1 (`wotc-srd`) and
EN Publishing A5E SRD (`a5e`) through Open5e. Both are used under CC BY 4.0.
SRD 5.1 is dual-licensed; this project uses its Creative Commons option.

[Source records](public/licenses/open5e-sources.json) preserve attribution and
license links. [User-visible credits](public/licenses/index.html) include the
attribution statements and full [CC BY 4.0 license](public/licenses/cc-by-40.md).
The app links the credits from its footer at `/licenses/`.

Imported fields are reorganized for storage and display. No additional editorial changes
to rules text are intended; upstream modifications may be present. Open5e contributors provide compilation and transcription.

Original environment illustrations generated for this project are bundled under
`public/images/`; their prompts and provenance are in `public/images/README.md`.
No external RPG artwork or Blizzard assets are bundled.

## Bundled offline snapshot

`data/open5e/srd-5.1.json` contains SRD 5.1 rules transcribed by Open5e,
from revision `e69ac13b49dae6a9d84abf38fc674fe1db5b392b`. It is distributed
under CC BY 4.0, separately from the MIT application code. No A5E material or
artwork is included in this snapshot. The manifest records counts, SHA-256,
source revision, and modifications. See `data/open5e/README.md`.

The snapshot selects application categories, decodes JSON fields, joins subraces
and archetypes, and derives spell fields. Upstream transcription and rule edits
are retained; the snapshot is not an authoritative verbatim SRD edition.

## Music — CC BY 3.0

“Mystery Forest” by Alexandr Zhelanov.
Artist: https://soundcloud.com/alexandr-zhelanov
Source: https://opengameart.org/content/mystery-forest
Audio: https://opengameart.org/sites/default/files/Mystery%20Forest.mp3

Bundled as `public/audio/mystery-forest-alexandr-zhelanov.mp3` under Creative
Commons Attribution 3.0 Unported. The downloaded recording is unchanged and
repeated during playback. Preserve attribution and source/license notices.
This is an attribution license, not a ShareAlike license.

License: https://creativecommons.org/licenses/by/3.0/
Full text: `public/licenses/cc-by-30.txt`
The license includes a disclaimer of warranties and limitation of liability.
User-visible attribution appears at `/credits#music`, linked from the game's
credits control. See `public/audio/README.md` for provenance.
