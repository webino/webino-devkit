module.exports = function (grunt, config) {
    config.tasks.init = {
        description: 'Initialize Webino module',
        function: function () {
            grunt.log.writeln('Initializing ...');

            // Install module dependencies
            grunt.util.spawn({cmd: 'npm', args: ['install']}, function (error) {
                if (error) {
                    grunt.fail.warn('\n\n' + error + '\n');
                    return;
                }
                grunt.log.ok('Initialized: npm');
            });

            // Update module development environment
            grunt.log.ok('Updating module development environment ...');
            grunt.task.run('update');
            grunt.log.writeln(' ');
        }
    };
};
