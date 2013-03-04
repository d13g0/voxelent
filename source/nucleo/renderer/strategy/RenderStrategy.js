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
 * Implements the default rendering strategy 
 * 
 * 
 * A vxlRenderStrategy object is selected by default as the strategy that an actor
 * will use for rendering.
 * 
 * A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * 	communicates with the program) from the actor.
 * @author Diego Cantor
 * 
 */
function vxlRenderStrategy(renderer){
	this.renderer = renderer;
	this._gl_buffers  = {};
	this._gl_textures = {};
	this._offscreen = false;
    this._target    = undefined;
    this._onPickingBuffer  = false;
    this._debug_picking_flag = false; //used only for debuggin purposes
	
	if (renderer){
	var gl = this.renderer.gl;
	
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.clearDepth(1.0);
	gl.disable(gl.CULL_FACE);
    }	
}

/**
 * Implements basic allocation of memory. Creates the WebGL buffers for the actor
 * @param {vxlScene} scene the scene to allocate memory for
  */
vxlRenderStrategy.prototype.allocate = function(scene){
    var elements = scene._actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    for(var i = 0; i < NUM; i+=1){
        this._allocateActor(elements[i]);
    }
};

/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlRenderStrategy.prototype.deallocate = function(scene){
    //DO NOTHING. THE DESCENDANTS WILL.
};

/**
 * Receives one actor and returns the GL buffers
 */
vxlRenderStrategy.prototype._allocateActor = function(actor){
   
    if (this._gl_buffers[actor.UID] != undefined){
        if (actor.dirty){ //@TODO: hmmmm frowning on dirty property this is a hack
            this._reallocateActor(actor); 
        }
        return;
    }
   	
	var gl = this.renderer.gl;
	var model = actor.model;
    var buffers = {};
	
	//Vertex Buffer
	buffers.vertex = gl.createBuffer();
	
	
	//Index Buffer
	if (model.indices != undefined){
		buffers.index = gl.createBuffer();
	}
	
	//Normals Buffer
	if (model.normals){
		buffers.normal = gl.createBuffer();
	}
	
	//Color Buffer for scalars
	if (model.scalars != undefined || model.colors != undefined){
		buffers.color = gl.createBuffer(); //we don't BIND values or use the buffers until the lut is loaded and available
	}
	
	//Wireframe Buffer 
	if (model.wireframe != undefined){
		buffers.wireframe = gl.createBuffer();
	}
	
	//Bounding box Buffer 
    buffers.bb = gl.createBuffer();
	
	//Texture Coords Buffer
	if (model.texture){
	    buffers.texcoords = gl.createBuffer();
	}
	   
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	
	this._gl_buffers[actor.UID] = buffers;
	this._reallocateActor(actor);
};


/**
 * Receives one actor and returns the GL buffers
 */
vxlRenderStrategy.prototype._reallocateActor = function(actor){
   
    var gl = this.renderer.gl;
    var model = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
    //Index Buffer
    if (model.indices != undefined){    
  
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    }
    
    //Normals Buffer
    if (model.normals){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
    }
    
    //Color Buffer for scalars
    if (model.scalars != undefined || model.colors != undefined){
        buffers.color = gl.createBuffer(); //we don't BIND values or use the buffers until the lut is loaded and available
    }
    
    //Wireframe Buffer 
    if (model.wireframe != undefined){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
    }   
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    //Bounding box Buffer 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.bb);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vxlModel.BB_INDICES), gl.STATIC_DRAW);
    
    
    //Texture Coords Buffer
    if (model.texture && actor.material.texture.loaded){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoords);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        
        this._gl_textures[actor.UID] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._gl_textures[actor.UID]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, actor.material.texture.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
/**
 * Passes the matrices to the shading program
 * @param {vxlActor} the actor 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 * @private
 */
vxlRenderStrategy.prototype._applyActorTransform = function(actor){
    
    var r		= this.renderer;
    var trx 	= r.transforms
    var	prg 	= r.prg;
    var glsl 	= vxl.def.glsl;

    trx.push();
        mat4.multiply(trx.mvMatrix, actor._matrix);
	    prg.setUniform(glsl.MODEL_VIEW_MATRIX,	r.transforms.mvMatrix);

	    trx.calculateModelViewPerspective();
        prg.setUniform(glsl.MVP_MATRIX, r.transforms.mvpMatrix);
        
        trx.calculateNormal(); 
        prg.setUniform(glsl.NORMAL_MATRIX, r.transforms.nMatrix);
    
    trx.pop();
 };
 
 
 /**
 * Passes the matrices to the shading program
 * @param {vxlActor} the actor 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 * @private
 */
vxlRenderStrategy.prototype._applyGlobalTransform = function(){
    
    var r       = this.renderer;
    var trx     = r.transforms
    var prg     = r.prg;
    var glsl    = vxl.def.glsl;

    prg.setUniform(glsl.MODEL_VIEW_MATRIX,  r.transforms.mvMatrix);
    trx.calculateModelViewPerspective();
    prg.setUniform(glsl.MVP_MATRIX, r.transforms.mvpMatrix);
    trx.calculateNormal(); 
    prg.setUniform(glsl.NORMAL_MATRIX, r.transforms.nMatrix);
    
 };
 
 
 /**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlRenderStrategy.prototype.render = function(scene){

    //Updates the perspective matrix and passes it to the program
    var r       = this.renderer,
    trx     = r.transforms,
    prg     = r.prg,
    glsl    = vxl.def.glsl,
    gl      = r.gl;
    
    trx.calculatePerspective();
    trx.calculateModelView();
    
    
    var elements = scene._actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    //is this supposed to be here?
    //----------------------------------------------------//
    if (scene.frameAnimation != undefined){
        scene.frameAnimation.update();
    }
    //----------------------------------------------------//
    
    this._handlePicking(scene._actors);
    
    if (this._debug_picking_flag){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };
    

    for(var i = 0; i < NUM; i+=1){
            this._renderActor(elements[i]);
    }
};

/**
 * @private
 */
vxlRenderStrategy.prototype._handlePicking = function(actors){
    
    if (this._target == undefined) return; //quick fail if the target has not been defined
    
    if (this._offscreen){
        
        var gl = this.renderer.gl;
        
        this._onPickingBuffer = true;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._target.framebuffer);
        
        
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        for(var i = 0, NUM = actors.length; i < NUM; i+=1){
            if (actors[i].isPickable()){
                this._renderActor(actors[i]);
            }
        }
        
        this._onPickingBuffer = false;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
    }
};

/**
 * @private
 */
vxlRenderStrategy.prototype._enableNormals = function(actor){
    
    var model = actor.model;
    var gl = this.renderer.gl;
    var prg = this.renderer.prg;
    var buffers = this._gl_buffers[actor.UID];
    var glsl    = vxl.def.glsl; 
    
    if(model.normals && actor.material.shading){
        try{
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
            
            prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
            prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
            
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
        }
    }
}; 

/**
 * @private
 */
vxlRenderStrategy.prototype._enableColors = function(actor){
    
    var model = actor.model;
    var gl = this.renderer.gl;
    var prg = this.renderer.prg;
    var buffers = this._gl_buffers[actor.UID];
    var glsl    = vxl.def.glsl; 
    
    if (actor.material.colors && actor.material.colors.length == actor.model.vertices.length){    
        try{
            prg.setUniform("uUseVertexColors", true);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.material.colors), gl.STATIC_DRAW);
            
            prg.enableAttribute(glsl.COLOR_ATTRIBUTE);
            prg.setAttributePointer(glsl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
        }
    }
};

/**
 * Renders a solid actor
 * @private
 */
vxlRenderStrategy.prototype._renderSolid = function(actor){
    
    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    
    this._enableNormals(actor);
    this._enableColors(actor);    

    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(actor.model.indices), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, actor.model.indices.length, gl.UNSIGNED_SHORT,0);
};

/**
 * Renders an actor as a wireframe
 */
vxlRenderStrategy.prototype._renderWireframe = function(actor){
    

    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    if (!actor.toy){
        this._enableNormals(actor);
    }
    this._enableColors(actor);
    
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(actor.model.wireframe), gl.STATIC_DRAW);
    gl.drawElements(gl.LINES, actor.model.wireframe.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderPoints = function(actor){
    
    var model   = actor.model;
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl; 
    
    prg.setUniform("uUseShading", false);
    prg.setUniform("uPointSize", 5);//TODO: this can be an actor property?
    gl.drawArrays(gl.POINTS,0, model.vertices.length/3);
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderLines = function(actor){
    
    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    prg.setUniform("uUseShading", false);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.LINES, actor.model.indices.length, gl.UNSIGNED_SHORT,0); 
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderBoundingBox = function(actor){
    
    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl; 
    
    prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
    prg.setUniform("uUseShading", false);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.getBoundingBoxVertices()), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.bb);
    gl.drawElements(gl.LINES, vxlModel.BB_INDICES.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderBoundingBoxAndSolid = function(actor){    var model   = actor.model;
    
    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    //solid
    this._renderSolid(actor);
    
    //bounding box, don't move the bb as it has been updated with the actor transform already ;-)
    this._applyGlobalTransform();
    
    prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
    prg.setUniform("uUseShading", false);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
    //@TODO: Review, should we be asking an actor for renderable vertices?
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.getBoundingBoxVertices()), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.bb);
    gl.drawElements(gl.LINES, vxlModel.BB_INDICES.length, gl.UNSIGNED_SHORT,0);
    
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderWiredAndSolid = function(actor){
   
var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    
    this._renderSolid(actor);
    
    prg.setUniform("uUseShading",false);
    prg.setUniform("uMaterialDiffuse",[0.9,0.9,0.9,1.0]);
    prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
    gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0); 
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderFlat = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    if (actor.mesh == undefined){
        //here it is necessary as there is not previous call for this .. for now.
        actor.mesh = new vxlMesh(actor.model); 
    }
    
    
    /******************************************/
    // THIS IS THE MAGIC TA DA!
    r = actor.mesh._renderable;
    if (r == undefined) {
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
        prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
        prg.setUniform("uUseShading",actor.material.shading);
        prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
        prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
        this._renderWireframe(actor);
        return;
    } 
     
    /******************************************/
   
    prg.setUniform("uUseShading",true);
    
    try{
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.normals), gl.STATIC_DRAW);
            
            prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
            prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
            
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
        }
        
    try{
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.vertices), gl.STATIC_DRAW);
        prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    }
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
        throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    
   if (r.colors){    
            try{
                prg.setUniform("uUseVertexColors", true);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.colors), gl.STATIC_DRAW);
                
                prg.enableAttribute(glsl.COLOR_ATTRIBUTE);
                prg.setAttributePointer(glsl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
            }
            catch(err){
                alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
                throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
            }
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(r.indices), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, r.indices.length, gl.UNSIGNED_SHORT,0);
     
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
 * Otherwise, when the object picking mode is CELL, then the mesh renderable is rendered. 
 * The mesh renderable colors every cell differently (drawback in performance)
 *    
 * @private
 */
vxlRenderStrategy.prototype._renderPickingBuffer = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    prg.setUniform("uUseShading",false);
    
    if (actor._picking == vxl.def.actor.picking.CELL){
    
      
        if (actor.mesh == undefined){
            return; // we just fail safely. We will render it whenever the actor is ready ;-)
                    // the mesh is generated inside actor.setPicker (see actor.setPicker method)
        }
        
        /******************************************/
        // THIS IS THE MAGIC TA DA!
         r = actor.mesh._renderable;
         if (r == undefined) return; 
        /******************************************/
        
        
        try{
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.vertices), gl.STATIC_DRAW);
            prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
        }
        
        if (r.pickingColors && r.pickingColors.length == r.vertices.length){    
            try{
                prg.setUniform("uUseVertexColors", true);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.pickingColors), gl.STATIC_DRAW);
                
                prg.enableAttribute(glsl.COLOR_ATTRIBUTE);
                prg.setAttributePointer(glsl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
            }
            catch(err){
                alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
                throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
            }
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(r.indices), gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, r.indices.length, gl.UNSIGNED_SHORT,0);
    }
    else if (actor._picking == vxl.def.actor.picking.OBJECT){
        
        prg.setUniform("uMaterialDiffuse",actor._pickingColor.concat(1.0));
        try{
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
            prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
    }
    
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     
};

/**
 * @private
 */
vxlRenderStrategy.prototype._renderTextured = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;   
    
    if (!actor.material.texture.loaded){
        this._renderSolid(actor);
        return;
    }
    
    if (model.texcoords){
        try{
            prg.setUniform("uUseTextures", true);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoords);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
            prg.setAttributePointer(glsl.TEXCOORD_ATTRIBUTE, 2, gl.FLOAT,false, 0,0);
            prg.enableAttribute(glsl.TEXCOORD_ATTRIBUTE);
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the texture buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the texture buffer. Error =' +err.description);
        }
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
    prg.setUniform("uSampler", 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlRenderStrategy.prototype._handleCulling = function(actor){
    var gl = this.renderer.gl;
    
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
 * @private
 */
vxlRenderStrategy.prototype._renderActor = function(actor){

    if (!actor.visible) return; //Quick and simple

    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;   
    var trx     = this.renderer.transforms;
    var diffuse = [actor.material.diffuse[0], 
                   actor.material.diffuse[1], 
                   actor.material.diffuse[2],
                   actor.material.opacity];
    
    
    /**
     * Setting the program has to be done BEFORE setting ANY uniform or attribute
     */
    if(actor.shininess > 0){
        this.renderer.setProgram(vxl.def.glsl.phong);
        prg.setUniform("uShininess", actor.material.shininess);
    }
    else{
        this.renderer.setProgram(vxl.def.glsl.lambert);
    }
    
    
    prg.disableAttribute(glsl.TEXCOORD_ATTRIBUTE);
    prg.disableAttribute(glsl.COLOR_ATTRIBUTE);
    prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
    prg.disableAttribute(glsl.PICKING_COLOR_ATTRIBUTE);
    prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
    
    prg.setUniform(glsl.PERSPECTIVE_MATRIX, trx.pMatrix);
    prg.setUniform("uUseVertexColors", false);
    prg.setUniform("uUseTextures", false);
    prg.setUniform("uUseShading",actor.material.shading);
    prg.setUniform("uMaterialDiffuse",diffuse);
    
    
    this._handleCulling(actor);
    this._applyActorTransform(actor);
    
    
    if(this._onPickingBuffer || this._debug_picking_flag){
        this._renderPickingBuffer(actor);
        return;
    }
    
        
    if (actor.mode != vxl.def.actor.mode.FLAT){
        try{
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
            prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
        }
        catch(err){
            alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
            throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
        }
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
            alert('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+actor.mode+' is not valid.');
            throw('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+actor.mode+' is not valid.'); 
    }
    
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
    
    
/**
 * Sets up the offscreen rendering variant
 * @param {vxlRenderTarget} target the render target
 */
vxlRenderStrategy.prototype.enableOffscreen = function(target){
    this._offscreen = true;
    this._target = target;
};

/**
 * Sets up the offscreen rendering variant
 * @param {vxlRenderTarget} target the render target
 */
vxlRenderStrategy.prototype.disableOffscreen = function(){
    this._offscreen = false;
    this._target = undefined;
};

