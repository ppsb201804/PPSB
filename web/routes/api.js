var express = require('express');
var path = require('path');
var multer = require('multer');
var config = require('config');
var fs = require('fs');
const execSync = require('child_process').execSync;
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
var router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${config.server.basepath}${config.server.datafolder}`);
    },
    filename: function (req, file, cb) {
        //save to version.json
        //console.log("Begin to change" + req.body.version);
        cb(null, `${req.body.version}.json`)
    }
})

var upload = multer({ storage: storage });

function checkCmd(filename, command) {

    let checkcmd = `ps aux|grep -v grep|grep ${command}|grep ${filename} || echo $?`;

    //console.log(checkcmd);

    let checkstate = execSync(checkcmd).toString();

    if (checkstate.length > 5) {
        //tranforming

        return true;

    }

    return false;

}

router.post('/newversion', upload.single('indexdata'), function (req, res, next) {

    if (req.session.user) {

        //console.log("->" + req.body.version);
        //console.log();

        let url = req.body.url;
        let version = req.body.version;
        let sectype = req.body.sectype;
        let source = config.server.source;

        let e = config.server.e;
        let n = config.server.n;

        //check file format
        let path = req.file.path;
        //console.log(path);
        var result = JSON.parse(fs.readFileSync(path));

        let num = result.length;
        let withmeta = result[0]["m"] != undefined;

        //normalize url
        if (url.endsWith("/")) {
            url = url.substr(0, url.length - 1);
        }

        let manifest = {
            source: source,
            version: version,
            url: url,
            sectype: sectype,
            withmeta: withmeta,
            e: e,
            n: n,
            num: num
        };

        fs.writeFileSync(`${config.server.basepath}${config.server.metafolder}${version}.json`, JSON.stringify(manifest));

        res.redirect('/admin');

    } else {
        res.redirect('/');
    }

});

function listfiles(path, filter) {

    let cmd = `ls -l ${path}|grep -E '${filter}'|awk '{print "{\\"filename\\":\\""$9"\\"},"}'`;

    let cmdres = execSync(cmd).toString();
    let strfiles = `[${cmdres}{}]`
    let arrfiles = JSON.parse(strfiles);
    arrfiles.pop();

    return arrfiles;

}

router.get('/listall', function (req, res, next) {

    if (req.session.user) {

        //fetch all list
        let arrfiles = listfiles(`${config.server.basepath}${config.server.metafolder}`, "json");

        //check who is primary
        let arrprimary = listfiles(`${config.server.basepath}${config.server.pubmetafolder}`, "json");

        //check finish encrypted
        let arrencrypted = listfiles(`${config.server.basepath}${config.server.pubdatafolder}`, "json");
        let setenc = new Set();
        arrencrypted.forEach((val, idx, arr) => {
            setenc.add(val.filename);
        });


        //list to json arr
        let arrMeta = [];
        arrfiles.forEach((val, idx, arr) => {

            let filepath = `${config.server.basepath}${config.server.metafolder}${val.filename}`

            var result = JSON.parse(fs.readFileSync(filepath));

            //default state
            result["state"] = "Plaintext";

            //check finish encrypted
            if (setenc.has(val.filename)) {
                result["state"] = "Available";
            }

            //if still running building index
            if (checkCmd(`/${val.filename}`, "buildSecBlackList")) {
                result["state"] = "Building";
            }

            //check if primary
            if (arrprimary.length != 0) {
                if (val.filename == arrprimary[0].filename) {
                    result["state"] = "Primary";
                }
            }

            arrMeta.push(result);

        });

        res.json(arrMeta);

    } else {
        res.json([]);
    }

});

function deletefile(path) {
    execSync(`rm -f ${path}`);
}

function copyfile(src, des) {
    execSync(`cp -f ${src} ${des}`);
}

router.get('/delete', function (req, res, next) {

    if (req.session.user) {

        let version = req.query.version;
        let filename = `${version}.json`;

        deletefile(`${config.server.basepath}${config.server.metafolder}${filename}`);
        deletefile(`${config.server.basepath}${config.server.datafolder}${filename}`);
        deletefile(`${config.server.basepath}${config.server.pubdatafolder}${filename}`);

        res.json({ suc: true });

    } else {
        res.json({ err: true });
    }

});

router.get('/primary', function (req, res, next) {

    if (req.session.user) {

        let version = req.query.version;
        let filename = `${version}.json`;

        //console.log(filename);

        //console.log(`${config.server.basepath}${config.server.pubmetafolder}*`);

        //delete all files in meta
        deletefile(`${config.server.basepath}${config.server.pubmetafolder}*`);

        copyfile(`${config.server.basepath}${config.server.metafolder}${filename}`, `${config.server.basepath}${config.server.pubmetafolder}${filename}`);

        res.json({ suc: true });

    } else {
        res.json({ err: true });
    }

});

router.get('/encrypt', function (req, res, next) {

    if (req.session.user) {

        let version = req.query.version;
        let filename = `${version}.json`;

        var meta = JSON.parse(fs.readFileSync(`${config.server.basepath}${config.server.metafolder}${filename}`));

        //ensure that encrypted file is not existed.
        deletefile(`${config.server.basepath}${config.server.pubdatafolder}${filename}`);

        let params = `${config.server.basepath}/buildSecBlackList.js -p ${config.server.basepath}${config.server.datafolder}${filename} -s ${meta.source} -m -1 -o ${config.server.basepath}${config.server.pubdatafolder}${filename} -f ${meta.sectype}`;

        //independently process with: Detached = true, stdio = ignore, unref called.
        spawn('node', params.split(' '), { detached: true, cwd: config.server.basepath, stdio: 'ignore' }).unref();

        res.json({ suc: true });

    } else {
        res.json({ err: true });
    }

});


router.get('/meta', function (req, res, next) {

    let arrprimary = listfiles(`${config.server.basepath}${config.server.pubmetafolder}`, "json");

    if (arrprimary.length != 0) {

        let filename = arrprimary[0].filename;
        let fullpath = `${config.server.basepath}${config.server.pubmetafolder}${filename}`;
        //console.log(`download file from ${fullpath}`);
        res.download(fullpath);

    }
    else {
        res.json({ err: true });
    }

});

router.get('/data', function (req, res, next) {

    let version = req.query.version;

    let fullpath = `${config.server.basepath}${config.server.pubdatafolder}${version}.json`;
    //console.log(`download file from ${fullpath}`);
    res.download(fullpath);

});


module.exports = router;
