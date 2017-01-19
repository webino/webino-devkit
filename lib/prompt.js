module.exports = function (grunt) {
    var prompt = require('prompt');

    // support prompt override by options
    prompt.override = grunt.cli.options;

    /**
     * Multiline prompt support
     * @returns {*}
     */
    prompt.getMultiLine = function (label) {
        var readLine = require('readline').createInterface({
            input:  process.stdin,
            output: process.stdout,
            prompt: label + ': '
        });
        readLine.setPrompt(label + ': ');
        readLine.prompt('test');
        return readLine;
    };

    return prompt;
};
