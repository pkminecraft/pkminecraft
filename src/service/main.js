/*global require, process, console */

var Express = require('express'),
    Client = require('node-rest-client').Client,
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
        client = new Client(),
        request = {
            headers: {
                "Authorization": "Bearer " + SECURITY_TOKEN
            }
        };

    this.status = function (callback) {
        client.get(baseUrl, request, function (data, response) {
            callback(data.status);
        }).on('error', function (err) {
            throw "Unable to load droplet info";
        });
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
        droplet = new Droplet(SERVER_ID);

    function throwError(response, message) {
        console.log(message);
        response.set('Content-Type', 'application/json').status(500).send({
            "message": message
        });
    }

    app.get('/', function (request, response) {
        try {
            droplet.status(function (status) {
                response.set('Content-Type', 'text/plain').send(status);
            });
        } catch (err) {
            throwError(err);
        }
    });

    app.listen(process.env.PORT || 8080);

}


main();