var Phaser = require('phaser');

function GameState () {}

GameState.prototype = {
    spawnBubble: function (game) {
        var bubble = this.bubblePool.getFirstDead();
        if (bubble === null) {
            console.log('bubble pool is empty');
            return;
        }

        bubble.bringToTop();
        bubble.alpha = game.rnd.realInRange(0.5, 0.9);

        bubble.scale.setTo(game.rnd.realInRange(this.settings.minBubbleScale, this.settings.maxBubbleScale));
        bubble.sizeScoreMod = 1 + (bubble.scale.x - this.settings.maxBubbleScale) / (this.settings.minBubbleScale - this.settings.maxBubbleScale);

        bubble.tint = game.rnd.pick(this.settings.colors);

        bubble.reset(game.rnd.realInRange(0 + bubble.width / 2, game.world.width - bubble.width / 2), game.world.height + bubble.height);

        bubble.speed = game.rnd.realInRange(this.settings.floatTime * this.settings.floatTimeMinMod, this.settings.floatTime * this.settings.floatTimeMaxMod);
        bubble.speedScoreMod = bubble.speed / this.settings.floatTime;

        bubble.riseTween = game.add.tween(bubble).to({ y: 0 - bubble.height }, bubble.speed, 'Linear');
        bubble.riseTween.onComplete.add(function (bubble, tween) {
            bubble.kill();
        }, this);
        bubble.riseTween.start();
    },
    popBubble: function (bubble, pointer) {
        this.bubblePop.play('pop' + this.game.rnd.integerInRange(0, this.settings.soundCount - 1));
        bubble.riseTween.stop();

        this.emitter.x = pointer.x;
        this.emitter.y = pointer.y;
        this.emitter.explode(this.settings.particleLifespan, 10);

        this.game.data.increment('score', Math.floor(this.settings.baseScore * bubble.speedScoreMod));

        bubble.kill();
        this.game.plugins.juicy.shake(16, 5);
        this.game.plugins.juicy.overScale(this.scoreText, 1.1);
    },
    levelEnd: function (game) {},

    create: function onCreate (game) {
        this.settings = {
            baseScore: 100,
            poolSize: 25,
            levelDuration: 1000 * 90,
            maxFloatTime: 5000,
            floatTime: 5000,
            minFloatTime: 2500,
            floatTimeMinMod: 0.75,
            floatTimeMaxMod: 1.25,
            maxSpawnDelay: 1000,
            minSpawnDelay: 250,
            minBubbleScale: 2.5,
            maxBubbleScale: 5,
            soundCount: 11,
            particleLifespan: 500,
            colors: [ 0x1f77b4, 0xaec7e8, 0xff7f0e, 0xffbb78, 0x2ca02c, 0x98df8a, 0xd62728, 0xff9896, 0x9467bd, 0xc5b0d5, 0x8c564b, 0xc49c94, 0xe377c2, 0xf7b6d2, 0x7f7f7f, 0xc7c7c7, 0xbcbd22, 0xdbdb8d, 0x17becf, 0x9edae5 ]
        };

        this.background = game.add.sprite(-32, -32, 'background');
        this.background.width = game.stage.width;
        this.background.height = game.stage.height;

        this.bubblePop = game.add.audioSprite('bubble-pop');

        this.emitter = game.add.emitter(0, 0, 30);
        this.emitter.makeParticles('bubble');
        this.emitter.gravity = 500;
        this.emitter.setAlpha(1, 0.1, this.settings.particleLifespan, Phaser.Easing.Quadratic.easeIn);
        this.emitter.setScale(0.01, 0.33, 0.01, 0.33, this.settings.particleLifespan);

        this.bubblePool = game.add.group(game.world, 'bubbles', false, true, Phaser.Physics.ARCADE);
        this.bubblePool.createMultiple(this.settings.poolSize, 'bubble');
        this.bubblePool.forEach(function (bubble) {
            bubble.anchor.setTo(0.5);
            bubble.inputEnabled = true;
            bubble.events.onInputDown.add(this.popBubble, this);
        }, this);

        this.spawnTimer = game.time.create(false);
        this.spawnEvent = this.spawnTimer.loop(this.settings.maxSpawnDelay, this.spawnBubble, this, game);
        this.spawnTimer.start();

        this.levelTimer = game.time.create(false);
        this.levelTimer.add(this.settings.levelDuration, this.levelEnd, this, game);
        this.levelTimer.start();

        game.add.tween(this.spawnEvent)
            .to({ delay: this.settings.minSpawnDelay }, this.settings.levelDuration, 'Linear', true);
        game.add.tween(this.settings)
            .to({ floatTime: this.settings.minFloatTime }, this.settings.levelDuration, 'Linear', true);

        var style = {};
        this.scoreText = game.add.text(25, game.world.height - 50, 'Score: ' + game.score, style);
        this.timeText = game.add.text(25, game.world.height - 80, 'Time: ' + (this.levelTimer.duration / 1000), style);
    },
    update: function (game) {
        this.scoreText.setText('Score: ' + Math.floor(game.data.get('score')));
        this.timeText.setText('Time: ' + Math.floor(this.levelTimer.duration / 1000));
    }
};

module.exports = GameState;
