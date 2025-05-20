// backend/index.js

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
  game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
  game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewChoices = (game) => {
  console.log("[Serveur] updateClientsViewChoices appelé");
  setTimeout(() => {
    game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
    game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
  }, 200);
}

const updateClientsViewScore = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:1', game.gameState));
    game.player2Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:2', game.gameState));
  }, 200);
}

const gestionCombinaison = (game) => {
  const dices = [ ...game.gameState.deck.dices ];
  const isDefi = (game.gameState.deck.rollsCounter === 1 && Math.random() < 0.10);
  const isSec = game.gameState.deck.rollsCounter === 2;
  
  let combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
  
  // ⬇️ On filtre selon la grille
  combinations = GameService.choices.filterUnavailableCombinations(combinations, game.gameState.grid);

  game.gameState.choices.availableChoices = combinations;
};


// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const newPlayerInQueue = (socket) => {

  queue.push(socket);

  // Queue management
  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  }
  else {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
  }
};

const createGame = (player1Socket, player2Socket) => {

  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = player1Socket;
  newGame['player2Socket'] = player2Socket;
  games.push(newGame);

  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  games[gameIndex].gameState.player1TokensLeft = GameService.grid.getMaxToken();
  games[gameIndex].gameState.player2TokensLeft = GameService.grid.getMaxToken();
  games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

  updateClientsViewScore(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewTimers(games[gameIndex]);

  // On execute une fonction toutes les secondes (1000 ms)
  const gameInterval = setInterval(() => {

    games[gameIndex].gameState.timer--;
    updateClientsViewTimers(games[gameIndex]);

    // Si le timer tombe à zéro
    if (games[gameIndex].gameState.timer === 0) {

      // On change de tour en inversant le clé dans 'currentTurn'
      games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';

      // Méthode du service qui renvoie la constante 'TURN_DURATION'
      games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();
    
      games[gameIndex].gameState.deck = GameService.init.deck();
      games[gameIndex].gameState.choices = GameService.init.choices();
      games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

      updateClientsViewScore(games[gameIndex]);
      updateClientsViewGrid(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
      updateClientsViewTimers(games[gameIndex]);
    }

  }, 1000);

  // On prévoit de couper l'horloge
  // pour le moment uniquement quand le socket se déconnecte
  player1Socket.on('disconnect', () => {
    clearInterval(gameInterval);
  });

  player2Socket.on('disconnect', () => {
    clearInterval(gameInterval);
  });

};

const removePlayerFromQueue = (playerSocket) => {
  queue.shift();
  playerSocket.emit('queue.left', GameService.send.forPlayer.viewLeaveQueueState());
};


// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {
  console.log(`[${socket.id}] socket connected`);

  socket.on('queue.join', () => {
    console.log(`[${socket.id}] new player in queue `)
    newPlayerInQueue(socket);
  });

  socket.on('queue.leave', () => {
    console.log(`[${socket.id}] player wants to leave queue `)
    removePlayerFromQueue(socket);
  });

  socket.on('game.dices.roll', () => {
    console.log(`rool dice `);

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    if (gameIndex === -1) {
      console.error(`[${socket.id}] Aucun jeu trouvé pour ce socket`);
      return;
    }
    


    if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {
      // si ce n'est pas le dernier lancé

      // gestion des dés 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;

      // gestion des combinaisons ici
      gestionCombinaison(games[gameIndex]);

      // const dices = [ ...games[gameIndex].gameState.deck.dices];
      // const isDefi = false;
      // const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;
      // const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      
      // games[gameIndex].gameState.choices.availableChoices = combinations;
  

      // gestion des vues
      updateClientsViewDecks(games[gameIndex]);

    } else {
      // si c'est le dernier lancer

      // gestion des dés 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

      // gestion des combinaisons ici
      gestionCombinaison(games[gameIndex]);

      // const dices = [ ...games[gameIndex].gameState.deck.dices];
      // const isDefi = false;
      // const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;
      // const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      
      // games[gameIndex].gameState.choices.availableChoices = combinations;
  
      games[gameIndex].gameState.timer = GameService.timer.getEndTurnDuration();
      updateClientsViewTimers(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
    }
    updateClientsViewChoices(games[gameIndex]);
  });

  socket.on('game.dices.lock', (idDice) => {

    console.log(`lock dice `)

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);

    // reverse flag 'locked'
    games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });

  socket.on('game.choices.selected', (data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

    games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });


  socket.on('game.grid.selected', (data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const currentTurn = games[gameIndex].gameState.currentTurn;


    // Sélection de la cellule
    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, currentTurn, games[gameIndex].gameState.grid);

    // Calcul du score
    const results = GameService.grid.calculateScore(games[gameIndex].gameState.grid, currentTurn);

    if (currentTurn === 'player:1') {
      games[gameIndex].gameState.player1TokensLeft--;
      games[gameIndex].gameState.player1Score = results.playerScore;
    } else if (currentTurn === 'player:2') {
      games[gameIndex].gameState.player2TokensLeft--;
      games[gameIndex].gameState.player2Score = results.playerScore;
    }

    
    const p1Tokens = games[gameIndex].gameState.player1TokensLeft;
    const p2Tokens = games[gameIndex].gameState.player2TokensLeft;

    
    let winner = null;
    let loser = null;

    if (results.hasFiveInRow === true) { // si un joueur a mis 5 pion a la suite
      if(currentTurn == 'player:1'){
        winner = games[gameIndex].player1Socket.id;
        loser = games[gameIndex].player2Socket.id;
      }else{
        winner = games[gameIndex].player2Socket.id;
        loser = games[gameIndex].player1Socket.id;
      }
    } else if (p1Tokens == 0 && p2Tokens == 0){ // si les deux joueurs n'ont plus de jetons
      const score1 = games[gameIndex].gameState.player1Score;
      const score2 = games[gameIndex].gameState.player2Score;
    
      if (score1 > score2) {
        winner = games[gameIndex].player1Socket.id;
        loser = games[gameIndex].player2Socket.id;
      } else if (score2 > score1) {
        winner = games[gameIndex].player2Socket.id;
        loser = games[gameIndex].player1Socket.id;
      } else {
        winner = 'draw';
        loser = null;
      }
    }

    const finalScore = {
      winner,
      loser,
      player1: games[gameIndex].gameState.player1Score,
      player2: games[gameIndex].gameState.player2Score
    };
    
    
    if ((p1Tokens == 0 && p2Tokens == 0) || results.hasFiveInRow == true) {
      games[gameIndex].player1Socket.emit('game.over', {
        message: 'La partie est terminée.',
        finalScore
      });

      games[gameIndex].player2Socket.emit('game.over', {
        message: 'La partie est terminée.',
        finalScore
      });

      clearInterval(games[gameIndex].intervalId);
      return;
    }

    // Sinon, on continue le jeu
    games[gameIndex].gameState.currentTurn = currentTurn === 'player:1' ? 'player:2' : 'player:1';
    games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();
    games[gameIndex].gameState.deck = GameService.init.deck();
    games[gameIndex].gameState.choices = GameService.init.choices();

    updateClientsViewTimers(games[gameIndex]);
    updateClientsViewDecks(games[gameIndex]);
    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
    updateClientsViewScore(games[gameIndex]);
  });

  socket.on('disconnect', reason => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
    removePlayerFromQueue(socket);
  });
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});
