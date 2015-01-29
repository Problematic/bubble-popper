var Phaser = require('phaser');
var DataManager = require('../util/DataManager');

function BootState () {}

BootState.prototype = {
    create: function onCreate (game) {
        game.stage.backgroundColor = 0xFFFFFF;
        game.stage.disableVisibilityChange = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.plugins.juicy = game.plugins.add(require('../plugins/Juicy'));

        game.data = new DataManager();
        game.data.set('score', 0);

        game.state.start('Preload');
    }
};

module.exports = BootState;
