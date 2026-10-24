import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import Database from 'better-sqlite3';

const root = resolve(import.meta.dirname, '..');

function createFixture() {
  const cwd = mkdtempSync(join(tmpdir(), 'adventure-offline-'));
  for (const path of ['scripts', 'server', 'data/open5e', '.env.example', 'package.json']) {
    cpSync(join(root, path), join(cwd, path), { recursive: true });
  }
  symlinkSync(join(root, 'node_modules'), join(cwd, 'node_modules'), 'dir');
  const blocker = join(cwd, 'block-network.mjs');
  writeFileSync(blocker, `
import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
function blocked() { throw new Error('Network access prohibited during offline setup'); }
globalThis.fetch = blocked;
net.Socket.prototype.connect = blocked;
net.connect = blocked;
net.createConnection = blocked;
tls.connect = blocked;
http.request = blocked;
http.get = blocked;
https.request = blocked;
https.get = blocked;
syncBuiltinESMExports();
`);
  const env = { ...process.env, NODE_ENV: 'development', NODE_OPTIONS: `--import=${pathToFileURL(blocker).href}` };
  delete env.BETTER_AUTH_SECRET;
  delete env.BETTER_AUTH_URL;
  function run(script, overrides = {}) {
    return spawnSync(process.execPath, ['--import', 'tsx', script], {
      cwd, env: { ...env, ...overrides }, encoding: 'utf8', timeout: 30000,
    });
  }
  return { cwd, run };
}

function assertSuccess(result) {
  assert.equal(result.status, 0, result.stdout + result.stderr + (result.error ?? ''));
}

test('fresh setup seeds rules and local login offline, preserves data, and repairs empty categories', async () => {
  const { cwd, run } = createFixture();
  try {
    assertSuccess(run('scripts/setup-local.mjs'));
    const db = new Database(join(cwd, 'data/game.db'));
    try {
      const manifest = JSON.parse(readFileSync(join(cwd, 'data/open5e/manifest.json'), 'utf8'));
      for (const [category, count] of Object.entries(manifest.counts)) {
        assert.equal(db.prepare(`SELECT count(*) AS count FROM open5e_${category}`).get().count, count);
        assert.equal(db.prepare(`SELECT count(*) AS count FROM open5e_${category} WHERE document_slug != 'wotc-srd'`).get().count, 0);
      }
      const user = db.prepare('SELECT * FROM user WHERE email = ?').get('local@test.com');
      assert.ok(user);
      const account = db.prepare('SELECT * FROM account WHERE userId = ? AND providerId = ?').get(user.id, 'credential');
      const { verifyPassword } = await import('better-auth/crypto');
      assert.equal(await verifyPassword({ hash: account.password, password: 'testingtesting' }), true);
      const originalEnv = readFileSync(join(cwd, '.env'), 'utf8');
      db.prepare('UPDATE open5e_races SET name = ? WHERE slug = ?').run('Local customization', 'elf');
      db.exec('DELETE FROM open5e_spells');
      assertSuccess(run('scripts/setup-local.mjs'));
      assert.equal(readFileSync(join(cwd, '.env'), 'utf8'), originalEnv);
      assert.equal(db.prepare('SELECT name FROM open5e_races WHERE slug = ?').get('elf').name, 'Local customization');
      assert.equal(db.prepare('SELECT count(*) AS count FROM open5e_spells').get().count, manifest.counts.spells);
      assert.equal(db.prepare('SELECT password FROM account WHERE id = ?').get(account.id).password, account.password);
      const snapshotPath = join(cwd, 'data/open5e/srd-5.1.json');
      writeFileSync(snapshotPath, readFileSync(snapshotPath, 'utf8') + ' ');
      const corrupt = run('scripts/seed-open5e.ts');
      assert.notEqual(corrupt.status, 0);
      assert.match(corrupt.stderr, /checksum/);
    } finally { db.close(); }
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});

test('production never creates the default local account', () => {
  const { cwd, run } = createFixture();
  try {
    assertSuccess(run('scripts/setup-local.mjs', { NODE_ENV: 'production' }));
    const db = new Database(join(cwd, 'data/game.db'));
    try {
      assert.equal(db.prepare('SELECT count(*) AS count FROM user WHERE email = ?').get('local@test.com').count, 0);
    } finally { db.close(); }
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
