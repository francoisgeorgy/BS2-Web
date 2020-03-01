const webpack = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const WebpackAutoInject = require('webpack-auto-inject-version');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        bundle: "./src/main.js",
        print_bundle: "./src/print.js"
    },
    // output: {
    //     filename: '[name].[contenthash].js'
    // },
    module: {
        rules: [{
            test: /\.woff$/,
            use: {
                loader: "url-loader",
                options: {
                    limit: 50000,
                },
            },
        },{
             test: /\.css$/,
             use: ["style-loader", "css-loader"]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery"
        }),
        new WebpackAutoInject({
            components: {
                AutoIncreaseVersion: false
            }
        }),
        new CopyWebpackPlugin([
            { from: "./src/index.html" },
            { from: "./src/midi.html" },
            { from: "./src/print.html" },
            { from: "./src/templates/patch-sheet-template.html", to: "templates"},
            { from: "./src/css/midi.css", to: "css" },
            { from: "./src/favicon.png" },
            { from: "./src/img/BS2-Web_v2.6.0.png", to: "img"}
            // { from: "./src/css/patch.css", to: "css" },
            // { from: "./src/css/print.css", to: "css" },
        ]),
        new HtmlWebpackPlugin({
            chunks: ["bundle"],
            hash: true,
            inject: "head",
            template: "./src/index.html",
            filename: "./index.html" //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            chunks: ["print_bundle"],
            hash: true,
            inject: "head",
            template: "./src/print.html",
            filename: "./print.html" //relative to root of the application
        })
        // new UglifyJSPlugin({
        //     uglifyOptions: {
        //         compress: {
        //             drop_console: true,
        //         }
        //     }
        // })
    ],
    performance: {
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    }
};
