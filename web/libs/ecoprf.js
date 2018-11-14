var sjcl = require("./sjcl.js");
var p256 = sjcl.ecc.curves.c256;

// Performs the scalar multiplication k*P
//
// Inputs:
//  k: bigInt scalar (not field element or bits!)
//  P: sjcl Point
// Returns:
//  sjcl Point
function _scalarMult(k, P) {
    const Q = P.mult(k);
    return Q;
}

// Attempts to decompress the bytes into a curve point following SEC1 and
// assuming it's a Weierstrass curve with a = -3 and p = 3 mod 4 (true for the
// main three NIST curves).
// input: bits of an x coordinate, the even/odd tag
// output: point
function decompressPoint(xbits, tag) {

    const x = p256.field.fromBits(xbits).normalize();
    const sign = tag & 1;

    // y^2 = x^3 - 3x + b (mod p)
    let rh = x.power(3);
    let threeTimesX = x.mul(3);
    rh = rh.sub(threeTimesX).add(p256.b).mod(p256.field.modulus); // mod() normalizes

    // modsqrt(z) for p = 3 mod 4 is z^(p+1/4)
    const sqrt = p256.field.modulus.add(1).normalize().halveM().halveM();
    let y = rh.powermod(sqrt, p256.field.modulus);

    let parity = y.limbs[0] & 1;

    if (parity != sign) {
        y = p256.field.modulus.sub(y).normalize();
    }

    let point = new sjcl.ecc.point(p256, x, y);
    if (!point.isValid()) {
        return null;
    }
    return point;
}

// input: bits
// output: point
function hashToCurve(seed) {

    const h = new sjcl.hash.sha256();

    let i = 0;
    for (i = 0; i < 200; i++) {
        // little endian uint32
        let ctr = new Uint8Array(4);
        // typecast hack: number -> Uint32, bitwise Uint8
        ctr[0] = (i >>> 0) & 0xFF;
        let ctrBits = sjcl.codec.bytes.toBits(ctr);

        // H(s||ctr)
        h.update(seed);
        h.update(ctrBits);

        const digestBits = h.finalize();

        let point = decompressPoint(digestBits, 0x02);
        if (point !== null) {
            return point;
        }

        point = decompressPoint(digestBits, 0x03);
        if (point !== null) {
            return point;
        }

        seed = digestBits;
        h.reset();
    }

    return null;

}


// blindPoint generates a random scalar blinding factor, multiplies the
// supplied point by it, and returns both values.
function blindPoint(P) {
    const bF = sjcl.bn.random(p256.r, 10);
    const bP = _scalarMult(bF, P);
    return { point: bP, blind: bF };
}


// unblindPoint takes an assumed-to-be blinded point Q and an accompanying
// blinding scalar b, then returns the point (1/b)*Q.
//
// inputs:
//  b: bigint scalar (not field element or bits!)
//  q: sjcl point
// returns:
//  sjcl point
function unblindPoint(b, Q) {
    const binv = b.inverseMod(p256.r);
    return _scalarMult(binv, Q);
}


// multiplies the point by the secret scalar "key"
//
// inputs:
//  key: bigint scalar (not field element or bits!)
//  P: sjcl point
// returns:
//  sjcl point
function signPoint(key, P) {
    return _scalarMult(key, P);
}


// Compresses a point according to SEC1.
// input: point
// output: bitsArray
function compressPoint(p) {
    const xBytes = sjcl.codec.bytes.fromBits(p.x.toBits());
    const sign = p.y.limbs[0] & 1 ? 0x03 : 0x02;
    const taggedBytes = [sign].concat(xBytes);
    return sjcl.codec.bytes.toBits(taggedBytes);
}

module.exports = {

    hashToCurve: hashToCurve,

    blindPoint: blindPoint,

    unblindPoint: unblindPoint,

    signPoint: signPoint,

    compressPoint: compressPoint

};