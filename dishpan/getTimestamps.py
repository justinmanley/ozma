import json, sys, re

def _decode_list(data):
    rv = []
    for item in data:
        if isinstance(item, unicode):
            item = item.encode('utf-8')
        elif isinstance(item, list):
            item = _decode_list(item)
        elif isinstance(item, dict):
            item = _decode_dict(item)
        rv.append(item)
    return rv

def _decode_dict(data):
    rv = {}
    for key, value in data.iteritems():
        if isinstance(key, unicode):
            key = key.encode('utf-8')
        if isinstance(value, unicode):
            value = value.encode('utf-8')
        elif isinstance(value, list):
            value = _decode_list(value)
        elif isinstance(value, dict):
            value = _decode_dict(value)
        rv[key] = value
    return rv

def isValidTime(timeString):
	pattern = re.compile("^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$", re.IGNORECASE)
	result = re.match(pattern, timeString)
	return not (not result)	

def fixTime(timeString):
	pattern = re.compile("^(\d|[1][0-2])(?::)?([0-5]\d)?\s?(AM|PM)$", re.IGNORECASE)
	result = re.match(pattern, timeString)
	if result == None:
		time = timeString
		print time
	else:
		am = re.compile("^AM$", re.IGNORECASE)
		pm = re.compile("^PM$", re.IGNORECASE)

		time = result.group(1);

		if (result.group(2) != None):
			time = time + ':' + result.group(2)

		if ( re.match(am, result.group(3))):
			time += 'am'
		elif (re.match(pm, result.group(3))):
			time += 'pm'

	return time

datafile = open(sys.argv[1])
pathData = json.load(datafile, object_hook=_decode_dict)

print '{'
print '    "type": "FeatureCollection",'
print '    "features": ['

for feature in pathData["features"]:
	pathId = feature["properties"]["database-id"]
	for timestamp in feature["properties"]["timestamps"]:
		badTimes = 0
		if "time" in timestamp["properties"]:
			if (not isValidTime(timestamp["properties"]["time"])): badTimes += 1 
		else:
			if (not isValidTime(timestamp["properties"]["endTime"])): badTimes += 1
			elif (not isValidTime(timestamp["properties"]["startTime"])): badTimes += 1

		if badTimes == 0:
			print '        {'
			print '            "type": "Feature",'
			print '            "geometry": {'
			print '                "type": "Point",'
			print '                "coordinates": ' + str(timestamp["geometry"]["coordinates"][0])
			print '            },'
			print '            "properties": {'
			print '                "path-id": ' + str(pathId) + ','


			if "time" in timestamp["properties"]:
				print '                "time": "' + str(fixTime(timestamp["properties"]["time"])) + '"'
			else:
				print '                "endTime": "' + str(fixTime(timestamp["properties"]["endTime"])) + '",'
				print '                "startTime": "' + str(fixTime(timestamp["properties"]["startTime"])) + '"'

			print '            }'
			print '        },'

print '    ]'
print '}'
