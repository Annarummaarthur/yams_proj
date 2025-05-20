# Socket IO Example

<p>
  <!-- iOS -->
  <a href="https://itunes.apple.com/app/apple-store/id982107779">
    <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  </a>
  <!-- Android -->
  <a href="https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=blankexample">
    <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  </a>
  <!-- Web -->
  <a href="https://docs.expo.dev/workflow/web/">
    <img alt="Supports Expo Web" longdesc="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  </a>
</p>

# 1. Installation et lancement

# Lancement automatique

Pour faciliter l’installation et le démarrage des serveurs frontend et backend, un script est fourni :
  node start-all.js


Ce script va automatiquement :
  - Installer les dépendances nécessaires (npm install)
  - Lancer le serveur backend
  - Lancer le serveur frontend (Expo)

Note importante :
Chaque serveur sera ouvert dans une nouvelle fenêtre de terminal créée automatiquement par le script.

## Lancement manuelle

Si vous ne souhaitez pas utiliser le script start-all.js ou si vous rencontrez des erreurs, vous pouvez lancer les serveurs manuellement.
### Pour le frontend Expo :
  1. ouvrez un terminal
  2. Lancez la commande suivante :
    |-> npx expo start
### Pour le backend Node.js :
  1. ouvrez un terminal
  2. Naviguez dans le dossier backend : 
    |-> cd backend
  3. (Optionnel) Installez les dépendances manuellement :
    |-> npm install
  4. Démarrez le serveur :
    |-> npm run start

# 2. Structure du projet

* App.js — point d’entrée avec navigation et contexte socket
* app/components/ — composants React Native (grille, choix, infos joueurs, decks, dés, etc.)
* app/contexts/socket.context.js — contexte React fournissant l’instance Socket.IO
* app/screens/ — écrans de navigation (accueil, partie en ligne, partie vs bot)
* backend/ — serveur Node.js avec Socket.IO gérant la logique de jeu
