/** Git support */
module.exports = function (grunt, config) {
    /**
     * Cleanup
     */
    config.clean.git = {src: ['.git']};

    /**
     * Commands
     */
    config.exec.git_init      = {cmd: 'cd <%= grunt.task.current.args[0] %> && git init'};
    config.exec.git_status    = {cmd: 'cd <%= grunt.task.current.args[0] %> && git status'};
    config.exec.git_add       = {cmd: 'cd <%= grunt.task.current.args[0] %> && git add .'};
    config.exec.git_flow_init = {cmd: 'cd <%= grunt.task.current.args[0] %> && git flow init -d'};

    config.exec.git_push_origin_develop = {cmd: 'cd <%= grunt.task.current.args[0] %> && git push origin develop'};
    config.exec.git_push_origin_master  = {cmd: 'cd <%= grunt.task.current.args[0] %> && git push origin master'};
    config.exec.git_remote_add_origin   = {cmd: 'cd <%= grunt.task.current.args[0] %> && git remote add origin <%= grunt.task.current.args[1] %>'};

    config.exec.link_pre_commit = {
        cmd: 'rm -f <%= basedir %>/.git/hooks/pre-commit '
           + '&& ln -s <%= basedir %>/pre-commit <%= basedir %>/.git/hooks/pre-commit '
           + '&& chmod +x <%= basedir %>/pre-commit'
    };

    // Github
    config.exec.github_create_repo = {cmd: '<%= github.api.cmd %>/orgs/<%= github.vendor %>/repos -X POST -d \'{"name": "<%= pkg.camelCase %>"}\''};
    config.exec.github_delete_repo = {cmd: '<%= github.api.cmd %>/repos/<%= github.vendor %>/<%= pkg.camelCase %> -X DELETE'};

    /**
     * Tasks
     */
    config.tasks['pre-commit'] = {function: ['test']};

    config.tasks['init-pre-commit'] = {
        function: function () {
            if (!grunt.file.isDir('.git/hooks')) {
                grunt.log.error('Git not initialized!');
                return;
            }

            var path = '.git/hooks/pre-commit';

            if (grunt.file.isLink(path)) {
                grunt.log.ok('Git pre-commit hook OK ...');
                return;
            }

            grunt.log.ok('Installing git pre-commit hook ...');
            grunt.task.run('exec:link_pre_commit');
        }
    };
};
