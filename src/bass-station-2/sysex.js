import {control} from "./cc.js";
import {nrpn} from "./nrpn.js";
import meta from "./meta.js";
import * as Utils from "./utils.js";
import * as Bits from "../lib/bits-utils.js";

/**
 *
 * @param data
 * @returns {boolean}
 */
const validate = function (data) {

    const SYSEX_START = 0xF0;
    const SYSEX_END = 0xF7;

    if (data[0] !== SYSEX_START) return false;

    //if (data.length != 154) return false;
    let offset = meta.signature.sysex.offset;
    for (let i = 0; i < meta.signature.sysex.value.length; i++) {
        if (data[offset + i] !== meta.signature.sysex.value[i]) {
            console.log(`invalid sysex at offset ${offset + i}`, data[offset + i]);
            return false;
        }
    }
    let last_byte = 0;
    for (let i = 0; i < data.length; i++) {
        last_byte = data[i];
    }
    return last_byte === SYSEX_END;
};

/**
 * Get values from sysex data and store the value in a (new) property "value" in each control.
 * @param data
 * @param controls
 */
function decodeControls(data, controls) {

    // console.groupCollapsed("decodeSysExControls");

    for (let i = 0; i < controls.length; i++) {

        if (typeof controls[i] === "undefined") continue;
        if (!controls[i].hasOwnProperty("sysex")) continue;

        let sysex = controls[i].sysex;
        if (!sysex.hasOwnProperty("mask")) continue;

        //FIXME: bytes is not used
        let bytes = new Uint8Array(sysex.mask.length);
        for (let k = 0; k < sysex.mask.length; k++) {
            let b = data[sysex.offset + k];
            b = b & sysex.mask[k];
            bytes[k] = b;
        }

        let raw_value = 0;
        if (sysex.mask.length === 2) {
            raw_value = Utils.v16(data[sysex.offset], data[sysex.offset + 1], sysex.mask[0], sysex.mask[1])
        } else {
            raw_value = Utils.v8(data[sysex.offset], sysex.mask[0]);
        }

        // console.log(`${i} raw_value=${raw_value}`);

        if (sysex.hasOwnProperty("f")) {
            raw_value = sysex.f(raw_value);
            // console.log("${i} sysex.f(raw_value) =" + raw_value);
        }

        let final_value = 0;
        final_value = controls[i].human(raw_value);

        // console.log(`${i} ${controls[i].cc_type}-${controls[i].cc_number} raw_value=${raw_value} human=${final_value} (${controls[i].name})`);

        controls[i]["raw_value"] = raw_value;
        controls[i]["value"] = final_value;
    }

    console.groupEnd();

}

/**
 *
 * @param data
 */
function decodeMeta(data) {
    // console.log("BS2.decodeSysExMeta", data);
    meta.patch_id["value"] = data[meta.patch_id.sysex.offset];
    meta.patch_name["value"] = String.fromCharCode(...data.slice(meta.patch_name.sysex.offset, meta.patch_name.sysex.offset + meta.patch_name.sysex.mask.length));
    // console.log(`decodeSysExMeta, id=${meta.patch_id.value}, name=${meta.patch_name.value}`);
}

/**
 * Set values from a SysEx dump
 * @param data
 * @returns {boolean}
 */
const setDump = function (data) {
    if (!validate(data)) return false;
    decodeMeta(data);
    decodeControls(data, control);
    decodeControls(data, nrpn);
    return true;
};

/**
 * Create a SysEx dump data structure
 *
 * @returns {Uint8Array}
 */
const getDump = function () {

    // MSB: most significant byte
    // LSB: least significant byte
    // msb: most significant bit
    // lsb: least significant bit

    // console.group("getSysExDump", control);

    let data = new Uint8Array(154); // TODO: create CONST for sysex length  // By default, the bytes are initialized to 0

    data[0] = 0xF0;
    data[1] = 0x00;
    data[2] = 0x20;
    data[3] = 0x29;

    // - byte 05 is always 0x33
    // - bytes 30..35 are always 0x01 0x00 0x43 0x40 0x20 0x00
    // - byte 96 is always 0x40
    // - byte 104 is always 0x40

    // console.log("init constant sysex bytes");
    data[5] = 0x33;
    data[30] = 0x01;
    data[31] = 0x00;
    data[32] = 0x43;
    data[33] = 0x40;
    data[34] = 0x20;
    data[35] = 0x00;
    data[96] = 0x40;
    data[104] = 0x40;

    //TODO: factorise similar code

    // CC
    for (let i = 0; i < control.length; i++) {

        if (typeof control[i] === "undefined") continue;
        if (!control[i].hasOwnProperty("sysex")) continue;
        let sysex = control[i].sysex;
        if (!sysex.hasOwnProperty("mask")) continue;

        let v = control[i].raw_value;

        // console.log(`SYSEX [${i}] ${v} ${v.toString(2)}`);

        if (sysex.mask.length === 2) {

            // the MSB always starts at the lsb (is always right aligned)

            // left shift the value to apply the LSB mask
            let r = Bits.getRightShift(sysex.mask[1]);
            let v = control[i].raw_value << r;
            let sysex_lsb = v & sysex.mask[1];

            // how many bits has gone into the sysex_lsb?:
            let n_bits_lsb = 7 - r;

            // throw away those bits:
            v = control[i].raw_value >>> n_bits_lsb;       // Shift to the right, discarding bits shifted off, and shifting in zeroes from the left.

            // apply the MSB mask:
            let sysex_msb = v & sysex.mask[0];

            // put the values in the sysex data:
            data[sysex.offset] |= sysex_msb;
            data[sysex.offset + 1] |= sysex_lsb;

        } else {
            let r = Bits.getRightShift(sysex.mask[0]);
            v = v << r;     // shifts r bits to the left, shifting in zeroes from the right.
            data[sysex.offset] |= v;
        }

    } // CC

    // NRPN
    for (let i = 0; i < nrpn.length; i++) {

        if (typeof nrpn[i] === "undefined") continue;
        if (!nrpn[i].hasOwnProperty("sysex")) continue;
        let sysex = nrpn[i].sysex;
        if (!sysex.hasOwnProperty("mask")) continue;

        let v = nrpn[i].raw_value;

        // console.log(`SYSEX [${i}] ${v} ${v.toString(2)}`);

        if (sysex.mask.length === 2) {

            // the MSB always starts at the lsb (is always right aligned)

            // left shift the value to apply the LSB mask
            let r = Bits.getRightShift(sysex.mask[1]);
            let v = nrpn[i].raw_value << r;
            let sysex_lsb = v & sysex.mask[1];

            // how many bits has gone into the sysex_lsb:
            let n_bits_lsb = 7 - r;

            // throw away those bits:
            v = nrpn[i].raw_value >>> n_bits_lsb;       // Shift to the right, discarding bits shifted off, and shifting in zeroes from the left.

            // apply the MSB mask:
            let sysex_msb = v & sysex.mask[0];

            // put the values in the sysex data:
            data[sysex.offset] |= sysex_msb;
            data[sysex.offset + 1] |= sysex_lsb;

        } else {
            let r = Bits.getRightShift(sysex.mask[0]);
            v = v << r;     // shifts r bits to the left, shifting in zeroes from the right.
            data[sysex.offset] |= v;
        }

    } // NRPN

    // Meta
    if (meta.patch_name.value) {
        //TODO: could probably be simplified
        for (let i = 0; i < meta.patch_name.sysex.mask.length; i++) {
            data[meta.patch_name.sysex.offset + i] = meta.patch_name.value.charCodeAt(i) & meta.patch_name.sysex.mask[i];
        }
    }

    data[153] = 0xF7;   // end-of-sysex marker

    console.groupEnd();

    return data;
};

export default {
    validate,
    setDump,
    getDump
}
