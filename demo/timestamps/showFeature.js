angular.module("geojsonViewerApp").factory("showFeature", ["$rootScope", "leafletData", "leafletHelpers", "leafletSpiderfierHelpers", function($rootScope, leafletData, leafletHelpers, leafletSpiderfierHelpers) {
	var isDefined = leafletHelpers.isDefined,
		markerDragListener;
	return function(map, feature) {
		var markers = {},
			timestamps = {},
			coordinates = [],
			oms = new leafletSpiderfierHelpers.OverlappingMarkerSpiderfier(map);

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
				icon: {
					type: 'awesomeMarker',
					icon: '',
					number: i.toString(),
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
				draggable: true,		
				icon: {
					type: 'awesomeMarker',
					icon: '',
					number: i.toString(),
					markerColor: 'red'
				}
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
				var newPosition = L.GeometryUtil.interpolateOnLine(map, coordinates, $rootScope.timestamps[id].distance);
				$rootScope.markers["estimate" + id] = {
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
		if (isDefined(markerDragListener)) {
			console.log('Removing drag listener...');
			markerDragListener();
		}
		markerDragListener = $rootScope.$on('leafletDirectiveMarker.drag', function(evt, marker) {
			var key = parseInt(marker.markerName.slice(8));
			var newDistanceAlongLine = L.GeometryUtil.locateOnLine(
				map,
				L.polyline(coordinates),
				marker.leafletEvent.target._latlng
			);
			var closestPoint = L.GeometryUtil.interpolateOnLine(
				map,
				L.polyline(coordinates),
				newDistanceAlongLine
			);
			marker.leafletEvent.target.setLatLng(L.GeometryUtil.closest(
				map, 
				L.polyline(coordinates), 
				marker.leafletEvent.target._latlng
			));
			$rootScope.timestamps[key].distance = newDistanceAlongLine;
		});
		setTimeout(function() {
			leafletData.getMarkers().then(function(leafletMarkers) {
				angular.forEach(leafletMarkers, function(marker, key) {
					oms.addMarker(marker);
				});
			});
		}, 1);		
	}
}]);