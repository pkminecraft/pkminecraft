/*globals console, angular, setInterval, clearInterval */
/*jslint white: true */
var pkminecraft = angular.module("pkminecraft", [])
    .constant("DATA_ROOT", "http://localhost:8080")
    .value("debug", false);

pkminecraft.run(['$http', '$rootScope', '$q', 'DATA_ROOT',
    function ($http, $rootScope, $q, DATA_ROOT) {
        "use strict";

        var timer,
            clearStatus = "blueberry";

        function executeCommand(command) {
            $rootScope.error = "";
            $http.get(DATA_ROOT + "/physical/" + command).success(function (data) {
                $rootScope.message = data;
            }).error(function (ex) {
                if (typeof ex === "object") {
                    $rootScope.error = ex.message;
                } else {
                    $rootScope.error = ex;
                }
                console.log(ex);
            });
        }

        function startTimer(stopStatus) {
            clearStatus = stopStatus;
            timer = setInterval($rootScope.refreshStatus, 2000);
        }

        $rootScope.status = "N/A";

        $rootScope.startup = function () {
            executeCommand("create");
            startTimer("active");
        };

        $rootScope.shutdown = function () {
            executeCommand("shutdown");
            startTimer("off");
        };

        $rootScope.start = function () {
            executeCommand("start");
            startTimer("active");
        };

        $rootScope.stop = function () {
            executeCommand("stop");
            startTimer("off");
        };

        $rootScope.snapshot = function () {
            executeCommand("snapshot");
        };

    }
]);

pkminecraft.controller("servers", ['$http', '$rootScope', '$scope', '$q', 'DATA_ROOT',
    function ($http, $rootScope, $scope, $q, DATA_ROOT) {
        "use strict";

        var timer,
            clearStatus = "blueberry";

        $scope.refreshStatus = function (serverName) {
            console.log("Refreshing...");
            var deferred = $q.defer();
            $http.get(DATA_ROOT + "/" + serverName + "/status").success(function (data) {
                deferred.resolve(data);
                if (data === clearStatus) {
                    clearInterval(timer);
                    $rootScope.message = "";
                }
            }).error(function (ex) {
                deferred.resolve("No Server");
                clearInterval(timer);
                $rootScope.message = "";
                console.log("Unable to get status");
            });
            deferred.promise().then(function (finalStatus) {
                var index, serverDetails;
                for (index in $scope.servers) {
                    if ($scope.servers.hasOwnProperty(index)) {
                        serverDetails = $scope.servers[index];
                        serverDetails.status = finalStatus;
                    }
                }
            });
        };

        $http.get(DATA_ROOT + "/servers").success(function (data) {
            var index, server, serverDetails, serverList = data;
            $scope.servers = [];
            for (index in serverList) {
                if (serverList.hasOwnProperty(index)) {
                    server = serverList[index];
                    serverDetails = {
                        "name": server
                    };
                    $scope.servers.push(serverDetails);
                    $scope.refreshStatus(server);
                }
            }
        });
    }
]);