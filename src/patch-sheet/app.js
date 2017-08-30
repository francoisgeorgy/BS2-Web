(function(){

    const VERSION = '1.0.0';

    console.log(`Bass Station II Patch Sheet ${VERSION}`);

    const DEVICE = BS2;

    function _p(controls, list, id_prefix) {
        // $('#sheet').append(`<!--<table class="values">-->`);
        // var o = `<table class="values">`;
        let o = '';
        for (let i=0; i < list.length; i++) {

            let c = controls[list[i]];
            if (typeof c === 'undefined') continue;

            console.log(i, list[i], c.name, c.init_value, c.raw_value, c.value);

            let v = c.value;
            if (c.on_off) {
                v = c.value == 0 ? 'off' : 'on';
            }

            let bold = c.changed() ? 'style="font-weight:bold"' : '';

            o += `<tr id="${id_prefix}-${list[i]}" title="${c.name}"><td ${bold}>${c.name}</td><td ${bold}>${v}</td></tr>`;

        }
        // $('#sheet').append(`</table>`);
        // o += `</table>`;
        // $('#sheet').append(o);
        return o;
    }
    /**
     *
     */
/*
    function printall() {


        for (let group in DEVICE.control_groups) {
            if (DEVICE.control_groups.hasOwnProperty(group)) {
                // console.log('group', group, DEVICE.control_groups[group]);

                $('#sheet').append(`<h2>${DEVICE.control_groups[group].name}</h2>`);

                let t = `<table id="${group}" class="values">`;

                t += _p(DEVICE.control, DEVICE.control_groups[group].controls, 'control');
                t += _p(DEVICE.nrpn, DEVICE.control_groups[group].nrpns, 'nrpn');

                t += `</table>`;
                $('#sheet').append(t);

                // for (let i=0; i < DEVICE.control_groups[group].controls.length; i++) {
                //     let c = DEVICE.control[DEVICE.control_groups[group].controls[i]];
                //     if (typeof c === 'undefined') continue;
                //     console.log(c.name, c.init_value, c.raw_value, c.value);
                // }
                // for (let i=0; i < DEVICE.control_groups[group].nrpns.length; i++) {
                //     let c = DEVICE.nrpn[DEVICE.control_groups[group].nrpns[i]];
                //     if (typeof c === 'undefined') continue;
                //     console.log(c.name, c.init_value, c.raw_value, c.value);
                // }
            }
        }
    }
*/

    function renderGroup(group) {
        var o = '';
        if (DEVICE.control_groups.hasOwnProperty(group)) {

            console.groupCollapsed('group', group, DEVICE.control_groups[group]);

            o = `<table id="${group}" class="values">`;

            //o += `<h2>${DEVICE.control_groups[group].name}</h2>`;

            o += _p(DEVICE.control, DEVICE.control_groups[group].controls, 'control');
            o += _p(DEVICE.nrpn, DEVICE.control_groups[group].nrpns, 'nrpn');

            o += `</table>`;

            console.groupEnd();

        }
        return o;
    }

    function renderPatch(template) {
        console.log('renderPatch');
        // let pi = DEVICE.meta.patch_id.value;
        // let pv = DEVICE.meta.patch_name.value;
        // if (pi && pv) {
        let s = `<h1>Bass Station II Patch <span id="patch-number">${DEVICE.meta.patch_id.value}</span> <span id="patch-name">${DEVICE.meta.patch_name.value}</span></h1>`;
        $('body').append(s);
        var t = $(template).filter('#template-main').html();
        var p = {
            "name": "Tater",
            "v": function () {
                return function (text, render) {
                    return renderGroup(text.trim().toLowerCase());
                }
            }
        };
        var o = Mustache.render(t, p);
        $('body').append(o);
    }

    function loadTemplate(data) {

        console.log('loadTemplate', data);

        $.get('templates/patch-sheet-template.html', function(template) {
            console.log('patch-sheet-template.html loaded');
            let d = null;
            if (data) {

                console.log('loadTemplate: read sysex data');

                for (let i=0; i<data.length; i++) {
                    if (data[i] === 240) {
                        console.log('start sysex');
                        if (d) {
                            if (DEVICE.setValuesFromSysex(d)) {
                                console.log('device updated from sysex');
                                renderPatch(template);
                            } else {
                                console.log('unable to update device from sysex');
                            }
                        }
                        console.log('clear d', data[i]);
                        d = [];
                    }
                    // console.log('push ', data[i]);
                    d.push(data[i]);
                }
            }
            if (d) {

                console.log('loadTemplate: set values from sysex data');

                if (DEVICE.setValuesFromSysex(d)) {
                    console.log('device updated from sysex');
                    renderPatch(template);
                } else {
                    console.log('unable to update device from sysex');
                }
            }
            renderPatch(template);
        });
    }

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    function hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    }

    $(function () {

        DEVICE.init();

        let data = null;

        let s = getParameterByName('sysex');
        if (s) {
            data = hexToBytes(s);
        } else {
            s = getParameterByName('pack');
            if (s) {
                // let decoded = msgpack.decode(base64js.toByteArray(b64));
                data = msgpack.decode(base64js.toByteArray(s));
            }
        }

        console.log(data);

        if (data) {
            DEVICE.setAllValues(data);
        }

        // if (data) {
        //
        //     let d = null;
        //     for (let i=0; i<data.length; i++) {
        //         if (data[i] == 240) {
        //             if (d) {
        //                 console.log(d);
        //
        //                 if (DEVICE.setValuesFromSysex(d)) {
        //                     console.log('device updated from sysex');
        //                     loadTemplate(d);
        //                 } else {
        //                     console.log('unable to update device from sysex');
        //                 }
        //
        //             }
        //             d = [];
        //         }
        //         d.push(data[i]);
        //     }
        //     console.log('data', d);
        //
        // } else {
        //     loadTemplate(null);
        // }
        loadTemplate(null);

        // printall();
        // loadTemplate();
    });

})(); // Call the anonymous function once, then throw it away!
