module.exports = function config(grunt, config) {
    grunt.log.writeln('\n\You are developing a package: ' + config.pkg.camelCase);

    /**
     * Test app properties
     */
    config.app.dir = '<%= basedir %>/._test/<%= app.name %>';
    config.app.public.dir = '<%= app.dir %>/public';
    config.app.uri = config.local.uri + '/mods/<%= pkg.camelCase %>/._test/<%= app.name %>/public/';

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
            bin: 'TYPE=unit php -dzend_extension=xdebug.so -dmax_execution_time=1200 <%= utils.php %>/vendor/bin/phpunit',
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
                fileTasks: function (file, tasks) {
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
     * Setup tools
     */
    config.exec.show_app  = {cmd: 'sensible-browser <%= app.uri %>'};
    config.exec.show_log  = {cmd: 'sensible-browser file://<%= app.dir %>/data/log'};
    config.exec.show_api  = {cmd: 'sensible-browser file://<%= basedir %>/._api/index.html'};
    config.exec.didef     = {cmd: 'php bin/definition_generator.php'};
    config.exec.add_didef = {cmd: 'git add data/di'};
    config.exec.phploc    = {cmd: '<%= utils.php %>/vendor/bin/phploc --log-csv ._log/phploc.csv src'};
    config.exec.pdepend   = {cmd: '<%= utils.php %>/vendor/bin/pdepend --summary-xml=._log/pdepend.xml --jdepend-xml=._log/jdepend.xml --jdepend-chart=._log/dependencies.svg --overview-pyramid=._log/overview-pyramid.svg src'};
    config.exec.phpcb     = {cmd: '<%= utils.php %>/vendor/bin/phpcb --log ._log --source src --output ._log/code-browser'};
    config.exec.phpdoc    = {cmd: '<%= utils.php %>/vendor/bin/phpdoc'};
    config.exec.tester    = {cmd: 'TYPE=unit <%= utils.php %>/vendor/bin/tester -p php-cgi -d zend_extension=xdebug.so -d extension=mailparse.so -d max_execution_time=1200 --coverage ._log/clover.xml --coverage-src src/ tests/tester/<%= grunt.template.tester() %>'};

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
    config.exec.app_clean = {cmd: 'rm -rf <%= app.dir %>'};
    config.exec.app_make  = {cmd: 'git clone <%= app.git.origin %>/<%= app.name %>.git --branch <%= app.git.branch %> --depth 1 <%= app.dir %>;<%= app_git_extra %>'};

    config.exec.app_link_autoloader = {cmd: 'ln -s <%= basedir %>/tests/resources/<%= app.autoloader %> <%= app.dir %>/<%= app.autoloader %>'};
    config.exec.app_link_vendor     = {cmd: 'ln -s <%= basedir %>/vendor <%= app.dir %>/vendor'};
    config.exec.app_link_cfg        = {cmd: 'ln -s <%= basedir %>/tests/resources/config/application.config.php <%= app.dir %>/config/application.config.php'};

    /**
     * Tasks
     */
    config.tasks.show = {
        description: 'Show the package in a web browser',
        function: ['exec:show_app', 'exec:show_log']
    };

    config.tasks.set_is_build = {
        function: function () {
            config.isBuild = true;
        }
    };

    config.tasks.build = {
        description: 'Build the package',
        function: [
            'set_is_build',
            'update',
            'test',
            'analyze',
            'api'
        ]
    };

    config.tasks['make-test-app'] = {function: ['exec:app_make']};

    config.tasks['init-test-app'] = {
        function: [
            'exec:app_clean',
            'make-test-app',
            'clean:app_autoloader',
            'exec:app_link_autoloader',
            'clean:app_vendor',
            'exec:app_link_vendor',
            'clean:app_cfg',
            'exec:app_link_cfg'
        ]
    };

    config.tasks.update = {
        description: 'Update development environment',
        function: [
            'mkdir:test',
            'init_precommit',
            'init-test-app',
            'exec:composer_update_dev',
            'configure'
        ]
    };

    config.tasks.dev = {
        description: 'Develop the package',
        function: ['watch']
    };

    config.tasks['live-dev'] = {
        description: 'Develop the package with BrowserSync',
        function: ['browserSync', 'dev']
    };

    config.tasks.configure = {
        description: 'Configure Webino module development environment',
        function: []
    };

    config.tasks.test = {
        description: 'Run unit tests',
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
        function: function () {
            // run PHPUnit or Nette\Tester
            var isPhpUnit = grunt.file.exists(grunt.config('basedir') + '/tests/phpunit.xml');
            grunt.task.run(isPhpUnit && 'phpunit' || 'exec:tester');
        }
    };

    config.tasks.uat = {
        description: 'Run user acceptance tests',
        function: function () {
            var browser = grunt.config.process('<%= grunt.template.browserOption() %>');
            grunt.task.run(['configure', 'selenium:' + browser]);
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

    config.tasks['show-api'] = {
        description: 'Show API in a web browser',
        function:    ['exec:show_api']
    };
};
