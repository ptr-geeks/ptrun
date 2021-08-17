import Phaser from 'phaser';
import { Terrain } from './objects/terrain';

import dirtTileImg from './assets/dirtTile.jpg';
import backgroundImg from './assets/oblakiBG.jpg'

class Game extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.image('dirtTile', dirtTileImg);
        this.load.image('background', backgroundImg);
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(2.7);
        this.add.existing(new Terrain(this, 0, 0, 'dirtTile'));
        this.cameras.main.startFollow(player, false, 1, 0);
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
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => game.scale.resize(window.innerWidth, window.innerHeight));
