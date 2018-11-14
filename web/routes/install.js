var express = require('express');
var router = express.Router();
var config = require('config');
var bigInt = require("big-integer");
var sjcl = require("../libs/sjcl");
var NodeRSA = require('node-rsa');
var fs = require('fs');
var execSync = require('child_process').execSync;

/* GET home page. */
router.get('/', function (req, res, next) {

    if (config.server.installed == true) {
        res.redirect('/');
    }
    else {
        res.render('install');
    }
});

router.post('/', function (req, res, next) {

    if (config.server.installed == true) {
        res.redirect('/');
    }
    else {

        let user = req.body.user;
        let pwd = req.body.pwd;
        let key = req.body.key;
        let source = req.body.source;

        let sk1 = sjcl.hash.sha256.hash(key + "1");
        let sk2 = sjcl.hash.sha256.hash(key + "2");

        //randomly generate
        var rsakey = new NodeRSA({ b: config.server.rsabit });

        let n = rsakey.keyPair.n.toString();
        let e = rsakey.keyPair.e.toString();
        let d = rsakey.keyPair.d.toString();


        let jsonCfg = {
            server: {
                installed: true,
                source: source,
                basepath: config.server.basepath,
                metafolder: config.server.metafolder,
                pubmetafolder: config.server.pubmetafolder,
                datafolder: config.server.datafolder,
                pubdatafolder: config.server.pubdatafolder,
                configpath: config.server.configpath,
                psw: pwd,
                user: user,
                n: n,
                e: e,
                d: d,
                sk1: sjcl.codec.base64.fromBits(sk1),
                sk2: sjcl.codec.base64.fromBits(sk2)
            }
        }

        fs.writeFileSync(`${config.server.basepath}${config.server.configpath}`, JSON.stringify(jsonCfg));

        //console.log(jsonCfg);

        config.server = jsonCfg.server;

        execSync(`cd ${config.server.basepath} && npm stop && npm start`);
        process.exit(0);

        //run forever
        //execSync(`cd ${config.server.basepath} && npm start`);
        //process.exit(0);

    }

});

module.exports = router;
