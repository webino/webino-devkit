/** Database support */
module.exports = function (grunt, config) {

    config.database = {
        prefix: ['<%= grunt.option("dbprefix") %>', 'dev'],
        name: '<%= database.prefix.join("_") %>_<%= pkg.name %>',
        host: 'localhost',
        user: '<%= config.database.user %>',
        password: '<%= config.database.password %>'
    };

    config.exec.mysql_drop = {
        cmd: 'mysqladmin -f drop <%= grunt.task.current.args[0] %> || true'
    };

    config.exec.mysql_create = {
        cmd: '(mysqladmin -f create <%= grunt.task.current.args[0] %> '
        + '&& echo "Database \\"<%= grunt.task.current.args[0] %>\\" created") || true'
    };
};
