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
vxlRenderEngine.prototype = new vxlEngine();
vxlRenderEngine.prototype.constructor = vxlRenderEngine;

/**
 * This is the default rendering engine. It contains all the low level GL code that makes
 * possible efficient rendering in Voxelent
 * 
 * @constructor creates a new engine
 * @class Implements the default rendering engine 
 * @author Diego Cantor
 * 
 */
function vxlRenderEngine(){
    vxlEngine.call(this);
	this._gl_buffers  = {};
	this._gl_textures = {};
	this._offscreen = false;
    this._target    = undefined;
    this._onPickingBuffer  = false;
    this._debug_picking_flag = false; //used only for debugging purposes	
};

/**
 * Configures the engine 
 */
vxlRenderEngine.prototype.configure = function(){
    vxlEngine.prototype.configure.call(this);
    var gl = this.gl;
    gl.clearDepth(1.0);
    gl.disable(gl.CULL_FACE);
};

/**
 * Implements basic allocation of memory. Creates the WebGL buffers for the actor
 * @param {vxlScene} scene the scene to allocate memory for
  */
vxlRenderEngine.prototype.allocate = function(scene){
    var elements = scene._actors.concat(scene.toys.list);
    var i = elements.length;
    
    while(i--){
        this._allocateActor(elements[i]);
    }
};

/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlRenderEngine.prototype.deallocate = function(scene){
    //DO NOTHING. THE DESCENDANTS WILL.
};

/**
 * Allocates the GL buffers required to render the respective geometry
 * @private
 * 
 */
vxlRenderEngine.prototype._allocateActor = function(actor){
    
    var gl      = this.gl;
    var model   = actor.model;
    var buffers = {};
    
    if (!(model.UID in this._gl_buffers) || actor._dirty){   
            this._reallocateActor(actor); 
            actor._dirty = false;
    }
};

	
/**
 * Reallocates the GL buffers to render the respective geometry
 * @private
 */
vxlRenderEngine.prototype._reallocateActor = function(actor){
   
    var gl      = this.gl;
    var model   = actor.model;
    var buffers = this._gl_buffers[model.UID] || {};
    var am = vxl.def.actor.mode;
    
    
    //-----------------------------------------------------------------------
    // Allocate vertices
    //-----------------------------------------------------------------------
    if (buffers.vertex == undefined) { buffers.vertex = gl.createBuffer();}
    
    var vertices = undefined;
    switch(actor.mode){
        case am.BOUNDING_BOX: vertices = actor.getBoundingBoxVertices(); break;
        default: vertices = model.vertices;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    //-----------------------------------------------------------------------
    // Allocate normals
    //-----------------------------------------------------------------------
    if (model.normals){
        if (buffers.normal == undefined) {buffers.normal = gl.createBuffer();}
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
    }
    
    //-----------------------------------------------------------------------
    //@TODO: we may have scalars instead of colors in the shaders
    //do we need two buffers here?
    //-----------------------------------------------------------------------
    if (model.scalars != undefined || model.colors != undefined){
        if (buffers.color == undefined) {buffers.color = gl.createBuffer(); }
        //we don't BIND values or use the buffers 
        //until the lut is loaded and available
    }
    
    //-----------------------------------------------------------------------
    // Allocate indices if they exist
    //-----------------------------------------------------------------------
    if (model.indices != undefined){    
        if (buffers.index == undefined) { buffers.index = gl.createBuffer(); } 
        
    
        var indices = undefined;
    
        switch(actor.mode){
        case am.SOLID:           indices = model.indices;                break;
        case am.WIREFRAME:       indices = model.wireframe;              break;
        case am.POINTS:          indices = model.indices;                break;
        case am.LINES:           indices = model.indices;                break;
        case am.BOUNDING_BOX:    indices = vxlModel.BB_INDICES;          break;
        case am.BB_AND_SOLID:    indices = model.indices;                break;
        case am.WIRED_AND_SOLID: indices = model.indices;                break;
        case am.FLAT:            indices = model.indices;                break;
        case am.TEXTURED:        indices = model.indices;                break;
        default:
            throw('There was a problem while rendering the actor ['+actor.name+'].'+
            'The visualization mode: '+actor.mode+' is not valid.'); 
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }
    
    //-----------------------------------------------------------------------
    // Buffers to draw parts.
    //-----------------------------------------------------------------------
    if (actor.mode == am.FLAT){
        if (buffers.vertex_parts == undefined) { buffers.vertex_parts   = gl.createBuffer(); }
        if (buffers.normal_parts == undefined) { buffers.normal_parts   = gl.createBuffer(); }
        if (buffers.color_parts  == undefined) { buffers.color_parts    = gl.createBuffer(); }
        if (buffers.index_parts  == undefined) { buffers.index_parts    = gl.createBuffer(); }
    }
    else{
        if (buffers.vertex_parts != undefined) { gl.deleteBuffer(buffers.vertex_parts);  buffers.vertex_parts = null;  delete buffers.vertex_parts; }
        if (buffers.normal_parts != undefined) { gl.deleteBuffer(buffers.normal_parts);  buffers.normal_parts = null;  delete buffers.normal_parts;}
        if (buffers.color_parts  != undefined) { gl.deleteBuffer(buffers.color_parts);   buffers.color_parts = null;   delete buffers.color_parts;}
        if (buffers.index_parts  != undefined) { gl.deleteBuffer(buffers.index_parts);   buffers.index_parts = null;   delete buffers.index_parts;}
    }
    
    //-----------------------------------------------------------------------
    // Additional bbuffers for wired_and_solid and for bb_and_solid
    //-----------------------------------------------------------------------
    
    if (actor.mode == am.WIRED_AND_SOLID){
        
        buffers.index_ws = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index_ws);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    else{
        if (buffers.index_ws != undefined){
            gl.deleteBuffer(buffers.index_ws);
            buffers.index_ws = null;
            delete buffers.index_ws;
        }
    }
    
    if (actor.mode == am.BB_AND_SOLID){
        buffers.vertex_bs = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex_bs);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.getBoundingBoxVertices()), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        buffers.index_bs = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index_bs);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vxlModel.BB_INDICES), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    else{
        if (buffers.vertex_bs != undefined){
            gl.deleteBuffer(buffers.vertex_bs);
            buffers.vertex_bs = null;
            delete buffers.vertex_bs;
        }
        
        if (buffers.index_bs != undefined){
            gl.deleteBuffer(buffers.index_bs);
            buffers.index_bs = null;
            delete buffers.index_bs;
        }
    }

    //-----------------------------------------------------------------------
    //When the texture loads, make sure we call actor._reallocate
    //-----------------------------------------------------------------------
    if (model.texcoords && actor.material.texture && actor.material.texture.loaded){
        buffers.texcoords = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        
        this._gl_textures[actor.UID] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._gl_textures[actor.UID]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, actor.material.texture.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    //-----------------------------------------------------------------------
    // Clean Up
    //-----------------------------------------------------------------------
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    //-----------------------------------------------------------------------
    // Save buffers
    //-----------------------------------------------------------------------
    this._gl_buffers[model.UID] = buffers;
};

/**
 * Binds the array buffer and enables the normal attribute.
 * The data is not passed again to the buffer. This only happens during
 * the reallocation of the actor
 * @private
 */
vxlRenderEngine.prototype._setNormals = function(actor){
    
    var model = actor.model;
    var gl = this.gl;
    var pm = this.pm;
    var buffers = this._gl_buffers[model.UID];
    var essl    = vxl.def.essl; 
    
    if(model.normals && actor.material.shading){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        pm.enableAttribute(essl.NORMAL_ATTRIBUTE);
        pm.setAttributePointer(essl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
    }
}; 

/**
 * Binds the color buffer and passes the data to it. We need a more
 * efficient way to do this to avoid passing data on every rendering cycle.
 * Maybe hold from passing data and do it on reallocation once colors are available.
 * 
 * @private
 */
vxlRenderEngine.prototype._setColors = function(actor){
    
    var model = actor.model;
    var gl = this.gl;
    var pm = this.pm;
    var buffers = this._gl_buffers[model.UID];
    var essl    = vxl.def.essl; 
    
    if (actor.material.colors && actor.material.colors.length == actor.model.vertices.length){    
        pm.setUniform("uUseVertexColors", true);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.material.colors), gl.STATIC_DRAW);
        pm.enableAttribute(essl.COLOR_ATTRIBUTE);
        pm.setAttributePointer(essl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    }
};

/**
 * Sets up the vertex buffer for the renderable part
 * @private
 */
vxlRenderEngine.prototype._setRenderableVertices = function(actor,part){
    
    var gl = this.gl;
    var pm = this.pm;
    var buffers = this._gl_buffers[actor.model.UID];
    var essl    = vxl.def.essl; 
                
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex_parts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.vertices), gl.STATIC_DRAW);
    pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0); 
};

/**
 * Sets up the normal buffer for the renderable part
 * @private
 */
vxlRenderEngine.prototype._setRenderableNormals = function(actor,part){
    
  var gl = this.gl;
  var pm = this.pm;
  var buffers = this._gl_buffers[model.UID];
  var essl    = vxl.def.essl; 
  
  if (part.normals != undefined && part.normals.length>0){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal_parts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.normals), gl.STATIC_DRAW);
    pm.enableAttribute(essl.NORMAL_ATTRIBUTE);
    pm.setAttributePointer(essl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
  }
    
};

/**
 * Sets up the colors buffer for the renderable part
 * @private
 */
vxlRenderEngine.prototype._setRenderableColors = function(actor,part){
    
  var gl = this.gl;
  var pm = this.pm;
  var buffers = this._gl_buffers[model.UID];
  var essl    = vxl.def.essl; 
  
  if (part.colors != undefined && part.colors.length>0){
      
        pm.setUniform("uUseVertexColors", true);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color_parts);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.colors), gl.STATIC_DRAW);
        pm.enableAttribute(essl.COLOR_ATTRIBUTE);
        pm.setAttributePointer(essl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    }  
};
	

/**
 * Updates the model view and normal matrices that
 * will be used with each actor during rendering.
 * Called once per every render cycle.
 * @param {vxlScene} scene the scene to be rendered
 * @private
 */
vxlRenderEngine.prototype._updateActorTransforms = function(scene){
     var trx     = this._transforms;
     var elements = scene._actors.concat(scene.toys.list);
     var N = elements.length;
     var actor = undefined;
      
    trx.calculateModelView();
     
     for (var i=0;i<N;i+=1){
         actor = elements[i];
         if (!actor.visible) continue;
         actor._matrix_world  = mat4.multiply(actor._matrix_world, trx.mvMatrix, actor._matrix);
         actor._matrix_normal = mat4.copy(actor._matrix_normal, actor._matrix_world);
         actor._matrix_normal = mat4.invert(mat4.create(), actor._matrix_normal);
         actor._matrix_normal = mat4.transpose(actor._matrix_normal, actor._matrix_normal);
     }
 };
 
 /**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlRenderEngine.prototype.render = function(scene){
   
    var trx     = this._transforms,
    pm          = this.pm,
    gl          = this.gl,
    glsl        = vxl.def.essl;
    
    this._updateActorTransforms(scene);
 
    //@TODO: CHECK is this supposed to be here? >>//
    if (scene.frameAnimation != undefined){  scene.frameAnimation.update(); }
    
    this._renderPicking(scene._actors);
    
    var elements = scene._actors.concat(scene.toys.list);
    var i = elements.length;
    while(i--){
        this._renderActor(elements[i]);
    }
};

/**
 * Renders pickable actors in the offscreen buffer 
 * @private
 */
vxlRenderEngine.prototype._renderPicking = function(actors){
    
    if (this._target == undefined) return; //quick fail if the target has not been defined
    
    if (this._offscreen){
        
        var gl = this.gl;
        
        this._onPickingBuffer = true;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._target.framebuffer);
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        var i = actors.length;
        while(i--){
            if (actors[i].isPickable()){
                this._renderActor(actors[i]);
            }
        }
        
        this._onPickingBuffer = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    if (this._debug_picking_flag){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };
};

/**
 * @private
 */
vxlRenderEngine.prototype._renderActor = function(actor){

    if (!actor.visible) return; //Quick and simple

    var model   = actor.model;
    var buffers = this._gl_buffers[model.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;   
    var trx     = this._transforms;
    var diffuse = [actor.material.diffuse[0], 
                   actor.material.diffuse[1], 
                   actor.material.diffuse[2],
                   actor.material.opacity];
                   
    /**
     * If the renderer is not forcing his program, then give the actors
     * a chance to decide which program they want to use to be rendered
     */
    /*if (!this._enforce && actor.mode != vxl.def.actor.mode.FLAT){
        if(actor.material.shininess > 0){
            this.setProgram(vxl.go.essl.phong);
            pm.setUniform("uShininess", actor.material.shininess);
            pm.setUniform("uMaterialSpecular", actor.material.specular);
        }
        else{
            this.setProgram(vxl.go.essl.lambert);
        }
    }*/
   
  
    
    if (actor.mode == vxl.def.actor.mode.FLAT){
        this.setProgram(vxl.go.essl.lambert);
    }
    else{
        //pm.setUniform("uShininess", actor.material.shininess);
        //pm.setUniform("uMaterialSpecular", actor.material.specular);
    }
   
    pm.disableAttribute(essl.TEXCOORD_ATTRIBUTE);
    pm.disableAttribute(essl.COLOR_ATTRIBUTE);
    pm.disableAttribute(essl.NORMAL_ATTRIBUTE);
    pm.disableAttribute(essl.PICKING_COLOR_ATTRIBUTE);
    pm.enableAttribute(essl.VERTEX_ATTRIBUTE);
    
    pm.setUniform("uUseVertexColors",       false);
    pm.setUniform("uUseTextures",           false);
    pm.setUniform("uUseShading",            actor.material.shading);
    pm.setUniform("uMaterialDiffuse",       diffuse);
    pm.setUniform(essl.MODEL_VIEW_MATRIX,   actor._matrix_world);
    pm.setUniform(essl.NORMAL_MATRIX,       actor._matrix_normal);
    pm.setUniform(essl.PERSPECTIVE_MATRIX,  trx.pMatrix);
    
    this._handleCulling(actor);
    
    if(this._onPickingBuffer || this._debug_picking_flag){
        this._renderPickingBuffer(actor);
        return;
    }
    
    // SETTING UP THE VERTEX ATTRIBUTE    
    if (actor.mode != vxl.def.actor.mode.FLAT && actor.model.type != vxl.def.model.type.BIG_DATA){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    }
    
    var am = vxl.def.actor.mode;
    
    switch(actor.mode){
        case am.SOLID:           this._renderSolid(actor);               break;
        case am.WIREFRAME:       this._renderWireframe(actor);           break;
        case am.POINTS:          this._renderPoints(actor);              break;
        case am.LINES:           this._renderLines(actor);               break;
        case am.BOUNDING_BOX:    this._renderBoundingBox(actor);         break;
        case am.BB_AND_SOLID:    this._renderBoundingBoxAndSolid(actor); break;
        case am.WIRED_AND_SOLID: this._renderWiredAndSolid(actor);       break;
        case am.FLAT:            this._renderFlat(actor);                break;
        case am.TEXTURED:        this._renderTextured(actor);            break;
        default:
            throw('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+actor.mode+' is not valid.'); 
    }
    
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};


/**
 * Renders a solid actor
 * @private
 */
vxlRenderEngine.prototype._renderSolid = function(actor){
    
    var buffers = this._gl_buffers[actor.model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;
    
    if (actor.model.type != vxl.def.model.type.SIMPLE){
        
        if (actor.renderable  == undefined){
            alert('the actor does not have a renderable object');
            throw 'the actor does not have a renderable object';
        }
        
        parts = actor.renderable.parts;
        var i = parts.length;
        while(i--){
            var part = parts[i];
            this._setRenderableVertices(actor,part);
            this._setRenderableNormals(actor,part);
            this._setRenderableColors(actor,part);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index_part);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(part.indices), gl.STATIC_DRAW);
            gl.drawElements(gl.TRIANGLES, part.indices.length, gl.UNSIGNED_SHORT,0);
        }
    }
    else{
    
        this._setNormals(actor);
        this._setColors(actor);    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.drawElements(gl.TRIANGLES, actor.model.indices.length, gl.UNSIGNED_SHORT,0);
    }
};

/**
 * Renders an actor as a wireframe using the wireframe indices
 */
vxlRenderEngine.prototype._renderWireframe = function(actor){
    

    var buffers = this._gl_buffers[actor.model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;
    
    if (!actor.toy){
        this._setNormals(actor);
    }
    this._setColors(actor);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.LINES, actor.model.wireframe.length, gl.UNSIGNED_SHORT,0);
};

/**
 * Render an actor as points
 * @private
 */
vxlRenderEngine.prototype._renderPoints = function(actor){
    
    var model   = actor.model;
    var gl      = this.gl;
    var pm      = this.pm;
    
    pm.setUniform("uUseShading", false);
    pm.setUniform("uPointSize", 5); //TODO: fix hardcode
    this._setColors(actor);
    gl.drawArrays(gl.POINTS,0, model.vertices.length/3);
};

/**
 * Renders an actor using lines
 * @private
 */
vxlRenderEngine.prototype._renderLines = function(actor){
    
    var buffers = this._gl_buffers[actor.model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;
    
    pm.setUniform("uUseShading", false);
    this._setColors(actor);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.LINES, actor.model.indices.length, gl.UNSIGNED_SHORT,0); 
};

/**
 * Renders the bounding box of an actor
 * @private
 */
vxlRenderEngine.prototype._renderBoundingBox = function(actor){
    
    var buffers = this._gl_buffers[actor.model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl; 
    
    pm.disableAttribute(essl.NORMAL_ATTRIBUTE);
    pm.setUniform("uUseShading", false);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.LINES, vxlModel.BB_INDICES.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlRenderEngine.prototype._renderBoundingBoxAndSolid = function(actor){    var model   = actor.model;
    
    var buffers = this._gl_buffers[model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;
    var trx     = this._transforms;    
    //solid
    this._renderSolid(actor);
    
    //bounding box, don't move the bb as it has been updated with the actor transform already ;-)
    trx.calculateModelView();
    trx.calculateNormal(); 
    pm.setUniform(essl.MODEL_VIEW_MATRIX,  trx.mvMatrix);
    pm.setUniform(essl.NORMAL_MATRIX, trx.nMatrix);
    pm.disableAttribute(essl.NORMAL_ATTRIBUTE);
    pm.setUniform("uUseShading", false);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex_bs);
    pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index_bs);
    gl.drawElements(gl.LINES, vxlModel.BB_INDICES.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlRenderEngine.prototype._renderWiredAndSolid = function(actor){
   
    var model   = actor.model;
    var buffers = this._gl_buffers[model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;

    this._renderSolid(actor);
    
    pm.setUniform("uUseShading",false);
    pm.setUniform("uMaterialDiffuse",[0.9,0.9,0.9,1.0]);
    pm.disableAttribute(essl.NORMAL_ATTRIBUTE);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index_ws);
    gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0); 
};

/**
 * This method will create a mesh for the actor if it does not exist one already
 * Instead of waiting for the mesh to be ready, it will render a wireframe
 * of the actor while it is ready.
 * 
 * @private
 */
vxlRenderEngine.prototype._renderFlat = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[model.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;
    
    if (actor.mesh == undefined){
        actor.mesh = new vxlMesh(actor);
        actor.renderable = new vxlRenderable(actor);
        
    }
    
    if (actor.mesh.model == undefined) {
        //mesh not ready yet. Render actor wireframe in the mean time
        var model = actor.model;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        pm.setAttributePointer(essl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        pm.enableAttribute(essl.NORMAL_ATTRIBUTE);
 
        pm.setUniform("uUseShading",actor.material.shading);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        this._renderWireframe(actor);
        return;
    } 

    pm.setUniform("uUseShading",true);
    pm.enableAttribute(essl.NORMAL_ATTRIBUTE);
    
    var parts = actor.renderable.parts;
    var i = parts.length;
    
    while(i--){
        
        var part = parts[i];
      
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex_parts);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.vertices), gl.STATIC_DRAW);
        pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal_parts);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.normals), gl.STATIC_DRAW);
        pm.setAttributePointer(essl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
        
        
       if (part.colors && part.colors.length > 0){ 
                pm.enableAttribute(essl.COLOR_ATTRIBUTE);
                pm.setUniform("uUseVertexColors", true);
               
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color_parts);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.colors), gl.STATIC_DRAW);
                pm.setAttributePointer(essl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index_parts);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(part.indices), gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, part.indices.length, gl.UNSIGNED_SHORT,0);
    }
     
};


/**
 * This method takes care of rendering the scene in the background buffer. Only the 
 * actors that are pickable reach this method (see _handlePicking) so the isPickable 
 * validation (actor.isPickable) is not necessary here.
 * 
 * This method makes sure the correct version of the object is rendered in the background
 * buffer
 * 
 * if the object picking method is OBJECT then the same object is rendered but using
 * the picking color (actor._pickingColor) as the diffuse material uniform. 
 *
 * Otherwise, when the object picking mode is CELL, then the mesh model is rendered. 
 * The mesh model colors every cell differently (drawback in performance)
 *    
 * @private
 */
vxlRenderEngine.prototype._renderPickingBuffer = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[model.UID];
    var gl      = this.gl;
    var pm      = this.pm;
    var essl    = vxl.def.essl;
    
    if (actor._picking == vxl.def.actor.picking.DISABLED) return; 
     
    pm.setUniform("uUseShading",false);
    
      
    if (actor._picking == vxl.def.actor.picking.CELL){
        if (actor.mesh == undefined || actor.mesh.model == undefined){
            return; // we just fail safely. We will render it whenever the actor is ready ;-)
                    // the mesh is generated inside actor.setPicker (see actor.setPicker method)
        }
        
        if (buffers.picking_parts == undefined){
            buffers.picking_parts  = gl.createBuffer();
            buffers.picking_colors = gl.createBuffer();
            buffers.picking_index  = gl.createBuffer();
        }
        
        pm.setUniform("uUseVertexColors", true);
        pm.enableAttribute(essl.COLOR_ATTRIBUTE);
      
        var parts = actor.renderable.parts;
        var i = parts.length;
        while(i--){
            var part = parts[i];
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.picking_parts);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.vertices), gl.STATIC_DRAW);
            pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
 
            if (part.pickingColors && part.pickingColors.length == part.vertices.length){
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.picking_colors);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.pickingColors), gl.STATIC_DRAW);
                pm.setAttributePointer(essl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
                
            }
            else{
                alert('The object '+part.name+' does not have picking colors assigned.');
                throw('The object '+part.name+' does not have picking colors assigned.');
            }
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.picking_index);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(part.indices), gl.STATIC_DRAW);
            gl.drawElements(gl.TRIANGLES, part.indices.length, gl.UNSIGNED_SHORT,0);
        }
    }
    else if (actor._picking == vxl.def.actor.picking.OBJECT){
        pm.setUniform("uMaterialDiffuse",actor._pickingColor.concat(1.0));
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
    }
    
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/**
 * @private
 */
vxlRenderEngine.prototype._renderTextured = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[model.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.gl;
    var pm     = this.pm;
    var essl    = vxl.def.essl;   
    
    if (!actor.material.texture.loaded){
        this._renderSolid(actor);
        return;
    }
    
    if (model.texcoords){
        
        pm.setUniform("uUseTextures", true);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        pm.setAttributePointer(essl.TEXCOORD_ATTRIBUTE, 2, gl.FLOAT,false, 0,0);
        pm.enableAttribute(essl.TEXCOORD_ATTRIBUTE);
        
    }
    else{
        //@TODO: Be more specific
        throw('error');
    }
            
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, actor.material.texture.getMagFilter(gl));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, actor.material.texture.getMinFilter(gl));
    pm.setUniform("uSampler", 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlRenderEngine.prototype._handleCulling = function(actor){
    var gl = this.gl;
    
    gl.disable(gl.CULL_FACE);
    if (actor.cull != vxl.def.actor.cull.NONE){
        gl.enable(gl.CULL_FACE);
        switch (actor.cull){
            case vxl.def.actor.cull.BACK: gl.cullFace(gl.BACK); break;
            case vxl.def.actor.cull.FRONT: gl.cullFace(gl.FRONT); break;
        }
    } 
    
           
}; 
    
/**
 * Sets up the offscreen rendering variant
 * @param {vxlRenderTarget} target the render target
 */
vxlRenderEngine.prototype.enableOffscreen = function(){
    this._offscreen = true;
    this._target = new vxlRenderTarget(this);
};

/**
 * Sets up the offscreen rendering variant
 * @param {vxlRenderTarget} target the render target
 */
vxlRenderEngine.prototype.disableOffscreen = function(){
    this._offscreen = false;
    delete this._target;
    this._target = undefined;
};

/**
 * Returns true if the offscreen rendering does not have any target.
 * @returns {true\false}
 */
vxlRenderEngine.prototype.isOffscreenEnabled = function(){
    return (this._target != undefined);    
};

/**
 * 
 * @param {Object} x position to read in the offscreen buffer
 * @param {Object} y position to read in the offscreen buffer
 * 
 */
vxlRenderEngine.prototype.readOffscreenPixel = function(x,y){
    var typed = this._target.readPixel(x,y); 
    
    //conversion from Uint8Array to regular Array
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
    value = Array.apply( [], typed );
    value.constructor === Array;
   
   return  value;
};

