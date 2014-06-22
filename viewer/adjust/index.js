var geojsonViewerApp = angular.module("geojsonViewerApp", [ "leaflet-directive" ]);
var geojsonUrl = "../data/march2014.geojson";
geojsonViewerApp.controller("timestampEditorCtrl", [ "$scope", "$http", "leafletData", "leafletHelpers", "showFeature", function($scope, $http, leafletData, leafletHelpers, showFeature) {
	/* Set up map. */
	angular.extend($scope, {
		hydePark: {
			lng: -87.59967505931854,
			lat: 41.78961025632396,
			zoom: 15,
			maxZoom: Infinity
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

	$http({ method: 'GET', url: geojsonUrl })
		.success(function(data) {
			var featureIds = [],
				idIndices = {},
				feature;

			data.features.sort(function(featureA, featureB) {
				return featureA.properties["database-id"] - featureB.properties["database-id"];
			});

			for (var i = 0; i < data.features.length; i++) {
				feature = data.features[i];
				featureIds.push(feature.properties["database-id"]);
				idIndices[feature.properties["database-id"]] = i;
			}

			leafletData.getMap().then(function(map) {
				$scope.currentFeatureIndex = 1;
				$scope.currentFeatureId = featureIds[$scope.currentFeatureIndex];
				showFeature(map, data, $scope.currentFeatureIndex);

				$scope.updateFeature = function(id) {
					$scope.currentFeatureId = id;
					$scope.currentFeatureIndex = idIndices[id];
					showFeature(map, data, $scope.currentFeatureIndex);
				};

				$scope.switchFeature = function(event) {
					if (event.keyCode === 100 || event.keyCode === 97 ) {
						if (event.keyCode === 100 ) {
							if ($scope.currentFeatureIndex < featureIds.length - 1) {
								$scope.currentFeatureIndex += 1;
							}
							else {
								$scope.currentFeatureIndex = 0;
							}
						}
						else if ( event.keyCode === 97 ) {
							if ($scope.currentFeatureIndex > 0 ) {
								$scope.currentFeatureIndex -= 1;
							}
							else {
								$scope.currentFeatureIndex = featureIds.length - 1;
							}
						}
						$scope.currentFeatureId = featureIds[$scope.currentFeatureIndex];
						showFeature(map, data, $scope.currentFeatureIndex);
					}
				};

				$scope.downloadFile = function(featureIndex) {
					var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
						isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1,
						downloadData = featureIndex ? data.features[featureIndex] : data,
						downloadUrl = encodeURI('data:text/json;charset=utf-8,' + JSON.stringify(downloadData)),
						featureId = featureIds[featureIndex];

				    //If in Chrome or Safari - download via virtual link click
				    if (isChrome || isSafari) {
				        //Creating new link node.
				        var link = document.createElement('a');
				        link.href = downloadUrl;
				 
				        if (link.download !== undefined){
				            //Set HTML5 download attribute. This will prevent file from opening if supported.
				            var fileName = featureId ? "feature" + featureId + ".geojson" : "march2014.geojson";
				            link.download = fileName;
				        }
				 
				        //Dispatching click event.
				        if (document.createEvent) {
				            var e = document.createEvent('MouseEvents');
				            e.initEvent('click' ,true ,true);
				            link.dispatchEvent(e);
				            return true;
				        }
				    }
				 
				    // Force file download (whether supported by server).
				    var query = '?download';
				 
				    window.open(downloadUrl + query);
				};
			});
		})
		.error(function(data, status) {
			console.log("Status: " + status + "Could not locate the file.");
		});
}]);