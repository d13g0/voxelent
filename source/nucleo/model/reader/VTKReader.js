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
 * @class Reads VTK files (ASCII)  and creates JSON objects that can be used as models
 * @constructor 
 */
function vxlVTKReader(scene){

    this.scene      = scene; //the scene that will be updated
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
    
    if (filename.length - 4 !== filename.indexOf('.vtk')){
        throw 'vxlVTKReader.read: the file '+file+' is not a VTK file';
    }
    
    modelname = filename.replace(/\.[^/.]+$/, "");
    var reader = new FileReader();
     
    reader.onload = function(event){
        document.body.style.cursor = 'default';
        var contents = event.target.result.trim();
        var lines = contents.split(/\r\n|\r|\n/);
        vtkReader._parse(lines);  
        vtkReader._processIndexBlocks(modelname);
        vxl.go.notifier.fire(vxl.events.READER_DONE, vtkReader);
    };
    
    document.body.style.cursor = 'wait';
    reader.readAsText(file);
};


/**
 * If the VTK file exists in memory as a String (text) then we can
 * use this method to parse it. 
 * 
 * @param {String} name the name of the object
 * @param {String} text the retrieved object contents
 */
vxlVTKReader.prototype.parseText = function(name, text){
    document.body.style.cursor = 'wait'; 
    var lines = text.split(/\r\n|\r|\n/);
    this._parse(lines);  
    this._processIndexBlocks(name);
    vxl.go.notifier.fire(vxl.events.READER_DONE, this);
    document.body.style.cursor = 'default';
};

/**
 * Reads the file line by line and populates the respective arrays
 */
vxlVTKReader.prototype._parse = function(lines){
   this.outputfile = '';
   this.numBlocks = 0;
   this.location = 'NOWHERE';
   var linenumber = 0;
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
                    for(var i= 1; i<tt.length; i++)
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
    }// end foor loop
};

/**
 * Divides the calculated indices into blocks
 * @private
 */
vxlVTKReader.prototype._processIndexBlocks = function(filename){
   this.numBlocks = 0;
   var v_count =  this.vertices.length/3;
   var n_count =  this.normals.length/3;
   var ii_count = this.indices.length;
   var i_count =  ii_count/3;
   var c_count =  this.colors.length/3;
   var pd_count = this.scalars.length;
 
   console.log('vertices:\t' + v_count.toString() +'\nnormals:\t' + n_count.toString() + '\nindices:\t' + ii_count.toString() +'\ntriangles:\t' + i_count.toString() +
             '\nscalars:\t' + pd_count.toString() + '\ncolors:\t'+ c_count.toString()+'\n');
 
    this.numBlocks = parseInt(ii_count/this.ARRAY_SIZE);
    if (ii_count % this.ARRAY_SIZE != 0)
        this.numBlocks  = this.numBlocks + 1;
    console.log( 'Number of Blocks: ' + this.numBlocks.toString());
    
    for(var i=0; i<this.numBlocks; i++){
        this._processBlock(i, filename);
    }
};

/**
 * Process the selected block of indices
 * @private
 */
vxlVTKReader.prototype._processBlock = function(blockID, filename){
    var fid = (blockID + 1).toString();
    var blockname = "";
    
    if (this.numBlocks == 1)
        blockname = filename ;
    else
        blockname = filename + '_' + fid;
        
    var block  = this._weaveBlock(blockID);
    this._writeJSON(blockname, block);
    console.log('Block ['+ fid +'] processed,  output: '+ blockname);
};

/**
 * Calculates the new index array for the block in question
 */
vxlVTKReader.prototype._weaveBlock = function(blockID){

    var lowerBound = this.ARRAY_SIZE*blockID;
    var upperBound = this.ARRAY_SIZE*(blockID+1);

    if (upperBound > this.indices.length){
        upperBound = this.indices.length;
    }
    
    var newindex = {};
    
    var block = {
        vertices: [],   //new vertex array
        indices : [],   //new index array
        scalars : [],   //new scalar array
        colors  : []   //new color array
    };
    
    var hasPointData = (this.scalars.length>0);
    var hasColorData = (this.colors.length>0);
    
    
    // Set of indices to be processed
    var aux = this.indices.slice(lowerBound, upperBound);
    
    taux = aux.length;
    var nidx = -1
    
    
    console.log('Weaving block #' + (blockID+1) + '  ['+ lowerBound+','+upperBound+']');
    
    //for each index to be processed
    for (var i=0; i<taux; i+=1){ 
        //if index hasn't been mapped
        var oidx = aux[i];
        if (newindex[oidx] == undefined){
            nidx++;
            // create new index for the old index (incrementally)
            block.indices.push(nidx);
            // save in the map for posterior searches
            newindex[oidx] = nidx;
            // multiply by three to find the right starting point in the vertex array
            var index = oidx * 3
            // add the correspondent vertex into the new position in the new vertex array
            block.vertices.push(this.vertices[index]);
            block.vertices.push(this.vertices[index+1]);
            block.vertices.push(this.vertices[index+2]);
            // add the correspondent point data if any
            if (hasPointData){
                block.scalars.push(this.scalars[oidx]);
            }
            if (hasColorData){
                block.colors.push(this.colors[index]);
                block.colors.push(this.colors[index+1]);
                block.colors.push(this.colors[index+2]);
            }
        }
        else{
            // if the index was mapped then use it in the new index array
            block.indices.push(newindex[oidx]);
        }
    }
    delete aux;
    return block;

};

/**
 * Creates the JSON object
 * @private 
 */
vxlVTKReader.prototype._writeJSON = function(fname,block){
    
     var jsonPart = new Object();
     
     jsonPart["name"]        = fname;
     jsonPart["vertices"]    = block.vertices.slice(0);
     jsonPart["indices"]     = block.indices.slice(0);
     
     if (block.scalars.length>0){
        jsonPart["scalars"]  = block.scalars.slice(0);
     }
     
     if (block.colors.length >0){
        jsonPart["colors"]   = block.colors.slice(0);
     }
     
     jsonPart["mode"]        = this.mode;
     
     this.parts.push(jsonPart);
};  

/**
 * Once the reader has finished. This method allows retrieving the parsed parts 
 */
vxlVTKReader.prototype.getParts = function(){
    return this.parts;
}