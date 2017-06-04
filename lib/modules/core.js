module.exports = function config(grunt, config, modules) {

    /**
     * Core configuration
     */
    config.utils.root   = '/var/lib/webino';
    config.utils.php    = config.utils.root + '/php';
    config.utils.isInit = function () { return !grunt.file.isFile(config.utils.php + '/composer.phar'); };

    /**
     * Default properties
     */
    config.app    = {git: {}, public: {}, data: {cache: {dir: '<%= app.dir %>/data/cache'}}};
    config.module = {git: {}};
    config.local  = {};

    /**
     * Include sub-modules
     */
    require(__dirname + '/core/common.js')(grunt, config);
    require(__dirname + '/core/composer.js')(grunt, config);
    require(__dirname + '/core/database.js')(grunt, config);
    require(__dirname + '/core/git.js')(grunt, config);
    require(__dirname + '/core/selenium.js')(grunt, config, modules);

    /**
     * Options resolvers
     */
    grunt.template.serverPortOption = function ()
    {
        var port = 8000;

        // parse port from URI
        if (process.env.URI) {
            var matches = process.env.URI.match(/:([0-9]{4})\//);
            matches && matches[1] && (port = matches[1]);
        }

        grunt.option('port', port);
        return port;
    };

    /**
     * Default task
     */
    config.tasks.default = {function: config.showTasksHelp};

    /**
     * Setup clean tasks
     */
    config.clean.log = {src: ['._log']};
    config.clean.api = {src: ['._api']};

    config.clean.app_cfg        = {src: ['<%= app.dir %>/config/application.config.php']};
    config.clean.app_cache      = {src: ['<%= app.dir %>/data/cache/*']};
    config.clean.app_vendor     = {src: ['<%= app.dir %>/vendor']};
    config.clean.app_autoloader = {src: ['<%= app.dir %>/<%= app.autoloader %>']};

    /**
     * Setup directories tasks
     */
    config.mkdir.log     = {options: {create: ['._log', '._log/code-browser', '._log/coverage']}};
    config.mkdir.test    = {options: {create: ['._test']}};
    config.mkdir.app_log = {options: {create: ['<%= app.dir %>/data/log']}};
    config.mkdir.app_tmp = {options: {create: ['<%= app.dir %>/tmp/common']}};

    /**
     * Opens test application in a web browser
     */
    config.exec.show_app = {cmd: 'sensible-browser <%= app.uri %>'};

    /**
     * Starts PHP built-in server
     */
    config.exec.server = {
        cmd: 'echo "" && (echo "    http://localhost:<%= grunt.template.serverPortOption() %>/" && echo "" '
           + '&& cd <%= app.dir %>/public && php -S localhost:<%= grunt.template.serverPortOption() %> &) || true'
    };

    /**
     * Stops PHP built-in server
     */
    config.exec['stop-server'] = {
        check: 'ps aux | grep \'[l]ocalhost:<%= grunt.template.serverPortOption() %>\''
    };
    config.exec['stop-server'].cmd = 'echo "" && (echo "    http://localhost:<%= grunt.template.serverPortOption() %>/" '
        + '&& echo "" && kill $(' + config.exec['stop-server'].check + ' | awk \'{print $2}\') 2> /dev/null &) || true';

    /**
     * Remove empty dirs
     */
    config.exec.remove_empty_dirs = {cmd: 'find <%= grunt.task.current.args[0] %> -type d -empty -delete'};

    /**
     * Configure application development environment
     */
    config.exec.app_config_dev = {
        cmd: '[ -f config/autoload/local.php ] || ('
        + 'cd <%= grunt.task.current.args[0] %> && '
        + 'cp config/autoload/local.php.dist config/autoload/local.php)'
    };

    /**
     * Common fail task
     */
    config.tasks.fail = {function: grunt.fatal};

    /**
     * Setup local URI
     */
    (function () {
        // If the user name is webino we expects that development environment
        // is located on the webino.local domain, otherwise webino.<user> is expected
        var suffix = config.user !== 'webino' ? config.user : 'local';
        config.local.uri = 'http://webino.' + suffix;
    })();

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
            bin: 'UNIT=1 php -dzend_extension=xdebug.so -dmax_execution_time=1200 <%= utils.php %>/vendor/bin/phpunit',
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
                'src<%= grunt.template.psr4Namespace() %>',
                'tests/<%= pkg.camelCase %>',
                'tests/tester/<%= pkg.camelCase %>',
                'tests/selenium/<%= pkg.camelCase %>',
                'tests/resources/src/<%= pkg.camelCase %>'
            ]
        }
    };
    config.phpmd = {
        options: {
            bin: '<%= utils.php %>/vendor/bin/phpmd',
            rulesets: 'codesize,design,naming,unusedcode',
            reportFile: '._log/phpmd.xml'
        },
        src: {dir: 'src<%= grunt.template.psr4Namespace() %>'},
        tests: {dir: 'tests', options: {reportFile: '._log/phpmd-tests.xml'}}
    };
    config.phpcpd = {
        options: {
            bin: '<%= utils.php %>/vendor/bin/phpcpd',
            reportFile: '._log/pmd-cpd.xml',
            quiet: false
        },
        src: {dir: 'src<%= grunt.template.psr4Namespace() %>'}
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
    config.exec.phploc    = {cmd: '<%= utils.php %>/vendor/bin/phploc --log-csv ._log/phploc.csv src'};
    config.exec.pdepend   = {cmd: '<%= utils.php %>/vendor/bin/pdepend --summary-xml=._log/pdepend.xml --jdepend-xml=._log/jdepend.xml --jdepend-chart=._log/dependencies.svg --overview-pyramid=._log/overview-pyramid.svg src'};
    config.exec.phpcb     = {cmd: '<%= utils.php %>/vendor/bin/phpcb --log ._log --source src --output ._log/code-browser'};
    config.exec.phpdoc    = {cmd: '<%= utils.php %>/vendor/bin/phpdoc'};
    config.exec.tester    = {cmd: 'UNIT=1 <%= utils.php %>/vendor/bin/tester -p php-cgi -c <%= utils.php %>/tester/php.ini --coverage ._log/clover.xml --coverage-src src/ tests/tester/<%= grunt.template.tester() %>'};

    grunt.template.tester = function () {
        var out = '';

        var filter = grunt.option('filter');
        filter && (out+= filter + '*');

        if (config.isBuild === true) {
            out+= ' -o junit > ._log/junit.xml';
        }

        return out;
    };

    config.tasks.build = {
        description: 'Build the package',
        function: [
            'init-build',
            'update',
            'test',
            'analyze',
            'api'
        ]
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
