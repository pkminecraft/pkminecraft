/*jslint node: true,nomen: true */
/*globals exports */

"use strict";

var moment = require("moment");

function isServerImage(server, possibleImage) {
    return (possibleImage.name.indexOf(server) === 0);
}

function isImageNewer(currentImage, possibleImage) {
    return (currentImage === undefined) ||
            (moment(currentImage.created_at) < moment(possibleImage.created_at));
}

function findImage(images, server) {
    var image, possibleImage, index;
    for (index in images) {
        if (images.hasOwnProperty(index) &&
                isServerImage(server, images[index]) &&
                isImageNewer(image, images[index])) {
            image = images[index];
        }
    }
    
    return image;
}

exports.map = function (server, images, droplets) {
    var image = findImage(images, server),
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

