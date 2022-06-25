module.exports = function config(grunt, config) {
    /**
     * Application settings
     */
    config.app.name       = 'WebinoSkeletonApplication';
    config.app.autoloader = 'autoloader.php';
    config.app.git.origin = 'https://github.com/webino';
    config.app.git.branch = 'develop';
};
