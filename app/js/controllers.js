'use strict';

/* Controllers */

var portfolioTaskControllers = angular.module('portfolioTaskControllers', []);

portfolioTaskControllers.controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$http', '$timeout', 'Graph',
function($rootScope, $scope, $location, $http, $timeout, Graph) {
    $scope.chartConfig = {
        options: {
            chart: { type: 'line' },
            rangeSelector: { enabled: true },
            navigator: { enabled: true }
        },
        title: { text: 'No charts found' },
        size: { height: 500 },
        loading: true,
        useHighStocks: true
    }

    $http.get('/graphs/get')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error != undefined) $scope.errorMess2 = data.error;
            else {
                $scope.errorMess2 = undefined;
                $scope.graphs = data.charts;
                $scope.graphID = data.charts[0]._id;
                $scope.getGraph();
            }
        })
        .error(function (data, status, headers, config) {
            $scope.errorMess2 = "Server error. Try again !"
        });

    $scope.submitGraph = function () {
        var body = {
            title: $scope.form.title,
            min: $scope.form.min,
            max: $scope.form.max,
            type: $scope.form.type
        }

        $http.post('/graph/save', body)
            .success(function (data, status, headers, config) {
                console.log(data);
                if (data.error != undefined) {
                    $scope.successMess = undefined;
                    $scope.errorMess = undefined;
                    $timeout(function(){ $scope.errorMess = data.error; }, 300);
                }
                else {
                    $scope.successMess = undefined;
                    $timeout(function(){ $scope.successMess = data.success; }, 300);
                    $scope.errorMess = undefined;
                    $scope.graphs.push({_id: data._id, title: body.title});
                    $scope.graphID = data._id;
                    $scope.getGraph();
                }
            })
            .error(function (data, status, headers, config) {
                $scope.successMess = undefined;
                $scope.errorMess = undefined;
                $scope.errorMess = "Server error. Try again !"
            });
    }

    $scope.getGraph = function () {
        if ($scope.graphID == "-1") return;
        $scope.chartConfig.loading = true;
        $http.get('/graph/get/' + $scope.graphID)
            .success(function (data, status, headers, config) {
                console.log(data);
                if (data.error != undefined) $scope.errorMess2 = data.error;
                else {
                    $scope.errorMess2 = undefined;
                    Graph.build(data.chart, $scope);
                }
            })
            .error(function (data, status, headers, config) {
                $scope.errorMess2 = "Server error. Try again !"
            });
    }
}]);