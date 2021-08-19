import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, player);
        scene.physics.add.existing(this);
        this.setScale(2);
    }
}

