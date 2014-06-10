var timestampApp = angular.module("timestampApp", [ "leaflet-directive" ]);
timestampApp.controller("timestampEditorCtrl", [ "$scope", "leafletData", function($scope, leafletData) {
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
			map: {
				enable: ['click', 'dragstart', 'dragend'],
				logic: 'emit'
			}
		}
	});
	// $scope.eventDetected = "No event detected yet...";
	// $scope.$on("leafletDirectiveMap.dragstart", function(event) {
	// 	$scope.eventDetected = "dragStart";
	// });
	// $scope.$on("leafletDirectiveMap.click", function(event) {
	// 	$scope.eventDetected = 'click';
	// });

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
			showFeature($scope.feature);

			// var drawnItems = new L.FeatureGroup();
			// map.addLayer(drawnItems);

			// var options = {
			// 	position: 'topright', 
			// 	draw: {
			// 		polyline: {
			// 			shapeOptions: {
			// 				color: '#4788f1',
			// 				weight: 1
			// 			}
			// 		}
			// 	},
			// 	edit: {
			// 		featureGroup: drawnItems,
			// 		remove: false
			// 	}
			// };

			// var drawControl = new L.Control.Draw(options);
			// map.addControl(drawControl);
			// map.on('draw:created', function(event) {
			// 	var type = event.layerType,
			// 		layer = event.layer;
			// 	drawnItems.addLayer(layer);
			// });

			$scope.updateFeature = function(id) {
				$scope.currentFeatureId = id;
				$scope.currentFeatureIndex = idIndices[id];
				$scope.feature = features[$scope.currentFeatureId];
				showFeature($scope.feature);
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
					showFeature($scope.feature);
				}	
			}

			$scope.highlightTimestamp = function(event, i) {
				angular.extend($scope.timestamps[i], { focus: true });
			};

			function showFeature(feature) {
				var markers = {},
					timestamps = {},
					coordinates = [];
				angular.forEach(feature.geometry.coordinates, function(coordinate) {
					coordinates.push(angular.copy(coordinate).reverse());
				});	

				var timestamp,
					estimatedTimestampLength,
					estimatedTimestampPosition;
				for (var i = 0; i < feature.properties.timestamps.length; i++) {
					timestamp = feature.properties.timestamps[i];
					time = timestamp.properties.time,
					startTime = timestamp.properties.startTime,
					endTime = timestamp.properties.endTime;					
					markers[i] = {
						lat: timestamp.geometry.coordinates[0][1],
						lng: timestamp.geometry.coordinates[0][0],
						message: time ? time : startTime + ' - ' + endTime,
						icon: {
							type: 'awesomeMarker',
							icon: 'time',
							markerColor: 'blue'
						}
					};
					estimatedTimestampLength = L.GeometryUtil.locateOnLine(
						map,
						L.polyline(coordinates),
						L.latLng(timestamp.geometry.coordinates[0][1], timestamp.geometry.coordinates[0][0])
					);
					estimatedTimestampPosition = L.GeometryUtil.interpolateOnLine(map, coordinates, estimatedTimestampLength);
					timestamps[i] = {
						message: time ? time : startTime + ' - ' + endTime,
						distance: estimatedTimestampLength						
					};
					markers["estimate" + i] = {
						lat: estimatedTimestampPosition.latLng.lat ? estimatedTimestampPosition.latLng.lat : estimatedTimestampPosition.latLng[0],
						lng: estimatedTimestampPosition.latLng.lng ? estimatedTimestampPosition.latLng.lng : estimatedTimestampPosition.latLng[1],
						message: time ? time : startTime + ' - ' + endTime,
						draggable: true,		
						icon: {
							type: 'awesomeMarker',
							icon: 'time',
							markerColor: 'red'
						}
					};
				}
				angular.extend($scope, {
					geojson: {
						data: feature,
						style: {
							weight: 2,
							color: "#db1d0f",
							opacity: 1
						}
					},
					markers: markers,
					timestamps: timestamps,
					decorations: {
						arrows: {
							coordinates: coordinates,
							setAnimatedPatterns: function(d) {
								var arrowOffset = 0;								
								var animationId = window.setInterval(function() {
									d.setPatterns([
							            {offset: arrowOffset+'%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})}
									]);
							        if(++arrowOffset > 100)
							            arrowOffset = 0;								
								}, 200);
								return animationId;
							}
						}
					},
					updateTimestamp: function(id) {
						var newPosition = L.GeometryUtil.interpolateOnLine(map, coordinates, $scope.timestamps[id].distance);
						$scope.markers["estimate" + id] = {
							lat: newPosition.latLng.lat,
							lng: newPosition.latLng.lng,
							message: timestamps[id].message,
							draggable: true,
							icon: {
								type: 'awesomeMarker',
								icon: 'time',
								markerColor: 'red',
							}
						};
					}
				});
			}
		});
	});
}]);