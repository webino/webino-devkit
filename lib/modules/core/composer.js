/** Composer support */
module.exports = function (grunt, config) {

    config.exec.get_composer = {
        cmd: 'wget -qO- https://getcomposer.org/installer | php'
    };

    config.exec.composer_self_update = {
        cmd: 'php composer.phar self-update'
    };

    config.exec.composer_update = {
        cmd: 'php composer.phar update -n'
    };

    config.exec.composer_update_dev = {
        cmd: 'php composer.phar update -n'
    };

    config.tasks.init_composer = {
        isSystem: true,
        description: 'Initialize PHP composer',
        function: function () {
            if (grunt.file.isFile('composer.phar')) {
                grunt.log.ok('Updating composer.phar ...');
                grunt.task.run('exec:composer_self_update');
                return;
            }
            grunt.log.ok('Downloading composer.phar ...');
            grunt.task.run('exec:get_composer');
        }
    };
};
