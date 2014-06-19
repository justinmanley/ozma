angular.module("geojsonViewerApp").factory("showFeature", ["$rootScope", "leafletData", "leafletHelpers", function($rootScope, leafletData, leafletHelpers) {
	var isDefined = leafletHelpers.isDefined,
		markerDragListener,
		arrowAnimation;

	return function(map, feature) {
		var timestamp, time, startTime, endTime,
			markers = {},
			timestamps = {},
			coordinates = [],
			oms = new OverlappingMarkerSpiderfier(map);

		/* geojson coordinates have the format [lng, lat], but Leaflet wants [lat,lng]. */
		angular.forEach(feature.geometry.coordinates, function(coordinate) {
			coordinates.push(angular.copy(coordinate).reverse());
		});

		/* Set up markers array. */
		for (var i = 0; i < feature.properties.timestamps.length; i++) {
			timestamp = feature.properties.timestamps[i];
			time = timestamp.properties.time;
			startTime = timestamp.properties.startTime;
			endTime = timestamp.properties.endTime;

			markers[i] = actualMarker(timestamp);
			markers["estimateMarker" + i] = estimateMarker(timestamp);
			timestamps[i] = {
				distance: markers["estimateMarker" + i].ozma_distance,
				timestampText: time ? time : startTime + ' - ' + endTime
			};
		}

		angular.extend($rootScope, {
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
			updateTimestamp: function(id) {
				var newPosition = L.GeometryUtil.interpolateOnLine(map, coordinates, $rootScope.markers[id].ozma_distance);
				$rootScope.markers["estimate" + id] = {
					lat: newPosition.latLng.lat,
					lng: newPosition.latLng.lng,
					message: markers[id].ozma_timeDuration,
					draggable: true,
					icon: {
						type: 'awesomeMarker',
						icon: 'time',
						markerColor: 'red',
					}
				};
			}
		});

		/* Remove old arrow animation, if necessary, and create new animation. */
		if (isDefined(arrowAnimation)) {
			clearInterval(arrowAnimation);
		}
		var arrowOffset = 0;
		arrowAnimation = window.setInterval(function() {
			angular.extend($rootScope, {
				decorations: {
					arrows: {
						coordinates: coordinates,
						patterns: [{offset: arrowOffset+'%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})}]
					}
				}
			});
	        if(++arrowOffset > 100) {
	            arrowOffset = 0;
	        }
		}, 200);

		/* Deregister drag listener, if necessary, and create new listener. */
		if (isDefined(markerDragListener)) {
			markerDragListener();
		}
		markerDragListener = $rootScope.$on('leafletDirectiveMarker.drag', function(evt, marker) {
			var markerId = parseInt(marker.markerName.slice(14), 10);
			var newDistanceAlongLine = L.GeometryUtil.locateOnLine(
				map,
				L.polyline(coordinates),
				marker.leafletEvent.target._latlng
			);
			marker.leafletEvent.target.setLatLng(L.GeometryUtil.closest(
				map,
				L.polyline(coordinates),
				marker.leafletEvent.target._latlng
			));
			$rootScope.timestamps[markerId].distance = newDistanceAlongLine;
		});

		/* Cause markers to spiderfy out if they overlap with other markers. */
		setTimeout(function() {
			leafletData.getMarkers().then(function(leafletMarkers) {
				angular.forEach(leafletMarkers, function(marker) {
					oms.addMarker(marker);
				});
			});
		}, 1);

		function actualMarker(timestamp) {
			return {
				lat: timestamp.geometry.coordinates[0][1],
				lng: timestamp.geometry.coordinates[0][0],
				ozma_timeDuration: time ? time : startTime + ' - ' + endTime,
				draggable: false,
				icon: {
					type: 'awesomeMarker',
					icon: '',
					number: i.toString(),
					markerColor: 'blue'
				}
			};
		}

		function estimateMarker(timestamp) {
			var estimatedTimestampLength = L.GeometryUtil.locateOnLine(
				map,
				L.polyline(coordinates),
				L.latLng(timestamp.geometry.coordinates[0][1], timestamp.geometry.coordinates[0][0])
			);
			return {
				lat: timestamp.geometry.coordinates[0][1],
				lng: timestamp.geometry.coordinates[0][0],
				ozma_timeDuration: time ? time : startTime + ' - ' + endTime,
				draggable: true,
				ozma_distance: estimatedTimestampLength,
				icon: {
					type: 'awesomeMarker',
					icon: '',
					number: i.toString(),
					markerColor: 'red'
				}
			};
		}
	};
}]);