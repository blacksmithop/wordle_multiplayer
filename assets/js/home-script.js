const wordListUrl = 'https://raw.githubusercontent.com/dolph/dictionary/master/popular.txt';
let wordList = [];
let filteredWordList = [];
let targetWord = '';
let currentGuess = '';
let currentRow = 0;
let currentRound = 1;
let hintUsed = false;
let numLetters = 5; // Default number of letters
let numPlayers = 5; // Default number of players
let numRounds = 3; // Default number of rounds
let playerScores = {}; // To track player scores

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const toastContainer = document.getElementById('toast-container');

function showRoomOptions() {
    const nickname = document.getElementById('nickname-input').value;
    if (nickname.length < 3) {
        showToast('Nickname must be at least 3 characters long.');
        return;
    }

    document.getElementById('nickname-container').classList.add('hidden');
    document.getElementById('room-options-container').classList.remove('hidden');
}

function updateValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(`${sliderId}-value`);
    valueDisplay.textContent = slider.value;
    if (sliderId === 'num-letters') {
        numLetters = parseInt(slider.value);
    } else if (sliderId === 'num-players') {
        numPlayers = parseInt(slider.value);
    } else if (sliderId === 'num-rounds') {
        numRounds = parseInt(slider.value);
    }
}

function createRoom() {
    const nickname = document.getElementById('nickname-input').value;
    if (nickname.length < 3) {
        showToast('Nickname must be at least 3 characters long.');
        return;
    }

    console.log('Room created with settings:');
    console.log('Nickname:', nickname);
    console.log('Number of Players:', numPlayers);
    console.log('Number of Letters:', numLetters);
    console.log('Number of Rounds:', numRounds);

    const roomCode = generateRoomCode();
    document.getElementById('room-code').textContent = roomCode;
    document.getElementById('room-options-container').classList.add('hidden');
    document.getElementById('room-info-container').classList.remove('hidden');

    addPlayerToList(nickname); // Add the host player to the list
    playerScores[nickname] = 0; // Initialize score
}

function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

function copyRoomCode() {
    const roomCode = document.getElementById('room-code').textContent;
    navigator.clipboard.writeText(roomCode).then(() => {
        showToast('Room code copied to clipboard!');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Auto-close toast after 3 seconds
    setTimeout(() => {
        closeToast(toast);
    }, 3000);
}

function closeToast(toast) {
    toast.remove();
}

function addPlayerToList(playerName) {
    const playerList = document.getElementById('players');
    const playerItem = document.createElement('li');
    playerItem.textContent = playerName;
    playerList.appendChild(playerItem);
}

function startGame() {
    document.getElementById('room-info-container').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('total-rounds').textContent = numRounds;
    document.getElementById('current-round').textContent = currentRound;
    initializeGame();
}

function initializeGame() {
    // Fetch the word list and pick a random word with the correct length
    fetch(wordListUrl)
        .then(response => response.text())
        .then(data => {
            wordList = data.split('\n');
            filteredWordList = wordList.filter(word => word.length === numLetters);
            targetWord = filteredWordList[Math.floor(Math.random() * filteredWordList.length)];
            console.log('Target word:', targetWord); // For debugging

            // Initialize game board
            gameBoard.innerHTML = '';
            for (let i = 0; i < numLetters * 6; i++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                gameBoard.appendChild(tile);
            }

            // Initialize keyboard
            keyboard.innerHTML = '';
            for (let char of alphabet) {
                const key = document.createElement('div');
                key.className = 'key';
                key.textContent = char;
                key.onclick = () => handleKeyPress(char);
                keyboard.appendChild(key);
            }

            // Reset game state
            currentGuess = '';
            currentRow = 0;
            hintUsed = false;
            document.getElementById('hint-button').disabled = false; // Ensure hintButton exists
        })
        .catch(error => console.error('Error fetching word list:', error));
}

// Handle key press
function handleKeyPress(letter) {
    if (currentGuess.length < numLetters) {
        currentGuess += letter;
        updateBoard();
    }
}

// Update the game board
function updateBoard() {
    const rowTiles = document.querySelectorAll('.tile');
    for (let i = 0; i < numLetters; i++) {
        const tile = rowTiles[currentRow * numLetters + i];
        tile.textContent = currentGuess[i] || '';
        tile.classList.toggle('hover', currentGuess[i] !== undefined);
    }
}

// Handle submission of guess
function submitGuess() {
    if (currentGuess.length !== numLetters) {
        showToast('Guess must be the correct length!');
        return;
    }
    if (!filteredWordList.includes(currentGuess)) {
        showToast('Invalid word!');
        return;
    }

    const rowTiles = document.querySelectorAll('.tile');
    const letterCount = {};
    for (let char of targetWord) {
        letterCount[char] = (letterCount[char] || 0) + 1;
    }

    for (let i = 0; i < numLetters; i++) {
        const tile = rowTiles[currentRow * numLetters + i];
        const letter = currentGuess[i];
        if (letter === targetWord[i]) {
            tile.classList.add('correct');
            letterCount[letter]--;
        }
    }

    for (let i = 0; i < numLetters; i++) {
        const tile = rowTiles[currentRow * numLetters + i];
        const letter = currentGuess[i];
        if (!tile.classList.contains('correct')) {
            if (targetWord.includes(letter) && letterCount[letter] > 0) {
                tile.classList.add('misplaced');
                letterCount[letter]--;
            } else {
                tile.classList.add('wrong');
            }
            disableKey(letter);
        }
        tile.classList.remove('hover');
    }

    if (currentGuess === targetWord) {
        showToast('Congratulations, you guessed the word!');
        playerScores[document.getElementById('nickname-input').value] += 1; // Increment score
        endRound();
    } else {
        currentGuess = '';
        currentRow++;
        if (currentRow === 6) {
            showToast(`Game over! The word was ${targetWord}`);
            endRound();
        }
    }
}

function endRound() {
    currentRound++;
    if (currentRound > numRounds) {
        showLeaderboard();
    } else {
        document.getElementById('current-round').textContent = currentRound;
        initializeGame();
    }
}

function showLeaderboard() {
    document.getElementById('game-container').classList.add('hidden');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    leaderboardContainer.classList.remove('hidden');
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    // Sort players by score
    const sortedPlayers = Object.keys(playerScores).sort((a, b) => playerScores[b] - playerScores[a]);
    for (let player of sortedPlayers) {
        const listItem = document.createElement('li');
        listItem.textContent = `${player} - ${playerScores[player]} points`;
        leaderboard.appendChild(listItem);
    }
}

// Disable the key on the keyboard
function disableKey(letter) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (key.textContent === letter) {
            key.classList.add('disabled');
        }
    });
}

// Handle backspace key press
function handleBackspace() {
    if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
    }
}

document.addEventListener('keydown', (e) => {
    if (alphabet.includes(e.key) && currentGuess.length < numLetters) {
        handleKeyPress(e.key);
    } else if (e.key === 'Enter') {
        submitGuess();
    } else if (e.key === 'Backspace') {
        handleBackspace();
    }
});

// Show a hint for a random letter in the target word
function showHint() {
    if (hintUsed) return;

    const randomIndex = Math.floor(Math.random() * targetWord.length);
    const hintLetter = targetWord[randomIndex];
    showToast(`Hint: The letter '${hintLetter.toUpperCase()}' is in position ${randomIndex + 1}`);

    document.getElementById('hint-button').disabled = true;
    hintUsed = true;
}
