var webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/js/index.js',
        vendor: ['phaser', 'phaser.map']
    },
    output: {
        path: './dist',
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            'phaser.map': __dirname + '/node_modules/phaser/build/phaser.map',
            phaser: __dirname + '/node_modules/phaser/build/phaser.min.js',
        }
    },
    module: {
        preLoaders: [
            { test: /\.min\.js$/, loader: 'source-map-loader' }
        ],
        loaders: [
            { test: /phaser(\.min)?\.js$/, loader: 'exports?Phaser!script' },
            { test: /phaser\.map$/, loader: 'file' },
            { test: /\.(png|jpg)$/, loader: 'url?limit=8192' },
            { test: /\.(ogg|mp3)$/, loader: 'file' },
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
    ]
};
