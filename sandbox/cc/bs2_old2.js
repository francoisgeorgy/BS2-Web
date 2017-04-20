BS2 = {
    labels: {
        waveform: {
            0: 'sin',
            1: 'triangle',
            3: 'saw',
            4: 'pulse'
        }
    },
    _100: function (v) {
        return v < 128 ? (v - 127) : (v - 128);
    },
    _12: function (v) {
        //let a = v < 128 ? (v - 127) : (v - 128);
        let a = 240 / 255 * v;
        //console.log('a', a);
        return COARSE_VALUES[v] / 10;
    },
    _waveform: function(v) {    // todo: check if this is a good idea
        return this.labels.waveform.v;
    },
    _pw: function(v) {
        console.log(v * 2 * 91.0 / 256 + 5 -0.4);
        return Math.round(v * 2 * 91.0 / 256 + 5 -0.4);
    },
    _depth: function(v) {
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
    },
    _scale: function(v) {
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
    },
    meta: {
        sysex_length: 154
    },
    param: {
        patch_volume: {
            description: "Patch Volume",
            type: "cc",
            cc: [7],
            range: [],
            sysex: {
                offset: 0,
                mask: []
            }
        },
        osc1_fine: {
            description: "Osc1 Fine",
            type: "cc",
            cc: [26, 58],
            range: [ -100, 100 ],
            transform: v => BS2._100(v),
            sysex: {
                offset: 22,
                mask: [0x03,0x7E]
            }
        },
        osc1_range: {
            description: "Osc1 Range",
            type: "cc",
            cc: [70],
            range: [ 63, 66 ],
            sysex: {
                offset: 20,
                mask: [0x07,0x78]
            }
        },
        osc1_coarse: {
            description: "Osc1 Coarse",
            type: "cc",
            cc: [27, 59],
            range: [ -12.0, 12.0 ],
            transform: v => BS2._12(v),
            sysex: {
                offset: 21,
                mask: [0x03,0x7C]
            }
        },
        osc1_waveform: {
            description: "Osc1 Waveform",
            type: "NRPN",
            cc: [0, 72],
            range: [1, 3],
            transform: v => BS2._waveform(v),    //todo: good idea?
            sysex: {
                offset: 19,
                mask: [0x60]
            }
        },
        osc1_mod_env_depth: {
            description: "Osc1 Mod Env Depth",
            type: "cc",
            cc: [71],
            range: [ -63, 63 ],
            transform: v => BS2._depth(v),
            sysex: {
                offset: 98,
                mask: [0x1F,0x60]
            }
        },
        osc1_lfo1_depth: {
            description: "Osc1 LFO1 Depth",
            type: "cc",
            cc: [28, 60],
            range: [ -127, 127 ],
            sysex: {
                offset: 90,
                mask: [0x3F,0x60]
            }
        },
        osc1_mod_env_pw_mod: {
            description: "Osc1 Mod Env PW Mod",
            type: "cc",
            cc: [72],
            range: [ -63, 63 ],
            transform: v => BS2._scale(BS2._depth(v)),
            sysex: {
                offset: 101,
                mask: [0x01,0x7C]
            }
        },
        osc1_lfo2_pw_mod: {
            description: "Osc1 LFO2 PW Mod",
            type: "cc",
            cc: [73],
            range: [ -90, 90 ],
            sysex: {
                offset: 93,
                mask: [0x03,0x7C]
            }
        },
        osc1_manual_pw: {
            description: "Osc1 Manual PW",
            type: "cc",
            cc: [74],
            range: [ 5, 95 ],
            transform: v => BS2._pw(v),
            sysex: {
                offset: 19,
                mask: [0x0F,0x70]
            }
        },
        osc2_fine: {
            description: "Osc2 Fine",
            type: "cc",
            cc: [29, 61],
            range: [ -100, 100 ],
            sysex: {
                offset: 28,
                mask: [0x0F,0x78]
            }
        },
        osc2_range: {
            description: "Osc2 Range",
            type: "cc",
            cc: [75],
            range: [ 63, 66 ],
            sysex: {
                offset: 26,
                mask: [0x1F,0x20]
            }
        },
        osc2_coarse: {
            description: "Osc2 Coarse",
            type: "cc",
            cc: [30, 62],
            range: [ -12, 12 ],
            sysex: {
                offset: 27,
                mask: [0x1F,0x70]
            }
        },
        osc2_waveform: {
            description: "Osc2 Waveform",
            type: "NRPN",
            cc: [0, 82],
            range: [],
            sysex: {
                offset: 24,
                mask: [0x03]
            }
        },
        osc2_mod_env_depth: {
            description: "Osc2 Mod Env Depth",
            type: "cc",
            cc: [76],
            range: [ -63, 63 ],
            transform: v => BS2._depth(v),
            sysex: {
                offset: 99,
                mask: [0x0F,0x70]
            }
        },
        osc2_lfo1_depth: {
            description: "Osc2 LFO1 Depth",
            type: "cc",
            cc: [31, 63],
            range: [ -127, 127 ],
            sysex: {
                offset: 91,
                mask: [0x1F,0x70]
            }
        },
        osc2_env2_pw_mod: {
            description: "Osc2 Env2 PW Mod",
            type: "cc",
            cc: [77],
            range: [ -63, 63 ],
            transform: v => BS2._depth(v),
            sysex: {
                offset: 102,
                mask: [0x01,0x7E]
            }
        },
        osc2_lfo2_pw_mod: {
            description: "Osc2 LFO2 PW Mod",
            type: "cc",
            cc: [78],
            range: [ -90, 90 ],
            sysex: {
                offset: 94,
                mask: [0x01,0x7E]
            }
        },
        osc2_manual_pw: {
            description: "Osc2 Manual PW",
            type: "cc",
            cc: [79],
            range: [ 5, 95 ],
            sysex: {
                offset: 25,
                mask: [0x1F,0x40]
            }
        },
        sub_osc_oct: {
            description: "Sub Osc Oct",
            type: "cc",
            cc: [81],
            range: [ 0, 0 ],
            sysex: {
                offset: 37,
                mask: [0x08]
            }
        },
        sub_osc_wave: {
            description: "Sub Osc Wave",
            type: "cc",
            cc: [80],
            range: [],
            sysex: {
                offset: 36,
                mask: [0x30]
            }
        },
        mixer_osc_1_level: {
            description: "Mixer Osc 1 Level",
            type: "cc",
            cc: [20, 52],
            range: [ 0, 255 ],
            sysex: {
                offset: 37,
                mask: [0x07,0x7C]
            }
        },
        mixer_osc_2_level: {
            description: "Mixer Osc 2 Level",
            type: "cc",
            cc: [21, 53],
            range: [],
            sysex: {
                offset: 38,
                mask: [0x03,0x7E]
            }
        },
        mixer_sub_osc_level: {
            description: "Mixer Sub Osc Level",
            type: "cc",
            cc: [22, 54],
            range: [ 0, 255 ],
            sysex: {
                offset: 39,
                mask: [0x01,0x7F]
            }
        },
        mixer_select_noise_ring_ext: {                      //TODO
            description: "Mixer Select Noise Ring Ext",
            type: "cc",
            cc: [],
            range: [],
            sysex: {
                offset: 0,
                mask: []
            }
        },
        mixer_noise_level: {
            description: "Mixer Noise Level",
            type: "cc",
            cc: [23, 55],
            range: [],
            sysex: {
                offset: 41,
                mask: [0x7F,0x40]
            }
        },
        mixer_ring_mod_level: {
            description: "Mixer Ring Mod Level",
            type: "cc",
            cc: [24, 56],
            range: [],
            sysex: {
                offset: 42,
                mask: [0x3F,0x60]
            }
        },
        mixer_external_signal_level: {
            description: "Mixer External Signal Level",
            type: "cc",
            cc: [25, 57],
            range: [],
            sysex: {
                offset: 43,
                mask: [0x1F,0x70]
            }
        },
        filter_type: {
            description: "Filter Type",
            type: "cc",
            cc: [83],
            range: [],
            sysex: {
                offset: 48,
                mask: [0x04]
            }
        },
        filter_slope: {
            description: "Filter Slope",
            type: "cc",
            cc: [106],
            range: [],
            sysex: {
                offset: 48,
                mask: [0x08]
            }
        },
        filter_shape: {
            description: "Filter Shape",
            type: "cc",
            cc: [84],
            range: [],
            sysex: {
                offset: 48,
                mask: [0x03]
            }
        },
        filter_frequency: {
            description: "Filter Frequency",
            type: "cc",
            cc: [16, 48],
            range: [ 0, 255 ],
            sysex: {
                offset: 44,
                mask: [0x0F,0x78]
            }
        },
        filter_resonance: {
            description: "Filter Resonance",
            type: "cc",
            cc: [82],
            range: [ 0, 127 ],
            sysex: {
                offset: 45,
                mask: [0x03,0x7C]
            }
        },
        filter_mod_env_depth: {
            description: "Filter Mod Env Depth",
            type: "cc",
            cc: [85],
            range: [ -63, 63 ],
            transform: v => BS2._depth(v),
            sysex: {
                offset: 105,
                mask: [0x3F,0x40]
            }
        },
        filter_lfo2_depth: {
            description: "Filter LFO2 Depth",
            type: "cc",
            cc: [17, 49],
            range: [ 0, 127 ],
            sysex: {
                offset: 97,
                mask: [0x3F,0x40]
            }
        },
        filter_overdrive: {
            description: "Filter Overdrive",
            type: "cc",
            cc: [114],
            range: [ 0, 127 ],
            sysex: {
                offset: 46,
                mask: [0x01,0x7E]
            }
        },
        portamento_time: {
            description: "Portamento Time",
            type: "cc",
            cc: [5],
            range: [0, 127],
            sysex: {
                offset: 13,
                mask: [0x03,0x7C]
            }
        },
        lfo1_speed: {
            description: "LFO1 Speed",
            type: "cc",
            cc: [18, 50],
            range: [ 0, 255 ],
            sysex: {
                offset: 66,
                mask: [0x3F,0x60]
            }
        },
        lfo1_delay: {
            description: "LFO1 Delay",
            type: "cc",
            cc: [86],
            range: [ 0, 127 ],
            sysex: {
                offset: 64,
                mask: [0x7F]
            }
        },
        lfo2_speed: {
            description: "LFO2 Speed",
            type: "cc",
            cc: [19, 51],
            range: [ 0, 255 ],
            sysex: {
                offset: 73,
                mask: [0x7F,0x40]
            }
        },
        lfo2_delay: {
            description: "LFO2 Delay",
            type: "cc",
            cc: [87],
            range: [ 0, 127 ],
            sysex: {
                offset: 70,
                mask: [0x01,0x7E]
            }
        },
        lfo1_wave: {
            description: "LFO1 Wave",
            type: "cc",
            cc: [88],
            range: [],
            sysex: {
                offset: 63,
                mask: [0x06]
            }
        },
        lfo2_wave: {
            description: "LFO2 Wave",
            type: "cc",
            cc: [89],
            range: [],
            sysex: {
                offset: 70,
                mask: [0x0C]
            }
        },
        lfo1_sync_value: {
            description: "LFO1 Sync Value",
            type: "NRPN",
            cc: [87],
            range: [],
            sysex: {
                offset: 0,
                mask: []
            }
        },
        lfo2_sync_value: {
            description: "LFO2 Sync Value",
            type: "NRPN",
            cc: [91],
            range: [],
            sysex: {
                offset: 0,
                mask: []
            }
        },
        amp_env_attack: {
            description: "Amp Env Attack",
            type: "cc",
            cc: [90],
            range: [0, 127],
            sysex: {
                offset: 50,
                mask: [0x1F,0x60]
            }
        },
        amp_env_decay: {
            description: "Amp Env Decay",
            type: "cc",
            cc: [91],
            range: [0, 127],
            sysex: {
                offset: 51,
                mask: [0x0F,0x70]
            }
        },
        amp_env_sustain: {
            description: "Amp Env Sustain",
            type: "cc",
            cc: [92],
            range: [0, 127],
            sysex: {
                offset: 52,
                mask: [0x07,0x78]
            }
        },
        amp_env_release: {
            description: "Amp Env Release",
            type: "cc",
            cc: [93],
            range: [0, 127],
            sysex: {
                offset: 53,
                mask: [0x03,0x7C]
            }
        },
        amp_env_triggering: {
            description: "Amp Env Triggering",
            type: "NRPN",
            cc: [0, 73],
            range: [],
            sysex: {
                offset: 55,
                mask: [0x06]
            }
        },
        mod_env_attack: {
            description: "Mod Env Attack",
            type: "cc",
            cc: [102],
            range: [0, 127],
            sysex: {
                offset: 57,
                mask: [0x3F,0x40]
            }
        },
        mod_env_decay: {
            description: "Mod Env Decay",
            type: "cc",
            cc: [103],
            range: [0, 127],
            sysex: {
                offset: 58,
                mask: [0x1F,0x60]
            }
        },
        mod_env_sustain: {
            description: "Mod Env Sustain",
            type: "cc",
            cc: [104],
            range: [0, 127],
            sysex: {
                offset: 59,
                mask: [0x0F,0x70]
            }
        },
        mod_env_release: {
            description: "Mod Env Release",
            type: "cc",
            cc: [105],
            range: [0, 127],
            sysex: {
                offset: 60,
                mask: [0x07,0x78]
            }
        },
        mod_env_triggering: {
            description: "Mod Env Triggering",
            type: "NRPN",
            cc: [0, 105],
            range: [],
            sysex: {
                offset: 55,
                mask: [0x06]    
            }
        },
        fx_distortion: {
            description: "Fx Distortion",
            type: "cc",
            cc: [94],
            range: [0, 127],
            sysex: {
                offset: 107,
                mask: [0x0F,0x70]
            }
        },
        fx_osc_filter_mod: {
            description: "Fx Osc Filter Mod",
            type: "cc",
            cc: [115],
            range: [],
            sysex: {
                offset: 106,
                mask: [0x1F,0x60]
            }
        },
        arp_on: {
            description: "Arp On",
            type: "cc",
            cc: [108],
            range: [0, 1],
            sysex: {
                offset: 77,
                mask: [0x08]
            }
        },
        arp_latch: {
            description: "Arp Latch",
            type: "cc",
            cc: [109],
            range: [0, 1],
            sysex: {
                offset: 77,
                mask: [0x10]
            }
        },
        arp_rhythm: {
            description: "Arp Rhythm",
            type: "cc",
            cc: [119],
            range: [1, 32],
            sysex: {
                offset: 80,
                mask: [0x1F]
            }
        },
        arp_note_mode: {
            description: "Arp Note Mode",
            type: "cc",
            cc: [118],
            range: [],
            sysex: {
                offset: 79,
                mask: [0x0A]    // todo: check
            }
        },
        arp_octaves: {
            description: "Arp Octaves",
            type: "cc",
            cc: [111],
            range: [1, 4],
            sysex: {
                offset: 78,
                mask: [0x14]
            }
        },
        pitch: {
            description: "Pitch",
            type: "cc",
            cc: [],
            range: []   /*,
            sysex: {
                offset: -1,
                mask: []
            } */
        },
        mod: {
            description: "Mod",
            type: "cc",
            cc: [1],
            range: []   /*,
            sysex: {
                offset: -1,
                mask: []
            } */
        },
        mod_wheel_lfo2_filter_freq: {
            description: "Mod Wheel LFO2 to Filter Freq",
            type: "NRPN",
            cc: [0, 71],
            range: [-63, 63],   // display goes to -64
            sysex: {
                offset: 84,
                mask: [0x07,0x78]
            }
        },
        mod_wheel_lfo1_osc_pitch: {
            description: "Mod Wheel LFO1 to Osc Pitch",
            type: "NRPN",
            cc: [0, 70],
            range: [-63, 63],   // display goes to -64
            transform: v => BS2._depth(v),
            sysex: {
                offset: 83,
                mask: [0x0F,0x70]
            }
        },
        mod_wheel_osc2_pitch: {
            description: "Mod Wheel Osc2 Pitch",
            type: "NRPN",
            cc: [0, 78],
            range: [-63, 63],   // display goes to -64
            transform: v => BS2._depth(v),
            sysex: {
                offset: 85,
                mask: [0x03,0x7C]
            }
        },
        mod_wheel_filter_freq: {
            description: "Mod Wheel Filter Freq",
            type: "cc",
            cc: [99, 98, 6],    // check. maybe this is the cc transmitted during the configuration of the parameter
            range: [-64, 63],
            sysex: {
                offset: 82,
                mask: [0x1F,0x60]
            }
        },
        sustain: {
            description: "Sustain",
            type: "cc",
            cc: [64],
            range: []   /*,
            sysex: {
                offset: -1,
                mask: []
            } */
        },
        after_touch: {
            description: "After Touch",
            type: "cc",
            cc: [],
            range: []   /*,
            sysex: {
                offset: -1,
                mask: []
            } */
        },
        aftertouch_filter_freq: {
            description: "Aftertouch Filter Freq",
            type: "NRPN",
            cc: [0, 74],
            range: [-63, 63],   // display goes to -64
            transform: v => BS2._depth(v),
            sysex: {
                offset: 86,
                mask: [0x01,0x7E]
            }
        },
        aftertouch_lfo1_to_osc_pitch: {
            description: "Aftertouch LFO1 to Osc Pitch",
            type: "NRPN",
            cc: [0, 75],
            range: [-63, 63],   // display goes to -64
            transform: v => BS2._depth(v),
            sysex: {
                offset: 88,
                mask: [0x7F]
            }
        },
        aftertouch_lfo2_speed: {
            description: "Aftertouch LFO2 Speed",
            type: "NRPN",
            cc: [0, 76],
            range: [-63, 63],   // display goes to -64
            sysex: {
                offset: 89,
                mask: [0x3F,0x40]
            }
        },
        lfo_key_sync_lfo1: {
            description: "LFO Key Sync LFO1",
            type: "NRPN",
            cc: [0, 89],
            range: [0, 1],  // off, on
            sysex: {
                offset: 69,
                mask: [0x10]
            }
        },
        lfo_key_sync_lfo2: {
            description: "LFO Key Sync LFO2",
            type: "NRPN",
            cc: [0, 93],
            range: [0, 1],  // off, on
            sysex: {
                offset: 76,
                mask: [0x20]
            }
        },
        lfo_speed_sync_lfo1: {
            description: "LFO Speed Sync LFO1",
            type: "NRPN",
            cc: [0, 87],
            range: [0, 1],  // 0 = speed, 1 = sync
            sysex: {
                offset: 69,
                mask: [0x08]
            }
        },
        lfo_speed_sync_lfo2: {
            description: "LFO Speed Sync LFO2",
            type: "NRPN",
            cc: [0, 91],
            range: [0, 1],  // 0 = speed, 1 = sync
            sysex: {
                offset: 76,
                mask: [0x10]
            }
        },
        lfo_slew_lfo_1: {
            description: "LFO Slew LFO 1",
            type: "NRPN",
            cc: [0, 86],
            range: [0, 127],
            sysex: {
                offset: 65,
                mask: [0x3F,0x40]
            }
        },
        lfo_slew_lfo_2: {
            description: "LFO Slew LFO 2",
            type: "NRPN",
            cc: [0, 90],
            range: [0, 127],
            sysex: {
                offset: 72,
                mask: [0x7F]
            }
        },
        osc_pitch_bend_range: {
            description: "Osc Pitch Bend Range",
            type: "cc",
            cc: [107],
            range: [-12, 12],
            sysex: {
                offset: 16,
                mask: [0x7F]        // to check
            }
        },
        osc_1_2_sync: {
            description: "Osc 1 2 Sync",
            type: "cc",
            cc: [110],
            range: [0, 1],  // off, on
            sysex: {
                offset: 18,
                mask: [0x40]
            }
        },
        velocity_amp_env: {
            description: "Velocity Amp Env",
            type: "cc",
            cc: [112],
            range: [-63, 63],
            sysex: {
                offset: 49,
                mask: [0x3F]
            }
        },
        velocity_mod_env: {
            description: "Velocity Mod Env",
            type: "cc",
            cc: [113],
            range: [-63, 63],
            sysex: {
                offset:56,
                mask: [0x7E]
            }
        },
        vca_limit: {
            description: "VCA Limit",
            type: "cc",
            cc: [95],
            range: [0, 127],
            sysex: {
                offset: 108,
                mask: [0x07,0x78]
            }
        },
        arp_swing: {
            description: "Arp Swing",
            type: "cc",
            cc: [116],
            range: [3, 97],
            sysex: {
                offset: 81,
                mask: [0x6F,0x40]   // todo: check
            }
        },
        arp_seq_retrig: {
            description: "Arp Seq Retrig",
            type: "NRPN",
            cc: [106],
            range: [0, 1],  // off, on
            sysex: {
                offset: 77,
                mask: [0x20]
            }
        },
        octave_key_transpose: {
            description: "Octave Key Transpose",
            type: "cc",
            cc: [],
            range: []
        },
        octave: {
            description: "Octave",
            type: "cc",
            cc: [],
            range: [-4, 5],
            sysex: {
                offset: 14,
                mask: [0x01,0x78]   // to check
            }
        }
        /*,
        global_midi_chan: {
            description: "Global Midi Chan",
            type: "cc",
            cc: [],
            range: []
        },
        global_local: {
            description: "Global Local",
            type: "cc",
            cc: [],
            range: []
        },
        global_tune: {
            description: "Global Tune",
            type: "cc",
            cc: [],
            range: []
        },
        global_input_gain: {
            description: "Global Input Gain",
            type: "cc",
            cc: [],
            range: []
        }
        */
    }
};

// 0..255
COARSE_VALUES = [
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

console.log(BS2);

function CC_Map() {
    let m = {};
    for (var prop in BS2.param) {
        let param = BS2.param[prop];
        if (param.type != 'cc') continue;
        if (param.cc.length == 1) {
            m[param.cc[0]] = -1; // means there is no second CC associated
        } else {
            m[param.cc[0]] = param.cc[1];   // means a second CC is needed to form the value
        }
    }
    return m;
}

function CC_Transforms() {
    let m = {};
    for (var prop in BS2.param) {
        let param = BS2.param[prop];
        if (param.type != 'cc') continue;
        if (!param.hasOwnProperty('transform')) continue;
        if (param.cc.length == 1) {
            var i = param.cc[0];
        } else {
            var i = (param.cc[0] << 8) + param.cc[1];
        }
        m[i] = param.transform;
    }
    return m;
}

function CC_Names() {
    let m = {};
    for (var prop in BS2.param) {
        let param = BS2.param[prop];
        if (param.type != 'cc') continue;
        if (param.cc.length == 1) {
            m[param.cc[0]] = param.description;
        } else {
            m[(param.cc[0] << 8) + param.cc[1]] = param.description;
        }
    }
    return m;
}

function NRPN_Names() {
    let m = {};
    for (var prop in BS2.param) {
        let param = BS2.param[prop];
        if (param.type == 'cc') continue;
        if (param.cc.length == 1) {
            m[param.cc[0]] = param.description;
        } else {
            m[(param.cc[0] << 8) + param.cc[1]] = param.description;
        }
    }
    return m;
}
