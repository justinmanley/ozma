var geojsonAnimatorApp = angular.module("geojsonViewerApp", [ "leaflet-directive" ]);
var geojsonUrl = "../data/march2014_ratios.geojson";
geojsonAnimatorApp.controller("pathAnimatorCtrl", [
	"$scope",
	"$http",
	"Util",
	"showFeature",
	"leafletData",
	function($scope, $http, Util, showFeature, leafletData) {
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
				leafletData.getMap().then(function(map){
					Util.initialize(map, data);

					Util.setCurrentFeatureIndex(0);

					angular.extend($scope, {
						currentFeatureIndex: Util.getCurrentFeatureIndex(),
						currentFeatureId: Util.getCurrentFeatureId(),
						updateFeature: Util.updateFeature,
						switchFeature: Util.switchFeature
					});

					showFeature(map, data, $scope.currentFeatureIndex);
				});
			})
			.error(function(data, status) {
				console.log("Status: " + status + "Could not locate the file.");
			});
	}
]);