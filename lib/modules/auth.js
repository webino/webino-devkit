/** Authentication support */
exports.config = (function () {
    function config(grunt, config) {
        config.selenium_test_env =
            'IDENTITY="<%= config.authentication.identity %>" '
            + 'CREDENTIAL="<%= config.authentication.credential %>" '
            + config.selenium_test_env;
    }

    return config;
})();
