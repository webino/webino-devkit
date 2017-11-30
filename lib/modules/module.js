module.exports = function config(grunt, config) {
    grunt.log.writeln('\n\You are developing a package: ' + config.pkg.camelCase);

    /**
     * Test app properties
     */
    config.app.dir = '<%= basedir %>/._test/<%= app.name %>';
    config.app.public.dir = '<%= app.dir %>/public';
    config.app.uri = config.local.uri + '/mods/<%= pkg.camelCase %>/._test/<%= app.name %>/public/';

    /**
     * Setup tools
     */
    config.exec.show_app  = {cmd: 'sensible-browser <%= app.uri %>'};
    config.exec.show_log  = {cmd: 'sensible-browser file://<%= app.dir %>/data/log'};
    config.exec.show_api  = {cmd: 'sensible-browser file://<%= basedir %>/._api/index.html'};
    config.exec.didef     = {cmd: 'php bin/definition_generator.php'};
    config.exec.add_didef = {cmd: 'git add data/di'};

    /**
     * Setup test app tools
     */
    config.exec.app_clean = {cmd: 'rm -rf <%= app.dir %>'};
    config.exec.app_make  = {cmd: 'git clone <%= app.git.origin %>/<%= app.name %>.git --branch <%= app.git.branch %> --depth 1 <%= app.dir %>;<%= app_git_extra %>'};

    config.exec.app_link_autoloader = {cmd: 'ln -s <%= basedir %>/tests/resources/<%= app.autoloader %> <%= app.dir %>/<%= app.autoloader %>'};
    config.exec.app_link_vendor     = {cmd: 'ln -s <%= basedir %>/vendor <%= app.dir %>/vendor'};
    config.exec.app_link_cfg        = {cmd: 'ln -s <%= basedir %>/tests/resources/config/application.config.php <%= app.dir %>/config/application.config.php'};

    /**
     * Tasks
     */
    config.tasks.show = {
        description: 'Show the package in a web browser',
        function: ['exec:show_app', 'exec:show_log']
    };

    config.tasks['make-test-app'] = {function: ['exec:app_make']};

    config.tasks['init-test-app'] = {
        function: [
            'exec:app_clean',
            'make-test-app',
            'clean:app_autoloader',
            'exec:app_link_autoloader',
            'clean:app_vendor',
            'exec:app_link_vendor',
            'clean:app_cfg',
            'exec:app_link_cfg'
        ]
    };

    config.tasks.update = {
        description: 'Update development environment',
        function: [
            'mkdir:test',
            'init-pre-commit',
            'init-test-app',
            'exec:composer_update_dev',
            'configure'
        ]
    };

    config.tasks.dev = {
        description: 'Develop the package',
        function: ['watch']
    };

    config.tasks['live-dev'] = {
        description: 'Develop the package with BrowserSync',
        function: ['browserSync', 'dev']
    };

    config.tasks.configure = {
        description: 'Configure Webino module development environment',
        function: []
    };

    config.tasks.uat = {
        description: 'Run user acceptance tests',
        function: function () {
            var browser = grunt.config.process('<%= grunt.template.browserOption() %>');
            grunt.task.run(['configure', 'selenium:' + browser]);
        }
    };
};
