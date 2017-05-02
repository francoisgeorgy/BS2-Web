
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

    function logOutgoingMidiMessage(type, control, value) {
        $('#midi-messages-out').prepend(`${type.toUpperCase()} ${control} ${value}<br />`);
    }

    function logIncomingMidiMessage(type, control, value) {
        $('#midi-messages-in').prepend(`${type.toUpperCase()} ${control} ${value}<br />`);
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

    /**
     * Handle all control change messages received
     * @param e
     */
    function handleCC(e) {

        let msg = e.data;   // Uint8Array
        let cc = msg[1];
        let value = -1;

        logIncomingMidiMessage('CC', cc, msg[2]);

        if (cc === WebMidi.MIDI_CONTROL_CHANGE_MESSAGES['nonregisteredparameterfine']) {   // 99
            cc_msb = msg[2];
            nrpn = true;
            return;
        } else if (cc === WebMidi.MIDI_CONTROL_CHANGE_MESSAGES['nonregisteredparametercoarse']) {  // 98
            cc_lsb = msg[2];
            return;
        } else {
            if (nrpn) {
                value = msg[2];
                dispatch('NRPN', cc_lsb, value);
                nrpn = false;
                return;
            }
        }

        if (cc_expected >= 0) {
            if (cc === cc_expected) {
                value_lsb = msg[2];
                let v = BS2.doubleByteValue(value_msb, value_lsb);
                dispatch('CC', cc_msb, v);
                cc_expected = -1;
            } else {
                cc_msb = cc;
            }
        } else {
            if (BS2.control[cc].lsb === -1) {
                let v = msg[2];
                dispatch('CC', cc, v);
            } else {
                cc_expected = BS2.control[cc].lsb;
                cc_msb = cc;
                value_msb = msg[2];
            }
        }
    }

    /**
     * Note: jQuery Knob transmits the value as a float
     * @param control
     * @param value_float
     */
    function updateBS2(control, value_float) {

        //TODO: check that midi_output is defined

        // console.log('updateBS2', control, value);
        let value = Math.round(value_float);
        let [control_type, control_number] = control.replace('#', '').split('-');
        control_number = parseInt(control_number);
        console.log('updateBS2updateBS2', control_type, control_number, value_float, value);
        if (control_type === 'cc') {
            //console.log(`send ${control_number} ${value}`);

            let a = BS2.getMidiMessagesForControl(control_number, value);
            for (let i=0; i<a.length; i++) {
                // console.log(`send CC ${a[i][0]} ${a[i][1]}`);
                logOutgoingMidiMessage('cc', a[i][0], a[i][1]);
                if (midi_output) midi_output.sendControlChange(a[i][0], a[i][1]);
            }
            //
        } else if (control_type === 'nrpn') {
            //console.log(`send NRPN ${BS2.nrpn[control_number].msb, control_number} ${value}`);
            // midi_output.setNonRegisteredParameter([BS2.nrpn[control_number].msb, control_number], value);//[0, 10]);

            logOutgoingMidiMessage('nrpn', control_number, value);

            if (midi_output) midi_output.setNonRegisteredParameter([0, control_number], value);  // for the BS2, the NRPN MSB is always 0
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

                let e = $(prefix + i);

                if (e.is('select')) {
                    //console.log(`${e} is a select`, e, e[0].options);
                    e[0].options[Math.floor(Math.random() * e[0].options.length)].selected = true
                    continue;
                }

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                let v;
                if (c.on_off) {
                    v = Math.round(Math.random());
                } else {
                    let min = 0;
                    v = Math.floor(Math.random() * (c.max_raw - min)) + min;  //TODO: step
                }

                e.val(v).trigger('change');
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
            change : function (v) { updateBS2(this.i[0].id, v) },
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

                let default_value = 0;

                let e = $(prefix + i);
                if (e.hasClass('dial')) {

                    console.log(c);
                    let range_min = Math.min(...c.range); // used to determine cursor
                    // let max = Math.max(...c.range); // used to determine cursor
                    let cursor = range_min < 0 ? CURSOR : false;
                    // let cursor = CURSOR;
                    // let step = c.hasOwnProperty('step') ? c.step : 1;

                    if (range_min < 0) {    // e.g.: -127..127 or -63..63
                        default_value = c.max_raw >>> 1;    // div by 2
                    }

                    console.log('_setup', prefix + i, 0, c.max_raw);

                    e.trigger('configure', {    //FIXME: check that e is a knob
                        min: 0,
                        max: c.max_raw,
                        step: 1,
                        cursor: cursor,
                        // format: v => {console.log('format', prefix+i, v, c.human(v), c);return c.human(v);}
                        format: v => c.human(v)
                        //parse: function(v) { return parseInt(v); }
                    });

                } // dial

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

        $('#nrpn-72').change(function (e) { this.value == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc1-pw-controls') : hide('#osc1-pw-controls'); });
        $('#nrpn-82').change(function (e) { this.value == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc2-pw-controls') : hide('#osc2-pw-controls'); });

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
        //updateBS2(control_id.replace('#', ''), $(control_id).val());
    }

    function updateCustoms() {

        updateOnOffControl('#cc-110');  // Osc 1-2 Sync
        updateOnOffControl('#nrpn-89');
        updateOnOffControl('#nrpn-93');
        updateOnOffControl('#cc-108');
        updateOnOffControl('#cc-109');
        updateOnOffControl('#nrpn-106');

        $('#nrpn-72').val() == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc1-pw-controls') : hide('#osc1-pw-controls');
        $('#nrpn-82').val() == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc2-pw-controls') : hide('#osc2-pw-controls');
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

