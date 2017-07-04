(function(){

    const VERSION = '0.0.1';

    console.log(`Bass Station II Patch Sheet ${VERSION}`);

    const DEVICE = BS2;

/*
    function loadTemplate() {
        $.get('templates/patch-sheet.template.html', function(template) {
            var template = $(templates).filter('#tpl-greeting').html();
            $('body').append(Mustache.render(template, templateData));
        });
    }
*/

    /**
     *
     */
    function printall() {

        function _p(controls, list, id_prefix) {
            // $('#sheet').append(`<!--<table class="values">-->`);
            // var o = `<table class="values">`;
            let o = '';
            for (let i=0; i < list.length; i++) {
                let c = controls[list[i]];
                if (typeof c === 'undefined') continue;
                console.log(c.name, c.init_value, c.raw_value, c.value);

                let v = c.value;
                if (c.on_off) {
                    v = c.value == 0 ? 'off' : 'on';
                }

                o += `<tr id="${id_prefix}-${list[i]}" title="${c.name}"><td>${c.name}</td><td>${v}</td></tr>`;

            }
            // $('#sheet').append(`</table>`);
            // o += `</table>`;
            // $('#sheet').append(o);
            return o;
        }

        for (let group in DEVICE.control_groups) {
            if (DEVICE.control_groups.hasOwnProperty(group)) {
                console.log('group', group, DEVICE.control_groups[group]);

                $('#sheet').append(`<h2>${DEVICE.control_groups[group].name}</h2>`);

                let t = `<table id="${group}" class="values">`;

                t += _p(DEVICE.control, DEVICE.control_groups[group].controls, 'control');
                t += _p(DEVICE.nrpn, DEVICE.control_groups[group].nrpns, 'nrpn');

                t += `</table>`;
                $('#sheet').append(t);

                // for (let i=0; i < DEVICE.control_groups[group].controls.length; i++) {
                //     let c = DEVICE.control[DEVICE.control_groups[group].controls[i]];
                //     if (typeof c === 'undefined') continue;
                //     console.log(c.name, c.init_value, c.raw_value, c.value);
                // }
                // for (let i=0; i < DEVICE.control_groups[group].nrpns.length; i++) {
                //     let c = DEVICE.nrpn[DEVICE.control_groups[group].nrpns[i]];
                //     if (typeof c === 'undefined') continue;
                //     console.log(c.name, c.init_value, c.raw_value, c.value);
                // }
            }
        }
    }

    $(function () {
        DEVICE.init();
        printall();
    });

})(); // Call the anonymous function once, then throw it away!
