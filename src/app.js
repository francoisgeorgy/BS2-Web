
    function toggleOnOff(selector, bool) {
        // console.log(`toggleOnOff(${selector}, ${bool})`);
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

    function disable(sel) {
        $(sel).addClass('disabled');
    }

    function enable(sel) {
        $(sel).removeClass('disabled');
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
     * Update BS2 and associated on-screen control from CC or NRPN value.
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

        BS2.setControlValue(control_type, control_number, value);

        // the "blur" event will force a redraw of the dial. Do not send the "change" event as this will ping-pong between BS2 and this application.
        $('#' + control_type + '-' + control_number).val(value).trigger('blur');

        updateCustoms(false);   //TODO: pass the current CC number and in updateCustoms() only update controls linked to this CC number
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
                dispatch('nrpn', cc_lsb, value);
                nrpn = false;
                return;
            }
        }

        if (cc_expected >= 0) {
            if (cc === cc_expected) {
                value_lsb = msg[2];
                let v = BS2.doubleByteValue(value_msb, value_lsb);
                dispatch('cc', cc_msb, v);
                cc_expected = -1;
            } else {
                cc_msb = cc;
            }
        } else {
            if (BS2.control[cc]) {
                if (BS2.control[cc].lsb === -1) {
                    let v = msg[2];
                    dispatch('cc', cc, v);
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
     * Send a update (CC) to the connected device
     * Note: jQuery Knob transmits the value as a float
     * @param control
     * @param value_float
     */
    function sendToDevice(control_type, control_number, value_float) {

        // console.log('updateBS2', control, value_float);

        let value = Math.round(value_float);

        console.log('updateBS2', control_type, control_number, value_float, value);

        let control = BS2.setControlValue(control_type, control_number, value);

        if (control_type === 'cc') {
            if ([102, 103, 104, 105].includes(control_number)) {
                drawADSR(BS2.getADSREnv('mod'), 'mod-ADSR');
            } else if ([90, 91, 92, 93].includes(control_number)) {
                drawADSR(BS2.getADSREnv('amp'), 'amp-ADSR');
            }
        }

        sendSingleValue(control);
    }

    /**
     *
     * @param control_type
     * @param control_number
     */
    function sendSingleValue(control) {

        // console.log(`sendSingleValue()`, control);

        if (control.cc_type === 'cc') {
            let a = BS2.getMidiMessagesForNormalCC(control);
            for (let i=0; i<a.length; i++) {
                console.log(`send CC ${a[i][0]} ${a[i][1]} (${control.name}) on channel ${midi_channel}`);
                logOutgoingMidiMessage('cc', a[i][0], a[i][1]);
                if (midi_output) midi_output.sendControlChange(a[i][0], a[i][1], midi_channel);
            }
        } else if (control.cc_type === 'nrpn') {
            let value = BS2.getControlValue(control);
            console.log(`send NRPN ${control.cc_number} ${value} (${control.name}) on channel ${midi_channel}`);
            logOutgoingMidiMessage('nrpn', control.cc_number, value);
            if (midi_output) midi_output.setNonRegisteredParameter([0, control.cc_number], value, midi_channel);  // for the BS2, the NRPN MSB is always 0
        }

    }

    /**
     * Send all values to the connected device
     */
    function updateDevice() {

        console.groupCollapsed(`updateDevice()`);

        setStatus(`Sending all values to ${BS2.name} ...`);

        function _send(controls) {
            for (let i=0; i < controls.length; i++) {
                if (typeof controls[i] === 'undefined') continue;
                sendSingleValue(controls[i]);
            }
        }

        _send(BS2.control);
        _send(BS2.nrpn);

        setStatus(`${BS2.name} updated.`);

        console.groupEnd();
    }

    /**
     *
     * @param dom_id ID of the HTML element
     * @returns {*}
     */
    function getDefaultValue(dom_id) {
        let [control_type, control_number] = dom_id.replace('#', '').split('-');
        let c;
        if (control_type == 'cc') {
            c = BS2.control[control_number];
        } else if (control_type == 'nrpn') {
            c = BS2.nrpn[control_number];
        } else {
            // ERROR
            return 0;
        }
        //FIXME: check that c exists
        return c.init_value;
    }

    /**
     *
     */
    function init(sendUpdate = true) {

        console.log(`init(${sendUpdate})`);

        BS2.init();

        updateUI();

        setStatus(`init done`);

        if (sendUpdate) updateDevice();

    }

    /**
     *
     */
    function randomizeBS2(sendUpdate = true) {

        function _randomize(controls) {

            for (let i=0; i < controls.length; i++) {

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                let v;
                if (c.hasOwnProperty('randomize')) {
                    v = c.randomize;
                } else {
                    if (c.on_off) {
                        v = Math.round(Math.random());
                        console.log(`randomize #${c.cc_type}-${i}=${v} with 0|1 value = ${v}`);
                    } else {
                        let min = Math.min(...c.cc_range);
                        v = Math.round(Math.random() * (Math.max(...c.cc_range) - min)) + min;  //TODO: step
                        console.log(`randomize #${c.cc_type}-${i}=${v} with min=${min} c.max_raw=${Math.max(...c.cc_range)}, v=${v}`);
                    }
                }
                c.raw_value = v;
            }
        }

        console.groupCollapsed(`randomizeBS2(${sendUpdate})`);

        _randomize(BS2.control);
        _randomize(BS2.nrpn);

        console.groupEnd();

        updateUI();

        setStatus(`randomize done`);

        if (sendUpdate) updateDevice();

    }

    function resetGroup(e) {
        $(e.target).parent().find('[id^=cc-],[id^=nrpn-]').each(function(){
            let dom_id = this.id;
            if (dom_id.endsWith('-handle')) return;
            let v = getDefaultValue(dom_id);
            $(`#${dom_id}`).val(v).trigger('blur');
            sendToDevice(...dom_id.split('-'), v);
        });
        updateCustoms(false);
        //updateUI();
    }

    /**
     *
     */
    function syncUIwithBS2() {
        // ask the BS2 to send us its current patch:
        requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?
    }

    /**
     *
     */
    function setMidiChannel() {
        console.log(`set midi channel to ${this.value}`);
        midi_channel = this.value;
    }

    /**
     *
     */
    function setupCommands() {
        $('#cmd-sync').click(syncUIwithBS2);
        // $('#cmd-save').click(saveInLocalStorage);
        $('#cmd-export').click(exportToFile);
        $('#cmd-import').click(importFromFile);
        $('#cmd-send').click(updateDevice);
        $('#cmd-init').click(init);
        $('#cmd-randomize').click(randomizeBS2);
        $('#cmd-record').click(record);
        $('#cmd-play').click(play);
        $('#midi-channel').change(setMidiChannel);
        $('#patch-file').change(readFile);
    }

    /**
     *
     */
    function setupDials() {

        const CURSOR = 12;

        $(".dial").knob({
            // release : function (v) { console.log('release', this, v); },
            angleOffset: -135,
            angleArc: 270,
            bgColor: "#606060",
            fgColor: "#ffec03"
        });

        function _setup(controls) {

            for (let i=0; i < controls.length; i++) {

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                let e = $(`#${c.cc_type}-${i}`);

                if (!e.hasClass('dial')) continue;

                console.log(`configure #${c.cc_type}-${i}: max=${c.max_raw}`);

                e.trigger('configure', {
                    min: 0,
                    max: c.max_raw,
                    step: 1,
                    cursor: Math.min(...c.range) < 0 ? CURSOR : false,
                    format: v => c.human(v),
                    change : function (v) {
                        sendToDevice(c.cc_type, i, v);
                    },
                    //parse: function(v) { return parseInt(v); }
                });
            }
        }

        console.groupCollapsed('setupDials');

        _setup(BS2.control);
        _setup(BS2.nrpn);

        console.groupEnd();

    } // setupDials

    /**
     * Set value of the controls (input and select) from the BS2 values
     */
    function updateControls() {

        //FIXME: use c.raw_value

        console.groupCollapsed('updateControls()');

        function _updateControls(controls) {
            for (let i=0; i < controls.length; i++) {
                if (typeof controls[i] === 'undefined') continue;
                let e = $(`#${controls[i].cc_type}-${i}`);

                let v = BS2.getControlValue(controls[i]);

                if (e.is('select.cc')) {
                    console.log(`update select.cc #${controls[i].cc_type}-${i}`, e.val(), v);
                }

                e.val(BS2.getControlValue(controls[i])).trigger('blur');  //TODO: change or blur?
            }
        }

        _updateControls(BS2.control);
        _updateControls(BS2.nrpn);

        console.groupEnd();

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

        $('select.cc').change(function (){ sendToDevice(...this.id.split('-'), this.value) });

        // Osc: PS controls are only displayed when wave form is pulse
        $('#nrpn-72').change(function (e) { this.value == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc1-pw-controls') : disable('#osc1-pw-controls'); });
        $('#nrpn-82').change(function (e) { this.value == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc2-pw-controls') : disable('#osc2-pw-controls'); });

        // LFO: "sync" drop down is displayed only when speed/sync is set to sync
        $('#nrpn-88').change(function (e) { this.value == BS2.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-87') : disable('#nrpn-87'); });
        $('#nrpn-92').change(function (e) { this.value == BS2.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-91') : disable('#nrpn-91'); });


    } // setupSelects

    /**
     *
     * @param dom_id
     */
    function setupOnOffControl(dom_id) {
        $(`#${dom_id}-handle`).click(function() {
            let v = $(`#${dom_id}`).val();
            $(`#${dom_id}`).val(v == 0 ? 1 : 0);
            console.log('on_off click handler', dom_id, v, $(`#${dom_id}`).val());
            updateOnOffControl(dom_id);
        });
    }

    /**
     *
     * @param dom_id
     * @param sendUpdate
     */
    function updateOnOffControl(dom_id, sendUpdate = true) {   //}, prefix_text) {
        let e = $('#' + dom_id);
        toggleOnOff('#' + dom_id + '-handle', e.val() != 0);
        if (sendUpdate) sendToDevice(...dom_id.split('-'), e.val());
    }

    /**
     *
     */
    function setupCustoms() {
        setupOnOffControl('cc-110');
        setupOnOffControl('nrpn-89');
        setupOnOffControl('nrpn-93');
        setupOnOffControl('cc-108');
        setupOnOffControl('cc-109');
        setupOnOffControl('nrpn-106');
    }

    /**
     *
     */
    function updateCustoms(sendUpdate = false) {

        console.log(`updateCustoms(${sendUpdate})`);

        updateOnOffControl('cc-110', sendUpdate);  // Osc 1-2 Sync
        updateOnOffControl('nrpn-89', sendUpdate);
        updateOnOffControl('nrpn-93', sendUpdate);
        updateOnOffControl('cc-108', sendUpdate);
        updateOnOffControl('cc-109', sendUpdate);
        updateOnOffControl('nrpn-106', sendUpdate);

        $('#nrpn-72').val() == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc1-pw-controls') : disable('#osc1-pw-controls');
        $('#nrpn-82').val() == BS2.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc2-pw-controls') : disable('#osc2-pw-controls');

        // LFO: "sync" drop down is displayed only when speed/sync is set to sync
        $('#nrpn-88').val() == BS2.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-87') : disable('#nrpn-87');
        $('#nrpn-92').val() == BS2.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-91') : disable('#nrpn-91');

        drawADSR(BS2.getADSREnv('mod'), 'mod-ADSR');
        drawADSR(BS2.getADSREnv('amp'), 'amp-ADSR');

    }

    /**
     *
     */
    function updateMeta() {
        $('#patch-number').text(BS2.meta.patch_id.value + ': ' + BS2.meta.patch_name.value);
    }

    /**
     *
     */
    function setupUI() {
        setupDials();
        setupSelects();
        setupCustoms();
        setupCommands();
        init(false);     // init UI without sending any CC to the BS2
        $('h1.reset-handler').click(resetGroup);

        drawADSR(BS2.getADSREnv('mod'), 'mod-ADSR');
        drawADSR(BS2.getADSREnv('amp'), 'amp-ADSR');
    }

    /**
     *
     */
    function updateUI() {
        updateControls();
        updateCustoms();
        updateMeta();
    }

    function saveInLocalStorage() {
        alert('Sorry, this feature is not yet implemented.');
    }

    var lightbox = null;

    function importFromFile() {
        //alert('Sorry, this feature is not yet implemented.');
        $('#import-dialog-error').empty();
        $('#patch-file').val('');
        lightbox = lity('#import-dialog');
    }

    function exportToFile() {
        //alert('Sorry, this feature is not yet implemented.');

        //TODO: export as sysex

        var data = JSON.stringify(BS2);

        var element = document.createElement('a');
        //element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(data));
        element.setAttribute('href', 'data:application/json,' + encodeURIComponent(data));
        element.setAttribute('download', 'bs2-patch.json');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

    }

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
                if (BS2.setValuesFromSysex(data)) {
                    console.log('file read OK', BS2.meta.patch_name['value']);
                    if (lightbox) lightbox.close();

                    updateUI();
                    updateDevice();

                } else {
                    console.log('unable to set value from file');
                    $('#import-dialog-error').show().text('The file is invalid.');
                }
            };
            reader.readAsArrayBuffer(f);
        }

    }

    function record() {
        alert('Sorry, this feature is not yet implemented.');
    }

    function play() {
        alert('Sorry, this feature is not yet implemented.');
    }

    /**
     * Send a sysex to the BS2 asking for it to send back a sysex dump of its current patch.
     */
    function requestSysExDump() {
        // F0 00 20 29 00 33 00 40  F7
        if (!midi_output) return;
        //ignore_next_sysex = true;
        midi_output.sendSysex(BS2.meta.signature.sysex.value, [0x00, 0x33, 0x00, 0x40]);
    }


    //var device = BS2;
    var midi_input = null;
    var midi_output = null;
    var midi_channel = 1;
    var ignore_next_sysex = false;

    /**
     *
     * @param input
     */
    function connectInput(input) {
        console.log('connect input', input);
        midi_input = input;
        midi_input
            .on('controlchange', midi_channel, function(e) {
                handleCC(e);
            })
            .on('sysex', midi_channel, function(e) {
                if (ignore_next_sysex) {
                    setStatus("SysEx ignored.");
                    return;
                }
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
        console.log('connect output', output);
        midi_output = output;
        setStatus(`"${output.name}" output connected.`)
        setMidiOutStatus(true);

        // ask the BS2 to send us its current patch:
        requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?
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

            if (err) {

                console.log('webmidi err', err);

                setStatusError("ERROR: WebMidi could not be enabled.");

            } else {

                setStatus("WebMidi enabled.");
                setMidiStatus(true);

                // WebMidi.inputs.map(i => console.log("input: ", i));
                // WebMidi.outputs.map(i => console.log("output: ", i));

                WebMidi.addListener("connected", e => deviceConnect(e));
                WebMidi.addListener("disconnected", e => deviceDisconnect(e));

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

                // ask the BS2 to send us its current patch:
                requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?

            }

        }, true);   // pass true to enable sysex support

    });

