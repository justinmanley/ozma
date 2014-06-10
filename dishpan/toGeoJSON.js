var fs = require('fs'),
	readline = require('readline');

var rd = readline.createInterface({
	input: fs.createReadStream(process.argv[2]),
	output: process.stdout,
	terminal: false
});

console.log('{');
console.log('    "type": "FeatureCollection",');
console.log('    "features": [');

rd.on('line', function(line) {
	var d = line.split(',')

	var database_id = d[0],
		user_id = d[1],
		dataString = d.slice(3,-1).join(","),
		timestamp = d.slice(-1);

	var feature = JSON.parse(dataString);

	console.log('        {');
	console.log('            "type":"Feature",');
	console.log('            "geometry": {');
	console.log('                "type": "LineString",');
	console.log('                "coordinates": [');

	for (var i = 0; i < feature.path.coordinates.length; i++) {
		if (i < feature.path.coordinates.length - 1)
			console.log('                    [' + feature.path.coordinates[i] + '],');
		else
			console.log('                    [' + feature.path.coordinates[i] + ']');			
	}

	console.log('                ]');
	console.log('            },');
	console.log('                "properties": {');
	console.log('                    "user-id": "' + user_id + '",');
	console.log('                    "database-id": ' + database_id + ',');
	console.log('                    "timestamp": "' + timestamp + '",');
	console.log('                    "startTime": \"' + feature.startTime + '\",');
	console.log('                    "endTime": \"' + feature.endTime + '\",');
	console.log('                    "timestamps": [')

	for (var i = 0; i < feature.timestamps.length; i++) {
			console.log('                        {');
			console.log('                            "type": "Feature",');
			console.log('                            "geometry": {');
			console.log('                                "type": "Point",');
			console.log('                                "coordinates": [' + feature.timestamps[i].position.lng + ', ' + feature.timestamps[i].position.lat + ']');
			console.log('                            }');
		if (i < feature.timestamps.length - 1)	
			console.log('                        },');
		else
			console.log('                        }');
	}

	console.log('                    ],');
	console.log('                    "meals": {');

	var numberOfMeals = 0;
	for (meal in feature.meals)
		numberOfMeals += 1;

	var mealsCounter = 0;
	for(meal in feature.meals) {
		mealsCounter += 1;
		if (mealsCounter < numberOfMeals)
			console.log('                        "' + meal + '": ' + JSON.stringify(feature.meals[meal].geometry) + ',');
		else
			console.log('                        "' + meal + '": ' + JSON.stringify(feature.meals[meal].geometry));			
	}

	console.log('                    }');
	console.log('                }');
	console.log('        },');

});

console.log('    ]');
console.log('}');