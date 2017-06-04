module.exports = function config(grunt, config) {
    var isPSR4 = config.pkg.isPSR4();

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
                'src' + (isPSR4 ? '' : '/<%= pkg.camelCase %>'),
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
        src: {dir: 'src' + (isPSR4 ? '' : '/<%= pkg.camelCase %>')},
        tests: {dir: 'tests', options: {reportFile: '._log/phpmd-tests.xml'}}
    };
    config.phpcpd = {
        options: {
            bin: '<%= utils.php %>/vendor/bin/phpcpd',
            reportFile: '._log/pmd-cpd.xml',
            quiet: false
        },
        src: {dir: 'src' + (isPSR4 ? '' : '/<%= pkg.camelCase %>')}
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
