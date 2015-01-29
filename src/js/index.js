window.addEventListener('load', function () {
    var Phaser = require('phaser');

    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

    game.state.add('Boot', require('./states/Boot'));
    game.state.add('Preload', require('./states/Preload'));
    game.state.add('Game', require('./states/Game'));

    game.state.start('Boot');
});
