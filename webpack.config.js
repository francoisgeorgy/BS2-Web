const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
var WebpackAutoInject = require('webpack-auto-inject-version');

module.exports = {
    entry: {
        bundle: "./src/main.js",
        print_bundle: "./src/print.js"
    },
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
            { from: "./src/favicon.png" }
            // { from: "./src/css/patch.css", to: "css" },
            // { from: "./src/css/print.css", to: "css" },
        ])  //,
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
