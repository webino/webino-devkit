exports.config = function config(grunt, modules) {
    var self = this;
    /**
     * Functions
     */
    this.registerTask = function (name) {
        var task = self.tasks[name];
        grunt.registerTask(name, task.description, task.function);
    };

    /**
    * Loading progress
    */
   this.loading = function () {
       self.loading.timeout = setTimeout(function () {
           grunt.log.write('.');
           self.loading();
       }, 500)
   };


    /**
     * Load user config
     */
    this.home = process.env['HOME'];
    this.user_cfg = this.home + '/.webino.json';
    // read user config
    this.config = grunt.file.exists(this.user_cfg) ? grunt.file.readJSON(this.user_cfg) : {};

    /**
     * Config properties
     */
    this.verbose = (-1 !== grunt.option.flags().indexOf('--verbose'));
    this.working_dir = grunt.option('working-dir');
    if (this.working_dir) {
        process.chdir(this.working_dir);
        // Load module package config,
        // when using global tool in module directory.
        this.package_file = this.working_dir + '/package.json';
        if (grunt.file.exists(this.package_file)) {
            this.pkg = grunt.file.readJSON(this.package_file);
            this.dashed_name = this.pkg.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        }

    } else {
        // Load module package config,
        // when using grunt in module directory.
        this.pkg = grunt.file.readJSON('package.json');
    }

    this.devkit = grunt.file.readJSON(__dirname + '/../package.json');
    this.basedir = require('path').resolve('.');
    this.data = {root: __dirname + '/../data'};
    this.data.php = this.data.root + '/php';

    /**
     * Available repositories
     *
     * Format: config.repositories.vendor.repo = {ssh: '', api: {}, ...}
     */
    var PriorityQueue = require('priorityqueuejs');
    this.repositories = new PriorityQueue(function (a, b) {
        return a.priority - b.priority;
    });

    this.repositories.enq({
        priority: 5,
        vendor: 'webino',
        name: 'github',
        ssh: 'git@github.com:webino',
        api: {
            uri: 'https://api.github.com',
            cmd: 'wget -user=<%= config.github.user %> --password=<%= github.api.uri %>'
        }
    });

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
    grunt.log.writeln('\n\Welcome to Webino Development Kit v' + this.devkit.version);

    // workspace directories
    this.workspace = {root: this.home + '/Webino'};
    this.workspace.www = this.workspace.root + '/www';
    this.workspace.modules = this.workspace.www + '/mods';
    this.workspace.sites = this.workspace.www + '/sites';

    /**
     * Init tasks
     */
    this.copy = {};
    this.exec = {};
    this.clean = {};
    this.mkdir = {};
    this.watch = {};
    this.wait_async = {};
    this.browserSync = {};

    /**
     * Load devkit modules
     */
    this.module_paths = {};
    this.setupDevkitModules = function (pathname) {
        var path  = require('path');
        var files = grunt.file.expand({filter: 'isFile'}, [pathname + '/modules/*.js']);
        files.forEach(function(filepath) {
            basename = path.basename(filepath);
            var key = basename.substr(0, basename.length - 3);
            if (!self.module_paths[key]) {
                self.module_paths[key] = [];
            }
            self.module_paths[key].push(filepath);
        });
    };

    /**
     * Setup additional devkit modules
     */
    if (this.config.modules) {
        self.verbose && grunt.log.writeln('=> loading devkit additional modules:');
        (function () {
            // When running from a local context by Gruntfile,
            // the NODE_PATH env var may not be configured,
            // so try to find modules by resolved NODE_PATH.
            var paths = process.env.NODE_PATH ? process.env.NODE_PATH.split(':') : [];
            self.config.modules.forEach(function (module) {
                self.verbose && grunt.log.writeln(module);

                var path;
                var subModule;
                for (var i = 0; i < paths.length; i++) {
                    path = paths[i];

                    try {
                        // trying to load a submodule
                        subModule = require(path + '/' + module);
                        subModule.config(grunt, self, modules);
                    } catch(exc) {}

                    // break within try catch won't work
                    if (subModule) {
                        break;
                    }
                }
            });
        })();
    }

    /**
     * Setup devkit modules
     */
    this.setupDevkitModules(__dirname);
    modules.unshift('core');
    self.verbose && grunt.log.writeln('=> loading devkit modules:');
    (function () {
        for (var i = 0; i < modules.length; i++) {
            self.verbose && grunt.log.writeln(modules[i]);
            if (!self.module_paths[modules[i]]) {
                grunt.fail.wrarn('Module "' + modules[i] + '" not found');
                return;
            }

            self.module_paths[modules[i]].reverse().forEach(function (path) {
                (function () {
                    return require(path);
                })().config(grunt, self, modules);
            });
        }
    })();

    /**
     * Register grunt tasks
     */
    Object.keys(this.tasks).forEach(function (name) {
        self.registerTask(name);
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
            config.verbose && grunt.log.writeln('=> loading & registering : ' + path);
            require(path)(grunt);
        });
    })();

    return this;
};
