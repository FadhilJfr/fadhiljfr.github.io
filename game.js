// Wait for DOM and Phaser to be ready
window.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const uiLayer = document.getElementById('ui-layer');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogText = document.getElementById('dialog-text');

    let isDialogActive = false;
    let player;
    let zones = [];
    let cursors;
    let wasd;
    let spaceKey;
    let worldWidth, worldHeight;
    let targetPosition = null; // Target position for click-to-move

    // Check if Phaser loaded
    if (typeof Phaser === 'undefined') {
        console.error('Phaser failed to load from CDN');
        return;
    }

    // Phaser Game Configuration
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game-container',
        pixelArt: true, // Ensures pixel perfect rendering
        backgroundColor: '#5a8c44',
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

function preload() {
    // Load assets with error handling
    this.load.on('loaderror', function(file) {
        console.warn('Failed to load:', file.key);
    });
    
    this.load.image('player', 'player.png');
    this.load.image('terminal', 'terminal.png');
    this.load.image('grass', 'dirtandgrasstileset.png');
}

function create() {
    // Get grass texture dimensions to set world size
    const grassTexture = this.textures.get('grass');
    const grassLoaded = grassTexture && grassTexture.key !== '__MISSING';
    
    if (grassLoaded) {
        const grassWidth = grassTexture.getSourceImage().width;
        const grassHeight = grassTexture.getSourceImage().height;
        
        // Set world size (2x the screen size for scrolling)
        const scale = Math.max(this.scale.width / grassWidth, this.scale.height / grassHeight) * 2;
        worldWidth = grassWidth * scale;
        worldHeight = grassHeight * scale;
        
        // Add background
        const background = this.add.image(0, 0, 'grass').setOrigin(0, 0);
        background.displayWidth = worldWidth;
        background.displayHeight = worldHeight;
    } else {
        // Fallback if grass texture fails to load
        console.warn('Grass texture not loaded, using default world size');
        worldWidth = this.scale.width * 2;
        worldHeight = this.scale.height * 2;
    }
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    
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
        { x: 150, y: 150, color: 0xFF004D, title: "ABOUT_ME.TXT", text: "I am an indie dev. I build systems and break things." },
        { x: worldWidth - 200, y: 200, color: 0x29ADFF, title: "DEVLOG_01", text: "Week 1: Migrated to Phaser.js for better game features and performance!" },
        { x: worldWidth / 2 - 30, y: worldHeight - 200, color: 0xFFCC00, title: "GITHUB_LINK", text: "Find my source code on my GitHub." }
    ];
    
    const terminalLoaded = this.textures.get('terminal').key !== '__MISSING';
    
    zoneData.forEach(data => {
        let zone;
        if (terminalLoaded) {
            zone = this.physics.add.sprite(data.x, data.y, 'terminal');
            zone.setScale(48 / zone.width); // Scale to 48x48
        } else {
            // Fallback: create colored rectangles
            zone = this.add.rectangle(data.x, data.y, 48, 48, data.color);
            this.physics.add.existing(zone);
        }
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
    
    // Click/Tap to move - Fixed for GitHub Pages
    this.input.on('pointerdown', (pointer) => {
        if (isDialogActive) return;
        
        // Manually calculate world coordinates from camera and pointer position
        const cam = this.cameras.main;
        const worldX = pointer.x + cam.scrollX;
        const worldY = pointer.y + cam.scrollY;
        
        // Set target position
        targetPosition = { x: worldX, y: worldY };
        
        console.log('Click registered:', worldX, worldY);
    });
    
    // Handle window resize
    this.scale.on('resize', (gameSize) => {
        this.cameras.resize(gameSize.width, gameSize.height);
    });
}

function update() {
    if (isDialogActive || !player) return;
    
    const speed = 200;
    player.setVelocity(0);
    
    // Check if any keyboard input is active
    const keyboardActive = cursors.left.isDown || cursors.right.isDown || 
                          cursors.up.isDown || cursors.down.isDown ||
                          wasd.left.isDown || wasd.right.isDown || 
                          wasd.up.isDown || wasd.down.isDown;
    
    if (keyboardActive) {
        // Keyboard controls - cancel click-to-move
        targetPosition = null;
        
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
    } else if (targetPosition) {
        // Click-to-move - move towards target position
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            targetPosition.x, targetPosition.y
        );
        
        // If close enough to target, stop moving
        if (distance < 5) {
            targetPosition = null;
            player.setVelocity(0);
        } else {
            // Move towards target
            const angle = Phaser.Math.Angle.Between(
                player.x, player.y,
                targetPosition.x, targetPosition.y
            );
            
            player.setVelocityX(Math.cos(angle) * speed);
            player.setVelocityY(Math.sin(angle) * speed);
        }
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

}); // End of DOMContentLoaded
