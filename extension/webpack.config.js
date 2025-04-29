const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    entry: {
        background: './background.js',
        popup: './popup.js',
        safe: './js/safe.js',
        emailScanner: './emailScanner.js',
        socialMediaScanner: './socialMediaScanner.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'manifest.json' },
                { from: 'popup.html' },
                { from: 'safe.html' },
                { from: 'warning.html' },
                { from: 'popup.css' },
                { from: 'styles', to: 'styles' },
                { from: 'icons', to: 'icons' },
                { from: 'config.js' }
            ]
        })
    ],
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    }
}; 