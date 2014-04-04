# enamel 

import json

datafile = open('../data/geoJSON/WhereWeWalk_March_2014.geojson', 'r')
data = json.loads(datafile.read())

def properties(timestamp):
	if "time" in timestamp["properties"]:
		return { "time": timestamp["properties"]["time"] }
	else:
		return { 
			"startTime": timestamp["properties"]["startTime"], 
			"endTime": timestamp["properties"]["endTime"]
		}

for feature in data["features"]:
	# timestampList = [{
	# 	"type": "Feature", 
	# 	"geometry": { 
	# 		"type": "Point", 
	# 		"coordinates": timestamp["geometry"]["coordinates"] 
	# 	}, 
	# 	"properties": properties(timestamp)
	# } for timestamp in feature["properties"]["timestamps"] ]
	# timestamps = {
	# 	"type": "FeatureCollection",
	# 	"features": timestampList
	# }
	timestampList = [timestamp["geometry"]["coordinates"][0] for timestamp in feature["properties"]["timestamps"]]
	timestamps = {
		"type": "MultiPoint",
		"coordinates": timestampList
	}



	newFeature = { 
		"type": "FeatureCollection", 
		"features": [
			feature,
			{
				"type": "FeatureCollection", 
				"features": timestamps
			}	
		]
	}
	pathFile = open('../data/geoJSON/package/path-' + str(feature["properties"]["database-id"]) + '.geojson', 'w+')
	timestampFile = open('../data/geoJSON/package/timestamp-' + str(feature["properties"]["database-id"]) + '.geojson', 'w+')
	json.dump(feature, pathFile);
	json.dump(timestamps, timestampFile)
