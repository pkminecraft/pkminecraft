/*jslint node: true,nomen: true */
/*globals exports, describe, it */

"use strict";

var assert = require("assert");
var mapper = require("../../src/service/mapper/mapper");
var images = require("../data/images");
var droplets = require("../data/droplets");

describe('Server Mapper', function () {
	describe('Before creating anything', function () {
		var result = mapper.map("test1", [], []);
		it('should find NO image or droplet', function () {
            assert.equal(undefined, result.droplet.id);
            assert.equal(undefined, result.droplet.ip_address);
            assert.equal("inactive", result.droplet.status);
            assert.equal(undefined, result.image.date);
            assert.equal(undefined, result.image.id);
        });
        
		it('should still have standard information', function () {
            assert.equal("test1.paulkimbrel.com", result.dns);
            assert.equal("test1-save", result.image.name);
            assert.equal("test1", result.slug);
        });
	});

	describe('Server stopped, image sitting in waiting', function () {
		var result = mapper.map("test1", images.core_images, []);
		it('should have no droplet', function () {
            assert.equal(undefined, result.droplet.id);
            assert.equal(undefined, result.droplet.ip_address);
            assert.equal("inactive", result.droplet.status);
        });
        
		it('should have an image', function () {
            assert.equal(1, result.image.id);
            assert.equal("2014-09-25T15:15:51Z", result.image.date);
        });
        
		it('should have standard information', function () {
            assert.equal("test1.paulkimbrel.com", result.dns);
            assert.equal("test1-save", result.image.name);
            assert.equal("test1", result.slug);
        });
	});

	describe('Server stopped, duplicate images', function () {
		var result = mapper.map("test2", images.duplicate_images, []);
		it('should have no droplet', function () {
            assert.equal(undefined, result.droplet.id);
            assert.equal(undefined, result.droplet.ip_address);
            assert.equal("inactive", result.droplet.status);
        });
        
		it('should have the newest image', function () {
            assert.equal(7, result.image.id);
            assert.equal("2014-09-27T15:15:51Z", result.image.date);
        });
        
		it('should have standard information', function () {
            assert.equal("test2.paulkimbrel.com", result.dns);
            assert.equal("test2-save", result.image.name);
            assert.equal("test2", result.slug);
        });
	});

	describe('Server running, no images', function () {
		var result = mapper.map("test1", [], droplets.core_active_droplets);
		it('should have no images', function () {
            assert.equal(undefined, result.image.date);
            assert.equal(undefined, result.image.id);
        });
        
		it('should have the an active droplet', function () {
            assert.equal(1001, result.droplet.id);
            assert.equal("192.168.1.101", result.droplet.ip_address);
            assert.equal("active", result.droplet.status);
        });
        
		it('should have standard information', function () {
            assert.equal("test1.paulkimbrel.com", result.dns);
            assert.equal("test1-save", result.image.name);
            assert.equal("test1", result.slug);
        });
	});
});
