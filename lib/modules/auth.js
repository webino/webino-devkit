module.exports = function config(grunt, config) {
    config.selenium.test.env =
        'IDENTITY="<%= userCfg.authentication.identity %>" '
        + 'CREDENTIAL="<%= userCfg.authentication.credential %>" '
        + config.selenium.test.env;
};
