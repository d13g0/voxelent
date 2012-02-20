import sys,string,traceback
from threading import Thread

#vox-obj-importer.py only has one argument: the name of the obj file to process (include the extension please)

ARRAY_SIZE = 65536*3
# ver - vertices
# ind - indices
# seg - segment

def reindexBlock(ver,ind, pod, blockID):
    lowerBound  = ARRAY_SIZE*blockID
    upperBound = ARRAY_SIZE*(blockID+1);
    if upperBound > len(ind):
        upperBound = len(ind)
    newindex = dict()
    mapIndexToVertex = dict()
    vtxBlock = []
    idxBlock = []
    pdxBlock = []
    hasPointData = len(pod)>0
    # Set of indices to be processed
    aux = ind[lowerBound:upperBound]
    nidx = -1
    #item = 1
    
    print 'Processing block #' + str(blockID+1) + '['+str(lowerBound)+','+str(upperBound)+']'
    
    try:
    #for each index to be processed
        for oidx in aux:
            # if index hasn't been mapped
            if oidx not in newindex.keys():
                nidx = nidx + 1
                # create new index for the old index (incrementally)
                idxBlock.append(nidx)
                # save in the map for posterior searches
                newindex[oidx] = nidx
                # multiply by three to find the right starting point in the vertex array
                index = oidx * 3
                # add the correspondant vertex into the new position in the new vertex array
                vtxBlock.append(ver[index])
                vtxBlock.append(ver[index+1])
                vtxBlock.append(ver[index+2])
                # add the correspondant point data if any
                if hasPointData :
                    pdxBlock.append(pod[oidx])
            else:
                # if the index was mapped then use it in the new index array
                idxBlock.append(newindex[oidx])
    except:
        #traceback.print_stack()
        raise
    return vtxBlock, idxBlock, pdxBlock
  
    
def createFileBlock(vertices, indices, scalars, blockID):
    fname = sys.argv[1][:-4]
    vv, ii, dd = reindexBlock(vertices, indices, scalars, blockID)
    filename =fname+'_'+str(blockID)+'.json'
    createWebGLFile(filename,vv,ii,dd)
    print 'Block #' + str(blockID) +' processed'

  
  
 
def createWebGLFile(fname,ver,ind,count):
    ilen = len(ind)
    vlen = len(ver)/3
    rvlen = len(ver)
    imin = min(ind)
    print 'Writing file pr'+ str(count)+'.json > '+ fname +' [ vertices:' + str(vlen) + ', indices: ' + str(ilen) +']'
    f = open('pr'+str(count)+'.json','w')
    f.write('{\n')
    f.write('  "obj_name" : "'+fname+'",\n')
    f.write('  "vertices" : [')
    for v in ver[0:rvlen-1]:
        f.write(str(v)+',')
    f.write(str(ver[rvlen-1])+'],\n')
    f.write('  "indices" : [')
    #Given that in an obj file the indexes are continuous from group to group...
    #the following line makes sure that each file has indexes that are ZERO based
    
    indx = [x-imin for x in ind]
    for i in indx[0:ilen-1]:
        f.write(str(i)+',')
    f.write(str(indx[ilen-1])+']')
    f.write('\n');
    f.write('}')
    f.close()
    
NOWHERE = 0    
GROUP = 1

location = NOWHERE

vertices = []
indices = []
normals = []
scalars = []

linenumber = 0
group_count = 0
name = 'anonymous'

for line in open(sys.argv[1], 'r').readlines():
    linenumber = linenumber + 1
    try:
        if line.startswith('g '):
            group_count = group_count + 1
            #save results from last group
            lv = len(vertices)
            lf = len(indices)
            if (lv >0 and lf >0):
                createWebGLFile(name, vertices,indices,group_count-1)
                vertices = []
                indices = []
            location = GROUP 
            name = line[1:line.find('\n')]
            continue
        elif location == GROUP:
            if line.startswith('v '):
                for v in line[1:len(line)].split():
                    vertices.append(float(v))
            elif line.startswith('f '):
                f = line[1:len(line)].split()
                pl = len(f)
                if (pl == 4):
                    #as the face is abcd and we need triangles
                    #change from a-b-c-d to a-b-c a-c-d
                    fa = int(f[0][0:f[0].find('/')]);
                    fb = int(f[1][0:f[1].find('/')]);
                    fc = int(f[2][0:f[2].find('/')]);
                    fd = int(f[3][0:f[3].find('/')]);              
                    indices.append(fa)
                    indices.append(fb)
                    indices.append(fc)
                    indices.append(fa)
                    indices.append(fc)
                    indices.append(fd)
                elif (pl == 3):
                    fa = int(f[0][0:f[0].find('/')]);
                    fb = int(f[1][0:f[1].find('/')]);
                    fc = int(f[2][0:f[2].find('/')]);
                    indices.append(fa)
                    indices.append(fb)
                    indices.append(fc)
                else:
                    print 'special face: ' + str(pl) + ' elements in line: ' + str(linenumber) 
                    fa = int(f[0][0:f[0].find('/')])
                    for i in range(pl-3):
                        fb = int(f[i+1][0:f[i+1].find('/')]);
                        fc = int(f[i+2][0:f[i+2].find('/')]);
                        indices.append(fa)
                        indices.append(fb)
                        indices.append(fc)
            continue
    except:
        print 'Error while processing line '+str(linenumber)
        print line
        raise
createWebGLFile(name,vertices,indices,group_count)
print 'END'
