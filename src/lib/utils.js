var Utils = (function () {

/*
    String.prototype.padZero= function(len, c){
        let s = '';
        c = c || '0';
        len = (len || 2) - this.length;
        while (s.length < len) s+= c;
        return s + this;
    };
*/
    let padZero = function(str, len, c) {
        let s = str;
        c = c || '0';
        len = (len || 2) - s.length;
        while (s.length < len) s += c;
        return s;
    };


    var toHexString = function(byteArray, sep) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join(sep || '')
    };

    /**
     *
     * @param string
     * @returns {*}
     */
    var fromHexString = function(string, sep) {
        let s = sep ? string.replace(sep, '') : string;
        if ((s.length % 2) > 0) {
            // TODO: throw an exception
            console.warn(`fromHexString: invalid hex string: ${s}`);
            return null;
        }
        let a = new Uint8Array(s.length / 2);
        for (let i=0; i < (s.length / 2); i++) {
            a[i] = parseInt(s.substr(i * 2, 2), 16);
        }
        return a;
    };

/*
    var hexToBytes = function(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    };
*/

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }


    /**
     * Returns the number of bit 0 before the rightmost bit set to 1.
     * @param {*} v
     */
    getRightShift = function(v) {
        if (!v) return -1;  //means there isn't any 1-bit
        let i = 0;
        while ((v & 1) === 0) {
            i++;
            v = v>>1;
        }
        return i;
    };


    /**
     * getSetBits(0b10000000)
     * 1
     * getSetBits(0b10000001)
     * 2
     * getSetBits(0b11111111)
     * 8
     *
     * return the number of bit set
     */
    getSetBits = function(v) {
        for (var c = 0; v; c++) {
            v &= v - 1; // clear the least significant bit set
        }
        return c;
    };


    /*
     event Object
     target          Input       The Input that triggered the event.
     data            Uint8Array  The raw MIDI message as an array of 8 bit values.
     receivedTime    Number      The time when the event occurred (in milliseconds since start).
     timestamp       Uint        The timestamp when the event occurred (in milliseconds since the Unix Epoch).
     channel         Uint        The channel where the event occurred (between 1 and 16).
     type            String      The type of event that occurred.
     controller      Object
     number      Uint        The number of the controller.
     name        String      The usual name or function of the controller.
     value       Uint        The value received (between 0 and 127).
     */
/*
    midiEventForHuman = function(e) {
        let msg = e.data;   // Uint8Array
        let dec = "";
        let hex = "";
        let bin = "";
        for (let i=0; i < msg.byteLength; i++) {
            dec = dec + msg[i].toString(10).padZero(3) + " ";
            hex = hex + msg[i].toString(16).padZero(2) + " ";
            bin = bin + msg[i].toString(2).padZero(8) + " ";
        }
        return dec.trim() + " - " + hex.trim() + " - " + bin.trim();
    };
*/


    return {
        padZero,
        toHexString,
        fromHexString,
        getParameterByName,
        getRightShift,
        getSetBits //,
        // midiEventForHuman
    };

})();
