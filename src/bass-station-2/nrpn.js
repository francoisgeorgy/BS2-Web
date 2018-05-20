import * as consts from "./constants.js";
import mapper from "./mappers.js";

export const nrpn_id = {
    osc1_waveform: 72,
    osc2_waveform: 82,

    amp_env_triggering: 73,
    mod_env_triggering: 105,

    mod_wheel_filter_freq: 94,          // FN key "Mod Wheel Filter Freq"
    mod_wheel_lfo1_osc_pitch: 70,
    mod_wheel_lfo2_filter_freq: 71,
    mod_wheel_osc2_pitch: 78,

    aftertouch_filter_freq: 74,
    aftertouch_lfo1_to_osc_pitch: 75,
    aftertouch_lfo2_speed: 76,

    lfo1_key_sync: 89,      // FN key "Key Sync LFO 1"
    lfo1_speed_sync: 88,    // FN key "Speed/Sync LFO 1"
    lfo1_sync_value: 87,
    lfo1_slew: 86,          // FN key "Slew LFO 1"

    lfo2_key_sync: 93,      // FN key "Key Sync LFO 2"
    lfo2_speed_sync: 92,    // FN key "Speed/Sync LFO 2"
    lfo2_sync_value: 91,
    lfo2_slew: 90,          // FN Key "Slew LFO 2"

    arp_seq_retrig: 106
};

export const nrpn = new Array(127);

function defineNRPNs() {
    nrpn[nrpn_id.osc1_waveform] = { // 0 (MSB), 72 (LSB)
        name: "Osc1 Waveform",
        cc_range: [0, 3],
        human: v => {
            return consts.OSC_WAVE_FORMS[v % consts.OSC_WAVE_FORMS.length]
        },
        init_value: 2,
        sysex: {
            offset: 19,
            mask: [0x60]
        }
    };
    nrpn[nrpn_id.osc2_waveform] = { // 0 (MSB), 82 (LSB)
        name: "Osc2 Waveform",
        cc_range: [0, 3],
        human: v => {
            return consts.OSC_WAVE_FORMS[v % consts.OSC_WAVE_FORMS.length]
        },
        init_value: 2,
        sysex: {
            offset: 24,
            mask: [0x03]
        }
    };
    nrpn[nrpn_id.amp_env_triggering] = { // 0 (MSB), 73 (LSB)
        name: "Amp Env Triggering",
        cc_range: [0, 2],
        human: v => consts.ENV_TRIGGERING[v],
        sysex: {
            offset: 55,
            mask: [0x06]
        }
    };
    nrpn[nrpn_id.mod_env_triggering] = { // 0 (MSB), 105 (LSB)
        name: "Mod Env Triggering",
        // range: [0, 2],
        // choice: [0,1,2],
        cc_range: [0, 2],
        human: v => consts.ENV_TRIGGERING[v],
        sysex: {
            offset: 62,
            mask: [0x0C]
        }
    };
    // MOD WHEEL
    nrpn[nrpn_id.mod_wheel_filter_freq] = { // 94
        name: "Mod Wheel Filter Freq",
        range: [-64, 63],
        human: mapper._63, // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
        cc_center: [63, 64],
        sysex: {
            offset: 82,
            mask: [0x1F, 0x60]
        }
    };
    nrpn[nrpn_id.mod_wheel_lfo1_osc_pitch] = { // 0 (MSB), 70 (LSB)
        name: "Mod Wheel LFO1 to Osc Pitch",
        range: [-63, 63],
        human: mapper._63,  // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
        cc_center: [63, 64],
        init_value: 74,
        sysex: {
            offset: 83,
            mask: [0x0F, 0x70]
        }
    };
    nrpn[nrpn_id.mod_wheel_lfo2_filter_freq] = { // 0 (MSB), 71 (LSB)
        name: "Mod Wheel LFO2 to Filter Freq",
        range: [-63, 63],
        human: mapper._63,  // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
        cc_center: [63, 64],
        sysex: {
            offset: 84,
            mask: [0x07, 0x78]
        }
    };
    nrpn[nrpn_id.mod_wheel_osc2_pitch] = { // 0 (MSB), 78 (LSB)
        name: "Mod Wheel Osc2 Pitch",
        range: [-63, 63],
        human: mapper._63, // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
        cc_center: [63, 64],
        sysex: {
            offset: 85,
            mask: [0x03, 0x7C]
        }
    };
    // AFTERTOUCH
    nrpn[nrpn_id.aftertouch_filter_freq] = { // 0 (MSB), 74 (LSB)
        name: "Aftertouch Filter Freq",
        range: [-63, 63],
        human: mapper._63,
        cc_center: [63, 64],
        init_value: 63,
        sysex: {
            offset: 86,
            mask: [0x01, 0x7E]
        }
    };
    nrpn[nrpn_id.aftertouch_lfo1_to_osc_pitch] = { // 0 (MSB), 75 (LSB)
        name: "Aftertouch LFO1 to Osc 1+2 Pitch",
        range: [-63, 63],
        human: mapper._63,
        cc_center: [63, 64],
        sysex: {
            offset: 88,
            mask: [0x7F]
        }
    };
    nrpn[nrpn_id.aftertouch_lfo2_speed] = { // 0 (MSB), 76 (LSB)
        name: "Aftertouch LFO2 Speed",
        range: [-63, 63],
        human: mapper._63,     // todo: check
        cc_center: [63, 64],
        sysex: {
            offset: 89,
            mask: [0x3F, 0x40]
        }
    };
    // LFO 1
    // FN key "Key Sync LFO 1"
    nrpn[nrpn_id.lfo1_key_sync] = { // 0 (MSB), 89 (LSB)
        name: "LFO1 Key Sync",
        on_off: true,
        cc_range: [0, 1],
        human: v => v,
        init_value: 0,
        sysex: {
            offset: 69,
            mask: [0x10]
        }
    };
    // FN key "Speed/Sync LFO 1"
    nrpn[nrpn_id.lfo1_speed_sync] = { // 0 (MSB), 88 (LSB)
        name: "LFO1 Speed/Sync",
        // range: [0, 1],
        // choice: [0,1],
        cc_range: [0, 1],
        human: v => consts.LFO_SPEED_SYNC[v],
        sysex: {
            offset: 69,
            mask: [0x08]
        }
    };
    nrpn[nrpn_id.lfo1_sync_value] = { // 87
        name: "LFO1 Sync Value",
        // msb: -1,
        cc_range: [0, 34],
        // max_raw: 34,
        human: v => consts.LFO_SYNC[v],
        sysex: {
            offset: 67,
            // mask: [0x07, 0xE0]
            mask: [0x07, 0x70]  // OK
        }
    };
    // FN key "Slew LFO 1"
    nrpn[nrpn_id.lfo1_slew] = { // 0 (MSB), 86 (LSB)
        name: "LFO1 Slew",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 65,
            mask: [0x3F, 0x40]
        }
    };
    // LFO 2
    // FN key "Key Sync LFO 2"
    nrpn[nrpn_id.lfo2_key_sync] = { // 0 (MSB), 93 (LSB)
        name: "LFO2 Key Sync",
        // range: [0, 1],
        on_off: true,
        cc_range: [0, 1],
        human: v => v,
        init_value: 1,
        sysex: {
            offset: 76,
            mask: [0x20]
        }
    };
    // FN key "Speed/Sync LFO 2"
    nrpn[nrpn_id.lfo2_speed_sync] = { // 0 (MSB), 92 (LSB)
        name: "LFO2 Speed/Sync",
        // range: [0, 1],
        // choice: [0,1],
        cc_range: [0, 1],
        human: v => consts.LFO_SPEED_SYNC[v],
        sysex: {
            offset: 76,
            mask: [0x10]
        }
    };
    nrpn[nrpn_id.lfo2_sync_value] = { // 0 (MSB), 91 (LSB)
        name: "LFO2 Sync Value",
        cc_range: [0, 34],
        // max_raw: 34,
        human: v => consts.LFO_SYNC[v],
        sysex: {
            offset: 74,
            mask: [0x0F, 0x60]  // OK
        }
    };
    // FN Key "Slew LFO 2"
    nrpn[nrpn_id.lfo2_slew] = { // 0 (MSB), 90 (LSB)
        name: "LFO2 Slew",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 72,
            mask: [0x7F]
        }
    };
    // ARP
    nrpn[nrpn_id.arp_seq_retrig] = { // 106
        name: "Arp Seq Retrig",
        on_off: true,
        cc_range: [0, 1],
        human: v => v,
        init_value: 1,
        sysex: {
            offset: 77,
            mask: [0x20]
        }
    };

    // add the missing default properties
    nrpn.forEach(function (obj) {

        obj.cc_number = nrpn.indexOf(obj);   // is also the lsb
        obj.cc_type = "nrpn";

        let bits = 7;
        if (obj.hasOwnProperty("lsb")) {
            bits = 8;
        } else {
            obj.lsb = -1;  // define the prop.
        }

        if (!obj.hasOwnProperty("on_off")) {
            obj.on_off = false;
        }

        if (!obj.hasOwnProperty("range")) {
            obj.range = obj.on_off ? [0, 1] : [0, (1 << bits) - 1];
        }

        if (!obj.hasOwnProperty("cc_range")) {
            obj.cc_range = [0, (1 << bits) - 1];
        }

        // pre-computed value that may be useful:
        obj.cc_min = Math.min(...obj.range);
        obj.cc_max = Math.max(...obj.range);
        obj.cc_delta = obj.cc_max - obj.cc_min;

        if (!obj.hasOwnProperty("init_value")) {
            if (obj.hasOwnProperty("cc_center")) {
                // console.log(`nrpn-${obj.cc_number}: obj.init_value = obj.cc_center: ${obj.init_value}=${obj.cc_center}`);
                obj.init_value = Array.isArray(obj.cc_center) ? obj.cc_center[0] : obj.cc_center;
            } else if ((Math.min(...obj.range) < 0) && (Math.max(...obj.range) > 0)) {
                obj.init_value = (1 << (bits - 1)) - 1; // very simple rule: we take max/2 as default value
            } else {
                obj.init_value = Math.min(...obj.range);
            }
        }

        if (!obj.hasOwnProperty("raw_value")) {
            obj.raw_value = obj.init_value;
        }

        obj.changed = () => obj.raw_value !== obj.init_value;

    });

} // defineNRPNs()

defineNRPNs();
