/*global require, process, console */
function main() {
    "use strict";

    var Express = require('express'),
        Client = require('node-rest-client').Client,
        app = new Express(),
        SECURITY_TOKEN = process.env.DO_TOKEN,
        SERVER_ID = process.env.DO_SERVER_ID;

    app.get('/', function (req, res) {
        var client = new Client(),
            args = {
                headers: {
                    "Authorization": "Bearer " + SECURITY_TOKEN
                }
            };

        client.get("https://api.digitalocean.com/v2/droplets/" + SERVER_ID, args, function (data, response) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }).on('error', function (err) {
            console.log('Unable to load droplet info', err.request.options);
            res.set('Content-Type', 'application/json');
            res.status(500).send({
                "message": "Bad request"
            });
        });
    });

    app.listen(process.env.PORT || 8080);
}

main();