module.exports = function config(grunt, config) {
    config.selenium.test.env =
        'IDENTITY="<%= config.authentication.identity %>" '
        + 'CREDENTIAL="<%= config.authentication.credential %>" '
        + config.selenium.test.env;
};
