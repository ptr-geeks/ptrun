import Phaser from 'phaser';
import { Terrain } from './objects/terrain';

import grassTileImg from './assets/grassTile.jpg';
import dirtTileImg from './assets/dirtTile.jpg';
import backgroundImg from './assets/oblakiBG.jpg'
import { Player } from './objects/player';
import playerImg from './assets/player_image.png';


class Game extends Phaser.Scene {
    constructor() {
        super();

        this.cursors = {}
        this.player = null
        this.wasd = {}
    }

    preload() {
        this.load.image('dirtTile', dirtTileImg);
        this.load.image('grassTile', grassTileImg);
        this.load.image('background', backgroundImg);
        this.load.image('player', playerImg);
    }

    create() {

        this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(0.8);
        this.player = new Player(this, 100, 650, 'player');
        this.add.existing(this.player);
        this.cameras.main.startFollow(this.player, false, 1, 1, -350, 200);
        this.bg.setScrollFactor(0);
        this.add.existing(new Terrain(this, 0, 0, 'grassTile', 'dirtTile', this.player));
        

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }
    update() {
        this.handlePlayerMove();
    }


    handlePlayerMove(){
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.A.isDown){
            this.player.body.setVelocityX(-300);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown){
            this.player.body.setVelocityX(300);
        } 
        if (this.cursors.down.isDown || this.wasd.S.isDown){
            this.player.body.setVelocityY(300);
        }else if(this.cursors.up.isDown || this.wasd.W.isDown){
            this.player.body.setVelocityY(-300);
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
            //gravity: { y: 300 },
            debug: false
        }
    },
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => game.scale.resize(window.innerWidth, window.innerHeight));
