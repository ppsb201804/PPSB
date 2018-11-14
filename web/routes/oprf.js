var express = require('express');
const config = require('config');
const bigInt = require("big-integer");

const sjcl = require("../libs/sjcl.js");
const ecoprf = require("../libs/ecoprf.js");

var p256 = sjcl.ecc.curves.c256;

var router = express.Router();


let oprfrsa = (x) => {
    if (x) {
        let biX = bigInt(x);
        let biY = biX.modPow(config.server.biD, config.server.biN);
        return biY.toString(16);
    }
    else {
        return null;
    }
}

router.post('/rsa', function (req, res, next) {

    /*
    {
        x1 = '1',
        x2 = '2'
    }
    */

    //console.log("rsa");

    res.json({
        y1: oprfrsa(req.body.x1),
        y2: oprfrsa(req.body.x2)
    });

});

let oprfec = (p, k) => {

    let sp = ecoprf.signPoint(k, p);
    return sjcl.codec.base64.fromBits(sp.toBits());

};

router.post('/ec', function (req, res, next) {

    //console.log(`ec with ${JSON.stringify(req.body)}`);

    let p = p256.fromBits(sjcl.codec.base64.toBits(req.body.x));

    let result = {
        y1: oprfec(p, config.server.k1)
    };

    //if withmeta
    if (req.body.withmeta) {
        result.y2 = oprfec(p, config.server.k2)
    }

    res.json(result);

});

module.exports = router;
