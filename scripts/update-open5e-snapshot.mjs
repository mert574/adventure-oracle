import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const revision = 'e69ac13b49dae6a9d84abf38fc674fe1db5b392b';
const source = `https://raw.githubusercontent.com/open5e/open5e-api/${revision}/data/v1/wotc-srd`;
const localDirectory = process.argv[2];
const models = {
  races: 'Race', classes: 'CharClass', backgrounds: 'Background', spells: 'Spell',
  monsters: 'Monster', weapons: 'Weapon', magic_items: 'MagicItem', feats: 'Feat',
};

async function load(model) {
  if (localDirectory) return JSON.parse(await readFile(`${localDirectory}/${model}.json`, 'utf8'));
  const response = await fetch(`${source}/${model}.json`);
  if (!response.ok) throw new Error(`Downloading ${model}: HTTP ${response.status}`);
  return response.json();
}

const document = (await load('Document'))[0];
if (document.fields.slug !== 'wotc-srd' || document.fields.version !== '5.1') {
  throw new Error('Expected the SRD 5.1 source document');
}

function convert(record) {
  if (record.fields.document !== document.pk) throw new Error(`Unexpected source: ${record.pk}`);
  const fields = { ...record.fields };
  for (const key of ['document', 'img_main', 'route', 'page_no']) delete fields[key];
  for (const key of Object.keys(fields)) {
    if (key.endsWith('_json')) {
      fields[key.slice(0, -5)] = fields[key] ? JSON.parse(fields[key]) : [];
      delete fields[key];
    }
  }
  return {
    ...fields, slug: record.pk, document__slug: 'wotc-srd',
    document__title: 'System Reference Document 5.1',
    document__url: 'https://www.dndbeyond.com/srd',
  };
}

const subraces = (await load('Subrace')).map(convert);
const archetypes = (await load('Archetype')).map(convert);
const data = {};
for (const [category, model] of Object.entries(models)) {
  const records = (await load(model)).map(convert);
  for (const record of records) {
    if (category === 'races') record.subraces = subraces.filter(subrace => subrace.parent_race === record.slug);
    if (category === 'classes') record.archetypes = archetypes.filter(archetype => archetype.char_class === record.slug);
    if (category === 'spells') {
      record.level_int = record.spell_level;
      record.components = [
        record.requires_verbal_components && 'V', record.requires_somatic_components && 'S',
        record.requires_material_components && 'M',
      ].filter(Boolean).join(', ');
      record.spell_lists = record.dnd_class.split(',').map(name => name.trim());
    }
    if (category === 'monsters') record.spell_list = record.spells;
    if (category === 'feats') record.effects = JSON.stringify(record.effects_desc);
  }
  data[category] = records.sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
}

const content = JSON.stringify(data, null, 2) + '\n';
const manifest = {
  version: 1, upstreamRevision: revision,
  upstream: `https://github.com/open5e/open5e-api/tree/${revision}/data/v1/wotc-srd`,
  source: 'wotc-srd', license: 'CC-BY-4.0',
  author: document.fields.author,
  copyright: document.fields.copyright,
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/legalcode',
  licensingBasis: 'SRD 5.1 is dual-licensed; this snapshot uses the Creative Commons option, replacing the legacy OGL metadata.',
  modifications: 'Selected eight application categories, decoded JSON fields, joined SRD subraces and archetypes, derived spell components and levels, and omitted artwork. Upstream transcription and rule modifications are retained; this is not an authoritative verbatim SRD edition.',
  sha256: createHash('sha256').update(content).digest('hex'),
  counts: Object.fromEntries(Object.entries(data).map(([key, records]) => [key, records.length])),
};
await mkdir('data/open5e', { recursive: true });
await writeFile('data/open5e/srd-5.1.json', content);
await writeFile('data/open5e/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Updated pinned SRD 5.1 snapshot:', manifest.counts);
