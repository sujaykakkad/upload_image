var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");
var today = new Date();
var log_file_name = "upload_image_logs";

module.exports = {
    log: function (val, filter) {
        if (val.toString().match(filter)) {
            var log_file_path = path.join(__dirname, log_file_name, today.getFullYear().toString(), (today.getMonth() + 1).toString(), today.getDate().toString());
            var log_file = null;
            fs.exists(log_file_path, function (exists) {
                if (exists) {
                    log_file = fs.createWriteStream(path.join(log_file_path, "upload_image.log"), {flags: "a"});
                    log_file.write(today.toString() + " " + val + "\n");
                    log_file.end();
                }
                else {
                    mkdirp(log_file_path, function (err) {
                        if (err)
                            console.log("ERROR", err);
                        else {
                            log_file = fs.createWriteStream(path.join(log_file_path, "upload_image.log"), {flags: "a"});
                            log_file.write(today.toString() + " " + val + "\n");
                            log_file.end();
                        }
                    });
                }
            });
        }
    },
    debug: function (val, filter) {
        if (!filter)
            console.log(today.toString(), val);
        else if (val.toString().match(filter))
            console.log(today.toString(), val);
    }
};