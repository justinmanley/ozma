var fs = require('fs');
var gauss = require('gauss');

exports.timestampsPerResponse = function(data) {
	var timestamps = new gauss.Vector();
	var propertiesUndefined = 0;
	for (var i = 0; i < data.features.length; i++) {
		var feature = data.features[i];
		if ( typeof feature.properties !== 'undefined' ) {
			timestamps.push(feature.properties.timestamps.length);
		}
		else { propertiesUndefined += 1 };
	}

	return {
		mean: timestamps.mean(),
		min: timestamps.min(),
		max: timestamps.max(),
		distribution: timestamps.distribution(),
		errors: {
			message: "feature.properties is undefined",
			occurence: propertiesUndefined
		}
	};
}

exports.distinctRespondents = function(data) {
	var respondents = new gauss.Vector();
	var propertiesUndefined = 0;
	for (var i = 0; i < data.features.length; i++) {
		var feature = data.features[i];
		if ( typeof feature.properties !== 'undefined' ) {
			respondents.push(feature.properties["user-id"]);
		}
		else { propertiesUndefined += 1; }
	}
	
	return {
		unique: respondents.unique().length,
		errors: {
			message: "feature.properties is undefined",
			occurence: propertiesUndefined
		}
	} 
}

exports.pathLength = function(data) {
	var paths = new gauss.Vector();
	var propertiesUndefined = 0;
	for (var i = 0; i < data.features.length; i++) {
		var feature = data.features[i];
		if ( typeof feature.geometry.coordinates !== 'undefined' )
			paths.push(feature.geometry.coordinates.length)
		else
			propertiesUndefined += 1;
	}
	return {
		mean: paths.mean(),
		median: paths.median(),
		mode: paths.mode(),
		distribution: paths.distribution(),
		errors: {
			message: "feature.geometry.coordinates is undefined",
			occurence: propertiesUndefined
		}		
	};
}

exports.timeDuration = function(data) {
	var propertiesUndefined = 0;
	var startTimes = new gauss.Vector();
	var endTimes = new gauss.Vector();
	var duration = new gauss.Vector();
	for (var i = 0; i < data.features.length; i++) {
		var feature = data.features[i];
		var startTime = timestringToInteger(feature.properties["startTime"]);
		startTimes.push(feature.properties["startTime"]);

		var endTime = timestringToInteger(feature.properties["endTime"]);
		endTimes.push(feature.properties["endTime"]);

		duration.push(endTime - startTime);
	}


	return {
		endTimes: {
			distribution: endTimes.distribution()
		},
		startTimes: {
			distribution: startTimes.distribution()
		},
		duration: {
			mean: duration.mean(),
			median: duration.median(),
			mode: duration.mode(),
			distribution: duration.distribution()
		}
	};
}

exports.timestamps = function(data) {
	var timestampEndTimes = new gauss.Vector();
	for (var i = 0; i < data.features.length; i++) {
		var feature = data.features[i];
		for (var j = 0; j < feature.properties.timestamps.length; j++) {
			var timestamp = feature.properties.timestamps[j];
			if ( typeof timestamp.properties.endTime !== 'undefined' ) 
				timestampEndTimes.push(timestamp.properties.endTime);
		}
	}
	return {
		endTimes: {
			distribution: timestampEndTimes.distribution(),
			length: timestampEndTimes.length
		}
	}
}

function timestringToInteger(timeString) {
	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
	var parsed = regex.exec(timeString);

	var hour = parseInt(parsed[1], 10) % 24;
	var minute = typeof parsed[2] === 'undefined' ? 0 : parseInt(parsed[2], 10)/60;

	if ( /^P.?M.?$/i.test(parsed[3]) && hour != 12) 
		hour += 12; 
	if ( /^A.?M.?$/i.test(parsed[3]) && hour == 12 )
		hour = 0;

	return hour + minute;
}