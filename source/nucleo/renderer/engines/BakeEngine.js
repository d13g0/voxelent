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
 * @constructor
 * @class
 * Implements a basic rendering strategy that works with the following programs:
 * 
 * vxl.def.essl.bake
 * TODO: Does not deal with model scalars well...
 * 
 */
function vxlBakeEngine(renderer){
    this.renderer = renderer;
    
    var gl = renderer.gl;
    
    this._calls     = {}
    
    this._gl_buffers  = {
        index       : gl.createBuffer(),
        baked       : gl.createBuffer(),
        position    : gl.createBuffer(),
        scale       : gl.createBuffer(),
        shading     : gl.createBuffer()
    };  
    
    this._data        = {
        index       : [],
        baked       : [],
        position    : [],
        scale       : [],
        shading     : []
        
    }; 
     
    this._allocated   = []; //if an actor is here, do not allocate
    
    this._offsets     = {
       position :{},
       scale    :{},
       shading  :{},
       baked    :{} 
    }; 
    
    
    this.glsl = vxl.util.extend(
        vxl.def.essl,{
        POSITION: "aPosition",
        SCALE:    "aScale",
        SHADING:  "aShading"
    });

};


/**
 * Creates an array of a defined size populated with the indicated value
 * @private
 */
vxlBakeEngine.prototype._populate = function(value, size){
    var a = [];
    
    for (var i = 0; i < size; i+=1){
        if (value instanceof Array || value instanceof Float32Array){
            for (var j = 0; j < value.length; j+=1){
                a.push(value[j]);
            }
        }
        else{
            a.push(value);
        }
    }
    return a;
};


/**
 * Computes the number of required calls to render one scene
 * @private
 */
vxlBakeEngine.prototype._computeRequiredCalls = function(scene){

    var elements    = scene._actors; //.concat(scene.toys.list);
    var NUM         = elements.length;
    var accum = 0;
    var count = 1;
    
    for(var i = 0; i < NUM; i+=1){
        accum += elements[i].model.indices.length;
        if (accum > 65000){ //66560?
            accum = 0;
            count ++;
        }
    }
    return count;
};


/**
 * Receives one actor and returns the GL buffers
 * @private
 */
vxlBakeEngine.prototype._allocateActor = function(actor){
    
    if (this._allocated.indexOf(actor.UID) != -1) return; //this actor has been allocated
    var data            = this._data;
    var offsets         = this._offsets;
    var gl              = this.renderer.gl;
    var model           = actor.model;
    var NUM_VERTICES    = model.vertices.length;
    
        
    var color = [], normal = [];
    
    //Taking care of colors
    if (actor.material.diffuse) {
        color = this._populate(actor.material.diffuse, NUM_VERTICES/3);
    }
    else{
        color = this._populate([0.7,0.7,0.7], NUM_VERTICES/3);
    }
    
    //Taking care of normals
    if (model.normals){
        normal = model.normals;
    }
    else{
        normal = this._populate(0, NUM_VERTICES);
    }
    
    offsets.baked[actor.UID]    =data.baked.length;
    
    for (var i=0;i<NUM_VERTICES; i+=3){
        
        data.baked.push(model.vertices[i]);
        data.baked.push(model.vertices[i+1]);
        data.baked.push(model.vertices[i+2]);
        
        data.baked.push(normal[i]);
        data.baked.push(normal[i+1]);
        data.baked.push(normal[i+2]);
        
        data.baked.push(color[i]);
        data.baked.push(color[i+1]);
        data.baked.push(color[i+2]);
    }
    
    offsets.position[actor.UID] = data.position.length;
    offsets.scale[actor.UID]    = data.scale.length;
    offsets.shading[actor.UID]  = data.shading.length;
    
    data.position = data.position.concat(this._populate(actor._position, NUM_VERTICES/3));
    data.scale    = data.scale.concat(this._populate(actor._scale, NUM_VERTICES/3));
    data.shading = data.shading.concat(this._populate(actor.material.opacity, NUM_VERTICES/3));
    

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
 * @private
 */
vxlBakeEngine.prototype._updateActorPosition = function(actor){
    
    var data = this._data;
    var offset = this._offsets.position[actor.UID];
    
    if (offset == undefined) return;
    
    var LEN = actor.model.vertices.length + offset;
    for(var i =offset;i<LEN;i+=3){
        data.position[i]   = actor._position[0];
        data.position[i+1] = actor._position[1];
        data.position[i+2] = actor._position[2];
    }
};

/**
 * @private
 */
vxlBakeEngine.prototype._updateActorScale = function(actor){
    var data = this._data;
    var offset = this._offsets.scale[actor.UID];
    
    if (offset == undefined) return;
    
    var LEN = actor.model.vertices.length + offset;
    for(var i =offset;i<LEN;i+=3){
        data.scale[i]   = actor._scale[0];
        data.scale[i+1] = actor._scale[1];
        data.scale[i+2] = actor._scale[2];
    }
};


/**
 * @private
 */
vxlBakeEngine.prototype._updateActorColor = function(actor){
    var data = this._data;
    var offset = this._offsets.baked[actor.UID];
    
    if (offset == undefined) return;
    
    var LEN = (actor.model.vertices.length*3) + offset;
    for(var i =offset;i<LEN;i+=9){
        data.baked[i+6] = actor.material.diffuse[0];
        data.baked[i+7] = actor.material.diffuse[1];
        data.baked[i+8] = actor.material.diffuse[2];
    }
};

/**
 * @private
 */
vxlBakeEngine.prototype._updateActorShading = function(actor){
    var data = this._data;
    var offset = this._offsets.shading[actor.UID];
    
    if (offset == undefined) return;
    
    var LEN = (actor.model.vertices.length/3) + offset;
    var val = 0.0;
    
    if (actor.material.opacity){
        val = 1.0;
    }
    
    for(var i =offset;i<LEN;i+=1){
       data.shading[i]   = val;
    }
};


/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlBakeEngine.prototype.deallocate = function(scene){

};


/**
 * Implements basic allocation of memory. Creates the WebGL buffers for the actor
 * @param {vxlScene} scene the scene to allocate memory for
 * @returns an object that contains the allocated WebGL buffers
 */
vxlBakeEngine.prototype.allocate = function(scene){
    
    if (this._computeRequiredCalls(scene) > 1) {
        throw 'Not renderable yet. Working on it. The number of indices exceeds the 65K limit';
    }
    
    var elements    = scene._actors; //.concat(scene.toys.list);
    var NUM         = elements.length;
    var r           = this.renderer;
    var buffers     = this._gl_buffers;
    var data        = this._data;

    var pm         = r.pm;
    var gl          = r.gl;
    var essl        = this.glsl;
    var mode        = gl.STATIC_DRAW;
    
    
    
    for(var i = 0; i < NUM; i+=1){
        this._allocateActor(elements[i]);
    }
    
    pm.enableAttribute(essl.VERTEX_ATTRIBUTE);
    pm.enableAttribute(essl.NORMAL_ATTRIBUTE);
    pm.enableAttribute(essl.COLOR_ATTRIBUTE);
    
    pm.enableAttribute(essl.POSITION);
    pm.enableAttribute(essl.SCALE);
    pm.enableAttribute(essl.SHADING);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.baked);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.baked), mode);
    pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 36, 0);
    pm.setAttributePointer(essl.NORMAL_ATTRIBUTE, 3, gl.FLOAT, false, 36, 12);
    pm.setAttributePointer(essl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 36, 24);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.position), mode);
    pm.setAttributePointer(essl.POSITION, 3, gl.FLOAT, false,12,0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.scale);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.scale), mode);
    pm.setAttributePointer(essl.SCALE, 3, gl.FLOAT, false,12,0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.shading);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.shading), mode);
    pm.setAttributePointer(essl.SHADING, 1, gl.FLOAT, false,4,0);
    

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.index), mode);
};




/**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlBakeEngine.prototype.render = function(scene){

    //Updates the perspective matrix and passes it to the program
    var r       = this.renderer;
    var trx     = r.transforms
    var pm     = r.pm;
    var gl      = r.gl;
    var essl    = vxl.def.essl;
    var data    = this._data;
    
    trx.update();

    pm.setUniform(essl.PERSPECTIVE_MATRIX, trx.pMatrix);
    pm.setUniform(essl.MODEL_VIEW_MATRIX,  trx.mvMatrix);
    pm.setUniform(essl.NORMAL_MATRIX,      trx.nMatrix);
    pm.setUniform(essl.MVP_MATRIX,         trx.mvpMatrix);
    
    for(var i = 0, N = scene._actors.length; i<N; i+=1){
        var actor = scene._actors[i];
        this._updateActorPosition(actor);   
        this._updateActorScale(actor);     
        this._updateActorShading(actor);  
        this._updateActorColor(actor);     
    }
    
    
    gl.drawElements(gl.TRIANGLES, data.index.length, gl.UNSIGNED_SHORT,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
     
  
