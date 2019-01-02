import {control_id} from "./cc.js";
import {nrpn_id} from "./nrpn.js";

/**
 * Group and order controls.
 * This is useful for printing or using in some configuration dialog (e.g. randomizer).
 */
export const control_groups = {
    lfo1: {
        name: "LFO 1",
        controls: [
            {type: "cc", number: control_id.lfo1_wave},
            {type: "cc", number: control_id.lfo1_delay},
            {type: "cc", number: control_id.lfo1_speed},
            {type: "nrpn", number: nrpn_id.lfo1_slew},
            {type: "nrpn", number: nrpn_id.lfo1_speed_sync},
            {type: "nrpn", number: nrpn_id.lfo1_sync_value},
            {type: "nrpn", number: nrpn_id.lfo1_key_sync}]
    },
    lfo2: {
        name: "LFO 2",
        controls: [
            {type: "cc", number: control_id.lfo2_wave},
            {type: "cc", number: control_id.lfo2_delay},
            {type: "cc", number: control_id.lfo2_speed},
            {type: "nrpn", number: nrpn_id.lfo2_slew},
            {type: "nrpn", number: nrpn_id.lfo2_key_sync},
            {type: "nrpn", number: nrpn_id.lfo2_sync_value},
            {type: "nrpn", number: nrpn_id.lfo2_key_sync}]
    },
    osc1: {
        name: "Osc 1",
        controls: [
            {type: "nrpn", number: nrpn_id.osc1_waveform},
            {type: "cc", number: control_id.osc1_range},
            {type: "cc", number: control_id.osc1_coarse},
            {type: "cc", number: control_id.osc1_fine},
            {type: "cc", number: control_id.osc1_mod_env_depth},
            {type: "cc", number: control_id.osc1_lfo1_depth},
            {type: "cc", number: control_id.osc1_mod_env_pw_mod},
            {type: "cc", number: control_id.osc1_manual_pw},
            {type: "cc", number: control_id.osc1_lfo2_pw_mod},
            {type: "nrpn", number: control_id.osc_error}]
    },
    osc2: {
        name: "Osc 2",
        controls: [
            {type: "nrpn", number: nrpn_id.osc2_waveform},
            {type: "cc", number: control_id.osc2_range},
            {type: "cc", number: control_id.osc2_coarse},
            {type: "cc", number: control_id.osc2_fine},
            {type: "cc", number: control_id.osc2_mod_env_depth},
            {type: "cc", number: control_id.osc2_lfo1_depth},
            {type: "cc", number: control_id.osc2_mod_env_pw_mod},
            {type: "cc", number: control_id.osc2_manual_pw},
            {type: "cc", number: control_id.osc2_lfo2_pw_mod},
            {type: "cc", number: control_id.osc_1_2_sync}]
    },
    sub: {
        name: "Sub osc",
        controls: [
            {type: "cc", number: control_id.sub_osc_oct},
            {type: "cc", number: control_id.sub_osc_wave}],
    },
    mixer: {
        name: "Mixer",
        controls: [
            {type: "cc", number: control_id.mixer_osc_1_level},
            {type: "cc", number: control_id.mixer_osc_2_level},
            {type: "cc", number: control_id.mixer_sub_osc_level},
            {type: "cc", number: control_id.mixer_external_signal_level},
            {type: "cc", number: control_id.mixer_ring_mod_level},
            {type: "cc", number: control_id.mixer_noise_level}]
    },
    filter: {
        name: "Filter",
        controls: [
            {type: "cc", number: control_id.filter_type},
            {type: "cc", number: control_id.filter_slope},
            {type: "cc", number: control_id.filter_shape},
            {type: "cc", number: control_id.filter_resonance},
            {type: "cc", number: control_id.filter_frequency},
            {type: "cc", number: control_id.filter_mod_env_depth},
            {type: "cc", number: control_id.filter_lfo2_depth},
            {type: "cc", number: control_id.filter_overdrive},
            {type: "nrpn", number: control_id.filter_tracking}],
    },
    mod_env: {
        name: "Mod Env",
        controls: [
            {type: "cc", number: control_id.mod_env_attack},
            {type: "cc", number: control_id.mod_env_decay},
            {type: "cc", number: control_id.mod_env_sustain},
            {type: "cc", number: control_id.mod_env_release},
            {type: "nrpn", number: nrpn_id.mod_env_triggering},
            {type: "nrpn", number: nrpn_id.mod_env_retriggering}]
    },
    amp_env: {
        name: "Amp Env",
        controls: [
            {type: "cc", number: control_id.amp_env_attack},
            {type: "cc", number: control_id.amp_env_decay},
            {type: "cc", number: control_id.amp_env_sustain},
            {type: "cc", number: control_id.amp_env_release},
            {type: "nrpn", number: nrpn_id.amp_env_triggering},
            {type: "nrpn", number: nrpn_id.amp_env_retriggering}]
    },
    vca: {
        name: "VCA",
        controls: [
            {type: "cc", number: control_id.vca_limit}],
    },
    effects: {
        name: "Effects",
        controls: [
            {type: "cc", number: control_id.fx_distortion},
            {type: "cc", number: control_id.fx_osc_filter_mod}],
    },
    arp: {
        name: "ARP",
        controls: [
            {type: "cc", number: control_id.arp_on},
            {type: "cc", number: control_id.arp_latch},
            {type: "cc", number: control_id.arp_rhythm},
            {type: "cc", number: control_id.arp_note_mode},
            {type: "cc", number: control_id.arp_octaves},
            {type: "cc", number: control_id.arp_swing},
            {type: "nrpn", number: nrpn_id.arp_seq_retrig}]
    },
    keyboard: {
        name: "Keyboard",
        controls: [
            {type: "cc", number: control_id.sustain},
            {type: "cc", number: control_id.portamento_time},
            {type: "cc", number: control_id.velocity_mod_env},
            {type: "cc", number: control_id.velocity_amp_env},
            {type: "nrpn", number: nrpn_id.aftertouch_lfo1_to_osc_pitch},
            {type: "nrpn", number: nrpn_id.aftertouch_lfo2_speed},
            {type: "nrpn", number: nrpn_id.aftertouch_filter_freq}]
    },
    wheels: {
        name: "Wheels",
        controls: [
            {type: "cc", number: control_id.osc_pitch_bend_range},
            {type: "nrpn", number: nrpn_id.mod_wheel_lfo1_osc_pitch},
            {type: "nrpn", number: nrpn_id.mod_wheel_osc2_pitch},
            {type: "nrpn", number: nrpn_id.mod_wheel_filter_freq},
            {type: "nrpn", number: nrpn_id.mod_wheel_lfo2_filter_freq}]
        // },
        // others: {
        //     name: "Others",
        //     controls: [control_id.mod],
        //     nrpns: []
    }
};
