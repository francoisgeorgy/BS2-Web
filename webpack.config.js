const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        bundle: "./src/main.js",
        print_bundle: "./src/print.js"
    },
    module: {
        rules: [{
                 test: /\.css$/,
                 use: ["style-loader", "css-loader"]
        }]
    },
    plugins: [
        // new CleanWebpackPlugin(["dist"]),
        // new MinifyPlugin(/*minifyOpts*/ {
        //     removeConsole: true,
        //     removeDebugger: true
        // }, /*pluginOpts*/ {}),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery"
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
        ])
    ],
    performance: {
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    }
};
