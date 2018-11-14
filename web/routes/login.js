var express = require('express');
var router = express.Router();
var config = require('config');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (config.server.installed) {
        res.render('login');
    }
    else {
        res.redirect('/install');
    }
});

router.get('/login', function (req, res, next) {
    res.render('login');
});

router.post('/login', function (req, res, next) {

    if (req.body.user == config.server.user && req.body.psw == config.server.psw) {
        req.session.user = req.body.user;
        res.redirect('/admin');
    }
    else {
        res.redirect('/#faillogin');
    }

});

module.exports = router;
