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
        this.load.image('stand', standImg);

        this.load.atlas('player', animationPng, animationJson);
    }

    create() {
        this.background = new Background(this, 0, 0, 0, 0, 'background').setDepth(-100);
        this.player = new Player(this, 100, 650, 'player');
        this.terrain = new Terrain(this.physics.world, this);

        this.cameras.main.startFollow(this.player, false, 1, 1, -350, 200);
        this.add.existing(this.background);

        this.physics.add.collider(this.terrain, this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.won = false;

        this.leaderboard = this.add.text(0, 0, 'Leaderboard: \nLoading... Please wait!',);
        this.handleLeaderboard();

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

        if ((Phaser.Input.Keyboard.JustDown(this.wasd.W) || this.cursors.up.isDown || this.cursors.space.isDown) && this.player.body.velocity.y == 0) {
            velocity.dy = -400;
        } //else if ((Phaser.Input.Keyboard.JustDown(this.wasd.S) || this.cursors.down.isDown) && this.player.body.velocity.y == 0) {
        //    velocity.dy = 400;
        //}

        this.player.move(this.player.x, this.player.y, velocity.dx, velocity.dy);

        // Only send if we're actually moving or just stopped
        if (velocity.dx != 0 || velocity.dy != 0
            || Phaser.Input.Keyboard.JustUp(this.wasd.A) || Phaser.Input.Keyboard.JustUp(this.wasd.D)) {
            this.websocket.playerMoveSend(this.player.x, this.player.y,
                this.player.body.velocity.x, this.player.body.velocity.y);
        }
        this.handleLeaderboard();
    }

    handleLeaderboard() {
        if (this.won == false) {
            this.leaderboard.setFontSize(16);
            let keys = Object.keys(this.players);
            let topclient = this.player;
            let ppl = 'You: ';
            keys.forEach(key => {
                let client = this.players[key];
                if (topclient.x < client.x) {
                    topclient = client;
                    if (topclient == this.player) {
                        ppl = 'You: ';
                    } else {
                        ppl = 'Not you: ';
                    }
                }
            });
            this.leaderboard.x = this.player.x - 400;
            this.leaderboard.y = this.player.y - 500;
            this.leaderboard.text = 'Leaderboard: \n' + ppl + topclient.x.toString();
            this.leaderboard.setColor("#000000");
            if (topclient.x > 4000) {
                this.leaderboard.text = 'Victory! Congratulations to ' + ppl;
                this.leaderboard.setFontSize(50);
                this.won = true;
            }
        }
    }

    handleMessage(msg) {
        if (msg.hasJoin()) {
            this.joinRecieve(msg.getPlayerId());
        } else if (msg.hasMove()) {
            const move = msg.getMove();
            this.playerMoveRecieve(msg.getPlayerId(), move.getX(), move.getY(), move.getDx(), move.getDy());
        } else if (msg.hasLeave()) {
            this.leaveReceive(msg.getPlayerId());
        }
        this.handleLeaderboard();
    }

    playerMoveRecieve(player_id, x, y, dx, dy) {
        this.players[player_id].move(x, y, dx, dy);
    }

    joinRecieve(player_id) {
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
    scene: Game,
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));
