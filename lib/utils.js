/**
 * Extra require
 */
exports.version = require(__dirname + '/utils/version.js');

/**
 * Escape regular expression
 * @param str
 * @returns str
 */
exports.escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
