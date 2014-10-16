(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            /**
             * Setup grunt config for authentication support
             */
            config.exec.selenium_test.cmd = 'IDENTITY="<%= config.authentication.identity %>" '
                                          + 'CREDENTIAL="<%= config.authentication.credential %>" '
                                          + config.exec.selenium_test.cmd;
        };

        return config;
    })();
}).call(this);
