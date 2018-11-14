var digest = (() => {

    let strxor = (str, mask) => {

        let strbuf = new Uint8Array(new TextEncoder('utf-8').encode(str));
        let maskbuf = new Uint8Array(new TextEncoder('utf-8').encode(mask));

        for (let i = 0; i < strbuf.length; i++) {

            strbuf[i] = strbuf[i] ^ maskbuf[i % maskbuf.length];

        }

        return new TextDecoder('utf-8').decode(strbuf);
    };


    let sha256 = (msg) => {

        let msgBuffer = new TextEncoder('utf-8').encode(msg);
        return crypto.subtle.digest("SHA-256", msgBuffer).then(function (hash) {
            return hash;
        });

    };

    //This may need optimize ***
    let buf2hex = (buf) => {
        let dataView = new Uint8Array(buf);
        return Array.from(dataView).map(b => ('00' + b.toString(16)).slice(-2)).join('');
    };

    let str2uint = (msg) => {

        return sha256(msg).then(hashBuf => {

            let firArrUint = new Uint32Array(hashBuf);
            return firArrUint[0];

        })

    }

    return {
        sha256: sha256,
        buf2hex: buf2hex,
        str2uint: str2uint,
        strxor: strxor
    }

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = digest;
}
if (typeof define === "function") {
    define([], function () {
        return digest;
    });
}

