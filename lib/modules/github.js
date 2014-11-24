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
                        name: 'Webino, s. r. o.',
                        email: 'info@webino.sk'
                    }
                },
                src: ['**']
            };

            var ghRef = grunt.option('gh-ref');
            if (ghRef) {
                config['gh-pages'].options.repo = 'https://' + grunt.option('gh-token') + '@' + ghRef;
                config['gh-pages'].options.silent = true;
            }

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
             * Register grunt tasks
             */
            config.tasks['publish-gh-pages'] = {
                description: 'Publish Github pages',
                function: ['clean:gh-pages-api', 'copy:gh-pages-api', 'clean:gh-pages-clone', 'gh-pages']
            };
        };

        return config;
    })();
}).call(this);
