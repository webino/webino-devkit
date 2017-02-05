/** Common core */
module.exports = function (grunt, config) {

    /**
     * Build support
     */
    config.tasks['init-build'] = {
        exec: [],
        function: function () {
            config.isBuild = true;
            console.log(config.tasks['init-build'].exec);
            config.tasks['init-build'].exec.forEach(function (fc) { fc(); });
        }
    };
};
