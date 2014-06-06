var path = require('path'),
    _ = require('lodash'),
    findit = require('findit'),
    fs = require('fs');

function eachConfigFile(root, callback) {
    var result = {files: [], dirs: []};
    var find = findit(root, {followSymlinks: true});
    find.on('file', function (file, stat) {
        if (file.match(/\.amd\.json$/)) {
            result.files[file] = stat;
        }
    });
    find.on('directory', function (dir, stat, stop) {
        result.dirs[dir] = stat;
    });
    find.on('end', function () {
        callback(null, result);
    });
}

exports.produceConfigObject = function (root, callback) {
    eachConfigFile(root, function (err, filesAndDirs) {
        if (err) {
            callback(err);
            return;
        }

        var dirExists = {};
        var dirs = Object.keys(filesAndDirs.dirs);
        for (var i = 0; i < dirs.length; i++) {
            dirExists[path.basename(dirs[i])] = true;
        }

        var result;
        var files = Object.keys(filesAndDirs.files);
        var firstPass = [], secondPass = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var basename = path.basename(file);
            var specifier = basename.replace(/\.amd\.json$/, "");
            if (specifier == "" || specifier[0] == ".") {
                continue;
            } else if (specifier == "local") {
                firstPass.push(file);
            } else if (dirExists[specifier]) {
                secondPass.push(file);
            } else {
                callback(new Error("No location for " + file));
                return;
            }
        }
        var bothPasses = [].concat(firstPass).concat(secondPass);
        for (var i = 0; i < bothPasses.length; i++) {
            var file = bothPasses[i];
            result = result || {};
            _.merge(result, require(file));
        }
        if (!result) {
            callback(new Error("local.amd.json not found"));
        } else {
            callback(null, result);
        }
    })
};