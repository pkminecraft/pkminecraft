/*global require, process, console */
function minecraftServerStatusCheckerTest() {
    "use strict";

    var pinger = require('../../src/service/minecraftServerStatusChecker.js');
    
    pinger.pingMinecraftServer('mc.paulkimbrel.com',function(serverHasPlayersOnRightNow){
        if(serverHasPlayersOnRightNow){
            console.log('The server has players on right now!!');
        }else{
            console.log('Looks like tumbleweed city on this server.');
        }
    });
    
    
}
minecraftServerStatusCheckerTest();