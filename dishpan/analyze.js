var fs = require('fs');
var surveystats = require('./surveystats');

var data = JSON.parse(fs.readFileSync(process.argv[2], { encoding: 'utf8' }));			

console.log(JSON.stringify(surveystats[process.argv[3]](data)));

// console.log(surveystats.timestampsPerResponse(data));
// console.log(surveystats.distinctRespondents(data));
// console.log(JSON.stringify(surveystats.pathLength(data)));
// console.log(JSON.stringify(surveystats.timestamps(data)));
// console.log(JSON.stringify(surveystats.timestamps(data).endTimes.distribution));
// console.log(JSON.stringify(surveystats.timestampsPerResponse(data).distribution));

// var endTimes = surveystats.timestamps(data).endTimes.distribution;
// var timestamps = [];
// for (var i = 0; i < endTimes.length; i++) {
// 	timestamps.push(parseFloat(endTimes[i].endtime));
// }
// var timestamps = [];
// for (var i = 0; i < data.features.length; i++) {
// 	var featureTimestamps = data.features[i].properties.timestamps;
// 	for (var j = 0; j < featureTimestamps.length; j++) {
// 		if (typeof featureTimestamps[j].properties.time === 'undefined') {
// 			if ( featureTimestamps[j].properties.endTime !== '' ) {
// 				// console.log(featureTimestamps[j].properties.endTime);
// 				timestamps.push(parseFloat(timestringToInteger(featureTimestamps[j].properties.endTime)));
// 			}
// 		}
// 	}
// }
// console.log(timestamps);

// function timestringToInteger(timeString) {
// 	var regex = /^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$/i;
// 	var parsed = regex.exec(timeString);

// 	var hour = parseInt(parsed[1], 10) % 24;
// 	var minute = typeof parsed[2] === 'undefined' ? 0 : parseInt(parsed[2], 10)/60;

// 	if ( /^P.?M.?$/i.test(parsed[3]) && hour != 12) 
// 		hour += 12; 
// 	if ( /^A.?M.?$/i.test(parsed[3]) && hour == 12 )
// 		hour = 0;

// 	return hour + minute;
// }