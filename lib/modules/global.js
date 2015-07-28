/** Config for global tool */
exports.config = (function () {
    function config(grunt, config) {
        /**
         * @param name string Module name
         */
        config.initModule = function (name, done) {
            // initialize module development environment
            process.chdir(config.workspace.modules + '/' + name);
            var initProcess = require('child_process').exec('webino init', function () {
                done && done();
            });
            grunt.log.writeln();
            initProcess.stdout.pipe(process.stdout);
            initProcess.stderr.pipe(process.stderr);
        };

        config.mkdir.workspace = {
            options: {create: ['<%= workspace.root %>', '<%= workspace.modules %>', '<%= workspace.sites %>']}
        };

        config.mkdir.utils = {
            options: {create: ['<%= utils.root %>']}
        };

        /**
         * Waiting for utils initialization
         */
        config.wait_async.utils = {
            options: {
                wait: function (done) {
                    var func = function () {
                        if (grunt.file.isDir(config.utils.root)) {
                            grunt.task.run(['copy:utils']);
                            done();
                        } else {
                            setTimeout(func, 250);
                        }
                    };
                    func();
                }
            }
        };

        /**
         * Waiting for utils copying
         */
        config.wait_async.setup = {
            options: {
                wait: function (done) {
                    var func = function () {
                        if (grunt.file.isDir(config.utils.php)) {
                            var root = config.utils.php;
                            process.chdir(root);

                            if (config.utils.isInit()) {
                                grunt.task.run('exec:get_composer');
                            } else {
                                grunt.log.ok('Updating ...');
                                grunt.task.run(['copy:utils_composer', 'exec:composer_self_update']);
                            }

                            grunt.task.run(['exec:composer_update', 'exec:get_selenium']);
                            done();
                        } else {
                            func();
                        }
                    };
                    func();
                }
            }
        };

        /**
         * Searching module repository
         */
        config.wait_async.mod = {
            options: {
                timeout: 240 * 10000,
                wait: function (done) {
                    if (!config.repositories.size()) {
                        grunt.fail.warn('\n\nExpected any repository \n\n');
                    }
                    var func = function (error) {
                        if (!config.repositories.size()) {
                            if (error) {
                                grunt.log.debug(error);
                                grunt.fail.warn('\n\nCan\'t clone repository \n\n');
                            }
                            done();
                        }

                        var repo = config.repositories.deq();
                        var name = grunt.task.current.args[0];

                        repo.ssh || grunt.fail.warn('\n\nExpected repository ssh option');
                        name || grunt.fail.warn('\n\nExpected module option, e.g.: \n\ -name WebinoExample \n\n');

                        var uri = repo.ssh + '/' + name;
                        var target = config.workspace.modules + '/' + name;

                        grunt.log.debug(target);
                        if (grunt.file.exists(target + '/.git')) {
                            grunt.log.write('\nTarget already exists, initializing ...');
                            config.initModule(name, done);
                            return;
                        }

                        grunt.log.write('Cloning ' + repo.name + ':' + repo.vendor + '/' + name + ' ...');
                        config.loading();

                        grunt.log.debug(uri);
                        grunt.log.debug(repo);

                        var cp = require('child_process');
                        var cloneProcess = cp.exec('git clone ' + uri + ' ' + target, function (error) {
                            clearTimeout(config.loading.timeout);
                            if (error) {
                                func(error);
                                return;
                            }

                            grunt.log.writeln('OK');
                            grunt.log.ok('\nInitializing ' + target + ' ...');
                            config.initModule(name, done);
                        });

                        cloneProcess.stderr.on('data', function (data) {
                            grunt.log.debug(data);
                            if (-1 !== data.indexOf('not exist')
                                || -1 !== data.indexOf('not found')
                            ) {
                                grunt.log.writeln('nope');
                            }
                        });

                        cloneProcess.stdout.on('data', function (data) {
                            grunt.log.debug(data);
                        });

                        if (config.verbose) {
                            cloneProcess.stdout.pipe(process.stdout);
                            cloneProcess.stderr.pipe(process.stderr);
                        }
                    };
                    func();
                }
            }
        };

        config.copy.utils = {
            files: [{
                expand: true,
                cwd: '<%= data.utils %>',
                src: ['**'],
                dest: '<%= utils.root %>',
                mode: 644
            }]
        };

        config.copy.utils_composer = {
            files: [{
                expand: true,
                cwd: '<%= data.utils %>/php',
                src: ['composer.json'],
                dest: '<%= utils.root %>/php',
                mode: 644
            }]
        };

        config.tasks.default = {
            isSystem: true,
            description: 'Webino Development Kit help',
            function: function () {
                config.showTasksHelp();
            }
        };

        /**
         * Required to run as user
         */
        config.tasks.workspace = {
            description: 'Initialize your Webino workspace',
            function: function () {
                grunt.log.ok('Initializing workspace ...');
                if (!process.getuid()) {
                    grunt.fail.warn('Are you a root?');
                    return;
                }

                // crete user config
                grunt.task.run('init-user-cfg');
                // TODO create workspace directories
                //grunt.task.run('mkdir:workspace');
            }
        };

        /**
         * Required to run as user
         */
        config.tasks['init-user-cfg'] = {
            isSystem: true,
            description: 'Initialize your workspace configuration',
            function: function () {
                if (grunt.file.exists(config.user_cfg)) {
                    // already exists
                    return;
                }

                grunt.log.ok('Installing Webino user config ...');
                grunt.util.spawn(
                    {cmd: 'cp', args: [config.root + '/dist/webino.json', config.user_cfg]},
                    function () {
                    }
                );
            }
        };

        config.tasks.mod = {
            description: 'Develop existing Webino module',
            examples: ['webino mod:WebinoExample'],
            function: function (name) {
                // Resolve module by name
                name || grunt.fail.warn('\n\nExpected module option, e.g.: \n\ -name WebinoExample \n\n');
                grunt.log.writeln('Preparing module \'' + name + '\' for development ...');
                grunt.task.run('wait_async:mod:' + name);
            }
        };

        /**
         * Required to run as root
         */
        config.tasks.setup = {
            isSystem: true,
            description: 'Initializes Webino Development Kit',
            function: function () {
                if (config.utils.isInit()) {
                    grunt.log.ok('Initializing ...');
                    grunt.task.run(['mkdir:utils', 'wait_async:utils']);
                }
                grunt.task.run('wait_async:setup');
            }
        };
    }

    return config;
})();
