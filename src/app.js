
    function setConnectionStatus(status) {
        $('#connection-status').text(status ? 'connected' : 'not connected');
    }

    function setStatus(msg) {
        $('#status').removeClass("error").text(msg);
    }

    function setStatusError(msg) {
        $('#status').addClass("error").text(msg);
    }

    function hide(sel) {
        $(sel).css('visibility', 'hidden');
    }

    function show(sel) {
        $(sel).css('visibility', 'visible');
    }

    /**
     * Update a control on screen from CC or NRPN value.
     *
     * @param type
     * @param control
     * @param value
     */
    function dispatch(type, control, value) {
        //console.log(type, control, value, '#' + type + '-' + control);
        type = type.toLowerCase();
        if ((type != 'cc') && (type != 'nrpn')) return; //TODO: signal an error
        $('#' + type + '-' + control).val(value).trigger('change');
    }

    var cc_expected = -1;
    var cc_msb = -1;
    var cc_lsb = -1;
    var value_msb = 0;    // msb to compute value
    var value_lsb = 0;    // lsb to compute value
    var nrpn = false;

    function handleCC(e) {

        let msg = e.data;   // Uint8Array
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
                //let v = value;
                // let r;
                // if (BS2.nrpn[cc_lsb].hasOwnProperty('map')) {
                //     r = BS2.nrpn[cc_lsb].map(v);
                // } else {
                //     r = v;
                // }
                // dispatch('NRPN', cc_lsb, r);
                dispatch('NRPN', cc_lsb, value);
                nrpn = false;
                return;
            }
        }

        if (cc_expected >= 0) {
            if (cc == cc_expected) {
                value_lsb = msg[2];
                let v = BS2.doubleByteValue(value_msb, value_lsb);
                // let r;
                // if (BS2.control[cc_msb].hasOwnProperty('map')) {
                //     r = BS2.control[cc_msb].map(v);
                // } else {
                //     r = v;
                // }
                // dispatch('CC', cc_msb, r);
                dispatch('CC', cc_msb, v);
                cc_expected = -1;
            } else {
                cc_msb = cc;
            }
        } else {

            if (BS2.control[cc].lsb == -1) {
                let v = msg[2];
                // let r;
                // if (BS2.control[cc].hasOwnProperty('map')) {
                //     r = BS2.control[cc].map(v);
                // } else {
                //     r = v;
                // }
                // dispatch('CC', cc, r);
                dispatch('CC', cc, v);
            } else {
                cc_expected = BS2.control[cc].lsb;
                cc_msb = cc;
                value_msb = msg[2];
            }
        }
    }

    function updateBS2(control, value) {

        return;

        console.log('updateBS2', control, value);
        let [control_type, control_number] = control.replace('#', '').split('-')
        console.log('updateBS2', control_type, control_number);
        if (control_type === 'cc') {
            console.log(`send ${control_number} ${value}`);

            let a = BS2.getMidiMessagesForControl('cc', control_number, value);
            for (let i=0; i<a.length; i++) {
                // console.log(`send CC ${a[i][0]} ${a[i][1]}`);
                midi_output.sendControlChange(parseInt(a[i][0], 10), a[i][1]);
            }
            //
        } else if (control_type === 'nrpn') {
            //console.log(`send NRPN ${BS2.nrpn[control_number].msb, control_number} ${value}`);
            // midi_output.setNonRegisteredParameter([BS2.nrpn[control_number].msb, control_number], value);//[0, 10]);
            midi_output.setNonRegisteredParameter([0, control_number], value);  // for the BS2, the NRPN MSB is always 0
        }
    }

    function importFromFile() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function exportToFile() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function sendToBS2() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function initBS2() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function randomizeBS2() {

        function _randomize(controls, prefix) {
            for (let i=0; i < controls.length; i++) {
                let c = controls[i];
                if (typeof c === 'undefined') continue;
                if (c.range.length === 0) continue;
                let e = $(prefix + i);
                // let min = Math.min(...c.range);
                // let max = Math.max(...c.range);
                let min = 0;
                let max = c.max_raw;
                let v;
                if ((min == 0) && (max == 1)) {
                    v = Math.round(Math.random());
                } else {
                    v = Math.floor(Math.random() * (max - min)) + min;  //TODO: step
                }
                if (e.is('select')) {
                    //console.log(`${e} is a select`, e, e[0].options);
                    e[0].options[Math.floor(Math.random() * e[0].options.length)].selected = true
                } else {
                    e.val(v).trigger('change');
                }
            }
        }

        _randomize(BS2.control, '#cc-');
        _randomize(BS2.nrpn, '#nrpn-');

        updateCustoms();
    }

    function setupCommands() {
        $('#cmd-export').click(exportToFile);
        $('#cmd-import').click(importFromFile);
        $('#cmd-send').click(sendToBS2);
        $('#cmd-init').click(initBS2);
        $('#cmd-randomize').click(randomizeBS2);
    }

    /**
     *
     */
    function setupControls() {

        const CURSOR = 12;

        $(".dial").knob({
            // change : function (v) { /*console.log(this, this.cv, v, this.i[0].id);*/ updateBS2(this.i[0].id, Math.round(v)) },  //TODO: why is v not an integer is step==1?
            // release : function (v) { console.log('release', this, v); },
            angleOffset: -135,
            angleArc: 270,
            bgColor: "#606060",
            fgColor: "#ffec03"
        });

        function _setup(controls, prefix) {
            for (let i=0; i < controls.length; i++) {
                let c = controls[i];
                if (typeof c === 'undefined') continue;
                if (!c.hasOwnProperty('range')) continue;
                if (c.range.length === 0) continue;     //TODO: SIGNAL AN ERROR

                //console.log(c);

                // let id = prefix + i;
                let min = Math.min(...c.range); // used to determine cursor
                // let max = Math.max(...c.range); // used to determine cursor
                let cursor = min < 0 ? CURSOR : false;
                // let cursor = CURSOR;
                // let step = c.hasOwnProperty('step') ? c.step : 1;

                let max;
                if (c.hasOwnProperty('lsb') && (c.lsb > 0)) {     // one or two bytes value?
                    max = 255;
                } else if (c.hasOwnProperty('msb') && (c.msb > 0)) {
                    max = 255;
                } else {
                    max = 127;
                }

                console.log('_setup', prefix + i, 0, max);

                let e = $(prefix + i);
                e.trigger('configure', {    //FIXME: check that e is a knob
                    // min: min,
                    // max: max,
                    // step: step,
                    min: 0,
                    max: max,
                    step: 1,
                    cursor: cursor,
                    // format: v => {console.log('format', prefix+i, v, c.human(v), c);return c.human(v);}
                    format: v => c.human(v)
                    // format: function (v) { return v; }
                    //parse: function(v) { return parseInt(v); }
                });
                let default_value;
                if ((min < 0) && (max > 0)) {
                    default_value = max >>> 1;
                } else if (min != 0) {
                    default_value = min;
                } else {
                    default_value = 0;
                }
                // if (min != 0) {
                if (default_value != 0) {
                    console.log('set default', prefix + i, default_value);
                    e.val(default_value).trigger('blur');
                }
                // add onChange handler
                if (!e.hasClass('dial')) {
                    e.change(function (e){ updateBS2(prefix + i, this.value) });
                }
            }
        }

        _setup(BS2.control, '#cc-');
        _setup(BS2.nrpn, '#nrpn-');
        // BS2.applyToAllControls(_setup);

        // $('#cc-' + BS2.control_id.osc1_coarse).trigger('configure', { format: v => v.toFixed(1) });
        // $('#cc-' + BS2.control_id.osc2_coarse).trigger('configure', { format: v => v.toFixed(1) });

    } // setupControls


    /**
     * Set value of the controls (input and select)
     */
    function updateControls() {

        for (let i=0; i < BS2.control.length; i++) {
            let c = BS2.control[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#cc-' + i);
            if (e.is('select')) continue;
            e.val(c.value).trigger('change');
        }

        for (let i=0; i < BS2.nrpn.length; i++) {
            let c = BS2.nrpn[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#nrpn-' + i);
            if (e.is('select')) continue;
            e.val(c.value).trigger('change');
        }

    } // updateControls()

    function setupSelects() {

        $('#cc-80').append(BS2.SUB_WAVE_FORMS.map((o,i) => { return $("<option>").val(i).text(o); }));

        $('#cc-88,#cc-89').append(BS2.LFO_WAVE_FORMS.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#nrpn-88,#nrpn-92').append(BS2.LFO_SPEED_SYNC.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#nrpn-87,#nrpn-91').append(BS2.LFO_SYNC.map((o,i) => { return $("<option>").val(i).text(o); }));

        $('#cc-70,#cc-75').append(BS2.OSC_RANGES.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#nrpn-72,#nrpn-82').append(BS2.OSC_WAVE_FORMS.map((o,i) => { return $("<option>").val(i).text(o); }));

        $('#cc-83').append(BS2.FILTER_TYPE.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#cc-106').append(BS2.FILTER_SLOPE.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#cc-84').append(BS2.FILTER_SHAPES.map((o,i) => { return $("<option>").val(i).text(o); }));

        $('#nrpn-73,#nrpn-105').append(BS2.ENV_TRIGGERING.map((o,i) => { return $("<option>").val(i).text(o); }));

        $('#cc-111').append(BS2.ARP_OCTAVES.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#cc-118').append(BS2.ARP_NOTES_MODE.map((o,i) => { return $("<option>").val(i).text(o); }));

        for (let i=0; i<32; i++) {
            $('#cc-119').append($("<option>").val(i).text(i+1));
        }

        $('#nrpn-72').change(function (e) { this.value == 'pulse' ? show('#osc1-pw-controls') : hide('#osc1-pw-controls'); });
        $('#nrpn-82').change(function (e) { this.value == 'pulse' ? show('#osc2-pw-controls') : hide('#osc2-pw-controls'); });

        // $('select').change(function (e) { console.log(this.value)});

    } // setupSelects

    function setupOnOffControl(control_id) {
        $(control_id).change(function() {
            updateOnOffControl(control_id);
        });
        $(control_id + '-handle').click(function(){
            let v = $(control_id).val();
            $(control_id).val(v == 0 ? 1 : 0);
            updateOnOffControl(control_id);
        });
    }

    function setupCustoms() {

        setupOnOffControl('#cc-110');
        setupOnOffControl('#nrpn-89');
        setupOnOffControl('#nrpn-93');
        setupOnOffControl('#cc-108');
        setupOnOffControl('#cc-109');
        setupOnOffControl('#nrpn-106');

        $('#osc1-pw-controls').css('visibility','hidden');
        $('#osc2-pw-controls').css('visibility','hidden');
    }

    function updateOnOffControl(control_id) {   //}, prefix_text) {
        if ($(control_id).val() == 0) {
            $(control_id + '-handle').removeClass("on").addClass("off");    //.text(prefix_text + " OFF");
        } else {
            $(control_id + '-handle').removeClass("off").addClass("on");    //.text(prefix_text + " ON ");
        }
        updateBS2(control_id.replace('#', ''), $(control_id).val());
    }

    function updateCustoms() {

        // updateOnOffControl('#cc-110', "");
        // updateOnOffControl('#nrpn-89', "Key Sync");
        // updateOnOffControl('#nrpn-93', "Key Sync");
        // updateOnOffControl('#cc-108', "ARP");
        // updateOnOffControl('#cc-109', "Latch");
        // updateOnOffControl('#nrpn-106', "Retrig");
        updateOnOffControl('#cc-110');  // Osc 1-2 Sync
        updateOnOffControl('#nrpn-89');
        updateOnOffControl('#nrpn-93');
        updateOnOffControl('#cc-108');
        updateOnOffControl('#cc-109');
        updateOnOffControl('#nrpn-106');

        $('#nrpn-72').val() == 'pulse' ? show('#osc1-pw-controls') : hide('#osc1-pw-controls');
        $('#nrpn-82').val() == 'pulse' ? show('#osc2-pw-controls') : hide('#osc2-pw-controls');
    }

    function updateMeta() {
        $('#patch-number').text(BS2.meta.patch_id.value);
    }

    function setupUI() {
        setupControls();
        setupSelects();
        setupCustoms();
        setupCommands();
    }

    function updateUI() {
        updateControls();
        // updateLists();
        updateCustoms();
        updateMeta();
    }

    var midi_output = null;

    $(function () {

        setupUI();
        setStatus("Waiting for MIDI interface...");

        WebMidi.enable(function (err) {

            console.log('webmidi err', err);

            if (err) {
                setStatusError("ERROR: WebMidi could not be enabled.");
                setConnectionStatus(false);
            } else {

                setStatus("WebMidi enabled.");

                WebMidi.inputs.map(i => console.log("input: " + i.name));
                WebMidi.outputs.map(i => console.log("output: " + i.name));

                var input = WebMidi.getInputByName("Bass Station II");

                if (input) {

                    input.on('controlchange', "all", function(e) {
                        //console.log("CC: ", e);
                        //                    log(midiEventForHuman(e));
                        handleCC(e);
                    });

                    input.on('sysex', "all", function(e) {
                        console.log("SysEx: ", e);
                        if (BS2.setValuesFromSysex(e.data)) {
                            console.log(BS2.control);
                            console.log(BS2.nrpn);
                            updateUI();
                            setStatus("UI updated from SysEx.");
                        } else {
                            setStatusError("Unable to set value from SysEx.")
                        }
                    });

                    setConnectionStatus(true);

                    setStatus("Send a SysDump from your BS2 to initialize the on-screen controls.");

                } else {

                    setStatusError("Bass Station II not found.")
                    setConnectionStatus(false);

                }

                midi_output = WebMidi.getOutputByName("Bass Station II");
                if (midi_output) {
                    console.log('output OK');

                    // midi_output.setNonRegisteredParameter([BS2.nrpn[89].msb, 89], 0);

                } else {
                    console.error('unbale to connect output');
                }

                //WebMidi.addListener("connected", e => logWebMidiEvent(e));
                //WebMidi.addListener("disconnected", e => logWebMidiEvent(e));

            }

        }, true);   // pass true to enable sysex support

    });

