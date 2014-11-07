/**
 * Setup grunt config for authentication support
 */
(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            config.exec.selenium_test.cmd =
                'IDENTITY="<%= config.authentication.identity %>" '
                + 'CREDENTIAL="<%= config.authentication.credential %>" '
                + config.exec.selenium_test.cmd;
        };

        return config;
    })();
}).call(this);
