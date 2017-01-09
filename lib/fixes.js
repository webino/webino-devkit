module.exports = function (grunt) {

    // Fixing passing destpath to process function (cannot update grunt to 1.0 yet so fixing it like this)
    // Read a file, optionally processing its content, then write the output.
    grunt.file.copy = function(srcpath, destpath, options) {
        if (!options) { options = {}; }
        // If a process function was specified, and noProcess isn't true or doesn't
        // match the srcpath, process the file's source.
        var process = options.process && options.noProcess !== true &&
            !(options.noProcess && grunt.file.isMatch(options.noProcess, srcpath));
        // If the file will be processed, use the encoding as-specified. Otherwise,
        // use an encoding of null to force the file to be read/written as a Buffer.
        var readWriteOptions = process ? options : {encoding: null};
        // Actually read the file.
        var contents = grunt.file.read(srcpath, readWriteOptions);
        if (process) {
            grunt.verbose.write('Processing source...');
            try {
                contents = options.process(contents, srcpath, destpath);
                grunt.verbose.ok();
            } catch(e) {
                grunt.verbose.error();
                throw grunt.util.error('Error while processing "' + srcpath + '" file.', e);
            }
        }
        // Abort copy if the process function returns false.
        if (contents === false) {
            grunt.verbose.writeln('Write aborted.');
        } else {
            grunt.file.write(destpath, contents, readWriteOptions);
        }
    };
};
