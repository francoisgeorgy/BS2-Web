import DEVICE from './bass-station-2/bass-station-2.js';
import * as Utils from './lib/utils.js';

console.log('start tests.js');

function compareBytesArrays(a1, a2, message_prefix) {
    // console.log("compareBytesArrays");
    // if (message) console.log(message);
    let p = message_prefix ? (message_prefix + ': ') : '';
    let before = JSON.stringify(a1);
    let after = JSON.stringify(a2);
    if (after === before) {
        console.log(p + 'success');
    } else {
        console.log(p + 'fail');
        console.log(p, before);
        console.log(p, after);
        for (let i=0; i<a1.length; i++) {
            if (a1[i] === a2[i]) continue;
            console.log(p + `diff at index ${i}: before=${a1[i]}, after=${a2[i]}`);
        }
        // console.log(BS2);
    }
}

/**
 *
 */
document.addEventListener("DOMContentLoaded", function(event) {

    console.log('start tests');

    DEVICE.init();
    // console.log(DEVICE);

    DEVICE.randomize(Object.keys(DEVICE.control_groups));
    let sysex = DEVICE.getSysEx();

    DEVICE.setValuesFromSysEx(sysex);
    let sysex_after = DEVICE.getSysEx();

    compareBytesArrays(sysex, sysex_after, 'test 1');

    let string_from_sysex = Utils.toHexString(sysex);
    let sysex_from_string = Utils.fromHexString(string_from_sysex);

    compareBytesArrays(sysex, sysex_from_string, 'test 2');

    // let sysex_binary_2 = Utils.fromHexString(sysex_string);

    DEVICE.setValuesFromSysEx(sysex_from_string);
    sysex_after = DEVICE.getSysEx();
    compareBytesArrays(sysex, sysex_after, 'test 3');

});
