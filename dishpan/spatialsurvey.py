import json
import sys

def lines(filename):
	with open(filename) as f:
		for i, l in enumerate(f):
			pass
	return i + 1

datafile = open(sys.argv[1], 'r')
dataArray = []

print '{'
print '    "type": "FeatureCollection",'
print '    "features": ['

for line in datafile:
	print '        {'
	print '            "type":"Feature",'
	print '            "geometry": {'
	print '                "type": "LineString",'
	print '                "coordinates": ['

	d = line.split(',')

	database_id = d[0]
	user_id = d[1]
	dataString = ''.join(d[3:-1])
	timestamp = d[-1]

	print '                ],'
	print '                "properties": {'
	print '                    "user-id": ' + user_id + ','
	print '                    "database-id": ' + database_id + ','
	print '                    "timestamp": ' + timestamp + ','
	print '                }'
	print '            }'
	print '        },'

print '    ]'
print '}'