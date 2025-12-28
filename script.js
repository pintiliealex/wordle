const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

let targetWord = ROMANIAN_WORDS[Math.floor(Math.random() * ROMANIAN_WORDS.length)];
let currentRow = 0;
let currentTile = 0;
let currentGuess = '';
let gameOver = false;

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const messageDisplay = document.getElementById('message');

const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

function initGame() {
    createBoard();
    createKeyboard();
}

function createBoard() {
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

function createKeyboard() {
    keys.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        row.forEach(key => {
            const button = document.createElement('button');
            button.className = key.length > 1 ? 'key wide' : 'key';
            button.textContent = key;
            button.dataset.key = key;
            button.addEventListener('click', () => handleKeyPress(key));
            keyboardRow.appendChild(button);
        });
        keyboard.appendChild(keyboardRow);
    });
}

function handleKeyPress(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACK') {
        deleteLetter();
    } else if (currentTile < WORD_LENGTH) {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentTile < WORD_LENGTH) {
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentGuess += letter;
        currentTile++;
    }
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
        tile.textContent = '';
        tile.classList.remove('filled');
        currentGuess = currentGuess.slice(0, -1);
    }
}

function submitGuess() {
    if (currentTile < WORD_LENGTH) {
        showMessage('Nu sunt destule litere');
        return;
    }

    if (!ROMANIAN_WORDS.includes(currentGuess)) {
        showMessage('Cuvant invalid');
        return;
    }

    flipTiles();
    
    setTimeout(() => {
        if (currentGuess === targetWord) {
            showMessage('Felicitari! Ai castigat!');
            gameOver = true;
            return;
        }

        currentRow++;
        currentTile = 0;
        currentGuess = '';

        if (currentRow >= MAX_GUESSES) {
            showMessage(`Joc terminat! Cuvantul era ${targetWord}`);
            gameOver = true;
        }
    }, WORD_LENGTH * 300);
}

function flipTiles() {
    const letterCount = {};
    for (let char of targetWord) {
        letterCount[char] = (letterCount[char] || 0) + 1;
    }

    const guessArray = currentGuess.split('');
    const status = Array(WORD_LENGTH).fill('absent');

    // First pass: mark correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArray[i] === targetWord[i]) {
            status[i] = 'correct';
            letterCount[guessArray[i]]--;
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (status[i] === 'absent' && targetWord.includes(guessArray[i]) && letterCount[guessArray[i]] > 0) {
            status[i] = 'present';
            letterCount[guessArray[i]]--;
        }
    }

    // Apply colors with animation
    for (let i = 0; i < WORD_LENGTH; i++) {
        setTimeout(() => {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            tile.classList.add('flip', status[i]);
            updateKeyboard(guessArray[i], status[i]);
        }, i * 300);
    }
}

function updateKeyboard(letter, status) {
    const key = document.querySelector(`[data-key="${letter}"]`);
    if (!key) return;

    const currentStatus = key.classList.contains('correct') ? 'correct' :
                         key.classList.contains('present') ? 'present' :
                         key.classList.contains('absent') ? 'absent' : '';

    if (status === 'correct' || (status === 'present' && currentStatus !== 'correct') || (status === 'absent' && !currentStatus)) {
        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(status);
    }
}

function showMessage(message) {
    messageDisplay.textContent = message;
    messageDisplay.classList.add('show');
    setTimeout(() => {
        messageDisplay.classList.remove('show');
        if (!gameOver) {
            messageDisplay.textContent = '';
        }
    }, 2000);
}

// Physical keyboard support
document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    if (e.key === 'Enter') {
        handleKeyPress('ENTER');
    } else if (e.key === 'Backspace') {
        handleKeyPress('BACK');
    } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
    }
});

initGame();
