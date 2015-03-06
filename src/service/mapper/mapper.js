/*jslint node: true,nomen: true */
/*globals exports */

"use strict";

var imageMapper = require("./imageMapper");
var dropletMapper = require("./dropletMapper");

exports.map = function (server, images, droplets) {
    var image = imageMapper.findImage(images, server),
        droplet = dropletMapper.findDroplet(droplets, server),
        retVal = {
            "slug": server,
            "image": {
                "name": server + "-save"
            },
            "droplet": {
                "status": "inactive"
            },
            "dns": server + ".paulkimbrel.com"
        };

    if (image !== undefined) {
        retVal.image.id = image.id;
        retVal.image.date = image.created_at;
    }
    
    if (droplet !== undefined) {
        retVal.droplet.id = droplet.id;
        retVal.droplet.ip_address = droplet.networks.v4[0].ip_address;
        retVal.droplet.status = droplet.status;
    }

    return retVal;
};

