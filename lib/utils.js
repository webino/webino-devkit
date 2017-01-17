/**
 * Extra require
 */
exports.version = require(__dirname + '/utils/version.js');

/**
 * Merge two objects
 * @param origin
 * @param add
 * @returns {*}
 */
exports.extend = function(origin, add) {
    if (!add || (typeof add !== 'object' && add !== null)){
        return origin;
    }

    var keys = Object.keys(add);
    var i = keys.length;
    while(i--){
        origin[keys[i]] = add[keys[i]];
    }
    return origin;
};

/**
 * Escape regular expression
 * @param str
 * @returns str
 */
exports.escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
