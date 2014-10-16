(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            /**
             * Setup grunt config for Webino
             */
            config.test_app_name = 'WebinoTestApplication';
        };

        return config;
    })();
}).call(this);
