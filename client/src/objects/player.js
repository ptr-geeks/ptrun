import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        // Random color
        var color = new Phaser.Display.Color();
        color.random(50, 200);
        this.setTint(color.color);

        //this.setScale(0.03);
        this.setDepth(50);
        this.setScale(0.15);
        this.body
            .setSize(630, 500, true)
            .setOffset(500, 260);

        this.runAnimationFrames = this.anims.generateFrameNames('player', { prefix: 'frame', start: 1, end: 6 });
        this.anims.create({
            key: 'run',
            paused: true,
            frames: this.runAnimationFrames,
            frameRate: 15,
            repeat: -1,
        });
    }

    move(x, y, dx, dy) {
        this.setPosition(x, y);
        this.setVelocityX(dx);

        if (this.scene.hacks || dy !== 0) {
            this.setVelocityY(dy);
        }

        if (dx < 0) {
            this.flipX = true;
            this.body.setOffset(790, 260);
        } else if (dx > 0) {
            this.flipX = false;
            this.body.setOffset(500, 260);
        }

        if (!this.anims?.isPlaying && dx != 0) {
            this.play({ key: 'run' });
        }

        if (dx == 0 || !this.body.touching.down) {
            this.anims.stop();
        }

        if (dx == 0 && dy == 0) {
            this.setTexture('stand');
        }
    }
}

