function Version() {

    this.parseTag = function (tag) {
        return tag.split('.');
    };

    this.createTag = function (versions) {
        return versions.join('.');
    };

    this.bumpMajor = function (tag) {
        var versions = this.parseTag(tag);
        versions[0]++;
        versions[1] = 0;
        versions[2] = 0;
        return this.createTag(versions);
    };

    this.bumpMinor = function (tag) {
        var versions = this.parseTag(tag);
        versions[1]++;
        versions[2] = 0;
        return this.createTag(versions);
    };

    this.bumpPatch = function (tag) {
        var versions = this.parseTag(tag);
        versions[2]++;
        return this.createTag(versions);
    };
};

module.exports = new Version;
