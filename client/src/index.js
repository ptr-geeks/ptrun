import Phaser from 'phaser';
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
        this.load.image('player', playerImg);
    }

    create() {

        this.player = new Player(this, 300, 300, 'player');
        this.add.existing(this.player);

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
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
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
