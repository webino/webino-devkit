module.exports = function config(grunt, config) {
    /**
     * App context init
     */
    config.pkg.appName = config.pkg.dashCase.replace('-src', '');
    grunt.log.writeln('\n\You are developing an application: ' + config.pkg.appName);

    /**
     * App properties
     */
    config.app.dir = '<%= basedir %>';
    config.app.public.dir = '<%= app.dir %>/public';
    config.app.uri = config.local.uri + '/apps/' + config.fs.path.basename(config.working_dir) + '/public/';

    /**
     * Commands
     */
    config.exec.show_app = {cmd: 'sensible-browser <%= app.uri %>'};
    config.exec.show_log = {cmd: 'sensible-browser file://<%= app.dir %>/data/log'};

    /**
     * Show application
     */
    config.tasks.show = {
        description: 'Show application in a web browser',
        function: ['exec:show_app', 'exec:show_log']
    };

    /**
     * Application environment configuration
     */
    config.tasks.configure = {
        description: 'Configure Webino application development environment',
        function: ['exec:app_config_dev:<%= app.dir %>']
    };

    /**
     * Application development environment update
     */
    config.tasks.update = {
        description: 'Update application development environment',
        function: [
            'clean:app_cache',
            'exec:composer_update_dev',
            'configure'
        ]
    };

    /**
     * Application build
     */
    config.tasks['build'] = {
        description: 'Build Webino application',
        function: []
    };
};
