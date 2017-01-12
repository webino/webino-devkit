module.exports = function config(grunt, config, modules) {

    /**
     * Core configuration
     */
    config.utils.root   = '/var/lib/webino';
    config.utils.php    = config.utils.root + '/php';
    config.utils.isInit = function () { return !grunt.file.isFile(config.utils.php + '/composer.phar'); };

    /**
     * Default properties
     */
    config.app    = {git: {}, public: {}, data: {cache: {dir: '<%= app.dir %>/data/cache'}}};
    config.module = {git: {}};
    config.local  = {};

    /**
     * Include tasks
     */
    require(__dirname + '/core/composer.js')(grunt, config);
    require(__dirname + '/core/database.js')(grunt, config);
    require(__dirname + '/core/git.js')(grunt, config);
    require(__dirname + '/core/selenium.js')(grunt, config, modules);

    /**
     * Options resolvers
     */
    grunt.template.serverPortOption = function ()
    {
        var port = 8000;

        // parse port from URI
        if (process.env.URI) {
            var matches = process.env.URI.match(/:([0-9]{4})\//);
            matches[1] && (port = matches[1]);
        }

        grunt.option('port', port);
        return port;
    };

    /**
     * Default task
     */
    config.tasks.default = {function: config.showTasksHelp};

    /**
     * Setup clean tasks
     */
    config.clean.log = {src: ['._log']};
    config.clean.api = {src: ['._api']};

    config.clean.app_cfg        = {src: ['<%= app.dir %>/config/application.config.php']};
    config.clean.app_cache      = {src: ['<%= app.dir %>/data/cache/*']};
    config.clean.app_vendor     = {src: ['<%= app.dir %>/vendor']};
    config.clean.app_autoloader = {src: ['<%= app.dir %>/<%= app.autoloader %>']};

    /**
     * Setup directories tasks
     */
    config.mkdir.log     = {options: {create: ['._log', '._log/code-browser', '._log/coverage']}};
    config.mkdir.test    = {options: {create: ['._test']}};
    config.mkdir.app_log = {options: {create: ['<%= app.dir %>/data/log']}};
    config.mkdir.app_tmp = {options: {create: ['<%= app.dir %>/tmp/common']}};

    /**
     * Opens test application in a web browser
     */
    config.exec.show_app = {cmd: 'sensible-browser <%= app.uri %>'};

    /**
     * Starts PHP built-in server
     */
    config.exec.server = {
        cmd: 'echo "" && (echo "    http://localhost:<%= grunt.template.serverPortOption() %>/" && echo "" '
           + '&& cd <%= app.dir %>/public && php -S localhost:<%= grunt.template.portOption() %> &) || true'
    };

    config.exec['stop-server'] = {
        cmd: 'echo "" && (echo "    http://localhost:<%= grunt.template.serverPortOption() %>/" && echo "" '
        + '&& kill $(ps aux | grep \'[l]ocalhost:<%= grunt.template.serverPortOption() %>\' | awk \'{print $2}\') 2> /dev/null &) || true'
    };

    /**
     * Remove empty dirs
     */
    config.exec.remove_empty_dirs = {cmd: 'find <%= grunt.task.current.args[0] %> -type d -empty -delete'};

    /**
     * Configure application development environment
     */
    config.exec.app_config_dev = {
        cmd: '[ -f config/autoload/local.php ] || ('
        + 'cd <%= grunt.task.current.args[0] %> && '
        + 'cp config/autoload/local.php.dist config/autoload/local.php)'
    };

    /**
     * Common fail task
     */
    config.tasks.fail = {function: grunt.fatal};

    /**
     * Setup local URI
     */
    (function () {
        // If the user name is webino we expects that development environment
        // is located on the webino.local domain, otherwise webino.<user> is expected
        var suffix = config.user !== 'webino' ? config.user : 'local';
        config.local.uri = 'http://webino.' + suffix;
    })();
};
