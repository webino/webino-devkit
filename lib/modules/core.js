exports.config = (function () {
    function config(grunt, config) {

        // Configuration
        config.utils = {root: '/var/lib/webino'};
        config.utils.php = config.utils.root + '/php';
        config.utils.isInit = function () { return !grunt.file.isFile(config.utils.php + '/composer.phar'); };

        // Include tasks
        require(__dirname + '/core/composer.js')(grunt, config);
        require(__dirname + '/core/database.js')(grunt, config);
        require(__dirname + '/core/git.js')(grunt, config);
        require(__dirname + '/core/selenium.js')(grunt, config);

        // Define tasks
        config.clean.log = {src: ['._log']};
        config.mkdir.log = {options: {mode: 2770, create: ['._log', '._log/code-browser', '._log/coverage']}};

        /**
         * Opens test application in a web browser
         * @todo configurable browser
         */
        config.exec.show_web = {
            cmd: 'google-chrome <%= test_app_uri %>'
        };

        /**
         * Starts PHP built-in server
         */
        config.exec.server = {
            cmd: 'echo "" && echo "    http://localhost:' + config.resolvePortOption() + '/" && echo "" '
            + '&& cd <%= test_app_path %>/public && php -S localhost:' + config.resolvePortOption()
        };
    }

    return config;
})();
