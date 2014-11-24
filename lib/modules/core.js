/**
 * Setup core grunt config
 */
(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            config.varlib = {root: '/var/lib/webino'};
            config.varlib.php = config.varlib.root + '/php';
            config.varlib.isInit = function () { return !grunt.file.isFile(config.varlib.php + '/composer.phar'); };

            /**
             * Setup clean tasks
             */
            config.clean.log = {src: ['._log']};
            config.clean.git = {src: ['.git']};

            /**
             * Setup mkdir tasks
             */
            config.mkdir.log = {options: {create: ['._log', '._log/code-browser', '._log/coverage']}};

            /**
             * Setup exec tasks
             */
            config.exec.show_web = {
                cmd: 'google-chrome <%= test_app_uri %>'
            };

            // Selenium
            config.exec.selenium_start = {
                cmd: '/etc/init.d/selenium start && sleep 5s'
            };
            config.exec.selenium_test = {
                cmd: 'URI="' + (grunt.option('uri') || '<%= test_app_uri %>') + '" '
                     + 'BROWSER="<%= grunt.task.current.args[0] %>" '
                     + '<%= varlib.php %>/vendor/bin/phpunit -c tests/selenium'
            };
            config.exec.selenium_stop = {
                cmd: '/etc/init.d/selenium stop'
            };

            // System
            config.exec.get_composer = {
                cmd: 'wget -qO- https://getcomposer.org/installer | php'
            };
            config.exec.composer_self_update = {
                cmd: 'php composer.phar self-update'
            };
            config.exec.composer_update = {
                cmd: 'php composer.phar update --dev --no-interaction'
            };
            config.exec.composer_update_dev = {
                cmd: 'php composer.phar update --dev --no-interaction'
            };
            config.exec.link_precommit = {
                cmd: 'ln -s <%= basedir %>/pre-commit <%= basedir %>/.git/hooks/pre-commit && chmod +x <%= basedir %>/pre-commit'
            };

            // Git
            config.exec.git_init = {
                cmd: 'git init'
            };
            config.exec.git_add = {
                cmd: 'git add .'
            };
            config.exec.git_flow_init = {
                cmd: 'git flow init -d'
            };
            config.exec.git_push_origin_develop = {
                cmd: 'git push origin develop'
            };
            config.exec.git_push_origin_master = {
                cmd: 'git push origin master'
            };
            config.exec.git_remote_add_origin = {
                cmd: 'git remote add origin <%= github.webino.ssh  %>/<%= pkg.name %>.git'
            };

            // Github
            config.exec.github_create_repo = {
                cmd: '<%= github.api.cmd %>/orgs/webino/repos -X POST -d \'{"name": "<%= pkg.name %>"}\''
            };
            config.exec.github_delete_repo = {
                cmd: '<%= github.api.cmd %>/repos/webino/<%= pkg.name %> -X DELETE'
            };

            /**
             * Register grunt tasks
             */
            config.tasks.uat = {
                description: 'Run user acceptance tests',
                function: function (browser) {
                    browser || (browser = 'htmlunit');
                    grunt.task.run(['configure', 'selenium_test:' + browser]);
                }
            };

            config.tasks.selenium_test = {
                isSystem: true,
                description: 'Run Selenium tests',
                function: function (browser) {
                    browser || (browser = 'htmlunit');
                    grunt.task.run([
                        'exec:selenium_start',
                        'exec:selenium_test:' + browser,
                        'exec:selenium_stop'
                    ]);
                }
            };

            /**
             * Register system grunt tasks
             */
            config.tasks.init_composer = {
                isSystem: true,
                description: 'Initialize PHP composer',
                function: function() {
                    if (grunt.file.isFile('composer.phar')) {
                        grunt.log.ok('Updating composer.phar ...');
                        grunt.task.run('exec:composer_self_update');
                        return;
                    }
                    grunt.log.ok('Downloading composer.phar ...');
                    grunt.task.run('exec:get_composer');
                }
            };

            config.tasks.init_precommit = {
                isSystem: true,
                description: 'Initialize git pre-commit',
                function: function() {
                    if (!grunt.file.isDir('.git/hooks')) {
                        grunt.log.error('Git not initialized!');
                        return;
                    }
                    if (grunt.file.isLink('.git/hooks/pre-commit')) {
                        grunt.log.ok('Git pre-commit hook OK ...');
                        return;
                    }
                    grunt.log.ok('Installing git pre-commit hook ...');
                    grunt.task.run('exec:link_precommit');
                }
            };

            config.tasks.precommit = {
                isSystem: true,
                description: 'Git pre-commit',
                function: ['test']
            };
        };

        return config;
    })();
}).call(this);
