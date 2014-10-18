(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            /**
             * Setup grunt config for Zend Framework
             */
            config.test_app_name = 'ZendSkeletonApplication';
            config.test_app_vendor_git = 'git://github.com/zendframework';
        };

        return config;
    })();
}).call(this);
