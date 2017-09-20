import DEVICE from './bass-station-2/bass-station-2.js';
import envelope from './synth-ui/envelope.js';
import knob from './synth-ui/knob.js';
import * as Utils from './lib/utils.js';
import tonal from 'tonal'
import * as WebMidi from "webmidi";
import moment from "moment";
import Cookies from 'js-cookie';
import * as lity from "lity";
import 'webpack-jquery-ui/effects';
import browser from 'detect-browser';

// CSS order is important
import './css/lity.min.css';
import './css/main.css';

const TRACE = true;    // when true, will log more details in the console

if (browser) {
    console.log(browser.name);
    console.log(browser.version);
    switch (browser && browser.name) {
        case 'chrome':
            if (TRACE) console.log('supported browser');
            break;
        case 'firefox':
        case 'edge':
        default:
            if (TRACE) console.log('unsupported browser');
            alert('Please use Chrome browser (recent version recommended). ' +
                'Any other browser is unsupported at the moment and the application may not work properly or not work at all. ' +
                'Thank you for your understanding.');
    }
}

/**
 * Makes the app name glows, or not.
 * @param status
 */
function setMidiInStatus(status) {
    if (status) {
        $('#neon').addClass("glow");
    } else {
        $('#neon').removeClass("glow");
    }
}

// function setMidiOutStatus(status) {
//     // toggleOnOff('#midi-out-status', status);
// }

function setStatus(msg) {
    $('#status').removeClass("error").text(msg);
    if (TRACE) console.log(msg);
}

function setStatusError(msg) {
    $('#status').addClass("error").text(msg);
}

//
// Count the number of messages displayed in the midi window.
//
let midi_in_messages = 0;
let midi_out_messages = 0;

/**
 *
 * @param type
 * @param control
 * @param value
 */
function logIncomingMidiMessage(type, control, value) {
    if (midi_window) {
        midi_in_messages++;
        // log at max 1000 messages:
        if (midi_in_messages > 1000) $("#midi-messages-in div:last-child", midi_window.document).remove();
        let s = type + ' ' +
            control.toString(10).padStart(3, '0') + ' ' +
            value.toString(10).padStart(3, '0') + ' (' +
            control.toString(16).padStart(2, '0') + ' ' +
            value.toString(16).padStart(2, '0') + ')';
        $('#midi-messages-in', midi_window.document).prepend(`<div>${s.toUpperCase()}</div>`);
    }
}

/**
 *
 * @param type
 * @param control
 * @param value
 */
function logOutgoingMidiMessage(type, control, value) {
    if (midi_window) {
        midi_out_messages++;
        // log at max 1000 messages:
        if (midi_out_messages > 1000) $("#midi-messages-out div:last-child", midi_window.document).remove();
        let s = type + ' ' +
            control.toString(10).padStart(3, '0') + ' ' +
            value.toString(10).padStart(3, '0') + ' (' +
            control.toString(16).padStart(2, '0') + ' ' +
            value.toString(16).padStart(2, '0') + ')';
        $('#midi-messages-out', midi_window.document).prepend(`<div>${s.toUpperCase()}</div>`);
    }
}

//==================================================================================================================

/**
 * Get a link for the current patch
 *
 */
function getCurrentPatchAsLink() {
    // window.location.href.split('?')[0] is the current URL without the query-string if any
    return window.location.href.replace('#', '').split('?')[0] + '?' + URL_PARAM_SYSEX + '=' + Utils.toHexString(DEVICE.getSysEx());
}

//==================================================================================================================
// Midi messages handling

let cc_expected = -1;
let cc_msb = -1;
let cc_lsb = -1;
let value_msb = 0;    // msb to compute value
let value_lsb = 0;    // lsb to compute value
let nrpn = false;
let last_note = null;

/**
 * Handle all control change messages received
 * @param e
 */
function handleCC(e) {

    let msg = e.data;   // Uint8Array
    let cc = msg[1];
    let value = -1;

    if (TRACE) console.log('receive CC', cc, msg[2]);

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

    if (TRACE) console.log('dispatch', control_type, control_number, value, '#' + control_type + '-' + control_number);

    control_type = control_type.toLowerCase();

    if ((control_type !== 'cc') && (control_type !== 'nrpn')) return; //TODO: signal an error

    DEVICE.setControlValue(control_type, control_number, value);

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

    if (TRACE) console.log(`updateControl(${control_type}, ${control_number}, ${value})`);

    let id = control_type + '-' + control_number;
    if (knobs.hasOwnProperty(id)) {
        knobs[id].value = value;
    } else {
        if (TRACE) console.log(`check #${id}`);
        let c = $(`#${id}`);
        if (c.length) {
            if (TRACE) console.log(`#${id} found`, c);
            if (c.is('.slider')) {
                updateSlider(id, value);
            } else if (c.is('.btc')) {
                updateToggleSwitch(id, value);
            } else {
                c.val(value).trigger('blur');
                //console.error(`unknown control ${id}`);
            }
        } else {
            if (TRACE) console.log(`check #${id}-${value}`);
            c = $(`#${id}-${value}`);
            if (c.length) {
                if (TRACE) console.log(c);
                if (c.is('.bt')) {
                    updateOptionSwitch(id + '-' + value, value);
                } else {
                    c.val(value).trigger('blur');
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
                if (TRACE) console.log(`send CC ${a[i][0]} ${a[i][1]} (${control.name}) on channel ${midi_channel}`);
                midi_output.sendControlChange(a[i][0], a[i][1], midi_channel);
            } else {
                if (TRACE) console.log(`(send CC ${a[i][0]} ${a[i][1]} (${control.name}) on channel ${midi_channel})`);
            }
            logOutgoingMidiMessage('cc', a[i][0], a[i][1]);
        }
    } else if (control.cc_type === 'nrpn') {
        let value = DEVICE.getControlValue(control);
        if (midi_output) {
            if (TRACE) console.log(`send NRPN ${control.cc_number} ${value} (${control.name}) on channel ${midi_channel}`);
            midi_output.setNonRegisteredParameter([0, control.cc_number], value, midi_channel);  // for the BS2, the NRPN MSB is always 0
        } else {
            if (TRACE) console.log(`(send NRPN ${control.cc_number} ${value} (${control.name}) on channel ${midi_channel})`);
        }
        logOutgoingMidiMessage('nrpn', control.cc_number, value);
    }

}

/**
 * Send all values to the connected device
 */
function updateConnectedDevice() {

    console.groupCollapsed(`updateConnectedDevice()`);

    // setStatus(`Sending all values to ${DEVICE.name} ...`);

    function _send(controls) {
        for (let i=0; i < controls.length; i++) {
            if (typeof controls[i] === 'undefined') continue;
            sendSingleValue(controls[i]);
        }
    }

    _send(DEVICE.control);
    _send(DEVICE.nrpn);

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

    if (TRACE) console.log('updateDevice', control_type, control_number, value_float, value);

    let control = DEVICE.setControlValue(control_type, control_number, value);

    sendSingleValue(control);
}

/**
 * Handles (reacts to) a change made by the user in the UI.
 */
function handleUIChange(control_type, control_number, value) {

    if (TRACE) console.log(`handleUIChange(${control_type}, ${control_number}, ${value})`);

    updateDevice(control_type, control_number, value);

    if (control_type === 'cc') {
        if (['102', '103', '104', '105'].includes(control_number)) {
            envelopes['mod-envelope'].envelope = DEVICE.getADSREnv('mod');
        } else if (['90', '91', '92', '93'].includes(control_number)) {
            if (TRACE) console.log('redraw amp env', envelopes);
            envelopes['amp-envelope'].envelope = DEVICE.getADSREnv('amp');
        }
    }
}

//==================================================================================================================

/**
 *
 */
function init(sendUpdate = true) {
    if (TRACE) console.log(`init(${sendUpdate})`);
    DEVICE.init();
    updateUI();
    // setStatus(`init done`);
    if (sendUpdate) updateConnectedDevice();
    if (TRACE) console.log(`init done`);
    return false;   // disable the normal href behavior
}

/**
 *
 */
function randomize() {
    console.groupCollapsed(`randomize`);
    if (settings.randomize.length < 1) {
        alert('nothing to randomize');
    } else {
        DEVICE.randomize(settings.randomize);
        updateUI();
        updateConnectedDevice();
    }
    console.groupEnd();
    return false;   // disable the normal href behavior
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

} // updateControls()

/**
 *
 */
function setupKnobs() {

    function _setupKnob(id, c, v) {

        let elem = document.getElementById(id);

        if (elem === null) return;

        if (!elem.classList.contains("knob")) return;

        if (TRACE) console.log(`configure #${id}: range=${c.cc_range}, init-value=${v}`);

        knobs[id] = new knob(elem, {
            with_label: false,
            cursor: 50,
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
            if (TRACE) console.log(event);
            handleUIChange(c.cc_type, c.cc_number /*i*/, event.detail);
        });
    }

    function _setup(controls) {

        for (let i=0; i < controls.length; i++) {

            let c = controls[i];
            if (typeof c === 'undefined') continue;

            if (TRACE) console.log(`${c.cc_type}-${c.cc_number} (${i})`);

            let id = `${c.cc_type}-${c.cc_number}`;
            _setupKnob(id, c, DEVICE.getControlValue(controls[i]));
        }
    }

    console.groupCollapsed('setupKnobs');

    _setup(DEVICE.control);
    _setup(DEVICE.nrpn);

    console.groupEnd();

} // setupKnobs

/**
 * Add double-click handlers on .knob-label elements. A double-click will reset the linked knob.
 */
function setupResets() {
    $(".knob-label:not(.no-reset)")
        .attr("alt", "Double-click to reset")
        .attr("title", "Double-click to reset")
        .dblclick(function() {
            let knob = $(this).siblings(".knob");
            if (knob.length < 1) {
                if (TRACE) console.log('setupResets: no sibbling knob found');
                return;
            }
            if (TRACE) console.log("setupResets knob", knob);
            let [control_type, control_number] = knob[0].id.split('-');
            if (TRACE) console.log(`setupResets ${control_type} ${control_number}`);
            let c;
            if (control_type === 'cc') {
                c = DEVICE.control[control_number];
            } else if (control_type === 'nrpn') {
                c = DEVICE.nrpn[control_number];
            } else {
                // ERROR
                console.error(`setupResets invalid control id: ${control_type} ${control_number}`);
                return;
            }
            c.raw_value = c.init_value;
            updateControl(control_type, control_number, c.init_value);
    });
}

/**
 *
 */
function setupSwitches() {

    //TODO: remove .data(...)

    // SUB
    $('#cc-80-options').append(DEVICE.SUB_WAVE_FORMS.map((o,i) => {
        return $("<div>").attr("id", `cc-80-${i}`).data("control", "cc-80").data("value", i).text(o).addClass("bt");
    }));

    // We display the value in reverse order to be like the real BS2
    if (TRACE) console.log(Object.entries(DEVICE.SUB_OCTAVE));
    $('#cc-81-options').append(Object.entries(DEVICE.SUB_OCTAVE).slice(0).reverse().map((o) => {
        return $("<div>").attr("id", `cc-81-${o[0]}`).data("control", "cc-81").data("value", o[0]).text(o[1]).addClass("bt");
    }));

    // OSC 1
    $('#cc-70-options').append(Object.entries(DEVICE.OSC_RANGES).map((o) => {
        return $("<div>").attr("id", `cc-70-${o[0]}`).data("control", "cc-70").data("value", o[0]).text(o[1]).addClass("bt");
    }));
    $('#nrpn-72-options').append(DEVICE.OSC_WAVE_FORMS.map((o,i) => {
        return $("<div>").attr("id", `nrpn-72-${i}`).data("control", "nrpn-72").data("value", i).text(o).addClass("bt");
    }));

    // OSC 2
    $('#cc-75-options').append(Object.entries(DEVICE.OSC_RANGES).map((o) => {
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
    // We display the value in reverse order to be like the real BS2
    let m = DEVICE.ENV_TRIGGERING.length - 1;
    $('#nrpn-105-options').append(DEVICE.ENV_TRIGGERING.slice(0).reverse().map((o,i) => {
        return $("<div>").attr("id", `nrpn-105-${m-i}`).data("control", "nrpn-105").data("value", m-i).text(o).addClass("bt");
    }));

    //TODO: mod env triggering is overridden by (or the same as) amp env triggering?

    // AMP ENV
    // We display the value in reverse order to be like the real BS2
    m = DEVICE.ENV_TRIGGERING.length - 1;
    $('#nrpn-73-options').append(DEVICE.ENV_TRIGGERING.slice(0).reverse().map((o,i) => {
        return $("<div>").attr("id", `nrpn-73-${m-i}`).data("control", "nrpn-73").data("value", m-i).text(o).addClass("bt");
    }));

    // TODO: Osc 1+2: PW controls to be displayed only when wave form is pulse

    // "radio button"-like behavior:
    $('div.bt').click(function() {
        if (TRACE) console.log(`click on ${this.id}`);
        if (!this.classList.contains("on")) {   // if not already on...
            $(this).siblings(".bt").removeClass("on");
            this.classList.add("on");
            // handleUIChange(...c.split('-'), v);
            handleUIChange(...this.id.split('-'));
        }
    });

    // "checkbox"-like behavior:
    $('div.btc').click(function() {
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
        if (TRACE) console.log(event, event.currentTarget.value);
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
    if (TRACE) console.log(`updateOptionSwitch(${id}, ${value})`);
    let e = $('#' + id);
    if (TRACE) console.log(e);
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
    if (TRACE) console.log(`updateToggleSwitch(${id}, ${value})`);
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
    if (TRACE) console.log(`updateSlider(${id}, ${value})`);
    $('#' + id).val(value);
    $('#' + id + '-value').text(value);
}

/**
 * Update the "custom" or "linked" UI elements, like the ADSR curves
 */
function updateLinkedUIElements() {

    if (TRACE) console.groupCollapsed('updateLinkedUIElements()');

    // TODO: Osc 1+2: PS controls are to be displayed onky when wave form is pulse

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

    if (TRACE) console.groupEnd();
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
    if (TRACE) console.log('updateUI done');
}

/**
 * Initial setup of the UI.
 * Does a DEVICE.init() too, but only the virtual DEVICE; does not send any CC to the connected device.
 */
function setupUI() {

    console.groupCollapsed("setupUI");

    $('span.version').text(VERSION);

    setMidiInStatus(false);
    // setMidiOutStatus(false);

    setupSettings();    // must be done before loading the settings
    loadSettings();

    setupKnobs();
    setupResets();
    setupSwitches();
    setupSelects();
    setupSliders();
    setupADSR();
    setupMenu();

    console.groupEnd();
}

//==================================================================================================================
// Favorites dialog

let default_favorite_name = '';

function getFavorites() {
    let fav = localStorage.getItem('favorites');
    if (TRACE) console.log('loaded favorites:', fav);
    return fav ? JSON.parse(fav) : [];
}

/**
 *
 * @param index
 */
function deleteFavorite(index) {
    if (TRACE) console.log(`deleteFavorite(${index})`);
    let favorites = getFavorites();
    favorites.splice((favorites.length - 1) - index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

/**
 *
 */
function refreshFavoritesList() {
    let favorites = getFavorites();
    $("#favorites-list").empty().append(favorites.slice(0).reverse().map((o, i) => {
        return $("<div>").append($("<a>")
                .attr("href", o.url)
                .attr("id", `fav-${i}`).text(o.name),
            $("<span>")
                .attr("id", `del-${i}`)
                .attr("title", "delete this favorite").html("&#x2715;"),    // delete handle
            $("<div>").text(o.description));
    }));

    $("#favorites-list > div span").click(function(){
        deleteFavorite(parseInt(this.id.substr(4)));
        refreshFavoritesList();
    });
}

/**
 * Add the current preset to the list of favorites preset in the local storage
 */
function addToFavorites() {
    let name = $('#add-favorite-patch-name').val();
    if (!name) name = default_favorite_name;
    let description = $('#add-favorite-patch-description').val();
    let url = getCurrentPatchAsLink();
    if (TRACE) console.log(`add to favorites: name=${name}, url=${url}`);
    let favorites = getFavorites();
    favorites.push({
        name,
        description,
        url
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    refreshFavoritesList();
    return false;   // disable the normal href behavior
}

/**
 *
 */
function openFavoritesPanel() {

    if (TRACE) console.log("toggle favorites-panel");

    let e = $('#favorites-panel');
    if (e.css("display") === 'block') {
        e.hide('slide', {direction: 'left'}, 500);
    } else {
        e.show('slide', {direction: 'left'}, 500);
        // init input field:
        default_favorite_name = moment().format("BS2-YYYY-MM-DD-HHmmSS");
        $('#add-favorite-patch-name').attr('placeholder', default_favorite_name);
        refreshFavoritesList();
    }

    return false;   // disable the normal href behavior
}

/**
 *
 */
function closeFavoritesPanel() {
    // remove events handlers set on dialog elements:
    $("#favorites-list > div").off("click");
    $("#favorites-list > div span").off("click");
    // close the panel:
    $('#favorites-panel').hide('slide', { direction: 'left' }, 500);
}

//==================================================================================================================
// Settings

function openSettingsPanel() {
    if (TRACE) console.log("toggle settings-panel");
    let e = $('#settings-panel');
    if (e.css("display") === 'block') {
        e.hide('slide', {direction: 'left'}, 500);
    } else {
        e.show('slide', {direction: 'left'}, 500);
    }
    return false;   // disable the normal href behavior
}

function closeSettingsPanel() {
    if (TRACE) console.log("closeSettingsPanel");
    $('#settings-panel').hide('slide', { direction: 'left' }, 500);
}

//==================================================================================================================
// Patch file handling

var lightbox = null;    // lity dialog

/**
 *
 */
function loadPatchFromFile() {
    $('#load-patch-error').empty();
    $('#patch-file').val('');
    lightbox = lity('#load-patch-dialog');
    return false;   // disable the normal href behavior
}

/**
 *
 */
function savePatchToFile() {

    let data = DEVICE.getSysEx();   // return Uint8Array

    if (TRACE) console.log(data, Utils.toHexString(data, ' '));
    if (TRACE) console.log(encodeURIComponent(data));

    let shadowlink = document.createElement('a');

    let now = new Date();
    let timestamp =
        now.getUTCFullYear() + "-" +
        ("0" + (now.getUTCMonth()+1)).slice(-2) + "-" +
        ("0" + now.getUTCDate()).slice(-2) + "-" +
        ("0" + now.getUTCHours()).slice(-2) + "" +
        ("0" + now.getUTCMinutes()).slice(-2) + "" +
        ("0" + now.getUTCSeconds()).slice(-2);

    shadowlink.download = 'bs2-patch.' + timestamp + '.syx';
    shadowlink.style.display = 'none';

    let blob = new Blob([data], {type: "application/octet-stream"});
    let url = window.URL.createObjectURL(blob);
    shadowlink.href = url;

    document.body.appendChild(shadowlink);
    shadowlink.click();
    document.body.removeChild(shadowlink);
    setTimeout(function() {
        return window.URL.revokeObjectURL(url);
    }, 1000);

    return false;   // disable the normal href behavior
}

/**
 * Handler for the #patch-file file input element in #load-patch
 */
function readFile() {

    const SYSEX_END = 0xF7;

    let data = [];
    let f = this.files[0];
    if (TRACE) console.log(`read file`, f);

    if (f) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let view   = new Uint8Array(e.target.result);
            for (let i=0; i<view.length; i++) {
                data.push(view[i]);
                if (view[i] === SYSEX_END) break;
            }
            if (DEVICE.setValuesFromSysEx(data)) {
                if (TRACE) console.log('file read OK', DEVICE.meta.patch_name['value']);
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

/**
 *
 * @returns {boolean}
 */
function openCreditsDialog() {
    lightbox = lity('#credits-dialog');
    return false;   // disable the normal href behavior
}

//==================================================================================================================
// UI main commands (buttons in header)

function printPatch() {
    if (TRACE) console.log('printPatch');
    let url = 'print.html?' + URL_PARAM_SYSEX + '=' + Utils.toHexString(DEVICE.getSysEx());
    window.open(url, '_blank', 'width=800,height=600,location,resizable,scrollbars,status');
    return false;   // disable the normal href behavior
}

/**
 * header's "sync" button handler
 */
function syncUIwithBS2() {
    // ask the BS2 to send us its current patch:
    requestSysExDump();
    return false;   // disable the normal href behavior
}

/**
 * header's "midi channel" select handler
 */
function setMidiChannel() {
    disconnectInput();
    midi_channel = this.value;
    connectInput();
}

/**
 *
 */
function playLastNote() {
    if (TRACE) console.log(`play last note ${last_note}`);
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

var midi_window = null;

/**
 *
 * @returns {boolean}
 */
function openMidiWindow() {
    midi_window = window.open("midi.html", '_midi', 'location=no,height=480,width=350,scrollbars=yes,status=no');
    return false;   // disable the normal href behavior
}

/**
 *
 */
function setupMenu() {

    $('#menu-favorites').click(openFavoritesPanel);
    $('#menu-randomize').click(randomize);
    $('#menu-init').click(init);
    $('#menu-load-patch').click(loadPatchFromFile);
    $('#menu-save-patch').click(savePatchToFile);
    $('#menu-print-patch').click(printPatch);
    $('#menu-sync').click(syncUIwithBS2);
    $('#menu-midi').click(openMidiWindow);
    $('#menu-settings').click(openSettingsPanel);
    $('#menu-about').click(openCreditsDialog);

    $('#played-note').click(playLastNote);

    // in load-patch-dialog:
    $('#patch-file').change(readFile);

    // in settings dialog:
    $('#midi-channel').change(setMidiChannel);
    $('.close-settings-panel').click(closeSettingsPanel);

    // in favorites dialog:
    $('#add-favorite-bt').click(function(){
        addToFavorites();
        // closeFavoritesDialog();
    });
    $('.close-favorites-panel').click(closeFavoritesPanel);

    // close all opened panel with ESC key:
    $(document).keyup(function(e) {         //TODO: move into an ad-hoc function
        if (e.keyCode === 27) { // ESC key
            closeFavoritesPanel();
            closeSettingsPanel();
        }
    });

    // close all opened panel on outside click:
    $(document).mousedown(function(e) {
        $(".panel").each(function() {
            let element = $(this);
            if (element.is(':visible')) {
                // if the target of the click isn't the container nor a descendant of the container
                if (!element.is(e.target)) {
                    if (element.has(e.target).length === 0) {
                        element.hide('slide', {direction: 'left'}, 500);
                    }
                }
            }
        });
    });

}

//==================================================================================================================
// Settings

var settings = {
    midi_channel: 1,
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

    // select-all and select-none links:
    $("#randomizer-select-all").click(function(){
        $('input.chk-rnd').prop('checked', true);
        saveRandomizerSettings();
    });
    $("#randomizer-select-none").click(function(){
        $('input.chk-rnd').prop('checked', false);
        saveRandomizerSettings();
    });
}

/**
 *
 */
function saveRandomizerSettings() {
    let checked = [];
    $("input.chk-rnd:checked").each(function () {
        checked.push(this.name);
    });
    // let checked = $("input.chk-rnd:checked").map(function() { return $(this).name }).get();
    settings.randomize = checked;
    if (TRACE) console.log('save settings', settings);
    Cookies.set('settings', settings);
}

/**
 *
 */
function setupSettings() {

    console.group("setupSettings");

    displayRandomizerSettings();

    if (TRACE) console.log("settings cookie", Cookies.getJSON());

    $('input.chk-rnd').change(saveRandomizerSettings);

    console.groupEnd();
}

/**
 *
 */
function displayRandomizerSettings() {
    if (TRACE) console.log("displayRandomizerSettings()");
    let groups = Object.getOwnPropertyNames(DEVICE.control_groups);
    const COLS = 4;
    let i = 0;
    let html = '<table><tr>';
    for (let name of groups) {
        i++;
        let g = DEVICE.control_groups[name];
        html += `<td><input type="checkbox" class="chk-rnd" name="${name}" checked="checked" value="1" />${g.name}</td>`;
        if (i % COLS === 0) html += '</tr><tr>';
    }
    html += '</tr></table>';
    $('#randomizer-settings').html(html);
}

//==================================================================================================================
// noteOn & noteOff events handling

/**
 *
 * @param e
 */
function noteOn(e) {

    if (TRACE) console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");

    last_note = e.note.name + e.note.octave;

    let note = last_note;   // local copy

    // Note: only handles single digit octave : -9..9

    let neg_octave = note.indexOf('-') > 0;
    if (neg_octave) note = note.replace('-', '');  // we'll put it back later; the tests are simpler without it

    // Get the enharmonics of a note. It returns an array of three elements: the below enharmonic, the note, and the upper enharmonic
    // tonal.note.enharmonics('Bb4') --> ["A#4", "Bb4", "Cbb5"]
    // tonal.note.enharmonics('A#4') --> ["G###4", "A#4", "Bb4"]
    // tonal.note.enharmonics('C')   --> ["B#", "C", "Dbb"]
    // tonal.note.enharmonics('A')   --> ["G##", "A", "Bbb"]
    let enharmonics = tonal.note.enharmonics(last_note);

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

    if (TRACE) console.log(`noteOn: ${note} (${enharmonic})`);

    $('#played-note').addClass('on');
    $('#note-name').html(note);
    $('#note-enharmonic').html(enharmonic);
}

/**
 *
 */
function noteOff() {
    $('#played-note').removeClass('on');
}

//==================================================================================================================
// SysEx

/**
 * Send a sysex to the BS2 asking for it to send back a sysex dump of its current patch.
 * F0 00 20 29 00 33 00 40  F7
 */
function requestSysExDump() {
    if (midi_output) {
        console.log('requestSysExDump()');
        midi_output.sendSysex(DEVICE.meta.signature.sysex.value, [0x00, 0x33, 0x00, 0x40]);
    }
}

//==================================================================================================================
// WebMidi events handling

function disconnectInput() {
    if (midi_input) {
        midi_input.removeListener();    // remove all listeners for all channels
        console.log("midi_input not listening");
    }
}

/**
 *
 * @param input
 */
function connectInput(input) {
    if (!input) return;
    if (TRACE) console.log(`connect input to channel ${midi_channel}`);
    // if (input) {
    midi_input = input;
    // setStatus(`"${midi_input.name}" input connected.`);
    console.log(`midi_input assigned to "${midi_input.name}"`);
    // }
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
            if (TRACE) console.log('set sysex value to BS2');
            if (DEVICE.setValuesFromSysEx(e.data)) {
                updateUI();
                // setStatus("UI updated from SysEx.");
            } else {
                setStatusError("Unable to update from SysEx data.")
            }
        });
    console.log(`midi_input listening on channel ${midi_channel}`);
    setMidiInStatus(true);
    setStatus(`${DEVICE.name_device_in} connected on channel ${midi_channel}.`);
}

/**
 *
 * @param output
 */
function connectOutput(output) {
    if (TRACE) console.log('connect output', output);
    midi_output = output;
    // setStatus(`"${output.name}" output connected.`)
    console.log(`midi_output assigned to "${midi_output.name}"`);
    // setMidiOutStatus(true);
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
            //TODO: we should ask the user
            // ask the BS2 to send us its current patch:
            requestSysExDump();
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
        // setMidiOutStatus(false);
    }
}

//==================================================================================================================
// Main

const VERSION = '2.0.0';
const URL_PARAM_SYSEX = 'sysex';    // name of sysex parameter in the query-string

var midi_input = null;
var midi_output = null;
var midi_channel = 1;

var knobs = {};
var envelopes = {};     // Visual ADSR envelopes

/**
 *
 */
$(function () {

    console.log(`Bass Station II Web Interface ${VERSION}`);

    setupUI();

    init(false);    // init DEVICE then UI without sending any CC to the DEVICE

    setStatus("Waiting for MIDI interface...");

    WebMidi.enable(function (err) {

        if (err) {

            console.log('webmidi err', err);

            setStatusError("ERROR: WebMidi could not be enabled.");

            let s = Utils.getParameterByName('sysex');
            if (s) {
                if (TRACE) console.log('sysex param present');
                let data = Utils.fromHexString(s);
                if (DEVICE.setValuesFromSysEx(data)) {
                    console.log('sysex loaded in device');
                    updateUI();
                } else {
                    console.log('unable to set value from sysex param');
                }
            }

        } else {

            console.log('webmidi ok');

            setStatus("WebMidi enabled.");

            if (TRACE) {
                WebMidi.inputs.map(i => console.log("input: ", i));
                WebMidi.outputs.map(i => console.log("output: ", i));
            }

            WebMidi.addListener("connected", e => deviceConnect(e));
            WebMidi.addListener("disconnected", e => deviceDisconnect(e));

            let input = WebMidi.getInputByName(DEVICE.name_device_in);
            if (input) {
                connectInput(input);
                setStatus(`${DEVICE.name_device_in} connected on channel ${midi_channel}.`);
            } else {
                setStatusError(`${DEVICE.name_device_in} not found. Please connect your Bass Station II with your computer.`);
                setMidiInStatus(false);
            }

            let output = WebMidi.getOutputByName(DEVICE.name_device_out);
            if (output) {
                connectOutput(output);
            } else {
                setStatusError(`${DEVICE.name_device_in} not found.`)
                // setMidiOutStatus(false);
            }

            let s = Utils.getParameterByName('sysex');
            if (s) {
                console.log('sysex param present');
                let data = Utils.fromHexString(s);
                if (DEVICE.setValuesFromSysEx(data)) {
                    console.log('sysex loaded in device');
                    updateUI();
                    updateConnectedDevice();
                } else {
                    console.log('unable to set value from sysex param');
                }
            } else {
                //TODO: we should ask the user
                // ask the BS2 to send us its current patch:
                requestSysExDump(); //FIXME: what if the mdi_input is not yet ready?
            }

        }

    }, true);   // pass true to enable sysex support

});
