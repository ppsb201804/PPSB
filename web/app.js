var createError = require('http-errors');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('config');
var bigInt = require("big-integer");
var compression = require('compression');
var sjcl = require("./libs/sjcl");

var loginRouter = require('./routes/login');
var adminRouter = require('./routes/admin');
var oprfRouter = require('./routes/oprf');
var apiRouter = require('./routes/api');
var installRouter = require('./routes/install');

/**
 * Init config
 */

if (config.server.d) {
    config.server.biD = bigInt(config.server.d);
}

if (config.server.n) {
    config.server.biN = bigInt(config.server.n);
}

if (config.server.sk1) {
    config.server.k1 = sjcl.bn.fromBits(sjcl.codec.base64.toBits(config.server.sk1));
}

if (config.server.sk2) {
    config.server.k2 = sjcl.bn.fromBits(sjcl.codec.base64.toBits(config.server.sk2));
}

var app = express();

var port_ssl = 443;
var port = 80;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);

app.use(express.static(path.join(__dirname, 'public')));
//app.use(logger('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'secret',
    store: new RedisStore()
}));

app.use('/', loginRouter);
app.use('/oprf', oprfRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/install', installRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;
    //res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var server = http.createServer(app);
server.listen(port);
console.log(`HTTP Web Server Start at ${port}`);

//if CA existed
var CA_PATH = "/data/ca";
if (fs.existsSync(`${CA_PATH}/web.key`)) {
    //existed CA file

    let server_ssl = https.createServer({
        key: fs.readFileSync(`${CA_PATH}/web.key`),
        cert: fs.readFileSync(`${CA_PATH}/web.pem`)
    }, app);

    server_ssl.listen(port_ssl);

    console.log(`HTTPS Web Server Start at ${port_ssl}`);

}

