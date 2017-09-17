
/**
 * 0..127 to -63..63
 */
var _63 = function (v) {
    return v < 64 ? (v - 63) : (v - 64);
};

/**
 * 0..127 to -64..63
 */
var _64 = function (v) {
    return v - 64;
};

/**
 * 0..255 to -127..127
 */
var _127 = function (v) {
    return v < 128 ? (v - 127) : (v - 128);
};

/**
 * 0..127 to -100..100
 */
var _100 = function (v) {
    let x = v < 128 ? (v - 127) : (v - 128);
    if (x < -100) {
        x = -100;
    } else if (x > 100) {
        x = 100;
    }
    return x;
};

/**
 * 0..255 to -12.0..12.0 with a lookup table
 */
var _12 = function (v) {
    return COARSE_VALUES[v] / 10;
};

// var _12_reverse = function(v) {
//     return COARSE_VALUES.indexOf(Math.round(v * 10));
// };

/**
 * 0..127 to 5..95
 */
var _5_95 = function (v) {
    //console.log(v * 2 * 91.0 / 256 + 5 -0.4);
    // return Math.round(v * 2 * 91.0 / 256 + 5 -0.4);
    let out_max = 95;
    let out_min = 5;
    let in_max = 127;
    let in_min = 0;
    return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
};

/**
 * 0..127 to -90..90
 */
var _90_90 = function (v) {
    //FIXME: value 63 must gives 0
    let out_max = 90;
    let out_min = -90;
    let in_max = 127;
    let in_min = 0;
    return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
};

/**
 * 0..127 to -24..24
 */
var _24_24 = function (v) {
    //FIXME
    let out_max = 24;
    let out_min = -24;
    let in_max = 127;
    let in_min = 0;
    return Math.round(((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min - 0.4);
};

export default {
    _5_95,
    _12,
    _24_24,
    _63,
    _64,
    _90_90,
    _100,
    _127
}