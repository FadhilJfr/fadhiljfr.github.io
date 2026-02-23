const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const uiLayer = document.getElementById('ui-layer');
const dialogTitle = document.getElementById('dialog-title');
const dialogText = document.getElementById('dialog-text');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDialogActive = false;

// --- ASSET LOADING ---
const playerSprite = new Image();
playerSprite.src = 'player.png'; // Make sure this file exists in your repo!

const terminalSprite = new Image();
terminalSprite.src = 'terminal.png'; // Make sure this file exists in your repo!

// --- GAME OBJECTS ---
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 48,  // Scaled up for better visibility
    height: 48,
    speed: 5,
    color: '#00E436' // Fallback color
};

// The "Website Links" (Now rendered as terminals)
const zones = [
    { x: 150, y: 150, width: 48, height: 48, color: '#FF004D', title: "ABOUT_ME.TXT", text: "I am an indie dev. I build systems and break things." },
    { x: canvas.width - 200, y: 200, width: 48, height: 48, color: '#29ADFF', title: "DEVLOG_01", text: "Week 1: Swapped colored squares for actual pixel art sprites." },
    { x: canvas.width / 2 - 30, y: canvas.height - 150, width: 48, height: 48, color: '#FFCC00', title: "GITHUB_LINK", text: "Find my source code on my GitHub." }
];

// Input handling (WASD / Arrows / Space)
const keys = { w: false, a: false, s: false, d: false, space: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') keys.w = true;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.a = true;
    if (e.key === 's' || e.key === 'ArrowDown') keys.s = true;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.d = true;
    
    if (e.key === ' ' && !keys.space) {
        keys.space = true;
        handleInteraction();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') keys.w = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.a = false;
    if (e.key === 's' || e.key === 'ArrowDown') keys.s = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.d = false;
    if (e.key === ' ') keys.space = false;
});

// AABB Collision Detection
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Interaction Logic
function handleInteraction() {
    if (isDialogActive) {
        uiLayer.classList.add('hidden');
        isDialogActive = false;
        return;
    }

    for (let zone of zones) {
        if (checkCollision(player, zone)) {
            dialogTitle.innerText = zone.title;
            dialogText.innerText = zone.text;
            uiLayer.classList.remove('hidden');
            isDialogActive = true;
            break;
        }
    }
}

// Update Physics/Movement
function update() {
    if (isDialogActive) return;

    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;
}

// --- THE DRAWING ENGINE ---
function draw() {
    // 1. Clear the screen
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CRITICAL: Turn off image smoothing so pixel art stays crunchy and blocky
    ctx.imageSmoothingEnabled = false;

    // 2. Draw the Terminals (Zones)
    for (let zone of zones) {
        // Check if the image successfully loaded
        if (terminalSprite.complete && terminalSprite.naturalHeight !== 0) {
            ctx.drawImage(terminalSprite, zone.x, zone.y, zone.width, zone.height);
        } else {
            // Fallback: draw square if image is missing
            ctx.fillStyle = zone.color;
            ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        }
    }

    // 3. Draw the Player
    if (playerSprite.complete && playerSprite.naturalHeight !== 0) {
        ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
    } else {
        // Fallback: draw square
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

// Main Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the engine
gameLoop();

// Handle window resize dynamically
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
