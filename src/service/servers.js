/*jslint node: true,nomen: true */
/*globals exports */

"use strict";

var DigitalOcean = require('do-wrapper');
var Q = require('q');
var mapper = require("./mapper");

var TOKEN = process.env.TOKEN;
var SERVERS = process.env.SERVERS || ["techworld2", "crashlanding", "dw20", "skyfactory2"];

var api = new DigitalOcean(TOKEN, 50);

function buildServerList(images, droplets) {
    var serverIndex,
        servers = [];
    
    for (serverIndex in SERVERS) {
        if (SERVERS.hasOwnProperty(serverIndex)) {
            servers.push(mapper.map(SERVERS[serverIndex], images, droplets));
        }
    }
    
    return servers;
}

exports.listServers = function () {
    var deferred = Q.defer();
    api.imagesGetPrivate(function (error, images) {
        if (!error) {
            api.dropletsGetAll(function (error, droplets) {
                if (!error) {
                    deferred.resolve(buildServerList(images.images, droplets));
                }
            });
        }
                             
        if (error) {
            deferred.reject(error);
        }
    });
    
    return deferred.promise;
};