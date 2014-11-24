/**
 * Setup grunt config for github support
 */
(function() {
    exports.config = config = (function() {
        function config(grunt, config) {
            var ghPagesDir = '._tmp/gh-pages';
            /**
             * Register github tasks
             */
            config['gh-pages'] = {
                options: {
                    base: '._gh-pages',
                    clone: ghPagesDir,
                    add: true,
                    user: {
                        name: 'Webino, s .r .o.',
                        email: 'info@webino.sk'
                    }
                },
                src: ['**']
            };

            /**
             * Setup clean tasks
             */
            config.clean['gh-pages-api'] = {src: ['._gh-pages/api']};
            config.clean['gh-pages-clone'] = {src: [ghPagesDir]};

            /**
             * Setup copy tasks
             */
            config.copy['gh-pages-api'] = {
                files: [{
                    expand: true,
                    cwd: '._api',
                    src: ['**'],
                    dest: '._gh-pages/api'
                }]
            };

            /**
             * Waiting for gh-pages clone
             */
            config.wait_async['gh-pages'] = {
                options: {
                    wait: function (done) {
                        var func = function () {
                            if (grunt.file.isDir(ghPagesDir + '/.git')) {
                                grunt.task.run(['exec:gh-pages-configure']);
                                done();
                            } else {
                                setTimeout(func, 25);
                            }
                        };
                        func();
                    }
                }
            };

            /**
             * Setup concurrent tasks
             */
            config.concurrent['gh-pages'] = ['wait_async:gh-pages', 'gh-pages'];

            /**
             * Setup exec tasks
             */
            config.exec['gh-pages-configure'] = {
                cmd: (process.env.GH_TOKEN === undefined) ? 'exit' : 'cd ' + ghPagesDir + ' && '
                   + 'echo "https://' + process.env.GH_TOKEN + '@github.com" > .git/credentials && '
                   + 'git config credential.helper "store --file=.git/credentials"'
            };

            /**
             * Register grunt tasks
             */
            config.tasks['publish-gh-pages'] = {
                description: 'Publish Github pages',
                function: ['clean:gh-pages-api', 'copy:gh-pages-api', 'clean:gh-pages-clone', 'concurrent:gh-pages']
            };
        };

        return config;
    })();
}).call(this);
