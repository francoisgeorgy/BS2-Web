const webpack = require("webpack");
const path = require('path')
// const glob = require('glob');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
    entry: {
        bundle: './src/main.js',
        print_bundle: './src/print.js'
    },
    output: {
        filename: './[name].js',
        path: path.resolve(__dirname, 'dist') //,
    },
    module: {
        rules: [{
                 test: /\.css$/,
                 use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        // new CleanWebpackPlugin(['dist']),
        new MinifyPlugin(/*minifyOpts*/ {}, /*pluginOpts*/ {}),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery'",
            "window.$": "jquery"
        }),
        new CopyWebpackPlugin([
            { from: './src/index.html' },
            { from: './src/midi.html' },
            { from: './src/print.html' },
            { from: './src/templates/patch-sheet-template.html', to: 'templates'},
            { from: './src/css/midi.css', to: 'css' },
            // { from: './src/css/patch.css', to: 'css' },
            // { from: './src/css/print.css', to: 'css' },
        ])
    ]
};
