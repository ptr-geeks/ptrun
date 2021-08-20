import Phaser from 'phaser';

export class Cirkularka extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);
        this.setDisplaySize(70, 70);
        this.setDepth(70);
        this.setBounce(0.2);
        // this.setCircle(35);
        
        setTimeout(() => {
            this.destroy();
        }, 3000);
    }
}
