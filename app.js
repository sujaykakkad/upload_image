var express = require('express'),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    fs = require("fs"),
    path = require("path");

var logger = require(path.join(__dirname, "logger"));
var app = express();
var upload_path = path.join(__dirname, "public", "uploads");

// Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
    logger.log((req["method"] + " " + req.url), /^/);
    logger.debug((req["method"] + " " + req.url), /^/);
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});
app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({
    secret: "+*/uploadimage?&",
    resave: false,
    saveUninitialized: false,
    maxAge: Date.now() + (30 * 86400 * 1000),
    name: "img_ssid"
}));
app.use(express.static(path.join(__dirname, 'public')));

// dynamically include routes (Controller)
var controller_path = path.join(__dirname, "controllers");
fs.readdirSync(controller_path).forEach(function (file) {
    if (file.substr(-3) == '.js') {
        require(path.join(controller_path, file))(app);
    }
})

// add some extra folders
if (!fs.existsSync(upload_path))
  fs.mkdirSync(upload_path);

app.listen(3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
