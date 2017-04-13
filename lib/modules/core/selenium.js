/** Selenium testing support */
module.exports = function (grunt, config, modules) {
    /**
     * Properties
     */
    config.selenium = {
        app:  '<%= app.dir %>',
        test: {env: []},
        src:  'http://selenium-release.storage.googleapis.com/2.53/selenium-server-standalone-2.53.1.jar'
    };

    /**
     * Handlers
     */
    config.tasks['init-build'].exec
        && config.tasks['init-build'].exec.push(function () {
            config.selenium.test.env.push('BUILD=1');
        });

    /**
     * Option resolvers
     */
    grunt.template.uriOption = function ()
    {
        process.env.URI && grunt.option('uri', process.env.URI);
        return (grunt.option('uri') || '<%= app.uri %>')
    };
    grunt.template.seleniumPortOption = function ()
    {
        if (grunt.option('port')) {
            return grunt.option('port');
        }
        if (process.env.PORT) {
            grunt.option('port', process.env.PORT);
            return process.env.PORT;
        }
        var port = exec('selenium port', {silent: true}).output.trim();
        grunt.option('port', port);
        grunt.log.ok('Using port: ' + port);
        return port;
    };
    grunt.template.browserOption = function ()
    {
        var browser;
        grunt.task.current.args[0] && (browser = grunt.task.current.args[0]);
        browser || process.env.BROWSER && (browser = process.env.BROWSER);
        browser || (browser = 'firefox');
        return browser;
    };
    grunt.template.seleniumTestFilterOption = function () {
        return grunt.option('filter') ? '--filter ' + grunt.option('filter') : '';
    };

    /**
     * Cleanup
     */
    config.clean.selenium_record = {src: ['<%= basedir %>/._log/test.ogv']};

    /**
     * Commands
     */
    config.exec.get_selenium        = {cmd: 'sudo wget -qO <%= utils.root %>/selenium-server.jar <%= selenium.src %> | echo "Downloading..."'};
    config.exec.selenium_lock_app   = {cmd: 'touch <%= selenium.app %>/tmp/common/selenium.lock'};
    config.exec.selenium_unlock_app = {cmd: 'rm <%= selenium.app %>/tmp/common/selenium.lock'};
    config.exec.selenium_start      = {cmd: 'PORT=<%= grunt.template.seleniumPortOption() %> selenium start && sleep 5s'};
    config.exec.selenium_stop       = {cmd: 'PORT=<%= grunt.template.seleniumPortOption() %> selenium stop'};

    config.exec.selenium_notify_success = {cmd: '[ "$(notify-send -v 2> /dev/null)" = "" ] || notify-send "<%= pkg.camelCase %>" "Selenium tests success!"'};
    config.exec.selenium_notify_fail    = {cmd: '[ "$(notify-send -v 2> /dev/null)" = "" ] || notify-send "<%= pkg.camelCase %>" "Selenium tests failed!"'};

    config.exec.selenium_test = {
        cmd: config.exec.selenium_lock_app.cmd + ';'
           + 'echo Location <%= grunt.template.uriOption() %>;'
           + '<%= selenium.test.env.join(" ") %> '
           + 'URI=<%= grunt.template.uriOption() %> '
           + 'BROWSER=<%= grunt.task.current.args[0] %> '
           + 'PORT=<%= grunt.task.current.args[1] %> '
           + 'UAT=1 <%= utils.php %>/vendor/bin/phpunit -c tests/selenium '
           + '<%= grunt.template.seleniumTestFilterOption() %>'
           + ' && <%= exec.selenium_unlock_app.cmd %>'
    };

    config.exec.selenium_record = {
        stdout: false,
        stderr: false,

        cmd: 'DISPLAY=:<%= grunt.task.current.args[0] %> recordmydesktop --display=:<%= grunt.task.current.args[0] %>'
           + ' --delay=1 --no-sound --no-cursor --fps=24 --workdir=<%= basedir %>/._log'
           + ' --overwrite -o <%= basedir %>/._log/test.ogv &> /dev/null &'
    };

    config.onFail.enq({priority: 1, callback: function (e) {
        if (-1 !== e.indexOf('exec:selenium_test')) {
            grunt.option('force', true);
            grunt.task.run([
                'exec:selenium_unlock_app',
                'exec:selenium_stop',
                'exec:selenium_notify_fail',
                'exec:stop-server',
                'fail:Selenium failed!'
            ]);
        }
    }});

    if (-1 !== modules.indexOf('global')) {
        // return early for a global context
        return;
    }

    /**
     * Tasks
     */
    config.tasks['selenium'] = {
        description: 'Run selenium tests',
        function: function () {
            var browser = grunt.config.process('<%= grunt.template.browserOption() %>');
            var port    = grunt.config.process('<%= grunt.template.seleniumPortOption() %>');
            var tasks   = ['exec:selenium_start'];

            (0 == process.env.R || 0 == process.env.X)
                || tasks.push('exec:selenium_record:' + port);

            tasks = tasks.concat([
                'exec:selenium_test:' + browser + ':' + port,
                'exec:selenium_stop',
                'exec:selenium_notify_success'
            ]);

            grunt.task.run(tasks);
        }
    };
};
