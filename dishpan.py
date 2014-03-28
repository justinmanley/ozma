#!/usr/bin/python
import json, sys

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

def printIndented(text, indentationLevel):
    print indentationLevel*4*' ' + text

def printCoordinate(coordinate, indentationLevel, withTrailingComma):
    if withTrailingComma: 
       printIndented('[ ' + str(coordinate['lng']) + ', ' + str(coordinate['lat']) + ' ],', indentationLevel)
    else:
        printIndented('[ ' + str(coordinate['lng']) + ', ' + str(coordinate['lat']) + ' ]', indentationLevel)    

def printTimeString(time, label, indentationLevel, withTrailingComma):
    if withTrailingComma:
        printIndented('        "' + label + '": ' + '"' + time + '",' , indentationLevel)
    else:
        printIndented('        "' + label + '": ' + '"' + time + '"' , indentationLevel)        

def printTimestamp(timestamp, indentationLevel, withTrailingComma):
    printIndented('{', indentationLevel)
    printIndented('    "type": "feature",', indentationLevel)
    printIndented('    "geometry": {', indentationLevel)
    printIndented('        "type": "Point",', indentationLevel)
    printIndented('        "coordinates": [', indentationLevel)

    printCoordinate(timestamp['position'], indentationLevel + 3, False) 

    printIndented('        ]', indentationLevel)
    printIndented('    },', indentationLevel)
    printIndented('    "properties": {', indentationLevel)

    if 'time' in timestamp: 
        printTimeString(timestamp['time'], 'time', indentationLevel, False)
    else:
        printTimeString(timestamp['startTime'], 'startTime', indentationLevel, True)
        printTimeString(timestamp['endTime'], 'endTime', indentationLevel, False)        

    printIndented('    }', indentationLevel)

    if withTrailingComma:
        printIndented('},', indentationLevel)
    else:
        printIndented('}', indentationLevel)

datafile = open(sys.argv[1])
json = json.load(datafile, object_hook=_decode_dict)

thisRecordNumber = sys.argv[2]
totalRecordNumber = sys.argv[3]

newPathData = {}

# ----------------------------------------------------

print '        {'
print '            "type": "Feature",'
print '            "geometry": {'
print '                "type":"LineString",'
print '                "coordinates": ['

for index, coordinate in enumerate(json['response']['path']):
    if index + 1 < len(json['response']['path']): 
        printCoordinate(coordinate, 5, True)
    else:
        printCoordinate(coordinate, 5, False)

print '                ]'
print '            },'
print '            "properties": {'
print '                "database-id": ' + str(json['database-id']) + ','
print '                "user-id": ' + '"' + str(json['user-id']) + '",'
print '                "submission-timestamp": ' + '"' + str(json['submission-timestamp']) + '",'
print '                "startTime": "' + str(json['response']['startTime']) + '",'
print '                "endTime": "' + str(json['response']['endTime']) + '",'
print '                "timestamps": ['

for index, timestamp in enumerate(json['response']["timestamps"]):
    if index + 1 < len(json['response']['timestamps']): 
        printTimestamp(timestamp, 5, True)
    else:
        printTimestamp(timestamp, 5, False)

print '                ]'
print '            }'

if int(thisRecordNumber) + 1 < int(totalRecordNumber):
    print '        },'
else:
    print '        }'    