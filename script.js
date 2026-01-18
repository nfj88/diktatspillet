// Liste over alle ord i spillet
const words = [
    'ved',
    'passer',
    'overflade',
    'stier',
    'hjemme',
    'skuldre',
    'enkel',
    'koldt',
    'selve',
    'kryber',
    'højere',
    'områder',
    'skrider',
    'bevæger',
    'skøjter',
    'spejlblanke',
    'cykelturen',
    'håndled',
    'omkring',
    'øverste',
    'årsagen',
    'yderste',
    'glider',
    'mister',
    'forsigtigt',
    'skidt',
    'sikrest',
    'pludselig',
    'hvorfor',
    'frysepunktet',
    'ligger',
    'vintre',
    'forsvinde',
    'nemt',
    'balancen',
    'bedst',
    'gader',
    'cyklen',
    'styrt',
    'forklaringen',
    'stadig',
    'tyndt',
    'frostvejr',
    'længere',
    'frosne'
];

// Spil state
let currentRoomIndex = 0;
let currentWord = '';
let currentInput = [];
let lives = 3;
let selectedWords = [];
const danishLetters = ['æ', 'ø', 'å'];

// DOM elementer
const door = document.getElementById('door');
const board = document.getElementById('board');
const wordDisplay = document.getElementById('wordDisplay');
const keyboard = document.getElementById('keyboard');
const speaker = document.getElementById('speaker');
const fireworks = document.getElementById('fireworks');
const livesContainer = document.getElementById('livesContainer');
const startMenu = document.getElementById('startMenu');
const room = document.getElementById('room');
const customWordsInput = document.getElementById('customWordsInput');
const startButton = document.getElementById('startButton');
const victoryMenu = document.getElementById('victoryMenu');
const playAgainButton = document.getElementById('playAgainButton');
const backToStartButton = document.getElementById('backToStartButton');

// Initialiser menu
function initMenu() {
    // Håndter ændring af word mode
    document.querySelectorAll('input[name="wordMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const customSelection = document.getElementById('customSelection');
            if (e.target.value === 'custom') {
                customSelection.style.display = 'block';
            } else {
                customSelection.style.display = 'none';
            }
        });
    });

    // Start knap event listener
    startButton.addEventListener('click', startGame);
    
    // Victory menu event listeners
    playAgainButton.addEventListener('click', () => {
        victoryMenu.style.display = 'none';
        currentRoomIndex = 0;
        lives = 3;
        updateLivesDisplay();
        loadRoom();
    });
    
    backToStartButton.addEventListener('click', () => {
        victoryMenu.style.display = 'none';
        room.style.display = 'none';
        startMenu.style.display = 'flex';
        // Nulstil fireworks
        fireworks.innerHTML = '';
    });
}

// Start spillet baseret på valg
function startGame() {
    const selectedMode = document.querySelector('input[name="wordMode"]:checked').value;
    
    if (selectedMode === 'random') {
        // Vælg 15 tilfældige ord
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        selectedWords = shuffled.slice(0, 15);
    } else if (selectedMode === 'custom') {
        // Parse indtastede ord
        const inputText = customWordsInput.value.trim();
        
        if (!inputText) {
            alert('Skriv mindst ét ord!');
            return;
        }
        
        // Split på komma eller linjeskift og trim hvert ord
        selectedWords = inputText
            .split(/[,\n]/)
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length > 0);
        
        if (selectedWords.length === 0) {
            alert('Skriv mindst ét ord!');
            return;
        }
    }

    if (selectedWords.length === 0) {
        alert('Vælg mindst ét ord!');
        return;
    }

    // Skjul menu og vis spil
    startMenu.style.display = 'none';
    room.style.display = 'flex';
    
    // Initialiser spillet
    initGame();
}

// Initialiser spillet
function initGame() {
    currentRoomIndex = 0;
    lives = 3;
    updateLivesDisplay();
    loadRoom();
    createKeyboard();
    setupKeyboardListeners();
}

// Opsæt keyboard event listeners
function setupKeyboardListeners() {
    document.addEventListener('keydown', handleKeyboardInput);
}

// Fjern keyboard event listeners
function removeKeyboardListeners() {
    document.removeEventListener('keydown', handleKeyboardInput);
}

// Håndter keyboard input
function handleKeyboardInput(event) {
    // Ignorer hvis vi er i en input/textarea eller menu er vist
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
    }
    
    if (startMenu.style.display !== 'none' || victoryMenu.style.display === 'flex') {
        return;
    }

    const key = event.key.toLowerCase();
    
    // Håndter backspace for at slette sidste bogstav
    if (key === 'backspace') {
        event.preventDefault();
        if (currentInput.length > 0) {
            currentInput.pop();
            displayWord();
        }
        return;
    }

    // Konverter danske tegn på tastaturet
    const danishMap = {
        'æ': 'æ',
        'ø': 'ø',
        'å': 'å',
        // Alternativ mapping afhængigt af keyboard layout
        ';': 'æ', // Nogle keyboard layouts
        "'": 'æ', // Andre layouts
        '[': 'ø',
        ']': 'å'
    };

    // Tjek om det er et gyldigt bogstav
    const validLetters = 'abcdefghijklmnopqrstuvwxyzæøå';
    let letter = danishMap[key] || key;

    if (validLetters.includes(letter)) {
        event.preventDefault();
        selectLetter(letter);
    }
}

// Opdater hjerte-visning
function updateLivesDisplay() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = '❤️';
        if (i >= lives) {
            heart.classList.add('lost');
        }
        livesContainer.appendChild(heart);
    }
}

// Indlæs nyt rum
function loadRoom() {
    if (currentRoomIndex >= selectedWords.length) {
        // Alle døre er åbnet - vis fyrværkeri
        showFireworks();
        return;
    }

    currentWord = selectedWords[currentRoomIndex];
    currentInput = [];
    door.classList.remove('open');
    door.classList.add('closed');
    
    displayWord();
    
    // Tal ordet når døren åbnes (eller første gang)
    if (currentRoomIndex > 0) {
        speakWord(currentWord);
    }
}

// Vis ordet med streger
function displayWord() {
    wordDisplay.innerHTML = '';
    const wordLength = currentWord.length;
    
    for (let i = 0; i < wordLength; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        if (currentInput[i]) {
            slot.textContent = currentInput[i];
            slot.classList.add('filled');
        }
        wordDisplay.appendChild(slot);
    }
}

// Opret tastatur
function createKeyboard() {
    keyboard.innerHTML = '';
    const letters = 'abcdefghijklmnopqrstuvwxyzæøå'.split('');
    
    letters.forEach(letter => {
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = letter.toUpperCase();
        key.addEventListener('click', () => selectLetter(letter.toLowerCase()));
        keyboard.appendChild(key);
    });
}

// Vælg bogstav
function selectLetter(letter) {
    // Ignorer klik hvis ordet allerede er fuldt
    if (currentInput.length >= currentWord.length) {
        return;
    }

    currentInput.push(letter);
    displayWord();
    
    // Hvis ordet er fuldt, tjek automatisk
    if (currentInput.length === currentWord.length) {
        setTimeout(() => checkWord(), 300);
    }
}

// Tjek om ordet er korrekt
function checkWord() {
    const inputWord = currentInput.join('');
    
    if (inputWord === currentWord) {
        // Korrekt ord - åbn døren
        openDoor();
    } else {
        // Forkert ord - mist et liv
        loseLife();
    }
}

// Mist et liv
function loseLife() {
    lives--;
    updateLivesDisplay();
    
    // Tilføj shake animation til tavlen
    board.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        board.style.animation = '';
    }, 500);
    
    if (lives <= 0) {
        // Game Over
        gameOver();
    } else {
        // Nulstil input
        currentInput = [];
        displayWord();
    }
}

// Game Over
function gameOver() {
    alert('Game Over! Du har mistet alle dine liv. Spillet starter forfra.');
    // Genstart spillet
    currentRoomIndex = 0;
    lives = 3;
    updateLivesDisplay();
    loadRoom();
}

// Åbn døren
function openDoor() {
    // Tilføj success animation
    board.classList.add('correct');
    setTimeout(() => {
        board.classList.remove('correct');
    }, 500);
    
    door.classList.remove('closed');
    door.classList.add('open');
    
    // Tal ordet
    speakWord(currentWord);
    
    // Gå til næste rum efter lidt tid
    setTimeout(() => {
        currentRoomIndex++;
        if (currentRoomIndex < selectedWords.length) {
            loadRoom();
        } else {
            showFireworks();
        }
    }, 2000);
}

// Tal et ord
function speakWord(word) {
    if ('speechSynthesis' in window) {
        // Stop eventuelle igangværende tale
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'da-DK';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Prøv at finde en dansk stemme
        const voices = speechSynthesis.getVoices();
        const danishVoice = voices.find(voice => 
            voice.lang.startsWith('da') || voice.name.toLowerCase().includes('danish')
        );
        if (danishVoice) {
            utterance.voice = danishVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

// Vent på at stemmer er indlæst
if ('speechSynthesis' in window) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            // Stemmer er nu indlæst
        };
    }
}

// Højttaler klik - gentag ordet
speaker.addEventListener('click', () => {
    speakWord(currentWord);
});

// Vis fyrværkeri
function showFireworks() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            explodeFirework(x, y, color);
        }, i * 150);
    }
    
    // Vis victory menu efter fyrværkeri
    setTimeout(() => {
        victoryMenu.style.display = 'flex';
    }, 3000);
}


// Eksploder fyrværkeri
function explodeFirework(x, y, color) {
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 150 + Math.random() * 150;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        fireworks.appendChild(particle);
        
        // Animer partiklen
        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${vx}px, ${vy}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 1500,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        setTimeout(() => particle.remove(), 1500);
    }
}

// Start menuen når siden er indlæst
window.addEventListener('load', initMenu);
