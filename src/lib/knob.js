
    "use strict";

    var knob = (function(elem, conf) {

        const TRACE = true;    // when true, will log more details in the console

        // It faster to access a property than to access a variable...
        // See https://jsperf.com/vars-vs-props-speed-comparison/1

        const NS = "http://www.w3.org/2000/svg";
        const CW = true;    // clock-wise
        const CCW = !CW;    // counter clock-wise

        var element = elem;    // DOM element

        // For the user convenience, the label can be set with the "data-label" attribute.
        // If another label is set in data-config then this later definition will override data-label.
        let default_label = element.dataset.label !== undefined ? element.dataset.label : '';

        let defaults = {
            // user configurable
            // no camelCase because we want to be able to have the same name in data- attributes.
            label: default_label,
            with_label: false,
            zero_at: 270.0,      // the 0 degree will be at 270 polar degrees (6 o'clock).
            arc_min: 30.0,          // Angle in knob coordinates (0 at 6 0'clock)
            arc_max: 330.0,         // Angle in knob coordinates (0 at 6 0'clock)

            cursor_radius: 32,            // same unit as radius
            cursor_length: 10,
            cursor_width: 4,    // only when cursor_only is true
            cursor_color: '#bbb',    // only when cursor_only is true

            // cursor_start: 0,            // 20% of radius
            // cursor_end: 0,            // 20% of radius

            dot_cursor: false,
            cursor_dot_position: 75,         // % of radius (try 80), ignored when cursor_dot_size <= 0
            cursor_dot_size: 0,         // % of radius (try 10)
            cursor_only: false,  //TODO

            // back disk:
            back_radius: 32,
            back_border_width: 1,
            back_border_color: '#888',
            back_color: '#333',

            // back track:
            back_track_radius: 40,
            back_track_width: 8,
            back_track_color: '#555',

            // value track:
            track_radius: 40,
            track_width: 8,
            track_color_init: '#999',
            track_color: '#bbb',

            // arc_width: 20,   // 10% of radius
            // arc_color: '#666',
            radius: 40,
            rotation: CW,
            default_value: 0,

            center_zero: false,

            value_min: 0.0,         // TODO: rename to min
            value_max: 100.0,       // TODO: rename to max
            value_resolution: 1,      // null means ignore  // TODO: rename to step
            snap_to_steps: false,        // TODO
            value_formatting: null,      // TODO; callback function
            format: function(v) {
                return v;
            }
        };

        let data_config = JSON.parse(element.dataset.config || '{}');
        let config = Object.assign({}, defaults, conf, data_config);

        // NOTE: viewBox must be 100x120: 100x100 for the arc and 100x20 below for the label.

        const HALF_WIDTH = 50;      // viewBox/2
        const HALF_HEIGHT = 50;     // viewBox/2
        // const RADIUS = 40;          // a bit less than viewBox/2 to have a margin outside the arc. Must also takes into account the width of the arc stroke.

        // mouse drag support
        // var currentTarget;  //TODO: could be replaced by element ?
        var targetRect;

        // Center of arc in knob coordinates and in ViewPort's pixels relative to the <svg> ClientBoundingRect.
        var arcCenterXPixels = 0;
        var arcCenterYPixels = 0; // equal to arcCenterXPixels because the knob is a circle

        // start of arc, in ViewBox coordinates, computed once during the init
        var arcStartX;     // knob coordinates
        var arcStartY;     // knob coordinates

        // internals
        var minAngle = 0.0;      // initialized in init()
        var maxAngle = 0.0;      // initialized in init()
        var polarAngle = 0.0;       // Angle in polar coordinates (0 at 3 o'clock)
        var distance = 0.0;         // distance, in polar coordinates, from center of arc to last mouse position
        var track_start = '';        // SVG path syntax
        var mouseWheelDirection = 1;
        var value = 0.0;        // current value [value_min..value_max]

        // svg elements
        let back_disk = null;
        let back_track_left = null;
        let back_track_right = null;
        let back_track = null;
        let track = null;
        let cursor = null;
        let valueText = null;

        let split_track_min_left = Math.acos(-(config.back_track_width*1.5)/100.0);
        let split_track_min_right = Math.acos((config.back_track_width*1.5)/100.0);
        let split_track_middle = Math.PI * 3.0 / 2.0; // middle at 6 0'clock
        // between this values the track will be hidden:
        let split_track_zero  = Math.PI * 0.5;
        let split_track_zero_value = Math.floor(((config.value_max - config.value_min) / 2.0) / config.value_resolution) * config.value_resolution;

        if (TRACE) console.log(`${element.id}: split_track_zero_value=${split_track_zero_value}`);

        // let split_track_zero_left  = Math.PI * 0.5 * 1.01; // 1%
        // let split_track_zero_right  = Math.PI * 0.5 * 0.99; // 1%

        let has_changed = false;    // to spare some getValue() calls when testing if value has changed from default_value

        init();
        draw();
        attachEventHandlers();

        function init() {

            // console.group('INIT');

            // compute min and max angles:
            minAngle = knobToPolarAngle(config.arc_min);
            maxAngle = knobToPolarAngle(config.arc_max);

            // compute initial viewBox coordinates (independent from browser resizing):

            let angle_rad = minAngle * Math.PI / 180.0;
            arcStartX = getViewboxX(Math.cos(angle_rad) * config.radius);
            arcStartY = getViewboxY(Math.sin(angle_rad) * config.radius);

            // set initial angle:
            setValue(config.default_value);

            if (config.cursor_only) {
                // TODO
            }

            // if (config.cursor_start > 0) {
            //     let cursorLength = config.radius * ((100.0 - config.cursor_start) / 100.0);  // cursor is in percents
            //     let cursor_endX = getViewboxX(Math.cos(angle_rad) * cursorLength);
            //     let cursor_endY = getViewboxY(Math.sin(angle_rad) * cursorLength);
            //     track_start = `M ${cursor_endX},${cursor_endY} L`;
            // } else {
                track_start = 'M';
//            }

            track_start += `${arcStartX},${arcStartY} A ${config.radius},${config.radius}`;

            if (TRACE) console.log(`track_start = ${track_start}`);

            mouseWheelDirection = _isMacOS() ? -1 : 1;

            // console.groupEnd();

        }

        function getDisplayValue(polar) {
            let v = getValue(polar);
            return config.format(v);
        }

        function getValue(polar) {
            let i = polarToKnobAngle(polar === undefined ? getPolarAngle() : polar);
            let v = ((i - config.arc_min) / (config.arc_max - config.arc_min)) * (config.value_max - config.value_min) + config.value_min;
            if (config.value_resolution === null) {
                return v;
            }
            return Math.round(v / config.value_resolution) * config.value_resolution;
        }

        function setValue(v) {
            value = v;
            let a = ((v - config.value_min) / (config.value_max - config.value_min)) * (config.arc_max - config.arc_min) + config.arc_min;
            setPolarAngle(knobToPolarAngle(a));
        }

        /**
         * Angle in degrees in polar coordinates (0 degrees at 3 o'clock)
         */
        function setPolarAngle(angle, fireEvent) {

            // let fire = firereEvent || false;

            let previous = polarAngle;

            let a = (angle + 360.0) % 360.0;    // we add 360 to handle negative values down to -360
            // apply boundaries
            let b = polarToKnobAngle(a);
            if (b < config.arc_min) {
                a = minAngle;
            } else if (b > config.arc_max) {
                a = maxAngle;
            }
            polarAngle = a;

            if (fireEvent && (polarAngle !== previous)) {
                // does the change of angle affect the value?
                if (getValue(previous) !== getValue()) {
                    notifyChange();
                }
            }

        }

        function incPolarAngle(increment) {
            setPolarAngle(polarAngle + increment, true);
        }

        /**
         * Angle in degrees in polar coordinates (0 degrees at 3 o'clock)
         */
        function getPolarAngle() {
            return polarAngle;
        }

        /**
         * Return polar coordinates angle from our "knob coordinates" angle
         */
        function knobToPolarAngle(angle) {
            let a = config.zero_at - angle;
            if (a < 0) a = a + 360.0;
            if (TRACE) console.log(`knobToPolarAngle ${angle} -> ${a}`);
            return a;
        }

        function polarToKnobAngle(angle) {
            //TODO: CCW or CW. "-" for changing CCW to CW
            return (config.zero_at - angle + 360.0) % 360.0;       // we add 360 to handle negative values down to -360
        }

        /**
         * Return viewBox X coordinates from cartesian -1..1 X
         */
        function getViewboxX(x) {

            // CW:  x = 20 --> 50 + 20 = 70
            // CCW: x = 20 --> 50 - 20 = 30

            return config.rotation === CW ? (HALF_WIDTH + x) : (HALF_WIDTH - x);
        }

        /**
         * Return viewBox Y coordinates from cartesian -1..1 Y
         */
        function getViewboxY(y) {
            return HALF_HEIGHT - y;  // HEIGHT - (HALF_HEIGHT + (RADIUS * y))
        }

        /**
         * angle is in degrees (polar, 0 at 3 o'clock)
         */
/*
        function getDotCursor(endAngle) {

            let a_rad = endAngle * Math.PI / 180.0;

            // if (config.cursor_dot > 0) {
                let dot_position = config.radius * config.cursor_dot_position / 100.0;  // cursor is in percents
                let x = getViewboxX(Math.cos(a_rad) * dot_position);
                let y = getViewboxY(Math.sin(a_rad) * dot_position);
                let r = config.radius * config.cursor_dot_size / 2 / 100.0;
            // }

            return {
                cx: x,
                cy: y,
                r: r
            };
        }
*/

        /**
         * angle is in degrees (polar, 0 at 3 o'clock)
         */
        function getPath(endAngle, withEndCursor) {

            // SVG d: "A rx,ry xAxisRotate LargeArcFlag,SweepFlag x,y".
            // SweepFlag is either 0 or 1, and determines if the arc should be swept in a clockwise (1), or anti-clockwise (0) direction

            if (TRACE) console.log(`getPath from ${minAngle} to ${endAngle}`);     // 240 330; 240-330=-90 + 360=270

            let a_rad = endAngle * Math.PI / 180.0;
            let endX = getViewboxX(Math.cos(a_rad) * config.radius);
            let endY = getViewboxY(Math.sin(a_rad) * config.radius);

            let deltaAngle = (minAngle - endAngle + 360.0) % 360.0;
            let largeArc = deltaAngle < 180.0 ? 0 : 1;

            if (TRACE) console.log(`deltaAngle ${deltaAngle} largeArc ${largeArc}`);

            let arcDirection = config.rotation === CW ? 1 : 0;

            let p;
            if (config.cursor_only) {
                p = ` M${endX},${endY}`;
            } else {
                p = track_start + ` 0 ${largeArc},${arcDirection} ${endX},${endY}`;
            }

            // if (withEndCursor) {
            //     if (config.cursor_end > 0) {
            //         let cursorLength = config.radius * ((100.0 - config.cursor_end) / 100.0);  // cursor is in percents
            //         let cursor_endX = getViewboxX(Math.cos(a_rad) * cursorLength);
            //         let cursor_endY = getViewboxY(Math.sin(a_rad) * cursorLength);
            //         p += ` L ${cursor_endX},${cursor_endY}`;
            //     }
            // } else {
            //     if (config.cursor > 0) {
            //         let cursorLength = config.radius * ((100.0 - config.cursor) / 100.0);  // cursor is in percents
            //         let cursor_endX = getViewboxX(Math.cos(a_rad) * cursorLength);
            //         let cursor_endY = getViewboxY(Math.sin(a_rad) * cursorLength);
            //         p += ` L ${cursor_endX},${cursor_endY}`;
            //     }
            // }

            if (TRACE) console.log(p);

            return p;
        }

        /**
         *
         * @param fromAngle
         * @param toAngle in radian (polar, 0 at 3 o'clock)
         * @param radius in radian (polar, 0 at 3 o'clock)
         */
        function getArc(fromAngle, toAngle, radius) {

            if (TRACE) console.log(`getArc(${fromAngle}, ${toAngle}, ${radius})`);

            // SVG d: "A rx,ry xAxisRotate LargeArcFlag,SweepFlag x,y".
            // SweepFlag is either 0 or 1, and determines if the arc should be swept in a clockwise (1), or anti-clockwise (0) direction

            let x0 = getViewboxX(Math.cos(fromAngle) * radius);
            let y0 = getViewboxY(Math.sin(fromAngle) * radius);

            let x1 = getViewboxX(Math.cos(toAngle) * radius);
            let y1 = getViewboxY(Math.sin(toAngle) * radius);

            // let deltaAngle = (fromAngle - toAngle + 360.0) % 360.0;
            let deltaAngle = (fromAngle - toAngle + 2 * Math.PI) % (2 * Math.PI);

            if (TRACE) console.log("deltaAngle: " + deltaAngle);

            // let largeArc = deltaAngle < 180.0 ? 0 : 1;
            let largeArc = deltaAngle < Math.PI ? 0 : 1;
            let arcDirection = config.rotation === CW ? 1 : 0;

            let p = `M ${x0},${y0} A ${radius},${radius} 0 ${largeArc},${arcDirection} ${x1},${y1}`; //TODO: add terminator

            if (TRACE) console.log("arc: " + p);

            return p;
        }

        /**
         *
         * @returns {*}
         */
        function getTrackPath() {

            let p = null;

            let a = getPolarAngle();
            let rad = a * Math.PI / 180.0;

            // if (TRACE) console.log(`getTrackPath, value=${value}, a=${a}, rad=${rad}, ml=${split_track_min_left}, mr=${split_track_min_right}, mid=${split_track_middle}, zl=${split_track_zero_left}, zr=${split_track_zero_right}`);

            if (config.center_zero) {

                let v = getValue();

                if (TRACE) console.log(`getTrackPath: v=${v}`);

                if ((v < split_track_zero_value) && (rad > split_track_zero) && (rad < split_track_min_left)) {
                    rad = split_track_min_left;
                } else if ((v > split_track_zero_value) && (rad < split_track_zero) && (rad > split_track_min_right)) {
                    rad = split_track_min_right;
                }

                if ((rad >= split_track_min_left) && (rad < split_track_middle)) {
                    p = getArc(rad, split_track_min_left, config.track_radius);
                } else if ((rad <= split_track_min_right) || (rad > split_track_middle)) {
                    p = getArc(split_track_min_right, rad, config.track_radius);
                }

            } else {
                p = getArc(minAngle * Math.PI / 180.0, rad, config.track_radius);
            }

            if (TRACE) console.log('track path = ' + p);
            return p;

        }

        /**
         *
         */
        function draw_back() {

            element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
            element.setAttributeNS(null, "viewBox", config.with_label ? "0 0 100 120" : "0 0 100 100");

            back_disk = document.createElementNS(NS, "circle");
            back_disk.setAttributeNS(null, "cx", "50");
            back_disk.setAttributeNS(null, "cy", "50");
            back_disk.setAttributeNS(null, "r", `${config.back_radius}`);
            back_disk.setAttribute("fill", `${config.back_color}`);
            back_disk.setAttribute("stroke", `${config.back_border_color}`);
            back_disk.setAttribute("stroke-width", `${config.back_border_width}`);
            back_disk.setAttribute("stroke-linecap", "round");
            back_disk.setAttribute("class", "knob-back");
            element.appendChild(back_disk);

            if (config.center_zero) {

                back_track_left = document.createElementNS(NS, "path");
                back_track_left.setAttributeNS(null, "d", getArc(minAngle * Math.PI / 180.0, split_track_min_left, config.track_radius));
                back_track_left.setAttribute("stroke", `${config.back_track_color}`);
                back_track_left.setAttribute("stroke-width", `${config.back_track_width}`);
                back_track_left.setAttribute("stroke-linecap", "round");
                back_track_left.setAttribute("fill", "transparent");
                back_track_left.setAttribute("class", "knob-back-track");
                element.appendChild(back_track_left);

                back_track_right = document.createElementNS(NS, "path");
                back_track_right.setAttributeNS(null, "d", getArc(split_track_min_right, maxAngle * Math.PI / 180.0, config.track_radius));
                back_track_right.setAttribute("stroke", `${config.back_track_color}`);
                back_track_right.setAttribute("stroke-width", `${config.back_track_width}`);
                back_track_right.setAttribute("stroke-linecap", "round");
                back_track_right.setAttribute("fill", "transparent");
                back_track_right.setAttribute("class", "knob-back-track");
                element.appendChild(back_track_right);

            } else {

                back_track = document.createElementNS(NS, "path");
                back_track.setAttributeNS(null, "d", getPath(maxAngle, true));
                back_track.setAttribute("stroke", `${config.back_track_color}`);
                back_track.setAttribute("stroke-width", `${config.back_track_width}`);
                back_track.setAttribute("fill", "transparent");
                back_track.setAttribute("stroke-linecap", "round");
                back_track.setAttribute("class", "knob-back-track");
                element.appendChild(back_track);

            }
        }

        /**
         *
         */
        function draw_track() {
            let p = getTrackPath();
            if (p) {
                track = document.createElementNS(NS, "path");
                track.setAttributeNS(null, "d", p);
                track.setAttribute("stroke", `${config.track_color_init}`);
                track.setAttribute("stroke-width", `${config.track_width}`);
                track.setAttribute("fill", "transparent");
                track.setAttribute("stroke-linecap", "round");
                track.setAttribute("class", "knob-track");
                element.appendChild(track);
            }
        }

        /**
         *
         * @returns {string}
         */
        function getTrackCursor() {
            let a = getPolarAngle() * Math.PI / 180.0;
            let x0 = getViewboxX(Math.cos(a) * (HALF_HEIGHT - config.cursor_radius));
            let y0 = getViewboxY(Math.sin(a) * (HALF_HEIGHT - config.cursor_radius));
            let x1 = getViewboxX(Math.cos(a) * (HALF_HEIGHT - config.cursor_radius + config.cursor_length));
            let y1 = getViewboxY(Math.sin(a) * (HALF_HEIGHT - config.cursor_radius + config.cursor_length));
            return `M ${x0},${y0} L ${x1},${y1}`;   //TODO: add termintor
        }

        /**
         *
         */
        function draw_cursor() {

            // let p = '';

            // if (config.dot_cursor) {
                //TODO
/*
                let d = getDotCursor(getPolarAngle());
                let dot = document.createElementNS(NS, "circle");
                dot.setAttributeNS(null, "cx", d.cx);
                dot.setAttributeNS(null, "cy", d.cy);
                dot.setAttributeNS(null, "r", d.r);
                // dot.setAttribute("fill", config.arc_color);
                dot.setAttribute("class", "knob-arc");
                element.appendChild(dot);
*/
            // } else {

                // let a = getPolarAngle() * Math.PI / 180.0;
                // //
                // // let c2ax = 50 + Math.cos(a) * (50 - config.cursor_radius);
                // // let c2ay = 50 - Math.sin(a) * (50 - config.cursor_radius);
                // // let c2bx = 50 + Math.cos(a) * (50 - config.cursor_radius + config.cursor_length);
                // // let c2by = 50 - Math.sin(a) * (50 - config.cursor_radius + config.cursor_length);
                //
                //
                // // let cursor_length =
                // let x0 = getViewboxX(Math.cos(a) * (HALF_HEIGHT - config.cursor_radius));
                // let y0 = getViewboxY(Math.sin(a) * (HALF_HEIGHT - config.cursor_radius));
                // let x1 = getViewboxX(Math.cos(a) * (HALF_HEIGHT - config.cursor_radius + config.cursor_length));
                // let y1 = getViewboxY(Math.sin(a) * (HALF_HEIGHT - config.cursor_radius + config.cursor_length));
                // p = `M ${x0},${y0} L ${x1},${y1}`;
                // if (TRACE) console.log('cursor', a, p);
                let p = getTrackCursor();
                if (p) {
                    cursor = document.createElementNS(NS, "path");
                    cursor.setAttributeNS(null, "d", p);
                    cursor.setAttribute("stroke", `${config.cursor_color}`);
                    cursor.setAttribute("stroke-width", `${config.cursor_width}`);
                    cursor.setAttribute("fill", "transparent");
                    cursor.setAttribute("stroke-linecap", "round");
                    cursor.setAttribute("class", "knob-cursor");
                    element.appendChild(cursor);
                }
            // }
        }

        /**
         *
         */
        function draw_value() {
            valueText = document.createElementNS(NS, "text");
            valueText.setAttributeNS(null, "x", "50");
            valueText.setAttributeNS(null, "y", "55");
            valueText.setAttribute("text-anchor", "middle");
            valueText.setAttribute("cursor", "default");
            valueText.setAttribute("class", "knob-value");
            valueText.textContent = getDisplayValue();
            element.appendChild(valueText);
        }

        /**
         *
         */
        function draw() {
            draw_back();
            draw_track();
            draw_cursor();
            draw_value();
        }

        /**
         *
         */
        function redraw() {
            let p = getTrackPath();
            if (p) {
                if (track) {
                    track.setAttributeNS(null, "d", p);
                } else {
                    draw_track();
                }
            } else {
                if (track) {
                    track.setAttributeNS(null, "d", "");    // we hide the track
                }
            }

            if (!has_changed) {
                has_changed = getValue() !== config.default_value;
                if (has_changed) {
                    track.setAttribute("stroke", `${config.track_color}`);
                }
            }

            p = getTrackCursor();
            if (TRACE) console.log(p);
            if (p) {
                if (cursor) {
                    cursor.setAttributeNS(null, "d", p);
                }
            }

            if (valueText) {
                valueText.textContent = getDisplayValue();
            }
        }

        /**
         * startDrag() must have been called before to init the targetRect variable.
         */
        function mouseUpdate(e) {

            // MouseEvent.clientX (standard property: YES)
            // The clientX read-only property of the MouseEvent interface provides
            // the horizontal coordinate within the application's client area at which
            // the event occurred (as opposed to the coordinates within the page).
            // For example, clicking in the top-left corner of the client area will always
            // result in a mouse event with a clientX value of 0, regardless of whether
            // the page is scrolled horizontally. Originally, this property was defined
            // as a long integer. The CSSOM View Module redefined it as a double float.

            let dxPixels = e.clientX - targetRect.left;
            let dyPixels = e.clientY - targetRect.top;

            // mouse delta in cartesian coordinate with path center=0,0 and scaled (-1..0..1) relative to path:
            // <svg> center:       (dx, dy) == ( 0,  0)
            // <svg> top-left:     (dx, dy) == (-1,  1)
            // <svg> bottom-right: (dx, dy) == ( 1, -1) (bottom right of the 100x100 viewBox, ignoring the bottom 100x20 for the label)
            let dx = (dxPixels - arcCenterXPixels) / (targetRect.width / 2);
            let dy = - (dyPixels - arcCenterYPixels) / (targetRect.width / 2);  // targetRect.width car on a 20px de plus en hauteur pour le label

            if (config.rotation === CCW) dx = - dx;

            // convert to polar coordinates
            let angle_rad = Math.atan2(dy, dx);

            if (angle_rad < 0) angle_rad = 2.0*Math.PI + angle_rad;

            if (TRACE) console.log(`mouseUpdate: position in svg = ${dxPixels}, ${dyPixels} pixels; ${dx.toFixed(3)}, ${dy.toFixed(3)} rel.; angle ${angle_rad.toFixed(3)} rad`);

            setPolarAngle(angle_rad * 180.0 / Math.PI, true);     // rads to degs

            // distance from arc center to mouse position
            distance = Math.sqrt(dx*(HALF_WIDTH/config.radius)*dx*(HALF_WIDTH/config.radius) + dy*(HALF_HEIGHT/config.radius)*dy*(HALF_HEIGHT/config.radius));

        }

        /**
         *
         * @param e
         */
        function startDrag(e) {

            if (TRACE) console.log('startDrag');

            e.preventDefault();

            // API: Event.currentTarget
            //      Identifies the current target for the event, as the event traverses the DOM. It always REFERS TO THE ELEMENT
            //      TO WHICH THE EVENT HANDLER HAS BEEN ATTACHED, as opposed to event.target which identifies the element on
            //      which the event occurred.
            //      https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget

            // currentTarget = e.currentTarget;

            // API: Element.getBoundingClientRect() (standard: YES)
            //      The Element.getBoundingClientRect() method returns the size of an element
            //      and its POSITION RELATIVE TO THE VIEWPORT.
            //      The amount of scrolling that has been done of the viewport area (or any other
            //      scrollable element) is taken into account when computing the bounding rectangle.
            //      This means that the rectangle's boundary edges (top, left, bottom, and right)
            //      change their values every time the scrolling position changes (because their
            //      values are relative to the viewport and not absolute).
            //      https://developer.mozilla.org/en/docs/Web/API/Element/getBoundingClientRect

            // targetRect = currentTarget.getBoundingClientRect(); // currentTarget must be the <svg...> object
            targetRect = element.getBoundingClientRect();

            // Note: we must take the boundingClientRect of the <svg> and not the <path> because the <path> bounding rect
            //       is not constant because it encloses the current arc.

            // By design, the arc center is at equal distance from top and left.
            arcCenterXPixels = targetRect.width / 2;
            //noinspection JSSuspiciousNameCombination
            arcCenterYPixels = arcCenterXPixels;

            document.addEventListener('mousemove', handleDrag, false);
            document.addEventListener('mouseup', endDrag, false);

            mouseUpdate(e);
            redraw();
        }

        /**
         *
         * @param e
         */
        function handleDrag(e) {
            e.preventDefault();
            mouseUpdate(e);
            redraw();
        }

        /**
         *
         */
        function endDrag() {
            if (TRACE) console.log('endDrag');
            document.removeEventListener('mousemove', handleDrag, false);
            document.removeEventListener('mouseup', endDrag, false);
        }

        var minDeltaY;

        /**
         *
         * @param e
         * @returns {boolean}
         */
        function mouseWheelHandler(e) {

            // WheelEvent
            // This is the standard wheel event interface to use. Old versions of browsers implemented the two non-standard
            // and non-cross-browser-compatible MouseWheelEvent and MouseScrollEvent interfaces. Use this interface and avoid
            // the latter two.
            // The WheelEvent interface represents events that occur due to the user moving a mouse wheel or similar input device.

            // https://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
            // https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js

            e.preventDefault();

            let dy = e.deltaY;

            if (dy != 0) {
                // normalize Y delta
                if (minDeltaY > Math.abs(dy) || !minDeltaY) {
                    minDeltaY = Math.abs(dy);
                }
            }

            incPolarAngle(mouseWheelDirection * (dy / minDeltaY));     // TODO: make mousewheel direction configurable

            // TODO: timing --> speed
            // https://stackoverflow.com/questions/22593286/detect-measure-scroll-speed

            redraw();

            return false;
        }

        /**
         *
         */
        function attachEventHandlers() {
            element.addEventListener("mousedown", function(e) {
                startDrag(e);
            });
            element.addEventListener("wheel", function(e) {
                mouseWheelHandler(e);
            });
        }

        /**
         *
         */
        function notifyChange() {
            if (TRACE) console.log('knob value has changed');
            let value = getValue();     // TODO: cache the value
            let event = new CustomEvent('change', { 'detail': value });
            element.dispatchEvent(event);
        }

        /**
         * Utility function to configure the mousewheel direction.
         * @returns {*}
         * @private
         */
        function _isMacOS() {
            return ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].indexOf(window.navigator.platform) !== -1;
        }

        /**
         *
         */
        return {
            set value(v) {
                setValue(v);
                redraw();
            }
        };

    });
