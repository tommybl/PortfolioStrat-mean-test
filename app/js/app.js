'use strict';

/* App Module */

var portfolioTaskApp = angular.module('portfolioTaskApp', ['ngRoute', 'ngAnimate', 'portfolioTaskControllers', 'portfolioTaskServices', 'portfolioTaskFilters', 'highcharts-ng']);

portfolioTaskApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);
