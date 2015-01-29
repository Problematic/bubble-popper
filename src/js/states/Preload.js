function PreloadState () {}

PreloadState.prototype = {
    preload: function onPreload (game) {
        game.load.image('bubble', require('../../assets/bubble.png'));
        game.load.image('background', require('../../assets/background.jpg'));
        game.load.audiosprite('bubble-pop', [
            require('../../assets/bubble-pop.ogg'),
            require('../../assets/bubble-pop.mp3')
        ], require('file!../../assets/bubble-pop.json'));
    },
    create: function onCreate () {
        this.state.start('Game');
    }
};

module.exports = PreloadState;
