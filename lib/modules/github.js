/** Github support */
exports.config = (function () {
    function config(grunt, config) {
        var ghPagesDir = '._tmp/gh-pages';
        var ghPagesTmp = '._tmp/gh-pages-tmp';

        config['gh-pages'] = {
            options: {
                base: ghPagesTmp,
                clone: ghPagesDir,
                only: 'api',
                user: {
                    name: 'Webino, s. r. o.',
                    email: 'info@webino.sk'
                }
            },
            src: ['**']
        };

        if (process.env.GH_REF) {
            config['gh-pages'].options.repo = 'https://' + process.env.GH_TOKEN + '@' + process.env.GH_REF;
            config['gh-pages'].options.silent = true;
        }

        config.clean['gh-pages'] = {src: [ghPagesDir, ghPagesTmp]};

        config.copy['gh-pages-api'] = {
            files: [{
                expand: true,
                cwd: '._api',
                src: ['**'],
                dest: ghPagesTmp + '/api'
            }]
        };

        config.tasks['publish-gh-pages'] = {
            description: 'Publish Github pages',
            function: [
                'clean:gh-pages',
                'copy:gh-pages-api',
                'gh-pages'
            ]
        };
    }

    return config;
})();
