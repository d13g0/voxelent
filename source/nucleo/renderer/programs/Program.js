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
    this.DEFAULTS = [];
};


/**
 * Creates a program object from the ESSL scripts embedded in the DOM
 * @param {Object} id
 * @param {Object} vertexShaderId
 * @param {Object} fragmentShaderId
 */
vxlProgram.prototype.createFromDOM = function(id, vertexShaderId,fragmentShaderId){

    
    this.ID = id;
    var vsElement   = document.getElementById(vertexShaderId);
    var fsElement = document.getElementById(fragmentShaderId);
    
    if (vsElement == null || fsElement == null){
        throw new vxlProgramException("shaders don't exist");
    }
    
    this.VERTEX_SHADER = vsElement.innerHTML;
    this.FRAGMENT_SHADER = fsElement.innerHTML;
    
    this.introspect();
    
    
};


vxlProgram.prototype.createFromJSON = function(json){
  

  if (json.ID){
    this.ID = json.ID;
  } //otherwise use the one defined in the constructor
  
  this.VERTEX_SHADER = json.VERTEX_SHADER;
  this.FRAGMENT_SHADER = json.FRAGMENT_SHADER;
  this.DEFAULTS = json.DEFAULTS;
  
  this.introspect();
  

  
};


vxlProgram.prototype.createFromTextURL = function(id, vertexShaderURL, fragmentShaderURL){
  //TODO: check $ajax with no async  
  //  $.ajax(vs_url, {async: false, dataType: "text"}).done(function(data){m_VertexShaderSource = data;});
  //$.ajax(fs_url, {async: false, dataType: "text"}).done(function(data){m_FragmentShaderSource = data;});
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


function vxlProgramException(message){
    this.message = "vxlProgramException:" + message;
};
