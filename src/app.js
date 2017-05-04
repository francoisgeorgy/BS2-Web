
    function toggleOnOff(selector, bool) {
        if (bool) {
            $(selector).removeClass("off").addClass("on");
        } else {
            $(selector).removeClass("on").addClass("off");
        }
    }

    // function setConnectionStatus(status) {
    //     $('#connection-status').text(status ? 'connected' : 'not connected');
    // }

    function setMidiStatus(status) {
        toggleOnOff('#midi-status', status);
    }

    function setMidiInStatus(status) {
        toggleOnOff('#midi-in-status', status);
    }

    function setMidiOutStatus(status) {
        toggleOnOff('#midi-out-status', status);
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
     *
     * @param env
     * @param container_id
     */
    function drawADSR(env, container_id) {

        // console.log('drawADSR', env, container_id);

        let canvas = document.getElementById(container_id);
        let ctx = canvas.getContext("2d");

        const width = canvas.width;
        const height = canvas.height;

        const width_A = 0.25;
        const width_D = 0.25;
        const width_R = 0.25;

        // start position
        let x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, height); // start at lower left corner

        // Attack
        x += env.attack * width_A * width;
        ctx.lineTo(x, 0);

        // Decay
        x += env.decay * width_D * width;
        ctx.lineTo(x, height - env.sustain * height);

        // Sustain
        x = width - (env.release * width_R * width);
        ctx.lineTo(x, height - env.sustain * height);

        // Release
        ctx.lineTo(width, height);

        // stroke
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffec03";
        ctx.stroke();
        ctx.closePath();
    }


    /**
     * Update a control on screen from CC or NRPN value.
     *
     * @param control_type
     * @param control_number
     * @param value
     */
    function dispatch(control_type, control_number, value) {
        console.log('dispatch', control_type, control_number, value, '#' + control_type + '-' + control_number);
        control_type = control_type.toLowerCase();
        if ((control_type != 'cc') && (control_type != 'nrpn')) return; //TODO: signal an error
        console.log('dispatch ' + '#' + control_type + '-' + control_number + ' = ' + value);

        // the "blur" event will force a redraw of the dial. Do not send the "change" event as this will ping-pong between BS2 and this application.
        $('#' + control_type + '-' + control_number).val(value).trigger('blur');

        if (control_type === 'cc' && (control_number === 102 || control_number === 103 || control_number === 104 || control_number === 105)) {
            drawADSR(getADSREnv('cc-102', 'cc-103', 'cc-104', 'cc-105'), "mod-ADSR");
        }
        if (control_type === 'cc' && (control_number === 90 || control_number === 91 || control_number === 92 || control_number === 93)) {
            drawADSR(getADSREnv('cc-90', 'cc-91', 'cc-92', 'cc-93'), "amp-ADSR");
        }

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

        console.log('receive CC', cc, msg[2]);

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
            if (BS2.control[cc]) {
                if (BS2.control[cc].lsb === -1) {
                    let v = msg[2];
                    dispatch('CC', cc, v);
                } else {
                    cc_expected = BS2.control[cc].lsb;
                    cc_msb = cc;
                    value_msb = msg[2];
                }
            } else {
                console.warn(`unsupported CC: ${cc}`)
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

        console.log('updateBS2', control, value_float);

        let value = Math.round(value_float);
        let [control_type, control_number] = control.replace('#', '').split('-');

        control_number = parseInt(control_number);

        if (control_type === 'cc' && (control_number === 102 || control_number === 103 || control_number === 104 || control_number === 105)) {
            drawADSR(getADSREnv('cc-102', 'cc-103', 'cc-104', 'cc-105'), "mod-ADSR");
        }
        if (control_type === 'cc' && (control_number === 90 || control_number === 91 || control_number === 92 || control_number === 93)) {
            drawADSR(getADSREnv('cc-90', 'cc-91', 'cc-92', 'cc-93'), "amp-ADSR");
        }

        console.log('updateBS2', control_type, control_number, value_float, value);

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

    function record() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function play() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function sendToBS2() {
        sendAll();
    }

    /**
     * Send all values to BS2
     */
    function sendAll() {

        setStatus(`Sending all values to ${BS2.name} ...`);

        function _send(controls, prefix) {
            for (let i=0; i < controls.length; i++) {
                if (typeof controls[i] === 'undefined') continue;
                console.log($(prefix + i), controls[i]);
                //if (sendToBS2) updateBS2(prefix + i, parseInt($(prefix + i).val()));
                if (sendToBS2) updateBS2(prefix + i, controls[i].raw_value);
            }
        }

        _send(BS2.control, '#cc-');
        _send(BS2.nrpn, '#nrpn-');

        setStatus(`${BS2.name} updated.`);
    }


    function getDefaultValue(id) {

        let e = $(id);
        if (e.is('select')) return e[0].options[0];

        let [control_type, control_number] = id.replace('#', '').split('-');
        let c;
        if (control_type == 'cc') {
            c = BS2.control[control_number];
        } else if (control_type == 'nrpn') {
            c = BS2.nrpn[control_number];
        } else {
            // ERROR
            return 0;
        }
        let default_value = 0;
        let range_min = Math.min(...c.range); // used to determine cursor
        if (range_min < 0) {    // e.g.: -127..127 or -63..63
            default_value = c.max_raw >>> 1;    // div by 2
        }
        return default_value;
    }


    /**
     *
     */
    function initBS2(sendToBS2 = true) {

        function _init(controls, prefix) {
            for (let i=0; i < controls.length; i++) {

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                let e = $(prefix + i);

                if (e.is('select')) {
                    e[0].options[0].selected = true;

                    // if (sendToBS2) updateBS2(prefix + i, e[0].options[0]);

                    continue;
                }

                let default_value = 0;
                let range_min = Math.min(...c.range); // used to determine cursor
                if (range_min < 0) {    // e.g.: -127..127 or -63..63
                    default_value = c.max_raw >>> 1;    // div by 2
                }

                e.val(default_value).trigger('blur');
            }
        }

        _init(BS2.control, '#cc-');
        _init(BS2.nrpn, '#nrpn-');

        updateCustoms(false);

        //if (sendToBS2) setStatus(`${BS2.name} initialized`);
        if (sendToBS2) setStatus(`init done`);

        if (sendToBS2) sendAll();

        //if (sendToBS2) setStatus(`${BS2.name} initialized`);

    }

    /**
     *
     */
    function randomizeBS2() {

        //FIXME: send all CC to BS2 _at the end_. First, update the UI.

        function _randomize(controls, prefix) {

            for (let i=0; i < controls.length; i++) {

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                let e = $(prefix + i);

                //console.log(`randomize ${prefix + i}`);

                if (e.is('select')) {
                    // console.log(`randomize select ${prefix + i} = option`);
                    e[0].options[Math.floor(Math.random() * e[0].options.length)].selected = true;
                    //if (sendToBS2) updateBS2(prefix + i, e.val());
                    continue;
                }

                let v;
                if (c.on_off) {
                    v = Math.round(Math.random());
                } else {
                    let min = 0;
                    v = Math.floor(Math.random() * (c.max_raw - min)) + min;  //TODO: step
                }

                console.log(`randomize ${prefix + i}=${v} with c.max_raw=${c.max_raw}`);


                c.raw_value = v;


                // e.val(v).trigger('change');
                e.val(v).trigger('blur');

                //if (sendToBS2) updateBS2(prefix + i, v);

            }
        }

        _randomize(BS2.control, '#cc-');
        _randomize(BS2.nrpn, '#nrpn-');

        updateCustoms(false); // TODO: send CC to BS2 afterward

        //if (sendToBS2) setStatus(`${BS2.name} randomized`);
        if (sendToBS2) setStatus(`randomize done`);

        if (sendToBS2) sendAll();

    }

    function resetGroup(e) {
        //console.log(e, $(e.target).parent());
        $(e.target).parent().find('[id^=cc-],[id^=nrpn-]').each(function(){
            console.log(this.id);
            let id = this.id;
            if (id.endsWith('-handle')) return;

            let e = $('#'+id);
            if (e.is('select')) {
                e[0].options[0].selected = true;
                return;
            }

            let v = getDefaultValue(id);
            console.log(`${id}=${v}`);
            e.val(getDefaultValue('#'+id)).trigger('blur');
        });
        updateCustoms(false);
    }

    /**
     *
     */
    function setupCommands() {
        $('#cmd-export').click(exportToFile);
        // $('#cmd-import').click(importFromFile);
        $('#cmd-send').click(sendToBS2);
        $('#cmd-init').click(initBS2);
        $('#cmd-randomize').click(randomizeBS2);
        $('#cmd-record').click(record);
        $('#cmd-play').click(play);
    }


    /**
     *
     */
    function setupDials() {

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

                let e = $(prefix + i);

                if (!e.hasClass('dial')) continue;

                console.log(`setup ${prefix}${i} max=${c.max_raw}`);

                e.trigger('configure', {
                    min: 0,
                    max: c.max_raw,
                    step: 1,
                    cursor: Math.min(...c.range) < 0 ? CURSOR : false,
                    format: v => c.human(v)
                    //parse: function(v) { return parseInt(v); }
                });
            }
        }

        _setup(BS2.control, '#cc-');
        _setup(BS2.nrpn, '#nrpn-');

    } // setupDials


    /**
     * Set value of the controls (input and select)
     */
    function updateControls() {

        //FIXME: use c.raw_value

/*
        for (let i=0; i < BS2.control.length; i++) {
            let c = BS2.control[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#cc-' + i);
            if (e.is('select')) continue;
            console.log(`trigger change on cc-${i}`);
            e.val(c.value).trigger('change');
        }

        for (let i=0; i < BS2.nrpn.length; i++) {
            let c = BS2.nrpn[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#nrpn-' + i);
            if (e.is('select')) continue;
            console.log(`trigger change on nrpn-${i}`);
            e.val(c.value).trigger('change');
        }
*/
    } // updateControls()

    /**
     *
     */
    function setupSelects() {

        $('#cc-80').append(BS2.SUB_WAVE_FORMS.map((o,i) => { return $("<option>").val(i).text(o); }));

        $('#cc-88,#cc-89').append(BS2.LFO_WAVE_FORMS.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#nrpn-88,#nrpn-92').append(BS2.LFO_SPEED_SYNC.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#nrpn-87,#nrpn-91').append(BS2.LFO_SYNC.map((o,i) => { return $("<option>").val(i).html(o); }));


        $('#cc-81').append(Object.entries(BS2.SUB_OCTAVE).map((o,i) => {return $("<option>").val(o[0]).text(o[1]); }));

        //$('#cc-70,#cc-75').append(BS2.OSC_RANGES.map((o,i) => {return $("<option>").val(i).text(o); }));
        $('#cc-70,#cc-75').append(Object.entries(BS2.OSC_RANGES).map((o,i) => {return $("<option>").val(o[0]).text(o[1]); }));


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

        $('select').change(function (){ updateBS2(this.id, this.value) });

        $('#nrpn-72').change(function (e) { this.value == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc1-pw-controls') : hide('#osc1-pw-controls'); });
        $('#nrpn-82').change(function (e) { this.value == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc2-pw-controls') : hide('#osc2-pw-controls'); });

        // LFO: "sync" drop down is displayed only when speed/sync is set to sync
        $('#nrpn-88').change(function (e) { this.value == BS2.LFO_SPEED_SYNC.indexOf('sync') ? show('#nrpn-87') : hide('#nrpn-87'); });
        $('#nrpn-92').change(function (e) { this.value == BS2.LFO_SPEED_SYNC.indexOf('sync') ? show('#nrpn-91') : hide('#nrpn-91'); });

    } // setupSelects

    /**
     *
     * @param control_id
     */
    function setupOnOffControl(control_id) {
        $(control_id + '-handle').click(function(){
            let v = $(control_id).val();
            $(control_id).val(v == 0 ? 1 : 0);
            updateOnOffControl(control_id);
        });
    }

    /**
     *
     */
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

    /**
     *
     * @param control_id
     */
    function updateOnOffControl(control_id, sendToBS2 = true) {   //}, prefix_text) {
        toggleOnOff(control_id + '-handle', $(control_id).val() != 0);
        if (sendToBS2) updateBS2(control_id, $(control_id).val());
    }

    /**
     *
     */
    function updateCustoms(sendToBS2 = true) {

        updateOnOffControl('#cc-110', sendToBS2);  // Osc 1-2 Sync
        updateOnOffControl('#nrpn-89', sendToBS2);
        updateOnOffControl('#nrpn-93', sendToBS2);
        updateOnOffControl('#cc-108', sendToBS2);
        updateOnOffControl('#cc-109', sendToBS2);
        updateOnOffControl('#nrpn-106', sendToBS2);

        $('#nrpn-72').val() == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc1-pw-controls') : hide('#osc1-pw-controls');
        $('#nrpn-82').val() == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? show('#osc2-pw-controls') : hide('#osc2-pw-controls');

        // LFO: "sync" drop down is displayed only when speed/sync is set to sync
        $('#nrpn-88').val() == BS2.LFO_SPEED_SYNC.indexOf('sync') ? show('#nrpn-87') : hide('#nrpn-87');
        $('#nrpn-92').val() == BS2.LFO_SPEED_SYNC.indexOf('sync') ? show('#nrpn-91') : hide('#nrpn-91');

        drawADSR(getADSREnv('cc-102', 'cc-103', 'cc-104', 'cc-105'), "mod-ADSR");
        drawADSR(getADSREnv('cc-90', 'cc-91', 'cc-92', 'cc-93'), "amp-ADSR");

    }

    /**
     *
     */
    function updateMeta() {
        $('#patch-number').text(BS2.meta.patch_id.value + ': ' + BS2.meta.patch_name['value']);
    }

    function getADSREnv(id_A, id_D, id_S, id_R) {
        return {
            attack: $('#' + id_A).val() / 127,
            decay: $('#' + id_D).val() / 127,
            sustain: $('#' + id_S).val() / 127,
            release: $('#' + id_R).val() / 127
        };
    }

    /**
     *
     */
    function setupUI() {
        setupDials();
        setupSelects();
        setupCustoms();
        setupCommands();
        initBS2(false);     // init UI without sending any CC to the BS2
        $('h1.reset-handler').click(resetGroup);

        drawADSR(getADSREnv('cc-102', 'cc-103', 'cc-104', 'cc-105'), "mod-ADSR");
        drawADSR(getADSREnv('cc-90', 'cc-91', 'cc-92', 'cc-93'), "amp-ADSR");

    }

    /**
     *
     */
    function updateUI() {
        updateControls();
        // updateLists();
        updateCustoms();
        updateMeta();
    }

    /**
     *
     * @type {null}
     */
    var midi_input = null;
    var midi_output = null;

    /**
     *
     * @param input
     */
    function connectInput(input) {
        midi_input = input;
        midi_input
            .on('controlchange', "all", function(e) {   //FIXME: do not use "all" channel
                handleCC(e);
            })
            .on('sysex', "all", function(e) {           //FIXME: do not use "all" channel
                if (BS2.setValuesFromSysex(e.data)) {
                    updateUI();
                    setStatus("UI updated from SysEx.");
                } else {
                    setStatusError("Unable to set value from SysEx.")
                }
            });
        setStatus(`"${input.name}" input connected.`)
        setMidiInStatus(true);
    }

    /**
     *
     * @param output
     */
    function connectOutput(output) {
        midi_output = output;
        setStatus(`"${output.name}" output connected.`)
        setMidiOutStatus(true);
    }

    /**
     *
     * @param info
     */
    function deviceConnect(info) {
        console.log(info);
        if ((info.name !== BS2.name_device_in) && (info.name !== BS2.name_device_out)) {
            return;
        }
        if (info.hasOwnProperty('input') && info.input && (info.name === BS2.name_device_in)) {
            if (!midi_input) connectInput(info.input);
        }
        if (info.hasOwnProperty('output') && info.output && (info.name === BS2.name_device_out)) {
            if (!midi_output) connectOutput(info.output);
        }
    }

    /**
     *
     * @param info
     */
    function deviceDisconnect(info) {
        console.log(info);
        if ((info.name !== BS2.name_device_in) && (info.name !== BS2.name_device_out)) {
            console.log(`disconnect event ignored for device ${info.name}`);
            return;
        }
        if (info.name === BS2.name_device_in) {
            midi_input = null;
            setStatus(`${BS2.name_device_in} has been disconnected.`)
            // setConnectionStatus(false);
            setMidiInStatus(false);
        }
        if (info.name === BS2.name_device_out) {
            midi_output = null;
            setMidiOutStatus(false);
        }
    }

    /**
     *
     */
    $(function () {

        setupUI();
        setMidiStatus(false);
        setMidiInStatus(false);
        setMidiOutStatus(false);
        setStatus("Waiting for MIDI interface...");

        WebMidi.enable(function (err) {

            console.log('webmidi err', err);

            if (err) {

                setStatusError("ERROR: WebMidi could not be enabled.");

            } else {

                setStatus("WebMidi enabled.");
                setMidiStatus(true);

                WebMidi.addListener("connected", e => deviceConnect(e));
                WebMidi.addListener("disconnected", e => deviceDisconnect(e));

                // WebMidi.inputs.map(i => console.log("input: " + i.name));
                // WebMidi.outputs.map(i => console.log("output: " + i.name));

                let input = WebMidi.getInputByName(BS2.name_device_in);
                if (input) {
                    connectInput(input);
                } else {
                    setStatusError(`"${BS2.name_device_in}" input not found.`)
                    setMidiInStatus(false);
                }

                let output = WebMidi.getOutputByName(BS2.name_device_out);
                if (output) {
                    connectOutput(output);
                } else {
                    setStatusError(`"${BS2.name_device_in}" output not found.`)
                    setMidiOutStatus(false);
                }


                $('#patch-file').change(readFile);

                function readFile() {

                    // const SYSEX_START = 0xF0;
                    const SYSEX_END = 0xF7;

                    let data = [];
                    let f = this.files[0];
                    console.log(`read file`, f);

                    if (f) {
                        let reader = new FileReader();
                        reader.onload = function (e) {
                            let view   = new Uint8Array(e.target.result);
                            for (let i=0; i<view.length; i++) {
                                data.push(view[i]);
                                if (view[i] == SYSEX_END) break;
                            }
                            //updateDisplay(data);
                            if (BS2.setValuesFromSysex(data)) {
                                console.log('file read OK', BS2.meta.patch_name['value'], BS2);
                                $.featherlight.close();
                                updateUI();
                            } else {
                                console.log('unable to set value from file');
                            }
                        };
                        reader.readAsArrayBuffer(f);
                    }

                }



            }

        }, true);   // pass true to enable sysex support

    });

