import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { Open5eDataStore } from '../server/utils/open5e/store';
import type {
  Open5eRace, Open5eClass, Open5eBackground, Open5eSpell,
  Open5eMonster, Open5eWeapon, Open5eMagicItem, Open5eFeat,
} from '../server/utils/open5e/store';

interface Snapshot {
  races: Open5eRace[];
  classes: Open5eClass[];
  backgrounds: Open5eBackground[];
  spells: Open5eSpell[];
  monsters: Open5eMonster[];
  weapons: Open5eWeapon[];
  magic_items: Open5eMagicItem[];
  feats: Open5eFeat[];
}

const content = readFileSync(new URL('../data/open5e/srd-5.1.json', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../data/open5e/manifest.json', import.meta.url), 'utf8')) as {
  sha256: string;
  counts: Record<keyof Snapshot, number>;
};
if (createHash('sha256').update(content).digest('hex') !== manifest.sha256) {
  throw new Error('Bundled rules checksum does not match the snapshot manifest');
}
const data = JSON.parse(content) as Snapshot;
const categories = ['races', 'classes', 'backgrounds', 'spells', 'monsters', 'weapons', 'magic_items', 'feats'] as const;
for (const category of categories) {
  const records = data[category];
  if (!Array.isArray(records) || !records.length || records.length !== manifest.counts[category]
    || new Set(records.map(record => record.slug)).size !== records.length
    || records.some(record => !record.slug || !record.name || record.document__slug !== 'wotc-srd')) {
    throw new Error(`Invalid bundled rules category: ${category}`);
  }
}

const db = new Database('data/game.db');
const store = new Open5eDataStore();
try {
  for (const category of categories) {
    const { count } = db.prepare(`SELECT count(*) AS count FROM open5e_${category}`).get() as { count: number };
    if (count > 0) continue;
    switch (category) {
      case 'races': store.storeRaces(data.races); break;
      case 'classes': store.storeClasses(data.classes); break;
      case 'backgrounds': store.storeBackgrounds(data.backgrounds); break;
      case 'spells': store.storeSpells(data.spells); break;
      case 'monsters': store.storeMonsters(data.monsters); break;
      case 'weapons': store.storeWeapons(data.weapons); break;
      case 'magic_items': store.storeMagicItems(data.magic_items); break;
      case 'feats': store.storeFeats(data.feats); break;
    }
    console.log(`Seeded ${data[category].length} bundled ${category}`);
  }
} finally {
  store.close();
  db.close();
}
