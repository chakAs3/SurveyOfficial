// Invoke 'strict' JavaScript mode
'use strict';

// Configure the 'reports' module routes
angular.module('reports').config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/reports', {
			templateUrl: 'reports/views/staff-reports.client.view.html'
		}).
		when('/reports/staff', {
			templateUrl: 'reports/views/montly-staff-reports.client.view.html'
		}).
		when('/reports/homedelivery', {
			templateUrl: 'reports/views/home.delivery-staff.client.view.html'
		}).
		when('/reports/guest', {
			templateUrl: 'reports/views/guest.check.client.view.html'
		}).
		when('/reports/brandsum', {
			templateUrl: 'reports/views/brandsummaray.html'
		}).
		when('/reports/totalsum', {
			templateUrl: 'reports/views/totalsummaray.html'
		});
	}
]);
