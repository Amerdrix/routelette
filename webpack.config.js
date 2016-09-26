var path = require('path')

module.exports = {
    entry: {
        navlette: './src/navlette',
        routelette: './src/routelette',
        demo: './src/demo'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        library: ['[name]'],
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.web.js', '.js', '.ts', '.tsx']
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, exclude: /node_modules/, loaders: ['ts'] },
        ]
    },
    devServer: {
        hot: true,
        historyApiFallback: true
    }
}