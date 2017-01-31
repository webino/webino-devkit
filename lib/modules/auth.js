module.exports = function config(grunt, config) {
    config.selenium.test.env.push('IDENTITY="<%= userCfg.authentication.identity %>"');
    config.selenium.test.env.push('CREDENTIAL="<%= userCfg.authentication.credential %>"');
};
