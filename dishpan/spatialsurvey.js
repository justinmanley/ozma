var fs = require('fs');

var geojson = JSON.parse(fs.readFileSync(process.argv[2], { encoding: 'utf8' }));

var extract = (function() {
	function meal(mealType) {
		return function() {
			console.log('{');
			console.log('   "type": "MultiPoint",');
			console.log('   "coordinates": [');
			for (var i = 0; i < geojson.features.length; i++) {
				var feature = geojson.features[i];
				if ( mealType in feature.properties.meals ) {
					console.log("        [" + feature.properties.meals[mealType].coordinates + "],");
				}
			}
			console.log('   ]')
			console.log('}')			
		}
	}

	return {
		breakfast: meal("breakfast"),
		dinner: meal("dinner"),
		lunch: meal("lunch"),
		coffee: meal("coffee")
	};
})();

console.log(extract[process.argv[3]]());