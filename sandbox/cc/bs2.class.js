"use strict";

class BS2 {

    constructor() {
        this._data = null;
    }

    set data(bytes) {
        this._data = bytes;
    }

    get data() {
        return this._data;
    }

    /*load(bytes) {
        this.data = bytes;	// will call data setter
    }*/

    static get control_id() {
        return {
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
        }
    }
    static get nrpn_id() {
        return {
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
        }
    }
    static get control() {
        let control = new Array(127);
        control[BS2.control_id.patch_volume] = { // 7
            descr: "Patch Volume",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.osc1_fine] = { // 26 (msb), 58 (lsb)
            descr: "Osc1 Fine",
            range: [-100,100],
            lsb: 58
        };
        control[BS2.control_id.osc1_range] = { // 70
            descr: "Osc1 Range",
            range: [63,66],
            lsb: -1
        };
        control[BS2.control_id.osc1_coarse] = { // 27 (msb), 59 (lsb)
            descr: "Osc1 Coarse",
            range: [-12,12],
            lsb: 59
        };
        control[BS2.control_id.osc1_mod_env_depth] = { // 71
            descr: "Osc1 Mod Env Depth",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.osc1_lfo1_depth] = { // 28 (msb), 60 (lsb)
            descr: "Osc1 LFO1 Depth",
            range: [-127,127],
            lsb: 60
        };
        control[BS2.control_id.osc1_mod_env_pw_mod] = { // 72
            descr: "Osc1 Mod Env PW Mod",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.osc1_lfo2_pw_mod] = { // 73
            descr: "Osc1 LFO2 PW Mod",
            range: [-90,90],
            lsb: -1
        };
        control[BS2.control_id.osc1_manual_pw] = { // 74
            descr: "Osc1 Manual PW",
            range: [5,95],
            lsb: -1
        };
        control[BS2.control_id.osc2_fine] = { // 29 (msb), 61 (lsb)
            descr: "Osc2 Fine",
            range: [-100,100],
            lsb: 61
        };
        control[BS2.control_id.osc2_range] = { // 75
            descr: "Osc2 Range",
            range: [63,66],
            lsb: -1
        };
        control[BS2.control_id.osc2_coarse] = { // 30 (msb), 62 (lsb)
            descr: "Osc2 Coarse",
            range: [-12,12],
            lsb: 62
        };
        control[BS2.control_id.osc2_mod_env_depth] = { // 76
            descr: "Osc2 Mod Env Depth",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.osc2_lfo1_depth] = { // 31 (msb), 63 (lsb)
            descr: "Osc2 LFO1 Depth",
            range: [-127,127],
            lsb: 63
        };
        control[BS2.control_id.osc2_env2_pw_mod] = { // 77
            descr: "Osc2 Env2 PW Mod",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.osc2_lfo2_pw_mod] = { // 78
            descr: "Osc2 LFO2 PW Mod",
            range: [-90,90],
            lsb: -1
        };
        control[BS2.control_id.osc2_manual_pw] = { // 79
            descr: "Osc2 Manual PW",
            range: [5,95],
            lsb: -1
        };
        control[BS2.control_id.sub_osc_oct] = { // 81
            descr: "Sub Osc Oct",
            range: [0,0],
            lsb: -1
        };
        control[BS2.control_id.sub_osc_wave] = { // 80
            descr: "Sub Osc Wave",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.mixer_osc_1_level] = { // 20 (msb), 52 (lsb)
            descr: "Mixer Osc 1 Level",
            range: [0,255],
            lsb: 52
        };
        control[BS2.control_id.mixer_osc_2_level] = { // 21 (msb), 53 (lsb)
            descr: "Mixer Osc 2 Level",
            range: [],
            lsb: 53
        };
        control[BS2.control_id.mixer_sub_osc_level] = { // 22 (msb), 54 (lsb)
            descr: "Mixer Sub Osc Level",
            range: [0,255],
            lsb: 54
        };
        control[BS2.control_id.mixer_noise_level] = { // 23 (msb), 55 (lsb)
            descr: "Mixer Noise Level",
            range: [],
            lsb: 55
        };
        control[BS2.control_id.mixer_ring_mod_level] = { // 24 (msb), 56 (lsb)
            descr: "Mixer Ring Mod Level",
            range: [],
            lsb: 56
        };
        control[BS2.control_id.mixer_external_signal_level] = { // 25 (msb), 57 (lsb)
            descr: "Mixer External Signal Level",
            range: [],
            lsb: 57
        };
        control[BS2.control_id.filter_type] = { // 83
            descr: "Filter Type",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.filter_slope] = { // 106
            descr: "Filter Slope",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.filter_shape] = { // 84
            descr: "Filter Shape",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.filter_frequency] = { // 16 (msb), 48 (lsb)
            descr: "Filter Frequency",
            range: [0,255],
            lsb: 48
        };
        control[BS2.control_id.filter_resonance] = { // 82
            descr: "Filter Resonance",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.filter_mod_env_depth] = { // 85
            descr: "Filter Mod Env Depth",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.filter_lfo2_depth] = { // 17 (msb), 49 (lsb)
            descr: "Filter LFO2 Depth",
            range: [0,127],
            lsb: 49
        };
        control[BS2.control_id.filter_overdrive] = { // 114
            descr: "Filter Overdrive",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.portamento_time] = { // 5
            descr: "Portamento Time",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.lfo1_speed] = { // 18 (msb), 50 (lsb)
            descr: "LFO1 Speed",
            range: [0,255],
            lsb: 50
        };
        control[BS2.control_id.lfo1_delay] = { // 86
            descr: "LFO1 Delay",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.lfo2_speed] = { // 19 (msb), 51 (lsb)
            descr: "LFO2 Speed",
            range: [0,255],
            lsb: 51
        };
        control[BS2.control_id.lfo2_delay] = { // 87
            descr: "LFO2 Delay",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.lfo1_wave] = { // 88
            descr: "LFO1 Wave",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.lfo2_wave] = { // 89
            descr: "LFO2 Wave",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.amp_env_attack] = { // 90
            descr: "Amp Env Attack",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.amp_env_decay] = { // 91
            descr: "Amp Env Decay",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.amp_env_sustain] = { // 92
            descr: "Amp Env Sustain",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.amp_env_release] = { // 93
            descr: "Amp Env Release",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.mod_env_attack] = { // 102
            descr: "Mod Env Attack",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.mod_env_decay] = { // 103
            descr: "Mod Env Decay",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.mod_env_sustain] = { // 104
            descr: "Mod Env Sustain",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.mod_env_release] = { // 105
            descr: "Mod Env Release",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.fx_distortion] = { // 94
            descr: "Fx Distortion",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.fx_osc_filter_mod] = { // 115
            descr: "Fx Osc Filter Mod",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.arp_on] = { // 108
            descr: "Arp On",
            range: [0,1],
            lsb: -1
        };
        control[BS2.control_id.arp_latch] = { // 109
            descr: "Arp Latch",
            range: [0,1],
            lsb: -1
        };
        control[BS2.control_id.arp_rhythm] = { // 119
            descr: "Arp Rhythm",
            range: [1,32],
            lsb: -1
        };
        control[BS2.control_id.arp_note_mode] = { // 118
            descr: "Arp Note Mode",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.arp_octaves] = { // 111
            descr: "Arp Octaves",
            range: [1,4],
            lsb: -1
        };
        control[BS2.control_id.mod] = { // 1
            descr: "Mod",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.mod_wheel_filter_freq] = { // 99
            descr: "Mod Wheel Filter Freq",
            range: [-64,63],
            lsb: -1
        };
        control[BS2.control_id.sustain] = { // 64
            descr: "Sustain",
            range: [],
            lsb: -1
        };
        control[BS2.control_id.osc_pitch_bend_range] = { // 107
            descr: "Osc Pitch Bend Range",
            range: [-12,12],
            lsb: -1
        };
        control[BS2.control_id.osc_1_2_sync] = { // 110
            descr: "Osc 1 2 Sync",
            range: [0,1],
            lsb: -1
        };
        control[BS2.control_id.velocity_amp_env] = { // 112
            descr: "Velocity Amp Env",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.velocity_mod_env] = { // 113
            descr: "Velocity Mod Env",
            range: [-63,63],
            lsb: -1
        };
        control[BS2.control_id.vca_limit] = { // 95
            descr: "VCA Limit",
            range: [0,127],
            lsb: -1
        };
        control[BS2.control_id.arp_swing] = { // 116
            descr: "Arp Swing",
            range: [3,97],
            lsb: -1
        };
        return control;
    }
    static get nrpn() {
        let nrpn = new Array(127);
        nrpn[BS2.nrpn_id.osc1_waveform] = { // 0 (msb), 72 (lsb)
            descr: "Osc1 Waveform",
            range: [1,3],
            msb: 0
        };
        nrpn[BS2.nrpn_id.osc2_waveform] = { // 0 (msb), 82 (lsb)
            descr: "Osc2 Waveform",
            range: [],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo1_sync_value] = { // 87
            descr: "LFO1 Sync Value",
            range: [],
            msb: -1
        };
        nrpn[BS2.nrpn_id.lfo2_sync_value] = { // 91
            descr: "LFO2 Sync Value",
            range: [],
            msb: -1
        };
        nrpn[BS2.nrpn_id.amp_env_triggering] = { // 0 (msb), 73 (lsb)
            descr: "Amp Env Triggering",
            range: [],
            msb: 0
        };
        nrpn[BS2.nrpn_id.mod_env_triggering] = { // 0 (msb), 105 (lsb)
            descr: "Mod Env Triggering",
            range: [],
            msb: 0
        };
        nrpn[BS2.nrpn_id.mod_wheel_lfo2_filter_freq] = { // 0 (msb), 71 (lsb)
            descr: "Mod Wheel LFO2 to Filter Freq",
            range: [-63,63],
            msb: 0
        };
        nrpn[BS2.nrpn_id.mod_wheel_lfo1_osc_pitch] = { // 0 (msb), 70 (lsb)
            descr: "Mod Wheel LFO1 to Osc Pitch",
            range: [-63,63],
            msb: 0
        };
        nrpn[BS2.nrpn_id.mod_wheel_osc2_pitch] = { // 0 (msb), 78 (lsb)
            descr: "Mod Wheel Osc2 Pitch",
            range: [-63,63],
            msb: 0
        };
        nrpn[BS2.nrpn_id.aftertouch_filter_freq] = { // 0 (msb), 74 (lsb)
            descr: "Aftertouch Filter Freq",
            range: [-63,63],
            msb: 0
        };
        nrpn[BS2.nrpn_id.aftertouch_lfo1_to_osc_pitch] = { // 0 (msb), 75 (lsb)
            descr: "Aftertouch LFO1 to Osc Pitch",
            range: [-63,63],
            msb: 0
        };
        nrpn[BS2.nrpn_id.aftertouch_lfo2_speed] = { // 0 (msb), 76 (lsb)
            descr: "Aftertouch LFO2 Speed",
            range: [-63,63],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo_key_sync_lfo1] = { // 0 (msb), 89 (lsb)
            descr: "LFO Key Sync LFO1",
            range: [0,1],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo_key_sync_lfo2] = { // 0 (msb), 93 (lsb)
            descr: "LFO Key Sync LFO2",
            range: [0,1],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo_speed_sync_lfo1] = { // 0 (msb), 87 (lsb)
            descr: "LFO Speed Sync LFO1",
            range: [0,1],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo_speed_sync_lfo2] = { // 0 (msb), 91 (lsb)
            descr: "LFO Speed Sync LFO2",
            range: [0,1],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo_slew_lfo_1] = { // 0 (msb), 86 (lsb)
            descr: "LFO Slew LFO 1",
            range: [0,127],
            msb: 0
        };
        nrpn[BS2.nrpn_id.lfo_slew_lfo_2] = { // 0 (msb), 90 (lsb)
            descr: "LFO Slew LFO 2",
            range: [0,127],
            msb: 0
        };
        nrpn[BS2.nrpn_id.arp_seq_retrig] = { // 106
            descr: "Arp Seq Retrig",
            range: [0,1],
            msb: -1
        };
        return nrpn;
    }
/*
    static findControl(id) {
        console.log(C.controls);
        for (let i=0; i < C.controls.length; i++) {
            console.log('findControl', i);
            if (C.controls[i].id == id) {
                console.log('found control', C.controls[i]);
                return C.controls[i];
            }
        }
    }
*/
}


//var b = new BS2();
console.log(BS2.control_id.vca_limit);
console.log(BS2.control[95]);

console.log(BS2.nrpn_id.osc1_waveform);
console.log(BS2.nrpn[72]);


/*
C.ctrls = function() {
    return [
        { id: 'a', v: 0 },
        { id: 'b', v: 1 }
    ];
}


var c = new C();

console.log(c);
console.log(C.controls);
console.log(C.controls[0].id);
console.log("explicit", C.controls[0].toString());
console.log("implicit", C.controls[0]);
console.log("implicit: " + C.controls[0]);

c.data = [1,2,3,4,5];
console.log(c);

c.load([7,8,9]);
console.log(c);

c.another_load([11,12,13]);
console.log(c);

console.log(c.data);
console.log(c.data[2]);

var ctrl = C.findControl('b');
console.log(ctrl);

var c1 = C.controls;
var c2 = C.controls;
console.log(c1 == c2);	// false

console.log(C.ctrls);

var c3 = C.ctrls();
var c4 = C.ctrls();
console.log(c3 == c4);	// false

c3[1].v = 9;
console.log(c3, c4);

console.log(global);
    */