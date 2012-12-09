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
vxlBasicStrategy.prototype = new vxlRenderStrategy(undefined)
vxlBasicStrategy.prototype.constructor = vxlBasicStrategy;

/**
 * @constructor
 * @class
 * Implements a basic rendering strategy 
 * 
 * 
 * A vxlBasicStrategy object is selected by default as the strategy that an actor
 * will use for rendering.
 * 
 * A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * 	communicates with the program) from the actor.
 * @author Diego Cantor
 * 
 */
function vxlBasicStrategy(renderer){
	vxlRenderStrategy.call(this,renderer);
	this._gl_buffers  = {};
	this._gl_textures = {};
	
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
vxlBasicStrategy.prototype.allocate = function(scene){
    var elements = scene.actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    for(var i = 0; i < NUM; i+=1){
        this._allocateActor(elements[i]);
    }
};

/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlBasicStrategy.prototype.deallocate = function(scene){
    //DO NOTHING. THE DESCENDANTS WILL.
}


/**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlBasicStrategy.prototype.render = function(scene){
 //The descendants will
 alert('vxlBasicStrategy.render: abstract render method invoked');    
};



/**
 * Receives one actor and returns the GL buffers
 */
vxlBasicStrategy.prototype._allocateActor = function(actor){
   
    if (this._gl_buffers[actor.UID] != undefined) return; // the actor has already been allocated
   	
	var gl = this.renderer.gl;
	var model = actor.model;
    var buffers = {};
	
	//Vertex Buffer
	buffers.vertex = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	
	//Index Buffer
	if (model.indices != undefined){
		buffers.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
	}
	
	//Normals Buffer
	if (model.normals){
		buffers.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
	}
	
	//Color Buffer for scalars
	if (model.scalars != undefined || model.colors != undefined){
		buffers.color = gl.createBuffer(); //we don't BIND values or use the buffers until the lut is loaded and available
	}
	
	//Wireframe Buffer 
	if (model.wireframe != undefined){
		buffers.wireframe = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
	}
	
	//Bounding box Buffer 
    buffers.bb = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.bb);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vxlModel.BB_INDICES), gl.STATIC_DRAW);
    
	
	//Texture Coords Buffer
	if (model.texture){
	    buffers.texcoords = gl.createBuffer();
	    
	    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoords);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        
        this._gl_textures[actor.UID] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._gl_textures[actor.UID]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, actor.texture.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	//Cleaning up
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	this._gl_buffers[actor.UID] = buffers; 
};

/**
 * Passes the matrices to the shading program
 * @param {vxlActor} the actor 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 * @private
 */
vxlBasicStrategy.prototype._applyActorTransform = function(actor){
    
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
vxlBasicStrategy.prototype._applyGlobalTransform = function(){
    
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
