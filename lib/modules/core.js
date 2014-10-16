(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            /**
             * Setup core grunt config
             */
            config.github = {
                api: {uri: 'https://api.github.com'},
                webino: {ssh: 'git@github.com:webino'}
            };

            config.github.api.cmd = 'curl -u ' + config.config.github.user + ' ' + config.github.api.uri,

            // workspace directories
            config.workspace = {root: '/var/www/public/webino'};
            config.workspace.modules = config.workspace.root + '/modules';
            config.workspace.sites = config.workspace.root + '/sites';

            /**
             * Setup clean tasks
             */
            config.clean = {
                log: {src: ['._log']},
                git: {src: ['.git']}
            };

            /**
             * Setup mkdir tasks
             */
            config.mkdir = {
                log: {options: {create: ['._log', '._log/code-browser', '._log/coverage']}},
                workspace: {options: {create: ['<%= workspace.root %>', '<%= workspace.modules %>', '<%= workspace.sites %>']}}
            };

            /**
             * Setup exec tasks
             */
            config.exec = {
                show_web: {
                    cmd: 'google-chrome <%= test_app_uri %>'
                },

                // Selenium
                selenium_start: {
                    cmd: 'sudo /etc/init.d/selenium start && sleep 5s'
                },
                selenium_test: {
                    cmd: 'URI="' + (grunt.option('uri') || '<%= test_app_uri %>') + '" '
                         + '<%= resources.php.path %>/vendor/bin/phpunit -c tests/selenium'
                },
                selenium_stop: {
                    cmd: 'sudo /etc/init.d/selenium stop'
                },

                // System
                npm_install: {
                    cmd: 'npm install'
                },
                get_composer: {
                    cmd: 'curl -sS https://getcomposer.org/installer | php'
                },
                composer_self_update: {
                    cmd: 'php composer.phar self-update'
                },
                composer_update: {
                    cmd: 'php composer.phar update --dev --no-interaction'
                },
                composer_update_dev: {
                    cmd: 'php composer.phar update --dev --no-interaction'
                },
                link_precommit: {
                    cmd: 'ln -s <%= basedir %>/pre-commit <%= basedir %>/.git/hooks/pre-commit && chmod +x <%= basedir %>/pre-commit'
                },

                // Git
                git_init: {
                    cmd: 'git init'
                },
                git_add: {
                    cmd: 'git add .'
                },
                git_flow_init: {
                    cmd: 'git flow init -d'
                },
                git_push_origin_develop: {
                    cmd: 'git push origin develop'
                },
                git_push_origin_master: {
                    cmd: 'git push origin master'
                },
                git_remote_add_origin: {
                    cmd: 'git remote add origin <%= github.webino.ssh  %>/<%= pkg.name %>.git'
                },

                // Github
                github_create_repo: {
                    cmd: '<%= github.api.cmd %>/orgs/webino/repos -X POST -d \'{"name": "<%= pkg.name %>"}\''
                },
                github_delete_repo: {
                    cmd: '<%= github.api.cmd %>/repos/webino/<%= pkg.name %> -X DELETE'
                }
            };

            /**
             * Register grunt tasks
             */

            // TODO implement

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
