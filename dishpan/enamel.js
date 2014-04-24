var Terraformer	= require('terraformer'),
	ArcGIS 		= require('terraformer-arcgis-parser'),
	fs 			= require('fs');

fs.readFile('/var/www/ozma/data/geoJSON/WhereWeWalk_March_2014.geojson', { encoding: 'utf8' }, function(err, data) {
	// console.log(JSON.parse(data));
	var features = new Terraformer.FeatureCollection(JSON.parse(data));
	var arcGISFeatures = ArcGIS.convert(features);
	arcGISFeatures.forEach(function(feature) { feature.attributes.OBJECTID = feature.attributes['database-id']; });
	console.log(JSON.stringify(arcGISFeatures));
	// console.log(arcGISFeatures);
});
