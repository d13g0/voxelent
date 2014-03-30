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
 * @class Represents the ESSL source code of each program
 */
function vxlProgram(){
    this.ID = undefined;
    this.ATTRIBUTES = [];
    this.UNIFORMS = [];
    this.VERTEX_SHADER = "";
    this.FRAGMENT_SHADER = "";
    this.DEFAULTS = {};
};

/**
 * @param{prg} the instance to copy
 */
vxlProgram.prototype.copy = function(prg){
    this.ID                 = prg.ID;
    this.ATTRIBUTES         = prg.ATTRIBUTES;
    this.UNIFORMS           = prg.UNIFORMS;
    this.VERTEX_SHADER      = prg.VERTEX_SHADER;
    this.FRAGMENT_SHADER    = prg.FRAGMENT_SHADER;
    this.DEFAULTS           = prg.DEFAULTS;
};

/**
 * Obtain the list of attributes and uniforms from the code
 */
vxlProgram.prototype.introspect = function(){
    
    this.ATTRIBUTES = [];
    this.UNIFORMS = [];
    
    var code = this.VERTEX_SHADER.concat(this.FRAGMENT_SHADER);
    code = code.replace(/(\r\n|\n\r|\n)/gm,"");
    
    var uniforms   = code.match(/(uniform)\s*\w*\s*\w*/g);
    var attributes = code.match(/(attribute)\s*\w*\s*\w*/g);    
    
    if (uniforms.length == 0){
        throw new vxlProgramException("The code for the program "+this.ID+" does not contain any valid uniforms");
    }
    
    if (attributes.length == 0){
        throw new vxlProgramException("The code for the program "+this.ID+" does not contain any valid attributes");
    }
    
    for(var i=0, N = uniforms.length; i < N; i +=1){
        this.UNIFORMS.push(uniforms[i].substr(uniforms[i].lastIndexOf(" ")+1, uniforms[i].length));
    }
    
    for(var i=0, N = attributes.length; i < N; i +=1){
        this.ATTRIBUTES.push(attributes[i].substr(attributes[i].lastIndexOf(" ")+1, attributes[i].length));
    }
    
};
/**
 * Creates a program object from the ESSL scripts embedded in the DOM
 * @param {Object} id
 * @param {Object} vertexShaderId
 * @param {Object} fragmentShaderId
 */
vxlProgram.createFromDOM = function(id, vertexShaderId,fragmentShaderId){

    var prg = new vxlProgram();
    
    prg.ID = id;
    var vsElement   = document.getElementById(vertexShaderId);
    var fsElement = document.getElementById(fragmentShaderId);
    
    if (vsElement == null || fsElement == null){
        throw new vxlProgramException("shaders don't exist");
    }
    
    prg.VERTEX_SHADER = vsElement.innerHTML;
    prg.FRAGMENT_SHADER = fsElement.innerHTML;
    
    prg.introspect();
    
    return prg;
    
};

/**
 * Creates a new program from the JSON definition passed as parameter
 * @param {Object} json
 */
vxlProgram.createFromJSON = function(json){
  
    var prg = new vxlProgram();
     if (json.ID){
       prg.ID = json.ID;
     } //otherwise use the one defined in the constructor
      
     prg.VERTEX_SHADER = json.VERTEX_SHADER;
     prg.FRAGMENT_SHADER = json.FRAGMENT_SHADER;
     prg.DEFAULTS = json.DEFAULTS;      
     prg.introspect();
     
     return prg;
  
};

/**
 * Creates a new program using the URLs... work in progress...
 * @param {Object} id
 * @param {Object} vertexShaderURL
 * @param {Object} fragmentShaderURL
 */
vxlProgram.createFromTextURL = function(id, vertexShaderURL, fragmentShaderURL){
  //TODO: check $ajax with no async  
  //  $.ajax(vs_url, {async: false, dataType: "text"}).done(function(data){m_VertexShaderSource = data;});
  //$.ajax(fs_url, {async: false, dataType: "text"}).done(function(data){m_FragmentShaderSource = data;});
};





/**
 * 
 * @param {Object} message
 */
function vxlProgramException(message){
    this.message = "vxlProgramException:" + message;
};
