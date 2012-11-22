# -----------------------------------------------------------------------------------------------
# vxl_obj_importer.py 
# only has has two arguments: the obj file containing the geometry and the mtl file containing the materials (optional)
# Author: dcantor
# -----------------------------------------------------------------------------------------------


import sys
import pdb
from sets import Set

MATERIALS = {}  #dictionary for materials
OBJECTS = {}

VERTICES = []
TEXCOORDS = []
NORMALS = []

VOX_SYNTAX = {'Kd':'color','Ka':'ambient','Ks':'specular'}

FILE = ''

def translate(key):
    if key in VOX_SYNTAX:
        return VOX_SYNTAX[key]
    else:
        return key

def getVertex(idx):
    a = VERTICES[3*idx]
    b = VERTICES[3*idx+1]
    c = VERTICES[3*idx+2]
    return [a,b,c]
    
def getTexture(idx):
    u = TEXCOORDS[2*idx]
    v = TEXCOORDS[2*idx+1]
    return [u,v]

def createWebGLFile():
    mf = open('manifest.txt','w')
    mf.write('original OBJ file: ' + FILE +'\n')
    print('\n=== WebGL Output ===')
    partNumber = 1
    
    for obj_id in OBJECTS:
        for grp_id in OBJECTS[obj_id]['groups']:
            
            grp = OBJECTS[obj_id]['groups'][grp_id]
            
            indices          = grp['indices']
            normals_idx      = grp['normals_idx']
            textures_idx     = grp['textures_idx']
            material_idx     = grp['material'] 

            numIndices = len(indices)
            numIndNormals = len(normals_idx)
            numIndTextures = len(textures_idx)

            #get unique list of indices
            vertexSet = Set()
            vertexList = []            
            for i in indices:
                vertexSet.add(i)
            for j in vertexSet:
                vertexList.append(j)
            vertexList.sort()
            
            indexMap = {}
            for i,j in enumerate(vertexList):
                indexMap[j] = i
            
            
            print ('\n\nWriting file part'+ str(partNumber)+'.json > [ alias: '+grp_id+', indices: ' + str(numIndices/3) + ', tex idx: ' + str(numIndTextures)+']')
            #print(' vertices:[%s]'%','.join(map(str,vertexList)))
            #print(' indices:[%s]'%','.join(map(str,indices)))
            
            mf.write('part'+ str(partNumber)+'.json > alias: '+grp_id+'\n')
            f = open('part'+str(partNumber)+'.json','w')
            
            partNumber +=1
            f.write('{\n')
            f.write('  "alias" : "'+grp_id+'",\n')                 # ALIAS
            
            f.write('  "vertices" : [\n')                         # VERTICES
            for idx in vertexList[0:len(vertexList)-1]:
                v = getVertex(idx-1)  #python arrays are zero based
                f.write('\t')
                for i in v:
                    f.write(str(i)+',')
                f.write('\n')
            
            v2 = getVertex(vertexList[-1]-1)
            f.write('\t'+str(v2[0])+','+str(v2[1])+','+str(v2[2])+'],\n')
            
            f.write('  "indices" : [')                          # INDICES
            
            for item in indices[0:len(indices)-1]:
                f.write(str(indexMap[item])+',')
            f.write(str(indexMap[indices[-1]])+'],\n')
            
            if (numIndTextures > 0):
                f.write('  "texcoords" : [\n')
                for i in vertexList[0:len(vertexList)-1]:
                    j = textures_idx[i]
                    tex = getTexture(j-1)
                    f.write('\t')
                    for j in tex:
                        f.write(str(j)+',')
                    f.write('\n')
                
                t2 = getTexture(textures_idx[vertexList[-1]]-1)
                f.write('\t'+str(t2[0])+','+str(t2[1])+'],\n')

            
                # MATERIALS 
            #print ' group ' +grp+' uses mat = ' + useMat
            if material_idx == '(null)' or len(material_idx) == 0:
                print ('Warning: the group '+grp+' does not have materials')
                continue
            mat = MATERIALS[material_idx]
            numKeys = len(mat)
            currKey = 1;
            for key in mat:
                trkey = translate(key)
                f.write('  "'+trkey+'" : ')
                if type(mat[key]) is float:
                    f.write("%.5f" % mat[key])
                elif type(mat[key]) is int:
                    f.write(str(mat[key]))
                elif type(mat[key]) is list:
                    numNum = len(mat[key])
                    currNum = 1;
                    f.write('[')
                    for num in mat[key]:
                        s = "%.5f" % num
                        f.write(s)
                        if currNum < numNum:
                            f.write(',')
                        currNum +=1
                    f.write(']')
                else: #strings
                    f.write('"' + mat[key] + '"')
                
                if (currKey < numKeys):
                    f.write(',\n')
                else:
                    f.write('\n')
                currKey+=1
            
            f.write('}')
            f.close()
    mf.close();
    
def parseGeometry(file, hasMaterials):    
    print('\n=== Geometry ===')    
    
    LOC_NOWHERE = 0    
    LOC_OBJECT = 1
    LOC_GROUP = 2

    location = LOC_NOWHERE

    material    = {}
    
    nLine = 0
    
    OBJECT_NAME = ''
    GROUP_NAME = ''
    MATERIAL_NAME = ''
     
    for line in open(file, 'r').readlines():
        nLine = nLine + 1
        try:
            if line.startswith('usemtl') and hasMaterials:            #there is a material definition file associated .mtl (second argument on cmd line)
                    words = line.split()
                    if (len(words) == 2):
                        MATERIAL_NAME = words[1]
                    else:
                        MATERIAL_NAME = 'undefined'
                    OBJECTS[OBJECT_NAME]['groups'][GROUP_NAME]['material'] = MATERIAL_NAME
                    print ('\tMaterial: '+MATERIAL_NAME)
            
            elif line.startswith('o '):       #Creates a new object
                location = LOC_OBJECT
                OBJECT_NAME = line.split()[1]
                OBJECTS[OBJECT_NAME]  = {'groups':{}}
                print ('\nObject: ' + OBJECT_NAME)
            
            elif line.startswith('g '):       #Creates a new group
                location = LOC_GROUP
                GROUP_NAME = line.split()[1]
                OBJECTS[OBJECT_NAME]['groups'][GROUP_NAME] = {'indices': [], 'normals_idx': [], 'textures_idx': {}}
                print '\tGroup: ' + GROUP_NAME
                
            
            elif location == LOC_OBJECT:   #Save global information
                if line.startswith('v '):
                    for v in line[1:len(line)].split():
                        VERTICES.append(float(v))
            
                elif line.startswith('vn '):
                    for vn in line[3:len(line)].split():
                        NORMALS.append(float(vn))
                
                elif line.startswith('vt '):
                    for vt in line[3:len(line)].split():
                        TEXCOORDS.append(float(vt))
                        
            elif location == LOC_GROUP:  #Add indices to current group  
                grp = OBJECTS[OBJECT_NAME]['groups'][GROUP_NAME]
                indices         = grp['indices']
                normals_idx     = grp['normals_idx']
                textures_idx    = grp['textures_idx']
                if line.startswith('f '):
                    l = line[1:len(line)].split()
                    pl = len(l)
                    if (pl == 3): 
                        fa = l[0].split('/')
                        fb = l[1].split('/')
                        fc = l[2].split('/')
                        
                        ia = int(fa[0])
                        ib = int(fb[0])
                        ic = int(fc[0])
                        indices.append(ia)
                        indices.append(ib)
                        indices.append(ic)
                        
                        if len(fa)>1 and len(fa[1]) > 0:
                            textures_idx[ia] = int(fa[1])
                            textures_idx[ib] = int(fb[1])
                            textures_idx[ic] = int(fc[1])
                            
                        if len(fa) == 3 and len(fa[2]>0):    
                            normals_idx.append(int(fa[2]))
                            normals_idx.append(int(fb[2]))
                            normals_idx.append(int(fc[2]))
                    else:
                        print ('ERROR: faces need to be triangular')

        except Exception, e:
            print ('ERROR while processing line:  '+str(nLine))
            print line
            print e.message
            raise
    
def parseMaterials(file):
    if (len(file) == 0):
        return False
    print ('\n=== Materials ===')
    linenumber = 0;
    currentMaterial = ''
    for line in open(file, 'r').readlines():
        linenumber = linenumber + 1
        try:
            if line.startswith('newmtl'):
                words = line.split()
                if (len(words) == 2):
                    currentMaterial = words[1]
                else:
                    currentMaterial = 'undefined'
                print ('Material: ' + currentMaterial) 
                MATERIALS[currentMaterial] = {}
            elif line.startswith('illum'):
                words = line.split()
                MATERIALS[currentMaterial][words[0]] = int(words[1])
            elif line.startswith('Ns') or line.startswith('Ni') or line.startswith('d'):
                words = line.split()
                MATERIALS[currentMaterial][words[0]] = float(words[1])
            elif line.startswith('Ka') or line.startswith('Kd') or line.startswith('Ks'):
                words = line.split()
                MATERIALS[currentMaterial][words[0]] = [float(words[1]), float(words[2]), float(words[3])]
            elif line.startswith('map_Kd'):
                words = line.split()
                texfile = words[1]
                tt = texfile.rfind('/')
                if  tt != -1:
                    texfile = texfile[tt+1:len(texfile)]
                MATERIALS[currentMaterial]['texture'] = texfile
            continue
        except:
            print ('Error while processing line '+str(linenumber))
            print line
            raise
    return True
   

if __name__ == '__main__':
   if (len(sys.argv) == 1):
        print ('Usage: python vxl_obj_importer.py objfile.obj mtlfile.mtl')
        sys.exit(0)
   
   print('----------------------------------------------------------')
   print(' Processing: ' + sys.argv[1])
   print('----------------------------------------------------------')
   FILE = sys.argv[1] 
   hasMaterials = (len(sys.argv) == 3)    
   if hasMaterials:
       parseMaterials(sys.argv[2])
   parseGeometry(FILE, hasMaterials)
   createWebGLFile()
   print('----------------------------------------------------------')
   print("                       DONE                               ")
   print('----------------------------------------------------------')     
        
   
