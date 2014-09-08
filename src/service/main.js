/*global require, process, console */

var Express = require('express'),
    http = require('client-http'),
    uc = require('underscore'),
    q = require('q'),
    SECURITY_TOKEN = process.env.DO_TOKEN,
    SERVER_ID = process.env.DO_SERVER_ID,
    SERVICE_BASE_URL = "https://api.digitalocean.com/v2";

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
        pServerState = "unknown";

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

    app.listen(process.env.PORT || 8080);

}


main();