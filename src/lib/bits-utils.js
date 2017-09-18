
/**
 * Returns the number of bit 0 before the rightmost bit set to 1.
 * @param {*} v
 */
export function getRightShift(v) {
    if (!v) return -1;  //means there isn't any 1-bit
    let i = 0;
    while ((v & 1) === 0) {
        i++;
        v = v>>1;
    }
    return i;
}


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
export function getSetBits(v) {
    let c;
    for (c = 0; v; c++) {
        v &= v - 1; // clear the least significant bit set
    }
    return c;
}
