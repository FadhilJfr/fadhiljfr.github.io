const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const uiLayer = document.getElementById('ui-layer');
const dialogTitle = document.getElementById('dialog-title');
const dialogText = document.getElementById('dialog-text');

// Set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State
let isDialogActive = false;

// Player Object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    speed: 5,
    color: '#00E436' // Neon Green
};

// Interactable Objects (The "Website Links")
const zones = [
    { x: 150, y: 150, width: 60, height: 60, color: '#FF004D', title: "ABOUT_ME.TXT", text: "I am an indie dev. I build systems and break things. Currently working on a survival horror game." },
    { x: canvas.width - 200, y: 200, width: 60, height: 60, color: '#29ADFF', title: "DEVLOG_01", text: "Week 1: Added basic movement and collision. Need to swap these colored boxes for actual pixel art sprites soon." },
    { x: canvas.width / 2 - 30, y: canvas.height - 150, width: 60, height: 60, color: '#FFCC00', title: "GITHUB_LINK", text: "You can find my source code and other tools on my GitHub profile." }
];

// Input handling
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
        rect1.x + rect1.size > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.size > rect2.y
    );
}

// Interaction Logic
function handleInteraction() {
    if (isDialogActive) {
        // Close dialog
        uiLayer.classList.add('hidden');
        isDialogActive = false;
        return;
    }

    // Check if player is touching any zone
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

// Update Game Logic
function update() {
    if (isDialogActive) return; // Stop movement while reading

    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size) player.x += player.speed;
}

// Draw Graphics
function draw() {
    // Clear screen
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Zones (Terminals)
    for (let zone of zones) {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        
        // Draw a shadow to make it look like a block
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(zone.x + 5, zone.y + 5, zone.width - 10, zone.height - 10);
    }

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Main Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the engine
gameLoop();

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
