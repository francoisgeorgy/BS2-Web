

const getStringValue = function(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] > 0) {
            s += String.fromCharCode(bytes[i]);
        }
    }
    return s;
};

export default {
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
    },
    getStringValue
};

