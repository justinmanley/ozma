var fs = require('fs');
var Terraformer = require('terraformer');
var GeoStore = require('terraformer-geostore').GeoStore;
var RTree = require('terraformer-geostore-rtree').RTree;
var Memory = require('terraformer-geostore-memory').Memory;
var _ = require('underscore');

var store = new GeoStore({
	store: new Memory(),
	index: new RTree()
});

fs.readFile('data/geoJSON/WhereWeWalk_March_2014.geojson', function(err, data) {
	if (err) throw err;
	var surveyData = new Terraformer.FeatureCollection(JSON.parse(data));
	surveyData.forEach(function(feature, index, coordinates){
		feature.id = feature.properties['database-id'];
	});
	store.add(surveyData);

	var dorms = makeMultipoint(campusPlaces.dorms);
	var diningHalls = makeMultipoint(campusPlaces.diningHalls);

	surveyData.forEach(function(path, index, pathCoordinates){
		var result = [];	
		dorms.forEach(function(dorm, index, dormCoordinates){
			var tolerance = new Terraformer.Circle(dormCoordinates, 500, 32);

			var startPoint = new Terraformer.Point(_.last(path.geometry.coordinates));
			var endPoint = new Terraformer.Point(_.first(path.geometry.coordinates));

			if ( startPoint.within(tolerance) || endPoint.within(tolerance) )
				result.push(dorm);
		});
		console.log(result.length);
	});

	dorms.forEach(function(point, index, coordinates) {
	});

});

function makeMultipoint(collection) {
	var all = [];
	for ( place in collection ) {
		if ( collection.hasOwnProperty(place) )
			all.push(place)
	}
	return new Terraformer.MultiPoint(all);
}

var campusPlaces = {
	dorms: {
		southCampus: new Terraformer.Point(-87.600332, 41.784828),
		maxPalevskyEast: new Terraformer.Point(-87.599051, 41.792437),
		maxPalevskyCentral: new Terraformer.Point(-87.599641, 41.792925),
		maxPalevskySouth: new Terraformer.Point(-87.601087, 41.792629),
		burtonJudson: new Terraformer.Point(-87.600753, 41.785779),
		newGrad: new Terraformer.Point(-87.593910, 41.785881),
		iHouse: new Terraformer.Point(-87.590888, 41.788004),
		broadview: new Terraformer.Point(-87.584185, 41.794118),
		breckinridge: new Terraformer.Point(-87.589794, 41.788058),
		snitchcock: new Terraformer.Point(-87.600882, 41.791127),
		stonyIsland: new Terraformer.Point(-87.587007, 41.791310),
		blackstone: new Terraformer.Point(-87.590388, 41.790104)	
	},
	diningHalls: {
		southCampus: new Terraformer.Point(-87.600467, 41.784968),
		bartlett: new Terraformer.Point(-87.598689, 41.791968)
	}	
}

