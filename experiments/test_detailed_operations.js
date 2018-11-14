var sjcl = require('./sjcl');

let p256 = sjcl.ecc.curves.c256;

let _scalarMult = (k, P) => {
    const Q = P.mult(k);
    return Q;
}

// input: bits
// output: point
let hashToCurve = (seed) => {

    const h = new sjcl.hash.sha256();

    let i = 0;
    for (i = 0; i < 10; i++) {
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

let compressPoint = (p) => {
    const xBytes = sjcl.codec.bytes.fromBits(p.x.toBits());
    const sign = p.y.limbs[0] & 1 ? 0x03 : 0x02;
    const taggedBytes = [sign].concat(xBytes);
    return sjcl.codec.bytes.toBits(taggedBytes);
}

let decompressPoint = (xbits, tag) => {

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

let blindPoint = (P) => {
    const bF = sjcl.bn.random(p256.r, 10);
    const bP = _scalarMult(bF, P);
    return { point: bP, blind: bF };
}

function signPoint(key, P) {
    return _scalarMult(key, P);
}

let oprfec = (p, k) => {

    let sp = signPoint(k, p);
    return sjcl.codec.base64.fromBits(sp.toBits());

};

let unblindPoint = (b, Q) => {
    const binv = b.inverseMod(p256.r);
    return _scalarMult(binv, Q);
}

// Stage I
console.time("blind");
//map to curve
//let p = hashToCurve("191347BFE55D0CA9A574DB77BC8648275CE258461450E793528E0CC6D2DCF8F5");
//let p = hashToCurve("ECEB28B70500B741F3BAAEA651C6EC8298631AC1B3BF401BCDD1527B4A48AD0C");
//let p = hashToCurve("0714771736A94DA8918177EBD224AE8DF8AAD37EC90C018380E483AD7BACF9E9");
//let p = hashToCurve("6860776E5611F69C611EB6122F3F227E25D01265C0CB2536A4845797476D60A3");
let p = hashToCurve("061BDBF8744EBFCDAFF616CD98807BB078138168B541C7A11F0ED41DC9D3960F");

//blind
let bp = blindPoint(p);
//random r
let r = bp.blind;
//point
let b = bp.point.toBits();
let base64 = sjcl.codec.base64.fromBits(b);
console.timeEnd("blind");

// Stage II
console.time("signwithmeta");
let p2 = p256.fromBits(sjcl.codec.base64.toBits(base64));

let result = {
    y1: oprfec(p2, "7ykQgVVPJtrhprXwLq74dhoUgDibjYhUy2mZyWqs2IM=") //k1
};

//if withmeta
if (1) {
    result.y2 = oprfec(p2, "ov0FE3wMkmH29mfvkLaUMOcsCZGwA6zkcO20rkGrw18=") //k2
}
console.timeEnd("signwithmeta");

// Stage III
console.time("signwithoutmeta");
let p3 = p256.fromBits(sjcl.codec.base64.toBits(base64));

let result2 = {
    y1: oprfec(p3, "7ykQgVVPJtrhprXwLq74dhoUgDibjYhUy2mZyWqs2IM=") //k1
};

//if withoutmeta
if (0) {
    result2.y2 = oprfec(p3, "ov0FE3wMkmH29mfvkLaUMOcsCZGwA6zkcO20rkGrw18=") //k2
}
console.timeEnd("signwithoutmeta");

// Stage IV
console.time("unblind");
let sp1 = p256.fromBits(sjcl.codec.base64.toBits(result.y1));
//unblind
let s1 = unblindPoint(r, sp1);
//convert point to hex token
let retToken = {
    t1: sjcl.codec.hex.fromBits(compressPoint(s1))
}
console.timeEnd("unblind");
