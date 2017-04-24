
    function setStatus(msg) {
        $('#status').removeClass("error").text(msg);
    }

    function setStatusError(msg) {
        $('#status').addClass("error").text(msg);

    }

    function setConnectionStatus(status) {
        $('#connection-status').text(status ? 'connected' : 'not connected');
    }

    function dispatch(type, control, value) {
        type = type.toLowerCase();
        console.log(type, control, value, '#' + type + '-' + control);
        if ((type != 'cc') && (type != 'nrpn')) return; //TODO: signal an error
        $('#' + type + '-' + control).val(value).trigger('change');
    }

    //TODO: put into BS2 object
    function doubleByteValue(msb, lsb) {
        let v = msb << 1;
        return lsb > 0 ? (v+1) : v;
    }

    var cc_expected = -1;
    var cc_msb = -1;
    var cc_lsb = -1;
    var value_msb = 0;    // msb to compute value
    var value_lsb = 0;    // lsb to compute value

    var nrpn = false;

    function handleCC(e) {

        var msg = e.data;   // Uint8Array
        let cc = msg[1];

        let value = -1;

        if (cc == WebMidi.MIDI_CONTROL_CHANGE_MESSAGES['nonregisteredparameterfine']) {   // 99
            cc_msb = msg[2];
            nrpn = true;
            return;
        } else if (cc == WebMidi.MIDI_CONTROL_CHANGE_MESSAGES['nonregisteredparametercoarse']) {  // 98
            cc_lsb = msg[2];
            return;
        } else {
            if (nrpn) {
                value = msg[2];
                let v = value;
                let r;
                if (BS2.nrpn[cc_lsb].hasOwnProperty('map')) {
                    r = BS2.nrpn[cc_lsb].map(v);
    //                        log_value(`${BS2.nrpn[cc_lsb].name} = ${r} (${v})`);
                } else {
                    r = v;
    //                        log_value(`${BS2.nrpn[cc_lsb].name} = ${v}`);
                }
                dispatch('NRPN', cc_lsb, r);
                nrpn = false;
                return;
            }
        }

        if (cc_expected >= 0) {
            if (cc == cc_expected) {
    //                    console.log(`got expected cc ${cc}, cc_msb=${cc_msb}`);

                value_lsb = msg[2];

                let v = doubleByteValue(value_msb, value_lsb);
                let r;
                if (BS2.control[cc_msb].hasOwnProperty('map')) {
                    r = BS2.control[cc_msb].map(v);
    //                        log_value(`${BS2.control[cc_msb].name} = ${r} (${v})`);
                } else {
                    r = v;
    //                        log_value(`${BS2.control[cc_msb].name} = ${v}`);
                }
                dispatch('CC', cc_msb, r);

                cc_expected = -1;

            } else {
    //                    log(`IGNORED CC ${cc}`);
                cc_msb = cc;
            }
        } else {

            if (BS2.control[cc].lsb == -1) {
                let v = msg[2];
                let r;
                if (BS2.control[cc].hasOwnProperty('map')) {
                    r = BS2.control[cc].map(v);
                    //log_value(`${CC_names[cc]} = ${r} (${v})`);
    //                        log_value(`${BS2.control[cc]} = ${r} (${v})`);
                } else {
    //                        log_value(`${BS2.control[cc].name} = ${v}`);
                    r = v;
                }

                dispatch('CC', cc, r);

            } else {
    //                    console.log('need second CC ' + BS2.control[cc].lsb);
                cc_expected = BS2.control[cc].lsb;
                cc_msb = cc;
                value_msb = msg[2];
            }
        }
    }


    function setupDials() {

        const CURSOR = 16;

        $(".dial").knob({
            change : function (v) { console.log('change', v); },
            release : function (v) { console.log('release', v); },
            angleOffset: -135,
            angleArc: 270,
            bgColor: "#606060",
            fgColor: "#ffec03"
        });

        for (let i=0; i < BS2.control.length; i++) {

            let c = BS2.control[i];

            if (typeof c == 'undefined') continue;

            if (!c.hasOwnProperty('range')) continue;

            let id = '#cc-' + i;
            let min = c.range[0];
            let max = c.range[1];
            let cursor = min < 0 ? CURSOR : false;
            let step = 1;

            console.log(i, c, min, max, cursor);

            $(id).trigger('configure', { min: min, max: max, step: step, cursor: cursor });

            if (min > 0) {
                $(id).val(min).trigger('change');
            }

        }

    } // setupDials

    /**
     * Set value of the dials
     */
    function updateDials() {

        for (let i=0; i < BS2.control.length; i++) {
            let c = BS2.control[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#cc-' + i);
            // if (e.hasClass('dial')) {
                e.val(c.value).trigger('change');
            // } else {
            //     e.val(c.value);
            // }
        }

        for (let i=0; i < BS2.nrpn.length; i++) {
            let c = BS2.nrpn[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#nrpn-' + i);
            // if (e.hasClass('dial')) {
                e.val(c.value).trigger('change');
            // } else {
            //     e.val(c.value);
            // }
        }

    } // updateDials()

    function setupLists() {
        $('#cc-80').append(BS2.SUB_WAVE_FORMS.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-88,#cc-89').append(BS2.LFO_WAVE_FORMS.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-70,#cc-75').append(BS2.OSC_RANGES.map(o => { return $("<option>").val(o).text(o); }));
        $('#nrpn-72,#nrpn-82').append(BS2.OSC_WAVE_FORMS.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-83').append(BS2.FILTER_TYPE.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-106').append(BS2.FILTER_SLOPE.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-84').append(BS2.FILTER_SHAPES.map(o => { return $("<option>").val(o).text(o); }));
        $('#nrpn-73,#nrpn-105').append(BS2.ENV_TRIGGERING.map(o => { return $("<option>").val(o).text(o); }));
    } // setupLists

    function updateLists() {
    }

    function setupCustoms() {
        $('#cc-110').removeClass("on").addClass("off").text("Osc 1-2 Sync OFF");
        //$('#cc-110').removeClass("off").addClass("on").text("Osc 1-2 Sync ON");
        $('#nrpn-89').removeClass("on").addClass("off").text("Key-sync OFF");
        // $('#nrpn-89').removeClass("off").addClass("on").text("Key-sync ON");
        $('#nrpn-93').removeClass("on").addClass("off").text("Key-sync OFF");
        // $('#nrpn-93').removeClass("off").addClass("on").text("Key-sync ON");
    }

    function updateCustoms() {
    }

    function setupUI() {
        setupDials();
        setupLists();
        setupCustoms();
    }

    function updateUI() {
        updateDials();
        updateLists();
        updateCustoms();
    }

    $(function () {

        setupUI();

        WebMidi.enable(function (err) {

            console.log('webmidi err', err);

            if (err) {
                setStatusError("ERROR: WebMidi could not be enabled.");
                setConnectionStatus(false);
            } else {

                setStatus("WebMidi enabled.");

                //WebMidi.inputs.map(i => log("input:" + i.name));
                //WebMidi.outputs.map(i => log("output:" + i.name));

                var input = WebMidi.getInputByName("Bass Station II");

                if (input) {

                    input.on('controlchange', "all", function(e) {
                        //console.log("CC: ", e);
                        //                    log(midiEventForHuman(e));
                        handleCC(e);
                    });

                    input.on('sysex', "all", function(e) {
                        console.log("SysEx: ", e);
                        BS2.setValuesFromSysex(e.data);
                        console.log(BS2.control);
                        console.log(BS2.nrpn);
                        updateUI();
                    });

                    setConnectionStatus(true);

                    setStatus("Send a SysDump from your BS2 to initialize the on-screen controls.");

                } else {

                    setStatusError("Bass Station II not found.")
                    setConnectionStatus(false);

                }

                //WebMidi.addListener("connected", e => logWebMidiEvent(e));
                //WebMidi.addListener("disconnected", e => logWebMidiEvent(e));

            }

        }, true);   // pass true to enable sysex support

    });

