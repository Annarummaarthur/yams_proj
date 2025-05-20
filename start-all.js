import { exec } from 'child_process';
import path from 'path';

const backendPath = path.resolve('./backend');

exec('start cmd /k "npx expo start"', (err) => {
  if (err) {
    console.error('Erreur en lançant Expo:', err);
  } else {
    console.log('Expo lancé avec succès');
  }
});

exec(`start cmd /k "cd /d ${backendPath} && npm install && npm run start"`, (err) => {
  if (err) {
    console.error('Erreur en lançant backend:', err);
  } else {
    console.log('Backend lancé avec succès');
  }
});
