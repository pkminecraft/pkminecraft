/*globals console, angular, setInterval, clearInterval */
/*jslint white: true */
var pkminecraft = angular.module("pkminecraft", [])
    .constant("DATA_ROOT", "http://localhost:8080")
    .value("debug", true);

pkminecraft.run(['$http', '$rootScope', '$q', 'DATA_ROOT',
    function ($http, $rootScope, $q, DATA_ROOT) {
        "use strict";
    }
]);

pkminecraft.controller("servers", ['$http', '$rootScope', '$scope', '$q', 'DATA_ROOT',
    function ($http, $rootScope, $scope, $q, DATA_ROOT) {
        "use strict";

        var timer,
            clearStatus = "blueberry";

        function executeCommand(serverName, command) {
            $rootScope.error = "";
            $http.get(DATA_ROOT + "/" + serverName + "/" + command).success(function (data) {
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
            timer = setInterval($scope.refreshStatus, 2000);
        }

        $scope.startup = function (serverName) {
            executeCommand(serverName, "create");
            startTimer("active");
        };

        $scope.shutdown = function (serverName) {
            executeCommand(serverName, "shutdown");
            startTimer("off");
        };

        $scope.start = function (serverName) {
            executeCommand(serverName, "start");
            startTimer("active");
        };

        $scope.stop = function (serverName) {
            executeCommand(serverName, "stop");
            startTimer("off");
        };

        $scope.snapshot = function (serverName) {
            executeCommand(serverName, "snapshot");
        };

        $scope.refreshStatus = function (serverName) {
            console.log("Refreshing...");
            var promise, deferred = $q.defer();
            $http.get(DATA_ROOT + "/" + serverName + "/status").success(function (data) {
                deferred.resolve(data);
                if (data.status === clearStatus) {
                    clearInterval(timer);
                    $rootScope.message = "";
                }
            }).error(function (ex) {
                deferred.resolve({
                    status: "No Server"
                });
                clearInterval(timer);
                $rootScope.message = "";
                console.log("Unable to get status");
            });
            promise = deferred.promise;
            promise.then(function (finalStatus) {
                var index, serverDetails;
                for (index in $scope.servers) {
                    if ($scope.servers.hasOwnProperty(index)) {
                        serverDetails = $scope.servers[index];
                        if (serverDetails.name === serverName) {
                            serverDetails.status = finalStatus;
                        }
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