import Phaser from 'phaser';

import { Websocket } from './network/websocket';

import { Terrain } from './objects/terrain';
import { Background } from './objects/background';
import { Player } from './objects/player';

import grassTileImg from './assets/grassTile.jpg';
import dirtTileImg from './assets/dirtTile.jpg';
import backgroundImg from './assets/oblakiBG.jpg';

import playerImg from './assets/player_image.png';

import animationPng from './assets/player/animation_white.png';
import animationJson from './assets/player/animation.json';

class Game extends Phaser.Scene {
    constructor() {
        super();

        this.cursors = {};
        this.player = null;
        this.wasd = {};
        this.players = {};
    }

    preload() {
        this.load.image('dirtTile', dirtTileImg);
        this.load.image('grassTile', grassTileImg);
        this.load.image('background', backgroundImg);

        this.load.atlas('player', animationPng, animationJson);
    }

    create() {
        this.background = new Background(this, 0, 0, 0, 0, 'background').setDepth(-100);
        this.player = new Player(this, 100, 650, 'player', true);
        this.terrain = new Terrain(this.physics.world, this);

        this.cameras.main.startFollow(this.player, false, 1, 1, -350, 200);
        this.add.existing(this.background);

        this.physics.add.collider(this.terrain, this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        //this.inputKeys = [
        //	this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        //	this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
        //];

        // Wait with this until the end so we have everything else ready before we receive messages here
        this.websocket = new Websocket(this.handleMessage.bind(this));
    }

    update() {
        this.handlePlayerMove();
        this.background.update();
    }

    handlePlayerMove() {
        var velocity = { dx: 0, dy : 0 };
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocity.dx = -300;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocity.dx = 300;
        } else {
            velocity.dx = 0;
        }

        if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W)) && this.player.body.velocity.y === 0) {
            velocity.dy = -400;
        }

        this.player.move(this.player.x, this.player.y, velocity.dx, velocity.dy);

        // Only send if we're actually moving or just stopped
        if (velocity.dx != 0 || velocity.dy != 0
            || Phaser.Input.Keyboard.JustUp(this.wasd.A) || Phaser.Input.Keyboard.JustUp(this.wasd.D)) {
            this.websocket.playerMoveSend(this.player.x, this.player.y,
                this.player.body.velocity.x, this.player.body.velocity.y);
        }
    }

    handleMessage(msg) {
        if (msg.hasJoin()) {
            const join = msg.getJoin();
            this.joinRecieve(msg.getPlayerId(), join.getNickname());
        } else if (msg.hasLeave()) {
            this.leaveReceive(msg.getPlayerId());
        } else if (msg.hasMove()) {
            const move = msg.getMove();
            this.playerMoveRecieve(msg.getPlayerId(), move.getX(), move.getY(), move.getDx(), move.getDy());
        } else if (msg.hasChangeName()) {
            const changeName = msg.getChangeName();
            this.changeNameReceive(msg.getPlayerId(), changeName.getNickname());
        }
    }

    playerMoveRecieve(playerId, x, y, dx, dy) {
        this.players[playerId].move(x, y, dx, dy);
    }

    joinRecieve(playerId, nickname) {
        const player = new Player(this, 100, 650, 'player');
        this.players[playerId] = player;
        this.physics.add.collider(this.terrain, player);

        // TODO: Set player nickname
        console.log('Nickname set', playerId, nickname);
    }

    leaveReceive(playerId) {
        this.players[playerId].destroy();
        delete this.players[playerId];
    }

    changeNameReceive(playerId, nickname) {
        // TODO: Change player nickname
        console.log('Nickname change', playerId, nickname);
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
            gravity: { y: 420 },
            debug: true
        }
    },
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));
