var geojsonViewerApp = angular.module("geojsonViewerApp", [ "leaflet-directive", "oms" ]);
geojsonViewerApp.controller("timestampEditorCtrl", [ "$scope", "leafletData", "leafletSpiderfierHelpers", "leafletHelpers", "showFeature", function($scope, leafletData, leafletSpiderfierHelpers, leafletHelpers, showFeature) {
	var isDefined = leafletHelpers.isDefined;
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
	d3.json("./march2014.geojson", function(error, data) {	
		var features = {},
			featureIds = [],
			idIndices = {},
			feature;
		for (var i = 0; i < data.features.length; i++) {
			feature = data.features[i];
			featureIds.push(feature.properties["database-id"]);
			idIndices[feature.properties["database-id"]] = i;
			features[feature.properties["database-id"]] = feature;
		}

		angular.forEach(features, function(feature, i) {
			features[i].properties["submission-timestamp"] = moment(feature.properties["submission-timestamp"])
				.format('dddd, MMMM Do [at] h:mm[]a');
		});
		leafletData.getMap().then(function(map) {
			$scope.currentFeatureIndex = 1;
			$scope.currentFeatureId = featureIds[$scope.currentFeatureIndex];
			$scope.feature = features[$scope.currentFeatureId];
			showFeature(map, $scope.feature);

			$scope.updateFeature = function(id) {
				$scope.currentFeatureId = id;
				$scope.currentFeatureIndex = idIndices[id];
				$scope.feature = features[$scope.currentFeatureId];
				showFeature(map, $scope.feature);
			}

			$scope.switchFeature = function(event) {
				if (event.keyCode === 100 || event.keyCode === 97 ) {
					if (event.keyCode === 100 ) {
						if ($scope.currentFeatureIndex < featureIds.length - 1)
							$scope.currentFeatureIndex += 1;
						else
							$scope.currentFeatureIndex = 0;
					}
					else if ( event.keyCode === 97 ) {
						if ($scope.currentFeatureIndex > 0 )
							$scope.currentFeatureIndex -= 1;
						else
							$scope.currentFeatureIndex = featureIds.length - 1;
					}
					$scope.currentFeatureId = featureIds[$scope.currentFeatureIndex];
					$scope.feature = features[$scope.currentFeatureId];
					showFeature(map, $scope.feature);
				}	
			}

			$scope.highlightTimestamp = function(event, i) {
				angular.extend($scope.timestamps[i], { focus: true });
			};
		});
	});
}]);