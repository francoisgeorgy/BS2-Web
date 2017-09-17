
https://medium.com/@paooolino/a-modern-javascript-project-setup-b7842955d1d3

    npm install --save-dev webpack
    
    ./node_modules/.bin/webpack --config webpack.config.js
    
    npm run build
    
    npm i --save-dev uglifyjs-webpack-plugin
    
https://www.npmjs.com/package/uglifyjs-webpack-plugin
    
Important! The plugin has a peer dependency to uglify-js, so in order to use the plugin, also uglify-js has to be 
installed. The currently (2017/1/25) available uglify-js npm packages; however, __do not support minification of ES6 code__. 
In order to support ES6, an ES6-capable, a.k.a. harmony, version of UglifyJS has to be provided.

https://github.com/webpack-contrib/babel-minify-webpack-plugin

    ~~~npm install babili-webpack-plugin --save-dev~~~
    
https://webcache.googleusercontent.com/search?q=cache:nhDPJXUMekkJ:https://kevin-chappell.com/web-development/smaller-webpack-bundles-with-babili/+&cd=9&hl=en&ct=clnk&gl=ch

    yarn add --dev babel-minify-webpack-plugin

https://github.com/kevlened/copy-webpack-plugin

    npm install --save-dev copy-webpack-plugin
    
clean dist    
    
    npm install clean-webpack-plugin --save-dev    

TODO:

See 
- https://medium.com/@rajaraodv/webpack-the-confusing-parts-58712f8fcad9
- https://blog.madewithenvy.com/getting-started-with-webpack-2-ed2b86c68783
- https://www.toptal.com/javascript/a-guide-to-managing-webpack-dependencies
- https://medium.com/@svinkle/getting-started-with-webpack-and-es6-modules-c465d053d988


- entry:
    - index.js
    - vendor.js
    - midi.js
    - print.js
- output
    
    