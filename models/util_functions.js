var path = require("path");
var fs = require("fs");
var upload_path = path.join(path.dirname(__dirname), "public", "uploads");
var mkdirp = require("mkdirp");
var Jimp = require('jimp');

var valid_file_types = ["image/jpeg", "image/png"];
var original_file_path = null;
var original_file_extension = null;
var async = require("async");
var image_sizes = {
    horizontal: {width: 750, height: 450},
    vertical: {width: 365, height: 450},
    horizontal_small: {width: 365, height: 212},
    gallery: {width: 380, height: 380}
};

var resize_and_crop = function(image, width, height){
    if(width == height)
        return image.resize(width, height);

    var max_dimension = Math.max(width, height)
    return image.resize(max_dimension, max_dimension).clone().crop(0, 0, width, height);
}

var save_image = function(image, name){
    return image.write(path.join(upload_path, name + "." + original_file_extension));
}

module.exports = {

   validate: function(file, _cb){
        if (!file)
            return _cb("No File Chosen");

        else if (valid_file_types.indexOf(file.mimetype) == -1) {
            fs.exists(file.path, function (exists) {
                if (exists)
                    fs.unlink(file.path);  
            });
            return _cb("File not an image or not supported");
        }
        else 
            Jimp.read(file.path, function (err, image) {
                if (err)
                    return _cb(err);
                if(image.bitmap.width != 1024 && image.bitmap.height != 1024)
                    return _cb("Image not in Required Resolution");
                return _cb(null); 
            });
    },

    remove_old_uploads: function(_cb){
        fs.readdir(upload_path, function(err, list){
            if(list)
                for(index = 0 ; index<list.length; index++){
                    fs.unlink(path.join(upload_path, list[index]))
                }
            return _cb(null)
        })
    },

    rename_and_save: function(file, _cb){
        original_file_extension = file.originalname.split(".").pop();
        original_file_path = path.join(upload_path, "original_file." + original_file_extension);
        fs.rename(file.path, original_file_path, function (err) {
            if (err)        
                return _cb(err);
            return _cb(null);
        });
    },

    resize_image_and_save: function(_cb){
        Jimp.read(original_file_path, function (err, image) {
            if (err) 
                return _cb(err);
            async.forEachOf(image_sizes,

                function (value, key, callback) {           
                    save_image(resize_and_crop(image, value.width, value.height), key); 
                    return callback(null)
                }, 

                function(err){
                    if (err)
                        return _cb(err)
                    return _cb(null)
            });
        });
    },
    
    get_images: function(_cb){
        fs.readdir(upload_path, function(err, list){
            if(list != 0){
                var image_data = {}
                for(index = 0 ; index<list.length; index++){
                    image_data[list[index].split(".")[0]] = list[index]
                }
                return _cb(null, image_data);
            }
            return _cb("No files to show");
        });
    }
};