/** Config for module development */
exports.config = (function () {
    function config(grunt, config) {
        grunt.log.writeln('\n\You are developing a package: ' + config.pkg.camelCase);
        config.test_app_path = '<%= basedir %>/._test/<%= test_app_name %>';

        (function () {
            // If the user name is webino we expects that development environment
            // is located on the webino.local domain, otherwise webino.<user> is expected
            var suffix = config.user !== 'webino' ? config.user : 'local'
            config.test_app_uri = 'http://webino.' + suffix + '/mods/<%= pkg.camelCase %>/._test/<%= test_app_name %>/public/';
        })();

        // Include tasks
        require(__dirname + '/module/init.js')(grunt, config);

        /**
         * Setup clean tasks
         */
        config.clean.log = {src: ['._log']};
        config.clean.api = {src: ['._api']};
        config.clean.test_app_init_autoloader = {src: ['<%= test_app_path %>/init_autoloader.php']};
        config.clean.test_app_vendor = {src: ['<%= test_app_path %>/vendor']};
        config.clean.test_app_cfg = {src: ['<%= test_app_path %>/config/application.config.php']};
        config.clean.test_app_assets = {src: ['<%= test_app_path %>/public/assets/<%= pkg.dashCase %>/**/*.*']};

        /**
         * Setup mkdir tasks
         */
        config.mkdir.log = {options: {create: ['._log', '._log/code-browser', '._log/coverage']}};
        config.mkdir.test = {options: {create: ['._test']}};
        config.mkdir.test_app_log = {options: {create: ['<%= test_app_path %>/data/log']}};

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
                bin: 'php -c <%= utils.php %>/php-tests.ini <%= utils.php %>/vendor/bin/phpunit',
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
                bin: '<%= utils.php %>/vendor/bin/phpcs',
                report: 'checkstyle',
                reportFile: '._log/checkstyle.xml',
                verbose: true
            },
            package: {
                dir: [
                    'src/<%= pkg.camelCase %>',
                    'tests/<%= pkg.camelCase %>',
                    'tests/resources/<%= pkg.camelCase %>',
                    'tests/selenium/<%= pkg.camelCase %>'
                ]
            }
        };

        config.phpmd = {
            options: {
                bin: '<%= utils.php %>/vendor/bin/phpmd',
                rulesets: 'codesize,design,naming,unusedcode',
                reportFile: '._log/phpmd.xml'
            },
            src: {dir: 'src/<%= pkg.camelCase %>'},
            tests: {dir: 'tests', options: {reportFile: '._log/phpmd-tests.xml'}}
        };

        config.phpcpd = {
            options: {
                bin: '<%= utils.php %>/vendor/bin/phpcpd',
                reportFile: '._log/pmd-cpd.xml',
                quiet: false
            },
            src: {dir: 'src/<%= pkg.camelCase %>'}
        };

        config.todos = {
            options: {
                priorities: {
                    low: null,
                    med: /(TODO|todo)/,
                    high: /(FIXME|fixme)/
                },
                reporter: {
                    header: function () {
                        grunt.file.write('._log/todos.txt', '');
                        return '-- Begin Task List --\n';
                    },
                    fileTasks: function (file, tasks, options) {
                        if (!tasks.length) {
                            return '';
                        }
                        var result = '';
                        result += 'For ' + file + '\n';
                        tasks.forEach(function (task) {
                            result += '[' + task.lineNumber + ' - ' + task.priority + '] ' + task.line + '\n';
                        });
                        result += '\n';
                        grunt.file.write('._log/todos.txt', grunt.file.read('._log/todos.txt') + result);
                        return result;
                    },
                    footer: function () {
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
        config.watch.cache = {
            files: [
                'src/**/*',
                'config/**/*',
                'language/**/*',
                'view/**/*',
                'tests/resources/**/*'
            ],
            tasks: ['exec:test_app_clear_cache']
        };

        config.watch.assets = {
            files: ['public/assets/**/*'],
            tasks: ['clean:test_app_assets']
        };

        config.browserSync.dev = {
            bsFiles: {src: ['public/assets/**/*.css']},
            options: {
                watchTask: true,
                debugInfo: true,
                ghostMode: false,

                scriptPath: function (path, port) {
                    return '//HOST:' + port + '/browser-sync/browser-sync-client.js';
                }
            }
        };

        /**
         * Setup tools
         */
        config.exec.show_web  = {cmd: 'google-chrome <%= test_app_uri %>'};
        config.exec.show_log  = {cmd: 'google-chrome file://<%= test_app_path %>/data/log'};
        config.exec.show_api  = {cmd: 'google-chrome file://<%= basedir %>/._api/index.html'};
        config.exec.didef     = {cmd: 'php bin/definition_generator.php'};
        config.exec.add_didef = {cmd: 'git add data/di'};
        config.exec.phploc    = {cmd: '<%= utils.php %>/vendor/bin/phploc --log-csv ._log/phploc.csv src'};
        config.exec.pdepend   = {cmd: '<%= utils.php %>/vendor/bin/pdepend --summary-xml=._log/pdepend.xml --jdepend-xml=._log/jdepend.xml --jdepend-chart=._log/dependencies.svg --overview-pyramid=._log/overview-pyramid.svg src'};
        config.exec.phpcb     = {cmd: '<%= utils.php %>/vendor/bin/phpcb --log ._log --source src --output ._log/code-browser'};
        config.exec.phpdoc    = {cmd: '<%= utils.php %>/vendor/bin/phpdoc'};
        config.exec.tester    = {cmd: '<%= utils.php %>/vendor/bin/tester -p php-cgi -c <%= utils.php %>/php-tests.ini --coverage ._log/clover.xml --coverage-src src/ tests/tester/<%= grunt.template.tester() %>'};

        grunt.template.tester = function () {
            var out = '';

            var filter = grunt.option('filter');
            filter && (out+= filter + '*');

            if (config.isBuild === true) {
                out+= ' -o junit > ._log/junit.xml';
            }

            return out;
        };

        /**
         * Setup test app tools
         */
        config.exec.test_app_clean = {cmd: 'rm -rf <%= test_app_path %>'};
        config.exec.test_app_make  = {cmd: 'git clone <%= test_app_vendor_git %>/<%= test_app_name %>.git --branch <%= test_app_git_branch %> --depth 1 <%= test_app_path %>'};
        config.exec.test_app_link_init_autoloader = {cmd: 'ln -s <%= basedir %>/tests/resources/init_autoloader.php <%= test_app_path %>/init_autoloader.php'};
        config.exec.test_app_link_vendor = {cmd: 'ln -s <%= basedir %>/vendor <%= test_app_path %>/vendor'};
        config.exec.test_app_link_cfg    = {cmd: 'ln -s <%= basedir %>/tests/resources/config/application.config.php <%= test_app_path %>/config/application.config.php'};

        config.tasks.default = {
            isSystem: true,
            description: 'Webino Development Kit help',
            function: function () {
                config.showTasksHelp();
            }
        };

        config.tasks.regen = {
            description: 'Regenerate package data',
            function: function () {
                grunt.file.exists('bin/definition_generator.php') &&
                    grunt.task.run(['exec:didef', 'exec:add_didef']);
            }
        };

        config.tasks.show = {
            description: 'Show the package in a web browser',
            function: ['exec:show_web', 'exec:show_log']
        };

        grunt.registerTask('set_is_build', function () {
            config.isBuild = true;
        });
        config.tasks.build = {
            description: 'Build the package',
            function: [
                'set_is_build',
                'init',
                'test',
                'analyze',
                'api'
            ]
        };

        config.tasks['make-test-app'] = {
            isSystem: true,
            function: function () {
                grunt.task.run('exec:test_app_make');
            }
        };

        config.tasks['init-test-app'] = {
            isSystem: true,
            description: 'Initialize testing application',
            function: [
                'exec:test_app_clean',
                'make-test-app',
                'clean:test_app_init_autoloader',
                'exec:test_app_link_init_autoloader',
                'clean:test_app_vendor',
                'exec:test_app_link_vendor',
                'clean:test_app_cfg',
                'exec:test_app_link_cfg'
            ]
        };
        // TODO remove, legacy
        config.tasks.test_app_init = config.tasks['init-test-app'];

        config.tasks.update = {
            description: 'Update the package development environment',
            function: [
                'mkdir:test',
                'init_precommit',
                'init-test-app',
                'exec:composer_update_dev'
            ]
        };

        config.tasks.dev = {
            description: 'Develop the package',
            function: [
                'browserSync',
                'watch'
            ]
        };

        config.tasks.configure = {
            description: 'Configure Webino module testing environment',
            function: []
        };

        config.tasks.test = {
            description: 'Run PHPUnit tests',
            function: [
                'clean:log',
                'mkdir:log',
                'phplint',
                'run_tests',
                'phpcs',
                'phpmd',
                'phpcpd'
            ]
        };

        config.tasks.run_tests = {
            isSystem: true,
            function: function () {
                // run PHPUnit or Nette\Tester
                var isPhpUnit = grunt.file.exists(grunt.config('basedir') + '/tests/phpunit.xml');
                grunt.task.run(isPhpUnit && 'phpunit' || 'exec:tester');
            }
        };

        config.tasks.analyze = {
            description: 'Analyze the code',
            function: [
                'mkdir:log',
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

        config.tasks.show_api = config.tasks['show-api'] = {
            description: 'Show API in a web browser',
            function: ['exec:show_api']
        };

        config.tasks.publish = {
            description: 'Publish module to a repository',
            function: function () {
                // Recreate github repo
                grunt.task.run([
                    'exec:github_delete_repo',
                    'exec:github_create_repo'
                ]);

                // Initialize git & push
                grunt.task.run([
                    'clean:git',
                    'exec:git_add',
                    'exec:git_flow_init',
                    'exec:git_remote_add_origin',
                    'exec:git_push_origin_develop',
                    'exec:git_push_origin_master'
                ]);
            }
        };

        config.tasks.precommit.function.push('regen');
    }

    return config;
})();