'use strict';

/* Services */

var portfolioTaskServices = angular.module('portfolioTaskServices', []);

portfolioTaskServices.factory('Graph', [ function() {
    return {
        build: function (chart, $scope) {
            $scope.chartConfig.title.text = chart.title + " (" + chart._id + ")";
            $scope.chartConfig.options.chart.type = chart.chart_type;
            $scope.chartConfig.series = [];
            /*$scope.chartConfig.xAxis = undefined;
            $scope.chartConfig.yAxis = {
                currentMin: chart.data_min,
                currentMax: chart.data_max }*/

            for (var k = 0; k < chart.data.length; ++k) {
                var serie = {id: k+1, data: []};
                for (var i = 0; i < chart.data[k].series.length; ++i)
                    serie.data.push([(new Date(chart.data[k].series[i][0])).getTime(), chart.data[k].series[i][1]]);
                $scope.chartConfig.series.push(serie);
            }

            $scope.chartConfig.loading = false;
            $scope.chartConfig.getHighcharts().reflow();
        }
    };
}]);
