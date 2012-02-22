import sys,string

#map2json.py only has one argument: the name of the vtk file to process (include the extension please)

	
def writejson(fname,d):
	f = open(fname,'w')
	f.write('{\n')
	for i in range(len(d)):
		f.write('"'+str(i)+'" : [')
		for j in d[i][0:2]:
			f.write(str(j)+',')
		if(i < len(d)-1):
			f.write(str(d[i][2])+'],\n')
		else:
			f.write(str(d[i][2])+']\n')
	#f.write('"count":' + str(len(d)) +'\n');
	f.write('}')
	f.close()

	

data = []
trupla = []

linenumber = 0;

for line in open(sys.argv[1], 'r').readlines():
	linenumber = linenumber + 1
	try:
		if linenumber <=2:
			continue
		else:
			tt = line.split()
			if len(tt) != 3:
				raise AssertionError('No valid data here')
			trupla = []
			for i in tt:
				trupla.append(float(i))
			data.append(trupla)
	except:
		print 'Error while processing line '+str(linenumber)
		print line
		raise

v_count = len(data)

print 'count = ' + str(v_count) 
fname = sys.argv[1][:-4] + '.lut'
writejson(fname,data)


