/** Database support */
module.exports = function (grunt, config) {

    config.database = {
        prefix: ['<%= grunt.option("dbprefix") %>', 'dev'],
        name: '<%= grunt.template.databaseName() %>',
        host: 'localhost',
        user: '<%= userCfg.database.user %>',
        password: '<%= userCfg.database.password %>',

        exists: function () {
            return Boolean(exec('mysql --execute="SHOW DATABASES LIKE \'<%= database.name %>\'"').output.trim());
        }
    };

    grunt.template.databaseName = function () {
        var empty  = function(v){ return v !== '' };
        var prefix = grunt.config('database.prefix').filter(empty).join('_');
        return prefix + '_' + grunt.config('pkg.camelCase');
    };

    config.exec.mysql_drop = {
        cmd: 'mysqladmin -f drop <%= grunt.task.current.args[0] %> || true'
    };

    config.exec.mysql_create = {
        cmd: '(mysqladmin -f create <%= grunt.task.current.args[0] %> '
        + '&& echo "Database \\"<%= grunt.task.current.args[0] %>\\" created") || true'
    };
};
