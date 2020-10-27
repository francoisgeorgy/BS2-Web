import store from "storejs";

const LOCAL_STORAGE_KEY = "studiocode.bs2-editor.preferences";

export let preferences = {
    midi_channel: 1,
    input_device_id: null,      // web midi port ID
    output_device_id: null     // web midi port ID
};

export function loadPreferences() {
    const s = store.get(LOCAL_STORAGE_KEY);
    if (s) preferences = Object.assign(preferences, preferences, JSON.parse(s));
    if (!Number.isInteger(preferences.midi_channel)) {
        // because we changed the format of midi_channel in v0.93
        preferences.midi_channel = 1;
    }
}

export function savePreferences(options = {}) {
    console.log('savePreferences', options);
    Object.assign(preferences, preferences, options);
    store(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
}
