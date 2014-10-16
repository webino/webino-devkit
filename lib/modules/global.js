(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            /**
             * Setup grunt config for global tool
             */

            config.tasks.default = {
                isSystem: true,
                description: 'Webino Development Kit help',
                function: function () {
                    config.showTasksHelp();
                }
            };

            config.tasks.mod = {
                description: 'Develop existing Webino module',
                examples: ['webino mod -name WebinoExample'],
                function: function () {

                    // Resolve module by name
                    var name = grunt.option('name');
                    if (name) {
                        grunt.log.writeln('Preparing module \'' + name + '\' for development ...');

                        var done = this.async();
                        grunt.util.spawn({
                            cmd: 'git', args: ['clone', config.github.webino.ssh + name]
                        }, function (error, result, code) {
                                if (error) {
                                    grunt.fail.warn('\n\n' + error + '\n\n');
                                }

                                // initialize module development environment
                                process.chdir(config.workspace.modules + '/' + name);
                                grunt.util.spawn({
                                    cmd: 'webino', args: ['init']
                                }, function (error, result, code) {
                                    if (error) {
                                        grunt.fail.warn('\n\n' + error + '\n\n');
                                    }
                                    grunt.log.info(result.stdout);
                                    done();
                                });
                            });
                    }

                    grunt.fail.warn('\n\nExpected module option, e.g.: \n\ -name WebinoExample \n\n');
                }
            };

            config.tasks.self_setup = {
                isSystem: true,
                description: 'Initializes Webino Development Kit',
                /**
                 * Required to run as root
                 */
                function: function () {
                    var root = __dirname + '/../../resources/php/';
                    process.chdir(root);

                    if (grunt.file.isFile(root + 'composer.phar')) {
                        grunt.log.ok('Updating ...');
                        grunt.task.run('exec:composer_self_update');
                        grunt.task.run('exec:composer_update');
                        return;
                    }

                    grunt.log.ok('Initializing ...');
                    grunt.task.run('exec:get_composer');
                    grunt.task.run('exec:composer_update');

                    grunt.log.ok('Creating workspace ...');
                    grunt.task.run('mkdir:workspace');
                }
            };
        };
        return config;
    })();
}).call(this);
