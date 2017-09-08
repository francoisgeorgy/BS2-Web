(function(){

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

    console.log('start tests');

    BS2.init();
    // console.log(BS2);

    BS2.randomize(Object.keys(BS2.control_groups));
    let sysex = BS2.getSysExDump();

    BS2.setValuesFromSysex(sysex);
    let sysex_after = BS2.getSysExDump();

    compareBytesArrays(sysex, sysex_after, 'test 1');

    let string_from_sysex = Utils.toHexString(sysex);
    let sysex_from_string = Utils.fromHexString(string_from_sysex);

    compareBytesArrays(sysex, sysex_from_string, 'test 2');

    // let sysex_binary_2 = Utils.fromHexString(sysex_string);

    BS2.setValuesFromSysex(sysex_from_string);
    sysex_after = BS2.getSysExDump();
    compareBytesArrays(sysex, sysex_after, 'test 3');


})();

