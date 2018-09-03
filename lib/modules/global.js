module.exports = function config(grunt, config) {
    /**
     * Initialize module development environment
     *
     * @param name string Module name
     * @param path string Module directory path
     * @param done closure
     */
    config.initModule = function (name, path, done) {
        process.chdir(path + '/' + name);
        var initProcess = config.cp.exec('webino update', function () {
            done && done();
        });
        grunt.log.writeln();
        initProcess.stdout.pipe(process.stdout);
        initProcess.stderr.pipe(process.stderr);
    };

    /**
     * Waiting for utils copying
     */
    config.wait_async.setup = {
        options: {
            wait: function (done) {
                var func = function () {
                    if (grunt.file.isDir(config.utils.php)) {
                        process.chdir(config.utils.php);

                        var tasks = ['copy:utils'];

                        if (config.utils.isInit()) {
                            tasks.push('exec:get_composer');
                        } else {
                            grunt.log.ok('Updating ...');
                            tasks.push('copy:utils_composer', 'exec:composer_self_update');
                        }

                        tasks.push('exec:composer_update', 'exec:get_selenium');
                        grunt.task.run(tasks);
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
                    var path = grunt.task.current.args[1] ? grunt.task.current.args[1] : config.workspace.modules;

                    repo.ssh || grunt.fail.warn('\n\nExpected repository ssh option');
                    name || grunt.fail.warn('\n\nExpected module option, e.g.: \n\ -name WebinoExample \n\n');

                    var uri = repo.ssh + '/' + name;
                    var target = path + '/' + name;

                    grunt.log.debug(target);
                    if (grunt.file.exists(target + '/.git')) {
                        grunt.log.write('\nTarget already exists, initializing ...');
                        config.initModule(name, path, done);
                        return;
                    }

                    grunt.log.write('Cloning ' + repo.name + ':' + repo.vendor + '/' + name + ' ...');
                    config.loading();

                    grunt.log.debug(uri);
                    grunt.log.debug(repo);

                    var cloneProcess = config.cp.exec('git clone ' + uri + ' ' + target, function (error) {
                        config.loading.stop();
                        if (error) {
                            func(error);
                            return;
                        }

                        grunt.log.writeln('OK');
                        grunt.log.ok('\nInitializing ' + target + ' ...');
                        config.initModule(name, path, done);
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

    config.mkdir.workspace = {
        options: {create: ['<%= workspace.root %>']}
    };

    config.mkdir.utils = {
        options: {create: ['<%= utils.root %>', '<%= utils.php %>']}
    };

    config.copy.workspace = {
        files: [{
            expand: true,
            cwd: '<%= data.workspace %>',
            src: ['**'],
            dest: '<%= workspace.root %>',
            mode: 644
        }]
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

    /**
     * Commands
     */
    config.exec['config-module'] = {
        cmd: 'webino config-module:<%= grunt.task.current.args[0] %> <%= exec["config-module"].opts() %>',
        opts: function () {
            var options = grunt.cli.options;
            delete options['working-dir'];
            delete options.tasks;
            delete options.npm;

            var opts = [];
            Object.keys(options).forEach(function(key) {
                opts.push('-' + key + ' \"' + grunt.cli.options[key] + '\"');
            });

            return opts.join(' ');
        }
    };

    /**
     * Initializes user workspace
     * Required to run as user.
     */
    config.tasks.workspace = {
        description: 'Initialize your Webino workspace',
        function: function () {
            grunt.log.ok('Initializing workspace ...');
            if (!process.getuid()) {
                grunt.fail.warn('Are you a root?');
                return;
            }

            // crete user workspace
            grunt.task.run(['init-user-cfg', 'mkdir:workspace', 'copy:workspace']);
        }
    };

    /**
     * Initializes user config
     * Required to run as user.
     */
    config.tasks['init-user-cfg'] = {
        function: [
            'wait_async:prompt-user-cfg-auth',
            'setup-user-cfg-database',
            'write-user-cfg'
        ]
    };

    /**
     * Adds module to user config
     * Required to run as user.
     */
    config.tasks['add-module'] = {
        function: function (module) {
            grunt.task.run([
                'user-cfg-module:' + module,
                'write-user-cfg',
                'exec:config-module:' + module
            ]);
        }
    };

    /**
     * Configures module to user config
     */
    config.tasks['config-module'] = {
        function: function (module) {
            grunt.task.run([
                'add-module-' + module,
                'write-user-cfg'
            ]);
        }
    };

    /**
     * Prompt authentication settings for user cfg
     */
    config.wait_async['prompt-user-cfg-auth'] = {
        options: {
            timeout: 240 * 10000,
            wait: function (done) {
                config.prompt.get({
                        properties: {
                            'auth-identity': {
                                description: 'Auth Username'
                            },
                            'auth-credential': {
                                description: 'Auth Password'
                            }
                        }
                    }, function (err, result) {
                        if (err) {
                            done();
                            grunt.fatal(err);
                            return;
                        }

                        config.userCfg.authentication = {
                            identity:   result['auth-identity'],
                            credential: result['auth-credential']
                        };
                        done();
                    }
                );
            }
        }
    };

    /**
     * Add module to user cfg
     */
    config.tasks['user-cfg-module'] = {
        function: function (module) {
            config.userCfg.modules
                || (config.userCfg.modules = []);

            // register module
            (-1 === config.userCfg.modules.indexOf(module))
                && config.userCfg.modules.push(module);
        }
    };

    /**
     * Resolve database credentials from config file
     * Required to run as user.
     */
    config.tasks['setup-user-cfg-database'] = {
        function: function () {
            var cmd = 'php -r "echo json_encode(parse_ini_file(\'.my.cnf\'));"';
            var result = exec(cmd, {silent: true}).output.trim();
            try {
                config.userCfg.database = JSON.parse(result);
            } catch (exc) {
                grunt.fatal(exc);
            }
        }
    };

    /**
     * Write user config to a file
     * Required to run as user.
     */
    config.tasks['write-user-cfg'] = {
        function: function () {
            if (!grunt.file.exists(config.userCfgPath)) {
                // init config
                var distCfg = grunt.file.readJSON(config.root + '/dist/webino.json');
                config.userCfg = config.utils.extend(distCfg, config.userCfg);
            }

            // write
            grunt.file.write(config.userCfgPath, JSON.stringify(config.userCfg, null, 4));
        }
    };

    config.tasks.mod = {
        description: 'Develop existing Webino module',
        examples: ['webino mod:WebinoExample'],
        function: function (name, path) {
            // Resolve module by name
            name || grunt.fail.warn('\n\nExpected module option, e.g.: \n\ -name WebinoExample \n\n');
            grunt.log.writeln('Preparing module \'' + name + '\' for development ...');
            grunt.task.run('wait_async:mod:' + name + (path ? ':' + path : ''));
        }
    };

    /**
     * Required to run as root
     */
    config.tasks.setup = {
        function: function () {
            var tasks = [];

            if (config.utils.isInit()) {
                grunt.log.ok('Initializing ...');
                tasks.push('mkdir:utils');
            }

            tasks.push('wait_async:setup');
            grunt.task.run(tasks);
        }
    };
};
