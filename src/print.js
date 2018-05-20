
import DEVICE from "./bass-station-2/bass-station-2.js";
import * as Utils from "./lib/utils.js";
import * as Mustache from "mustache";

import "./css/patch.css";

const VERSION = "1.0.0";
console.log(`Bass Station 2 Patch Sheet ${VERSION}`);

const URL_PARAM_SYSEX = "sysex";    // name of sysex parameter in the query-string

function renderGroup(group, changed_only) {
    let o = "";
    if (DEVICE.control_groups.hasOwnProperty(group)) {

        console.groupCollapsed("group", group, DEVICE.control_groups[group]);

        o = `<table id="${group}" class="values">\n`;

        let g = DEVICE.control_groups[group];
        for (let i=0; i < g.controls.length; i++) {

            let c;
            let t = g.controls[i].type;
            let n = g.controls[i].number;
            if (t === "cc") {
                c = DEVICE.control[n];
            } else if (t === "nrpn") {
                c = DEVICE.nrpn[n];
            } else {
                console.error(`invalid control type: ${g.controls[i].type}`)
            }

            // if (typeof c === "undefined") continue;
            // console.log(i, c);

            let v;  // = c.value;
            if (c.on_off) {
                v = c.value == 0 ? "off" : "on";
            } else {

                v = c.human(c.raw_value);
                console.log(`${t} ${n} raw=${c.raw_value} h=${v}`);
            }

            if (changed_only && !c.changed()) continue;

            let bold = !changed_only && c.changed() ? "style=\"font-weight:bold\"" : "";

            o += `<tr id="${t}-${n}" title="${c.name}"><td ${bold}>${c.name}</td><td ${bold}>${v}</td></tr>\n`;

        }

        o += `</table>\n`;

        console.groupEnd();
    }
    return o;
}

function renderPatch(template, changed_only) {

    console.log("renderPatch");

    let change_link = $("#only-changed");
    if (changed_only) {
        change_link.text("Show all values").click(function(){
            window.location = window.location.href.replace(/&changedonly[^&]*/g, "") + "&changedonly=0";
        });
    } else {
        change_link.text("Show only the changed values from an init patch").click(function(){
            window.location = window.location.href.replace(/&changedonly[^&]*/g, "") + "&changedonly=1";
        });
    }

    $("#patch-number").text(DEVICE.meta.getStringValue(DEVICE.meta.patch_id.value));
    $("#patch-name").text(DEVICE.meta.getStringValue(DEVICE.meta.patch_name.value));

    let t = $(template).filter("#template-main").html();
    let p = {
        "name": "Tater",
        "v": function () {
            return function (text, render) {
                return renderGroup(text.trim().toLowerCase(), changed_only);
            }
        }
    };

    let o = Mustache.render(t, p);
    $("body").append(o);

    $("body").append(Mustache.render($(template).filter("#template-instructions").html()));

    $("#print").click(function(){
        window.print();
        return false;
    });
}

function loadTemplate(data, changedonly) {

    console.log("loadTemplate", data);

    $.get("templates/patch-sheet-template.html", function(template) {
        console.log("patch-sheet-template.html loaded");
        let d = null;
        if (data) {

            console.log("loadTemplate: read sysex data");

            for (let i=0; i<data.length; i++) {
                if (data[i] === 240) {
                    console.log("start sysex");
                    if (d) {
                        if (DEVICE.setValuesFromSysEx(d)) {
                            console.log("device updated from sysex");
                            renderPatch(template, changedonly);
                        } else {
                            console.log("unable to update device from sysex");
                        }
                    }
                    console.log("clear d", data[i]);
                    d = [];
                }
                // console.log("push ", data[i]);
                d.push(data[i]);
            }
        }
        if (d) {

            console.log("loadTemplate: set values from sysex data");

            if (DEVICE.setValuesFromSysEx(d)) {
                console.log("device updated from sysex");
                renderPatch(template, changedonly);
            } else {
                console.log("unable to update device from sysex");
            }
        }
        renderPatch(template, changedonly);
    });
}


$(function () {

    DEVICE.init();

    let data = null;

    let s = Utils.getParameterByName(URL_PARAM_SYSEX);
    if (s) {
        data = Utils.fromHexString(s);
        DEVICE.setValuesFromSysEx(data);
/*
    } else {
        s = Utils.getParameterByName("pack");
        if (s) {
            data = msgpack.decode(base64js.toByteArray(s));
            if (data) {
                DEVICE.setAllValues(data);
            }
        }
*/
    }

    loadTemplate(null, Utils.getParameterByName("changedonly") === "1");

});
