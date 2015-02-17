/*global require, process, console, setInterval, clearInterval */
/*jslint plusplus: true */

var Express = require('express'),
    cors = require('cors'),
    http = require('restler'),
    uc = require('underscore'),
    q = require('q'),
    moment = require('moment'),
    SECURITY_TOKEN = process.env.DO_TOKEN,
    ROOT_DIR = process.env.ROOT_DIR,
    SERVICE_BASE_URL = "https://api.digitalocean.com/v2",
    SERVERS = ["techworld2", "crashlanding", "dw20", "skyfactory2"];

/**
 *
 *  Droplet Object
 *
 */

function Droplet(id) {
    "use strict";

    var dropletId = id,
        baseUrl = SERVICE_BASE_URL + "/droplets/" + id,
        request = {
            "Authorization": "Bearer " + SECURITY_TOKEN,
            "Content-Type": "application/json"
        },
        obj = this;

    this.dropletObject = null;

    function executeAction(action, extraData) {
        var deferred = q.defer(),
            options = {
                data: null,
                headers: request
            },
            data = {
                "type": action
            },
            extendedData = {};

        if (extraData !== undefined) {
            uc.extend(data, extraData);
        }
        options.data = JSON.stringify(data);


        console.log("Data: " + options.data);

        http.post(baseUrl + "/actions", options).on('complete', function (data, response) {
            if (data instanceof Error) {
                console.log("Action rejected for reason: " + data);
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                console.log("Action rejected for status code: " + response.statusCode);
                console.log("Message: " + JSON.stringify(data));
                deferred.reject(data.message);
            } else {
                console.log("Action complete: " + JSON.stringify(data));
                deferred.resolve(data.action.id);
            }
        });

        return deferred.promise;
    }

    this.load = function () {
        var deferred = q.defer(),
            options = {
                headers: request
            };

        http.get(baseUrl, options).on('complete', function (data, response) {
            if (data instanceof Error) {
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                deferred.reject(data.message);
            } else {
                obj.dropletObject = data.droplet;
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    this.destroy = function () {
        var deferred = q.defer(),
            options = {
                headers: request
            };

        http.del(baseUrl, options);
        deferred.resolve("Deleted droplet: " + id);

        return deferred.promise;
    };

    this.status = function () {
        var deferred = q.defer();

        this.load().then(function (droplet) {
            var status = {
                "status": obj.dropletObject.status,
                "ipaddress": obj.dropletObject.networks.v4[0].ip_address
            };

            deferred.resolve(status);
        }, function () {
            deferred.reject("Cannot get status");
        });

        return deferred.promise;
    };

    this.actionStatus = function (actionId) {
        var deferred = q.defer(),
            options = {
                headers: request
            };

        http.get(baseUrl + "/actions/" + actionId, options).on('complete', function (data, response) {
            if (data instanceof Error) {
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                deferred.reject(data.message);
            } else {
                deferred.resolve(data.action.status);
            }
        });

        return deferred.promise;
    };

    this.stop = function () {
        return executeAction("shutdown");
    };

    this.start = function () {
        return executeAction("power_on");
    };

    this.reboot = function () {
        return executeAction("reboot");
    };

    this.takeSnapshot = function (serverName) {
        return executeAction("snapshot", {
            name: serverName + "-save"
        });
    };
}

/**
 *
 * Droplet Factory
 * DO's API states that [the droplet ID] is automatically generated upon Droplet creation.
 * This object provides an easy way to retrieve the droplet given the droplet name -
 * provided that the droplet exists.
 *
 */

function DropletFactory() {
    "use strict";

    var url = SERVICE_BASE_URL + "/droplets",
        request = {
            "Authorization": "Bearer " + SECURITY_TOKEN,
            "Content-Type": "application/json"
        };

    function buildDroplet(id, deferred) {
        var droplet = new Droplet(id);
        droplet.load().then(function (loadedDroplet) {
            deferred.resolve(droplet);
        }, function () {
            deferred.reject("Unable to load droplet");
        });
    }

    this.createDroplet = function (serverName, imageKey) {
        var deferred = q.defer(),
            options = {
                data: null,
                headers: request
            },
            data = {
                "name": serverName + ".paulkimbrel.com",
                "region": "nyc3",
                "size": "4gb",
                "image": imageKey
            };

        console.log(JSON.stringify(data));

        options.data = JSON.stringify(data);

        http.post(url, options).on('complete', function (data, response) {
            if (data instanceof Error) {
                console.log("Create rejected for reason: " + data);
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                console.log("Create rejected for status code: " + response.statusCode);
                console.log("Message: " + JSON.stringify(data));
                deferred.reject(data.message);
            } else {
                deferred.resolve("Creation request completed");
            }
        });
        deferred.resolve("Creation request completed");

        return deferred.promise;
    };

    /**
     * Promise-based function that returns a droplet if found:
     */
    this.findDroplet = function (serverName) {
        var i = 0,
            deferred = q.defer(),
            options = {
                headers: request
            };

        http.get(url, options).on('complete', function (data, response) {
            if (data instanceof Error) {
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                deferred.reject(data.message);
            } else {
                var droplets = data.droplets;
                for (i = 0; i < droplets.length; i++) {
                    if (droplets[i].name === serverName + ".paulkimbrel.com") {
                        buildDroplet(droplets[i].id, deferred);
                        break;
                    }
                }
                if (i >= droplets.length) {
                    deferred.reject("Droplet not found");
                }
            }
        });

        return deferred.promise;
    };
}

/**
 *
 * Image Manager
 *
 */

function ImageManager() {
    "use strict";

    var url = SERVICE_BASE_URL + "/images",
        request = {
            "Authorization": "Bearer " + SECURITY_TOKEN,
            "Content-Type": "application/json"
        };

    this.getMostRecentImage = function (serverName) {
        var i = 0,
            deferred = q.defer(),
            options = {
                headers: request
            };

        http.get(url, options).on('complete', function (data, response) {
            if (data instanceof Error) {
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                deferred.reject(data.message);
            } else {
                var images = data.images,
                    maxCreationDate = moment(0),
                    imageCreationDate,
                    imageToKeep = -1,
                    deleteUrl;

                for (i = 0; i < images.length; i++) {
                    imageCreationDate = moment(images[i].created_at);
                    if ((images[i].name === serverName + "-save") && (imageCreationDate.diff(maxCreationDate) > 0)) {
                        maxCreationDate = imageCreationDate;
                        imageToKeep = images[i].id;
                    }
                }
                deferred.resolve(imageToKeep);
            }
        });

        return deferred.promise;
    };

    this.cleanupImages = function (serverName) {
        var i = 0,
            deferred = q.defer(),
            options = {
                headers: request
            };

        http.get(url, options).on('complete', function (data, response) {
            if (data instanceof Error) {
                deferred.reject(data);
            } else if (response.statusCode >= 400) {
                deferred.reject(data.message);
            } else {
                var images = data.images,
                    maxCreationDate = moment(0),
                    imageCreationDate,
                    imageToKeep = -1,
                    deleteUrl;

                for (i = 0; i < images.length; i++) {
                    imageCreationDate = moment(images[i].created_at);
                    if ((images[i].name === serverName + "-save") && (imageCreationDate.diff(maxCreationDate) > 0)) {
                        maxCreationDate = imageCreationDate;
                        imageToKeep = images[i].id;
                    }
                }
                for (i = 0; i < images.length; i++) {
                    if ((images[i].name === serverName + "-save") && (images[i].id !== imageToKeep)) {
                        deleteUrl = url + "/" + images[i].id;
                        http.del(deleteUrl, options);
                    }
                }
                deferred.resolve("Complete - Kept image " + imageToKeep);
            }
        });

        return deferred.promise;
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
        droplet,
        shutdownStatus = "not-invoked",
        dropletFactory = new DropletFactory(),
        imageManager = new ImageManager(),
        timer;

    app.use(Express["static"](ROOT_DIR));

    app.use(cors({
        origin: '*'
    }));

    function throwError(response, message) {
        console.log("Error message: " + message);
        response.set('Content-Type', 'application/json').status(500).send({
            "message": message
        });
    }

    function checkServer(serverName) {
        if (SERVERS.indexOf(serverName) === -1) {
            throw "Server not supported";
        }

        return serverName;
    }

    function invokeFinalShutdownSequence(serverName, droplet, actionId) {
        shutdownStatus = "shutting-down";
        var snapshotActionId = 0;
        timer = setInterval(function () {
            console.log("===> [Current: " + shutdownStatus + "]");
            if (shutdownStatus === "shutting-down") {
                console.log(" ==> Checking in on action " + actionId);
                droplet.actionStatus(actionId).then(function (status) {
                    console.log("  ===> Shutdown Status: " + status);
                    if (status === "completed") {
                        shutdownStatus = "powered-off";
                    } else if (status === "errored") {
                        shutdownStatus = "incomplete";
                        clearInterval(timer);
                    }
                });
            } else if (shutdownStatus === "powered-off") {
                console.log(" ==> Checking in on action " + snapshotActionId);
                if (snapshotActionId !== 0) {
                    droplet.actionStatus(snapshotActionId).then(function (status) {
                        console.log("  ===> Snapshot Status: " + status);
                        if (status === "completed") {
                            // TODO : Destroy droplet
                            shutdownStatus = "backed-up";
                        } else if (status === "errored") {
                            shutdownStatus = "incomplete";
                            clearInterval(timer);
                        }
                    });
                } else {
                    droplet.takeSnapshot(serverName).then(function (newActionId) {
                        snapshotActionId = newActionId;
                    });
                }
            } else if (shutdownStatus === "backed-up") {
                console.log("Backed Up");
                imageManager.cleanupImages(serverName);
                droplet.destroy();
                shutdownStatus = "complete";
                clearInterval(timer);
            }
        }, 2000);
    }

    app.get('/:server/shutdown', function (request, response) {
        var serverName = request.params.server;
        dropletFactory.findDroplet(serverName).then(function (droplet) {
            droplet.status().then(function (status) {
                if (status.status === "active") {
                    droplet.stop().then(function (actionId) {
                        response.set('Content-Type', 'text/plain').send("Shutdown initiated(" + actionId + ")...");
                        invokeFinalShutdownSequence(serverName, droplet, actionId);
                    }, function (err) {
                        throwError(response, err);
                    });
                }
            }, function (err) {
                throwError(response, err);
            });
        }, function (err) {
            throwError(response, err);
        });
    });

    app.get('/:server/create', function (request, response) {
        var serverName = checkServer(request.params.server);
        imageManager.getMostRecentImage(serverName).then(function (imageKey) {
            dropletFactory.createDroplet(serverName, imageKey).then(function () {
                response.set('Content-Type', 'text/plain').send("Create requested.  Don't do it again.");
            }, function (err) {
                throwError(response, err);
            });
        }, function (err) {
            throwError(response, err);
        });
    });

    app.get('/:server/stop', function (request, response) {
        var serverName = checkServer(request.params.server);
        dropletFactory.findDroplet(serverName).then(function (droplet) {
            droplet.status().then(function (status) {
                if (status.status === "active") {
                    droplet.stop().then(function (actionId) {
                        response.set('Content-Type', 'text/plain').send("Stop requested: " + actionId);
                    }, function (err) {
                        throwError(response, err);
                    });
                } else {
                    response.set('Content-Type', 'text/plain').send("Server already stopped...");
                }
            }, function (err) {
                throwError(response, err);
            });
        }, function (err) {
            throwError(response, err);
        });
    });

    app.get('/:server/snapshot', function (request, response) {
        var serverName = checkServer(request.params.server);
        dropletFactory.findDroplet(serverName).then(function (droplet) {
            droplet.status().then(function (status) {
                if (status.status === "off") {
                    droplet.takeSnapshot(serverName).then(function (actionId) {
                        response.set('Content-Type', 'text/plain').send("Snapshot requested: " + actionId);
                    }, function (err) {
                        throwError(response, err);
                    });
                } else {
                    response.set('Content-Type', 'text/plain').send("Server must be stopped, first...");
                }
            }, function (err) {
                throwError(response, err);
            });
        }, function (err) {
            throwError(response, err);
        });
    });

    app.get('/:server/start', function (request, response) {
        var serverName = request.params.server;
        dropletFactory.findDroplet(serverName).then(function (droplet) {
            droplet.status().then(function (status) {
                if (status.status === "off") {
                    droplet.start().then(function (actionId) {
                        response.set('Content-Type', 'text/plain').send("Start requested: " + actionId);
                    }, function (err) {
                        throwError(response, err);
                    });
                } else {
                    response.set('Content-Type', 'text/plain').send("Server already running...");
                }
            }, function (err) {
                throwError(response, err);
            });
        }, function (err) {
            throwError(response, err);
        });
    });

    app.get('/:server/status', function (request, response) {
        var serverName = checkServer(request.params.server);
        dropletFactory.findDroplet(serverName).then(function (droplet) {
            droplet.status().then(function (status) {
                response.set('Content-Type', 'application/json').send(status);
            }, function (err) {
                throwError(response, err);
            });
        }, function () {
            throwError(response, "No server found");
        });
    });

    app.get('/:server/identify', function (request, response) {
        var serverName = checkServer(request.params.server);
        dropletFactory.findDroplet(serverName).then(function (droplet) {
            response.set('Content-Type', 'text/plain').send(droplet.dropletObject);
        }, function (err) {
            throwError(response, err);
        });

    });

    app.get('/servers', function (request, response) {
        response.set('Content-Type', 'text/plain').send(SERVERS);
    });

    app.get('/cleanup', function (request, response) {
        var serverName = checkServer(request.params.server);
        imageManager.cleanupImages().then(function (message) {
            response.set('Content-Type', 'text/plain').send(message);
        }, function (err) {
            throwError(response, err);
        });

    });

    app.listen(process.env.PORT || 8080);

}


main();