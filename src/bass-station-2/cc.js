import * as consts from './constants.js';
import mapper from './mappers.js';

export const control_id = {
    patch_volume: 7,
    osc1_fine: 26,
    osc1_range: 70,
    osc1_coarse: 27,
    osc1_mod_env_depth: 71,
    osc1_lfo1_depth: 28,
    osc1_mod_env_pw_mod: 72,
    osc1_lfo2_pw_mod: 73,
    osc1_manual_pw: 74,
    osc2_fine: 29,
    osc2_range: 75,
    osc2_coarse: 30,
    osc2_mod_env_depth: 76,
    osc2_lfo1_depth: 31,
    osc2_mod_env_pw_mod: 77,
    osc2_lfo2_pw_mod: 78,
    osc2_manual_pw: 79,
    sub_osc_oct: 81,
    sub_osc_wave: 80,
    mixer_osc_1_level: 20,
    mixer_osc_2_level: 21,
    mixer_sub_osc_level: 22,
    mixer_noise_level: 23,
    mixer_ring_mod_level: 24,
    mixer_external_signal_level: 25,
    filter_type: 83,
    filter_slope: 106,
    filter_shape: 84,
    filter_frequency: 16,
    filter_resonance: 82,
    filter_mod_env_depth: 85,
    filter_lfo2_depth: 17,
    filter_overdrive: 114,
    portamento_time: 5,
    lfo1_speed: 18,
    lfo1_delay: 86,
    lfo1_wave: 88,
    lfo2_speed: 19,
    lfo2_delay: 87,
    lfo2_wave: 89,
    amp_env_attack: 90,
    amp_env_decay: 91,
    amp_env_sustain: 92,
    amp_env_release: 93,
    mod_env_attack: 102,
    mod_env_decay: 103,
    mod_env_sustain: 104,
    mod_env_release: 105,
    fx_distortion: 94,
    fx_osc_filter_mod: 115,
    arp_on: 108,
    arp_latch: 109,
    arp_rhythm: 119,
    arp_note_mode: 118,
    arp_octaves: 111,
    arp_swing: 116,
    mod: 1,
    sustain: 64,
    osc_pitch_bend_range: 107,
    osc_1_2_sync: 110,
    velocity_amp_env: 112,
    velocity_mod_env: 113,
    vca_limit: 95
};

export const control = new Array(127);
// control.cc_type = 'cc';


function defineControls() {
    /*
    control[control_id.patch_volume] = { // 7 Not found in SysEx data & does not send any CC or NRPN
        name: "Patch Volume",
        range: []
    };
    */
    control[control_id.osc1_fine] = { // 26 (MSB), 58 (LSB)
        name: "Osc1 Fine",
        lsb: 58,
        cc_range: [27, 228],
        range: [-100, 100],          // TODO: rename range to human_range or hrange
        human: mapper._100,
        sysex: {
            offset: 22,
            mask: [0x03, 0x7E]
        }
    };
    control[control_id.osc1_range] = { // 70
        name: "Osc1 Range",
        range: [63, 66],
        cc_range: [63, 66],
        human: v => consts.OSC_RANGES[v], // v is cc raw_value
        init_value: 64,
        sysex: {
            offset: 20,
            mask: [0x07, 0x78]
        }
    };
    control[control_id.osc1_coarse] = { // 27 (MSB), 59 (LSB)
        name: "Osc1 Coarse",
        lsb: 59,
        range: [-12, 12],
        human: v => mapper._12(v).toFixed(1),
        // parse: _parse_12,
        sysex: {
            offset: 21,
            mask: [0x07, 0x7C]
        }
    };
    control[control_id.osc1_mod_env_depth] = { // 71
        name: "Osc1 Mod Env Depth",
        range: [-63, 63],
        human: mapper._63,
        // parse: _parse_63,
        sysex: {
            offset: 98,
            mask: [0x1F, 0x60]
        }
    };
    control[control_id.osc1_lfo1_depth] = { // 28 (MSB), 60 (LSB)
        name: "Osc1 LFO1 Depth",
        lsb: 60,
        range: [-127, 127],
        human: mapper._127,
        sysex: {
            offset: 90,
            mask: [0x3F, 0x60]
        }
    };
    control[control_id.osc1_mod_env_pw_mod] = { // 72
        name: "Osc1 Mod Env PW Mod",
        range: [-63, 63],
        human: mapper._63,
        //map_r: _63_reverse,
        sysex: {
            offset: 101,
            mask: [0x01, 0x7C]
        }
    };
    control[control_id.osc1_lfo2_pw_mod] = { // 73
        name: "Osc1 LFO2 PW Mod",
        range: [-90, 90],
        human: mapper._90_90,
        sysex: {
            offset: 93,
            mask: [0x03, 0x7C]
        }
    };
    control[control_id.osc1_manual_pw] = { // 74
        name: "Osc1 Manual PW",
        range: [5, 95],
        human: mapper._5_95,
        init_value: 64,
        sysex: {
            offset: 19,
            mask: [0x0F, 0x70]
        }
    };
    control[control_id.osc2_fine] = { // 29 (MSB), 61 (LSB)
        name: "Osc2 Fine",
        lsb: 61,
        cc_range: [27, 228],
        range: [-100, 100],
        human: mapper._100,
        sysex: {
            offset: 28,
            mask: [0x0F, 0x78]
        }
    };
    control[control_id.osc2_range] = { // 75
        name: "Osc2 Range",
        range: [63, 66],
        cc_range: [63, 66],
        human: v => consts.OSC_RANGES[v], // v is cc raw_value
        init_value: 64,
        sysex: {
            offset: 26,
            mask: [0x1F, 0x60]
        }
    };
    control[control_id.osc2_coarse] = { // 30 (MSB), 62 (LSB)
        name: "Osc2 Coarse",
        lsb: 62,
        range: [-12, 12],
        human: v => mapper._12(v).toFixed(1),
        // parse: _parse_12,
        sysex: {
            offset: 27,
            mask: [0x1F, 0x70]
        }
    };
    control[control_id.osc2_mod_env_depth] = { // 76
        name: "Osc2 Mod Env Depth",
        range: [-63, 63],
        human: mapper._63,
        // parse: _parse_63,
        sysex: {
            offset: 99,
            mask: [0x0F, 0x70]
        }
    };
    control[control_id.osc2_lfo1_depth] = { // 31 (MSB), 63 (LSB)
        name: "Osc2 LFO1 Depth",
        range: [-127, 127],
        lsb: 63,
        human: mapper._127,
        sysex: {
            offset: 91,
            mask: [0x1F, 0x70]
        }
    };
    control[control_id.osc2_mod_env_pw_mod] = { // 77
        name: "Osc2 Mod Env PW Mod",
        range: [-63, 63],
        human: mapper._63,
        // parse: _parse_63,
        sysex: {
            offset: 102,
            mask: [0x01, 0x7E]
        }
    };
    control[control_id.osc2_lfo2_pw_mod] = { // 78
        name: "Osc2 LFO2 PW Mod",
        range: [-90, 90],
        human: v => v,  // todo
        sysex: {
            offset: 94,
            mask: [0x01, 0x7E]
        }
    };
    control[control_id.osc2_manual_pw] = { // 79
        name: "Osc2 Manual PW",
        range: [5, 95],
        human: mapper._5_95,
        init_value: 64,
        sysex: {
            offset: 25,
            mask: [0x3F, 0x40]  // verified OK
        }
    };
    control[control_id.sub_osc_wave] = { // 80
        name: "Sub Osc Wave",
        range: [0, 2],
        cc_range: [0, 2],
        human: v => {
            return consts.SUB_WAVE_FORMS[v % consts.SUB_WAVE_FORMS.length]
        },
        init_value: 0,
        sysex: {
            offset: 36,
            mask: [0x30]
        }
    };
    control[control_id.sub_osc_oct] = { // 81
        name: "Sub Osc Oct",
        range: [-2, -1],    // 62 --> -2, 63 --> -1
        cc_range: [62, 63],
        human: v => v - 64,
        init_value: 63,
        sysex: {
            offset: 37,
            mask: [0x08],        // 0b00001000 = -1, 0b00000000 = -2
            f: v => v === 0 ? 62 : 63
        }
    };
    control[control_id.mixer_osc_1_level] = { // 20 (MSB), 52 (LSB)
        name: "Mixer Osc 1 Level",
        range: [0, 255],
        lsb: 52,
        human: v => v,
        init_value: 255,
        sysex: {
            offset: 37,
            mask: [0x07, 0x7C]
        }
    };
    control[control_id.mixer_osc_2_level] = { // 21 (MSB), 53 (LSB)
        name: "Mixer Osc 2 Level",
        range: [0, 255],
        lsb: 53,
        human: v => v,
        sysex: {
            offset: 38,
            mask: [0x03, 0x7E]
        }
    };
    control[control_id.mixer_sub_osc_level] = { // 22 (MSB), 54 (LSB)
        name: "Mixer Sub Osc Level",
        range: [0, 255],
        lsb: 54,
        human: v => v,
        sysex: {
            offset: 39,
            mask: [0x01, 0x7F]
        }
    };
    control[control_id.mixer_noise_level] = { // 23 (MSB), 55 (LSB)
        name: "Mixer Noise Level",
        range: [0, 255],
        lsb: 55,
        human: v => v,
        sysex: {
            offset: 41,
            mask: [0x7F, 0x40]
        }
    };
    control[control_id.mixer_ring_mod_level] = { // 24 (MSB), 56 (LSB)
        name: "Mixer Ring Mod Level",
        range: [0, 255],
        lsb: 56,
        human: v => v,
        sysex: {
            offset: 42,
            mask: [0x3F, 0x60]
        }
    };
    control[control_id.mixer_external_signal_level] = { // 25 (MSB), 57 (LSB)
        name: "Mixer External Signal Level",
        range: [0, 255],
        lsb: 57,
        human: v => v,
        sysex: {
            offset: 43,
            mask: [0x1F, 0x70]
        }
    };
    control[control_id.filter_type] = { // 83
        name: "Filter Type",
        cc_range: [0, 1],
        human: v => consts.FILTER_TYPE[v],
        sysex: {
            offset: 48,
            mask: [0x04]
        }
    };
    control[control_id.filter_slope] = { // 106
        name: "Filter Slope",
        cc_range: [0, 1],
        human: v => consts.FILTER_SLOPE[v],
        init_value: 1,
        sysex: {
            offset: 48,
            mask: [0x08]
        }
    };
    control[control_id.filter_shape] = { // 84
        name: "Filter Shape",
        cc_range: [0, 2],
        human: v => consts.FILTER_SHAPES[v],
        sysex: {
            offset: 48,
            mask: [0x03]
        }
    };
    control[control_id.filter_frequency] = { // 16 (MSB), 48 (LSB)
        name: "Filter Frequency",
        range: [0, 255],
        lsb: 48,
        human: v => v,
        init_value: 255,
        sysex: {
            offset: 44,
            mask: [0x0F, 0x78]
        }
    };
    control[control_id.filter_resonance] = { // 82
        name: "Filter Resonance",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 45,
            mask: [0x03, 0x7C]
        }
    };
    control[control_id.filter_mod_env_depth] = { // 85
        name: "Filter Mod Env Depth",
        range: [-63, 63],
        human: mapper._63,
        sysex: {
            offset: 105,
            mask: [0x3F, 0x40]
        }
    };
    control[control_id.filter_lfo2_depth] = { // 17 (MSB), 49 (LSB)
        name: "Filter LFO2 Depth",
        range: [-127, 127],
        lsb: 49,
        human: mapper._127,
        sysex: {
            offset: 97,
            mask: [0x7F, 0x40]      // OK
        }
    };
    control[control_id.filter_overdrive] = { // 114
        name: "Filter Overdrive",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 46,
            mask: [0x01, 0x7E]
        }
    };
    control[control_id.portamento_time] = { // 5
        name: "Portamento Time",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 13,
            mask: [0x03, 0x7C]
        }
    };
    control[control_id.lfo1_wave] = { // 88
        name: "LFO1 Wave",
        cc_range: [0, 3],
        human: v => consts.LFO_WAVE_FORMS[v],
        sysex: {
            offset: 63,
            mask: [0x06]
        }
    };
    control[control_id.lfo1_speed] = { // 18 (MSB), 50 (LSB)
        name: "LFO1 Speed",
        range: [0, 255],
        lsb: 50,
        human: v => v,
        init_value: 75,
        sysex: {
            offset: 66,
            mask: [0x3F, 0x60]
        }
    };
    control[control_id.lfo1_delay] = { // 86
        name: "LFO1 Delay",
        range: [0, 127],
        human: v => {
            return v
        },
        sysex: {
            offset: 64,
            mask: [0x7F]
        }
    };
    control[control_id.lfo2_wave] = { // 89
        name: "LFO2 Wave",
        cc_range: [0, 3],
        human: v => consts.LFO_WAVE_FORMS[v],
        sysex: {
            offset: 70,
            mask: [0x0C]
        }
    };
    control[control_id.lfo2_speed] = { // 19 (MSB), 51 (LSB)
        name: "LFO2 Speed",
        range: [0, 255],
        lsb: 51,
        human: v => v,
        init_value: 53,
        sysex: {
            offset: 73,
            mask: [0x7F, 0x40]
        }
    };
    control[control_id.lfo2_delay] = { // 87
        name: "LFO2 Delay",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 70,
            mask: [0x01, 0x7E]
        }
    };
    control[control_id.amp_env_attack] = { // 90
        name: "Amp Env Attack",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 50,
            mask: [0x1F, 0x60]
        }
    };
    control[control_id.amp_env_decay] = { // 91
        name: "Amp Env Decay",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 51,
            mask: [0x0F, 0x70]
        }
    };
    control[control_id.amp_env_sustain] = { // 92
        name: "Amp Env Sustain",
        range: [0, 127],
        human: v => v,
        init_value: 127,
        sysex: {
            offset: 52,
            mask: [0x07, 0x78]
        }
    };
    control[control_id.amp_env_release] = { // 93
        name: "Amp Env Release",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 53,
            mask: [0x03, 0x7C]
        }
    };
    control[control_id.mod_env_attack] = { // 102
        name: "Mod Env Attack",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 57,
            mask: [0x3F, 0x40]
        }
    };
    control[control_id.mod_env_decay] = { // 103
        name: "Mod Env Decay",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 58,
            mask: [0x1F, 0x60]
        }
    };
    control[control_id.mod_env_sustain] = { // 104
        name: "Mod Env Sustain",
        range: [0, 127],
        human: v => v,
        init_value: 127,
        sysex: {
            offset: 59,
            mask: [0x0F, 0x70]
        }
    };
    control[control_id.mod_env_release] = { // 105
        name: "Mod Env Release",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 60,
            mask: [0x07, 0x78]
        }
    };
    control[control_id.fx_distortion] = { // 94
        name: "Fx Distortion",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 107,
            mask: [0x0F, 0x70]
        }
    };
    control[control_id.fx_osc_filter_mod] = { // 115
        name: "Fx Osc Filter Mod",
        range: [0, 127],
        human: v => v,
        sysex: {
            offset: 106,
            mask: [0x1F, 0x60]
        }
    };
    control[control_id.arp_on] = { // 108
        name: "Arp On",
        cc_range: [0, 1],
        on_off: true,
        human: v => v,
        sysex: {
            offset: 77,
            mask: [0x08]
        }
    };
    control[control_id.arp_latch] = { // 109
        name: "Arp Latch",
        on_off: true,
        cc_range: [0, 1],
        human: v => v,
        sysex: {
            offset: 77,
            mask: [0x10]
        }
    };
    control[control_id.arp_rhythm] = { // 119
        name: "Arp Rhythm",
        cc_range: [1, 32],
        human: v => v,
        init_value: 31,
        sysex: {
            offset: 80,
            mask: [0x1F]
        }
    };
    control[control_id.arp_note_mode] = { // 118
        name: "Arp Note Mode",
        cc_range: [0, 7],
        human: v => consts.ARP_NOTES_MODE[v],
        sysex: {
            offset: 79,
            mask: [0x0E]
        }
    };
    control[control_id.arp_octaves] = { // 111
        name: "Arp Octaves",
        cc_range: [1, 4],
        init_value: 1,
        human: v => v,
        sysex: {
            offset: 78,
            mask: [0x1C]
        }
    };
    control[control_id.sustain] = { // 64
        name: "Sustain",
        range: [0, 127],
        human: v => v,
        sysex: {}
    };
    control[control_id.osc_pitch_bend_range] = { // 107
        name: "Osc Pitch Bend Range",
        range: [-24, 24],       // TODO doc says 1..12
        human: mapper._24_24,
        init_value: 96,
        sysex: {
            offset: 16,
            mask: [0x7F]        // to check
        }
    };
    control[control_id.osc_1_2_sync] = { // 110
        name: "Osc 1 2 Sync",
        on_off: true,
        cc_range: [0, 1],
        human: v => v,
        sysex: {
            offset: 18,
            mask: [0x40]
        }
    };
    control[control_id.velocity_amp_env] = { // 112
        name: "Velocity Amp Env",
        range: [-63, 63],
        cc_range: [1, 127],
        init_value: 64,
        human: mapper._64,
        // parse: _parse_63,
        sysex: {
            offset: 49,
            mask: [0x3F, 0x40]
        }
    };
    control[control_id.velocity_mod_env] = { // 113
        name: "Velocity Mod Env",
        range: [-63, 63],
        cc_range: [1, 127],
        init_value: 64,
        human: mapper._64,
        // parse: _parse_63,
        sysex: {
            offset: 56,
            mask: [0x7F]
        }
    };
    control[control_id.vca_limit] = { // 95
        name: "VCA Limit",
        range: [0, 127],
        human: v => v,
        randomize: 20,  // when randomizing, set this value instead of a random value
        sysex: {
            offset: 108,
            mask: [0x07, 0x78]
        }
    };
    control[control_id.arp_swing] = { // 116
        name: "Arp Swing",
        range: [3, 97],  // 0x03..0x61   0b00000011..0b01100001
        cc_range: [3, 97],
        human: v => v,
        init_value: 50,
        sysex: {
            offset: 81,
            mask: [0x3F, 0x40]
        }
    };

    // add the missing default properties
    control.forEach(function (obj) {
        obj.cc_number = control.indexOf(obj);   // is also the msb
        obj.cc_type = 'cc';
        let bits = 7;
        if (obj.hasOwnProperty('lsb')) {
            bits = 8;
        } else {
            obj.lsb = -1;  // define the prop.
        }
        // let max_raw;
        /*
                    if (!obj.hasOwnProperty('lsb')) {
                        obj.lsb = -1;
                        bits = 7;
                        // max_raw = 127;
                    } else {
                        bits = 8;
                        // max_raw = 255;
                    }
        */
        // if (!obj.hasOwnProperty('max_raw')) {
        //     if (obj.hasOwnProperty('cc_range')) {
        //         obj.max_raw = Math.max(...obj.cc_range);
        //     } else {
        //         obj.max_raw = max_raw;
        //     }
        // }
        // if (!obj.hasOwnProperty('raw_value')) {
        //     obj.raw_value = obj.init_value;
        // }
        if (!obj.hasOwnProperty('on_off')) {
            obj.on_off = false;
        }
        if (!obj.hasOwnProperty('range')) {
            obj.range = obj.on_off ? [0, 1] : [0, (1 << bits) - 1];
        }
        if (!obj.hasOwnProperty('cc_range')) {
            obj.cc_range = [0, (1 << bits) - 1];
        }
        if (!obj.hasOwnProperty('init_value')) {
            if ((Math.min(...obj.range) < 0) && (Math.max(...obj.range) > 0)) {
                // obj.init_value = obj.max_raw >>> 1; // very simple rule: we take max/2 as default value
                obj.init_value = (1 << (bits - 1)) - 1; // very simple rule: we take max/2 as default value
            } else {
                obj.init_value = Math.min(...obj.range);    // TODO: range or cc_range ???
            }
        }
        if (!obj.hasOwnProperty('raw_value')) {
            // console.log(`${obj.name}: raw ${obj.raw_value} = ${obj.init_value}`);
            obj.raw_value = obj.init_value;
            // console.log(`${obj.name}: raw=${obj.raw_value}`, control);
        }
        // obj.changed = () => obj.raw_value !== obj.init_value;
        obj.changed = function () {
            return obj.raw_value !== obj.init_value;
        }
        // if (!obj.hasOwnProperty('parse')) {
        //     obj.parse = v => parseFloat(v);
        // }
    });
} // defineControls()

defineControls();

// export control_id;
// export control;
