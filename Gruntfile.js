module.exports = function(grunt) {
    var workingDir = grunt.option('working-dir');
    var moduleGruntFile = workingDir + '/Gruntfile.js';
    if (grunt.file.exists(moduleGruntFile)) {
        (function () {
            return require(workingDir + '/Gruntfile.js');
        })()(grunt);
        return;
    }

    grunt.config.init((function () {
        return require('webino-devkit');
    })().config(grunt, ['global']));
};
