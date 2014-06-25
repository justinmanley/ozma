angular.module("geojsonViewerApp").factory("Util",[ "showFeature", function(showFeature) {
	var currentFeatureIndex, currentFeatureId, map, data,
		featureIds = [],
		featureIndices = {};

	return {
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

		update: function(id) {
			this.setCurrentFeatureId(id);
			showFeature(map, data, currentFeatureIndex);
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
		}
	};
}]);