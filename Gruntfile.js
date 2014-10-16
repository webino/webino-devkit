module.exports = function(grunt) {
    var working_dir = grunt.option('working-dir');
    var moduleGruntFile = working_dir + '/Gruntfile.js';
    if (grunt.file.exists(moduleGruntFile)) {
        (function () {
            return require(working_dir + '/Gruntfile.js');
        })()(grunt);
        return;
    }


    grunt.config.init((function () {
        return require(__dirname + '/lib/webino-devkit');
    })().config(grunt, ['global']));
};
