/*-------------------------------------------------------------------------
    This file is part of Voxelent's Nucleo

    Nucleo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation version 3.

    Nucleo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Nucleo.  If not, see <http://www.gnu.org/licenses/>.
---------------------------------------------------------------------------*/ 

/**
 * Reads a VTK file and creates the respective JSON(s) file(s).
 * @class
 * @constructor 
 */
function vxlVTKReader(){

    this.ARRAY_SIZE = 65536*3;
    this.vertices   = [];
    this.indices    = [];
    this.normals    = [];
    this.scalars    = [];
    this.colors     = [];

    this.mode = "SOLID";

    this.tags = {
        NOWHERE             : 0,    
        POINTS              : 1,
        LINES               : 2,
        POLYGONS            : 3,
        POINT_DATA          : 4,
        NORMALS             : 5,
        CELL_DATA           : 6,
        TEXTURE_COORDINATES : 7,
        SCALARS             : 8,
        LOOKUP_TABLE        : 9,
        COLOR_SCALARS       : 10
    };
    
    this.parts = [];
    
    vxl.go.notifier.publish(vxl.events.READER_DONE, this);
};

/**
 * Verifies if the HTML5 API is available. 
 */
vxlVTKReader.prototype.isSupported = function(){
    return (window.File && window.FileReader && window.FileList && window.Blob);
};


/**
 * @param {File} file an HTML5 File object
 */
vxlVTKReader.prototype.read = function(file){
    var vtkReader = this;
    var filename = file.name;
    var reader = new FileReader();
    
    reader.onload = function(event){
        var contents = event.target.result.trim();
        var lines = contents.split(/\r\n|\r|\n/);
        vtkReader._parse(lines);  
        vtkReader._processIndexBlocks(filename);
        vxl.go.notifier.fire(vxl.events.READER_DONE, vtkReader);
    };
    
    reader.readAsText(file);
};

/**
 * Reads the file line by line and populates the respective arrays
 */
vxlVTKReader.prototype._parse = function(lines){
/*
 *  outputfile = ''
    numBlocks = 0
    global mode
    location = NOWHERE
    linenumber = 0
        */
       
       this.outputfile = '';
       this.numBlocks = 0;
       this.location = 'NOWHERE';
       var linenumber = 0;
       
       
       /*
    for line in open(filename, 'r').readlines():
        linenumber = linenumber + 1
        */
       for(var linenumber=0; linenumber<lines.length; linenumber++)
       {
        
           try
                {
                    if (lines[linenumber].indexOf('POINTS') == 0)
                    {
                        console.log(lines[linenumber]);
                        this.location = this.tags.POINTS;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('LINES') == 0)
                    {
                        console.log(lines[linenumber]);
                        this.location = this.tags.LINES;
                        this.mode = "LINES";
                        continue;
                    }
                    else if (lines[linenumber].indexOf('POLYGONS')==0)
                    {
                        console.log(lines[linenumber]);
                        this.location = this.tags.POLYGONS;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('POINT_DATA')==0)
                    {                   
                        this.location = this.tags.POINT_DATA;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('NORMALS')==0)
                    {      
                        console.log(lines[linenumber]);             
                        this.location = this.tags.NORMALS;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('CELL_DATA')==0)
                    {      
                        console.log(lines[linenumber]);             
                        this.location = this.tags.CELL_DATA;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('TEXTURE_COORDINATES')==0)
                    {      
                        console.log(lines[linenumber]);             
                        this.location = this.tags.TEXTURE_COORDINATES;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('SCALARS')==0)
                    {      
                        console.log(lines[linenumber]);             
                        this.location = this.tags.SCALARS;
                        continue;
                    }
                    else if (lines[linenumber].indexOf('LOOKUP_TABLE')==0)
                    {      
                        console.log(lines[linenumber]);             
                        this.location = this.tags.LOOKUP_TABLE;
                        continue;
                    }   
                    else if (lines[linenumber].indexOf('COLOR_SCALARS')==0)
                    {      
                        console.log(lines[linenumber]);             
                        this.location = this.tags.COLOR_SCALARS;
                        continue;
                    }           
                    // -------------------
                    else if(this.location == this.tags.POINTS)
                    {
                        var v = lines[linenumber].trim().split(' ');
                        if (v == "") continue;
                        for (var i=0; i<v.length; i++)
                        {
                             this.vertices.push(parseFloat(v[i]));
                        }
                    }
                    else if(this.location == this.tags.LINES)
                    {
                        var tt = lines[linenumber].trim().split(' ');
                        if (tt == "") continue;
                        if(tt.length>0 && tt[0] == '2')
                        {
                            this.indices.push(parseInt(tt[1]));
                            this.indices.push(parseInt(tt[2]));
                        }
                    }
                   else if(this.location == this.tags.POLYGONS) //they have to be triangles
                    {
                        var tt = lines[linenumber].trim().split(' ');
                        if (tt=="") continue; 
                        if(tt.length>0 && tt[0] != '3')
                        {
                            throw "Not triangles here";
                        }
                        for(var i= 0; i<tt.length; i++)
                        {
                            this.indices.push(parseInt(tt[i]));
                        }
                    }
                    else if(this.location == this.tags.LOOKUP_TABLE)
                    {
                        if(lines[linenumber].indexOf('LOOKUP_TABLE')==0)
                            continue;
                        else
                        {
                            var pd = lines[linenumber].trim().split(' ');
                            if (pd=="") continue;
                            for(var i=0; i<pd.length; i++)
                            {
                                this.scalars.push(parseFloat(pd[i]));
                            }
                       }
                    }
                    else if(this.location == this.tags.COLOR_SCALARS)
                    {
                        var n = lines[linenumber].trim().split(' ');
                        if (n=="") continue;
                        for(var i=0; i<n.length; i++)
                        {
                            this.colors.push(parseFloat(n[i]));
                        }
                    }
                    else if(this.location == this.tags.NORMALS)
                    {
                        var n = lines[linenumber].trim().split(' ');
                        if (n=="") continue;
                        for(var i=0; i<n.length; i++)
                        {
                            this.normals.push(parseFloat(n[i]));
                        }
                    }
               } // end try
            catch(err)
                {
                console.log('Error while processing line '+ linenumber.toString());
                //console.log(lines) // what is this for??
                throw err;
                }
        }; // end foor loop
       /*
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
 */    

};


vxlVTKReader.prototype._processIndexBlocks = function(filename){
/*# -----------------------------------------------------------------------    
# Divides the calculated indices into blocks
# -----------------------------------------------------------------------
def processIndexBlocks():
  */
   this.numBlocks = 0;
   var v_count =  this.vertices.length/3;
   var n_count =  this.normals.length/3;
   var ii_count = this.indices.length;
   var i_count =  ii_count/3;
   var c_count =  this.colors.length/3;
   var pd_count = this.scalars.length;
    
 /*
    global numBlocks
    v_count = len(vertices)/3
    n_count = len(normals)/3
    ii_count =len(indices)
    i_count = ii_count/3
    c_count = len(colors)/3
    pd_count = len(scalars)
  */
 
 console.log('vertices:\t' + v_count.toString() +'\nnormals:\t' + n_count.toString() + '\nindices:\t' + ii_count.toString() +'\ntriangles:\t' + i_count.toString() +
             '\nscalars:\t' + pd_count.toString() + '\ncolors:\t'+ c_count.toString()+'\n');
 
 /*
    print('vertices:\t' + str(v_count) +'\nnormals:\t' + str(n_count) + '\nindices:\t' + str(ii_count)+'\ntriangles:\t' + str(i_count) + '\nscalars:\t' + str(pd_count) + '\ncolors:\t'+str(c_count)+'\n')    
    #if (v_err or n_err):
    #    print ('vertex error = ' + str(v_err) +', normal error = ' + str(n_err))
 */
    this.numBlocks = parseInt(ii_count/this.ARRAY_SIZE);
    if (ii_count % this.ARRAY_SIZE != 0)
        this.numBlocks  = this.numBlocks + 1;
    console.log( 'Number of Blocks: ' + this.numBlocks.toString());
    
    for(var i=0; i<this.numBlocks; i++){
        this._processBlock(i, filename);
    }

/*
    numBlocks = ii_count // ARRAY_SIZE
    if(ii_count % ARRAY_SIZE != 0):
        numBlocks = numBlocks + 1
    print( 'Number of Blocks: ' + str(numBlocks))
    
    for i in range(numBlocks):
        #Thread(target=processBlock, args=(vertices, indices, scalars, i)).start()
        processBlock(i,vertices, indices, scalars,colors)*/
    
};

vxlVTKReader.prototype._processBlock = function(blockID, filename){
/*
# -----------------------------------------------------------------------    
# Selects a block to process
# -----------------------------------------------------------------------    
def processBlock(blockID, pver, pidx, psc, pcol):
*/

    var pver = this.vertices;
    var pidx = this.indices;
    var psc = this.scalars;
    var pcol = this.colors;
    
    var fid = (blockID + 1).toString();
    var blockname = "";
    
    if (this.numBlocks == 1)
        blockname = filename ;
    else
        blockname = filename + '_' + fid;
        
    //  _weaveBlock(blockID);
    this._writeJSON(filename, pver, pidx, psc, pcol);
    console.log('Block ['+ fid +'] processed,  output: '+ blockname);

/*

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
    
 */
};

vxlVTKReader.prototype._weaveBlock = function(blockID){
/*    
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
    #item = 1
    
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
            # add the correspondant vertex into the new position in the new vertex array
            vtxBlock.append(ver[index])
            vtxBlock.append(ver[index+1])
            vtxBlock.append(ver[index+2])
            # add the correspondant point data if any
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
*/
};

vxlVTKReader.prototype._writeJSON = function(fname,ver,ind,pod,clr){
  /*
# -----------------------------------------------------------------------    
# Writes a JSON file segment
# -----------------------------------------------------------------------
def writeJSON(fname,ver,ind, pod, clr):
  */
 
     var jsonPart = new Object();
     jsonPart["vertices"]    = ver.slice(0);
     jsonPart["indices"]     = ind.slice(0);
     
     if (pod.length>0){
        jsonPart["scalars"]  = pod.slice(0);
     }
     
     if (clr.length >0){
        jsonPart["colors"]   = clr.slice(0);
     }
     
     jsonPart["mode"]        = this.mode;
     
     this.parts.push(jsonPart);
       
    
 /*  
    f = fileReader();
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
  */
 };  

/**
 * Once the reader has finished. This method allows retrieving the parsed parts 
 */
vxlVTKReader.prototype.getParts = function(){
    return this.parts;
}