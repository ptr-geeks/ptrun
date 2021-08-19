import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, playerImg) {
        super(scene, x, y, playerImg);
        scene.physics.add.existing(this);
         this.setScale(0.2);
//         this.body.setCollideWorldBounds(true);
         this.body.setSize(630, 500, true).setOffset(500, 280);
    }

    setVelocityX(x) {
        this.body.setVelocityX(x);

        if (x < 0) {
            this.flipX = true;
            this.body.setOffset(790, 280);
        } else if (x > 0) {
            this.flipX = false;
            this.body.setOffset(500, 280);
        }

        if (!this.anims?.isPlaying && x != 0) {
            this.play({ key: 'run' });
        }
        if (x == 0) {
            this.anims.stop();
        }
    }

    setVelocityY(y) {
        this.body.setVelocityY(y);
    }
}

