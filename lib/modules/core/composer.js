/** Composer support */
module.exports = function (grunt, config) {

    /**
     * Commands
     */
    config.exec.get_composer         = {cmd: 'wget -qO- https://getcomposer.org/installer | php'};
    config.exec.composer_self_update = {cmd: 'php <%= utils.php %>/composer.phar self-update'};
    config.exec.composer_update      = {cmd: 'COMPOSER_DISCARD_CHANGES=true php <%= utils.php %>/composer.phar update -n --prefer-dist --no-dev --no-plugins --no-scripts'};
    config.exec.composer_update_dev  = {cmd: 'COMPOSER_DISCARD_CHANGES=true php <%= utils.php %>/composer.phar update -n --prefer-dist --no-plugins --no-scripts'};

    /**
     * Tasks
     */
    config.tasks['update-vendor'] = {
        description: 'Just vendor source update',
        function: ['exec:composer_update_dev']
    };
};
