import Phaser from 'phaser';
import { Terrain } from './objects/terrain';

import grassTileImg from './assets/grassTile.jpg';
import dirtTileImg from './assets/dirtTile.jpg';
import backgroundImg from './assets/oblakiBG.jpg'
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
        this.load.image('dirtTile', dirtTileImg);
        this.load.image('grassTile', grassTileImg);
        this.load.image('background', backgroundImg);
    }

    create() {
        this.anims.create({
            key: 'run',
            paused: false,
            frames: this.anims.generateFrameNames('player', { prefix: 'frame', start: 1, end: 6 }),
            frameRate: 15,
            repeat: -1,
        });
        this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(1);
        this.player = new Player(this, 400, 350, 'player');
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        this.physics.world.setBounds( 0, 0, screen.width,screen.height);
 
        this.cameras.main.startFollow(this.player, false, 1, 1, -350, 200);
        this.bg.setScrollFactor(0);
        this.add.existing(new Terrain(this, 500, 500, 'grassTile', 'dirtTile', this.player));
        

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
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        mode: Phaser.Scale.NONE, 
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 10000 },
            debug: false
        }
    },
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => game.scale.resize(window.innerWidth, window.innerHeight));
