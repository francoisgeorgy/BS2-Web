/**
 * BS2 defined with the "module pattern".
 * See https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch5.md for more info.
 */

"use strict";

var BS2 = (function BassStationII() {

    var control_id = {
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

    var nrpn_id = {
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

    /**
     * Group and order controls.
     * This is useful for printing or using in some configuration dialog (e.g. randomizer).
     */
    var control_groups = {
        sub: {
            name: 'Sub osc',
            controls: [
                {type: 'cc', number: control_id.sub_osc_oct},
                {type: 'cc', number: control_id.sub_osc_wave}],
        },
        lfo1: {
            name: 'LFO 1',
            controls: [
                {type: 'cc', number: control_id.lfo1_wave},
                {type: 'cc', number: control_id.lfo1_delay},
                {type: 'cc', number: control_id.lfo1_speed},
                {type: 'nrpn', number: nrpn_id.lfo1_slew},
                {type: 'nrpn', number: nrpn_id.lfo1_speed_sync},
                {type: 'nrpn', number: nrpn_id.lfo1_sync_value},
                {type: 'nrpn', number: nrpn_id.lfo1_key_sync}]
        },
        lfo2: {
            name: 'LFO 2',
            controls: [
                {type: 'cc', number: control_id.lfo2_wave},
                {type: 'cc', number: control_id.lfo2_delay},
                {type: 'cc', number: control_id.lfo2_speed},
                {type: 'nrpn', number: nrpn_id.lfo2_slew},
                {type: 'nrpn', number: nrpn_id.lfo2_key_sync},
                {type: 'nrpn', number: nrpn_id.lfo2_sync_value},
                {type: 'nrpn', number: nrpn_id.lfo2_key_sync}]
        },
        osc1: {
            name: 'Osc 1',
            controls: [
                {type: 'nrpn', number: nrpn_id.osc1_waveform},
                {type: 'cc', number: control_id.osc1_range},
                {type: 'cc', number: control_id.osc1_fine},
                {type: 'cc', number: control_id.osc1_coarse},
                {type: 'cc', number: control_id.osc1_mod_env_depth},
                {type: 'cc', number: control_id.osc1_lfo1_depth},
                {type: 'cc', number: control_id.osc1_mod_env_pw_mod},
                {type: 'cc', number: control_id.osc1_manual_pw},
                {type: 'cc', number: control_id.osc1_lfo2_pw_mod}]
        },
        osc2: {
            name: 'Osc 2',
            controls: [
                {type: 'nrpn', number: nrpn_id.osc2_waveform},
                {type: 'cc', number: control_id.osc2_range},
                {type: 'cc', number: control_id.osc2_fine},
                {type: 'cc', number: control_id.osc2_coarse},
                {type: 'cc', number: control_id.osc2_mod_env_depth},
                {type: 'cc', number: control_id.osc2_lfo1_depth},
                {type: 'cc', number: control_id.osc2_mod_env_pw_mod},
                {type: 'cc', number: control_id.osc2_manual_pw},
                {type: 'cc', number: control_id.osc2_lfo2_pw_mod},
                {type: 'cc', number: control_id.osc_1_2_sync}]
        },
        mixer: {
            name: 'Mixer',
            controls: [
                {type: 'cc', number: control_id.mixer_osc_1_level},
                {type: 'cc', number: control_id.mixer_osc_2_level},
                {type: 'cc', number: control_id.mixer_sub_osc_level},
                {type: 'cc', number: control_id.mixer_external_signal_level},
                {type: 'cc', number: control_id.mixer_ring_mod_level},
                {type: 'cc', number: control_id.mixer_noise_level}]
        },
        filter: {
            name: 'Filter',
            controls: [
                {type: 'cc', number: control_id.filter_type},
                {type: 'cc', number: control_id.filter_slope},
                {type: 'cc', number: control_id.filter_shape},
                {type: 'cc', number: control_id.filter_resonance},
                {type: 'cc', number: control_id.filter_frequency},
                {type: 'cc', number: control_id.filter_mod_env_depth},
                {type: 'cc', number: control_id.filter_lfo2_depth},
                {type: 'cc', number: control_id.filter_overdrive}],
        },
        amp_env: {
            name: 'Amp Env',
            controls: [
                {type: 'cc', number: control_id.amp_env_attack},
                {type: 'cc', number: control_id.amp_env_decay},
                {type: 'cc', number: control_id.amp_env_sustain},
                {type: 'cc', number: control_id.amp_env_release},
                {type: 'nrpn', number: nrpn_id.amp_env_triggering}]
        },
        mod_env: {
            name: 'Mod Env',
            controls: [
                {type: 'cc', number: control_id.mod_env_attack},
                {type: 'cc', number: control_id.mod_env_decay},
                {type: 'cc', number: control_id.mod_env_sustain},
                {type: 'cc', number: control_id.mod_env_release},
                {type: 'nrpn', number: nrpn_id.mod_env_triggering}]
        },
        vca: {
            name: 'VCA',
            controls: [
                {type: 'cc', number: control_id.vca_limit}],
        },
        effects: {
            name: 'Effects',
            controls: [
                {type: 'cc', number: control_id.fx_distortion},
                {type: 'cc', number: control_id.fx_osc_filter_mod}],
        },
        arp: {
            name: 'ARP',
            controls: [
                {type: 'cc', number: control_id.arp_on},
                {type: 'cc', number: control_id.arp_latch},
                {type: 'cc', number: control_id.arp_rhythm},
                {type: 'cc', number: control_id.arp_note_mode},
                {type: 'cc', number: control_id.arp_octaves},
                {type: 'cc', number: control_id.arp_swing},
                {type: 'nrpn', number: nrpn_id.arp_seq_retrig}]
        },
        keyboard: {
            name: 'Keyboard',
            controls: [
                {type: 'cc', number: control_id.sustain},
                {type: 'cc', number: control_id.portamento_time},
                {type: 'cc', number: control_id.velocity_mod_env},
                {type: 'cc', number: control_id.velocity_amp_env},
                {type: 'nrpn', number: nrpn_id.aftertouch_lfo1_to_osc_pitch},
                {type: 'nrpn', number: nrpn_id.aftertouch_lfo2_speed},
                {type: 'nrpn', number: nrpn_id.aftertouch_filter_freq}]
        },
        wheels: {
            name: 'Wheels',
            controls: [
                {type: 'cc', number: control_id.osc_pitch_bend_range},
                {type: 'nrpn', number: nrpn_id.mod_wheel_lfo1_osc_pitch},
                {type: 'nrpn', number: nrpn_id.mod_wheel_osc2_pitch},
                {type: 'nrpn', number: nrpn_id.mod_wheel_filter_freq},
                {type: 'nrpn', number: nrpn_id.mod_wheel_lfo2_filter_freq}]
        // },
        // others: {
        //     name: 'Others',
        //     controls: [control_id.mod],
        //     nrpns: []
        }
    };

    /**
     * 0..255 to -127..127
     */
    var _127 = function(v) {
        return v < 128 ? (v - 127) : (v - 128);
    };

    /**
     * 0..127 to -100..100
     */
    var _100 = function(v) {
        let x = v < 128 ? (v - 127) : (v - 128);
        if (x < -100) {
            x = -100;
        } else if (x > 100) {
            x = 100;
        }
        return x;
    };

    /**
     * 0..127 to -63..63
     */
    var _63 = function(v) {
        return v < 64 ? (v - 63) : (v - 64);
    };

    /**
     * 0..127 to -64..63
     */
    var _64 = function(v) {
        return v - 64;
    };

    /**
     * 0..255 to -12.0..12.0 with a lookup table
     */
    var _12 = function(v) {
        return COARSE_VALUES[v] / 10;
    };

    // var _12_reverse = function(v) {
    //     return COARSE_VALUES.indexOf(Math.round(v * 10));
    // };

    /**
     * 0..127 to 5..95
     */
    var _5_95 = function(v) {
        //console.log(v * 2 * 91.0 / 256 + 5 -0.4);
        // return Math.round(v * 2 * 91.0 / 256 + 5 -0.4);
        let out_max = 95;
        let out_min = 5;
        let in_max = 127;
        let in_min = 0;
        return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
    };

    /**
     * 0..127 to -90..90
     */
    var _90_90 = function(v) {
        //FIXME: value 63 must gives 0
        let out_max = 90;
        let out_min = -90;
        let in_max = 127;
        let in_min = 0;
        return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
    };

    /**
     * 0..127 to -24..24
     */
    var _24_24 = function(v) {
        //FIXME
        let out_max = 24;
        let out_min = -24;
        let in_max = 127;
        let in_min = 0;
        return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
    };

    var doubleByteValue = function(msb, lsb) {
        let v = msb << 1;
        return lsb > 0 ? (v+1) : v;
    };

    var meta = {
        patch_id: {
            name: 'Patch Number',
            value: '',
            sysex: {
                offset: 8,
                range: [0, 127],
                mask: [0x7F]  //TODO: check
            }
        },
        patch_name: {
            name: 'Patch Name',
            value: '',
            sysex: {
                offset: 137,
                range: [0, 0x7F],
                mask: [0x7F, 0x7F, 0x7F, 0x7F,
                       0x7F, 0x7F, 0x7F, 0x7F,
                       0x7F, 0x7F, 0x7F, 0x7F,
                       0x7F, 0x7F, 0x7F, 0x7F]
            }
        },
        signature: {
            name: 'Signature',
            sysex: {
                offset: 1,
                range: [],
                mask: [0x7F, 0x7F, 0x7F],
                value: [0x00, 0x20, 0x29]  // Manufacturer ID
            }
        }
    };

    var control = new Array(127);
    control.cc_type = 'cc';
    var nrpn = new Array(127);
    nrpn.cc_type = 'nrpn';

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
            range: [-100,100],          // TODO: rename range to human_range or hrange
            human: _100,
            sysex: {
                offset: 22,
                mask: [0x03, 0x7E]
            }
        };
        control[control_id.osc1_range] = { // 70
            name: "Osc1 Range",
            range: [63, 66],
            cc_range: [63, 66],
            human: v => OSC_RANGES[v], // v is cc raw_value
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
            human: v => _12(v).toFixed(1),
            // parse: _parse_12,
            sysex: {
                offset: 21,
                mask: [0x07, 0x7C]
            }
        };
        control[control_id.osc1_mod_env_depth] = { // 71
            name: "Osc1 Mod Env Depth",
            range: [-63,63],
            human: _63,
            // parse: _parse_63,
            sysex: {
                offset: 98,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.osc1_lfo1_depth] = { // 28 (MSB), 60 (LSB)
            name: "Osc1 LFO1 Depth",
            lsb: 60,
            range: [-127,127],
            human: _127,
            sysex: {
                offset: 90,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.osc1_mod_env_pw_mod] = { // 72
            name: "Osc1 Mod Env PW Mod",
            range: [-63,63],
            human: _63,
            //map_r: _63_reverse,
            sysex: {
                offset: 101,
                mask: [0x01, 0x7C]
            }
        };
        control[control_id.osc1_lfo2_pw_mod] = { // 73
            name: "Osc1 LFO2 PW Mod",
            range: [-90,90],
            human: _90_90,
            sysex: {
                offset: 93,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.osc1_manual_pw] = { // 74
            name: "Osc1 Manual PW",
            range: [5, 95],
            human: _5_95,
            init_value: 64,
            sysex: {
                offset: 19,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.osc2_fine] = { // 29 (MSB), 61 (LSB)
            name: "Osc2 Fine",
            lsb: 61,
            range: [-100,100],
            human: _100,
            sysex: {
                offset: 28,
                mask: [0x0F, 0x78]
            }
        };
        control[control_id.osc2_range] = { // 75
            name: "Osc2 Range",
            range: [63, 66],
            cc_range: [63, 66],
            human: v => OSC_RANGES[v], // v is cc raw_value
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
            human: v => _12(v).toFixed(1),
            // parse: _parse_12,
            sysex: {
                offset: 27,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.osc2_mod_env_depth] = { // 76
            name: "Osc2 Mod Env Depth",
            range: [-63, 63],
            human: _63,
            // parse: _parse_63,
            sysex: {
                offset: 99,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.osc2_lfo1_depth] = { // 31 (MSB), 63 (LSB)
            name: "Osc2 LFO1 Depth",
            range: [-127,127],
            lsb: 63,
            human: _127,
            sysex: {
                offset: 91,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.osc2_mod_env_pw_mod] = { // 77
            name: "Osc2 Mod Env PW Mod",
            range: [-63,63],
            human: _63,
            // parse: _parse_63,
            sysex: {
                offset: 102,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.osc2_lfo2_pw_mod] = { // 78
            name: "Osc2 LFO2 PW Mod",
            range: [-90,90],
            human: v => v,  // todo
            sysex: {
                offset: 94,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.osc2_manual_pw] = { // 79
            name: "Osc2 Manual PW",
            range: [5, 95],
            human: _5_95,
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
            human: v => { return SUB_WAVE_FORMS[v % SUB_WAVE_FORMS.length] },
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
            range: [0,255],
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
            range: [0,255],
            lsb: 53,
            human: v => v,
            sysex: {
                offset: 38,
                mask: [0x03, 0x7E]
            }
        };
        control[control_id.mixer_sub_osc_level] = { // 22 (MSB), 54 (LSB)
            name: "Mixer Sub Osc Level",
            range: [0,255],
            lsb: 54,
            human: v => v,
            sysex: {
                offset: 39,
                mask: [0x01, 0x7F]
            }
        };
        control[control_id.mixer_noise_level] = { // 23 (MSB), 55 (LSB)
            name: "Mixer Noise Level",
            range: [0,255],
            lsb: 55,
            human: v => v,
            sysex: {
                offset: 41,
                mask: [0x7F, 0x40]
            }
        };
        control[control_id.mixer_ring_mod_level] = { // 24 (MSB), 56 (LSB)
            name: "Mixer Ring Mod Level",
            range: [0,255],
            lsb: 56,
            human: v => v,
            sysex: {
                offset: 42,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.mixer_external_signal_level] = { // 25 (MSB), 57 (LSB)
            name: "Mixer External Signal Level",
            range: [0,255],
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
            human: v => FILTER_TYPE[v],
            sysex: {
                offset: 48,
                mask: [0x04]
            }
        };
        control[control_id.filter_slope] = { // 106
            name: "Filter Slope",
            cc_range: [0, 1],
            human: v => FILTER_SLOPE[v],
            init_value: 1,
            sysex: {
                offset: 48,
                mask: [0x08]
            }
        };
        control[control_id.filter_shape] = { // 84
            name: "Filter Shape",
            cc_range: [0, 2],
            human: v => FILTER_SHAPES[v],
            sysex: {
                offset: 48,
                mask: [0x03]
            }
        };
        control[control_id.filter_frequency] = { // 16 (MSB), 48 (LSB)
            name: "Filter Frequency",
            range: [0,255],
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
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 45,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.filter_mod_env_depth] = { // 85
            name: "Filter Mod Env Depth",
            range: [-63, 63],
            human: _63,
            // parse: _parse_63,
            sysex: {
                offset: 105,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.filter_lfo2_depth] = { // 17 (MSB), 49 (LSB)
            name: "Filter LFO2 Depth",
            range: [-127, 127],
            lsb: 49,
            human: _127,
            sysex: {
                offset: 97,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.filter_overdrive] = { // 114
            name: "Filter Overdrive",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 46,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.portamento_time] = { // 5
            name: "Portamento Time",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 13,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.lfo1_wave] = { // 88
            name: "LFO1 Wave",
            cc_range: [0, 3],
            human: v => LFO_WAVE_FORMS[v],
            sysex: {
                offset: 63,
                mask: [0x06]
            }
        };
        control[control_id.lfo1_speed] = { // 18 (MSB), 50 (LSB)
            name: "LFO1 Speed",
            range: [0,255],
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
            range: [0,127],
            human: v => { return v },
            sysex: {
                offset: 64,
                mask: [0x7F]
            }
        };
        control[control_id.lfo2_wave] = { // 89
            name: "LFO2 Wave",
            cc_range: [0, 3],
            human: v => LFO_WAVE_FORMS[v],
            sysex: {
                offset: 70,
                mask: [0x0C]
            }
        };
        control[control_id.lfo2_speed] = { // 19 (MSB), 51 (LSB)
            name: "LFO2 Speed",
            range: [0,255],
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
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 70,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.amp_env_attack] = { // 90
            name: "Amp Env Attack",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 50,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.amp_env_decay] = { // 91
            name: "Amp Env Decay",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 51,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.amp_env_sustain] = { // 92
            name: "Amp Env Sustain",
            range: [0,127],
            human: v => v,
            init_value: 127,
            sysex: {
                offset: 52,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.amp_env_release] = { // 93
            name: "Amp Env Release",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 53,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.mod_env_attack] = { // 102
            name: "Mod Env Attack",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 57,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.mod_env_decay] = { // 103
            name: "Mod Env Decay",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 58,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.mod_env_sustain] = { // 104
            name: "Mod Env Sustain",
            range: [0,127],
            human: v => v,
            init_value: 127,
            sysex: {
                offset: 59,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.mod_env_release] = { // 105
            name: "Mod Env Release",
            range: [0,127],
            human: v => v,
            sysex: {
                offset: 60,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.fx_distortion] = { // 94
            name: "Fx Distortion",
            range: [0,127],
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
            human: v => ARP_NOTES_MODE[v],
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
            sysex: {
            }
        };
        control[control_id.osc_pitch_bend_range] = { // 107
            name: "Osc Pitch Bend Range",
            range: [-24, 24],       // TODO doc says 1..12
            human: _24_24,
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
            human: _64,
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
            human: _64,
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
        control.forEach(function(obj) {
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
                    obj.init_value = (1 << (bits-1)) - 1; // very simple rule: we take max/2 as default value
                } else {
                    obj.init_value = Math.min(...obj.range);
                }
            }
            if (!obj.hasOwnProperty('raw_value')) {
                obj.raw_value = obj.init_value;
            }
            // obj.changed = () => obj.raw_value !== obj.init_value;
            obj.changed = function() {
                let b = obj.raw_value !== obj.init_value;
                console.log(`changed=${b}`);
                return b;
            }
            // if (!obj.hasOwnProperty('parse')) {
            //     obj.parse = v => parseFloat(v);
            // }
        });
    } // defineControls()

    function defineNRPNs() {
        nrpn[nrpn_id.osc1_waveform] = { // 0 (MSB), 72 (LSB)
            name: "Osc1 Waveform",
            cc_range: [0, 3],
            human: v => { return OSC_WAVE_FORMS[v % OSC_WAVE_FORMS.length] },
            init_value: 2,
            sysex: {
                offset: 19,
                mask: [0x60]
            }
        };
        nrpn[nrpn_id.osc2_waveform] = { // 0 (MSB), 82 (LSB)
            name: "Osc2 Waveform",
            cc_range: [0, 3],
            human: v => { return OSC_WAVE_FORMS[v % OSC_WAVE_FORMS.length] },
            init_value: 2,
            sysex: {
                offset: 24,
                mask: [0x03]
            }
        };
        nrpn[nrpn_id.amp_env_triggering] = { // 0 (MSB), 73 (LSB)
            name: "Amp Env Triggering",
            cc_range: [0, 2],
            human: v => ENV_TRIGGERING[v],
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
            human: v => ENV_TRIGGERING[v],
            sysex: {
                offset: 62,
                mask: [0x0C]
            }
        };
    // MOD WHEEL
        nrpn[nrpn_id.mod_wheel_filter_freq] = { // 94
            name: "Mod Wheel Filter Freq",
            range: [-64,63],
            human: _63, // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
            // parse: _parse_63,
            sysex: {
                offset: 82,
                mask: [0x1F, 0x60]
            }
        };
        nrpn[nrpn_id.mod_wheel_lfo1_osc_pitch] = { // 0 (MSB), 70 (LSB)
            name: "Mod Wheel LFO1 to Osc Pitch",
            range: [-63, 63],
            human: _63,  // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
            // parse: _parse_63,
            init_value: 74,
            sysex: {
                offset: 83,
                mask: [0x0F, 0x70]
            }
        };
        nrpn[nrpn_id.mod_wheel_lfo2_filter_freq] = { // 0 (MSB), 71 (LSB)
            name: "Mod Wheel LFO2 to Filter Freq",
            range: [-63, 63],
            human: _63,  // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
            // parse: _parse_63,
            sysex: {
                offset: 84,
                mask: [0x07, 0x78]
            }
        };
        nrpn[nrpn_id.mod_wheel_osc2_pitch] = { // 0 (MSB), 78 (LSB)
            name: "Mod Wheel Osc2 Pitch",
            range: [-63, 63],
            human: _63, // TODO: make _64_63 because on the BS2 the values are -64..+63 (same for all mod wheel FN keys)
            // parse: _parse_63,
            sysex: {
                offset: 85,
                mask: [0x03, 0x7C]
            }
        };
    // AFTERTOUCH
        nrpn[nrpn_id.aftertouch_filter_freq] = { // 0 (MSB), 74 (LSB)
            name: "Aftertouch Filter Freq",
            range: [-63, 63],
            human: _63,
            // parse: _parse_63,
            init_value: 63,
            sysex: {
                offset: 86,
                mask: [0x01, 0x7E]
            }
        };
        nrpn[nrpn_id.aftertouch_lfo1_to_osc_pitch] = { // 0 (MSB), 75 (LSB)
            name: "Aftertouch LFO1 to Osc 1+2 Pitch",
            range: [-63, 63],
            human: _63,
            // parse: _parse_63,
            sysex: {
                offset: 88,
                mask: [0x7F]
            }
        };
        nrpn[nrpn_id.aftertouch_lfo2_speed] = { // 0 (MSB), 76 (LSB)
            name: "Aftertouch LFO2 Speed",
            range: [-63,63],
            human: _63,     // todo: check
            // parse: _parse_63,
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
            human: v => LFO_SPEED_SYNC[v],
            sysex: {
                offset: 69,
                mask: [0x08]
            }
        };
        nrpn[nrpn_id.lfo1_sync_value] = { // 87
            name: "LFO1 Sync Value",
            msb: -1,
            cc_range: [0, 34],
            // max_raw: 34,
            human: v => LFO_SYNC[v],
            sysex: {
                offset: 67,
                mask: [0x07, 0xE0]  // OK
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
            human: v => LFO_SPEED_SYNC[v],
            sysex: {
                offset: 76,
                mask: [0x10]
            }
        };
        nrpn[nrpn_id.lfo2_sync_value] = { // 0 (MSB), 91 (LSB)
            name: "LFO2 Sync Value",
            cc_range: [0, 34],
            // max_raw: 34,
            human: v => LFO_SYNC[v],
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
        nrpn.forEach(function(obj) {
            obj.cc_number = nrpn.indexOf(obj);   // is also the lsb
            obj.cc_type = 'nrpn';
            let bits = 7;
            if (obj.hasOwnProperty('lsb')) {
                bits = 8;
            } else {
                obj.lsb = -1;  // define the prop.
            }

            // let max_raw;
            // if (obj.hasOwnProperty('msb')) {
            //     max_raw = 255;
            // } else {
            //     obj.msb = 0;
            //     max_raw = 127;
            // }
            // if (!obj.hasOwnProperty('max_raw')) {
            //     obj.max_raw = max_raw;
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
                    obj.init_value = (1 << (bits-1)) - 1; // very simple rule: we take max/2 as default value
                } else {
                    obj.init_value = Math.min(...obj.range);
                }
            }
            if (!obj.hasOwnProperty('raw_value')) {
                obj.raw_value = obj.init_value;
            }
            obj.changed = () => obj.raw_value !== obj.init_value;
            // if (!obj.hasOwnProperty('parse')) {
            //     obj.parse = v => parseFloat(v);
            // }
        });

    } // defineNRPNs()

    var OSC_RANGES = {
        63: "16'",
        64: "8'",
        65: "4'",
        66: "2'"
    };

    var OSC_WAVE_FORMS = [
        "sine", "triangle", "saw", "pulse"   // 0..3
    ];

    var LFO_WAVE_FORMS = [
        "triangle", "saw", "square", "S+H"  // 0..3
    ];

    var LFO_SPEED_SYNC = [
        "speed", "sync"     // 0..1
    ];
    /*
    var LFO_SYNC = [
        "64 beats", "48 beats", "42 beats", "36 beats",
        "32 beats", "30 beats", "28 beats", "24 beats",
        "21+2/3", "20 beats", "18+2/3", "18 beats",
        "16 beats", "13+1/3", "12 beats", "10+2/3",
        "8 beats", "6 beats", "5+1/3", "4 beats",
        "3 beats", "2+2/3", "2nd", "4th dot",
        "1+1/3", "4th", "8th dot", "4th trip",
        "8th", "16th dot", "8th trip", "16th",
        "16th trip", "32nd", "32nd trip"
    ];
    */
/*
    var LFO_SYNC = [
        "64", "48", "42", "36",
        "32", "30", "28", "24",
        "21+2/3", "20", "18+2/3", "18",
        "16", "13+1/3", "12", "10+2/3",
        "8", "6", "5+1/3", "4",
        "3", "2+2/3", "1/2", "1/4 &bull;",
        "1+1/3", "1/4", "1/8 &bull;", "1/4 tr",
        "1/8", "1/16 &bull;", "1/8 tr", "1/16",
        "1/16 tr", "1/32", "1/32 tr"
    ];
*/
    var LFO_SYNC = [
        "64", "48", "42", "36",   // html entities are not supported in SVG text element
        "32", "30", "28", "24",
        "21 ⅔", "20", "18 ⅔", "18",
        "16", "13 ⅓", "12", "10 ⅔",
        "8", "6", "5 ⅓", "4",
        "3", "2 ⅔", "1/2", "1/4.",
        "1 ⅓", "1/4", "1/8.", "1/4 tr",
        "1/8", "1/16.", "1/8tr", "1/16",
        "1/16tr", "1/32", "1/32tr"
    ];

    var SUB_WAVE_FORMS = [
        "sine", "pulse", "square"
    ];

    var SUB_OCTAVE = {
        63: "octave -1",
        62: "octave -2"
    };

    var FILTER_SHAPES = [
        "low-pass", "band-pass", "hi-pass"
    ];

    var FILTER_SLOPE = [
        "12dB", "24dB"
    ];

    var FILTER_TYPE = [
        "classic", "acid"
    ];

    var ENV_TRIGGERING = [
        "multi", "single", "autoglide"  // 0, 1, 2
    ];

    var ARP_NOTES_MODE = [
        "up", "down", "up-down", "up-down 2", "played", "random", "play", "record"
    ];

    var ARP_OCTAVES = [
        1, 2, 3, 4
    ];

    var ARP_SEQUENCES = [
        '',
        '4 4 4 4  4 4 4 4',  // quarter notes
        '8 r8 8 r8 8 r8 8 r8  8 r8 8 r8 8 r8 8 r8', // eighth notes and eighth rests
        '4 8 r8 4 8 r8  4 8 r8 4 8 8'
        //TODO: to be completed

    ];

    // Mapping 0..255 to -12.0..12.0
    var COARSE_VALUES = [
        -120, // -12.0; -12.00000; 0
        -119, // -11.9; -11.89699; 1
        -118, // -11.8; -11.79398; 2
        -117, // -11.7; -11.69098; 3
        -116, // -11.6; -11.58799; 4
        -115, // -11.5; -11.48498; 5
        -114, // -11.4; -11.38198; 6
        -113, // -11.3; -11.27897; 7
        -112, // -11.2; -11.17596; 8
        -111, // -11.1; -11.07295; 9
        -110, // -11.0; -11.00002; 10
        -109, // -10.9; -10.86696; 11
        -108, // -10.8; -10.76395; 12
        -107, // -10.7; -10.66094; 13
        -106, // -10.6; -10.55794; 14
        -105, // -10.5; -10.45493; 15
        -104, // -10.4; -10.35192; 16
        -102, // -10.2; -10.24894; 17
        -101, // -10.1; -10.14593; 18
        -100, // -10.0; -10.00001; 19
        -100, // -10.0; -10.00001; 20
        -99, // -9.9; -9.93991; 21
        -98, // -9.8; -9.83690; 22
        -97, // -9.7; -9.73390; 23
        -96, // -9.6; -9.63091; 24
        -95, // -9.5; -9.52790; 25
        -94, // -9.4; -9.42490; 26
        -93, // -9.3; -9.32189; 27
        -92, // -9.2; -9.21888; 28
        -91, // -9.1; -9.11587; 29
        -90, // -9.0; -9.00000; 30
        -90, // -9.0; -9.00000; 31
        -89, // -8.9; -8.90988; 32
        -88, // -8.8; -8.80687; 33
        -87, // -8.7; -8.70386; 34
        -86, // -8.6; -8.60086; 35
        -85, // -8.5; -8.49785; 36
        -84, // -8.4; -8.39484; 37
        -83, // -8.3; -8.29186; 38
        -82, // -8.2; -8.18885; 39
        -81, // -8.1; -8.08584; 40
        -80, // -8.0; -8.00002; 41
        -80, // -8.0; -8.00002; 42
        -79, // -7.9; -7.87982; 43
        -78, // -7.8; -7.77682; 44
        -77, // -7.7; -7.67381; 45
        -76, // -7.6; -7.57082; 46
        -75, // -7.5; -7.46782; 47
        -74, // -7.4; -7.36481; 48
        -73, // -7.3; -7.26180; 49
        -72, // -7.2; -7.15879; 50
        -71, // -7.1; -7.05578; 51
        -70, // -7.0; -7.00001; 52
        -70, // -7.0; -7.00001; 53
        -68, // -6.8; -6.84979; 54
        -67, // -6.7; -6.74678; 55
        -66, // -6.6; -6.64378; 56
        -65, // -6.5; -6.54077; 57
        -64, // -6.4; -6.43776; 58
        -63, // -6.3; -6.33478; 59
        -62, // -6.2; -6.23177; 60
        -61, // -6.1; -6.12876; 61
        -60, // -6.0; -6.00000; 62
        -60, // -6.0; -6.00000; 63
        -59, // -5.9; -5.92274; 64
        -58, // -5.8; -5.81974; 65
        -57, // -5.7; -5.71673; 66
        -56, // -5.6; -5.61374; 67
        -55, // -5.5; -5.51074; 68
        -54, // -5.4; -5.40773; 69
        -53, // -5.3; -5.30472; 70
        -52, // -5.2; -5.20171; 71
        -51, // -5.1; -5.09870; 72
        -50, // -5.0; -5.00002; 73
        -50, // -5.0; -5.00002; 74
        -49, // -4.9; -4.89271; 75
        -48, // -4.8; -4.78970; 76
        -47, // -4.7; -4.68670; 77
        -46, // -4.6; -4.58369; 78
        -45, // -4.5; -4.48068; 79
        -44, // -4.4; -4.37767; 80
        -43, // -4.3; -4.27469; 81
        -42, // -4.2; -4.17168; 82
        -41, // -4.1; -4.06867; 83
        -40, // -4.0; -4.00001; 84
        -40, // -4.0; -4.00001; 85
        -39, // -3.9; -3.86266; 86
        -38, // -3.8; -3.75965; 87
        -37, // -3.7; -3.65666; 88
        -36, // -3.6; -3.55366; 89
        -35, // -3.5; -3.45065; 90
        -33, // -3.3; -3.34764; 91
        -32, // -3.2; -3.24463; 92
        -31, // -3.1; -3.14162; 93
        -30, // -3.0; -3.00000; 94
        -30, // -3.0; -3.00000; 95
        -29, // -2.9; -2.93563; 96
        -28, // -2.8; -2.83262; 97
        -27, // -2.7; -2.72962; 98
        -26, // -2.6; -2.62661; 99
        -25, // -2.5; -2.52360; 100
        -24, // -2.4; -2.42059; 101
        -23, // -2.3; -2.31761; 102
        -22, // -2.2; -2.21460; 103
        -21, // -2.1; -2.11159; 104
        -20, // -2.0; -2.00002; 105
        -20, // -2.0; -2.00002; 106
        -19, // -1.9; -1.90558; 107
        -18, // -1.8; -1.80257; 108
        -17, // -1.7; -1.69956; 109
        -16, // -1.6; -1.59658; 110
        -15, // -1.5; -1.49357; 111
        -14, // -1.4; -1.39056; 112
        -13, // -1.3; -1.28755; 113
        -12, // -1.2; -1.18454; 114
        -11, // -1.1; -1.08154; 115
        -10, // -1.0; -1.00001; 116
        -10, // -1.0; -1.00001; 117
        -9, // -0.9; -0.87554; 118
        -8, // -0.8; -0.77254; 119
        -7, // -0.7; -0.66953; 120
        -6, // -0.6; -0.56652; 121
        -5, // -0.5; -0.46351; 122
        -4, // -0.4; -0.36050; 123
        -3, // -0.3; -0.25752; 124
        -2, // -0.2; -0.15451; 125
        -1, // -0.1; -0.05150; 126
        0, // 0.0; 0.00000; 127
        0, // 0.0; 0.00000; 128
        1, // 0.1; 0.05150; 129
        2, // 0.2; 0.15451; 130
        3, // 0.3; 0.25752; 131
        4, // 0.4; 0.36051; 132
        5, // 0.5; 0.46351; 133
        6, // 0.6; 0.56652; 134
        7, // 0.7; 0.66953; 135
        8, // 0.8; 0.77254; 136
        9, // 0.9; 0.87555; 137
        10, // 1.0; 1.00001; 138
        10, // 1.0; 1.00001; 139
        11, // 1.1; 1.08154; 140
        12, // 1.2; 1.18454; 141
        13, // 1.3; 1.28755; 142
        14, // 1.4; 1.39056; 143
        15, // 1.5; 1.49357; 144
        16, // 1.6; 1.59658; 145
        17, // 1.7; 1.69956; 146
        18, // 1.8; 1.80257; 147
        19, // 1.9; 1.90558; 148
        20, // 2.0; 2.00002; 149
        20, // 2.0; 2.00002; 150
        21, // 2.1; 2.11159; 151
        22, // 2.2; 2.21460; 152
        23, // 2.3; 2.31761; 153
        24, // 2.4; 2.42059; 154
        25, // 2.5; 2.52360; 155
        26, // 2.6; 2.62661; 156
        27, // 2.7; 2.72962; 157
        28, // 2.8; 2.83262; 158
        29, // 2.9; 2.93563; 159
        30, // 3.0; 3.00000; 160
        30, // 3.0; 3.00000; 161
        31, // 3.1; 3.14162; 162
        32, // 3.2; 3.24463; 163
        33, // 3.3; 3.34764; 164
        35, // 3.5; 3.45065; 165
        36, // 3.6; 3.55366; 166
        37, // 3.7; 3.65666; 167
        38, // 3.8; 3.75965; 168
        39, // 3.9; 3.86266; 169
        40, // 4.0; 4.00001; 170
        40, // 4.0; 4.00001; 171
        41, // 4.1; 4.06867; 172
        42, // 4.2; 4.17168; 173
        43, // 4.3; 4.27469; 174
        44, // 4.4; 4.37767; 175
        45, // 4.5; 4.48068; 176
        46, // 4.6; 4.58369; 177
        47, // 4.7; 4.68670; 178
        48, // 4.8; 4.78970; 179
        49, // 4.9; 4.89271; 180
        50, // 5.0; 5.00002; 181
        50, // 5.0; 5.00002; 182
        51, // 5.1; 5.09870; 183
        52, // 5.2; 5.20171; 184
        53, // 5.3; 5.30472; 185
        54, // 5.4; 5.40773; 186
        55, // 5.5; 5.51074; 187
        56, // 5.6; 5.61374; 188
        57, // 5.7; 5.71673; 189
        58, // 5.8; 5.81974; 190
        59, // 5.9; 5.92274; 191
        60, // 6.0; 6.00000; 192
        60, // 6.0; 6.00000; 193
        61, // 6.1; 6.12876; 194
        62, // 6.2; 6.23177; 195
        63, // 6.3; 6.33478; 196
        64, // 6.4; 6.43776; 197
        65, // 6.5; 6.54077; 198
        66, // 6.6; 6.64378; 199
        67, // 6.7; 6.74678; 200
        68, // 6.8; 6.84979; 201
        70, // 7.0; 7.00001; 202
        70, // 7.0; 7.00001; 203
        71, // 7.1; 7.05579; 204
        72, // 7.2; 7.15879; 205
        73, // 7.3; 7.26180; 206
        74, // 7.4; 7.36481; 207
        75, // 7.5; 7.46782; 208
        76, // 7.6; 7.57083; 209
        77, // 7.7; 7.67381; 210
        78, // 7.8; 7.77682; 211
        79, // 7.9; 7.87982; 212
        80, // 8.0; 8.00002; 213
        80, // 8.0; 8.00002; 214
        81, // 8.1; 8.08584; 215
        82, // 8.2; 8.18885; 216
        83, // 8.3; 8.29186; 217
        84, // 8.4; 8.39484; 218
        85, // 8.5; 8.49785; 219
        86, // 8.6; 8.60086; 220
        87, // 8.7; 8.70386; 221
        88, // 8.8; 8.80687; 222
        89, // 8.9; 8.90988; 223
        90, // 9.0; 9.00000; 224
        90, // 9.0; 9.00000; 225
        91, // 9.1; 9.11587; 226
        92, // 9.2; 9.21888; 227
        93, // 9.3; 9.32189; 228
        94, // 9.4; 9.42490; 229
        95, // 9.5; 9.52791; 230
        96, // 9.6; 9.63091; 231
        97, // 9.7; 9.73390; 232
        98, // 9.8; 9.83690; 233
        99, // 9.9; 9.93991; 234
        100, // 10.0; 10.00001; 235
        100, // 10.0; 10.00001; 236
        101, // 10.1; 10.14593; 237
        102, // 10.2; 10.24894; 238
        104, // 10.4; 10.35192; 239
        105, // 10.5; 10.45493; 240
        106, // 10.6; 10.55794; 241
        107, // 10.7; 10.66094; 242
        108, // 10.8; 10.76395; 243
        109, // 10.9; 10.86696; 244
        110, // 11.0; 11.00002; 245
        111, // 11.1; 11.07295; 246
        112, // 11.2; 11.17596; 247
        113, // 11.3; 11.27897; 248
        114, // 11.4; 11.38198; 249
        115, // 11.5; 11.48498; 250
        116, // 11.6; 11.58799; 251
        117, // 11.7; 11.69098; 252
        118, // 11.8; 11.79398; 253
        119, // 11.9; 11.89699; 254
        120  // 12.0; 12.00000; 255
    ];

    /**
     * Returns the number of bit 0 before the rightmost bit set to 1.
     * @param {*} v
     */
    function getRightShift(v) {
        if (!v) return -1;  //means there isn't any 1-bit
        let i = 0;
        while ((v & 1) == 0) {
            i++;
            v = v>>1;
        }
        return i;
    }

    /**
     * return the number of bit set
     */
    function getSetBits(v) {
        for (var c = 0; v; c++) {
            v &= v - 1; // clear the least significant bit set
        }
        return c;
    }

    /**
     *
     * @param lsb
     * @param mask_lsb
     * @returns {number}
     */
    function v8(lsb, mask_lsb) {
        let r = getRightShift(mask_lsb);
        let b = (lsb & mask_lsb) >> r;
        return b;
    }

    /**
     *
     * @param msb
     * @param lsb
     * @param mask_msb
     * @param mask_lsb
     * @returns {number}
     */
    function v16(msb, lsb, mask_msb, mask_lsb) {
        let r = getRightShift(mask_lsb);
        let s = getSetBits(mask_lsb);
        let a = (msb & mask_msb) << s;
        let b = (lsb & mask_lsb) >> r;
        return a + b;
    }

    /**
     *
     * @param name
     * @returns {*}
     */
    var getADSREnv = function(name) {
        switch(name) {
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
     * @param data
     * @returns {boolean}
     */
    var validateSysEx = function(data) {

        const SYSEX_START = 0xF0;
        const SYSEX_END = 0xF7;

        if (data[0] !== SYSEX_START) return false;

        //if (data.length != 154) return false;
        let offset = meta.signature.sysex.offset;
        for (let i=0; i < meta.signature.sysex.value.length; i++) {
            if (data[offset + i] !== meta.signature.sysex.value[i]) {
                console.log(`invalid sysex at offset ${offset + i}`, data[offset + i]);
                return false;
            }
        }
        let last_byte = 0;
        for (let i=0; i<data.length; i++) {
            last_byte = data[i];
        }
        return last_byte === SYSEX_END;
    };

    /**
     * Get values from sysex data and store the value in a (new) property "value" in each control.
     * @param data
     */
    var decodeSysExControls = function(data, controls) {

        console.groupCollapsed('decodeSysExControls');

        for (let i=0; i < controls.length; i++) {

            if (typeof controls[i] === 'undefined') continue;
            if (!controls[i].hasOwnProperty('sysex')) continue;

            let sysex = controls[i].sysex;
            if (!sysex.hasOwnProperty('mask')) continue;

            let bytes = new Uint8Array(sysex.mask.length);

            for (let k=0; k<sysex.mask.length; k++) {
                let b = data[sysex.offset + k];
                b = b & sysex.mask[k];
                bytes[k] = b;
            }

            let raw_value = 0;
            if (sysex.mask.length === 2) {
                raw_value = v16(data[sysex.offset], data[sysex.offset + 1], sysex.mask[0], sysex.mask[1])
            } else {
                raw_value = v8(data[sysex.offset], sysex.mask[0]);
            }

            // console.log(`${i} raw_value=${raw_value}`);

            if (sysex.hasOwnProperty('f')) {
                raw_value = sysex.f(raw_value);
                // console.log('${i} sysex.f(raw_value) =' + raw_value);
            }

            let final_value = 0;
            final_value = controls[i].human(raw_value);

            // console.log(`${i} finale_value(${raw_value}) = ${final_value}`);

            controls[i]['raw_value'] = raw_value;
            controls[i]['value'] = final_value;
        }

        console.groupEnd();

    };

    /**
     *
     * @param data
     */
    var decodeSysExMeta = function(data) {
        // console.log('BS2.decodeSysExMeta', data);
        meta.patch_id['value'] = data[meta.patch_id.sysex.offset];
        meta.patch_name['value'] = String.fromCharCode(...data.slice(meta.patch_name.sysex.offset, meta.patch_name.sysex.offset + meta.patch_name.sysex.mask.length));
        // console.log(`decodeSysExMeta, id=${meta.patch_id.value}, name=${meta.patch_name.value}`);
    };

    /**
     *
     * @param data
     * @returns {boolean}
     */
    var setValuesFromSysex = function(data) {
        if (!validateSysEx(data)) return false;
        decodeSysExMeta(data);
        decodeSysExControls(data, control);
        decodeSysExControls(data, nrpn);
        return true;
    };

    /*
     var getValuesAsSysex = function() {
     //TODO: export as sysex data
     };
     */

    /**
     *
     * @param control_type
     * @param control_number
     * @returns {number}
     */
    var getControlValue = function(ctrl) {
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
    var setControlValue = function() {
        // console.log('BS2.setControlValue', ...arguments);
        let c;
        if (arguments.length===2) {
            let value = arguments[1];
            c = arguments[0];
            c.raw_value = typeof value === 'number' ? value : parseInt(value);
        } else if (arguments.length===3) {
            let ca; // controls array
            if (arguments[0] === 'cc') {
                ca = control;
            } else if (arguments[0] === 'nrpn') {
                ca = nrpn;
            } else {
                console.error("setControlValue: invalid control_type", arguments);
                return null;
            }
            if (ca[arguments[1]]) {
                c = ca[arguments[1]];
                let value = arguments[2];
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
    var getAllValues = function() {
        let a = {
            cc: new Array(127),
            nrpn: new Array(127)
        };

        for (let i=0; i < control.length; i++) {
            let c = control[i];
            if (typeof c === 'undefined') continue;
            // console.log(`getAllValues: cc ${i}: ${c.name}: ${c.raw_value}`);
            a.cc[i] = c.raw_value;
        }

        for (let i=0; i < nrpn.length; i++) {
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
    var setAllValues = function(values) {

        // console.log('setAllValues()', values);

        for (let i=0; i < values.cc.length; i++) {
            if (typeof control[i] === 'undefined') continue;
            // console.log(`control[${i}].raw_value = ${values.cc[i]}`);
            control[i].raw_value = values.cc[i];
            control[i].value = control[i].human(control[i].raw_value);  //TODO: create a function setRawValue() or setValue() ?
        }

        for (let i=0; i < values.nrpn.length; i++) {
            if (typeof nrpn[i] === 'undefined') continue;
            // console.log(`set nrpn[${i}] = ${values.nrpn[i]}`);
            nrpn[i].raw_value = values.nrpn[i];
            nrpn[i].value = nrpn[i].human(nrpn[i].raw_value);
        }

    };

    /**
     *
     */
    var init = function() {

        function _init(controls) {
            for (let i=0; i < controls.length; i++) {
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
     * @param control
     * @param value is raw value (0..127 or 0..255)
     */
    var getMidiMessagesForNormalCC = function(ctrl) {
        // console.log('BS2.getMidiMessagesForControl', control_number, value);
        if (ctrl.cc_type != 'cc') return [];
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

    defineControls();
    defineNRPNs();

    var publicAPI = {
        name: "Bass Station II",
        name_device_in: "Bass Station II",
        name_device_out: "Bass Station II",
        meta,
        control_id,
        nrpn_id,
        control,
        nrpn,
        control_groups,
        SUB_WAVE_FORMS,
        SUB_OCTAVE,
        OSC_RANGES,
        OSC_WAVE_FORMS,
        LFO_WAVE_FORMS,
        LFO_SPEED_SYNC,
        LFO_SYNC,
        FILTER_SHAPES,
        FILTER_SLOPE,
        FILTER_TYPE,
        ENV_TRIGGERING,
        ARP_NOTES_MODE,
        ARP_OCTAVES,
        init,
        getControlValue,
        setControlValue,
        getAllValues,
        setAllValues,
        getADSREnv,
        setValuesFromSysex,
        doubleByteValue,
        getMidiMessagesForNormalCC
    };

    return publicAPI;

})();
