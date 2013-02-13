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
vxlLambertStrategy.prototype = new vxlBasicStrategy(undefined)
vxlLambertStrategy.prototype.constructor = vxlLambertStrategy;

/**
 * 
 * Implements a rendering strategy that works with the vxl.def.glsl.lambert program. 
 * A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * communicates with the program) from the actor.
 * @constructor
 * @class a vxlLambertStrategy object is selected by default as the strategy that an actor
 * will use for rendering.
 * 
 * @extends vxlBasicStrategy
 * @author Diego Cantor
 * 
 */
function vxlLambertStrategy(renderer){
	vxlBasicStrategy.call(this,renderer);

	this._offscreen = false;
	this._target    = undefined;
	this._onPickingBuffer  = false;
}


/**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlLambertStrategy.prototype.render = function(scene){

    //Updates the perspective matrix and passes it to the program
    var r       = this.renderer,
    trx     = r.transforms,
    prg     = r.prg,
    glsl    = vxl.def.glsl,
    gl      = r.gl;
    
    trx.calculatePerspective();
    trx.calculateModelView();
    prg.setUniform(glsl.PERSPECTIVE_MATRIX, trx.pMatrix);
    
    var elements = scene._actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    if (scene.frameAnimation != undefined){
        scene.frameAnimation.update();
    }
    
    this._handlePicking(scene._actors);
    

    for(var i = 0; i < NUM; i+=1){
            this._renderActor(elements[i]);
    }
};

/**
 * @private
 */
vxlLambertStrategy.prototype._handlePicking = function(actors){
    
    if (this._target == undefined) return; //quick fail if the target has not been defined
    
    if (this._offscreen){
        
        var gl = this.renderer.gl;
        
        this._onPickingBuffer = true;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._target.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0,0,0,1);
        
        for(var i = 0, NUM = actors.length; i < NUM; i+=1){
            if (actors[i].isPickable()){
                this._renderActor(actors[i]);
            }
        }
        
        this._onPickingBuffer = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var cc = this.renderer._clearColor;
        this.renderer.clearColor(cc);
    }
};

/**
 * @private
 */
vxlLambertStrategy.prototype._enableNormals = function(actor){
    
    var model = actor.model;
    var gl = this.renderer.gl;
    var prg = this.renderer.prg;
    var buffers = this._gl_buffers[actor.UID];
    var glsl    = vxl.def.glsl; 
    
    if(model.normals && actor.shading){
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
vxlLambertStrategy.prototype._enableColors = function(actor){
    
    var model = actor.model;
    var gl = this.renderer.gl;
    var prg = this.renderer.prg;
    var buffers = this._gl_buffers[actor.UID];
    var glsl    = vxl.def.glsl; 
    
    if (actor.colors && actor.colors.length == actor.model.vertices.length){    
        try{
            prg.setUniform("uUseVertexColors", true);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.colors), gl.STATIC_DRAW);
            
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
vxlLambertStrategy.prototype._renderSolid = function(actor){
    
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
vxlLambertStrategy.prototype._renderWireframe = function(actor){
    

    var buffers = this._gl_buffers[actor.UID];
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
   
    this._enableNormals(actor);
    
    if (actor.name == 'floor'){
        prg.disableAttribute(glsl.NORMAL_ATTRIBUTE); //floor does not have reflections. Always mate color!
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(actor.model.wireframe), gl.STATIC_DRAW);
    gl.drawElements(gl.LINES, actor.model.wireframe.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlLambertStrategy.prototype._renderPoints = function(actor){
    
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
vxlLambertStrategy.prototype._renderLines = function(actor){
    
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
vxlLambertStrategy.prototype._renderBoundingBox = function(actor){
    
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
vxlLambertStrategy.prototype._renderBoundingBoxAndSolid = function(actor){    var model   = actor.model;
    
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
vxlLambertStrategy.prototype._renderWiredAndSolid = function(actor){
   
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
vxlLambertStrategy.prototype._renderFlat = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    if (actor.mesh == undefined){
        actor.mesh = new vxlMesh(actor.model);
    }
    
    /******************************************/
    // TA DA!
     r = actor.mesh.renderable;
     if (r == undefined) return; 
    /**************/
   
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
    
    prg.setUniform("uUseVertexColors", false);
    /*if (model.colors && r.colors.length == r.vertices.length){    
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
    }*/
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(r.indices), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, r.indices.length, gl.UNSIGNED_SHORT,0);
     
};


/**
 * @private
 */
vxlLambertStrategy.prototype._renderPickingBuffer = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;
    
    if (actor.mesh == undefined){
        actor.mesh = new vxlMesh(actor.model);
    }
    
    /******************************************/
    // TA DA!
     r = actor.mesh.renderable;
     if (r == undefined) return; 
    /******************************************/
    
    prg.setUniform("uUseShading",false);
    
    try{
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.vertices), gl.STATIC_DRAW);
        prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
    }
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
        throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    
    if (model.colors && r.colors.length == r.vertices.length){    
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
    
    //Cleaning up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     
};

/**
 * @private
 */
vxlLambertStrategy.prototype._renderTextured = function(actor){
    
    var model   = actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
    var glsl    = vxl.def.glsl;   
    
    
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, actor.texture.getMagFilter(gl));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, actor.texture.getMinFilter(gl));
    prg.setUniform("uSampler", 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
};

/**
 * @private
 */
vxlLambertStrategy.prototype._handleCulling = function(actor){
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
vxlLambertStrategy.prototype._renderActor = function(actor){

    if (!actor.visible) return; //Quick and simple
    if (this._renderpass == true && actor.name == 'floor') return;
    
	var model 	= actor.model;
    var buffers = this._gl_buffers[actor.UID];
    var texture = this._gl_textures[actor.UID]; 
    var gl      = this.renderer.gl;
    var prg     = this.renderer.prg;
	var glsl    = vxl.def.glsl;   
    var diffuse = [actor.color[0], actor.color[1], actor.color[2],actor.opacity];
    
    
	prg.disableAttribute(glsl.TEXCOORD_ATTRIBUTE);
    prg.disableAttribute(glsl.COLOR_ATTRIBUTE);
    prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
    prg.disableAttribute(glsl.PICKING_COLOR_ATTRIBUTE);
    prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
    
    prg.setUniform("uUseVertexColors", false);
    prg.setUniform("uUseTextures", false);
    prg.setUniform("uUseShading",actor.shading);
    prg.setUniform("uMaterialDiffuse",diffuse);
    
    
    this._handleCulling(actor);
    this._applyActorTransform(actor);
    
    
    if(this._onPickingBuffer){
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
vxlLambertStrategy.prototype.enableOffscreen = function(target){
    this._offscreen = true;
    this._target = target;
};

/**
 * Sets up the offscreen rendering variant
 * @param {vxlRenderTarget} target the render target
 */
vxlLambertStrategy.prototype.disableOffscreen = function(){
    this._offscreen = false;
    this._target = undefined;
};
