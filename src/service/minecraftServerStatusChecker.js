/*global require, process, console */
function minecraftServerStatusChecker() {
    "use strict";

    var mcping = require('mc-ping');
    mcping('mc.paulkimbrel.com', 25565, function(err, res) {
        if (err) {
            console.error(err);
        } else {
            console.log(res);
            //res is a JSON object that looks like this:
            //{ protocol_version: '127',
            //  minecraft_version: '14w10c',
            //  server_name: 'PK Town',
            //  num_players: '0',
            //  max_players: '20' }
        }
    });
}
minecraftServerStatusChecker();