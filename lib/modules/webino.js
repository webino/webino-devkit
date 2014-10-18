(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            /**
             * Setup grunt config for Webino
             */
            config.test_app_name = 'WebinoSkeletonApplication';
            config.test_app_vendor_git = 'git://github.com/webino';
        };

        return config;
    })();
}).call(this);
