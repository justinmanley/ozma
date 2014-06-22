var geojsonAnimatorApp = angular.module("geojsonAnimatorApp", [ "leaflet-directive" ]);
var geojsonUrl = "../data/march2014ratios.geojson";
geojsonAnimatorApp.controller("pathAnimatorCtrl", [ "$scope", "$http", function($scope, $http) {
	/* Set up map. */
	angular.extend($scope, {
		hydePark: {
			lng: -87.59967505931854,
			lat: 41.78961025632396,
			zoom: 15
		},
		tiles: {
			url: "http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.jpg",
			options: {
				attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
			}
		},
		events: {
			enable: ['click', 'drag', 'dragend' ],
			logic: 'emit'
		}
	});
	$http({ method: 'GET', url: geojsonUrl})
		.success(function(data) {
			console.log(data);
		})
		.error(function(data, status) {
			console.log("Status: " + status + "Could not locate the file.");
		});
}]);