import xml.etree.ElementTree as ET

data = ET.parse('../data/gexf/data.gexf')
root = data.getroot()
ns = "{http://www.gexf.net/1.2draft}"
vertices = {}

lastPath = root.findall("./"+ns+"graph/"+ns+"edges/"+ns+"edge[last()]")[0]

for vertex in root[1][2]:
	vertices[vertex.attrib['id']] =  vertex[0][1].attrib['value'] + ', ' + vertex[0][0].attrib['value']

print '{'
print '    "type": "FeatureCollection",'
print '    "features": ['

for path in root[1][3]:	
	print 8*' ' + '{'
	print 8*' ' + '    "type": "Feature",'
	print 8*' ' + '    "geometry": {'
	print 8*' ' + '        "type": "LineString",'
	print 8*' ' + '        "coordinates": ['
	print 8*' ' + '            [' + vertices[path.attrib['source']] + '],'
	print 8*' ' + '            [' + vertices[path.attrib['target']] + ']'
	print 8*' ' + '        ]'
	print 8*' ' + '    },'
	print 8*' ' + '    "properties": {'
	print 8*' ' + '        "lineWeight": ' + path[0][0].attrib['value']
	print 8*' ' + '    }'
	if path.attrib['id'] == lastPath.attrib['id']:
		print 8*' ' + '}'
	else:
		print 8*' ' + '},'

print '    ]'
print '}'