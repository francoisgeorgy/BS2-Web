(function(){

    const VERSION = '2.0.0';

    const URL_PARAM_SYSEX = 'sysex';    // name of sysex parameter in the query-string

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
        console.log(msg);
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
        //TODO
        // midi_out_messages++;
        // $('#midi-messages-out').prepend(`<div>${type.toUpperCase()} ${control} ${value}</div>`);
        // if (midi_out_messages > 100) $("#midi-messages-out div:last-child").remove();
        if (midi_window) {
            $('#midi-messages-out', midi_window.document).prepend(`<div>${type.toUpperCase()} ${control} ${value}</div>`);
        }
    }

    function logIncomingMidiMessage(type, control, value) {
        //TODO
        // midi_in_messages++;
        //
        // if (midi_in_messages > 100) $("#midi-messages-in div:last-child").remove();
        if (midi_window) {
            $('#midi-messages-in', midi_window.document).prepend(`<div>${type.toUpperCase()} ${control} ${value}</div>`);
        }
    }

    //==================================================================================================================


    /**
     * Get a link for the current patch
     *
     */
    function getCurrentPatchAsLink() {
        // window.location.href.split('?')[0] is the current URL without the query-string if any
        return window.location.href.split('?')[0] + '?' + URL_PARAM_SYSEX + '=' + Utils.toHexString(DEVICE.getSysExDump());
    }

    //==================================================================================================================
    // Midi messages handling

    var cc_expected = -1;
    var cc_msb = -1;
    var cc_lsb = -1;
    var value_msb = 0;    // msb to compute value
    var value_lsb = 0;    // lsb to compute value
    var nrpn = false;
    var last_note = null;

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

        updateControl(control_type, control_number, value);

        // update the customs UI elements. Any input|select element has already been updated by the above instruction.
        updateLinkedUIElements(/*false*/);   //TODO: pass the current CC number and in updateCustoms() only update controls linked to this CC number
    }

    /**
     *
     * @param control_type
     * @param control_number
     * @param value
     */
    function updateControl(control_type, control_number, value) {

        console.log(`updateControl(${control_type}, ${control_number}, ${value})`);

        let id = control_type + '-' + control_number;
        if (knobs.hasOwnProperty(id)) {
            knobs[id].value = value;
        } else {
            console.log(`check #${id}`);
            let c = $(`#${id}`);
            if (c.length) {
                console.log(`#${id} found`, c);
                if (c.is('.slider')) {
                    updateSlider(id, value);
                } else if (c.is('.btc')) {
                    updateToggleSwitch(id, value);
                } else {
                    c.val(value).trigger('blur');
                    //console.error(`unknown control ${id}`);
                }
            } else {
                console.log(`check #${id}-${value}`);
                c = $(`#${id}-${value}`);
                if (c.length) {
                    console.log(c);
                    if (c.is('.bt')) {
                        updateOptionSwitch(id + '-' + value, value);
                    } else {
                        c.val(value).trigger('blur');
                        //console.error(`unknown control ${id}`);
                    }
                } else {
                    console.warn(`no control for ${id}-${value}`);
                }
            }
        }
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
                    logOutgoingMidiMessage('cc', a[i][0], a[i][1]);

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

        console.log(`handleUIChange(${control_type}, ${control_number}, ${value})`);

        updateDevice(control_type, control_number, value);

        if (control_type === 'cc') {
            if (['102', '103', '104', '105'].includes(control_number)) {
                //drawADSR(DEVICE.getADSREnv('mod'), 'mod-ADSR');
                envelopes['mod-envelope'].envelope = DEVICE.getADSREnv('mod');
            } else if (['90', '91', '92', '93'].includes(control_number)) {
                console.log('redraw amp env', envelopes);
                //drawADSR(DEVICE.getADSREnv('amp'), 'amp-ADSR');
                envelopes['amp-envelope'].envelope = DEVICE.getADSREnv('amp');
            }
        }
    }

    //==================================================================================================================

    /**
     *
     */
    function init(sendUpdate = true) {
        console.group(`init(${sendUpdate})`);
        DEVICE.init();
        updateUI();
        setStatus(`init done`);
        if (sendUpdate) updateConnectedDevice();
        console.groupEnd();
    }

    /**
     *
     */
    function randomize() {
        console.groupCollapsed(`randomize`);
        DEVICE.randomize(settings.randomize);
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
/*
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
*/

    /**
     *
     * @param e
     */
/*
    function resetGroup(e) {
        $(e.target).parents('.group').find('[id^=cc-],[id^=nrpn-]').each(function(){

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
        updateLinkedUIElements();
    }
*/
    //==================================================================================================================

    /**
     * Set value of the controls (input and select) from the BS2 values
     */
    function updateControls() {

        console.groupCollapsed('updateControls()');

        function _updateControls(controls) {
            for (let i=0; i < controls.length; i++) {
                if (typeof controls[i] === 'undefined') continue;
                updateControl(controls[i].cc_type, i, DEVICE.getControlValue(controls[i]));
            }
        }

        _updateControls(DEVICE.control);
        _updateControls(DEVICE.nrpn);

        console.groupEnd();

        console.log('updateControls() done');

    } // updateControls()

    /**
     *
     */
    function setupKnobs() {

        function _setupKnob(id, c, v) {

            let elem = document.getElementById(id);

            if (elem === null) return;

            if (!elem.classList.contains("knob")) return;

            console.log(`configure #${id}: range=${c.cc_range}, init-value=${v}`);

            knobs[id] = new knob(elem, {
                with_label: false,
                cursor: 50,
                // value_min: 0,
                // value_max: c.max_raw,
                value_min: Math.min(...c.cc_range),
                value_max: Math.max(...c.cc_range),
                value_resolution: 1,
                default_value: v,
                center_zero: Math.min(...c.range) < 0,
                format: v => c.human(v),
                track_color_init: '#999',
                track_color: '#bbb'
            });

            elem.addEventListener("change", function(event) {
                //document.getElementById('v-' + element.id).innerHTML = event.detail;
                console.log(event);
                handleUIChange(c.cc_type, c.cc_number /*i*/, event.detail);
            });
        }

        function _setup(controls) {

            for (let i=0; i < controls.length; i++) {

                let c = controls[i];
                if (typeof c === 'undefined') continue;

                // let e = $(`#${c.cc_type}-${i}`);
                //
                // if (!e.hasClass('dial')) continue;

                console.log(`${c.cc_type}-${c.cc_number} (${i})`);

                let id = `${c.cc_type}-${c.cc_number}`;
                _setupKnob(id, c, DEVICE.getControlValue(controls[i]));
            }
        }

        console.groupCollapsed('setupKnobs');

        _setup(DEVICE.control);
        _setup(DEVICE.nrpn);

        // setup dual knobs:
        // _setupKnob('cc-18_nrpn-87', DEVICE.control[18]);    // LFO1 Speed/Sync
        // _setupKnob('cc-19_nrpn-91', DEVICE.control[19]);    // LFO2 Speed/Sync

        console.groupEnd();

    } // setupKnobs


    function setupSwitches() {

        //TODO: remove .data(...)

        // SUB
        $('#cc-80-options').append(DEVICE.SUB_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `cc-80-${i}`).data("control", "cc-80").data("value", i).text(o).addClass("bt");
        }));
        // we display the value in reverse order to be like the real BS2
        // m = DEVICE.SUB_OCTAVE.length - 1;
        console.log(Object.entries(DEVICE.SUB_OCTAVE));
        // $('#cc-81-options').append(Object.entries(DEVICE.SUB_OCTAVE).map((o,i) => {
        //     return $("<div>").attr("id", `cc-81-${o[0]}`).data("control", "cc-81").data("value", o[0]).text(o[1]).addClass("bt");
        $('#cc-81-options').append(Object.entries(DEVICE.SUB_OCTAVE).slice(0).reverse().map((o,i) => {
            return $("<div>").attr("id", `cc-81-${o[0]}`).data("control", "cc-81").data("value", o[0]).text(o[1]).addClass("bt");
        }));

        // OSC 1
        $('#cc-70-options').append(Object.entries(DEVICE.OSC_RANGES).map((o,i) => {
            return $("<div>").attr("id", `cc-70-${o[0]}`).data("control", "cc-70").data("value", o[0]).text(o[1]).addClass("bt");
        }));
        $('#nrpn-72-options').append(DEVICE.OSC_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `nrpn-72-${i}`).data("control", "nrpn-72").data("value", i).text(o).addClass("bt");
        }));

        // OSC 2
        $('#cc-75-options').append(Object.entries(DEVICE.OSC_RANGES).map((o,i) => {
            return $("<div>").attr("id", `cc-75-${o[0]}`).data("control", "cc-75").data("value", o[0]).text(o[1]).addClass("bt");
        }));
        $('#nrpn-82-options').append(DEVICE.OSC_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `nrpn-82-${i}`).data("control", "nrpn-82").data("value", i).text(o).addClass("bt");
        }));

        // LFO 1
        $('#cc-88-options').append(DEVICE.LFO_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `cc-88-${i}`).data("control", "cc-88").data("value", i).text(o).addClass("bt");
        }));

        // LFO 2
        $('#cc-89-options').append(DEVICE.LFO_WAVE_FORMS.map((o,i) => {
            return $("<div>").attr("id", `cc-89-${i}`).data("control", "cc-89").data("value", i).text(o).addClass("bt");
        }));

        // FILTER
        $('#cc-83-options').append(DEVICE.FILTER_TYPE.map((o,i) => {
            return $("<div>").attr("id", `cc-83-${i}`).data("control", "cc-83").data("value", i).text(o).addClass("bt");
        }));
        $('#cc-84-options').append(DEVICE.FILTER_SHAPES.map((o,i) => {
            return $("<div>").attr("id", `cc-84-${i}`).data("control", "cc-84").data("value", i).text(o).addClass("bt");
        }));
        $('#cc-106-options').append(DEVICE.FILTER_SLOPE.map((o,i) => {
            return $("<div>").attr("id", `cc-106-${i}`).data("control", "cc-106").data("value", i).text(o).addClass("bt");
        }));

        // MOD ENV
        // we display the value in reverse order to be like the real BS2
        m = DEVICE.ENV_TRIGGERING.length - 1;
        $('#nrpn-105-options').append(DEVICE.ENV_TRIGGERING.slice(0).reverse().map((o,i) => {
            return $("<div>").attr("id", `nrpn-105-${m-i}`).data("control", "nrpn-105").data("value", m-i).text(o).addClass("bt");
        }));

        //TODO: mod env triggering is overriden by (or the same as) amp env triggering?

        // AMP ENV
        // we display the value in reverse order to be like the real BS2
        m = DEVICE.ENV_TRIGGERING.length - 1;
        // $('#nrpn-73-options').append(DEVICE.ENV_TRIGGERING.map((o,i) => {
        $('#nrpn-73-options').append(DEVICE.ENV_TRIGGERING.slice(0).reverse().map((o,i) => {
            return $("<div>").attr("id", `nrpn-73-${m-i}`).data("control", "nrpn-73").data("value", m-i).text(o).addClass("bt");
            // return $("<div>").attr("id", `nrpn-73-${i}`).data("control", "nrpn-73").data("value", i).text(o).addClass("bt");
        }));

        // TODO: Osc 1+2: PW controls are only displayed when wave form is pulse

        // "radio button"-like behavior:
        $('div.bt').click(function(e) {
            // console.log(`click on ${this.id}`);
            if (!this.classList.contains("on")) {   // if not already on...
                $(this).siblings(".bt").removeClass("on");
                this.classList.add("on");
                // handleUIChange(...c.split('-'), v);
                handleUIChange(...this.id.split('-'));
            }
        });

        // "checkbox"-like behavior:
        $('div.btc').click(function(e) {
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
        $('#cc-111').append(DEVICE.ARP_OCTAVES.map((o,i) => { return $("<option>").val(i + 1).text(o); }));     // note: min CC is 1 (not 0)

        // ARP NOTES
        $('#cc-118').append(DEVICE.ARP_NOTES_MODE.map((o,i) => { return $("<option>").val(i).text(o); }));

        // ARP RHYTHM
        for (let i=0; i<32; i++) {
            $('#cc-119').append($("<option>").val(i).text(i+1));
        }

        $('select.cc').change(function (){ handleUIChange(...this.id.split('-'), this.value) });

        // LFO speed/sync selects:
        $('#nrpn-88').change(function(){
            if (this.value === '1') {
                $('#cc-18').hide();
                $('#nrpn-87').show();
            } else {
                $('#nrpn-87').hide();
                $('#cc-18').show();
            }
        });
        $('#nrpn-92').change(function(){
            if (this.value === '1') {
                $('#cc-19').hide();
                $('#nrpn-91').show();
            } else {
                $('#nrpn-91').hide();
                $('#cc-19').show();
            }
        });

    } // setupSelects

    /**
     *
     */
    function setupSliders() {
        $(".slider").on('input', function() {   // "input:range" not yet supported by jquery; on(drag) not supported by chrome?
            // console.log(event, event.currentTarget.value);
            handleUIChange(...this.id.split('-'), this.value);
            $('#' + this.id + '-value').text(this.value);
        });
    }

    /**
     *
     */
    function setupADSR() {
        [].forEach.call(document.querySelectorAll('svg.envelope'), function(element) {
            envelopes[element.id] = new envelope(element, {});
        });
    }

    /**
     *
     * @param id
     * @param value
     */
    function updateOptionSwitch(id, value) {
        // "radio button"-like behavior
        console.log(`updateOptionSwitch(${id}, ${value})`);
        let e = $('#' + id);
        console.log(e);
        if (!e.is('.on')) {   // if not already on...
            e.siblings(".bt").removeClass("on");
            e.addClass("on");
            // handleUIChange(...c.split('-'), v);
            // handleUIChange(...this.id.split('-'));
        }
    }

    /**
     *
     * @param id
     * @param value
     */
    function updateToggleSwitch(id, value) {
        // console.log(`updateToggleSwitch(${id}, ${value})`);
        // "checkbox"-like behavior:
        let e = $('#' + id);
        if (value) {
            e.addClass('on');
        } else {
            e.removeClass('on');
        }
    }

    /**
     *
     * @param id
     * @param value
     */
    function updateSlider(id, value) {
        // console.log(`updateSlider(${id}, ${value})`);
        $('#' + id).val(value);
        $('#' + id + '-value').text(value);

    }

    /**
     * Update the "custom" or "linked" UI elements, like the ADSR curves
     */
    function updateLinkedUIElements() {

        // console.groupCollapsed(`updateCustoms()`);

        // // Osc 1+2: PS controls are only displayed when wave form is pulse
        // $('#nrpn-72').val() == DEVICE.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc1-pw-controls') : disable('#osc1-pw-controls');
        // $('#nrpn-82').val() == DEVICE.OSC_WAVE_FORMS.indexOf('pulse') ? enable('#osc2-pw-controls') : disable('#osc2-pw-controls');

        envelopes['mod-envelope'].envelope = DEVICE.getADSREnv('mod');
        envelopes['amp-envelope'].envelope = DEVICE.getADSREnv('amp');


        // LFO speed/sync selects:
            if ($('#nrpn-88').val() === '1') {
                $('#cc-18').hide();
                $('#nrpn-87').show();
            } else {
                $('#nrpn-87').hide();
                $('#cc-18').show();
            }
            if ($('#nrpn-92').val() === '1') {
                $('#cc-19').hide();
                $('#nrpn-91').show();
            } else {
                $('#nrpn-91').hide();
                $('#cc-19').show();
            }

        // console.groupEnd();

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
        updateLinkedUIElements();
        updateMeta();
        console.log('updateUI done');
        // updateCommands();
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
        setupSliders();
        setupADSR();
        setupMenu();
        // updateCommands();

        console.groupEnd();
        console.log('setupUI done');

    }

    //==================================================================================================================
    // Favorites dialog

    function getFavorites() {
        let fav = localStorage.getItem('favorites');
        console.log('loaded favorites:', fav);
        return fav ? JSON.parse(fav) : [];
    }

    /**
     * Add the current preset to the list of favorites preset in the local storage
     */
    function addToFavorites() {
        let name = $('#add-favorite-patch-name').val();
        let u = getCurrentPatchAsLink();
        console.log(`add to favorites: name=${name}, url=${u}`);
        let favorites = getFavorites();
        favorites.push({
            name: name,
            url: u
        });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function openFavoritesDialog() {

        let favorites = getFavorites();
        $('#fav-dialog-list').append(favorites.map((o, i) => {
            console.log(o, i);
            return $("<option>").val(o.name).text(o.name);
        }));

        lightbox = lity('#fav-dialog');
    }

    function closeFavoritesDialog() {
        lightbox.close();
    }

    //==================================================================================================================
    // Patch file handling

    var lightbox = null;

    function settingsDialog() {
        $('#settings-dialog-error').empty();
        // $('#patch-file').val('');
        lightbox = lity('#settings-dialog');
    }

    /**
     *
     */
    function loadPatchFromFile() {
        $('#load-patch-error').empty();
        $('#patch-file').val('');
        lightbox = lity('#load-patch-dialog');
    }

    /**
     *
     */
    function savePatchToFile() {
        // DEVICE.control[DEVICE.control_id.osc1_coarse].raw_value = 0b10011001; // 153
        // DEVICE.control[DEVICE.control_id.osc2_coarse].raw_value = 0b10101010; // 170

        // DEVICE.meta.patch_name.value = 'Yo Mama';

        let data = DEVICE.getSysExDump();   // return Uint8Array

        console.log(data, Utils.toHexString(data, ' '));
        // console.log(encodeURIComponent(data));

        // https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
        // <a href="data:application/octet-stream;charset=utf-16le;base64,//5mAG8AbwAgAGIAYQByAAoA">text file</a>
        // $('a.download').attr('href', 'data:application/csv;charset=utf-8,' + encodeURI(data));

        let shadownlink = document.createElement('a');
        // shadownlink.setAttribute('href', 'data:application/octet-stream,' + data);
        // shadownlink.setAttribute('download', 'bs2-patch.syx');

        let now = new Date();
        let timestamp =
            now.getUTCFullYear() + "-" +
            ("0" + (now.getUTCMonth()+1)).slice(-2) + "-" +
            ("0" + now.getUTCDate()).slice(-2) + "-" +
            ("0" + now.getUTCHours()).slice(-2) + "" +
            ("0" + now.getUTCMinutes()).slice(-2) + "" +
            ("0" + now.getUTCSeconds()).slice(-2);

        shadownlink.download = 'bs2-patch.' + timestamp + '.syx';
        shadownlink.style.display = 'none';

        let blob = new Blob([data], {type: "application/octet-stream"});
        let url = window.URL.createObjectURL(blob);
        shadownlink.href = url;

        document.body.appendChild(shadownlink);
        shadownlink.click();
        document.body.removeChild(shadownlink);
        setTimeout(function() {
            return window.URL.revokeObjectURL(url);
        }, 1000);

    }


    /**
     * Handler for the #patch-file file input element in #load-patch
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
                    $('#load-patch-error').show().text('The file is invalid.');
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
/*
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
*/

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

    function printPatch() {
        let v = BS2.getAllValues();
        console.log('printPatch');
        // data = msgpack.encode(v);
        // let b64 = base64js.fromByteArray(data);
        // let decoded = msgpack.decode(base64js.toByteArray(b64));
        // let url = 'print.html?pack=' + b64;
        let url = 'print.html?' + URL_PARAM_SYSEX + '=' + Utils.toHexString(DEVICE.getSysExDump());
        window.open(url, '_blank', 'width=800,height=600,location,resizable,scrollbars,status');
    }

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


    function playLastNote() {
        console.log(`play last nore ${last_note}`);
        if (last_note) {
            let e = $('#played-note');
            if (e.is('.on')) {
                midi_output.stopNote(last_note, midi_channel);
                e.removeClass('on');
            } else {
                midi_output.playNote(last_note, midi_channel);
                e.addClass('on');
            }
        }
    }

/*
    function updateCommands() {
        toggleOnOff('#cmd-sync', !!midi_output);
        toggleOnOff('#cmd-send', !!midi_output);
        // toggleOnOff('#cmd-export', !!midi_output);
    }
*/

    var midi_window = null;
    function openMidiWindow() {
        midi_window = window.open("midi.html", '_midi', 'location=no,height=480,width=300,scrollbars=yes,status=no');
        // $("#midi-popup").dialog("open");
        // $("midi", midi_window)
    }

    /**
     *
     */
    function setupMenu() {
/*
        $('#cmd-sync').click(syncUIwithBS2);
        $('#cmd-send').click(updateConnectedDevice);
        // $('#cmd-record').click(record);
        // $('#cmd-play').click(play);
        $('#midi-channel').change(setMidiChannel);
*/
        $('#add-favorite').click(openFavoritesDialog);
        $('#randomize').click(randomize);
        $('#init').click(init);
        $('#load-patch').click(loadPatchFromFile);
        $('#save-patch').click(savePatchToFile);
        $('#print-patch').click(printPatch);
        $('#patch-file').change(readFile);
        $('#settings').click(settingsDialog);
        $('#menu-midi').click(openMidiWindow);
        //$('.reset-handler').click(resetGroup);  // TODO
        $('#played-note').click(playLastNote);
        $('#add-favorite-bt').click(function(){
            addToFavorites();
            closeFavoritesDialog();
        });
    }

    //==================================================================================================================
    // Settings

    var settings = {
        randomize: []
    };

    /**
     *
     */
    function loadSettings() {
        Object.assign(settings, Cookies.getJSON('settings'));
        // 1. reset all checkboxes:
        $('input.chk-rnd').prop('checked', false);
        // 2. then, select those that need to be:
        for (let i=0; i<settings.randomize.length; i++) {
            $(`input:checkbox[name=${settings.randomize[i]}]`).prop('checked', true);
        }
    }

    /**
     *
     */
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

        console.groupEnd();
    }

    /**
     *
     */
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
    // noteOn & noteOff events handling

    function noteOn(e) {

        // let msg = e.data;   // Uint8Array
        // let cc = msg[1];
        // logIncomingMidiMessage('CC', cc, msg[2]);

        console.log('noteOn', e.data);
        // console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");

        last_note = e.note.name + e.note.octave;

        let note = last_note;   // local copy

        // Note: only handles single digit octave : -9..9

        let neg_octave = note.indexOf('-') > 0;
        if (neg_octave) note = note.replace('-', '');  // we'll put it back later; the tests are simpler without it

        // Get the enharmonics of a note. It returns an array of three elements: the below enharmonic, the note, and the upper enharmonic
        // Tonal.note.enharmonics('Bb4') --> ["A#4", "Bb4", "Cbb5"]
        // Tonal.note.enharmonics('A#4') --> ["G###4", "A#4", "Bb4"]
        // Tonal.note.enharmonics('C')   --> ["B#", "C", "Dbb"]
        // Tonal.note.enharmonics('A')   --> ["G##", "A", "Bbb"]
        let enharmonics = Tonal.note.enharmonics(last_note);
        // let enharmonic = Tonal.note.simplify(note);

        let enharmonic;
        if (note.length === 2) {
            enharmonic = '';
        } else {
            if (note.charAt(1) === '#') {
                // note = note.replace('#', '&sharp;');                 // the sharp symbol is not good-looking (too wide)
                enharmonic = enharmonics[2].replace('b', '&flat;');
            } else {
                note = note.replace('b', '&flat;');
                // enharmonic = enharmonics[0].replace('#', '&sharp;');
            }
        }

        if (neg_octave) {
            // put back the minus sign we removed before
            let i = note.length - 1;
            note = note.substr(0, i) + '-' + note.substr(i);
        }

        // console.log(`noteOn: ${note}`, enharmonic, cc);

        $('#played-note').addClass('on');

        // console.log($('#note-name'));
        $('#note-name').html(note);
        $('#note-enharmonic').html(enharmonic);

        // console.log('add on class to #played-note', $('#played-note'));

        // $('#note-name').addClass('on');

    }

    function noteOff(e) {
        $('#played-note').removeClass('on');
    }

    //==================================================================================================================
    // SysEx

    /**
     * Send a sysex to the BS2 asking for it to send back a sysex dump of its current patch.
     * F0 00 20 29 00 33 00 40  F7
     */
    function requestSysExDump() {
        if (!midi_output) return;
        console.log('requestSysExDump()');
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
            .on('noteon', midi_channel, function(e) {
                noteOn(e);
            })
            .on('noteoff', midi_channel, function(e) {
                noteOff(e);
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
                console.log('set sysex value to BS2');
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
            console.log('ignore deviceConnect');
            return;
        }
        if (info.hasOwnProperty('input') && info.input && (info.name === DEVICE.name_device_in)) {
            if (!midi_input) {
                connectInput(info.input);
            } else {
                console.log('deviceConnect: input already connected');
            }
        }
        if (info.hasOwnProperty('output') && info.output && (info.name === DEVICE.name_device_out)) {
            if (!midi_output) {
                connectOutput(info.output);
            } else {
                console.log('deviceConnect: output already connected');
            }
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
            setStatus(`${DEVICE.name_device_in} has been disconnected.`);
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
    // var sysex_received_callback = false;
    var last_sysex_data = null;     // last sysex dump received

    var knobs = {};

    var envelopes = {};     // Visual ADSR envelopes


    /**
     *
     */
    $(function () {

        console.log('app starting...');

        setupUI();

        init(false);    // init DEVICE then UI without sending any CC to the DEVICE

        setStatus("Waiting for MIDI interface...");

        WebMidi.enable(function (err) {

            if (err) {

                console.log('webmidi err', err);

                setStatusError("ERROR: WebMidi could not be enabled.");


                let s = Utils.getParameterByName('sysex');
                if (s) {
                    console.log('sysex param present');
                    let data = Utils.fromHexString(s);
                    if (DEVICE.setValuesFromSysex(data)) {
                        console.log('sysex param OK');
                        updateUI();
                    } else {
                        console.log('unable to set value from sysex param');
                    }
                }



            } else {

                console.log('webmidi ok');

                setStatus("WebMidi enabled.");
                setMidiStatus(true);

                // WebMidi.inputs.map(i => console.log("input: ", i));
                // WebMidi.outputs.map(i => console.log("output: ", i));

                WebMidi.addListener("connected", e => deviceConnect(e));
                WebMidi.addListener("disconnected", e => deviceDisconnect(e));

                let input = WebMidi.getInputByName(DEVICE.name_device_in);
                // console.log(WebMidi.inputs);
                // let input = WebMidi.inputs[1];
                if (input) {
                    connectInput(input);
                } else {
                    setStatusError(`${DEVICE.name_device_in} not found.`)
                    setMidiInStatus(false);
                }

                let output = WebMidi.getOutputByName(DEVICE.name_device_out);
                // let output = WebMidi.outputs[0];
                if (output) {
                    connectOutput(output);
                } else {
                    setStatusError(`${DEVICE.name_device_in} not found.`)
                    setMidiOutStatus(false);
                }



                let s = Utils.getParameterByName('sysex');
                if (s) {
                    console.log('sysex param present');
                    let data = Utils.fromHexString(s);
                    if (DEVICE.setValuesFromSysex(data)) {
                        console.log('sysex param OK');
                        updateUI();
                        updateConnectedDevice();
                    } else {
                        console.log('unable to set value from sysex param');
                    }
                } else {
                    // ask the BS2 to send us its current patch:
                    requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?
                }



            }

        }, true);   // pass true to enable sysex support

    });

})();
