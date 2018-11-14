var oprf = (() => {

    function postData(url, data) {

        return fetch(url, {
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        }).then(response => response.json())
    }

    //get a random prime between min and max
    //unefficient
    let getPrimeRandom = (min, max) => {

        let r = bigInt.randBetween(min, max);
        while (true) {

            r = r.next();
            if (r.isProbablePrime()) {
                if (r.isPrime()) {
                    return r;
                }
            }

            if (r.eq(max)) {
                r = min;
            }

        }

    };

    let p256 = sjcl.ecc.curves.c256;

    // Performs the scalar multiplication k*P
    //
    // Inputs:
    //  k: bigInt scalar (not field element or bits!)
    //  P: sjcl Point
    // Returns:
    //  sjcl Point
    let _scalarMult = (k, P) => {
        const Q = P.mult(k);
        return Q;
    }

    // Attempts to decompress the bytes into a curve point following SEC1 and
    // assuming it's a Weierstrass curve with a = -3 and p = 3 mod 4 (true for the
    // main three NIST curves).
    // input: bits of an x coordinate, the even/odd tag
    // output: point
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

    // blindPoint generates a random scalar blinding factor, multiplies the
    // supplied point by it, and returns both values.
    let blindPoint = (P) => {
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
    let unblindPoint = (b, Q) => {
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
    let signPoint = (key, P) => {
        return _scalarMult(key, P);
    }

    // Compresses a point according to SEC1.
    // input: point
    // output: bitsArray
    let compressPoint = (p) => {
        const xBytes = sjcl.codec.bytes.fromBits(p.x.toBits());
        const sign = p.y.limbs[0] & 1 ? 0x03 : 0x02;
        const taggedBytes = [sign].concat(xBytes);
        return sjcl.codec.bytes.toBits(taggedBytes);
    }

    let rsa = async (url, meta) => {

        //For r1

        //use getPrimeRandom if strongly force to use prime
        let r1 = bigInt.randBetween(0, meta.biN);

        //generate two hash
        let h1str = digest.buf2hex(await digest.sha256(url + "*1"));

        //get bigInteger of hash
        let h1 = new bigInt(h1str, 16);

        //add r
        let reqData = {
            x1: h1.multiply(r1.modPow(meta.biE, meta.biN)).mod(meta.biN)
        };

        let r2;
        //check withmeta to decide if r2
        if (meta.withmeta) {
            r2 = bigInt.randBetween(0, meta.biN);
            let h2str = digest.buf2hex(await digest.sha256(url + "*2"));
            let h2 = new bigInt(h2str, 16);
            reqData.x2 = h2.multiply(r2.modPow(meta.biE, meta.biN)).mod(meta.biN);
        }

        //send x1, x2
        let objRet = await postData(`${meta.url}${config.client.PATH_API_RSAOPRF}`, reqData);

        //recover signatures
        let s1 = new bigInt(objRet.y1, 16).multiply(r1.modInv(meta.biN)).mod(meta.biN);
        let retToken = {
            t1: digest.buf2hex(await digest.sha256(s1.toString()))
        }

        //check if need for r2
        if (meta.withmeta) {
            let s2 = new bigInt(objRet.y2, 16).multiply(r2.modInv(meta.biN)).mod(meta.biN);
            retToken.t2 = digest.buf2hex(await digest.sha256(s2.toString()));
        }

        return retToken;

    }

    let ec = async (url, meta) => {

        //map to curve
        let p = hashToCurve(url);
        //blind
        let bp = blindPoint(p);
        //random r
        let r = bp.blind;
        //point
        let b = bp.point;
        let reqData = {
            x: sjcl.codec.base64.fromBits(b.toBits()),
            withmeta: meta.withmeta
        };

        //send x
        let objRet = await postData(`${meta.url}${config.client.PATH_API_ECOPRF}`, reqData);

        //get sp
        let sp1 = p256.fromBits(sjcl.codec.base64.toBits(objRet.y1));
        //unblind
        let s1 = unblindPoint(r, sp1);
        //convert point to hex token
        let retToken = {
            t1: sjcl.codec.hex.fromBits(compressPoint(s1))
        }

        //check if need for r2
        if (meta.withmeta) {

            let sp2 = p256.fromBits(sjcl.codec.base64.toBits(objRet.y2));
            let s2 = unblindPoint(r, sp2);
            retToken.t2 = sjcl.codec.hex.fromBits(compressPoint(s2));

        }

        return retToken;

    }

    return {
        rsa: rsa,
        ec: ec
    };

})();


if (typeof module !== 'undefined' && module.exports) {
    module.exports = oprf;
}
if (typeof define === "function") {
    define([], function () {
        return oprf;
    });
}

