/*global require, process, console */

var Express = require('express'),
    http = require('client-http'),
    uc = require('underscore'),
    q = require('q'),
    SECURITY_TOKEN = process.env.DO_TOKEN,
    SERVER_ID = process.env.DO_SERVER_ID,
    SERVER_NAME = process.env.DO_SERVER_NAME,
    SERVICE_BASE_URL = "https://api.digitalocean.com/v2";

/**
 *
 * Droplet Scanner
 * DO's API states that [the droplet ID] is automatically generated upon Droplet creation.
 * This object provides an easy way to retrieve the dropletID, given the droplet name,
 * provided that the droplet exists.
 *
 */

function DropletScanner(){
        
        var url = SERVICE_BASE_URL + "/droplets",
        listRequest = {
            "Authorization": "Bearer " + SECURITY_TOKEN,
            "Content-Type": "application/json"
        };
        /**
         * Promise-based function that returns an object with the following format:
         * { 
         *    "dropletFound":true|false, //True if we found the dropletID
         *    "dropletId":1234567        //The droplet ID that was found. Only populated if dropletFound was true.
         * }    
         *
         */
        this.findDropletId = function (nameOfDropletToFind){
            var deferred = q.defer(),
            result ={
                        "dropletFound":false
                    };
            http.request(url, function (data, err) {
                if (!err) {
                    var droplets = JSON.parse(data).droplets;
                    for (var i = 0; i < droplets.length; i++) {
                        if(droplets[i].name === nameOfDropletToFind){
                            result.dropletFound = true;
                            result.dropletId = droplets[i].id;
                        }
                    }
                    deferred.resolve(result);
                
                } else {
                   deferred.reject(err);
                }
            }, null, listRequest);
            return deferred.promise;
        }
}

/**
 *
 *  Droplet Manager
 *
 */

function Droplet(id) {
    "use strict";

    var dropletId = id,
        baseUrl = SERVICE_BASE_URL + "/droplets/" + id,
        request = {
            "Authorization": "Bearer " + SECURITY_TOKEN,
            "Content-Type": "application/json"
        };

    function executeAction(action) {
        var deferred = q.defer(),
            data = "{\"type\": \"" + action + "\"}";

        http.request(baseUrl + "/actions", function (data, err) {
            if (!err) {
                deferred.resolve();
            } else {
                deferred.reject(err);
            }
        }, data, request);

        return deferred.promise;
    }

    this.status = function () {
        var deferred = q.defer();

        http.request(baseUrl, function (data, err) {
            if (!err) {
                var droplet = JSON.parse(data).droplet;
                deferred.resolve(droplet.status);
            } else {
                deferred.reject(err);
            }
        }, null, request);

        return deferred.promise;
    };

    this.stop = function () {
        return executeAction("shutdown");
    };
}

/**
 *
 * Main Application
 *
 */
function main() {
    "use strict";
    var app = new Express(),
        droplet = new Droplet(SERVER_ID),
        pServerState = "unknown",
        dropletScanner = new DropletScanner();

    function throwError(response, message) {
        console.log("Error message: " + message);
        response.set('Content-Type', 'application/json').status(500).send({
            "message": message
        });
    }

    app.get('/physical/stop', function (request, response) {
        droplet.status().then(function (status) {
            if (status === "active") {
                droplet.stop().then(function () {
                    response.set('Content-Type', 'text/plain').send("OK");
                }, function (err) {
                    throwError(response, err);
                });
            }
        }, function (err) {
            throwError(response, err);
        });
    });

    app.get('/status', function (request, response) {
        droplet.status().then(function (status) {
            response.set('Content-Type', 'text/plain').send(status);
        }, function (err) {
            throwError(response, err);
        });
    });
    
    app.get('/identify', function (request, response) {
       
        dropletScanner.findDropletId(SERVER_NAME).then(function (result) {
            response.set('Content-Type', 'text/plain').send(result);
        }, function (err) {
            throwError(response, err);
        });
        
    });

    app.listen(process.env.PORT || 8080);

}


main();