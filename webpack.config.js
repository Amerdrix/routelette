var path = require('path')

module.exports = {
    entry: {
        routelet: 'routelet',
            },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        library: ['[name]'],
        libraryTarget: 'umd'
    },
    resolve: {
         root: [path.resolve('./src'), path.resolve('.'),],
        extensions: ['', '.web.js', '.js', '.ts', '.tsx']
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, exclude: /node_modules/, loaders: ['ts'] },
        ]
    },

}