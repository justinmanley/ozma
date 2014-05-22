var fs = require('fs');
var surveystats = require('./surveystats');

var data = JSON.parse(fs.readFileSync(process.argv[2], { encoding: 'utf8' }));			

console.log(surveystats.timestampsPerResponse(data));
console.log(surveystats.distinctRespondents(data));
console.log(surveystats.pathLength(data));
console.log(surveystats.timeDuration(data));
console.log(surveystats.timestamps(data));
