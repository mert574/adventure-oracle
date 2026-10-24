import { getMigrations } from 'better-auth/db';
import { auth } from '../utils/better-auth';

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();
console.log('Auth migrations completed successfully');
