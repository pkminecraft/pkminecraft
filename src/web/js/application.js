/*globals console, angular, setInterval, clearInterval */
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

        $rootScope.refreshStatus = function () {
            console.log("Refreshing...");
            $http.get(DATA_ROOT + "/physical/status").success(function (data) {
                $rootScope.status = data;
                if (data === clearStatus) {
                    clearInterval(timer);
                    $rootScope.message = "";
                }
            }).error(function (ex) {
                $rootScope.status = "No Server";
                clearInterval(timer);
                $rootScope.message = "";
                console.log(ex);
            });
        };

        $rootScope.refreshStatus();
    }]);