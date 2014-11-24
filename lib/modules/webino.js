/**
 * Setup grunt config for Webino
 */
(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            config.test_app_name = 'WebinoSkeletonApplication';
            config.test_app_vendor_git = 'git://github.com/webino';
        };

        return config;
    })();
}).call(this);
