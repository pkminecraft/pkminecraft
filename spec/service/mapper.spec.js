/*jslint node: true,nomen: true */
/*globals exports, describe, it */

"use strict";

var assert = require("assert");
var mapper = require("../../src/service/mapper");
var images = require("../data/images");

describe('Server Mapper', function () {
	describe('New Server', function () {
		it('should find NO image or droplet', function () {
			var result = mapper.map("test1", {}, {});
            assert.equal("test1.paulkimbrel.com", result.dns);
            //assert.equal({}, result.droplet);
            assert.equal(undefined, result.image.date);
            assert.equal(undefined, result.image.id);
            assert.equal("test1-save", result.image.name);
            assert.equal("test1", result.slug);
        });
	});

	describe('Old Server', function () {
		it('should find image only', function () {
			var result = mapper.map("test1", images.core_images, {});
            assert.equal("test1.paulkimbrel.com", result.dns);
            //assert.equal({}, result.droplet);
            assert.equal("2014-09-25T15:15:51Z", result.image.date);
            assert.equal(1, result.image.id);
            assert.equal("test1-save", result.image.name);
            assert.equal("test1", result.slug);
        });
	});

	describe('Duplicate Server', function () {
		it('should find newer image', function () {
			var result = mapper.map("test2", images.duplicate_images, {});
            assert.equal("test2.paulkimbrel.com", result.dns);
            //assert.equal({}, result.droplet);
            assert.equal(7, result.image.id);
            assert.equal("2014-09-27T15:15:51Z", result.image.date);
            assert.equal("test2-save", result.image.name);
            assert.equal("test2", result.slug);
        });
	});
});
