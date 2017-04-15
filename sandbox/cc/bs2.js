BS2 = {
    _100: function (v) {
        return v < 128 ? (v - 127) : (v - 128);
    },
    _12: function (v) {
        //let a = v < 128 ? (v - 127) : (v - 128);
        let a = 240 / 255 * v;
        console.log('a', a);
        return a;
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
            sysex: {
                offset: 22,
                mask: [0x03,0x7E],
                transform: v => BS2._100(v)
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
            sysex: {
                offset: 21,
                mask: [0x03,0x7C],
                transform: v => BS2._12(v)
            }
        },
        osc1_waveform: {
            description: "Osc1 Waveform",
            type: "NRPN",
            cc: [0, 72],
            range: [],
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
            range: [ -90, 90 ],
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
            range: [ -90, 90 ],
            sysex: {
                offset: 102,
                mask: [0x01,0x7E],
                transform: v => Math.trunc(180/127 * v) - 90
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
            range: [],
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
            cc: [0],
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

console.log(BS2);

function CC_Map() {
    let m = {};
    for (var prop in BS2.param) {
        let param = BS2.param[prop];
        if (param.type != 'cc') continue;
        if (param.cc.length == 1) {
            m[param.cc[0]] = null;
        } else {
            m[param.cc[0]] = param.cc[1];
        }
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
            let a = (param.cc[0] << 8) + param.cc[1];
            m[(param.cc[0] << 8) + param.cc[1]] = param.description;
        }
    }
    return m;
}
