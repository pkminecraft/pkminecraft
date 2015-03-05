/*jslint node: true,nomen: true */
/*globals modules */

"use strict";

module.exports = function (config) {
    config.set({
        files: [
            'spec/**/*.js'
        ],
        basePath: '.',
        frameworks: ['mocha'],
        reporters: ['progress', 'brackets']
    });
};
