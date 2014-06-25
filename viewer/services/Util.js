angular.module("geojsonViewerApp").factory("Util",[ "showFeature", function(showFeature) {
	var currentFeatureIndex, currentFeatureId, map, data,
		featureIds = [],
		featureIndices = {},
		animatorErrors = [];

	var _this = {
		initialize: function(_map, _data) {
			var feature;

			map = _map;
			data = _data;

			data.features.sort(function(featureA, featureB) {
				return featureA.properties["database-id"] - featureB.properties["database-id"];
			});

			for (var i = 0; i < data.features.length; i++) {
				feature = data.features[i];
				featureIds.push(feature.properties["database-id"]);
				featureIndices[feature.properties["database-id"]] = i;
			}
		},

		updateFeature: function(id) {
			if (typeof id === 'number' && id % 1 === 0) {
				this.setCurrentFeatureId(id);
				showFeature(map, data, currentFeatureIndex);
			}
		},

		setViewerTime: function(time) {
			var timestamps = {};
			for (var i = 0; i < data.features.length; i++) {
				try {
					var feature = data.features[i],
						ratio = _this.animator(feature).at(time),
						coordinates = [],
						position;

					for (var j = 0; j < feature.geometry.coordinates.length; j++) {
						coordinates[j] = angular.copy(feature.geometry.coordinates[j]).reverse();
					}
					position = L.GeometryUtil.interpolateOnLine(map, coordinates, ratio).latLng;
					timestamps[i] = {
						lat: position.lat,
						lng: position.lng,
						icon: {
							iconUrl: '../images/circlemarker.png',
							iconSize: [6, 6],
							shadowUrl: '',
							shadowSize: [0, 0]
						}
					};
				} catch(err) {
					console.log(err);
				}
			}
			angular.extend(this, {
				markers: timestamps
			});
		},

		switchFeature: function(event) {
			if (event.keyCode === 100 || event.keyCode === 97 ) {
				if (event.keyCode === 100 ) {
					if (currentFeatureIndex < featureIds.length - 1) {
						currentFeatureIndex += 1;
					}
					else {
						currentFeatureIndex = 0;
					}
				}
				else if ( event.keyCode === 97 ) {
					if (currentFeatureIndex > 0 ) {
						currentFeatureIndex -= 1;
					}
					else {
						currentFeatureIndex = featureIds.length - 1;
					}
				}
				currentFeatureId = featureIds[currentFeatureIndex];
				this.currentFeatureIndex = currentFeatureIndex;
				this.currentFeatureId = currentFeatureId;
				showFeature(map, data, currentFeatureIndex);
			}
		},

		getCurrentFeatureIndex: function() {
			return currentFeatureIndex;
		},

		getCurrentFeatureId: function() {
			return currentFeatureId;
		},

		setCurrentFeatureIndex: function(index) {
			currentFeatureIndex = index;
			currentFeatureId = this.indexToId(index);
		},

		setCurrentFeatureId: function(id) {
			currentFeatureId = id;
			currentFeatureIndex = this.idToIndex(id);
		},

		indexToId: function(index) {
			return featureIds[index];
		},

		idToIndex: function(id) {
			return featureIndices[id];
		},

		downloadFile: function(featureIndex) {
			var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
				isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1,
				downloadData = featureIndex ? data.features[featureIndex] : data,
				downloadUrl = encodeURI('data:text/json;charset=utf-8,' + JSON.stringify(downloadData)),
				featureId = this.indexToId(featureIndex);

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
		},

		/* An animator is a function which maps from times in [0,24] to path ratios. */
		animator: function(feature) {
			/* Make sure that the timestamps are sorted by pathRatio. */
			feature.properties.timestamps.sort(function(a, b) {
				return b.properties.pathRatio - a.properties.pathRatio;
			});
			var timestamps = feature.properties.timestamps;

			return {
				at: function(time) {
					if (time < timestamps[0].startTime) {
						return null;
					} else {
						return _this._segmentAnimator(feature, 0).at(time);
					}
				}
			};
		},

		// viewTime: function() {

		// },

		_stationaryAnimator: function(feature, i) {
			var timestamp = feature.properties.timestamps[i],
				startTime = timestamp.startTime,
				endTime = timestamp.endTime;

			return {
				at: function(time) {
					if (time < startTime) {
						_this._logAnimatorError();
						throw "[OZMA] Error: Time is not in animator domain.";
					}

					if ( time > endTime ) {
						return _this._segmentAnimator(feature, i).at(time);
					} else {
						return timestamp.pathRatio;
					}
				}
			};
		},

		/* Returns an animator for the interior of the given segment. */
		_segmentAnimator: function(feature, i) {
			var timestamps = feature.properties.timestamps,
				originPathRatio = timestamps[i].properties.pathRatio,
				destinationPathRatio = timestamps[i + 1].properties.pathRatio,
				originEnd = this._timestringToInteger(timestamps[i].properties.endTime),
				destinationStart = this._timestringToInteger(timestamps[i + 1].properties.startTime);

			if (originEnd > destinationStart) {
				_this._logAnimatorError();
				throw "[OZMA] Error: The second timestamp begins before the first timestamp ends.";
			}

			return {
				at:	function(time) {
					if (time < originEnd) {
						_this._logAnimatorError();
						throw "[OZMA] Error: Time is not in animator domain.";
					}

					if (time > destinationStart) {
						if (timestamps.length - 2 === i) {
							return null;
						} else {
							return _this._stationaryAnimator(feature, i + 1).at(time);
						}
					}

					var m = (destinationPathRatio - originPathRatio) / (destinationStart - originEnd);
					var b = destinationPathRatio - m * destinationStart;

					return m * time + b;
				}
			};
		},

		_logAnimatorError: function() {
			// console.log(animatorErrors);
			if (!(_this.getCurrentFeatureId() in animatorErrors)) {
				animatorErrors.push(_this.getCurrentFeatureId());
			}
		},

		animatorErrors: function() {
			return animatorErrors.length;
		},

		_timestringToInteger: function(timeString) {
			if (timeString === "") {
				return null;
			}

			var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
			var parsed = regex.exec(timeString);

			if (parsed === null) {
				throw "[OZMA] Error: timestring " + timeString + " is not formatted correctly.";
			}

			var hour = parseInt(parsed[1], 10) % 24;
			var minute = typeof parsed[2] === 'undefined' ? 0 : parseInt(parsed[2], 10)/60;

			if ( /^P.?M.?$/i.test(parsed[3]) && hour !== 12) {
				hour += 12;
			}
			if ( /^A.?M.?$/i.test(parsed[3]) && hour === 12 ) {
				hour = 0;
			}

			return hour + minute;
		}
	};
	return _this;
}]);