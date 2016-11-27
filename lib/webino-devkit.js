/** Webino Development Kit */
exports.config = function config(grunt, modules) {
    var self = this;

    require('shelljs/global');

    this.fs      = require('fs');
    this.fs.file = require('file');
    this.cp      = require('child_process');

    /**
     * Priority queue init
     */
    var PriorityQueue = require('priorityqueuejs');
    PriorityQueue.prioritySort = function (a, b) {
        return a.priority - b.priority;
    };

    /**
     * Register a task from config to grunt
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
        }, 500);
    };

    this.loading.stop = function () {
        clearTimeout(self.loading.timeout);
    };

    // TODO redesign options resolving to a config
    this.resolveUriOption = function ()
    {
        process.env.URI && grunt.option('uri', process.env.URI);
        return (grunt.option('uri') || '<%= test_app_uri %>')
    };
    this.resolvePortOption = function ()
    {
        process.env.PORT && grunt.option('port', process.env.PORT);
        return (grunt.option('port') || '8000')
    };
    this.resolveBrowserOption = function (browser)
    {
        process.env.BROWSER && (browser = process.env.BROWSER);
        browser || (browser = 'firefox');
        return browser;
    };

    // Write the PID file
    (function () {
        var pidFile = grunt.option('pid-file');
        if (pidFile) {
            grunt.log.ok('Writing PID: ' + pidFile);
            grunt.file.write(pidFile, process.pid);
        }
    })();

    /**
     * Load user config
     * @todo refactor
     */
    this.root     = __dirname + '/..';
    this.user     = process.env.USER;
    this.home     = process.env.HOME;
    this.user_cfg = this.home + '/.webino.json';
    this.config   = grunt.file.exists(this.user_cfg) ? grunt.file.readJSON(this.user_cfg) : {};

    /**
     * Config properties
     */
    this.verbose      = (-1 !== grunt.option.flags().indexOf('--verbose'));
    this.package_file = 'composer.json';
    this.working_dir  = grunt.option('working-dir');

    if (this.working_dir) {
        process.chdir(this.working_dir);
        // Load module package config,
        // when using global tool in module directory.
        this.package_file = this.working_dir + '/' + this.package_file;
    }

    if (grunt.file.exists(this.package_file)) {
        this.pkg = grunt.file.readJSON(this.package_file);
        this.pkg.dashCase = (-1 !== this.pkg.name.indexOf('/')) ? this.pkg.name.split('/', 2)[1] : this.pkg.name;
        this.pkg.camelCase = this.pkg.dashCase.split('-').map(function (val) {
            return val.charAt(0).toUpperCase() + val.slice(1);
        }).join('');
    }

    this.webino     = {};
    this.devkit     = grunt.file.readJSON(__dirname + '/../package.json');
    this.basedir    = require('path').resolve('.');
    this.data       = {root: __dirname + '/../data'};
    this.data.utils = this.data.root + '/utils';
    this.data.workspace = this.data.root + '/workspace';

    /**
     * On fail handlers
     *
     * Format: config.onFail.enq({priority: 1, callback: function () {}});
     */
    this.onFail = new PriorityQueue(PriorityQueue.prioritySort);

    /**
     * Available repositories
     *
     * Format: config.repositories.vendor.repo = {ssh: '', api: {}, ...}
     */
    this.repositories = new PriorityQueue(PriorityQueue.prioritySort);
    this.repositories.enq({
        priority: 5,
        vendor:   'webino',
        name:     'github',
        ssh:      'git@github.com:webino',
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

    /**
     * System info
     */
    try {
        this.system = exec('lsb_release -d', {silent: true}).output.split('Description:')[1].trim();
        grunt.log.writeln('\n' + this.system);
    } catch (exc) {}

    // workspace directories
    this.workspace = {root: this.home + '/Webino'};
    this.workspace.www = this.workspace.root + '/www';
    this.workspace.modules = this.workspace.www + '/mods';
    this.workspace.apps = this.workspace.www + '/apps';

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
    this.concurrent = {};
    this['string-replace'] = {};

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
            self.module_paths[key] || (self.module_paths[key] = []);
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
            self.verbose && grunt.log.writeln('=> loading & registering : ' + path);
            require(path)(grunt);
        });
    })();

    /**
     * Fail handler
     */
    (function () {
        var onFail = function (e) {
            if (self.failed) {
                return;
            }
            self.failed = true;
            self.onFail.forEach(function (item) {
                item.callback(e.toString())
            });
        };

        var failFatal = grunt.fail.fatal;
        grunt.fail.fatal = function (e, errcode) {
            onFail(e);
            failFatal(e, errcode);
        };

        var failWarn = grunt.fail.warn;
        grunt.fail.warn = function (e, errcode) {
            onFail(e);
            failWarn(e, errcode);
        };
    })();

    return this;
};
