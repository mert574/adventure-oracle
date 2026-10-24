import Database from 'better-sqlite3';

if (process.env.NODE_ENV !== 'production') {
  const db = new Database('data/game.db');
  try {
    const existing = db.prepare('SELECT id FROM user WHERE email = ?').get('local@test.com');
    if (!existing) {
      const { auth } = await import('../server/utils/better-auth');
      await auth.api.signUpEmail({
        body: { name: 'Local Tester', email: 'local@test.com', password: 'testingtesting' },
      });
      console.log('Created default local user: local@test.com');
    }
  } finally {
    db.close();
  }
}
