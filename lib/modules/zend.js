module.exports = function config(grunt, config) {
    /**
     * Application settings
     */
    config.app.name       = 'ZendSkeletonApplication';
    config.app.autoloader = 'init_autoloader.php';
    config.app.git.origin = 'git://github.com/zendframework';
    config.app.git.branch = 'master';

    /**
     * Fetch skeleton app by tag
     */
    if (config.pkg.extra && config.pkg.extra['webino-devkit']
        && config.pkg.extra['webino-devkit'].ZendSkeletonApplication
    ) {
        config.app_git_extra = 'cd <%= app.dir %> && git fetch --tags && git checkout tags/'
            + config.pkg.extra['webino-devkit'].ZendSkeletonApplication;
    }

    /**
     * Make extra directories
     */
    config.tasks.update.function.push('mkdir:app_log');
    config.tasks.update.function.push('mkdir:app_tmp');
};
