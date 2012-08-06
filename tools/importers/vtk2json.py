# -----------------------------------------------------------------------------------------------
# vxl_vtk_importer.py 
# only has one argument: the name of the vtk file to process (include the extension please)
# Author: dcantor
# -----------------------------------------------------------------------------------------------

import sys
import pdb
from threading import Thread


ARRAY_SIZE = 65536*3

vertices = []
indices = []
normals = []
scalars = []
colors = []

mode = "SOLID"

NOWHERE = 0    
POINTS = 1
LINES = 2
POLYGONS = 3
POINT_DATA = 4
NORMALS = 5
CELL_DATA = 6
TEXTURE_COORDINATES = 7
SCALARS = 8
LOOKUP_TABLE = 9
COLOR_SCALARS = 10

outputfile = ''
numBlocks = 0

# -----------------------------------------------------------------------
# Parses the VTK file
# -----------------------------------------------------------------------
def parseVTK(filename):

    global mode
    location = NOWHERE
    
    linenumber = 0
        
    for line in open(filename, 'r').readlines():
        linenumber = linenumber + 1
        try:
            if line.startswith('POINTS'):
                print(line)
                location = POINTS
                continue
            elif line.startswith('LINES'):
                print(line)
                location = LINES
                mode = "LINES"
                continue
            elif line.startswith('POLYGONS'):
                print(line)
                location = POLYGONS
                continue
            elif line.startswith('POINT_DATA'):
                location = POINT_DATA
                continue
            elif line.startswith('NORMALS'):
                print(line)
                location = NORMALS
                continue
            elif line.startswith('CELL_DATA'):
                print(line)
                location = CELL_DATA
                continue
            elif line.startswith('TEXTURE_COORDINATES'):
                print(line)
                location = TEXTURE_COORDINATES
                continue
            elif line.startswith('SCALARS'):
                print(line)
                location = SCALARS
                continue
            elif line.startswith('LOOKUP_TABLE'):
                print(line)
                location = LOOKUP_TABLE
                continue
            elif line.startswith('COLOR_SCALARS'):
                location = COLOR_SCALARS
                print(line)
                continue
            elif location == POINTS:
                for v in line.split():
                    vertices.append(float(v))
            elif location == LINES:
                tt = line.split()
                if len(tt)>0 and tt[0] == '2':
                    indices.append(int(tt[1]))
                    indices.append(int(tt[2]))
            elif location == POLYGONS: #they have to be triangles
                tt = line.split()
                if len(tt)>0 and tt[0] != '3':
                    raise AssertionError('Not triangles here')
                for i in tt[1:len(tt)]:
                    indices.append(int(i))
            elif location == LOOKUP_TABLE:
                if line.startswith('LOOKUP_TABLE'):
                    continue
                else:
                    for pd in line.split():
                        scalars.append(float(pd))
            elif location == COLOR_SCALARS:
                for n in line.split():
                    colors.append(float(n))
            elif location == NORMALS:
                for n in line.split():
                    normals.append(float(n))
        except:
            print('Error while processing line '+str(linenumber))
            print(line)
            raise
    

# -----------------------------------------------------------------------    
# Divides the calculated indices into blocks
# -----------------------------------------------------------------------
def processIndexBlocks():
    global numBlocks
    v_count = len(vertices)/3
    n_count = len(normals)/3
    ii_count =len(indices)
    i_count = ii_count/3
    c_count = len(colors)/3
    
    pd_count = len(scalars)
    print('vertices:\t' + str(v_count) +'\nnormals:\t' + str(n_count) + '\nindices:\t' + str(ii_count)+'\ntriangles:\t' + str(i_count) + '\nscalars:\t' + str(pd_count) + '\ncolors:\t'+str(c_count)+'\n')    
    #if (v_err or n_err):
    #    print ('vertex error = ' + str(v_err) +', normal error = ' + str(n_err))
        
    numBlocks = ii_count // ARRAY_SIZE
    if(ii_count % ARRAY_SIZE != 0):
        numBlocks = numBlocks + 1
    print( 'Number of Blocks: ' + str(numBlocks))
    
    for i in range(numBlocks):
        #Thread(target=processBlock, args=(vertices, indices, scalars, i)).start()
        processBlock(i,vertices, indices, scalars,colors)
        
# -----------------------------------------------------------------------    
# Selects a block to process
# -----------------------------------------------------------------------    
def processBlock(blockID, pver, pidx, psc, pcol):
     global outputfile
     global numBlocks
     fid = str(blockID + 1)
     if numBlocks == 1:
         filename = outputfile + '.json'
     else:
         filename = outputfile+'_'+fid+'.json'
    
     vtx, idx, pdx, clx = weaveBlock(blockID, pver, pidx, psc, pcol)
     writeJSON(filename,vtx, idx, pdx, clx)
     print ('Block [' + fid +'] processed,  output: '+filename)
    
 
# -----------------------------------------------------------------------
# Calculates new index array for the block in question
# ver - vertices
# ind - indices
# seg - segment
# -----------------------------------------------------------------------
def weaveBlock(blockID, ver,ind, pod,clr):
    lowerBound  = ARRAY_SIZE*blockID
    upperBound = ARRAY_SIZE*(blockID+1)
    if upperBound > len(ind):
        upperBound = len(ind)
    newindex = dict()
    vtxBlock = []   # new vertex array
    idxBlock = []   # new index array
    pdxBlock = []   # new scalar array
    clrBlock = []   # new color array
    
    hasPointData = len(pod)>0
    hasColorData = len(clr)>0
    
    # Set of indices to be processed
    aux = ind[lowerBound:upperBound]
    taux = len(aux)
    nidx = -1
    
    
    print('Weaving block #' + str(blockID+1) + '  ['+str(lowerBound)+','+str(upperBound)+']')
    
    #for each index to be processed
    for i,oidx in enumerate(aux):
        sys.stdout.write('Processing index %d out of %d \r' % (i,taux))
        # if index hasn't been mapped
        if oidx not in newindex.keys():
            nidx = nidx + 1
            # create new index for the old index (incrementally)
            idxBlock.append(nidx)
            # save in the map for posterior searches
            newindex[oidx] = nidx
            # multiply by three to find the right starting point in the vertex array
            index = oidx * 3
            # add the correspondent vertex into the new position in the new vertex array
            vtxBlock.append(ver[index])
            vtxBlock.append(ver[index+1])
            vtxBlock.append(ver[index+2])
            # add the correspondent point data if any
            if hasPointData:
                pdxBlock.append(pod[oidx])
            
            if hasColorData:
                clrBlock.append(clr[index])
                clrBlock.append(clr[index+1])
                clrBlock.append(clr[index+2])
        else:
            # if the index was mapped then use it in the new index array
            idxBlock.append(newindex[oidx])
    print('')
    del aux
    return vtxBlock, idxBlock, pdxBlock, clrBlock

# -----------------------------------------------------------------------    
# Writes a JSON file segment
# -----------------------------------------------------------------------
def writeJSON(fname,ver,ind, pod, clr):
    f = open(fname,'w')
    f.write('{\n')
    # writing vertices    
    f.write('  "vertices" : [')
    for v in ver[0:len(ver)-1]:
        f.write(str(v)+',')
    f.write(str(ver[len(ver)-1])+'],\n')
    
    # writing indices
    f.write('  "indices" : [')
    for i in ind[0:len(ind)-1]:
        f.write(str(i)+',')
    f.write(str(ind[len(ind)-1])+'],\n')
    
    # writing scalars    
    if len(pod) > 0:
        f.write('  "scalars" : [')
        for pd in  pod[0:len(pod)-1]:
            f.write(str(pd)+',')
        f.write(str(pod[len(pod)-1])+'],\n')
        
    # writing colors
    if len(clr) > 0:
        f.write('  "colors" : [')
        for cl in  clr[0:len(clr)-1]:
            f.write(str(cl)+',')
        f.write(str(clr[len(clr)-1])+'],\n')
    
    f.write('  "mode" : "'+mode+'"\n')    
    f.write('}')
    f.close()
    




# -----------------------------------------------------------------------    
# Main function
# -----------------------------------------------------------------------    
def main():
    global outputfile
    if len(sys.argv) != 3:
        print ('Usage: python vxl_vtk_importer.py vtkFile.vtk outputFile')
        exit()
    
    outputfile = sys.argv[2]

    print('----------------------------------------------------------')
    print(' Processing: ' + sys.argv[1])
    print('----------------------------------------------------------')
    parseVTK(sys.argv[1])
    processIndexBlocks()
    print('----------------------------------------------------------')
    print("                       DONE                               ")
    print('----------------------------------------------------------')

if __name__ == '__main__':
    main()
            
    