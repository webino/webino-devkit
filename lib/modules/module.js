(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            grunt.log.writeln('Developing module \'' + config.pkg.name + '\'');

            /**
             * Setup grunt config for module development
             */
            config.test_app_uri = 'http://localhost/webino/modules/<%= pkg.name %>/._test/<%= test_app_name %>/public/';

            /**
             * Setup clean tasks
             */
            config.clean.log = {src: ['._log']};
            config.clean.api = {src: ['._api']};
            config.clean.test_app_init_autoloader = {src: ['._test/<%= test_app_name %>/init_autoloader.php']};
            config.clean.test_app_vendor = {src: ['._test/<%= test_app_name %>/vendor']};
            config.clean.test_app_cfg = {src: ['._test/<%= test_app_name %>/config/application.config.php']};
            config.clean.test_app_assets = {src: ['._test/<%= test_app_name %>/public/assets/<%= pkg.dashed_name %>/**/*.*']};

            /**
             * Setup mkdir tasks
             */
            config.mkdir.log = {options: {create: ['._log', '._log/code-browser', '._log/coverage']}};
            config.mkdir.test = {options: {create: ['._test']}};
            config.mkdir.test_app_log = {options: {create: ['<%= basedir %>/._test/<%= test_app_name %>/data/log']}};

            /**
             * Setup QA
             */

            config.phplint = {
                src: ['src/**/*.php'],
                tests: ['tests/**/*.php'],
                config: ['config/**/*.php']
            };

            config.phpunit = {
                options: {
                    configuration: 'tests',
                    bin: '<%= resources.php.path %>/vendor/bin/phpunit',
                    coverageHtml: '<%= basedir %>/._log/coverage',
                    testdoxHtml: '<%= basedir %>/._log/testdox.html',
                    coverageClover: '<%= basedir %>/._log/clover.xml',
                    logJunit: '<%= basedir %>/._log/junit.xml',
                    colors: true
                },
                package: {dir: ''}
            };

            config.phpcs = {
                options: {
                    standard: 'PSR2',
                    extensions: 'php',
                    bin: '<%= resources.php.path %>/vendor/bin/phpcs',
                    report: 'checkstyle',
                    reportFile: '._log/checkstyle.xml',
                    verbose: true
                },
                package: {
                    dir: [
                        'src/<%= pkg.name %>',
                        'tests/<%= pkg.name %>',
                        'tests/resources/<%= pkg.name %>',
                        'tests/selenium/<%= pkg.name %>'
                    ]
                }
            };

            config.phpmd = {
                options: {
                    bin: '<%= resources.php.path %>/vendor/bin/phpmd',
                    rulesets: 'codesize,design,naming,unusedcode',
                    reportFile: '._log/phpmd.xml'
                },
                src: {dir: 'src/<%= pkg.name %>'},
                tests: {dir: 'tests', options: {reportFile: '._log/phpmd-tests.xml'}}
            };

            config.phpcpd = {
                options: {
                    bin: '<%= resources.php.path %>/vendor/bin/phpcpd',
                    reportFile: '._log/pmd-cpd.xml'
                },
                src: {dir: 'src/<%= pkg.name %>'},
                tests: {dir: 'tests', options: {reportFile: '._log/pmd-cpd-tests.xml'}}
            };

            config.todos = {
                options: {
                    priorities: {
                        low: null,
                        med: /(TODO|todo)/,
                        high: /(FIXME|fixme)/
                    },
                    reporter: {
                        header: function() {
                            grunt.file.write('._log/todos.txt', '');
                            return '-- Begin Task List --\n';
                        },
                        fileTasks: function(file, tasks, options) {
                            if (!tasks.length) {
                                return '';
                            }
                            var result = '';
                            result += 'For ' + file + '\n';
                            tasks.forEach(function(task) {
                                result += '[' + task.lineNumber + ' - ' + task.priority + '] ' + task.line + '\n';
                            });
                            result += '\n';
                            grunt.file.write('._log/todos.txt', grunt.file.read('._log/todos.txt') + result);
                            return result;
                        },
                        footer: function() {
                            return '-- End Task List--\n';
                        }
                    },
                    verbose: false
                },
                package: {
                    src: ['src/**/*.php', 'tests/**/*.php']
                }
            };

            /**
             * Setup watching
             */

            config.watch = {
                cache: {
                    files: [
                        'src/**/*',
                        'config/**/*',
                        'language/**/*',
                        'view/**/*',
                        'tests/resources/**/*',
                        'tests/resources/**/*'
                    ],
                    tasks: ['exec:test_app_clear_cache']
                },
                assets: {
                    files: ['public/assets/**/*'],
                    tasks: ['clean:test_app_assets']
                }
            };

            config.browserSync = {
                dev: {
                    bsFiles: {src: ['public/assets/**/*.css']},
                    options: {
                        watchTask: true,
                        debugInfo: true,
                        ghostMode: {
                            clicks: true,
                            scroll: true,
                            links: true,
                            forms: true
                        }
                    }
                }
            };

            /**
             * Setup tools
             */
            config.exec.show_web = {cmd: 'google-chrome <%= test_app_uri %>'};
            config.exec.show_log = {cmd: 'google-chrome file://<%= basedir %>/._test/<%= test_app_name %>/data/log'};
            config.exec.show_api = {cmd: 'google-chrome file://<%= basedir %>/._api/index.html'};
            config.exec.didef = {cmd: 'php bin/definition_generator.php'};
            config.exec.add_didef = {cmd: 'git add data/di'};
            config.exec.phploc = {cmd: '<%= resources.php.path %>/vendor/bin/phploc --log-csv ._log/phploc.csv src'};
            config.exec.pdepend = {cmd: '<%= resources.php.path %>/vendor/bin/pdepend --summary-xml=._log/pdepend.xml --jdepend-xml=._log/jdepend.xml --jdepend-chart=._log/dependencies.svg --overview-pyramid=._log/overview-pyramid.svg src'};
            config.exec.phpcb = {cmd: '<%= resources.php.path %>/vendor/bin/phpcb --log ._log --source src --output ._log/code-browser'};
            config.exec.phpdoc = {cmd: '<%= resources.php.path %>/vendor/bin/phpdoc'};

            /**
             * Setup test app tools
             */
            config.exec.test_app_clean = {cmd: 'rm -rf ._test/<%= test_app_name %>'};
            config.exec.test_app_make = {cmd: 'git clone git://github.com/zendframework/<%= test_app_name %>.git ._test/<%= test_app_name %>'};
            config.exec.test_app_link_init_autoloader = {cmd: 'ln -s <%= basedir %>/tests/resources/init_autoloader.php <%= basedir %>/._test/<%= test_app_name %>/init_autoloader.php'};
            config.exec.test_app_link_vendor = {cmd: 'ln -s <%= basedir %>/vendor <%= basedir %>/._test/<%= test_app_name %>/vendor'};
            config.exec.test_app_link_cfg = {cmd: 'ln -s <%= basedir %>/tests/resources/config/application.config.php <%= basedir %>/._test/<%= test_app_name %>/config/application.config.php'};

            /**
             * Register grunt tasks
             */

            config.tasks.default = {
                isSystem: true,
                description: 'Webino Development Kit help',
                function: function () {
                    config.showTasksHelp();
                }
            };

            config.tasks.init = {
                description: 'Initialize Webino module',
                function: function () {
                    grunt.log.write('Initializing: ');
                    grunt.util.spawn({cmd: 'npm install'}, function () {
                        grunt.log.write('npm ');
                    });
                    grunt.task.run('update');
                    grunt.task.run('show');
                    grunt.log.writeln(' ');
                }
            };

            config.tasks.regen = {
                description: 'Regenerate package data',
                function: ['exec:didef', 'exec:add_didef']
            };

            config.tasks.show = {
                description: 'Show the package in a web browser',
                function: ['exec:show_web', 'exec:show_log']
            };

            config.tasks.build = {
                description: 'Build the package',
                function: [
                    'update',
                    'test',
                    'selenium_test',
                    'analyze',
                    'api'
                ]
            };

            config.tasks.update = {
                description: 'Update the package development environment',
                function: [
                    'mkdir:test',
                    'init_precommit',
                    'init_composer',
                    'exec:test_app_clean',
                    'exec:test_app_make',
                    'clean:test_app_init_autoloader',
                    'exec:test_app_link_init_autoloader',
                    'clean:test_app_vendor',
                    'exec:test_app_link_vendor',
                    'exec:composer_update_dev',
                    'clean:test_app_cfg',
                    'exec:test_app_link_cfg',
                    'mkdir:test_app_log'
                ]
            };

            config.tasks.dev = {
                description: 'Develop the package',
                function: [
                    'browserSync',
                    'watch'
                ]
            };

            config.tasks.test = {
                description: 'Run PHPUnit tests',
                function: [
                    'clean:log',
                    'mkdir:log',
                    'phplint',
                    'phpunit',
                    'phpcs'
                ]
            };

            config.tasks.selenium_test = {
                description: 'Run Selenium tests',
                function: [
                    'exec:selenium_start',
                    'exec:selenium_test',
                    'exec:selenium_stop'
                ]
            };

            config.tasks.analyze = {
                description: 'Analyze the code',
                function: [
                    'mkdir:log',
                    'phpmd',
                    'phpcpd',
                    'exec:phploc',
                    'exec:pdepend',
                    'exec:phpcb',
                    'todos'
                ]
            };

            config.tasks.api = {
                description: 'Generate API',
                function: ['clean:api', 'exec:phpdoc']
            };

            config.tasks.show_api = {
                description: 'Show API in web browser',
                function: ['exec:show_api']
            };

            config.tasks.publish = {
                description: 'Publish module to a repository',
                function: function () {
                    // Recreate github repo
                    grunt.task.run('exec:github_delete_repo');
                    grunt.task.run('exec:github_create_repo');

                    // Initialize git & push
                    grunt.task.run('clean:git');
                    grunt.task.run('exec:git_init');
                    grunt.task.run('exec:git_add');
                    grunt.task.run('exec:git_flow_init');
                    grunt.task.run('exec:git_remote_add_origin');
                    grunt.task.run('exec:git_push_origin_develop');
                    grunt.task.run('exec:git_push_origin_master');
                }
            };

            /**
             * Register system grunt tasks
             */
            config.tasks.precommit.function.push('regen');
        };

        return config;
    })();
}).call(this);
