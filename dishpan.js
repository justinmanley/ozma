fs = require('fs');
esri = require('./esri-geojson/src/jsonConverters');
fs.readFile(process.argv[2], function(err, data) {
	var jsonConverter = esri.geoJsonConverter();
	console.log(JSON.stringify(jsonConverter.toEsri(JSON.parse(data))));
});