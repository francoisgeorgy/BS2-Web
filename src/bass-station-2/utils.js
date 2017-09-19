import {getRightShift, getSetBits} from '../lib/bits-utils.js';

/**
 *
 * @param lsb
 * @param mask_lsb
 * @returns {number}
 */
export function v8(lsb, mask_lsb) {
    let r = getRightShift(mask_lsb);
    return (lsb & mask_lsb) >> r;
}

/**
 *
 * @param msb
 * @param lsb
 * @param mask_msb
 * @param mask_lsb
 * @returns {number}
 */
export function v16(msb, lsb, mask_msb, mask_lsb) {
    let r = getRightShift(mask_lsb);
    let s = getSetBits(mask_lsb);
    let a = (msb & mask_msb) << s;
    let b = (lsb & mask_lsb) >> r;
    return a + b;
}

/**
 *
 * @param msb
 * @param lsb
 * @returns {*}
 */
export function doubleByteValue(msb, lsb) {
    let v = msb << 1;
    return lsb > 0 ? (v + 1) : v;
}
