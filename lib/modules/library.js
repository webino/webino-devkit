module.exports = function config(grunt, config) {
    grunt.log.writeln('\n\You are developing a package: ' + config.pkg.camelCase);


    config.tasks.update = {
        description: 'Update development environment',
        function: [
            'mkdir:test',
            'init-pre-commit',
            'exec:composer_update_dev'
        ]
    };
};
