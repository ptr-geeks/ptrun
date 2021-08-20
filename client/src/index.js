import Phaser from 'phaser';
import { Terrain } from './objects/terrain';

import grassTileImg from './assets/grassTile.jpg';
import dirtTileImg from './assets/dirtTile.jpg';
import backgroundImg from './assets/oblakiBG.jpg';
import { Player } from './objects/player';
import playerImg from './assets/player_image.png';
import { Background } from './objects/background';

import { Websocket } from './network/websocket';

class Game extends Phaser.Scene {
    constructor() {
        super();

        this.cursors = {};
        this.player = null;
        this.wasd = {};

        this.websocket = new Websocket(this.handleMessage.bind(this));
    }

    preload() {
        this.load.image('dirtTile', dirtTileImg);
        this.load.image('grassTile', grassTileImg);
        this.load.image('background', backgroundImg);
        this.load.image('player', playerImg);
    }

    create() {
        this.background = new Background(this, 0, 0, 0, 0, 'background');
        this.player = new Player(this, 100, 650, 'player');

        this.cameras.main.startFollow(this.player, false, 1, 1, -350, 200);
        this.add.existing(this.background);
        this.add.existing(this.player);
        this.add.existing(new Terrain(this, 0, 0, 'grassTile', 'dirtTile', this.player));

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    update() {
        this.handlePlayerMove();
        this.background.update();
    }

    handlePlayerMove() {
        let moved = false;
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.body.setVelocityX(-300);
            moved = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.body.setVelocityX(300);
            moved = true;
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.body.setVelocityY(300);
            moved = true;
        } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.body.setVelocityY(-300);
            moved = true;
        } else {
            this.player.body.setVelocityY(0);
        }
        if (moved) {
            this.websocket.playerMoveSend(this.player.x, this.player.y, this.player.body.velocity.x, this.player.body.velocity.y);
        }
    }

    handleMessage(msg) {
        console.log('handle message executed');
        if (msg.hasJoin()) {
            console.log('player joined');
            this.joinRecieve(msg.getPlayerId());
        } else if (msg.hasMove()) {
            const move = msg.getMove();
            this.playerMoveRecieve(msg.getPlayerId(), move.getX(), move.getY(), move.getDx(), move.getDy());
        }
    }

    playerMoveRecieve(player_id, x, y, dx, dy) {
        console.log(player_id, x, y);

    }

    joinRecieve(player_id) {
        console.log(player_id);

    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        mode: Phaser.Scale.NONE,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 250 },
            debug: false
        }
    },
    antialias: false,
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));
