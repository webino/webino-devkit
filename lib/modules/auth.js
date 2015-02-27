/** Authentication support */
exports.config = (function () {
    function config(grunt, config) {
        config.exec.selenium_test.cmd =
            'IDENTITY="<%= config.authentication.identity %>" '
            + 'CREDENTIAL="<%= config.authentication.credential %>" '
            + config.exec.selenium_test.cmd;
    }

    return config;
})();
