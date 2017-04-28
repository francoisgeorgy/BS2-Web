
    function setStatus(msg) {
        $('#status').removeClass("error").text(msg);
    }

    function setStatusError(msg) {
        $('#status').addClass("error").text(msg);

    }

    function hide(sel) {
        $(sel).css('visibility', 'hidden');
    }

    function show(sel) {
        $(sel).css('visibility', 'visible');
    }

    function setConnectionStatus(status) {
        $('#connection-status').html(status ? 'connected' : 'not connected');
    }

    function dispatch(type, control, value) {
        type = type.toLowerCase();
        //console.log(type, control, value, '#' + type + '-' + control);
        if ((type != 'cc') && (type != 'nrpn')) return; //TODO: signal an error
        $('#' + type + '-' + control).val(value).trigger('change');
    }

    //TODO: put into BS2 object
    function doubleByteValue(msb, lsb) {
        let v = msb << 1;
        return lsb > 0 ? (v+1) : v;
    }

    var cc_expected = -1;
    var cc_msb = -1;
    var cc_lsb = -1;
    var value_msb = 0;    // msb to compute value
    var value_lsb = 0;    // lsb to compute value
    var nrpn = false;

    function handleCC(e) {

        let msg = e.data;   // Uint8Array
        let cc = msg[1];
        let value = -1;

        if (cc == WebMidi.MIDI_CONTROL_CHANGE_MESSAGES['nonregisteredparameterfine']) {   // 99
            cc_msb = msg[2];
            nrpn = true;
            return;
        } else if (cc == WebMidi.MIDI_CONTROL_CHANGE_MESSAGES['nonregisteredparametercoarse']) {  // 98
            cc_lsb = msg[2];
            return;
        } else {
            if (nrpn) {
                value = msg[2];
                let v = value;
                let r;
                if (BS2.nrpn[cc_lsb].hasOwnProperty('map')) {
                    r = BS2.nrpn[cc_lsb].map(v);
                } else {
                    r = v;
                }
                dispatch('NRPN', cc_lsb, r);
                nrpn = false;
                return;
            }
        }

        if (cc_expected >= 0) {
            if (cc == cc_expected) {
                value_lsb = msg[2];
                let v = doubleByteValue(value_msb, value_lsb);
                let r;
                if (BS2.control[cc_msb].hasOwnProperty('map')) {
                    r = BS2.control[cc_msb].map(v);
                } else {
                    r = v;
                }
                dispatch('CC', cc_msb, r);
                cc_expected = -1;
            } else {
                cc_msb = cc;
            }
        } else {

            if (BS2.control[cc].lsb == -1) {
                let v = msg[2];
                let r;
                if (BS2.control[cc].hasOwnProperty('map')) {
                    r = BS2.control[cc].map(v);
                } else {
                    r = v;
                }
                dispatch('CC', cc, r);
            } else {
                cc_expected = BS2.control[cc].lsb;
                cc_msb = cc;
                value_msb = msg[2];
            }
        }
    }


    function importFromFile() {
        alert('Sorry, this feature is not yet implemented.');
    }
    function exportToFile() {
        alert('Sorry, this feature is not yet implemented.');
    }
    function sendToBS2() {
        alert('Sorry, this feature is not yet implemented.');
    }
    function initBS2() {
        alert('Sorry, this feature is not yet implemented.');
    }
    function randomizeBS2() {

        function _randomize(controls, prefix) {
            for (let i=0; i < controls.length; i++) {
                let c = controls[i];
                if (typeof c === 'undefined') continue;
                if (c.range.length === 0) continue;
                let e = $(prefix + i);
                let min = Math.min(...c.range);
                let max = Math.max(...c.range);
                let v;
                if ((min == 0) && (max == 1)) {
                    v = Math.round(Math.random());
                } else {
                    v = Math.floor(Math.random() * (max - min)) + min;  //TODO: step
                }
                if (e.is('select')) {
                    //console.log(`${e} is a select`, e, e[0].options);
                    e[0].options[Math.floor(Math.random() * e[0].options.length)].selected = true
                } else {
                    e.val(v).trigger('change');
                }
            }
        }

        _randomize(BS2.control, '#cc-');
        _randomize(BS2.nrpn, '#nrpn-');

        updateCustoms();
    }

    function setupCommands() {
        $('#cmd-export').click(exportToFile);
        $('#cmd-import').click(importFromFile);
        $('#cmd-send').click(sendToBS2);
        $('#cmd-init').click(initBS2);
        $('#cmd-randomize').click(randomizeBS2);
    }

    function setupDials() {

        const CURSOR = 12;

        $(".dial").knob({
            // change : function (v) { console.log('change', v); },
            // release : function (v) { console.log('release', v); },
            angleOffset: -135,
            angleArc: 270,
            bgColor: "#606060",
            fgColor: "#ffec03"
        });

        function _setup(controls, prefix) {
            for (let i=0; i < controls.length; i++) {
                let c = controls[i];
                if (typeof c == 'undefined') continue;
                if (!c.hasOwnProperty('range')) continue;
                let id = prefix + i;
                // let min = c.range[0];
                // let max = c.range[1];
                if (c.range.length === 0) continue;     //TODO: SIGNAL AN ERROR
                let min = Math.min(...c.range);
                let max = Math.max(...c.range);
                let cursor = min < 0 ? CURSOR : false;
                //if (c.hasOwnProperty('step')) continue;
                let step = c.hasOwnProperty('step') ? c.step : 1;
                // console.log('configure', prefix+i, min, max, step, cursor);
                $(id).trigger('configure', { min: min, max: max, step: step, cursor: cursor });
                if (min != 0) {
                    //$(id).val(min).trigger('change');
                    $(id).val(min).trigger('blur');
                }
            }
        }

        _setup(BS2.control, '#cc-');
        _setup(BS2.nrpn, '#nrpn-');

        $('#cc-' + BS2.control_id.osc1_coarse).trigger('configure', { format: v => v.toFixed(1) });
        $('#cc-' + BS2.control_id.osc2_coarse).trigger('configure', { format: v => v.toFixed(1) });

    } // setupDials

    /**
     * Set value of the dials
     */
    function updateDials() {

        for (let i=0; i < BS2.control.length; i++) {
            let c = BS2.control[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#cc-' + i);
            if (e.is('select')) {
                //e.val();
                console.log(`${i} is a select`);
            } else {
                e.val(c.value).trigger('change');
            }
            // if (e.hasClass('dial')) {

            // } else {
            //     e.val(c.value);
            // }
        }

        for (let i=0; i < BS2.nrpn.length; i++) {
            let c = BS2.nrpn[i];
            if (typeof c === 'undefined') continue;
            if (!c.hasOwnProperty('value')) continue;
            let e = $('#nrpn-' + i);
            // if (e.hasClass('dial')) {
                e.val(c.value).trigger('change');
            // } else {
            //     e.val(c.value);
            // }
        }

    } // updateDials()

    function setupLists() {

        $('#cc-80').append(BS2.SUB_WAVE_FORMS.map(o => { return $("<option>").val(o).text(o); }));

        $('#cc-88,#cc-89').append(BS2.LFO_WAVE_FORMS.map(o => { return $("<option>").val(o).text(o); }));
        $('#nrpn-88,#nrpn-92').append(BS2.LFO_SPEED_SYNC.map(o => { return $("<option>").val(o).text(o); }));
        $('#nrpn-87,#nrpn-91').append(BS2.LFO_SYNC.map(o => { return $("<option>").val(o).text(o); }));

        $('#cc-70,#cc-75').append(BS2.OSC_RANGES.map(o => { return $("<option>").val(o).text(o); }));
        $('#nrpn-72,#nrpn-82').append(BS2.OSC_WAVE_FORMS.map(o => { return $("<option>").val(o).text(o); }));

        $('#cc-83').append(BS2.FILTER_TYPE.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-106').append(BS2.FILTER_SLOPE.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-84').append(BS2.FILTER_SHAPES.map(o => { return $("<option>").val(o).text(o); }));

        $('#nrpn-73,#nrpn-105').append(BS2.ENV_TRIGGERING.map(o => { return $("<option>").val(o).text(o); }));

        $('#cc-111').append(BS2.ARP_OCTAVES.map(o => { return $("<option>").val(o).text(o); }));
        $('#cc-118').append(BS2.ARP_NOTES_MODE.map(o => { return $("<option>").val(o).text(o); }));

        for (let i=1; i<33; i++) {
            $('#cc-119').append($("<option>").val(i).text(i));
        }

        // osc1 waveform
        $('#nrpn-72').change(function (e) {
            if (this.value == 'pulse') {
                show('#osc1-pw-controls');
            } else {
                hide('#osc1-pw-controls');
            }
        });
        $('#nrpn-82').change(function (e) {
            if (this.value == 'pulse') {
                show('#osc2-pw-controls');
            } else {
                hide('#osc2-pw-controls');
            }
        });

    } // setupLists

    function updateLists() {
    }

    function setupOnOffControl(control_id) {
        $(control_id + '-handle').click(function(){
            let v = $(control_id).val();
            $(control_id).val(v == 0 ? 1 : 0);
            updateCustoms();
        });
    }

    function setupCustoms() {

        $('#cc-110').removeClass("on").addClass("off").text("Osc 1-2 Sync OFF");
        //$('#cc-110').removeClass("off").addClass("on").text("Osc 1-2 Sync ON");

        // $('#nrpn-89').removeClass("on").addClass("off").text("Key-sync OFF");
        // $('#nrpn-89').removeClass("off").addClass("on").text("Key-sync ON");

        setupOnOffControl('#nrpn-89');
        setupOnOffControl('#nrpn-93');
        setupOnOffControl('#cc-108');
        setupOnOffControl('#cc-109');
        setupOnOffControl('#nrpn-106');

        // $('#nrpn-89-handle').click(function(){
        //     let v = $('#nrpn-89').val();
        //     $('#nrpn-89').val(v == 0 ? 1 : 0);
        //     updateCustoms();
        // });
        //
        // $('#nrpn-93-handle').click(function(){
        //     let v = $('#nrpn-93').val();
        //     $('#nrpn-93').val(v == 0 ? 1 : 0);
        //     updateCustoms();
        // });

        // $('#nrpn-93').removeClass("on").addClass("off").text("OFF");
        // $('#nrpn-93').removeClass("off").addClass("on").text("Key-sync ON");

        $('#osc1-pw-controls').css('visibility','hidden');
        $('#osc2-pw-controls').css('visibility','hidden');
    }

    function updateOnOffControl(control_id, prefix_text) {
        if ($(control_id).val() == 0) {
            $(control_id + '-handle').removeClass("on").addClass("off").text(prefix_text + " OFF");
        } else {
            $(control_id + '-handle').removeClass("off").addClass("on").text(prefix_text + " ON ");
        }
    }

    function updateCustoms() {

        updateOnOffControl('#nrpn-89', "Key Sync");
        updateOnOffControl('#nrpn-93', "Key Sync");
        updateOnOffControl('#cc-108', "ARP");
        updateOnOffControl('#cc-109', "Latch");
        updateOnOffControl('#nrpn-106', "Retrig");

        // if ($('#nrpn-89').val() == 0) {
        //     $('#nrpn-89-handle').removeClass("on").addClass("off").text("Key Sync OFF");
        // } else {
        //     $('#nrpn-89-handle').removeClass("off").addClass("on").text("Key Sync ON ");
        // }
        //
        // if ($('#nrpn-93').val() == 0) {
        //     $('#nrpn-93-handle').removeClass("on").addClass("off").text("Key Sync OFF");
        // } else {
        //     $('#nrpn-93-handle').removeClass("off").addClass("on").text("Key Sync ON ");
        // }

        //if (BS2.nrpn[BS2.nrpn_id.osc1_waveform].value == "pulse") {
        if ($('#nrpn-72').val() == 'pulse') {
            show('#osc1-pw-controls');
        } else {
            hide('#osc1-pw-controls');
        }
        // if (BS2.nrpn[BS2.nrpn_id.osc2_waveform].value == "pulse") {
        if ($('#nrpn-82').val() == 'pulse') {
            show('#osc2-pw-controls');
        } else {
            hide('#osc2-pw-controls');
        }
    }

    function updateMeta() {
        $('#patch-number').text(BS2.meta.patch_id.value);
    }

    function setupUI() {
        setupDials();
        setupLists();
        setupCustoms();
        setupCommands();
    }

    function updateUI() {
        updateDials();
        updateLists();
        updateCustoms();
        updateMeta();
    }

    $(function () {

        setupUI();
        setStatus("Waiting for MIDI interface...");

        WebMidi.enable(function (err) {

            console.log('webmidi err', err);

            if (err) {
                setStatusError("ERROR: WebMidi could not be enabled.");
                setConnectionStatus(false);
            } else {

                setStatus("WebMidi enabled.");

                //WebMidi.inputs.map(i => log("input:" + i.name));
                //WebMidi.outputs.map(i => log("output:" + i.name));

                var input = WebMidi.getInputByName("Bass Station II");

                if (input) {

                    input.on('controlchange', "all", function(e) {
                        //console.log("CC: ", e);
                        //                    log(midiEventForHuman(e));
                        handleCC(e);
                    });

                    input.on('sysex', "all", function(e) {
                        console.log("SysEx: ", e);
                        if (BS2.setValuesFromSysex(e.data)) {
                            console.log(BS2.control);
                            console.log(BS2.nrpn);
                            updateUI();
                            setStatus("UI updated from SysEx.");
                        } else {
                            setStatusError("Unable to set value from SysEx.")
                        }
                    });

                    setConnectionStatus(true);

                    setStatus("Send a SysDump from your BS2 to initialize the on-screen controls.");

                } else {

                    setStatusError("Bass Station II not found.")
                    setConnectionStatus(false);

                }

                //WebMidi.addListener("connected", e => logWebMidiEvent(e));
                //WebMidi.addListener("disconnected", e => logWebMidiEvent(e));

            }

        }, true);   // pass true to enable sysex support

    });

