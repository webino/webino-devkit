/** Config for Zend Framework support */
exports.config = config = (function() {
    function config(grunt, config) {
        config.test_app_name = 'ZendSkeletonApplication';
        config.test_app_vendor_git = 'git://github.com/zendframework';
        config.test_app_git_branch = 'master';

        // fetch skeleton app by tag
        if (config.pkg.extra && config.pkg.extra['webino-devkit']
            && config.pkg.extra['webino-devkit'].ZendSkeletonApplication
        ) {
            config.test_app_git_extra = 'cd <%= test_app_path %> && git fetch --tags && git checkout tags/'
                                      + config.pkg.extra['webino-devkit'].ZendSkeletonApplication;
        }

        config.tasks.update.function.push('mkdir:test_app_log');
        config.tasks.update.function.push('mkdir:test_app_tmp');
    }

    return config;
})();
