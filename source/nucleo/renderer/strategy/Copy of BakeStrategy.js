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

//Inheritance stuff
vxlBakeStrategy.prototype = new vxlBasicStrategy(undefined)
vxlBakeStrategy.prototype.constructor = vxlBakeStrategy;

/**
 * @constructor
 * @class
 * Implements a basic rendering strategy that works with the following programs:
 * 
 * vxl.def.glsl.bake
 */
function vxlBakeStrategy(renderer){
    vxlBasicStrategy.call(this,renderer);
    this._gl_buffers  = {}; //contains the gl buffers. One per kind 
    this._data        = {}; //contains the javascript arrays to populate the buffers 
    this._allocated   = []; //if an actor is here, do not allocate
    
    this.glsl = {
        BAKED_POSITION : 'aPosition',
        BAKED_SCALE : 'aScale',
        BAKED_OPACITY : 'aOpacity',
        BAKED_USE_VERTEX_COLORS : 'aUseVertexColors',
        BAKED_USE_SHADING :'aUseShading',
        BAKED_USE_NORMALS : 'aUseNormals'
    };
    
    this._createBuffers();
    this._clearArrays();
};

/**
 * Creates the gl buffers
 * @private 
 */
vxlBakeStrategy.prototype._createBuffers = function(){

    this._gl_buffers  = {};
    this._data        = {};

    var buffers = this._gl_buffers;
    var gl      = this.renderer.gl;
    
    buffers.vertex          = gl.createBuffer();
    buffers.index           = gl.createBuffer();
    buffers.normal          = gl.createBuffer();
    buffers.color           = gl.createBuffer();
    buffers.colors          = gl.createBuffer(); 
    buffers.wireframe       = gl.createBuffer();
    buffers.position        = gl.createBuffer();
    buffers.scale           = gl.createBuffer();
    buffers.opacity         = gl.createBuffer();
    buffers.useVertexColors = gl.createBuffer();
    buffers.useShading      = gl.createBuffer();
    buffers.useNormals      = gl.createBuffer();
};


/**
 * @private
 */
vxlBakeStrategy.prototype._clearArrays = function(){
    var data    = this._data;
    data.vertex             = [];
    data.index              = [];
    data.normal             = [];
    data.color              = [];
    data.colors             = [];
    data.wireframe          = [];
    data.position           = [];
    data.scale              = [];
    data.opacity            = [];
    data.useVertexColors    = [];
    data.useShading         = [];
    data.useNormals         = [];
};


/**
 * Creates an array of a defined size populated with the indicated value
 * @private
 */
vxlBakeStrategy.prototype._populate = function(value, size){
    var a = [];
    for (var i = 0; i < size; i+=1){
        a.push(value);
    }
    return a;
};


/**
 * Implements basic allocation of memory. Creates the WebGL buffers for the actor
 * @param {vxlScene} scene the scene to allocate memory for
 * @returns an object that contains the allocated WebGL buffers
 */
vxlBakeStrategy.prototype.allocate = function(scene){
    
    var elements = scene.actors; //.concat(scene.toys.list);
    var NUM = elements.length;
    var r       = this.renderer;
    var prg     = r.prg;
    var gl      = r.gl;
    var glsl    = vxl.def.glsl;
    var buffers = this._gl_buffers;
    var mode    = gl.STATIC_DRAW;
    var data    = this._data;
    
    
    for(var i = 0; i < NUM; i+=1){
        this._allocateActor(elements[i]);
    }
    
    prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
    prg.enableAttribute(glsl.COLOR_ATTRIBUTE);
    prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertex), mode);
    prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.colors), mode);
    prg.setAttributePointer(glsl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normal), mode);
    prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.index), mode);

    
    
};

/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlBakeStrategy.prototype.deallocate = function(scene){
    //DO NOTHING. THE DESCENDANTS WILL.
};


/**
 * Receives one actor and returns the GL buffers
 */
vxlBakeStrategy.prototype._allocateActor = function(actor){
    
    if (this._allocated.indexOf(actor.UID) != -1) return; //this actor has been allocated
   
    var gl = this.renderer.gl;
    var model = actor.model;
    var data  = this._data;
    var NUM_VERTICES = model.vertices.length;
    
    
    //1. Easy properties
    data.vertex     = data.vertex.concat(model.vertices);
    //data.wireframe  = data.wireframe.concat(model.wireframe);
    //data.useShading = data.useShading.concat(this._populate(actor.shading, NUM_VERTICES));
    //data.opacity    = data.opacity.concat(this._populate(actor.opacity, NUM_VERTICES));
    //data.position   = data.position.concat(this._populate(actor.position, NUM_VERTICES/3));
    
    //2. Check on normals. Concatenate if they exist, other wise fill with zeroes
    if (model.normals){
        data.normal = data.normal.concat(model.normals);
    }
    else{
        data.normal = data.normal.concat(this._populate(0, NUM_VERTICES));
    }
    //3. Check on actor colors
    if (actor.colors){
        data.colors  = data.colors.concat(actor.colors);
        //data.color   = data.color.concat(this._populate(0,NUM_VERTICES));
        //data.useVertexColors = data.useVertexColors.concat(this._populate(true, NUM_VERTICES));
    }
    else{
        data.colors  = data.colors.concat(this._populate(0,NUM_VERTICES));
        //data.color   = data.color.concat(this._populate(actor.color,NUM_VERTICES/3));
        //data.useVertexColors = data.useVertexColors.concat(this._populate(false, NUM_VERTICES));
    }
    //4. Now the painful part
    
    var ind = model.indices.slice(0);
    if (data.index.length > 0){
        var max = data.index.max()+1;
        var NUM_INDICES = model.indices.length;
        for (var i=0; i<NUM_INDICES; i+=1){
            ind[i] += max;
        }
        data.index = data.index.concat(ind);
    }
    else{
        data.index = ind;
    }
    
    this._allocated.push(actor.UID);
};



/**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlBakeStrategy.prototype.render = function(scene){

    //Updates the perspective matrix and passes it to the program
    var r       = this.renderer;
    var trx     = r.transforms
    var prg     = r.prg;
    var gl      = r.gl;
    var glsl    = vxl.def.glsl;
    
    var buffers = this._gl_buffers;
    var data    = this._data;
    
    trx.update();

    prg.setUniform(glsl.PERSPECTIVE_MATRIX, trx.pMatrix);
    prg.setUniform(glsl.MODEL_VIEW_MATRIX,  trx.mvMatrix);
    prg.setUniform(glsl.NORMAL_MATRIX,      trx.nMatrix);
    prg.setUniform(glsl.MVP_MATRIX,         trx.mvpMatrix);
     
    
    /*if (scene.frameAnimation != undefined){
        scene.frameAnimation.update();
    }*/
    
    
    /*prg.enableAttribute(glsl.BAKED_POSITION);
    prg.disableAttribute(glsl.BAKED_SCALE);
    prg.disableAttribute(glsl.BAKED_OPACITY);
    prg.disableAttribute(glsl.BAKED_USE_VERTEX_COLORS);
    prg.disableAttribute(glsl.BAKED_USE_SHADING);
    prg.disableAttribute(glsl.BAKED_USE_NORMALS);*/
   
   gl.drawElements(gl.TRIANGLES, data.index.length, gl.UNSIGNED_SHORT,0);
   gl.bindBuffer(gl.ARRAY_BUFFER, null);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
     
  
