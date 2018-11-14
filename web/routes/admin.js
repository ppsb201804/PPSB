var express = require('express');
var router = express.Router();

/* GET admin page. */
router.get('/', function (req, res, next) {

    if (req.session.user) {
        res.render('admin');
    } else {
        res.redirect('/');
    }

});

module.exports = router;
