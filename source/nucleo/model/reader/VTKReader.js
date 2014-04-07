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
vxlVTKReader.prototype.readFile = function(file){
    var vtkReader = this;
    var filename = file.name;
    
    if (filename.length - 4 !== filename.indexOf('.vtk')){
        throw 'vxlVTKReader.read: the file '+file+' is not a VTK file';
    }
    
    modelname = filename.replace(/\.[^/.]+$/, "");
    var freader = new FileReader();
     
    freader.onload = function(event){
        document.body.style.cursor = 'default';
        var contents = event.target.result.trim();
        var lines = contents.split(/\r\n|\r|\n/);
        vtkReader._parse(modelname,lines);  
        vxl.go.notifier.fire(vxl.events.READER_DONE, vtkReader);
    };
    
    document.body.style.cursor = 'wait';
    freader.readAsText(file);
};


/**
 * If the VTK file exists in memory as a String (text) then we can
 * use this method to parse it. 
 * 
 * @param {String} name the name of the object
 * @param {String} text the retrieved object contents
 */
vxlVTKReader.prototype.readText = function(name, text){
    document.body.style.cursor = 'wait'; 
    var lines = text.split(/\r\n|\r|\n/);
    this._parse(name,lines);  
    vxl.go.notifier.fire(vxl.events.READER_DONE, this);
    document.body.style.cursor = 'default';
};

/**
 * Reads the file line by line and populates the respective arrays
 */
vxlVTKReader.prototype._parse = function(name,lines){
    
   var ARRAY_SIZE = 65536*3;
   var outputfile = '';
   var numBlocks = 0;
   var location = 'NOWHERE';
   var linenumber = 0;
   
   
   var vertices   = [];
   var indices    = [];
   var normals    = [];
   var scalars    = [];
   var colors     = [];
   var mode = "SOLID";
   
   var tags = {
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
    
   this.json = {name:name};
   
   
   function createLineIndices(line){
       var count = line.length  -1;
       if (count != line[0]){
           throw 'Assertion Error. Inconsistent line';
       }
       var values = line.splice(1, count);
       for (var i=0; i<count-1; i+=1){
           indices.push(parseInt(values[i]));
           indices.push(parseInt(values[i+1]));
       }
   } 
    
   for(var linenumber=0; linenumber<lines.length; linenumber++)
   {
    
       try
            {
                if (lines[linenumber].indexOf('POINTS') == 0)
                {
                    console.log(lines[linenumber]);
                    location = tags.POINTS;
                    continue;
                }
                else if (lines[linenumber].indexOf('LINES') == 0)
                {
                    console.log(lines[linenumber]);
                    location = tags.LINES;
                    mode = "LINES";
                    continue;
                }
                else if (lines[linenumber].indexOf('TRIANGLE_STRIPS') == 0){
                    console.log(lines[linenumber]);
                    alert('vxlVTKParser ERROR: \n'+'Triangle Strips Not Supported. Please triangulate first');
                    throw('Triangle Strips Not Supported. Please triangulate first');
                }
                else if (lines[linenumber].indexOf('POLYGONS')==0)
                {
                    console.log(lines[linenumber]);
                    location = tags.POLYGONS;
                    continue;
                }
                else if (lines[linenumber].indexOf('POINT_DATA')==0)
                {                   
                    location = tags.POINT_DATA;
                    continue;
                }
                else if (lines[linenumber].indexOf('NORMALS')==0)
                {      
                    console.log(lines[linenumber]);             
                    location = tags.NORMALS;
                    continue;
                }
                else if (lines[linenumber].indexOf('CELL_DATA')==0)
                {      
                    console.log(lines[linenumber]);             
                    location = tags.CELL_DATA;
                    continue;
                }
                else if (lines[linenumber].indexOf('TEXTURE_COORDINATES')==0)
                {      
                    console.log(lines[linenumber]);             
                    location = tags.TEXTURE_COORDINATES;
                    continue;
                }
                else if (lines[linenumber].indexOf('SCALARS')==0)
                {      
                    console.log(lines[linenumber]);             
                    location = tags.SCALARS;
                    continue;
                }
                else if (lines[linenumber].indexOf('LOOKUP_TABLE')==0)
                {      
                    console.log(lines[linenumber]);             
                    location = tags.LOOKUP_TABLE;
                    continue;
                }   
                else if (lines[linenumber].indexOf('COLOR_SCALARS')==0)
                {      
                    console.log(lines[linenumber]);             
                    location = tags.COLOR_SCALARS;
                    continue;
                }           
                
                // -------------------
                else if(location == tags.POINTS)
                {
                    var v = lines[linenumber].trim().split(' ');
                    if (v == "") continue;
                    for (var i=0; i<v.length; i++)
                    {
                         vertices.push(parseFloat(v[i]));
                    }
                }
                else if(location == tags.LINES)
                {
                    var elements = lines[linenumber].trim().split(' ');
                    if (elements == "") continue;
                    createLineIndices(elements);
                }
               else if(location == tags.POLYGONS) //they have to be triangles
                {
                    var tt = lines[linenumber].trim().split(' ');
                    if (tt=="") continue; 
                    if(tt.length>0 && tt[0] != '3')
                    {
                        throw "Error: please make sure your vtk file contains triangles instead of polygons (triangulate first)";
                    }
                    for(var i= 1; i<tt.length; i++)
                    {
                        indices.push(parseInt(tt[i]));
                    }
                }
                else if(location == tags.LOOKUP_TABLE)
                {
                    if(lines[linenumber].indexOf('LOOKUP_TABLE')==0)
                        continue;
                    else
                    {
                        var pd = lines[linenumber].trim().split(' ');
                        if (pd=="") continue;
                        for(var i=0; i<pd.length; i++)
                        {
                            scalars.push(parseFloat(pd[i]));
                        }
                   }
                }
                else if(location == tags.COLOR_SCALARS)
                {
                    var n = lines[linenumber].trim().split(' ');
                    if (n=="") continue;
                    for(var i=0; i<n.length; i++)
                    {
                        colors.push(parseFloat(n[i]));
                    }
                }
                else if(location == tags.NORMALS)
                {
                    var n = lines[linenumber].trim().split(' ');
                    if (n=="") continue;
                    for(var i=0; i<n.length; i++)
                    {
                        normals.push(parseFloat(n[i]));
                    }
                }
           } 
        catch(err)
            {
            console.log('Error while processing line '+ linenumber.toString());
            throw err;
            }
    }
    
    
    this.json.vertices = vertices;
    this.json.mode     = mode;
    if (indices.length >0)   this.json.indices = indices;
    if (normals.length >0)   this.json.normals = normals;
    if (colors.length  >0)   this.json.colors  = colors;
    if (scalars.length >0)   this.json.scalars = scalars;
    
};


vxlVTKReader.prototype.getModel = function(){
    var model = new vxlModel(this.json.name, this.json);
    this.json = null;
    delete this.json;
    return model;
};

