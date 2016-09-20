var path = require("path");
var multer = require("multer");
var upload = multer({dest: path.join(path.dirname(__dirname), "tmp")});
var util_functions = require(path.join(path.dirname(__dirname), "models", "util_functions"));
var async = require("async");
var logger = require(path.join(path.dirname(__dirname), "logger"));


module.exports = function (router) {

    router.get("/", function (req, res) {
        res.render("home.ejs");
    });

    router.post("/upload_image", upload.single("file"), function (req, res) {
        async.series([
            function (callback) {
                return util_functions.validate(req.file, callback);
            },
            function(callback){
                return util_functions.remove_old_uploads(callback)
            },
            function (callback) {
                return util_functions.rename_and_save(req.file, callback);
            },
            function (callback) {
                return util_functions.resize_image_and_save(callback);   
            }],
        function (err) {
            if (err){
                console.log(err)
                logger.log(err, /^/);
                res.render("global.ejs", {msg: "Some error occured"});
            }
            else
                res.render("global.ejs", {msg: "Images Uploaded"});
        });
    });

    router.get("/view_images", function(req, res){
        util_functions.get_images(function(err, data){
            if(err){
                logger.log(err, /^/);
                res.render("global.ejs", {msg: "Some error occured"});
            }
            else
                res.render("view_images.ejs", {path_data: data});
        });
    });
};