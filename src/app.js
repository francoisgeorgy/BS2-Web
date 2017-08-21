(function(){

    const VERSION = '1.2.1';

    console.log(`Bass Station II Web Interface ${VERSION}`);

    function toggleOnOff(selector, bool) {
        if (bool) {
            $(selector).removeClass("off").addClass("on");
        } else {
            $(selector).removeClass("on").addClass("off");
        }
    }

    function setMidiStatus(status) {
        // toggleOnOff('#midi-status', status);
        if (status) {
            $('#neon').addClass("glow");
        } else {
            $('#neon').removeClass("glow");
        }
    }

    function setMidiInStatus(status) {
        // toggleOnOff('#midi-in-status', status);
        if (status) {
            $('#neon').addClass("glow");
        } else {
            $('#neon').removeClass("glow");
        }
    }

    function setMidiOutStatus(status) {
        // toggleOnOff('#midi-out-status', status);
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

    var midi_out_messages = 0;
    var midi_in_messages = 0;

    function logOutgoingMidiMessage(type, control, value) {
        midi_out_messages++;
        $('#midi-messages-out').prepend(`<div>${type.toUpperCase()} ${control} ${value}</div>`);
        if (midi_out_messages > 100) $("#midi-messages-out div:last-child").remove();
    }

    function logIncomingMidiMessage(type, control, value) {
        midi_in_messages++;
        $('#midi-messages-in').prepend(`<div>${type.toUpperCase()} ${control} ${value}</div>`);
        if (midi_in_messages > 100) $("#midi-messages-in div:last-child").remove();
    }

    //==================================================================================================================

    /**
     * Draw a read-only (illustrative) ADSR envelope.
     * @param env
     * @param container_id
     */
    function drawADSR(env, container_id) {

        // console.log('drawADSR', env, container_id);
/*

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
        // ctx.strokeStyle = "#ffec03";
        ctx.strokeStyle = THEME[settings.theme].positiveColor;
        ctx.stroke();
        ctx.closePath();
*/
    }

    //==================================================================================================================
    // Midi messages handling

    var cc_expected = -1;
    var cc_msb = -1;
    var cc_lsb = -1;
    var value_msb = 0;    // msb to compute value
    var value_lsb = 0;    // lsb to compute value
    var nrpn = false;

    var knobs = [];
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
                let v = DEVICE.doubleByteValue(value_msb, value_lsb);
                dispatch('cc', cc_msb, v);
                cc_expected = -1;
            } else {
                cc_msb = cc;
            }
        } else {
            if (DEVICE.control[cc]) {
                if (DEVICE.control[cc].lsb === -1) {
                    let v = msg[2];
                    dispatch('cc', cc, v);
                } else {
                    cc_expected = DEVICE.control[cc].lsb;
                    cc_msb = cc;
                    value_msb = msg[2];
                }
            } else {
                console.warn(`unsupported CC: ${cc}`)
            }
        }
    }

    /**
     * Update DEVICE and associated on-screen control from CC or NRPN value.
     *
     * @param control_type
     * @param control_number
     * @param value
     */
    function dispatch(control_type, control_number, value) {

        console.log('dispatch', control_type, control_number, value, '#' + control_type + '-' + control_number);
        control_type = control_type.toLowerCase();

        if ((control_type != 'cc') && (control_type != 'nrpn')) return; //TODO: signal an error

        DEVICE.setControlValue(control_type, control_number, value);

        // the "blur" event will force a redraw of the dial. Do not send the "change" event as this will ping-pong between BS2 and this application.
        // let e = $('#' + control_type + '-' + control_number);
        // if (e.is('.dial')) {
        //     e.trigger('blur', { value });
        // } else {
        //     e.val(value).trigger('blur');
        // }

        let id = control_type + '-' + control_number;
        if (knobs.hasOwnProperty(id)) {
            knobs[id].value = value;
        } else {
            console.error(`expected knob ${id} not found`);
        }

        // update the customs UI elements. Any input|select element has already been updated by the above instruction.
        updateCustoms(/*false*/);   //TODO: pass the current CC number and in updateCustoms() only update controls linked to this CC number
    }

    //==================================================================================================================
    // Updating to the connected device

    /**
     * Send a control value to the connected device.
     * @param control
     */
    function sendSingleValue(control) {

        if (control.cc_type === 'cc') {
            let a = DEVICE.getMidiMessagesForNormalCC(control);
            for (let i=0; i<a.length; i++) {
                if (midi_output) {
                    console.log(`send CC ${a[i][0]} ${a[i][1]} (${control.name}) on channel ${midi_channel}`);
                    logOutgoingMidiMessage('cc', a[i][0], a[i][1]);
                    midi_output.sendControlChange(a[i][0], a[i][1], midi_channel);
                } else {
                    console.log(`(send CC ${a[i][0]} ${a[i][1]} (${control.name}) on channel ${midi_channel})`);
                }
            }
        } else if (control.cc_type === 'nrpn') {
            let value = DEVICE.getControlValue(control);
            if (midi_output) {
                console.log(`send NRPN ${control.cc_number} ${value} (${control.name}) on channel ${midi_channel}`);
                logOutgoingMidiMessage('nrpn', control.cc_number, value);
                midi_output.setNonRegisteredParameter([0, control.cc_number], value, midi_channel);  // for the BS2, the NRPN MSB is always 0
            } else {
                console.log(`(send NRPN ${control.cc_number} ${value} (${control.name}) on channel ${midi_channel})`);
            }
        }

    }

    /**
     * Send all values to the connected device
     */
    function updateConnectedDevice() {

        console.groupCollapsed(`updateConnectedDevice()`);

        setStatus(`Sending all values to ${DEVICE.name} ...`);

        function _send(controls) {
            for (let i=0; i < controls.length; i++) {
                if (typeof controls[i] === 'undefined') continue;
                sendSingleValue(controls[i]);
            }
        }

        _send(DEVICE.control);
        _send(DEVICE.nrpn);

        setStatus(`${DEVICE.name} updated.`);

        console.groupEnd();
    }

    //==================================================================================================================

    /**
     * Update the virtual DEVICE and the connected device.
     * Note: jQuery Knob transmits the value as a float
     *
     * Called by the onChange handlers of dials, switches and selects.
     *
     * @param control_type
     * @param control_number
     * @param value_float
     */
    function updateDevice(control_type, control_number, value_float) {

        let value = Math.round(value_float);

        console.log('updateDevice', control_type, control_number, value_float, value);

        let control = DEVICE.setControlValue(control_type, control_number, value);

        sendSingleValue(control);
    }

    /**
     * Handles (reacts to) a change made by the user in the UI.
     */
    function handleUIChange(control_type, control_number, value) {

        updateDevice(control_type, control_number, value);

        if (control_type === 'cc') {
            if ([102, 103, 104, 105].includes(control_number)) {
                drawADSR(DEVICE.getADSREnv('mod'), 'mod-ADSR');
            } else if ([90, 91, 92, 93].includes(control_number)) {
                drawADSR(DEVICE.getADSREnv('amp'), 'amp-ADSR');
            }
        }
    }

    //==================================================================================================================

    /**
     *
     */
    function init(sendUpdate = true) {

        console.log(`init(${sendUpdate})`);

        DEVICE.init();

        updateUI();

        setStatus(`init done`);

        if (sendUpdate) updateConnectedDevice();
    }

    /**
     *
     */
    function randomize() {

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

        console.groupCollapsed(`randomize`);

        // concatenate the indexes of the controls/nrpns set for randomization:
        let randomize_controls = [];
        let randomize_nrpns = [];
        for (let i=0; i<settings.randomize.length; i++) {
            randomize_controls.push(...BS2.control_groups[settings.randomize[i]].controls);
            randomize_nrpns.push(...BS2.control_groups[settings.randomize[i]].nrpns);
        }

        _randomize(DEVICE.control.filter((element, index) => randomize_controls.includes(index)));
        _randomize(DEVICE.nrpn.filter((element, index) => randomize_nrpns.includes(index)));

        console.groupEnd();

        updateUI();

        setStatus(`randomize done`);

        updateConnectedDevice();

    }

    //==================================================================================================================
    // Re-init (reset) only a group or related controls:

    /**
     *
     * @param dom_id ID of the HTML element
     * @returns {*}
     */
    function getDefaultValue(dom_id) {
        let [control_type, control_number] = dom_id.replace('#', '').split('-');
        let c;
        if (control_type == 'cc') {
            c = DEVICE.control[control_number];
        } else if (control_type == 'nrpn') {
            c = DEVICE.nrpn[control_number];
        } else {
            // ERROR
            return 0;
        }
        //FIXME: check that c exists
        return c.init_value;
    }

    /**
     *
     * @param e
     */
    function resetGroup(e) {
        $(e.target).parent().find('[id^=cc-],[id^=nrpn-]').each(function(){
            let dom_id = this.id;
            if (dom_id.endsWith('-handle')) return;
            let value = getDefaultValue(dom_id);

            // update the control
            let e = $(`#${dom_id}`);
            if (e.is('.dial')) {
                e.trigger('blur', { value });
            } else {
                e.val(value).trigger('blur');
            }

            // update the connected device
            handleUIChange(...dom_id.split('-'), value);
        });
        updateCustoms(/*false*/);
        //updateUI();
    }

    //==================================================================================================================

    /**
     * Set value of the controls (input and select) from the BS2 values
     */
    function updateControls() {

        console.groupCollapsed('updateControls()');

        function _updateControls(controls) {
            for (let i=0; i < controls.length; i++) {
                if (typeof controls[i] === 'undefined') continue;
                console.log(`update #${controls[i].cc_type}-${i}`);
                let e = $(`#${controls[i].cc_type}-${i}`);
                if (e.is('.knob-only')) {
                    //e.trigger('blur', { value: DEVICE.getControlValue(controls[i]) });

                    let id = `${controls[i].cc_type}-${i}`;
                    if (knobs.hasOwnProperty(id)) {
                        knobs[id].value = DEVICE.getControlValue(controls[i]);
                    } else {
                        console.error(`expected knob ${id} not found`);
                    }

                } else {
                    e.val(DEVICE.getControlValue(controls[i])).trigger('blur');
                }
            }
        }

        _updateControls(DEVICE.control);
        _updateControls(DEVICE.nrpn);

        console.groupEnd();

    } // updateControls()

    /**
     *
     */
    /*
    function setupDials() {

        const CURSOR = 12;

        $(".dial").knob({
            // release : function (v) { console.log('release', this, v); },
            angleOffset: -135,
            angleArc: 270,
            bgColor: THEME[settings.theme].bgColor,
            fgColor: THEME[settings.theme].fgColor,
            innerColor: THEME[settings.theme].innerColor,
            positiveColor: THEME[settings.theme].positiveColor,
            negativeColor: THEME[settings.theme].negativeColor
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
                        handleUIChange(c.cc_type, i, v);
                    }   //,
                    //parse: v => c.parse(v)
                });
            }
        }

        console.groupCollapsed('setupDials');

        _setup(DEVICE.control);
        _setup(DEVICE.nrpn);

        console.groupEnd();

    } // setupDials
    */

    /**
     *
     */
    function setupKnobs() {

        const CURSOR = 12;
        //
        // [].forEach.call(document.querySelectorAll('svg.knob-only'), function(element) {
        //
        //     // console.log(element.id);
        //
        //     knobs[element.id] = new knob(element, {with_label: false, cursor: 50});
        //     // element.addEventListener("change", function(event) {
        //     //     document.getElementById('v-' + element.id).innerHTML = event.detail;
        //     // });
        // });

        // $(".dial").knob({
        //     // release : function (v) { console.log('release', this, v); },
        //     angleOffset: -135,
        //     angleArc: 270,
        //     bgColor: THEME[settings.theme].bgColor,
        //     fgColor: THEME[settings.theme].fgColor,
        //     innerColor: THEME[settings.theme].innerColor,
        //     positiveColor: THEME[settings.theme].positiveColor,
        //     negativeColor: THEME[settings.theme].negativeColor
        // });

        function _setup(controls) {

            for (let i=0; i < controls.length; i++) {

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                // let e = $(`#${c.cc_type}-${i}`);
                //
                // if (!e.hasClass('dial')) continue;

                let id = `${c.cc_type}-${i}`;

                let elem = document.getElementById(id);

                if (elem === null) continue;

                if (!elem.classList.contains("knob-only")) continue;

                console.log(`configure #${id}: max=${c.max_raw}`);

                knobs[id] = new knob(elem, {
                    with_label: false,
                    cursor: 50,
                    value_min: 0,
                    value_max: c.max_raw,
                    value_resolution: 1,
                    center_zero: Math.min(...c.range) < 0,
                    format: v => c.human(v)
                });

                elem.addEventListener("change", function(event) {
                    //document.getElementById('v-' + element.id).innerHTML = event.detail;
                    console.log(event);
                    handleUIChange(c.cc_type, i, event.detail);
                });

                // knobs[id].addEventListener("change", function(event) {
                //     // let v = parseFloat(this.value);
                //     // if (!isNaN(v)) {
                //     //     my_knobs['knob7'].value = v;
                //     // }
                //     handleUIChange(c.cc_type, i, v);
                // });



/*
                e.trigger('configure', {
                    min: 0,
                    max: c.max_raw,
                    step: 1,
                    cursor: Math.min(...c.range) < 0 ? CURSOR : false,
                    format: v => c.human(v),
                    change : function (v) {
                        handleUIChange(c.cc_type, i, v);
                    }   //,
                    //parse: v => c.parse(v)
                });
*/
            }
        }

        console.groupCollapsed('setupKnobs');

        _setup(DEVICE.control);
        _setup(DEVICE.nrpn);

        console.groupEnd();

    } // setupKnobs


    function setupSwitches() {

        // SUB
        $('#cc-80').append(DEVICE.SUB_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `cc-80-${i}`).data("control", "cc-80").data("value", i).text(o).addClass("bt");
        }));
        $('#cc-81').append(Object.entries(DEVICE.SUB_OCTAVE).map((o,i) => {
            return $("<div>").attr("id", `cc-81-${i}`).data("control", "cc-81").data("value", o[0]).text(o[1]).addClass("bt");
        }));

        // OSC 1
        $('#cc-70').append(Object.entries(DEVICE.OSC_RANGES).map((o,i) => {
            return $("<div>").attr("id", `cc-70-${i}`).data("control", "cc-70").data("value", o[0]).text(o[1]).addClass("bt");
        }));
        $('#nrpn-72').append(DEVICE.OSC_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `nrpn-72-${i}`).data("control", "nrpn-72").data("value", i).text(o).addClass("bt");
        }));

        // OSC 2
        $('#cc-75').append(Object.entries(DEVICE.OSC_RANGES).map((o,i) => {
            return $("<div>").attr("id", `cc-75-${i}`).data("control", "cc-75").data("value", o[0]).text(o[1]).addClass("bt");
        }));
        $('#nrpn-82').append(DEVICE.OSC_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `nrpn-82-${i}`).data("control", "nrpn-82").data("value", i).text(o).addClass("bt");
        }));

        // LFO 1
        $('#cc-88').append(DEVICE.LFO_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `cc-88-${i}`).data("control", "cc-88").data("value", i).text(o).addClass("bt");
        }));

        // LFO 2
        $('#cc-89').append(DEVICE.LFO_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `cc-89-${i}`).data("control", "cc-89").data("value", i).text(o).addClass("bt");
        }));

        // FILTER
        $('#cc-83').append(DEVICE.FILTER_TYPE.map((o,i) => {
            return $("<div>").attr("id", `cc-83-${i}`).data("control", "cc-83").data("value", i).text(o).addClass("bt");
        }));
        $('#cc-84').append(DEVICE.FILTER_SHAPES.map((o,i) => {
            return $("<div>").attr("id", `cc-84-${i}`).data("control", "cc-84").data("value", i).text(o).addClass("bt");
        }));
        $('#cc-106').append(DEVICE.FILTER_SLOPE.map((o,i) => {
            return $("<div>").attr("id", `cc-106-${i}`).data("control", "cc-106").data("value", i).text(o).addClass("bt");
        }));

/*
        $('#nrpn-88,#nrpn-92').append(DEVICE.LFO_SPEED_SYNC.map((o,i) => { return $("<option>").val(i).text(o); }));
        $('#nrpn-87,#nrpn-91').append(DEVICE.LFO_SYNC.map((o,i) => { return $("<option>").val(i).html(o); }));

        $('#nrpn-73,#nrpn-105').append(DEVICE.ENV_TRIGGERING.map((o,i) => { return $("<option>").val(i).text(o); }));

        // Osc 1+2: PS controls are only displayed when wave form is pulse
        $('#nrpn-72').change(function (e) { this.value == DEVICE.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc1-pw-controls') : disable('#osc1-pw-controls'); });
        $('#nrpn-82').change(function (e) { this.value == DEVICE.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc2-pw-controls') : disable('#osc2-pw-controls'); });

        // LFO: "sync" drop down is displayed only when speed/sync is set to sync
        $('#nrpn-88').change(function (e) { this.value == DEVICE.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-87') : disable('#nrpn-87'); });
        $('#nrpn-92').change(function (e) { this.value == DEVICE.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-91') : disable('#nrpn-91'); });
*/

        // "radio button"-like behavior:
        $('div.bt').click(function(e) {
            let d = $(this).data();
            let c = d['control'];
            let v = d['value'];
            console.log(`click on ${c} with value ${v}`, this, $(this).siblings());
            //let e = $(this);
            if (!this.classList.contains("on")) {   // if not already on...
                $(this).siblings(".bt").removeClass("on");
                this.classList.add("on");
                handleUIChange(...c.split('-'), v);
            }
        });

        // "checkbox"-like behavior:
        $('div.btc').click(function(e) {
            // let d = $(this).data();
            // let c = d['control'];
            // let v = d['value'];
            // console.log(`click on ${c} with value ${v}`, this, $(this).siblings());

            let v = 0;

            if (this.classList.contains("on")) {
                this.classList.remove("on");
            } else {
                this.classList.add("on");
                v = 1;
            }
            handleUIChange(...this.id.split('-'), v);

        });


    }


    /**
     *
     */
    function setupSelects() {



        // ARP OCTAVE
        $('#cc-111').append(DEVICE.ARP_OCTAVES.map((o,i) => { return $("<option>").val(i).text(o); }));

        // ARP NOTES
        $('#cc-118').append(DEVICE.ARP_NOTES_MODE.map((o,i) => { return $("<option>").val(i).text(o); }));

        // ARP RHYTHM
        for (let i=0; i<32; i++) {
            $('#cc-119').append($("<option>").val(i).text(i+1));
        }

        $('select.cc').change(function (){ handleUIChange(...this.id.split('-'), this.value) });




    } // setupSelects



    /**
     * Update the visual of the switch after an action by the user or a change transmitted by the connected device.
     * @param dom_id
     * @param sendUpdate
     */
    function updateSwitch(dom_id, send_to_device = false) {
        let e = $('#' + dom_id);                                // get the hidden input field of this switch
        toggleOnOff('#' + dom_id + '-handle', e.val() != 0);    // update the switch UI
        console.log('updateSwitch', send_to_device);
        if (send_to_device) handleUIChange(...dom_id.split('-'), e.val());  // update switch UI and the device too
    }

    const SWITCHES = ['cc-110', 'nrpn-89', 'nrpn-93', 'cc-108', 'cc-109', 'nrpn-106'];

    /**
     * Add the click handler to the switches represented by the ids array
     * @param ids
     */
    /*
    function setupSwitches(ids) {
        for (let i=0; i<ids.length; i++) {
            let dom_id = ids[i];

            // let e = $('#' + dom_id);                                // get the hidden input field of this switch
            // toggleOnOff(`#${dom_id}-handle`, e.val() != 0);    // update the switch UI

            $(`#${dom_id}-handle`).click(function () {
                let elem = $(`#${dom_id}`);
                let v = elem.val();
                elem.val(v == 0 ? 1 : 0);
                // console.log('switch click handler', dom_id, v, elem.val());
                updateSwitch(dom_id, true);
            });
        }
    }
    */

    /**
     * Update the "custom" or "linked" UI controls
     */
    function updateCustoms() {

        console.groupCollapsed(`updateCustoms()`);

        SWITCHES.forEach((currentValue, index, array) => updateSwitch(currentValue, false));

        // Osc 1+2: PS controls are only displayed when wave form is pulse
        $('#nrpn-72').val() == DEVICE.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc1-pw-controls') : disable('#osc1-pw-controls');
        $('#nrpn-82').val() == DEVICE.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc2-pw-controls') : disable('#osc2-pw-controls');

        // LFO: "sync" drop down is displayed only when speed/sync is set to sync
        $('#nrpn-88').val() == DEVICE.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-87') : disable('#nrpn-87');
        $('#nrpn-92').val() == DEVICE.LFO_SPEED_SYNC.indexOf('sync') ? enable('#nrpn-91') : disable('#nrpn-91');

        drawADSR(DEVICE.getADSREnv('mod'), 'mod-ADSR');
        drawADSR(DEVICE.getADSREnv('amp'), 'amp-ADSR');

        console.groupEnd();

    }

    /**
     * Update the patch number and patch name displayed in the header.
     */
    function updateMeta() {
        $('#patch-number').text(DEVICE.meta.patch_id.value + ': ' + DEVICE.meta.patch_name.value);
    }

    /**
     * Update the UI from the DEVICE controls values.
     */
    function updateUI() {
        updateControls();
        updateCustoms();
        updateMeta();
        updateCommands();
    }

    /**
     * Initial setup of the UI.
     * Does a DEVICE.init() too, but only the virtual DEVICE; does not send any CC to the connected device.
     */
    function setupUI() {

        console.groupCollapsed("setupUI");

        $('span.version').text(VERSION);

        setMidiStatus(false);
        setMidiInStatus(false);
        setMidiOutStatus(false);

        setupSettings();    // must be done before loading the settings
        loadSettings();

        // $("link#themesheet").attr("href", THEME[settings.theme].href);
        // $("#theme-choice").val(settings.theme);

        setupKnobs();
        setupSwitches();
        setupSelects();
        // setupSwitches(SWITCHES);
        setupCommands();
        updateCommands();

        init(false);    // init DEVICE then UI without sending any CC to the DEVICE

        console.groupEnd();

    }

    //==================================================================================================================
    // Patch file handling

    var lightbox = null;

    function settingsDialog() {
        $('#settings-dialog-error').empty();
        // $('#patch-file').val('');
        lightbox = lity('#settings-dialog');
    }


    function importFromFile() {
        $('#import-dialog-error').empty();
        $('#patch-file').val('');
        lightbox = lity('#import-dialog');
    }

    /**
     * Handler for the #patch-file file input element in #import-dialog
     */
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
                if (DEVICE.setValuesFromSysex(data)) {
                    console.log('file read OK', DEVICE.meta.patch_name['value']);
                    if (lightbox) lightbox.close();

                    updateUI();
                    updateConnectedDevice();

                } else {
                    console.log('unable to set value from file');
                    $('#import-dialog-error').show().text('The file is invalid.');
                }
            };
            reader.readAsArrayBuffer(f);
        }
    }

    //==================================================================================================================
    // UI main commands (buttons in header)

    /*
    function exportLastDumpToFile() {

        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(last_sysex_data));
        element.setAttribute('download', 'bs2-patch.syx');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    */

    /**
     * header's "export" button handler
     */
    function exportToFile() {

        //TODO: export as sysex

        ignore_next_sysex = true;   // we want a sysex to get the data but we don't want to update the UI
        var sysex_received_callback = function (data) {

            var element = document.createElement('a');
            element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(data));
            element.setAttribute('download', 'bs2-patch.syx');

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        };

        requestSysExDump();

    }

    /*
    function exportToJSOONFile() {

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
    */

    /**
     * header's "sync" button handler
     */
    function syncUIwithBS2() {
        // ask the BS2 to send us its current patch:
        requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?
    }

    /**
     * header's "save" button handler
     */
    function saveInLocalStorage() {
        alert('Sorry, this feature is not yet implemented.');
    }

    /**
     * header's "record" button handler
     */
    function record() {
        alert('Sorry, this feature is not yet implemented.');
    }

    /**
     * header's "play" button handler
     */
    function play() {
        alert('Sorry, this feature is not yet implemented.');
    }

    /**
     * header's "midi channel" select handler
     */
    function setMidiChannel() {
        console.log(`set midi channel to ${this.value}`);
        midi_channel = this.value;
    }

    /**
     *
     */
    function updateCommands() {
        toggleOnOff('#cmd-sync', !!midi_output);
        toggleOnOff('#cmd-send', !!midi_output);
        // toggleOnOff('#cmd-export', !!midi_output);
    }

    /**
     *
     */
    function setupCommands() {
        console.log('setupCommands');
        $('#cmd-sync').click(syncUIwithBS2);
        $('#cmd-send').click(updateConnectedDevice);
        $('#cmd-init').click(init);
        $('#cmd-randomize').click(randomize);
        // $('#cmd-save').click(saveInLocalStorage);
        $('#cmd-import').click(importFromFile);
        // $('#cmd-export').click(exportToFile);    //TODO: fixme
        // $('#cmd-record').click(record);
        // $('#cmd-play').click(play);
        $('#cmd-settings').click(settingsDialog);
        $('#midi-channel').change(setMidiChannel);
        $('#patch-file').change(readFile);
        $('h1.reset-handler').click(resetGroup);
    }

    //==================================================================================================================
    // Settings
/*
    const THEME = {
        "dark": {
            href: "css/dark-theme.css",
            bgColor: "#606060",
            fgColor: "#fff",
            innerColor: "#272727",
            positiveColor: "#ffea00",
            negativeColor: "#ccbb00"
        },
        "light": {
            href: "css/light-theme.css",
            bgColor: "#ddd",
            fgColor: "#333",
            innerColor: "#eee",
            positiveColor: "#005b80",
            negativeColor: "#0080b3"
        }
    };
*/
    var settings = {
        randomize: [] //,
  //      theme: "light"
    };

    function loadSettings() {
        Object.assign(settings, Cookies.getJSON('settings'));
        // 1. reset all checkboxes:
        $('input.chk-rnd').prop('checked', false);
        // 2. then, select those that need to be:
        for (let i=0; i<settings.randomize.length; i++) {
            $(`input:checkbox[name=${settings.randomize[i]}]`).prop('checked', true);
        }
    }

    function setupSettings() {

        console.group("setupSettings");

        displayRandomizerSettings();

        console.log("settings cookie", Cookies.getJSON());

        $('input.chk-rnd').change(
            function() {
                let checked = []
                $("input.chk-rnd:checked").each(function () {
                    checked.push(this.name);
                });
                // let checked = $("input.chk-rnd:checked").map(function() { return $(this).name }).get();
                settings.randomize = checked;
                console.log('save settings', settings);
                Cookies.set('settings', settings);
            }
        );
/*
        $('#theme-choice').change(
            function() {
                settings.theme = this.value;
                $("link#themesheet").attr("href", THEME[settings.theme].href);
                window.location.reload();
                Cookies.set('settings', settings);
            }
        );
*/

        console.groupEnd();

    }

    function displayRandomizerSettings() {
        let groups = Object.getOwnPropertyNames(BS2.control_groups);
        const COLS = 5;
        let i = 0;
        let html = '<table><tr>';
        for (group of groups) {
            i++;
            let g = BS2.control_groups[group];
            html += `<td><input type="checkbox" class="chk-rnd" name="${group}" checked="checked" value="1" />${g.name}</td>`;
            if (i % COLS === 0) html += '</tr><tr>';
        }
        html += '</tr></table>';
        $('#randomizer-settings').html(html);
    }

    //==================================================================================================================
    // SysEx

    /**
     * Send a sysex to the BS2 asking for it to send back a sysex dump of its current patch.
     * F0 00 20 29 00 33 00 40  F7
     */
    function requestSysExDump() {
        if (!midi_output) return;
        //ignore_next_sysex = true;
        midi_output.sendSysex(DEVICE.meta.signature.sysex.value, [0x00, 0x33, 0x00, 0x40]);
    }

    //==================================================================================================================
    // WebMidi events handling

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
                console.log('sysex handler');
                last_sysex_data = e.data;   // we keep it here because we may use it as data for the "export" command
                // if (sysex_received_callback) {
                //     console.log('sysex_received_callback is defined');
                //     sysex_received_callback(last_sysex_data);   // FIXME: not a very good solution
                //     sysex_received_callback = null;
                // }
                if (ignore_next_sysex) {
                    setStatus("SysEx ignored.");
                    return;
                }
                if (DEVICE.setValuesFromSysex(e.data)) {
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
        requestSysExDump(); //FIXME: what if the midi_input is not yet ready?
    }

    /**
     *
     * @param info
     */
    function deviceConnect(info) {
        console.log('deviceConnect', info);
        if ((info.name !== DEVICE.name_device_in) && (info.name !== DEVICE.name_device_out)) {
            return;
        }
        if (info.hasOwnProperty('input') && info.input && (info.name === DEVICE.name_device_in)) {
            if (!midi_input) connectInput(info.input);
        }
        if (info.hasOwnProperty('output') && info.output && (info.name === DEVICE.name_device_out)) {
            if (!midi_output) connectOutput(info.output);
        }
    }

    /**
     *
     * @param info
     */
    function deviceDisconnect(info) {
        console.log('deviceDisconnect', info);
        if ((info.name !== DEVICE.name_device_in) && (info.name !== DEVICE.name_device_out)) {
            console.log(`disconnect event ignored for device ${info.name}`);
            return;
        }
        if (info.name === DEVICE.name_device_in) {
            midi_input = null;
            setStatus(`${DEVICE.name_device_in} has been disconnected.`)
            setMidiInStatus(false);
        }
        if (info.name === DEVICE.name_device_out) {
            midi_output = null;
            setMidiOutStatus(false);
        }
    }

    //==================================================================================================================
    // Main

    const DEVICE = BS2;
    var midi_input = null;
    var midi_output = null;
    var midi_channel = 1;
    var ignore_next_sysex = false;
    var sysex_received_callback = false;
    var last_sysex_data = null;     // last sysex dump received
    //
    // var knobs = {};
    var envelopes = {};


    /**
     *
     */
    $(function () {

        console.log('app starting...');


        [].forEach.call(document.querySelectorAll('svg.envelope'), function(element) {
            envelopes[element.id] = new envelope(element, {});
        });
        //
        // var k1 = new knob(document.getElementById('knob1'), {});
        // var k2 = new knob(document.getElementById('knob2'), {
        //     with_label: false,
        //     default_value: 50,
        //     cursor: 50
        // });

        // var knobs = {};
        // [].forEach.call(document.querySelectorAll('svg.knob-only'), function(element) {
        //     knobs[element.id] = new knob(element, {with_label: false, cursor: 50});
        //     // element.addEventListener("change", function(event) {
        //     //     document.getElementById('v-' + element.id).innerHTML = event.detail;
        //     // });
        // });

/*
        var k = new knob(document.getElementById('knob1'), {
            // arcMin: 30,
            // cursor_dot_size: 10,
            // cursor_start: 10,
            // cursor_end: 20,
            default_value: 50
        });
*/
        // console.log(k1);
        // console.log(k2);


        setupUI();

        setStatus("Waiting for MIDI interface...");

        WebMidi.enable(function (err) {

            if (err) {

                console.log('webmidi err', err);

                setStatusError("ERROR: WebMidi could not be enabled.");

            } else {

                console.log('webmidi ok');

                setStatus("WebMidi enabled.");
                setMidiStatus(true);

                // WebMidi.inputs.map(i => console.log("input: ", i));
                // WebMidi.outputs.map(i => console.log("output: ", i));

                WebMidi.addListener("connected", e => deviceConnect(e));
                WebMidi.addListener("disconnected", e => deviceDisconnect(e));

                let input = WebMidi.getInputByName(DEVICE.name_device_in);
                if (input) {
                    connectInput(input);
                } else {
                    setStatusError(`${DEVICE.name_device_in} not found.`)
                    setMidiInStatus(false);
                }

                let output = WebMidi.getOutputByName(DEVICE.name_device_out);
                if (output) {
                    connectOutput(output);
                } else {
                    setStatusError(`${DEVICE.name_device_in} not found.`)
                    setMidiOutStatus(false);
                }

                // ask the BS2 to send us its current patch:
                requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?

            }

        }, true);   // pass true to enable sysex support

    });

})(); // Call the anonymous function once, then throw it away!
