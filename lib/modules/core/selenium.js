/** Selenium testing support */
module.exports = function (grunt, config) {

    config.selenium = {
        src: 'http://selenium-release.storage.googleapis.com/2.45/selenium-server-standalone-2.45.0.jar'
    };

    config.exec.get_selenium = {
        cmd: 'wget -qO <%= utils.root %>/selenium-server.jar <%= selenium.src %> | echo "Downloading..."'
    };

    config.exec.selenium_start = {
        cmd: 'selenium start && sleep 5s'
    };

    grunt.template.resolveSeleniumTestFilterOption = function () {
        return grunt.option('filter') ? '--filter ' + grunt.option('filter') : '';
    };

    config.exec.selenium_test = {
        cmd: 'URI=' + config.resolveUriOption() + ' BROWSER=<%= grunt.task.current.args[0] %> '
        + '<%= utils.php %>/vendor/bin/phpunit -c tests/selenium '
        + '<%= grunt.template.resolveSeleniumTestFilterOption() %>'
    };

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
