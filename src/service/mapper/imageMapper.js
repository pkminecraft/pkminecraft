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

exports.findImage = function (images, server) {
    var image, index;
    for (index in images) {
        if (images.hasOwnProperty(index) &&
                isServerImage(server, images[index]) &&
                isImageNewer(image, images[index])) {
            image = images[index];
        }
    }

    return image;
};

