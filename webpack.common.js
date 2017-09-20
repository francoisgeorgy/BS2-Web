const webpack = require("webpack");
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        bundle: './src/main.js',
        print_bundle: './src/print.js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        // new CleanWebpackPlugin(['dist']),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery'",
            "window.$": "jquery"
        }),
        // new HtmlWebpackPlugin({
        //     title: 'Production'
        // }),
        new CopyWebpackPlugin([
            { from: './src/index.html' },
            { from: './src/midi.html' },
            { from: './src/print.html' },
            { from: './src/templates/patch-sheet-template.html', to: 'templates'},
            { from: './src/css/midi.css', to: 'css' },
            { from: './src/favicon.png' }
            // { from: './src/css/patch.css', to: 'css' },
            // { from: './src/css/print.css', to: 'css' },
        ])
    ],
    output: {
        filename: './[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};
