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
        osc2_env2_pw_mod: 77,
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
        lfo2_speed: 19,
        lfo2_delay: 87,
        lfo1_wave: 88,
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
        mod: 1,
        mod_wheel_filter_freq: 99,
        sustain: 64,
        osc_pitch_bend_range: 107,
        osc_1_2_sync: 110,
        velocity_amp_env: 112,
        velocity_mod_env: 113,
        vca_limit: 95,
        arp_swing: 116
    };

    var nrpn_id = {
        osc1_waveform: 72,
        osc2_waveform: 82,
        lfo1_sync_value: 87,
        lfo2_sync_value: 91,
        amp_env_triggering: 73,
        mod_env_triggering: 105,
        mod_wheel_lfo2_filter_freq: 71,
        mod_wheel_lfo1_osc_pitch: 70,
        mod_wheel_osc2_pitch: 78,
        aftertouch_filter_freq: 74,
        aftertouch_lfo1_to_osc_pitch: 75,
        aftertouch_lfo2_speed: 76,
        lfo_key_sync_lfo1: 89,
        lfo_key_sync_lfo2: 93,
        lfo_speed_sync_lfo1: 87,
        lfo_speed_sync_lfo2: 91,
        lfo_slew_lfo_1: 86,
        lfo_slew_lfo_2: 90,
        arp_seq_retrig: 106
    };


    var _127 = function(v) {
        return v < 128 ? (v - 127) : (v - 128);
    };

    var _100 = function(v) {
        return v < 128 ? (v - 127) : (v - 128);
    };

    var _63 = function(v) {
        return v < 64 ? (v - 63) : (v - 64);
    };

    var _12 = function(v) {
        return COARSE_VALUES[v] / 10;
    };

    var _waveform = function(v) {    // todo: check if this is a good idea
        return this.labels.waveform.v;
    };

    // 0..127 to 5..95
    var _5_95 = function(v) {
        //console.log(v * 2 * 91.0 / 256 + 5 -0.4);
        // return Math.round(v * 2 * 91.0 / 256 + 5 -0.4);
        let out_max = 95;
        let out_min = 5;
        let in_max = 127;
        let in_min = 0;
        return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
    };

    // 0..127 to -90..90            //FIXME: value 63 must gives 0
    var _90_90 = function(v) {
        //console.log(v * 2 * 91.0 / 256 + 5 -0.4);
        // return Math.round(v * 2 * 91.0 / 256 + 5 -0.4);
        let out_max = 90;
        let out_min = -90;
        let in_max = 127;
        let in_min = 0;
        return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
    };

    // Map 0..255 to -90..+90
    var _pw = function(v) {
        console.log(v * 2 * 91.0 / 256 + 5 -0.4);
        return Math.round(v * 2 * 91.0 / 256 + 5 -0.4);
    };

    var _depth = function(v) {
        /*
         let w = v * 1.0;
         if (v < 64) {
         let OutputHigh = 0.0;
         let OutputLow = -90.0;
         let InputHigh = 63.0;
         let InputLow = 0.0;
         console.log(v, ((w - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow + 0.5);
         } else {
         let OutputHigh = 90.0;
         let OutputLow = 0.0;
         let InputHigh = 127.0;
         let InputLow = 64.0;
         console.log(v, ((w - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow);
         }
         */
        return v < 64 ? (v - 63) : (v - 64);
    };

    var _scale = function(v) {
        //console.log(v, v * 182.0 / 128, Math.round(v * 182.0 / 128));
        /*
         let v = w * 1.0;
         let r = v < 0 ?
         ((v - 1.0) * 90.0 / 64.0) :
         (v * 90.0 / 64);

         //console.log(v, v - 1, r, v < 0 ? Math.ceil(r) : Math.round(r));

         return Math.round(v * 2 * 90.0 / 128 );
         */
        // in progres..... still not working correctly :-(

        let out_max = 90.0;
        let out_min = -90.0;
        let in_max = 63.0;
        let in_min = -63.0;
        let r;
        if (v < 0) {
            console.log(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min + 0.4);
            r = Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min + 0.4);
        } else {
            console.log(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
            r = Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
        }
        return r;
    };

    var meta = {
        sysex_length: 154
    };

    var control = new Array(127);
    var nrpn = new Array(127);

    function defineControls() {
        control[control_id.patch_volume] = { // 7
            name: "Patch Volume",
            range: [],
            lsb: -1,
            sysex: {
            }
        };
        control[control_id.osc1_fine] = { // 26 (msb), 58 (lsb)
            name: "Osc1 Fine",
            lsb: 58,
            range: [-100,100],
            map: _100,
            sysex: {
                offset: 22,
                mask: [0x03, 0x7E]
            }
        };
        control[control_id.osc1_range] = { // 70
            name: "Osc1 Range",
            lsb: -1,
            range: [63, 66],
            map: v => OSC_RANGES[v - 63],
            sysex: {
                control: control_id.osc1_range,
                offset: 20,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.osc1_coarse] = { // 27 (msb), 59 (lsb)
            name: "Osc1 Coarse",
            lsb: 59,
            range: [-12,12],
            map: _12,
            sysex: {
                offset: 21,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.osc1_mod_env_depth] = { // 71
            name: "Osc1 Mod Env Depth",
            lsb: -1,
            range: [-63,63],
            map: _63,
            sysex: {
                offset: 98,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.osc1_lfo1_depth] = { // 28 (msb), 60 (lsb)
            name: "Osc1 LFO1 Depth",
            lsb: 60,
            range: [-127,127],
            map: _127,
            sysex: {
                offset: 90,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.osc1_mod_env_pw_mod] = { // 72
            name: "Osc1 Mod Env PW Mod",
            lsb: -1,
            range: [-63,63],
            map: _63,
            sysex: {
                offset: 101,
                mask: [0x01, 0x7C]
            }
        };
        control[control_id.osc1_lfo2_pw_mod] = { // 73
            name: "Osc1 LFO2 PW Mod",
            lsb: -1,
            range: [-90,90],
            map: _90_90,
            sysex: {
                offset: 93,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.osc1_manual_pw] = { // 74
            name: "Osc1 Manual PW",
            lsb: -1,
            range: [5,95],
            map: _5_95,
            sysex: {
                offset: 19,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.osc2_fine] = { // 29 (msb), 61 (lsb)
            name: "Osc2 Fine",
            lsb: 61,
            range: [-100,100],
            map: _100,
            sysex: {
                offset: 28,
                mask: [0x0F, 0x78]
            }
        };
        control[control_id.osc2_range] = { // 75
            name: "Osc2 Range",
            lsb: -1,
            range: [63,66],
            map: v => OSC_RANGES[v - 63],
            sysex: {
                offset: 26,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.osc2_coarse] = { // 30 (msb), 62 (lsb)
            name: "Osc2 Coarse",
            lsb: 62,
            range: [-12,12],
            map: _12,
            sysex: {
                offset: 27,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.osc2_mod_env_depth] = { // 76
            name: "Osc2 Mod Env Depth",
            lsb: -1,
            range: [-63, 63],
            map: _63,
            sysex: {
                offset: 99,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.osc2_lfo1_depth] = { // 31 (msb), 63 (lsb)
            name: "Osc2 LFO1 Depth",
            range: [-127,127],
            lsb: 63,
            mod: _127,
            sysex: {
                offset: 91,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.osc2_env2_pw_mod] = { // 77
            name: "Osc2 Env2 PW Mod",
            lsb: -1,
            range: [-63,63],
            map: _63,
            sysex: {
                offset: 102,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.osc2_lfo2_pw_mod] = { // 78
            name: "Osc2 LFO2 PW Mod",
            lsb: -1,
            range: [-90,90],
            sysex: {
                offset: 94,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.osc2_manual_pw] = { // 79
            name: "Osc2 Manual PW",
            lsb: -1,
            range: [5,95],
            map: _5_95,
            sysex: {
                offset: 25,
                mask: [0x1F, 0x40]
            }
        };
        control[control_id.sub_osc_wave] = { // 80
            name: "Sub Osc Wave",
            range: [0, 2],
            lsb: -1,
            map: v => { return SUB_WAVE_FORMS[v % SUB_WAVE_FORMS.length] },
            sysex: {
                offset: 36,
                mask: [0x30]
            }
        };
        control[control_id.sub_osc_oct] = { // 81
            name: "Sub Osc Oct",
            range: [-2, -1],
            lsb: -1,
            map: v => v - 2,
            sysex: {
                offset: 37,
                mask: [0x08]
            }
        };
        control[control_id.mixer_osc_1_level] = { // 20 (msb), 52 (lsb)
            name: "Mixer Osc 1 Level",
            range: [0,255],
            lsb: 52,
            sysex: {
                offset: 37,
                mask: [0x07, 0x7C]
            }
        };
        control[control_id.mixer_osc_2_level] = { // 21 (msb), 53 (lsb)
            name: "Mixer Osc 2 Level",
            range: [0,255],
            lsb: 53,
            sysex: {
                offset: 38,
                mask: [0x03, 0x7E]
            }
        };
        control[control_id.mixer_sub_osc_level] = { // 22 (msb), 54 (lsb)
            name: "Mixer Sub Osc Level",
            range: [0,255],
            lsb: 54,
            sysex: {
                offset: 39,
                mask: [0x01, 0x7F]
            }
        };
        control[control_id.mixer_noise_level] = { // 23 (msb), 55 (lsb)
            name: "Mixer Noise Level",
            range: [0,255],
            lsb: 55,
            sysex: {
                offset: 41,
                mask: [0x7F, 0x40]
            }
        };
        control[control_id.mixer_ring_mod_level] = { // 24 (msb), 56 (lsb)
            name: "Mixer Ring Mod Level",
            range: [0,255],
            lsb: 56,
            sysex: {
                offset: 42,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.mixer_external_signal_level] = { // 25 (msb), 57 (lsb)
            name: "Mixer External Signal Level",
            range: [0,255],
            lsb: 57,
            sysex: {
                offset: 43,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.filter_type] = { // 83
            name: "Filter Type",
            range: [0, 1],
            lsb: -1,
            map: v => FILTER_TYPE[v],
            sysex: {
                offset: 48,
                mask: [0x04]
            }
        };
        control[control_id.filter_slope] = { // 106
            name: "Filter Slope",
            range: [0, 1],
            lsb: -1,
            map: v => FILTER_SLOPE[v],
            sysex: {
                offset: 48,
                mask: [0x08]
            }
        };
        control[control_id.filter_shape] = { // 84
            name: "Filter Shape",
            range: [0, 1],
            lsb: -1,
            map: v => FILTER_SHAPES[v],
            sysex: {
                offset: 48,
                mask: [0x03]
            }
        };
        control[control_id.filter_frequency] = { // 16 (msb), 48 (lsb)
            name: "Filter Frequency",
            range: [0,255],
            lsb: 48,
            sysex: {
                offset: 44,
                mask: [0x0F, 0x78]
            }
        };
        control[control_id.filter_resonance] = { // 82
            name: "Filter Resonance",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 45,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.filter_mod_env_depth] = { // 85
            name: "Filter Mod Env Depth",
            lsb: -1,
            range: [-63, 63],
            map: _63,
            sysex: {
                offset: 105,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.filter_lfo2_depth] = { // 17 (msb), 49 (lsb)
            name: "Filter LFO2 Depth",
            range: [-127, 127],
            lsb: 49,
            map: _127,
            sysex: {
                offset: 97,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.filter_overdrive] = { // 114
            name: "Filter Overdrive",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 46,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.portamento_time] = { // 5
            name: "Portamento Time",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 13,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.lfo1_wave] = { // 88
            name: "LFO1 Wave",
            range: [],
            lsb: -1,
            sysex: {
                offset: 63,
                mask: [0x06]
            }
        };
        control[control_id.lfo1_speed] = { // 18 (msb), 50 (lsb)
            name: "LFO1 Speed",
            range: [0,255],
            lsb: 50,
            sysex: {
                offset: 66,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.lfo1_delay] = { // 86
            name: "LFO1 Delay",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 64,
                mask: [0x7F]
            }
        };
        control[control_id.lfo2_wave] = { // 89
            name: "LFO2 Wave",
            range: [],
            lsb: -1,
            sysex: {
                offset: 70,
                mask: [0x0C]
            }
        };
        control[control_id.lfo2_speed] = { // 19 (msb), 51 (lsb)
            name: "LFO2 Speed",
            range: [0,255],
            lsb: 51,
            sysex: {
                offset: 73,
                mask: [0x7F, 0x40]
            }
        };
        control[control_id.lfo2_delay] = { // 87
            name: "LFO2 Delay",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 70,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.amp_env_attack] = { // 90
            name: "Amp Env Attack",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 50,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.amp_env_decay] = { // 91
            name: "Amp Env Decay",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 51,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.amp_env_sustain] = { // 92
            name: "Amp Env Sustain",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 52,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.amp_env_release] = { // 93
            name: "Amp Env Release",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 53,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.mod_env_attack] = { // 102
            name: "Mod Env Attack",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 57,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.mod_env_decay] = { // 103
            name: "Mod Env Decay",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 58,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.mod_env_sustain] = { // 104
            name: "Mod Env Sustain",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 59,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.mod_env_release] = { // 105
            name: "Mod Env Release",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 60,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.fx_distortion] = { // 94
            name: "Fx Distortion",
            range: [0,127],
            lsb: -1,
            sysex: {
                offset: 107,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.fx_osc_filter_mod] = { // 115
            name: "Fx Osc Filter Mod",
            range: [],
            lsb: -1,
            sysex: {
                offset: 106,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.arp_on] = { // 108
            name: "Arp On",
            range: [0,1],
            lsb: -1,
            sysex: {
                offset: 77,
                mask: [0x08]
            }
        };
        control[control_id.arp_latch] = { // 109
            name: "Arp Latch",
            range: [0,1],
            lsb: -1,
            sysex: {
                offset: 77,
                mask: [0x10]
            }
        };
        control[control_id.arp_rhythm] = { // 119
            name: "Arp Rhythm",
            range: [1,32],
            lsb: -1,
            sysex: {
                offset: 80,
                mask: [0x1F]
            }
        };
        control[control_id.arp_note_mode] = { // 118
            name: "Arp Note Mode",
            range: [],
            lsb: -1,
            sysex: {
                offset: 79,
                mask: [0x0A]                             //TODO: check
            }
        };
        control[control_id.arp_octaves] = { // 111
            name: "Arp Octaves",
            range: [1,4],
            lsb: -1,
            sysex: {
                offset: 78,
                mask: [0x14]
            }
        };
        control[control_id.mod] = { // 1
            name: "Mod",
            range: [],
            lsb: -1,
            sysex: {
            }
        };
        control[control_id.mod_wheel_filter_freq] = { // 99
            name: "Mod Wheel Filter Freq",
            range: [-64,63],
            lsb: -1,
            sysex: {
                offset: 82,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.sustain] = { // 64
            name: "Sustain",
            range: [],
            lsb: -1,
            sysex: {
            }
        };
        control[control_id.osc_pitch_bend_range] = { // 107
            name: "Osc Pitch Bend Range",
            range: [-12,12],
            lsb: -1,
            sysex: {
                offset: 16,
                mask: [0x7F]        // to check
            }
        };
        control[control_id.osc_1_2_sync] = { // 110
            name: "Osc 1 2 Sync",
            range: [0, 1],
            lsb: -1,
            sysex: {
                offset: 18,
                mask: [0x40]
            }
        };
        control[control_id.velocity_amp_env] = { // 112
            name: "Velocity Amp Env",
            range: [-63, 63],
            lsb: -1,
            sysex: {
                offset: 49,
                mask: [0x3F]
            }
        };
        control[control_id.velocity_mod_env] = { // 113
            name: "Velocity Mod Env",
            range: [-63, 63],
            lsb: -1,
            sysex: {
                offset: 56,
                mask: [0x7E]
            }
        };
        control[control_id.vca_limit] = { // 95
            name: "VCA Limit",
            range: [0, 127],
            lsb: -1,
            sysex: {
                offset: 108,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.arp_swing] = { // 116
            name: "Arp Swing",
            range: [3,97],
            lsb: -1,
            sysex: {
                offset: 81,
                mask: [0x6F, 0x40]   // todo: check
            }
        };
    } // defineControls()

    function defineNRPNs() {
        nrpn[nrpn_id.osc1_waveform] = { // 0 (msb), 72 (lsb)
            name: "Osc1 Waveform",
            msb: 0,
            range: [1, 3],
            map: v => { return OSC_WAVE_FORMS[v % OSC_WAVE_FORMS.length] },
            sysex: {
                offset: 19,
                mask: [0x60]
            }
        };
        nrpn[nrpn_id.osc2_waveform] = { // 0 (msb), 82 (lsb)
            name: "Osc2 Waveform",
            msb: 0,
            range: [1, 3],
            map: v => { return OSC_WAVE_FORMS[v % OSC_WAVE_FORMS.length] },
            sysex: {
                offset: 24,
                mask: [0x03]
            }
        };
        nrpn[nrpn_id.lfo1_sync_value] = { // 87
            name: "LFO1 Sync Value",
            msb: -1,
            range: [],
            sysex: {        // TODO
            }
        };
        nrpn[nrpn_id.lfo2_sync_value] = { // 91
            name: "LFO2 Sync Value",
            msb: -1,
            range: [],
            sysex: {        // TODO
            }
        };
        nrpn[nrpn_id.amp_env_triggering] = { // 0 (msb), 73 (lsb)
            name: "Amp Env Triggering",
            msb: 0,
            range: [],
            sysex: {
                offset: 55,     //TODO: check
                mask: [0x06]
            }
        };
        nrpn[nrpn_id.mod_env_triggering] = { // 0 (msb), 105 (lsb)
            name: "Mod Env Triggering",
            range: [],
            msb: 0,
            sysex: {        // TODO
                // offset: 55,
                // mask: [0x06]
            }
        };
        nrpn[nrpn_id.mod_wheel_lfo1_osc_pitch] = { // 0 (msb), 70 (lsb)
            name: "Mod Wheel LFO1 to Osc Pitch",
            range: [-63, 63],
            msb: 0,
            map: _63,
            sysex: {
                offset: 83,
                mask: [0x0F, 0x70]
            }
        };
        nrpn[nrpn_id.mod_wheel_lfo2_filter_freq] = { // 0 (msb), 71 (lsb)
            name: "Mod Wheel LFO2 to Filter Freq",
            range: [-63, 63],
            msb: 0,
            sysex: {
                offset: 84,
                mask: [0x07, 0x78]
            }
        };
        nrpn[nrpn_id.mod_wheel_osc2_pitch] = { // 0 (msb), 78 (lsb)
            name: "Mod Wheel Osc2 Pitch",
            msb: 0,
            range: [-63,63],
            map: _63,
            sysex: {
                offset: 85,
                mask: [0x03, 0x7C]
            }
        };
        nrpn[nrpn_id.aftertouch_filter_freq] = { // 0 (msb), 74 (lsb)
            name: "Aftertouch Filter Freq",
            range: [-63,63],
            msb: 0,
            map: _63,
            sysex: {
                offset: 86,
                mask: [0x01, 0x7E]
            }
        };
        nrpn[nrpn_id.aftertouch_lfo1_to_osc_pitch] = { // 0 (msb), 75 (lsb)
            name: "Aftertouch LFO1 to Osc Pitch",
            range: [-63,63],
            msb: 0,
            map: _63,
            sysex: {
                offset: 88,
                mask: [0x7F]
            }
        };
        nrpn[nrpn_id.aftertouch_lfo2_speed] = { // 0 (msb), 76 (lsb)
            name: "Aftertouch LFO2 Speed",
            range: [-63,63],
            msb: 0,
            sysex: {
                offset: 89,
                mask: [0x3F, 0x40]
            }
        };
        nrpn[nrpn_id.lfo_key_sync_lfo1] = { // 0 (msb), 89 (lsb)
            name: "LFO Key Sync LFO1",
            range: [0,1],
            msb: 0,
            sysex: {
                offset: 69,
                mask: [0x10]
            }
        };
        nrpn[nrpn_id.lfo_key_sync_lfo2] = { // 0 (msb), 93 (lsb)
            name: "LFO Key Sync LFO2",
            range: [0,1],
            msb: 0,
            sysex: {
                offset: 76,
                mask: [0x20]
            }
        };
        nrpn[nrpn_id.lfo_speed_sync_lfo1] = { // 0 (msb), 87 (lsb)
            name: "LFO Speed Sync LFO1",
            range: [0,1],
            msb: 0,
            sysex: {
                offset: 69,
                mask: [0x08]
            }
        };
        nrpn[nrpn_id.lfo_speed_sync_lfo2] = { // 0 (msb), 91 (lsb)
            name: "LFO Speed Sync LFO2",
            range: [0,1],
            msb: 0,
            sysex: {
                offset: 76,
                mask: [0x10]
            }
        };
        nrpn[nrpn_id.lfo_slew_lfo_1] = { // 0 (msb), 86 (lsb)
            name: "LFO Slew LFO 1",
            range: [0,127],
            msb: 0,
            sysex: {
                offset: 65,
                mask: [0x3F, 0x40]
            }
        };
        nrpn[nrpn_id.lfo_slew_lfo_2] = { // 0 (msb), 90 (lsb)
            name: "LFO Slew LFO 2",
            range: [0,127],
            msb: 0,
            sysex: {
                offset: 72,
                mask: [0x7F]
            }
        };
        nrpn[nrpn_id.arp_seq_retrig] = { // 106
            name: "Arp Seq Retrig",
            range: [0,1],
            msb: -1,
            sysex: {
                offset: 77,
                mask: [0x20]
            }
        };
    } // defineNRPNs()

    var OSC_RANGES = [
        "16'", "8'", "4'", "2'"
    ];

    var OSC_WAVE_FORMS = [
        "sin", "triangle", "saw", "pulse"
    ];

    var LFO_WAVE_FORMS = [
        "triangle", "saw", "square", "S+H"
    ];

    var SUB_WAVE_FORMS = [
        "sin", "pulse", "square"
    ];

    var FILTER_SHAPES = [
        "LP", "BP", "HP"
    ];

    var FILTER_SLOPE = [
        "12dB", "24dB"
    ];

    var FILTER_TYPE = [
        "classic", "acid"
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

    function v8(lsb, mask_lsb) {
        let r = getRightShift(mask_lsb);
        let b = (lsb & mask_lsb) >> r;
        return b;
    }

    function v16(msb, lsb, mask_msb, mask_lsb) {
        let r = getRightShift(mask_lsb);
        let s = getSetBits(mask_lsb);
        let a = (msb & mask_msb) << s;
        let b = (lsb & mask_lsb) >> r;
        return a + b;
    }

    /**
     * Get values from sysex data and store the value in a (new) property "value" in each control.
     * @param data
     */
    var decodeSysEx = function(data, controls) {

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
                // s += ` ${param_value.toString().paddingLeft('   ')} `;
            } else {
                raw_value = v8(data[sysex.offset], sysex.mask[0]);
                // s += ` ${param_value.toString().paddingLeft('   ')} `;
            }

            // final value:

            let final_value = 0;
            if (controls[i].hasOwnProperty('map')) {
                // console.log('compute final value with transform function and raw_value=' + param_value);
                final_value = controls[i].map(raw_value);
                // console.log('final value', final_value);
            } else {
                final_value = raw_value;
            }
            controls[i]['raw_value'] = raw_value;
            controls[i]['value'] = final_value;
        }

    }; // decodeSys

    var setValuesFromSysex = function(data) {
        decodeSysEx(data, control);
        decodeSysEx(data, nrpn);
    };

    defineControls();
    defineNRPNs();

    var publicAPI = {
        meta,
        control_id,
        nrpn_id,
        control,
        nrpn,
        OSC_RANGES,
        OSC_WAVE_FORMS,
        LFO_WAVE_FORMS,
        SUB_WAVE_FORMS,
        FILTER_SHAPES,
        FILTER_SLOPE,
        FILTER_TYPE,
        setValuesFromSysex
    };

    return publicAPI;

})();

/* TEST */
/*
console.log(BS2);                                               // object...
console.log(BS2.control);                                       // array
console.log(BS2.control_id.osc1_fine);                          // 26
console.log(BS2.control[BS2.control_id.osc1_fine].sysex);       // object...
console.log(BS2.control[BS2.control_id.osc1_fine].map(123));    // -4
*/
