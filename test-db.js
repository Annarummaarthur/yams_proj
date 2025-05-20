import sql from './backend/db.js'; // ajoute l'extension .js ou .mjs selon

async function test() {
  try {
    const users = await sql`SELECT * FROM profiles`;
    console.log('Utilisateurs :', users);
  } catch (err) {
    console.error('Erreur SQL:', err.message || err);
  }
}

test();
