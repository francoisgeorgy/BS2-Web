import * as consts from './constants.js';
import {control_id, control} from './cc.js';
import {nrpn_id, nrpn} from './nrpn.js';
import meta from './meta.js';
import {control_groups} from './groups.js';
import {doubleByteValue} from './utils.js';
import sysex from './sysex.js';


"use strict";

// var BS2 = (function BassStationII() {


/**
 *
 * @param name
 * @returns {*}
 */
const getADSREnv = function (name) {
    switch (name) {
        case 'amp':
            return {
                attack: control[control_id.amp_env_attack].raw_value / 127,
                decay: control[control_id.amp_env_decay].raw_value / 127,
                sustain: control[control_id.amp_env_sustain].raw_value / 127,
                release: control[control_id.amp_env_release].raw_value / 127
            };
        case 'mod':
            return {
                attack: control[control_id.mod_env_attack].raw_value / 127,
                decay: control[control_id.mod_env_decay].raw_value / 127,
                sustain: control[control_id.mod_env_sustain].raw_value / 127,
                release: control[control_id.mod_env_release].raw_value / 127
            };
    }
    return {};
};

/**
 *
 * @returns {number}
 * @param ctrl
 */
const getControlValue = function (ctrl) {
    return 'raw_value' in ctrl ? ctrl.raw_value : 0;
    // let c;
    // if (control.cc_type === 'cc') {
    //     c = control;
    // } else if (control.cc_type === 'nrpn') {
    //     c = nrpn;
    // } else {
    //     return 0;
    // }
    // if (c[control_number]) {
    //     return 'value' in c[control_number] ? c[control_number].raw_value : 0;
    // } else {
    //     return 0;
    // }
};

/**
 * setControlValue(control_object, value)
 * setControlValue(control_type, control_number, value)
 * return the updated control object
 */
const setControlValue = function () {
    // console.log('BS2.setControlValue', ...arguments);
    let c;
    if (arguments.length === 2) {
        let value = arguments[1];
        c = arguments[0];
        c.raw_value = typeof value === 'number' ? value : parseInt(value);
    } else if (arguments.length === 3) {
        let ca; // controls array
        if (arguments[0] === 'cc') {                // [0] is control type
            ca = control;
        } else if (arguments[0] === 'nrpn') {
            ca = nrpn;
        } else {
            console.error("setControlValue: invalid control_type", arguments);
            return null;
        }
        if (ca[arguments[1]]) {                     // [0] is control number
            c = ca[arguments[1]];
            let value = arguments[2];               // [0] is control value
            c.raw_value = typeof value === 'number' ? value : parseInt(value);
        } else {
            console.error("setControlValue: unknown number", arguments);
            return null;
        }
    } else {
        console.error("setControlValue: invalid arguments", arguments);
        return null;
    }
    return c;
};

/**
 *
 * @returns {{cc: Array, nrpn: Array}}
 */
const getAllValues = function () {
    let a = {
        cc: new Array(127),
        nrpn: new Array(127)
    };

    for (let i = 0; i < control.length; i++) {
        let c = control[i];
        if (typeof c === 'undefined') continue;
        // console.log(`getAllValues: cc ${i}: ${c.name}: ${c.raw_value}`);
        a.cc[i] = c.raw_value;
    }

    for (let i = 0; i < nrpn.length; i++) {
        let c = nrpn[i];
        if (typeof c === 'undefined') continue;
        // console.log(`getAllValues: nrpn ${i}: ${c.name}: ${c.raw_value}`);
        a.nrpn[i] = c.raw_value;
    }

    return a;
};

/**
 *
 * @param values
 */
const setAllValues = function (values) {

    // console.log('setAllValues()', values);

    for (let i = 0; i < values.cc.length; i++) {
        if (typeof control[i] === 'undefined') continue;
        // console.log(`control[${i}].raw_value = ${values.cc[i]}`);
        control[i].raw_value = values.cc[i];
        control[i].value = control[i].human(control[i].raw_value);  //TODO: create a function setRawValue() or setValue() ?
    }

    for (let i = 0; i < values.nrpn.length; i++) {
        if (typeof nrpn[i] === 'undefined') continue;
        // console.log(`set nrpn[${i}] = ${values.nrpn[i]}`);
        nrpn[i].raw_value = values.nrpn[i];
        nrpn[i].value = nrpn[i].human(nrpn[i].raw_value);
    }

};

/**
 * @param groups Array of group names. Specify which control groups to randomize. Example: ["sub", "lfo1", "lfo2", "osc1", "osc2"]
 */
const randomize = function (groups) {

    // console.log('randomize()', groups);

    for (let i = 0; i < groups.length; i++) {

        // console.log(groups[i]);

        let g = control_groups[groups[i]];
        for (let i = 0; i < g.controls.length; i++) {

            let c;
            let t = g.controls[i].type;
            let n = g.controls[i].number;
            if (t === 'cc') {
                c = control[n];
            } else if (t === 'nrpn') {
                c = nrpn[n];
            } else {
                console.error(`invalid control type: ${g.controls[i].type}`)
            }

            let v;
            if (c.hasOwnProperty('randomize')) {
                v = c.randomize;
            } else {
                if (c.on_off) {
                    v = Math.round(Math.random());
                    // console.log(`randomize #${c.cc_type}-${i}=${v} with 0|1 value = ${v}`);
                } else {
                    let min = Math.min(...c.cc_range);
                    v = Math.round(Math.random() * (Math.max(...c.cc_range) - min)) + min;  //TODO: step
                    // console.log(`randomize #${c.cc_type}-${c.cc_number}=${v} with min=${min} c.max_raw=${Math.max(...c.cc_range)}, v=${v}`);
                }
            }
            c.raw_value = v;
            c.randomized = true;
        }
    }

};

/**
 *
 */
const init = function () {

    function _init(controls) {
        for (let i = 0; i < controls.length; i++) {
            let c = controls[i];
            if (typeof c === 'undefined') continue;
            c.raw_value = c.init_value;
            c.value = c.human(c.raw_value);
        }
    }

    _init(control);
    _init(nrpn);
};

/**
 * Only for CC, not for NRPN
 *
 * Returns an array of "midi messages" to send to update control to value
 * @param ctrl
 */
const getMidiMessagesForNormalCC = function (ctrl) {
    // console.log('BS2.getMidiMessagesForControl', control_number, value);
    if (ctrl.cc_type !== 'cc') return [];
    let CC = [];
    let value = getControlValue(ctrl);
    if (ctrl.lsb < 0) {
        CC.push([ctrl.cc_number, value]);
    } else {
        CC.push([ctrl.cc_number, value >>> 1]);          // we discard the lsb
        CC.push([ctrl.lsb, value % 2 === 0 ? 0 : 64]);   // that we put in the second CC message
    }
    return CC;
};

/**
 * Module initialization
 */
// defineControls();
// defineNRPNs();

export default {
    name: "Bass Station II",
    name_device_in: "Bass Station II",
    name_device_out: "Bass Station II",
    meta,
    control_id,
    nrpn_id,
    control,
    nrpn,
    control_groups,
    SUB_WAVE_FORMS : consts.SUB_WAVE_FORMS,
    SUB_OCTAVE : consts.SUB_OCTAVE,
    OSC_RANGES : consts.OSC_RANGES,
    OSC_WAVE_FORMS : consts.OSC_WAVE_FORMS,
    COARSE_VALUES: consts.COARSE_VALUES,
    LFO_WAVE_FORMS : consts.LFO_WAVE_FORMS,
    LFO_SPEED_SYNC : consts.LFO_SPEED_SYNC,
    LFO_SYNC : consts.LFO_SYNC,
    FILTER_SHAPES : consts.FILTER_SHAPES,
    FILTER_SLOPE : consts.FILTER_SLOPE,
    FILTER_TYPE : consts.FILTER_TYPE,
    ENV_TRIGGERING : consts.ENV_TRIGGERING,
    ARP_NOTES_MODE : consts.ARP_NOTES_MODE,
    ARP_OCTAVES : consts.ARP_OCTAVES,
    ARP_SEQUENCES: consts.ARP_SEQUENCES,
    init,
    randomize,
    getControlValue,
    setControlValue,
    getAllValues,
    setAllValues,
    getADSREnv,
    setValuesFromSysEx: sysex.setDump,     // set values from a SysEx dump
    getSysEx: sysex.getDump,     // export all values as a SysEx dump
    validate: sysex.validate,   // validate a SysEx dump
    doubleByteValue,
    getMidiMessagesForNormalCC
};
