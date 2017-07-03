(function(){

    const VERSION = '0.0.1';

    console.log(`Bass Station II Patch Sheet ${VERSION}`);

    const DEVICE = BS2;

    /**
     *
     */
    function printall() {

        for (var group in DEVICE.control_groups) {
            if (DEVICE.control_groups.hasOwnProperty(group)) {
                console.log(group, DEVICE.control_groups[group]);
                for (let i=0; i < DEVICE.control_groups[group].controls.length; i++) {
                    let c = DEVICE.control[DEVICE.control_groups[group].controls[i]];
                    if (typeof c === 'undefined') continue;
                    console.log(c.name, c.init_value, c.raw_value, c.value);
                }
                for (let i=0; i < DEVICE.control_groups[group].nrpns.length; i++) {
                    let c = DEVICE.nrpn[DEVICE.control_groups[group].nrpns[i]];
                    if (typeof c === 'undefined') continue;
                    console.log(c.name, c.init_value, c.raw_value, c.value);
                }
            }
        }
    }

    $(function () {
        DEVICE.init();
        printall();
    });

})(); // Call the anonymous function once, then throw it away!
