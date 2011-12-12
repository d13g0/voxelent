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
 * @class
 * @constructor
 */
function vxlProgram (gl) {
    this._gl                = gl;
    this._codebase          = {};

    this._webGLProgram      = {};
    this._attributeList     = {};
    this._uniformList       = {};
    this._uniformType       = {};

    this._uniform_cache     = {};
    
    this._currentWebGLProgram     =  null;
    this._currentProgramID        = "";
    this._currentUniformLocation  = {};
};

vxlProgram.prototype.register = function(id,code){
	console.info('Registering program '+ id);
    this._codebase[id] = code;
};

vxlProgram.prototype.isRegistered = function(id){
	return (this._codebase[id] != undefined);
}
    
vxlProgram.prototype._createShader = function(type,code){
    var gl      = this._gl;
    var shader = null;
    
    if (type == vxl.def.VERTEX_SHADER){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (type == vxl.def.FRAGMENT_SHADER){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    
    if (code == undefined || code == null){
        alert('Error getting the code for shader of type ' + type);
    }
    
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }
    
    return shader;
};
    
vxlProgram.prototype.loadProgram = function(id){
    
    var programCode = this._codebase[id];
    
    var gl   = this._gl;
    var webGLProgram  = gl.createProgram();
    
    
    if (programCode.VERTEX_SHADER){
        var vs = this._createShader(vxl.def.VERTEX_SHADER,programCode.VERTEX_SHADER);
        gl.attachShader(webGLProgram, vs);
    }
    
    if (programCode.FRAGMENT_SHADER){
        var fs = this._createShader(vxl.def.FRAGMENT_SHADER,programCode.FRAGMENT_SHADER);
        gl.attachShader(webGLProgram, fs);
    }
    
    gl.linkProgram(webGLProgram);
     
    if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS)) {
        alert("Program: Could not link the shading program");
    }
    else{
        console.info("Program: the program "+id+" has been loaded");
    }
    
    this._webGLProgram[id] = webGLProgram;
  
};

vxlProgram.prototype.isLoaded = function(id){
	return (this._webGLProgram[id] != undefined);
}

vxlProgram.prototype._parseUniforms = function(id){
	
	vs = this._codebase[this._currentProgramID].VERTEX_SHADER;
	fs = this._codebase[this._currentProgramID].FRAGMENT_SHADER;
	uNames = this._codebase[this._currentProgramID].UNIFORMS;
    
    uTypes = {};
	
	
	for (var i=0;i< uNames.length; i++){
		var uniformID = uNames[i];
		var rex = new RegExp('uniform.*'+uniformID,'g');
		
		if (vs.search(rex) != -1){
			uTypes[uniformID] = vs.substring(vs.search(rex),vs.length).substring(0,vs.indexOf(';')).split(' ')[1];
		}
		
		else if(fs.search(rex) != 1){
			uTypes[uniformID] = fs.substring(fs.search(rex),fs.length).substring(0,fs.indexOf(';')).split(' ')[1];
		}
		
		else{
			alert('Program: In the program '+this._currentProgramID+' the uniform '+uniformID+' is listed but not used');
		}
	}
	
	
	this._uniformList[this._currentProgramID] = uNames;
	this._uniformType[this._currentProgramID] = uTypes; 
}
    
vxlProgram.prototype.useProgram = function(id){
    
    var gl = this._gl;
    var webGLProgram = this._webGLProgram[id];
    
    if (id in this._webGLProgram){
        
        gl.linkProgram(webGLProgram);
        gl.useProgram (webGLProgram);
        
        
        this._currentWebGLProgram = webGLProgram;
        this._currentProgramID = id;
        this._parseUniforms();
        
        console.info('Program: the program '+id+' has been linked and is the current program');
    }
    else{
        alert("Program: the program " + id + " has NOT been loaded");
    }
};

vxlProgram.prototype.loadDefaults = function(){
    var code = this._codebase[this._currentProgramID];
    
    if ('DEFAULTS' in code){
        console.info('Program: defaults for program '+this._currentProgramID+' found. Loading..');
        var defaults = code.DEFAULTS;
        for(var u in defaults){
            this.setUniform(u,defaults[u]);
            console.info('Program: Uniform:'+u+', Default Value:'+defaults[u]);
        }
    }
    else{
    	console.info('Program: WARNING: defaults for program '+this._currentProgramID+' NOT found');
    }
};

vxlProgram.prototype.setUniforms = function(obj){
	//obj is an object where every element is an uniform
	for(uni in obj){
		this.setUniform(uni,obj[uni]);
	}
}

vxlProgram.prototype.setUniform = function(uniformID, value, hint){
    
    var webGLProgram 		= this._currentWebGLProgram;
    var uniformList 		= this._uniformList[this._currentProgramID];
    var uniformLoc  		= this._currentUniformLocation;
    var uniform_cache 		= this._uniform_cache;
    
    if (uniformList.hasObject(uniformID)){
        uniformLoc[uniformID] = this._gl.getUniformLocation(webGLProgram,uniformID);
        
    }
    else{
    	alert('Program: the uniform '+uniformID+' is not defined for the program '+this._currentProgramID);
        return;
    }
    
    uniform_cache[uniformID] = value;
    this._setPolymorphicUniform(uniformID, uniformLoc[uniformID], value, hint);
};


vxlProgram.prototype.getUniform = function(uniformID){
    //TODO: Think about this
    //if(!(name in this._uniformList)){
      //  alert('Program: the uniform ' + name + ' has not been set');
        //return null;
   //}
    return this._uniform_cache[uniformID];
};

vxlProgram.prototype._getAttributeLocation = function(name){

    if(!(name in this._attributeList)){
        this._attributeList[name] = this._gl.getAttribLocation(this._currentWebGLProgram,name)
    }

    return this._attributeList[name];
};

vxlProgram.prototype._setPolymorphicUniform = function(uniformID, locationID,value,hint){

	//In the extend of what it is reasonable,
	//We cross check GLSL type information with actual javascript variable types 
	//to make the right calls
	//hint allows better casting of int and float values. If not specified default is float
    
    var gl = this._gl;
    var glslType = this._uniformType[this._currentProgramID][uniformID];
    
    if (glslType == 'bool'){
    	//if (typeof value != 'boolean') { 
    	//	console.info('Program: the uniform '+uniformID+' is defined as bool in GLSL. However the JS variable is not');
    	//}/
        gl.uniform1i(locationID,value);
        return;
    }
    
    else if (glslType == 'float'){
    	gl.uniform1f(locationID,value);
    	return;
    }
    
    else if (glslType == 'int'){
        gl.uniform1i(locationID,value);
        return;
    }
    
    else if (glslType == 'mat4'){    
    	if (!(value instanceof vxlMatrix4x4)){
    		console.info('Program: the uniform '+uniformID+' is defined as mat4 in GLSL. However the JS variable is not.');
    	}
        gl.uniformMatrix4fv(locationID,false,value.getAsFloat32Array());
        return;
    }
    
    
    else if (value instanceof Array){
        if (hint  == 'int'){
            switch(value.length){
                case 1: { gl.uniform1iv(locationID,value); break };
                case 2: { gl.uniform2iv(locationID,value); break };
                case 3: { gl.uniform3iv(locationID,value); break };
                case 4: { gl.uniform4iv(locationID,value); break };
                default: alert('ERROR');
            }
       }
       else{
            switch(value.length){
                case 1 : { gl.uniform1fv(locationID,value); break; }
                case 2 : { gl.uniform2fv(locationID,value); break; }
                case 3 : { gl.uniform3fv(locationID,value); break; }
                case 4 : { gl.uniform4fv(locationID,value); break; }
                default: alert('ERROR');
            }
       }
    }
    
    else {
    	alert('Program: ERROR. The uniform  '+uniformID+ ' could not be mapped');
    }
};

vxlProgram.prototype.setVertexAttribPointer = function(name, numElements, type, norm,stride,offset){
    var a = this._getAttributeLocation(name);
    this._gl.vertexAttribPointer(a,numElements, type, norm, stride, offset);
};

vxlProgram.prototype.enableVertexAttribArray = function(name){
    var a = this._getAttributeLocation(name);
    this._gl.enableVertexAttribArray(a);
};

vxlProgram.prototype.disableVertexAttribArray = function(name){
    var a = this._getAttributeLocation(name);
    this._gl.disableVertexAttribArray(a);
};

vxlProgram.prototype.setMatrixUniform = function(name,m){
	var u = this._gl.getUniformLocation(this._currentWebGLProgram,name);
	this._gl.uniformMatrix4fv(u,false,m.getAsFloat32Array());
};
