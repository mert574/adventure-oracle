# Adventure Oracle

A fifth-edition tabletop companion built with Nuxt 4 and Vue 3. It currently
supports accounts, campaign creation and joining, character creation, and an
Open5e-backed rules reference stored in SQLite.

The intended experience combines personal player screens on phones or laptops
with a synchronized shared map and story display on a laptop or TV. This,
API-powered narration, story progression and occasional image generation are
planned. See [ROADMAP.md](ROADMAP.md).

## Run locally

Use Node.js 22.18.0 (see `.nvmrc`).

```sh
npm ci
```

Start the app:

```sh
npm run dev
```

`npm run dev` and `npm start` automatically create `.env` with a random local auth secret and initialize the SQLite database. Existing configuration and data are preserved. No manual setup or internet connection is needed after dependencies are installed. You can also run this setup explicitly with `npm run setup:local`.

Database migrations and local accounts run offline using the installed dependencies and SQLite; Better Auth does not require a hosted service. Optionally run `npm run open5e:init` online to populate the rules reference; it stays empty until data is imported.

Dependency installation and Open5e initialization need internet access. Imported data is cached locally. Only the CC BY 4.0 SRD 5.1 and A5E sources are imported.
Create your own test account through the app; no accounts or campaigns are bundled.
Local databases and environment files are ignored by Git.

## Checks and build

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
```

## License

Original application code is licensed under [MIT](LICENSE). Imported game data
and dependencies retain their own terms; see [third-party notices](THIRD_PARTY_NOTICES.md).
Adventure Oracle is an independent project, unaffiliated with Wizards of the Coast.
