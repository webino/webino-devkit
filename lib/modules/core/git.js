/** Git support */
module.exports = function (grunt, config) {

    config.clean.git = {src: ['.git']};

    config.exec.link_precommit = {
        cmd: 'ln -s <%= basedir %>/pre-commit <%= basedir %>/.git/hooks/pre-commit '
        + '&& chmod +x <%= basedir %>/pre-commit'
    };

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
        cmd: 'git remote add origin <%= github.webino.ssh  %>/<%= pkg.camelCase %>.git'
    };

    config.tasks.precommit = {
        isSystem: true,
        description: 'Git pre-commit',
        function: ['test']
    };

    config.tasks.init_precommit = {
        isSystem: true,
        description: 'Initialize git pre-commit',
        function: function () {
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

    // Github
    // TODO vendor name substitution
    config.exec.github_create_repo = {
        cmd: '<%= github.api.cmd %>/orgs/webino/repos -X POST -d \'{"name": "<%= pkg.camelCase %>"}\''
    };
    config.exec.github_delete_repo = {
        cmd: '<%= github.api.cmd %>/repos/webino/<%= pkg.camelCase %> -X DELETE'
    };
};
