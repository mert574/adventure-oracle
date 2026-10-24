# Bundled SRD 5.1 rules

`srd-5.1.json` is a text/data snapshot of eight categories from Open5e's
`data/v1/wotc-srd` directory at revision
`e69ac13b49dae6a9d84abf38fc674fe1db5b392b`.
`manifest.json` records the source, checksum, category counts, and modifications.
It contains no artwork or A5E records.

## License and attribution

The rules data is **CC BY 4.0**, separately from the MIT application code.
SRD 5.1 is dual-licensed; we use the Creative Commons option even though
upstream's legacy source metadata names the Open Game License.

This work includes material taken from the System Reference Document 5.1
(“SRD 5.1”) by Wizards of the Coast LLC and available at
https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is
licensed under the Creative Commons Attribution 4.0 International License
available at https://creativecommons.org/licenses/by/4.0/legalcode.

Open5e contributors provided compilation and transcription:
https://github.com/open5e/open5e-api/tree/e69ac13b49dae6a9d84abf38fc674fe1db5b392b/data/v1/wotc-srd

We selected categories, decoded JSON fields, joined SRD subraces and archetypes,
derived spell components and levels, and omitted artwork. Upstream transcription
and rule edits are retained. This is not an authoritative verbatim SRD edition.
Section 5 of CC BY 4.0 contains the disclaimer of warranties and limitation of
liability. The full license is included at
[`../../public/licenses/cc-by-40.md`](../../public/licenses/cc-by-40.md), and
user-visible attribution is at `/licenses/`.

## Seeding and updates

`npm run dev` and `npm start` apply migrations and seed empty rules categories
without network access. Existing populated categories and user data are preserved.
`npm run open5e:seed` performs just the seeding after migrations.

Maintainers can run `npm run open5e:update-snapshot` online. It downloads only the
pinned SRD source files, never artwork or other publishers' content. To change
versions, edit the revision in `scripts/update-open5e-snapshot.mjs`, review source
licensing and content, then rebuild and review the snapshot and manifest together.
For a previously downloaded source directory, run
`npm run open5e:update-snapshot -- /path/to/data/v1/wotc-srd` offline.

Updating the committed snapshot does not overwrite populated local tables.
The limited SRD 5.1 selection includes one background and one feat; those counts
are expected, not a failed import. The current bundle has 938 top-level records.
