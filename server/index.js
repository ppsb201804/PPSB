const config = require('config');
const argv = require('yargs').argv;
const WebSocket = require('ws');
const bigInt = require("big-integer");
const log = (msg) => { console.log(msg ? msg : ""); };

const sjcl = require("./sjcl.js");
const ecoprf = require("./ecoprf.js");
var p256 = sjcl.ecc.curves.c256;

var oprf = "rsa";
if (argv.f) {
    oprf = argv.f;
}

const wss = new WebSocket.Server({ port: config.server.port });

config.server.biD = bigInt(config.server.d);
config.server.biN = bigInt(config.server.n);
config.server.k1 = sjcl.bn.fromBits(sjcl.hash.sha256.hash(config.server.eckey + "1"));
config.server.k2 = sjcl.bn.fromBits(sjcl.hash.sha256.hash(config.server.eckey + "2"));

wss.on('connection', function connection(ws, req) {

    log('client join...');

    ws.on('message', (message) => {

        /*
        message = {
            x1 = '1',
            x2 = '2'
        }
        */

        let jMsg = JSON.parse(message);
        //send data
        let res = {};

        if (oprf == "rsa") {

            let biX1 = bigInt(jMsg.x1);
            let biX2 = bigInt(jMsg.x2);

            let biY1 = biX1.modPow(config.server.biD, config.server.biN);
            let biY2 = biX2.modPow(config.server.biD, config.server.biN);

            res = {
                y1: biY1.toString(16),
                y2: biY2.toString(16)
            };

        } else if (oprf == "ec") {

            let p1 = p256.fromBits(sjcl.codec.base64.toBits(jMsg.x1));
            let p2 = p256.fromBits(sjcl.codec.base64.toBits(jMsg.x2));

            let sp1 = ecoprf.signPoint(config.server.k1, p1);
            let sp2 = ecoprf.signPoint(config.server.k2, p2);

            //compute sign
            res = {
                y1: sjcl.codec.base64.fromBits(sp1.toBits()),
                y2: sjcl.codec.base64.fromBits(sp2.toBits()),
            }

        }

        ws.send(JSON.stringify(res));

        log(JSON.stringify(res), null, 4);

    });

});

log('Config list as follows:');
log('----------------------------------------------------------');
log(JSON.stringify(config.server, null, 4));
log('----------------------------------------------------------');
log(`Server is listening on ${config.server.port}...`);