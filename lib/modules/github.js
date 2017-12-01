module.exports = function config(grunt, config) {
    var ghPagesDir = '._tmp/gh-pages';
    var ghPagesTmp = '._tmp/gh-pages-tmp';

    config['gh-pages'] = {
        options: {
            base:  ghPagesTmp,
            clone: ghPagesDir,
            only:  ['index.md', 'api'],

            user: {
                name:  'Webino, s. r. o.',
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

    config.mkdir.gh_pages = {
        options: {create: [ghPagesTmp]}
    };

    config.exec.gh_pages_index = {cmd: 'cp -f README.md ' + ghPagesTmp + '/index.md'};

    config.copy['gh-pages-index'] = {
        files: [{
            expand: true,
            cwd:   '.',
            src:   ['README.md'],
            dest:  ghPagesTmp + '/index.md'
        }]
    };

    config.copy['gh-pages-api'] = {
        files: [{
            expand: true,
            cwd:   '._api',
            src:   ['**'],
            dest:  ghPagesTmp + '/api'
        }]
    };

    config.tasks['publish-gh-pages'] = {
        description: 'Publish GitHub pages',
        function: [
            'clean:gh-pages',
            'mkdir:gh_pages',
            'exec:gh_pages_index',
            'copy:gh-pages-api',
            'gh-pages'
        ]
    };

    config.tasks.publish = {
        description: 'Publish module to a GitHub repository',
        function: function () {
            // Recreate github repo
            grunt.task.run([
                'exec:github_delete_repo',
                'exec:github_create_repo'
            ]);

            // Initialize git & push
            grunt.task.run([
                'clean:git',
                'exec:git_add:.',
                'exec:git_flow_init:.',
                'exec:git_remote_add_origin:.:<%= github.webino.ssh  %>/<%= pkg.camelCase %>.git',
                'exec:git_push_origin_develop:.',
                'exec:git_push_origin_master:.'
            ]);
        }
    };
};
