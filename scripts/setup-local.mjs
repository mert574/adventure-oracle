import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Keep a stable secret across restarts without requiring manual configuration.
if (!existsSync('.env')) {
  const template = readFileSync('.env.example', 'utf8');
  writeFileSync('.env', template.replace(
    'your-super-secret-key-here-at-least-32-characters-long',
    randomBytes(48).toString('hex'),
  ), { flag: 'wx', mode: 0o600 });
  console.log('Created local .env');
}

process.loadEnvFile('.env');
mkdirSync('data', { recursive: true });

// Use only installed packages; never download a CLI during local startup.
for (const script of ['server/db/migrate.ts', 'server/db/migrate-auth.ts']) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', script], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
