// websocket-server/services/game.service.js

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const TURN_DURATION = 60;
const END_TURN_DURATION = 10;
const MAX_TOKENS_PER_PLAYER = 12;

const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        player1TokensLeft: MAX_TOKENS_PER_PLAYER,
        player2TokensLeft: MAX_TOKENS_PER_PLAYER,
        grid: [],
        choices: {},
        deck: {}
    }
};


const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];




const GameService = {

    init: {
        // Init first level of structure of 'gameState' object
        
        gameState: () => {
            const game = { ...GAME_INIT };
            game.gameState.timer = TURN_DURATION;
            game.gameState.deck = { ...DECK_INIT };
            game.gameState.choices = { ...CHOICES_INIT };
            game.gameState.grid =  [ ...GRID_INIT];
            return game;
        },



        deck: () => {
            return { ...DECK_INIT };
        },
        choices: () => {
            return { ...CHOICES_INIT };
        },
        grid: () => {
            return { ...GRID_INIT };
        }


    },
    send: {
        forPlayer: {
            // Return conditionnaly gameState custom objet for player views
            viewGameState: (playerKey, game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer:
                        (playerKey === 'player:1')
                            ? game.player1Socket.id
                            : game.player2Socket.id,
                    idOpponent:
                        (playerKey === 'player:1')
                            ? game.player2Socket.id
                            : game.player1Socket.id
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };  
            },
            viewLeaveQueueState: () => {
                return {
                    inQueue: false,
                    inGame: false,
                };
            },
            gameTimer: (playerKey, gameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return { playerTimer: playerTimer, opponentTimer: opponentTimer };
            },
            deckViewState: (playerKey, gameState) => {
                const deckViewState = {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
                return deckViewState;
            },
            choicesViewState: (playerKey, gameState) => {
                const choicesViewState = {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                }
                return choicesViewState;
            },
            gridViewState: (playerKey, gameState) => {

                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };

            },
            scoreViewState: (playerKey, gameState) => {
                const playerScore = playerKey === 'player:1' ? gameState.player1Score : gameState.player2Score;
                const opponentScore = playerKey === 'player:1' ? gameState.player2Score : gameState.player1Score;
                return { playerScore, opponentScore };
            }
        }    
    },
    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
        },
        getEndTurnDuration: () => {
            return END_TURN_DURATION;
        }
    },
    dices: {
        roll: (dicesToRoll) => {
            const rolledDices = dicesToRoll.map(dice => {
                if (dice.value === "") {
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        id: dice.id,
                        value: newValue,
                        locked: false
                    };
                } else if (!dice.locked) {
                    // Si le dé n'est pas verrouillé et possède déjà une valeur, alors on le relance
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        ...dice,
                        value: newValue
                    };
                } else {
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laisse tel quel
                    return dice;
                }
            });
            return rolledDices;
        },

        lockEveryDice: (dicesToLock) => {
            const lockedDices = dicesToLock.map(dice => ({
                ...dice,
                locked: true
            }));
            return lockedDices;
        }
    },
    choices: {
        findCombinations: (dices, isDefi, isSec) => {

            const allCombinations = ALL_COMBINATIONS;

            // Tableau des objets 'combinations' disponibles parmi 'ALL_COMBINATIONS'
            const availableCombinations = [];

            // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6)
            const counts = Array(7).fill(0);

            let hasPair = false; // check: paire
            let threeOfAKindValue = null; // check: valeur brelan
            let hasThreeOfAKind = false; // check: brelan
            let hasFourOfAKind = false; // check: carré
            let hasFiveOfAKind = false; // check: yam
            let hasStraight = false; // check: suite
            let sum = 0; // sum of dices

            // -----------------------------------
            // TODO: Vérifier les combinaisons possibles
            // -----------------------------------

            dices.forEach(dice => {
                const val = parseInt(dice.value);
                if (isNaN(val)) return;
        
                counts[val]++;
                sum += val;
            });

            const [_, c1, c2, c3, c4, c5, c6] = counts;

            
            const isLessThanEqual8 = sum <= 8;

            // Paire
            hasPair = [c1, c2, c3, c4, c5, c6].includes(2);

            // Brelan
            if (c1 >= 3) { hasThreeOfAKind = true; threeOfAKindValue = 1; }
            else if (c2 >= 3) { hasThreeOfAKind = true; threeOfAKindValue = 2; }
            else if (c3 >= 3) { hasThreeOfAKind = true; threeOfAKindValue = 3; }
            else if (c4 >= 3) { hasThreeOfAKind = true; threeOfAKindValue = 4; }
            else if (c5 >= 3) { hasThreeOfAKind = true; threeOfAKindValue = 5; }
            else if (c6 >= 3) { hasThreeOfAKind = true; threeOfAKindValue = 6; }


            // Carré
            hasFourOfAKind = [c1, c2, c3, c4, c5, c6].includes(4);

            // Yam
            hasFiveOfAKind = [c1, c2, c3, c4, c5, c6].includes(5);

            // Suite        
            hasStraight = ((c1 === 0 || c6 === 0) && c2 === 1 && c3 === 1 && c4 === 1 && c5 === 1);


           // return available combinations
            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8) ||
                    (combination.id === 'defi' && isDefi) || 
                    (combination.id === 'sec' &&
                        isSec &&
                        !hasThreeOfAKind && // Pas de brelan
                        (
                            (hasPair && hasFourOfAKind) || // Full
                            hasFourOfAKind || // Carré
                            hasFiveOfAKind || // Yam
                            hasStraight || // Suite
                            isLessThanEqual8 || // ≤8
                            isDefi // Défi
                        )
                    )
                ) {
                    availableCombinations.push(combination);
                }
            });
            return availableCombinations;
        },
        filterUnavailableCombinations: (combinations, grid) => {
            return combinations.filter(combination => {
                // Vérifie s'il existe au moins une case avec le même id et sans owner
                for (let row of grid) {
                    for (let cell of row) {
                        if (cell.id === combination.id && cell.owner === null) {
                            return true;
                        }
                    }
                }
                return false; // Aucune case disponible pour cette combinaison
            });
        }
        
    },
    grid: {

        resetcanBeCheckedCells: (grid) => {
            // La grille retournée doit avoir le flag 'canBeChecked' de toutes les cases de la 'grid' à 'false'
            return grid.map(row =>
                row.map(cell => ({
                    ...cell,
                    canBeChecked: false
                }))
            );
        },
        

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {
            // La grille retournée doit avoir toutes les 'cells' qui ont le même 'id' que le 'idSelectedChoice' à 'canBeChecked: true'
            return grid.map(row =>
                row.map(cell => ({
                    ...cell,
                    canBeChecked: (cell.id === idSelectedChoice && cell.owner === null)
                }))
            );
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            // La grille retournée doit avoir avoir la case selectionnée par le joueur du tour en cours à 'owner: currentTurn'
            // Nous avons besoin de rowIndex et cellIndex pour différencier les deux combinaisons similaires du plateau
            return grid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                    if (rIdx === rowIndex && cIdx === cellIndex && cell.id === idCell) {
                        return {
                            ...cell,
                            owner: currentTurn
                        };
                    }
                    return cell;
                })
            );
        },
        calculateScore: (grid, currentPlayer) => {
            let playerScore = 0;
            let hasFiveInRow = false;
        
            const ROWS = grid.length;
            const COLS = grid[0].length;
        
            const directions = [
                { x: 1, y: 0 },   // horizontal
                { x: 0, y: 1 },   // vertical
                { x: 1, y: 1 },   // diagonal \
                { x: -1, y: 1 },  // diagonal /
            ];
        
            const inBounds = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
        
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const cell = grid[y][x];
                    if (cell.owner !== currentPlayer) continue;
        
                    for (let dir of directions) {
                        const prevX = x - dir.x;
                        const prevY = y - dir.y;
        
                        // Only count if this is the start of the sequence
                        if (inBounds(prevX, prevY) && grid[prevY][prevX].owner === currentPlayer) {
                            continue;
                        }
        
                        let count = 0;
                        for (let k = 0; k < 5; k++) {
                            const nx = x + k * dir.x;
                            const ny = y + k * dir.y;
        
                            if (!inBounds(nx, ny)) break;
                            const nextCell = grid[ny][nx];
        
                            if (nextCell.owner === currentPlayer) {
                                count++;
                            } else {
                                break;
                            }
                        }
        
                        if (count === 5) {
                            hasFiveInRow = true;
                        } else if (count === 4) {
                            playerScore += 2;
                        } else if (count === 3) {
                            playerScore += 1;
                        }
                    }
                }
            }
        
            return {
                playerScore: playerScore,
                hasFiveInRow: hasFiveInRow
            };
        },
        getMaxToken: () => {
            return MAX_TOKENS_PER_PLAYER;
        }
    },
    utils: {
        // Return game index in global games array by id
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        }
    }

}

module.exports = GameService;