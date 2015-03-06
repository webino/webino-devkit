/** Config for Zend Framework support */
exports.config = config = (function() {
    function config(grunt, config) {
        config.test_app_name = 'ZendSkeletonApplication';
        config.test_app_vendor_git = 'git://github.com/zendframework';
        config.tasks.update.function.push('mkdir:test_app_log');
    }

    return config;
})();
