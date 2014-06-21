angular.module("geojsonViewerApp").factory("showFeature", ["$rootScope", "$interval", "leafletData", "leafletHelpers", function($rootScope, $interval, leafletData, leafletHelpers) {
	var isDefined = leafletHelpers.isDefined,
		markerDragListener,
		arrowAnimation;

	return function(map, database, featureId) {
		var timestamp, time, startTime, endTime, delta,
			markers = {},
			timestamps = {},
			coordinates = [],
			oms = new OverlappingMarkerSpiderfier(map),
			feature = database.features[featureId];

		if (isDefined(feature.properties["submission-timestamp"])) {
			$rootScope.submissionTimestamp = moment(feature.properties["submission-timestamp"])
				.format('dddd, MMMM Do [at] h:mm[]a');
		}

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
			delta = L.GeometryUtil.distance(map, markers[i], markers["estimateMarker" + i]);
			database.features[featureId].properties.timestamps[i].properties.pathRatio = markers["estimateMarker" + i].ozma_distance;
			timestamps[i] = {
				distance: markers["estimateMarker" + i].ozma_distance,
				timestampText: time ? time : startTime + ' - ' + endTime,
				estimateIsCorrect: delta < 1 ? "label-primary" : "label-danger" 
			};
		}

		angular.extend($rootScope, {
			leafletGeojson: {
				data: feature,
				style: {
					weight: 2,
					color: "#db1d0f",
					opacity: 1
				}
			},
			markers: markers,
			timestamps: timestamps,
			updateTimestamp: function(id, newDistance) {
				var newPosition = L.GeometryUtil.interpolateOnLine(map, coordinates, newDistance).latLng;
				$rootScope.markers["estimateMarker" + id] = {
					lat: newPosition.lat,
					lng: newPosition.lng,
					draggable: true,
					icon: {
						type: 'awesomeMarker',
						icon: '',
						number: id.toString(),
						markerColor: 'red',
					}
				};
				updateDatabaseEntry(id, newDistance, newPosition);
			}
		});

		/* Remove old arrow animation, if necessary, and create new animation. */
		if (isDefined(arrowAnimation)) {
			$interval.cancel(arrowAnimation);
		}
		var arrowOffset = 0;
		arrowAnimation = $interval(function() {
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
		}, 100);

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
			var delta = L.GeometryUtil.distance(map, markers[markerId], marker.leafletEvent.target._latlng);
			$rootScope.timestamps[markerId].pathRatio = newDistanceAlongLine;
			$rootScope.timestamps[markerId].estimateIsCorrect = delta < 1 ? "label-primary" : "label-danger";
			updateDatabaseEntry(markerId, newDistanceAlongLine, marker.leafletEvent.target._latlng);
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
			var estimatedTimestampRatio = L.GeometryUtil.locateOnLine(
				map,
				L.polyline(coordinates),
				L.latLng(timestamp.geometry.coordinates[0][1], timestamp.geometry.coordinates[0][0])
			);
			var estimatedTimestampLatLng = L.GeometryUtil.interpolateOnLine(
				map,
				L.polyline(coordinates),
				estimatedTimestampRatio
			);
			timestamp.properties.pathRatio = estimatedTimestampRatio;
			return {
				lat: estimatedTimestampLatLng.latLng.lat,
				lng: estimatedTimestampLatLng.latLng.lng,
				ozma_timeDuration: time ? time : startTime + ' - ' + endTime,
				draggable: true,
				ozma_distance: estimatedTimestampRatio,
				icon: {
					type: 'awesomeMarker',
					icon: '',
					number: i.toString(),
					markerColor: 'red'
				}
			};
		}

		function updateDatabaseEntry(markerId, updatedDistanceAlongLine, updatedLatLng) {
			if ( typeof updatedLatLng.lat === 'undefined' || typeof updatedLatLng.lng === 'undefined' ) {
				throw "[OZMA]: updatedLatLng has undefined coordinates.";
			}

			database.features[featureId].properties.timestamps[markerId].properties.pathRatio = updatedDistanceAlongLine;			
			database.features[featureId].properties.timestamps[markerId].geometry.coordinates = [
				[updatedLatLng.lng, updatedLatLng.lat] 
			];
		}
	};
}]);