import Phaser from 'phaser';

import { Websocket } from './network/websocket';

import { Terrain } from './objects/terrain';
import { Background } from './objects/background';
import { Player } from './objects/player';

import grassTileImg from './assets/grassTile.jpg';
import dirtTileImg from './assets/dirtTile.jpg';
import backgroundImg from './assets/oblakiBG.jpg';

import animationPng from './assets/player/animation_white.png';
import animationJson from './assets/player/animation.json';
import standImg from './assets/player/stand.png';

class Game extends Phaser.Scene {
    constructor(config) {
        super(config);

        this.cursors = {};
        this.player = null;
        this.wasd = {};
        this.players = {};
        this.hacks = false;
    }

    preload() {
        this.load.image('dirtTile', dirtTileImg);
        this.load.image('grassTile', grassTileImg);
        this.load.image('background', backgroundImg);
        this.load.image('stand', standImg);

        this.load.atlas('player', animationPng, animationJson);
    }

    create() {
        this.background = new Background(this, 0, 0, 0, 0, 'background').setDepth(-100);
        this.player = new Player(this, 100, 600, 'player');
        this.terrain = new Terrain(this.physics.world, this);

        this.hacks_text = this.add.text(0, 0, 'Hacks: OFF', { fontSize: 32 });
        this.hacks_text.setScrollFactor(0);

        this.cameras.main.startFollow(this.player, false, 1, 1, 0, 0);
        this.add.existing(this.background);

        this.collider = this.physics.add.collider(this.terrain, this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.h_key = this.input.keyboard.addKeys('H');

        // Wait with this until the end so we have everything else ready before we receive messages here
        this.websocket = new Websocket(this.handleMessage.bind(this));
    }

    update(time, delta) {
        this.handlePlayerMove();
        this.background.update();
    }

    handlePlayerMove() {
        const velocity = { dx: 0, dy: 0 };
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocity.dx = this.hacks ? -900 : -300;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocity.dx = this.hacks ? 900 : 300;
        } else {
            velocity.dx = 0;
        }

        if (this.hacks) {
            if (this.cursors.up.isDown || this.wasd.W.isDown) {
                velocity.dy = -600;
            } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
                velocity.dy = 600;
            } else {
                velocity.dy = 0;
            }
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.wasd.W) && this.player.body.velocity.y === 0) {
                velocity.dy = -400;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.h_key.H)) {
            this.hacks = !this.hacks;
            this.player.hacks = this.hacks;
            this.physics.world.gravity.y = this.hacks ? 0 : 420;
            this.hacks_text.setText(this.hacks ? 'Hacks: ON' : 'Hacks: OFF');
            this.collider.active = !this.hacks;
        }

        this.player.move(this.player.x, this.player.y, velocity.dx, velocity.dy);

        // Only send if we're actually moving or just stopped
        if (velocity.dx !== 0 || velocity.dy !== 0
            || Phaser.Input.Keyboard.JustUp(this.wasd.A) || Phaser.Input.Keyboard.JustUp(this.wasd.D)
        || (this.hacks && (Phaser.Input.Keyboard.JustUp(this.wasd.W) || Phaser.Input.Keyboard.JustUp(this.wasd.S)))) {
            this.websocket.playerMoveSend(this.player.x, this.player.y,
                this.player.body.velocity.x, this.player.body.velocity.y);
        }
    }

    handleMessage(msg) {
        if (msg.hasJoin()) {
            this.joinReceive(msg.getPlayerId());
        } else if (msg.hasMove()) {
            const move = msg.getMove();
            this.playerMoveReceive(msg.getPlayerId(), move.getX(), move.getY(), move.getDx(), move.getDy());
        } else if (msg.hasLeave()) {
            this.leaveReceive(msg.getPlayerId());
        }
    }

    playerMoveReceive(player_id, x, y, dx, dy) {
        this.players[player_id].move(x, y, dx, dy);
    }

    joinReceive(player_id) {
        const player = new Player(this, 100, 650, 'player');
        this.players[player_id] = player;
        this.physics.add.collider(this.terrain, player);
    }

    leaveReceive(player_id) {
        this.players[player_id].destroy();
        delete this.players[player_id];
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
            debug: false
        }
    },
    antialias: false,
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));
