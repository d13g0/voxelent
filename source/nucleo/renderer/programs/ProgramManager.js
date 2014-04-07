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
 * <p>a vxlProgramManager maintains a database of the programs that have been linked to the GPU. 
 * This way, program switching is easier as it is not necessary to go through the 
 * compilation and linking process every time
 * 
 * <p>
 * The program manager simplifies working with ESSL programs. It provides
 * get/set operations for attributes and uniforms and handles internally the location variables
 * of these elements which are required to operate with them in the GPU. In other words
 * it hides gl.getAttribLocation and gl.getUniformLocation calls.
 * </p>
 * <p>
 * The program manager catches uniforms and only updates the GPU if needed.  
 * </p>
 * <p>The program manager is available through the <code>pm</code> attribute  of vxlEngine
 * </p>
 * @class
 * @constructor
 */
function vxlProgramManager (gl) {
    
    this._gl                     = gl;
    this._registered_programs    = {};
    this._programs        = {};
    
    
    this._uniform_map            = {};
    this._uniform_types          = {};
    
    
    this._current_program_object   =  null;
    this._current_program_ID       = undefined;
    this._curr_uniform_loc_map     = {};
    this._curr_uniform_cache       = {};
    this._curr_attribute_loc_map       = {};
    this._enabled_attribute_list   = [];
    this._defaults                 = [];
 
    this._one_time_warning         = false;
    this._program_enforced         = false;
    
};

/**
 * Verifies whether a program is loaded in the database or not
 * @param {String} ID program id
 * @returns true if the program is registered, false otherwise
 */
vxlProgramManager.prototype._isProgramRegistered = function(ID){
    return (this._registered_programs[ID] != undefined);
};

/**
 * Register a program in the database
 * @param {JSON} the program to register
 */
vxlProgramManager.prototype._registerProgram = function(program){
	/*@TODO: this method receives a JSON Object we could instead
	 * receive a text file and parse it into JSON. This would make
	 * the writing of shaders much easier.
	 */
	vxl.go.console('Registering program '+ program.ID);
    this._registered_programs[program.ID] = program;
};

/**
 * Verifies if a program is loaded
 * @param {String} ID the program id
 * @returns true if the program is loaded, false otherwise
 */
vxlProgramManager.prototype._isProgramCreated = function(ID){
    return (this._programs[ID] != undefined);
};

/**
 * Loads a program
 * @param {String} ID the id of the program to load
 */
vxlProgramManager.prototype._createProgramObject = function(ID){
    
    if (this._isProgramCreated(ID)){
        return;
    }
    
    var code = this._registered_programs[ID];
    
    if (code == undefined){
        var message = 'vxlProgramManager.loadProgram ERROR: '+
        ' The program '+ID+' must be registered first!';
        console.error(message);
        return;
    }
    
    var gl   = this._gl;
    var prg  = gl.createProgram();
    var essl = vxl.def.essl;
    
    if (code.VERTEX_SHADER){
        var vs = this._createShader(essl.VERTEX_SHADER,code.VERTEX_SHADER);
        gl.attachShader(prg, vs);
    }
    
    if (code.FRAGMENT_SHADER){
        var fs = this._createShader(essl.FRAGMENT_SHADER,code.FRAGMENT_SHADER);
        gl.attachShader(prg, fs);
    }
    
    //fix for version 0.89.2 Making sure that the vertex array is ALWAYS the attribute with location 0
    gl.bindAttribLocation(prg, 0 , essl.VERTEX_ATTRIBUTE);
    
    gl.linkProgram(prg);
     
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        
        alert(ID+":\n\n "+gl.getProgramInfoLog(prg));
        throw("Error linking program "+ID+":\n\n "+gl.getProgramInfoLog(prg));
    }
    
    this._programs[ID] = prg;
  
};


/**
 * Uses a program from the database.
 * If you are not sure if the program you want to use is in the database then call vxlRenderer.setProgram instead
 * @param {String} ID the program id
 * @see vxlRenderer#setProgram
 */
vxlProgramManager.prototype.useProgram = function(ID){

    var gl = this._gl;
    var prg = this._programs[ID];
    
    if (prg != undefined && prg != null){
        
        if (prg == this._current_program_object) return; //don't change if current
        
        //gl.linkProgram(esslProgram);
        gl.useProgram (prg);
        
        this._current_program_object = prg;
        this._current_program_ID = ID;
        this._parseUniforms();
        this._one_time_warning  = false;
    }
    else{
        alert("Program: the program " + ID + " has NOT been loaded");
    }
};

vxlProgramManager.prototype.releaseProgram = function(){
     this._enforce = false;
};

/**
 * Tries to add a new program definition to this renderer
 * @param {vxlProgram} p_program an instance of a vxlProgram object or one of its descendants
 */
vxlProgramManager.prototype.setProgram = function(p_program, p_force_it){
    
    var instance = undefined;
    //Create a new instance
    if (typeof p_program == 'function'){
        instance  = new p_program();
    }
    //Use this instance
    else if (typeof p_program == 'object'){
        instance = p_program;
    }
    else{
        console.error('vxlProgramManager.setProgram ERROR: '+p_program+' is not an engine');
        return;
    }
    
    
    if (this._enforce && instance.ID != this._current_program_id){
        var message = 'vxlProgramManager.setProgram WARN: '+
        'Unable to set the program '+instance.ID+'.\n'+
        'The current program ['+instance.ID+ '] is being enforced\n'+
        'Please use releaseProgram first.';
        console.warn(message);
        return;
    }
    
    this._program_enforced = (p_force_it != undefined && p_force_it == true);
    //register
    if (!this._isProgramRegistered(instance.ID)){ this._registerProgram(instance);        }
    
    //create
    if (!this._isProgramCreated(instance.ID)) { this._createProgramObject(instance.ID); }
    
    //use
    this.useProgram(instance.ID);
    this.clearCache();  //@TODO: what happens when we switch programs back and forth?
    this.loadDefaults();
    
};

vxlProgramManager.prototype.clearCache = function(){
    this._curr_uniform_cache = {};
    this._curr_uniform_loc_map ={};
    this._curr_attribute_loc_map = {};
};


    
/**
 * Loads the uniform defaults for the current program
 */
vxlProgramManager.prototype.loadDefaults = function(){
    var code = this._registered_programs[this._current_program_ID];
   
    if ('DEFAULTS' in code){
    
        var defaults = code.DEFAULTS;
        
        
        for(var u in defaults){
            this.setUniform(u,defaults[u]);
        }
    }
    //overriding defaults
    var defaults = this._defaults[this._current_program_ID];
    if (defaults != undefined){
  
        for (var u in defaults){
            this.setUniform(u,defaults[u]);
        }
    }
   
};

/**
 * Overrides defaults by hand 
 */
vxlProgramManager.prototype.setDefault = function(programID, uniformName, value){
    
    if (this._defaults[programID] == undefined){
        this._defaults[programID] = {};
    }
  
    this._defaults[programID][uniformName] = value;
    
    //Overriding behaviour
    if (programID == this._current_program_ID){
        this.setUniform(uniformName, value);
    }
};


/**
 * Overrides defaults by hand 
 */
vxlProgramManager.prototype.getDefault = function(programID, uniformName){
    
    if (this._defaults[programID] == undefined){
        return undefined;
    }
  
    return this._defaults[programID][uniformName];
};

/**
 * Sets all the uniforms defined by the object obj
 * @param {Object} p_dictionary an object containing uniform names and values. Every property of this object
 * will be considered a uniform
 */
vxlProgramManager.prototype.setUniforms = function(p_dictionary){
	for(key in p_dictionary){
		this.setUniform(key,p_dictionary[key]);
	}
};

/**
 * Sets a uniform. Caches the uniform location.
 * 
 * Uses polymorphism to make the programmers life happier
 * @param {String} p_uniform_id name
 * @param {Object} p_value the uniform value 
 */
vxlProgramManager.prototype.setUniform = function(p_uniform_id, p_value, hint){
    var gl                  = this._gl;
    var prg          		= this._current_program_object;
    var uniform_list  		= this._uniform_map[this._current_program_ID];
    var uniform_loc_map	    = this._curr_uniform_loc_map;
    var uniform_cache 		= this._curr_uniform_cache;
    var uniform_types       = this._uniform_types[this._current_program_ID];
    var loc                 = undefined;
    var reset               = false;
    
    if (uniform_list.indexOf(p_uniform_id) == -1){
        console.warn('vxlProgramManager.setUniform: the uniform '+p_uniform_id+' is not defined for the program '+this._current_program_ID);
        return;
    }
    
    loc = uniform_loc_map[p_uniform_id];
    
    if (loc == undefined){  
        loc = gl.getUniformLocation(prg,p_uniform_id);  
        uniform_loc_map[p_uniform_id] = loc;     
    }
    
    var cached_value = uniform_cache[p_uniform_id];
    var type = uniform_types[p_uniform_id];
    
    if (cached_value == undefined){
        reset = true;
    }
    else{ 
       switch(type){ 
            case 'sampler2D':
            case 'float':
            case 'int':
            case 'bool': reset = (cached_value !== p_value); break;
            case 'mat4':
                    reset  = (
                        (p_value[0] !== cached_value[0]) ||
                        (p_value[1] !== cached_value[1]) ||
                        (p_value[2] !== cached_value[2]) ||
                        (p_value[3] !== cached_value[3]) ||
                        (p_value[4] !== cached_value[4]) ||
                        (p_value[5] !== cached_value[5]) ||
                        (p_value[6] !== cached_value[6]) ||
                        (p_value[7] !== cached_value[7]) ||
                        (p_value[8] !== cached_value[8]) ||
                        (p_value[9] !== cached_value[9]) ||
                        (p_value[10] !== cached_value[10]) ||
                        (p_value[11] !== cached_value[11]) ||
                        (p_value[12] !== cached_value[12]) ||
                        (p_value[13] !== cached_value[13]) ||
                        (p_value[14] !== cached_value[14]) ||
                        (p_value[15] !== cached_value[15])); break;
            case 'vec3':
                    reset = (
                        (p_value[0] !== cached_value[0]) ||
                        (p_value[1] !== cached_value[1]) ||
                        (p_value[2] !== cached_value[2])); break;
            case 'vec4':
                    reset = (
                        (p_value[0] !== cached_value[0]) ||
                    (p_value[1] !== cached_value[1]) ||
                    (p_value[2] !== cached_value[2]) ||
                    (p_value[3] !== cached_value[3])); break;
            default:
                reset = true;
        }
    }
   
    if (reset){
        switch(type){ 
            case 'float':
            case 'int':
            case 'bool': uniform_cache[p_uniform_id] = p_value; break;
            case 'mat4': uniform_cache[p_uniform_id] = mat4.clone(p_value); break;
            case 'mat3': uniform_cache[p_uniform_id] = mat3.clone(p_value); break;
            case 'vec4': uniform_cache[p_uniform_id] = vec4.clone(p_value); break;
            case 'vec3': uniform_cache[p_uniform_id] = vec3.clone(p_value); break;
            case 'vec2': uniform_cache[p_uniform_id] = vec2.clone(p_value); break;
            case 'sampler2D': uniform_cache[p_uniform_id] = p_value; break;
            default: alert('error: type unknown cannot update uniform cache');
        }
        this._setPolymorphicUniform(p_uniform_id, loc, p_value, hint);
    }

};

/**
 * Returns a uniform value from the cache maintained by vxlProgramManager
 * @param {String} the uniform id
 */
vxlProgramManager.prototype.getUniform = function(uniformID){
    //TODO: Think about this
    //if(!(name in this._uniform_map)){
      //  alert('Program: the uniform ' + name + ' has not been set');
        //return null;
   //}
    return this._curr_uniform_cache[uniformID];
};

/**
 * This method tells the WebGL context how to access the information contained in the
 * WebGL buffer associated with the attribute
 * @param {String} name name of the attribute
 * 
 */
vxlProgramManager.prototype.setAttributePointer = function(name, numElements, type, norm,stride,offset){
    var a = this._getAttributeLocation(name);
    this._gl.vertexAttribPointer(a,numElements, type, norm, stride, offset);
};

/**
 * Enables a vertex attribute array
 * @param {String} name the name of the attribute array to enable
 */
vxlProgramManager.prototype.enableAttribute = function(name){
    
   if (this._enabled_attribute_list.indexOf(name) != -1) return; //Speeds up
     
   var a = this._getAttributeLocation(name);
   this._gl.enableVertexAttribArray(a);
   this._enabled_attribute_list.push(name);
};

/**
 * Disables a vertex attribute array
 * @param {String} name the name of the attribute array to disable
 * 
 */
vxlProgramManager.prototype.disableAttribute = function(name){
    if (name == undefined) return; //@TODO: WARNING?
    var idx = this._enabled_attribute_list.indexOf(name);
    if ( idx>=0){
        var loc = this._getAttributeLocation(name);
        this._gl.disableVertexAttribArray(loc);
        this._enabled_attribute_list.splice(idx,1);
    }
};

/**
 * Creates a WebGL shader
 * 
 * @private This method is private.
 */
vxlProgramManager.prototype._createShader = function(type,code){
    var gl      = this._gl;
    var shader = null;
    
    if (type == vxl.def.essl.VERTEX_SHADER){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (type == vxl.def.essl.FRAGMENT_SHADER){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    
    if (code == undefined || code == null){
        alert('Error getting the code for shader of type ' + type);
    }
    
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(type+":\n\n "+gl.getShaderInfoLog(shader));
        throw("Error compiling shader "+type+":\n\n "+gl.getShaderInfoLog(shader));
    }
    
    return shader;
};
    

/**
 * Parses uniforms
 * This method is private
 * @private
 * 
 */
vxlProgramManager.prototype._parseUniforms = function(id){
    
    vs = this._registered_programs[this._current_program_ID].VERTEX_SHADER;
    fs = this._registered_programs[this._current_program_ID].FRAGMENT_SHADER;
    /*@TODO: look for a way to retrieve uNames directly from the parsing of the shaders
    this should simplify the structure of the JSON file representing the program*/
    uNames = this._registered_programs[this._current_program_ID].UNIFORMS;
    
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
            alert('Program: In the program '+this._current_program_ID+' the uniform '+uniformID+' is listed but not used');
        }
    }
    
    
    this._uniform_map[this._current_program_ID] = uNames;
    this._uniform_types[this._current_program_ID] = uTypes; 
};

/**
 * Obtains an attribute location
 * This method is private
 * @param {String} name
 * @private
 */
vxlProgramManager.prototype._getAttributeLocation = function(name){
    
    var loc = this._curr_attribute_loc_map[name];
    if (loc != undefined) return loc;
     
    loc = this._gl.getAttribLocation(this._current_program_object,name);
    if (loc == -1){
        console.error('vxlProgramManager._getAttributeLocation ERROR: the attribute '+name+''+
        'could not be located');
        loc = undefined;
    }
    else{
        this._curr_attribute_loc_map[name] = loc;
     }
    return loc;
};

/**
 * This is one of the jewels of Voxelent. Based on the information contained in the 
 * program database, it will do the appropriate gl call to set the uniform
 * This method is private. Use setUniform instead.
 * @see vxlProgramManager#setUniform
 * @private 
 */
vxlProgramManager.prototype._setPolymorphicUniform = function(uniformID, locationID,value,hint){

	//In the extend of what it is reasonable,
	//We cross check GLSL type information with actual javascript variable types 
	//to make the right calls
	//hint allows better casting of int and float values. If not specified default is float
    
    var gl = this._gl;
    var glslType = this._uniform_types[this._current_program_ID][uniformID];
    
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
    
    else if (glslType == 'int' || glslType == 'sampler2D'){
        gl.uniform1i(locationID,value);
        return;
    }
    
    else if (glslType == 'mat4'){    
        gl.uniformMatrix4fv(locationID,false,value);
        return;
    }
    
    
    else if (value instanceof Array || value instanceof Float32Array){ //vec2, vec3, vec4
        
        /*If we receive a uniform of length 3 but the type is length 4
         * complete with 1.0
         *  This is a hack that needs to be revisited....
         * 
         */ 
         
        if (value.length == 3 && glslType == 'vec4'){
             value[3] = 1.0;
             if (!this._one_time_warning){
                 alert('The uniform '+uniformID+' has only 3 components but voxelent needs 4. This is a one time warning');
                 this._one_time_warning = true;
             }
        }
        
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
