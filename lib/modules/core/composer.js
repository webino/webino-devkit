/** Composer support */
module.exports = function (grunt, config) {

    config.exec.get_composer = {
        cmd: 'wget -qO- https://getcomposer.org/installer | $(which php)'
    };

    config.exec.composer_self_update = {
        cmd: '$(which php) <%= utils.php %>/composer.phar self-update'
    };

    config.exec.composer_update = {
        cmd: 'COMPOSER_DISCARD_CHANGES=true $(which php) <%= utils.php %>/composer.phar update -n --prefer-dist --no-dev'
    };

    config.exec.composer_update_dev = {
        cmd: 'COMPOSER_DISCARD_CHANGES=true $(which php) <%= utils.php %>/composer.phar update -n --prefer-dist'
    };
};
