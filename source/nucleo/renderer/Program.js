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
 * <p>Presents a simple interface to communicate with a ESSL (GLSL) program
 * This class is responsible for creating, compiling and linking any ESSL program.
 * It also has methods to query and set uniforms and attributes belonging to the program
 * that is being currently executed in the GPU</P>
 * 
 * <p>a vxlProgram maintains a database of the programs that have been linked to the GPU. 
 * This way, program switching is easier as it is not necessary to go through the 
 * compilation and linking process every time</p>
 * @class
 * @constructor
 */
function vxlProgram (gl) {
    this._gl                = gl;
    this._codebase          = {};

    this._program           = {};
    this._attributeList     = {};
    this._enabledAttributes = [];
    this._uniformList       = {};
    this._uniformType       = {};

    this._uniform_cache     = {};
    
    this._currentWebGLProgram     =  null;
    this._currentProgramID        = "";
    this._currentUniformLocation  = {};
};


/**
 * Register a program in the database
 * @param {JSON} the program to register
 */
vxlProgram.prototype.register = function(glslObject){
	/*@TODO: this method receives a JSON Object we could instead
	 * receive a text file and parse it into JSON. This would make
	 * the writing of shaders much easier.
	 */
	vxl.go.console('Registering program '+ glslObject.ID);
    this._codebase[glslObject.ID] = glslObject;
};

/**
 * Verifies whether a program is loaded in the database or not
 * @param {String} ID program id
 * @returns true if the program is registered, false otherwise
 */
vxlProgram.prototype.isRegistered = function(ID){
	return (this._codebase[ID] != undefined);
};

/**
 * Loads a program
 * @param {String} ID the id of the program to load
 */
vxlProgram.prototype.loadProgram = function(ID){
    
    var code = this._codebase[ID];
    
    var gl   = this._gl;
    var WEB_GL_PROGRAM  = gl.createProgram();
    
    
    if (code.VERTEX_SHADER){
        var vs = this._createShader(vxl.def.glsl.VERTEX_SHADER,code.VERTEX_SHADER);
        gl.attachShader(WEB_GL_PROGRAM, vs);
    }
    
    if (code.FRAGMENT_SHADER){
        var fs = this._createShader(vxl.def.glsl.FRAGMENT_SHADER,code.FRAGMENT_SHADER);
        gl.attachShader(WEB_GL_PROGRAM, fs);
    }
    
    gl.linkProgram(WEB_GL_PROGRAM);
     
    if (!gl.getProgramParameter(WEB_GL_PROGRAM, gl.LINK_STATUS)) {
        alert("Program: Could not link the shading program");
    }
    else{
        //vxl.go.console("Program: the program "+ID+" has been loaded");
    }
    
    this._program[ID] = WEB_GL_PROGRAM;
  
};

/**
 * Verifies if a program is loaded
 * @param {String} ID the program id
 * @returns true if the program is loaded, false otherwise
 */
vxlProgram.prototype.isLoaded = function(ID){
    return (this._program[ID] != undefined);
};

/**
 * Uses a program from the database.
 * If you are not sure if the program you want to use is in the database then call vxlRenderer.setProgram instead
 * @param {String} ID the program id
 * @see vxlRenderer#setProgram
 */
vxlProgram.prototype.useProgram = function(ID){

    var gl = this._gl;
    var WEB_GL_PROGRAM = this._program[ID];
    
    if (WEB_GL_PROGRAM != undefined && WEB_GL_PROGRAM != null){
        
        if (WEB_GL_PROGRAM == this._currentWebGLProgram) return;
        
        //gl.linkProgram(WEB_GL_PROGRAM);
        gl.useProgram (WEB_GL_PROGRAM);
        
        this._currentWebGLProgram = WEB_GL_PROGRAM;
        this._currentProgramID = ID;
        this._parseUniforms();
        
        //vxl.go.console('Program: the program '+ID+' has been linked and is the current program');
    }
    else{
        alert("Program: the program " + ID + " has NOT been loaded");
    }
};

    
/**
 * Loads the uniform defaults for the current program
 */
vxlProgram.prototype.loadDefaults = function(){
    var code = this._codebase[this._currentProgramID];
    
    if ('DEFAULTS' in code){
        //vxl.go.console('Program: defaults for program '+this._currentProgramID+' found. Loading..');
        var defaults = code.DEFAULTS;
        for(var u in defaults){
            this.setUniform(u,defaults[u]);
            //vxl.go.console('Program: Uniform:'+u+', Default Value:'+defaults[u]);
        }
    }
    else{
    	vxl.go.console('Program: WARNING: defaults for program '+this._currentProgramID+' NOT found');
    }
};

/**
 * Sets all the uniforms defined by the object obj
 * @param {Object} an object containing uniform names and values. Every property of this object
 * will be considered a uniform
 */
vxlProgram.prototype.setUniforms = function(obj){
	for(uni in obj){
		this.setUniform(uni,obj[uni]);
	}
};

/**
 * Sets a uniform.
 * Uses polymorphism to make the programmers life happier
 * @param {String} uniform name
 * @param {Object} the value
 */
vxlProgram.prototype.setUniform = function(uniformID, value, hint){
    
    var webGLProgram 		= this._currentWebGLProgram;
    var uniformList 		= this._uniformList[this._currentProgramID];
    var uniformLoc  		= this._currentUniformLocation;
    var uniform_cache 		= this._uniform_cache;
    
    if (uniformList.hasObject(uniformID)){
        uniformLoc[uniformID] = this._gl.getUniformLocation(webGLProgram,uniformID);
        
    }
    else{
    	throw('Program: the uniform '+uniformID+' is not defined for the program '+this._currentProgramID);
        return;
    }
    
    uniform_cache[uniformID] = value;
    this._setPolymorphicUniform(uniformID, uniformLoc[uniformID], value, hint);
};

/**
 * Returns a uniform value from the cache maintained by vxlProgram
 * @param {String} the uniform id
 */
vxlProgram.prototype.getUniform = function(uniformID){
    //TODO: Think about this
    //if(!(name in this._uniformList)){
      //  alert('Program: the uniform ' + name + ' has not been set');
        //return null;
   //}
    return this._uniform_cache[uniformID];
};

/**
 * This method tells the WebGL context how to access the information contained in the
 * WebGL buffer associated with the attribute
 * @param {String} name name of the attribute
 * 
 */
vxlProgram.prototype.setAttributePointer = function(name, numElements, type, norm,stride,offset){
    var a = this._getAttributeLocation(name);
    this._gl.vertexAttribPointer(a,numElements, type, norm, stride, offset);
};

/**
 * Enables a vertex attribute array
 * @param {String} name the name of the attribute array to enable
 */
vxlProgram.prototype.enableAttribute = function(name){
    
   if (this._enabledAttributes.indexOf(name) != -1) return; //Speeds up
     
   var a = this._getAttributeLocation(name);
   this._gl.enableVertexAttribArray(a);
   this._enabledAttributes.push(name);
};

/**
 * Disables a vertex attribute array
 * @param {String} name the name of the attribute array to disable
 * 
 */
vxlProgram.prototype.disableAttribute = function(name){
    
    var idx = this._enabledAttributes.indexOf(name); 
    if (idx != -1) { //so it is enabled
        var a = this._getAttributeLocation(name);
        this._gl.disableVertexAttribArray(a);
        this._enabledAttributes.splice(idx,1);
    }
};

/**
 * Creates a WebGL shader
 * 
 * @private This method is private.
 */
vxlProgram.prototype._createShader = function(type,code){
    var gl      = this._gl;
    var shader = null;
    
    if (type == vxl.def.glsl.VERTEX_SHADER){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (type == vxl.def.glsl.FRAGMENT_SHADER){
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
    

/**
 * Parses uniforms
 * This method is private
 * @private
 * 
 */
vxlProgram.prototype._parseUniforms = function(id){
    
    vs = this._codebase[this._currentProgramID].VERTEX_SHADER;
    fs = this._codebase[this._currentProgramID].FRAGMENT_SHADER;
    /*@TODO: look for a way to retrieve uNames directly from the parsing of the shaders
    this should simplify the structure of the JSON file representing the program*/
    uNames = this._codebase[this._currentProgramID].UNIFORMS;
    
    uTypes = {};
    
    
    for (var i=0;i< uNames.length; i++){
        var uniformID = uNames[i];
        var rex = new RegExp('uniform\\s+\\w+\\s'+uniformID,'g');
        
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
};

/**
 * Obtains an attribute location
 * This method is private
 * @param {String} name
 * @private
 */
vxlProgram.prototype._getAttributeLocation = function(name){

    if(!(name in this._attributeList)){
        this._attributeList[name] = this._gl.getAttribLocation(this._currentWebGLProgram,name);
    }

    return this._attributeList[name];
};

/**
 * This is one of the jewels of Voxelent. Based on the information contained in the 
 * program database, it will do the appropriate gl call to set the uniform
 * This method is private. Use setUniform instead.
 * @see vxlProgram#setUniform
 * @private 
 */
vxlProgram.prototype._setPolymorphicUniform = function(uniformID, locationID,value,hint){

	//In the extend of what it is reasonable,
	//We cross check GLSL type information with actual javascript variable types 
	//to make the right calls
	//hint allows better casting of int and float values. If not specified default is float
    
    var gl = this._gl;
    var glslType = this._uniformType[this._currentProgramID][uniformID];
    
    if (glslType == 'bool'){
    	//if (typeof value != 'boolean') { 
    	//	vxl.go.console('Program: the uniform '+uniformID+' is defined as bool in GLSL. However the JS variable is not');
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
        gl.uniformMatrix4fv(locationID,false,value);
        return;
    }
    
    
    else if (value instanceof Array){
        if (hint  == 'int'){
            switch(value.length){
                case 1: { gl.uniform1iv(locationID,value); break; };
                case 2: { gl.uniform2iv(locationID,value); break; };
                case 3: { gl.uniform3iv(locationID,value); break; };
                case 4: { gl.uniform4iv(locationID,value); break; };
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
