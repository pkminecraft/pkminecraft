/*global require, process, console, setInterval, clearInterval */
/*jslint plusplus: true */

var Express = require('express');
var cors = require('cors');
var serverManager = require('./serverManager');

//Constants
var CONTEXT_ROOT = process.env.CONTEXT_ROOT || "/pkminecraft";
var ROOT_DIR = process.env.ROOT_DIR;

function main() {
    "use strict";
    
    var app = new Express();
    app.use(Express["static"](ROOT_DIR));

    app.use(cors({
        origin: '*'
    }));
    
    function sendResponse(response, type, message, object) {
        var retVal = {
            "type" : type,
            "message" : "success"
        };

        if (object !== null) {
            retVal[type] = object;
        }
        
        response.set('Content-Type', 'application/json').send(retVal);
    }

    function sendError(response, error) {
        var retVal = {
            "type" : "error",
            "message" : error.message
        };

        response.set('Content-Type', 'application/json').status(500).send(retVal);
    }
    
    app.get(CONTEXT_ROOT, function (request, response) {
        serverManager.listServers().then(function (servers) {
            sendResponse(response, "servers", "success", servers);
        }, function (error) {
            sendError(response, error);
        });
    });
    
    app.listen(process.env.PORT || 8080);
}

main();
