var Terraformer = require('/home/justin/prog/terraformer/terraformer.js'),
	fs = require('fs');

fs.readFile('../data/geoJSON/WhereWeWalk_May_2014.geojson', function(err, data) {
	if (err)
		throw err;

	var survey = new Terraformer.FeatureCollection(JSON.parse(data));

	for (var i = 0; i < survey.features.length; i++) {
		var linestring = new Terraformer.LineString(survey.features[i].geometry);
		// console.log(linestring.length());
		var timestamps = survey.features[i].properties.timestamps;
		for (var j = 0; j < timestamps.length; j++) {
			var timestamp = new Terraformer.Point(timestamps[j].geometry);
			console.log(linestring.contains(timestamp));
		}
	}
});