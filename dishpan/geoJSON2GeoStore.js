var fs = require('fs');

fs.readFile('../data/geoJSON/sidewalks.geojson', 'utf8', function(err, data) {
	if (err) {
		return console.log(err);
	}
	sidewalks = JSON.parse(data);
	var newSidewalks = {
		"type": "FeatureCollection",
		"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
		"features": []		
	};	
	var idNumbers = [];
	sidewalks["features"].forEach(function(feature, index, array) {
		if ( feature.geometry !== null && idNumbers.indexOf(feature["properties"]["id"]) === -1 ) {
			idNumbers.push(feature["properties"]["id"]);
			feature.id = feature["properties"]["id"];
			newSidewalks["features"].push(feature);
		}
	});
	console.log(JSON.stringify(newSidewalks));
});