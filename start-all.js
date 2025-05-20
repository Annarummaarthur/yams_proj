import { exec } from 'child_process';
import path from 'path';

const backendPath = path.resolve('./backend');

// Ouvre un terminal pour Expo dans ./ (racine)
exec('start cmd /k "npx expo start"', (err) => {
  if (err) {
    console.error('Erreur en lançant Expo:', err);
  } else {
    console.log('Expo lancé avec succès');
  }
});

// Ouvre un second terminal dans ./backend, fait npm install puis npm run start
exec(`start cmd /k "cd /d ${backendPath} && npm install && npm run start"`, (err) => {
  if (err) {
    console.error('Erreur en lançant backend:', err);
  } else {
    console.log('Backend lancé avec succès');
  }
});
