// UI Elements
const uiLayer = document.getElementById('ui-layer');
const dialogTitle = document.getElementById('dialog-title');
const dialogText = document.getElementById('dialog-text');

let isDialogActive = false;

// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    pixelArt: true, // Ensures pixel perfect rendering
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

let player;
let zones = [];
let cursors;
let wasd;
let spaceKey;
let worldWidth, worldHeight;

function preload() {
    // Load assets
    this.load.image('player', 'player.png');
    this.load.image('terminal', 'terminal.png');
    this.load.image('grass', 'dirtandgrasstileset.png');
}

function create() {
    // Get grass texture dimensions to set world size
    const grassTexture = this.textures.get('grass');
    const grassWidth = grassTexture.getSourceImage().width;
    const grassHeight = grassTexture.getSourceImage().height;
    
    // Set world size (2x the screen size for scrolling)
    const scale = Math.max(this.scale.width / grassWidth, this.scale.height / grassHeight) * 2;
    worldWidth = grassWidth * scale;
    worldHeight = grassHeight * scale;
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    
    // Add background
    const background = this.add.image(0, 0, 'grass').setOrigin(0, 0);
    background.displayWidth = worldWidth;
    background.displayHeight = worldHeight;
    
    // Create player sprite
    player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    
    // Scale player to maintain aspect ratio
    const targetSize = 80;
    const aspectRatio = player.width / player.height;
    if (aspectRatio > 1) {
        player.displayWidth = targetSize;
        player.displayHeight = targetSize / aspectRatio;
    } else {
        player.displayHeight = targetSize;
        player.displayWidth = targetSize * aspectRatio;
    }
    
    // Set player physics properties
    player.setCollideWorldBounds(true);
    player.body.setSize(player.displayWidth, player.displayHeight);
    
    // Create zones (terminals)
    const zoneData = [
        { x: 150, y: 150, title: "ABOUT_ME.TXT", text: "I am an indie dev. I build systems and break things." },
        { x: worldWidth - 200, y: 200, title: "DEVLOG_01", text: "Week 1: Migrated to Phaser.js for better game features and performance!" },
        { x: worldWidth / 2 - 30, y: worldHeight - 200, title: "GITHUB_LINK", text: "Find my source code on my GitHub." }
    ];
    
    zoneData.forEach(data => {
        const zone = this.physics.add.sprite(data.x, data.y, 'terminal');
        zone.setScale(48 / zone.width); // Scale to 48x48
        zone.setImmovable(true);
        zone.data = { title: data.title, text: data.text };
        zones.push(zone);
    });
    
    // Setup camera to follow player
    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    
    // Setup keyboard controls
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', handleInteraction);
    
    // Handle window resize
    this.scale.on('resize', (gameSize) => {
        this.cameras.resize(gameSize.width, gameSize.height);
    });
}

function update() {
    if (isDialogActive || !player) return;
    
    // Player movement
    const speed = 200;
    player.setVelocity(0);
    
    if (cursors.left.isDown || wasd.left.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown || wasd.right.isDown) {
        player.setVelocityX(speed);
    }
    
    if (cursors.up.isDown || wasd.up.isDown) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown || wasd.down.isDown) {
        player.setVelocityY(speed);
    }
    
    // Normalize diagonal movement
    if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
        player.setVelocity(
            player.body.velocity.x * 0.707,
            player.body.velocity.y * 0.707
        );
    }
}

function handleInteraction() {
    // Close dialog if already open
    if (isDialogActive) {
        uiLayer.classList.add('hidden');
        isDialogActive = false;
        return;
    }
    
    // Check collision with zones
    for (let zone of zones) {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            zone.x, zone.y
        );
        
        // Check if player is close enough to interact
        if (distance < 60) {
            dialogTitle.innerText = zone.data.title;
            dialogText.innerText = zone.data.text;
            uiLayer.classList.remove('hidden');
            isDialogActive = true;
            break;
        }
    }
}
