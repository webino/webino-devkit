/** Selenium testing support */
module.exports = function (grunt, config) {

    config.selenium = {
        src: 'http://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar'
    };

    config.selenium_test_env = '';
    config.selenium_test_app = '<%= test_app_path %>';

    config.exec.get_selenium = {
        cmd: 'sudo wget -qO <%= utils.root %>/selenium-server.jar <%= selenium.src %> | echo "Downloading..."'
    };

    config.exec.selenium_lock_test_app = {
        cmd: 'touch <%= selenium_test_app %>/tmp/common/selenium.lock'
    };

    config.exec.selenium_unlock_test_app = {
        cmd: 'rm <%= selenium_test_app %>/tmp/common/selenium.lock'
    };

    config.exec.selenium_start = {
        cmd: 'selenium start && sleep 5s'
    };

    grunt.template.resolveSeleniumTestFilterOption = function () {
        return grunt.option('filter') ? '--filter ' + grunt.option('filter') : '';
    };

    config.exec.selenium_test = {
        cmd: config.exec.selenium_lock_test_app.cmd + ';'
        + '<%= selenium_test_env %> '
        + 'URI=' + config.resolveUriOption() + ' BROWSER=<%= grunt.task.current.args[0] %> '
        + '<%= utils.php %>/vendor/bin/phpunit -c tests/selenium '
        + '<%= grunt.template.resolveSeleniumTestFilterOption() %>'
        + ' && ' + config.exec.selenium_unlock_test_app.cmd
    };

    config.onFail.enq({priority: 1, callback: function (e) {
        if (-1 !== e.indexOf('exec:selenium_test')) {
            grunt.option('force', true);
            grunt.task.run(['exec:selenium_unlock_test_app', 'fail:Selenium failed!']);
        }
    }});

    config.exec.selenium_stop = {
        cmd: 'selenium stop'
    };

    config.tasks.uat = {
        description: 'Run user acceptance tests',
        function: function (browser) {
            browser = config.resolveBrowserOption(browser);
            grunt.task.run(['configure', 'selenium_test:' + browser]);
        }
    };

    config.tasks.selenium_test = {
        isSystem: true,
        description: 'Run selenium tests',
        function: function (browser) {
            browser = config.resolveBrowserOption(browser);
            grunt.task.run([
                'exec:selenium_start',
                'exec:selenium_test:' + browser,
                'exec:selenium_stop'
            ]);
        }
    };
};
