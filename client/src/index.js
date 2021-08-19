import Phaser from 'phaser';
import { Player } from './objects/player';
import animationPng from './assets/animation/animation.png';
import animationJson from './assets/animation/animation.json';

class Game extends Phaser.Scene {
    constructor() {
        super();
        this.cursors = {}
        this.player = null
        this.wasd = {}
    }
    
    preload() {
        this.load.atlas('player',animationPng,animationJson);
    }

    create() {
        this.anims.create({
            key: 'run',
            paused: false,
            frames: this.anims.generateFrameNames('player', { prefix: 'frame', start: 1, end: 6 }),
            frameRate: 15,
            repeat: -1,
        });

        this.player = new Player(this, 400, 350, 'player');
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.physics.world.setBounds( 0, 0, screen.width,screen.height);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.cameras.main.setBackgroundColor('#fff');
    }

    update() {
        this.handlePlayerMove();
    }

    handlePlayerMove(){
        if (this.cursors.left.isDown || this.wasd.A.isDown){      
            this.player.setVelocityX(-400);          
        } else if (this.cursors.right.isDown || this.wasd.D.isDown){
            this.player.setVelocityX(400);
        } else {
            this.player.setVelocityX(0);
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown){
            this.player.setVelocityY(400);
        } else if(this.cursors.up.isDown || this.wasd.W.isDown){
            this.player.setVelocityY(-400);
        } else {
            this.player.setVelocityY(0);
        }

    }
}

const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0 },
        }
    },
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        mode: Phaser.Scale.NONE, 
    },
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => game.scale.resize(window.innerWidth, window.innerHeight));
