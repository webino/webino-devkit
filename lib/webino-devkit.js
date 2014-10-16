exports.config = function config(grunt, modules) {
    var self = this;
    /**
     * Load user config
     */
    this.home = process.env['HOME'];
    this.user_cfg = this.home + '/.webino.json';
    this.config = grunt.file.exists(this.user_cfg) ? grunt.file.readJSON(this.user_cfg) : {};

    /**
     * Config properties
     */
    this.node_path = process.env.NODE_PATH ? process.env.NODE_PATH : '/usr/local/lib/node_modules';
    this.verbose = (-1 !== grunt.option.flags().indexOf('--verbose'));

    this.working_dir = grunt.option('working-dir');
    if (this.working_dir) {
        process.chdir(this.working_dir);
        // Load module package config,
        // when using global tool in module directory
        this.package_file = this.working_dir + '/package.json';
        if (grunt.file.exists(this.package_file)) {
            this.pkg = grunt.file.readJSON(this.package_file);
            this.dashed_name = this.pkg.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        }

    } else {
        // Load module package config,
        // when using grunt in module directory
        this.pkg = grunt.file.readJSON('package.json');
    }

    this.devkit = grunt.file.readJSON(__dirname + '/../package.json');
    this.basedir = require('path').resolve('.');
    this.resources = {
        php: {path: __dirname + '/../resources/php'}
    };

    /**
     * Add tasks to this property
     *
     * @example Register grunt task
     *
     *      config.tasks.customTaskName = {
     *          description: 'Custom task description',
     *          function: ['exec:show_web', 'exec:show_log']
     *      };
     *
     *      config.tasks.customTaskName = {
     *          description: 'Custom task description',
     *          function: function () {}
     *      };
     */
    this.tasks = {};

    /**
     * Tasks help
     */
    this.showTasksHelp = function () {
        grunt.log.writeln(' ');

        Object.keys(self.tasks).forEach(function (name) {
            var task = self.tasks[name];
            if (!task.isSystem) {
                grunt.log.writeln(' webino ' + name + ' \n\ - ' + task.description);
                if (task.examples) {
                    grunt.log.writeln('   examples:');
                    for (var j = 0; j < task.examples.length; j++) {
                        grunt.log.writeln('   ' + task.examples[j]);
                    }
                }
                grunt.log.writeln(' ');
            }
        });
    };

    /**
     * Setup devkit
     */
    grunt.log.writeln('Welcome to Webino Development Kit v' + this.devkit.version);

    this.module_paths = {};
    var setupDevkitModule = function (dirname) {
        var basename;
        var path  = require('path');
        var files = grunt.file.expand({filter: 'isFile'}, [dirname + '/lib/modules/*.js']);

        files.forEach(function(_path) {
            basename = path.basename(_path);
            var key = basename.substr(0, basename.length - 3);
            self.module_paths[key] = _path;
        });
    };

    /**
     * Setup devkit additional modules
     */
    if (this.config.modules) {
        self.verbose && grunt.log.writeln('=> loading devkit additional modules:');
        for (var i = 0; i < this.config.modules.length; i++) {
            (function () {
                self.verbose && grunt.log.writeln(self.config.modules[i]);
                var path = self.config.modules[i];
                path = ('/' !== path[0]) ? self.node_path + '/' + path : path;
                setupDevkitModule(path);
                return require(path);
            })().config(grunt, modules, this);
        }
    }

    /**
     * Setup devkit modules
     */
    setupDevkitModule(__dirname + '/..');
    modules.unshift('core');
    self.verbose && grunt.log.writeln('=> loading devkit modules:');
    for (var i = 0; i < modules.length; i++) {
        (function () {
            self.verbose && grunt.log.writeln(modules[i]);
            return require(self.module_paths[modules[i]]);
        })().config(grunt, this);
    }
    delete modules;

    /**
     * Register grunt tasks
     */
    Object.keys(this.tasks).forEach(function (name) {
        var task = self.tasks[name];
        grunt.registerTask(name, task.description, task.function);
    });

    /**
     * Autoloading tasks
     */
    (function () {
        var locations = [
            __dirname + '/../node_modules/**/tasks/*.js',
            __dirname + '/../node_modules/**/tasks/*.coffee'
        ];
        var files = grunt.file.expand({filter: 'isFile'}, locations);
        files.forEach(function(path) {
            if (config.verbose) {
                grunt.log.writeln('=> loading & registering : ' + path);
            }
            require(path)(grunt);
        });
    })();

    return this;
};
