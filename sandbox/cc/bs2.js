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


    var _100 = function(v) {
        return v < 128 ? (v - 127) : (v - 128);
    };

    var _12 = function(v) {
        //let a = v < 128 ? (v - 127) : (v - 128);
        let a = 240 / 255 * v;
        //console.log('a', a);
        return COARSE_VALUES[v] / 10;
    };

    var _waveform = function(v) {    // todo: check if this is a good idea
        return this.labels.waveform.v;
    };

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

        let OutputHigh = 90.0;
        let OutputLow = -90.0;
        let InputHigh = 63.0;
        let InputLow = -63.0;
        let r;
        if (v < 0) {
            console.log(((v - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow + 0.4);
            r = Math.round(((v - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow + 0.4);
        } else {
            console.log(((v - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow - 0.4);
            r = Math.round(((v - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow - 0.4);
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
            range: [-100,100],
            map: _100,
            lsb: 58,
            sysex: {
                offset: 22,
                mask: [0x03, 0x7E]
            }
        };
        control[control_id.osc1_range] = { // 70
            name: "Osc1 Range",
            range: [63, 66],
            lsb: -1,
            sysex: {
                control: control_id.osc1_range,
                offset: 20,
                mask: [0x07, 0x78]
            }
        };
        control[control_id.osc1_coarse] = { // 27 (msb), 59 (lsb)
            name: "Osc1 Coarse",
            range: [-12,12],
            lsb: 59,
            sysex: {
                offset: 21,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.osc1_mod_env_depth] = { // 71
            name: "Osc1 Mod Env Depth",
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 98,
                mask: [0x1F, 0x60]
            }
        };
        control[control_id.osc1_lfo1_depth] = { // 28 (msb), 60 (lsb)
            name: "Osc1 LFO1 Depth",
            range: [-127,127],
            lsb: 60,
            sysex: {
                offset: 90,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.osc1_mod_env_pw_mod] = { // 72
            name: "Osc1 Mod Env PW Mod",
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 101,
                mask: [0x01, 0x7C]
            }
        };
        control[control_id.osc1_lfo2_pw_mod] = { // 73
            name: "Osc1 LFO2 PW Mod",
            range: [-90,90],
            lsb: -1,
            sysex: {
                offset: 93,
                mask: [0x03, 0x7C]
            }
        };
        control[control_id.osc1_manual_pw] = { // 74
            name: "Osc1 Manual PW",
            range: [5,95],
            lsb: -1,
            sysex: {
                offset: 19,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.osc2_fine] = { // 29 (msb), 61 (lsb)
            name: "Osc2 Fine",
            range: [-100,100],
            lsb: 61,
            sysex: {
                offset: 28,
                mask: [0x0F, 0x78]
            }
        };
        control[control_id.osc2_range] = { // 75
            name: "Osc2 Range",
            range: [63,66],
            lsb: -1,
            sysex: {
                offset: 26,
                mask: [0x1F, 0x20]
            }
        };
        control[control_id.osc2_coarse] = { // 30 (msb), 62 (lsb)
            name: "Osc2 Coarse",
            range: [-12,12],
            lsb: 62,
            sysex: {
                offset: 27,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.osc2_mod_env_depth] = { // 76
            name: "Osc2 Mod Env Depth",
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 99,
                mask: [0x0F, 0x70]
            }
        };
        control[control_id.osc2_lfo1_depth] = { // 31 (msb), 63 (lsb)
            name: "Osc2 LFO1 Depth",
            range: [-127,127],
            lsb: 63,
            sysex: {
                offset: 91,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.osc2_env2_pw_mod] = { // 77
            name: "Osc2 Env2 PW Mod",
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 102,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.osc2_lfo2_pw_mod] = { // 78
            name: "Osc2 LFO2 PW Mod",
            range: [-90,90],
            lsb: -1,
            sysex: {
                offset: 94,
                mask: [0x01, 0x7E]
            }
        };
        control[control_id.osc2_manual_pw] = { // 79
            name: "Osc2 Manual PW",
            range: [5,95],
            lsb: -1,
            sysex: {
                offset: 25,
                mask: [0x1F, 0x40]
            }
        };
        control[control_id.sub_osc_wave] = { // 80
            name: "Sub Osc Wave",
            range: [],
            lsb: -1,
            sysex: {
                offset: 36,
                mask: [0x30]
            }
        };
        control[control_id.sub_osc_oct] = { // 81
            name: "Sub Osc Oct",
            range: [0,0],
            lsb: -1,
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
            range: [],
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
            range: [],
            lsb: 55,
            sysex: {
                offset: 41,
                mask: [0x7F, 0x40]
            }
        };
        control[control_id.mixer_ring_mod_level] = { // 24 (msb), 56 (lsb)
            name: "Mixer Ring Mod Level",
            range: [],
            lsb: 56,
            sysex: {
                offset: 42,
                mask: [0x3F, 0x60]
            }
        };
        control[control_id.mixer_external_signal_level] = { // 25 (msb), 57 (lsb)
            name: "Mixer External Signal Level",
            range: [],
            lsb: 57,
            sysex: {
                offset: 43,
                mask: [0x1F, 0x70]
            }
        };
        control[control_id.filter_type] = { // 83
            name: "Filter Type",
            range: [],
            lsb: -1,
            sysex: {
                offset: 48,
                mask: [0x04]
            }
        };
        control[control_id.filter_slope] = { // 106
            name: "Filter Slope",
            range: [],
            lsb: -1,
            sysex: {
                offset: 48,
                mask: [0x08]
            }
        };
        control[control_id.filter_shape] = { // 84
            name: "Filter Shape",
            range: [],
            lsb: -1,
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
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 105,
                mask: [0x3F, 0x40]
            }
        };
        control[control_id.filter_lfo2_depth] = { // 17 (msb), 49 (lsb)
            name: "Filter LFO2 Depth",
            range: [0,127],
            lsb: 49,
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
            range: [0,1],
            lsb: -1,
            sysex: {
                offset: 18,
                mask: [0x40]
            }
        };
        control[control_id.velocity_amp_env] = { // 112
            name: "Velocity Amp Env",
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 49,
                mask: [0x3F]
            }
        };
        control[control_id.velocity_mod_env] = { // 113
            name: "Velocity Mod Env",
            range: [-63,63],
            lsb: -1,
            sysex: {
                offset: 56,
                mask: [0x7E]
            }
        };
        control[control_id.vca_limit] = { // 95
            name: "VCA Limit",
            range: [0,127],
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
            range: [1,3],
            msb: 0,
            sysex: {
                offset: 19,
                mask: [0x60]
            }
        };
        nrpn[nrpn_id.osc2_waveform] = { // 0 (msb), 82 (lsb)
            name: "Osc2 Waveform",
            range: [],
            msb: 0,
            sysex: {
                offset: 24,
                mask: [0x03]
            }
        };
        nrpn[nrpn_id.lfo1_sync_value] = { // 87
            name: "LFO1 Sync Value",
            range: [],
            msb: -1,
            sysex: {
            }
        };
        nrpn[nrpn_id.lfo2_sync_value] = { // 91
            name: "LFO2 Sync Value",
            range: [],
            msb: -1,
            sysex: {
            }
        };
        nrpn[nrpn_id.amp_env_triggering] = { // 0 (msb), 73 (lsb)
            name: "Amp Env Triggering",
            range: [],
            msb: 0,
            sysex: {
                offset: 55,
                mask: [0x06]
            }
        };
        nrpn[nrpn_id.mod_env_triggering] = { // 0 (msb), 105 (lsb)
            name: "Mod Env Triggering",
            range: [],
            msb: 0,
            sysex: {
            }
        };
        nrpn[nrpn_id.mod_wheel_lfo1_osc_pitch] = { // 0 (msb), 70 (lsb)
            name: "Mod Wheel LFO1 to Osc Pitch",
            range: [-63,63],
            msb: 0,
            sysex: {
                offset: 83,
                mask: [0x0F, 0x70]
            }
        };
        nrpn[nrpn_id.mod_wheel_lfo2_filter_freq] = { // 0 (msb), 71 (lsb)
            name: "Mod Wheel LFO2 to Filter Freq",
            range: [-63,63],
            msb: 0,
            sysex: {
                offset: 84,
                mask: [0x07, 0x78]
            }
        };
        nrpn[nrpn_id.mod_wheel_osc2_pitch] = { // 0 (msb), 78 (lsb)
            name: "Mod Wheel Osc2 Pitch",
            range: [-63,63],
            msb: 0,
            sysex: {
                offset: 85,
                mask: [0x03, 0x7C]
            }
        };
        nrpn[nrpn_id.aftertouch_filter_freq] = { // 0 (msb), 74 (lsb)
            name: "Aftertouch Filter Freq",
            range: [-63,63],
            msb: 0,
            sysex: {
                offset: 86,
                mask: [0x01, 0x7E]
            }
        };
        nrpn[nrpn_id.aftertouch_lfo1_to_osc_pitch] = { // 0 (msb), 75 (lsb)
            name: "Aftertouch LFO1 to Osc Pitch",
            range: [-63,63],
            msb: 0,
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

    defineControls();
    defineNRPNs();

    var publicAPI = {
        meta,
        control_id,
        nrpn_id,
        control,
        nrpn
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
