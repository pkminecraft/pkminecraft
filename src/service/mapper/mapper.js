/*jslint node: true,nomen: true */
/*globals exports */

"use strict";

var imageMapper = require("./imageMapper");

exports.map = function (server, images, droplets) {
    var image = imageMapper.findImage(images, server),
        retVal = {
            "slug": server,
            "image": {
                "name": server + "-save"
            },
            "droplet": {
            },
            "dns": server + ".paulkimbrel.com"
        };

    if (image !== undefined) {
        retVal.image.id = image.id;
        retVal.image.date = image.created_at;
    }

    return retVal;
};

