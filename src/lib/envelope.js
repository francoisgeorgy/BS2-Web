
"use strict";

var envelope = (function(elem, conf) {

    // It faster to access a property than to access a variable...
    // See https://jsperf.com/vars-vs-props-speed-comparison/1

    const NS = "http://www.w3.org/2000/svg";

    var element = elem;    // DOM element

    // For the user convenience, the label can be set with the "data-label" attribute.
    // If another label is set in data-config then this later definition will override data-label.
    let default_label = element.dataset.label !== undefined ? element.dataset.label : '';

    let defaults = {
        // user configurable
        // no camelCase because we want to be able to have the same name in data- attributes.
        label: default_label,
        env_color: 'blue',
        env_width: 4,
        with_label: true,
        width_A: 0.25,
        width_D: 0.25,
        width_R: 0.25,
        env: {          // default envelope
            attack: 1,
            decay: 1,
            sustain: 0.5,
            release: 1
        }
    };

    let data_config = JSON.parse(element.dataset.config || '{}');
    let config = Object.assign({}, defaults, conf, data_config);

    var env = config.env;

    // init();
    draw();

    // function init() {
    //     console.log('INIT');
    //     setEnvelope(config.env);
    // }

    function setEnvelope(e) {
        env = e;
    }

    /**
     * viewBox is (0 0 100 100)
     *
     * env is {attack:0..1, decay:0..1, sustain:0..1, release: 0..1}
     */
    function getPath(e) {

        let p = '';

        // start position
        let x = 0.0;
        let y = 0.0;
        p += `M${x * 100.0},${100.0 - y}`; // start at lower left corner

        // Attack
        x += e.attack * config.width_A;
        y = 100.0 - (config.env_width / 2);
        p += `L${x * 100.0},${100.0 - y}`;

        // Decay
        x += e.decay * config.width_D;
        y = e.sustain * 100.0 - (config.env_width / 2);
        p += `L${x * 100.0},${100.0 - y + 2}`;

        // Sustain
        x = 1.0 - (e.release * config.width_R);
        y = e.sustain * 100.0 - (config.env_width / 2);
        p += `L${x * 100.0},${100.0 - y + 2}`;

        // Release
        x = 1.0;
        y = 0.0 + (config.env_width / 2);
        p += `L${x * 100.0},${100.0 - y + 2}`;

        console.log(p);

        return p;
    }

    function draw() {

        console.log('draw', element);

        // https://www.w3.org/TR/SVG/render.html#RenderingOrder:
        // Elements in an SVG document fragment have an implicit drawing order, with the first elements in the SVG document
        // fragment getting "painted" first. Subsequent elements are painted on top of previously painted elements.
        // ==> first element -> "painted" first

        element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        element.setAttributeNS(null, "viewBox", "0 0 100 100");
        element.setAttributeNS(null, "preserveAspectRatio", "none");
        element.setAttribute("class", "envelope");

        let path = document.createElementNS(NS, "path");
        path.setAttributeNS(null, "d", getPath(env));
        path.setAttribute("vector-effect", "non-scaling-stroke");
        path.setAttribute("stroke", config.env_color);
        path.setAttribute("stroke-width", "" + config.env_width);
        path.setAttribute("fill", "transparent");
        path.setAttribute("class", "envelope-path");
        element.appendChild(path);

    }  // draw()

    function redraw() {
        element.childNodes[0].setAttributeNS(null, "d", getPath(getPolarAngle()));
    }

    /**
     *
     */
    return {
        set envelope(e) {
            setEnvelope(e);
            redraw();
        }
    };

});
