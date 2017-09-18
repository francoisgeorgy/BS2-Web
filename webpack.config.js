var webpack = require("webpack");
const path = require('path'), glob = require('glob');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
    entry: {
        bundle: './src/main.js',
        // bs2: './src/bass-station-2/bass-station-2.js',
        // envelope: './src/lib/envelope.js',
        // knob: './src/lib/knob.js',
        // print: './src/lib/print.js',
        // utils: './src/lib/utils.js'
        // main: glob.sync('./src/**/*.js'),
        // main: [
        //     './src/app.js',
        //     './src/lib/bs2.js'
        // ]
    },
    output: {
        filename: './[name].js',
        path: path.resolve(__dirname, 'dist') //,
        // library: '[name]'
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        // new UglifyJSPlugin()
        // new BabiliPlugin({
        //     removeDebugger: true,
        //     removeConsole: false,
        //     mangle: false,
        //     simplify: false,
        //     deadcode: false
        // }, {
        //     comments: false
        // }),
        new MinifyPlugin(/*minifyOpts*/ {}, /*pluginOpts*/ {}),
        // new webpack.ProvidePlugin({
        //     $: "jquery",
        //     jQuery: "jquery"
        // }),
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
            { from: './src/templates/patch-sheet-template.html' },
            { from: './src/css/main.css', to: 'css'},
            { from: './src/css/midi.css', to: 'css' },
            { from: './src/css/patch.css', to: 'css' },
            { from: './src/css/print.css', to: 'css' },
            // { from: './src/lib/js.cookie.js'/*, to: 'lib'*/  },
            // { from: './src/lib/webmidi.min.js'/*, to: 'lib'*/  },
            // { from: './src/lib/moment.min.js'/*, to: 'lib'*/  },
            // { from: './src/lib/tonal.min.js'/*, to: 'lib'*/  },
            { from: './src/lib/lity.min.js'/*, to: 'lib'*/  },
            { from: './src/lib/lity.min.css'/*, to: 'lib'*/  }
        ])
    ]
};
