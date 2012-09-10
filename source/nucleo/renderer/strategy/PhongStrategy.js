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
vxlPhongStrategy.prototype = new vxlRenderStrategy(undefined)
vxlPhongStrategy.prototype.constructor = vxlPhongStrategy;

/**
 * Implements a rendering strategy that works with the vxl.def.glsl.phong program. 
 * A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * communicates with the program) from the actor.
 * @constructor
 * @class  Implements a rendering strategy that works with the vxl.def.glsl.phong program
 * 
 * 
 * @extends vxlBasicStrategy 
 * @author Diego Cantor
 * 
 */
function vxlPhongStrategy(renderer){
	vxlRenderStrategy.call(this,renderer);
	this._gl_buffers  = {};
	
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
vxlPhongStrategy.prototype.allocate = function(scene){
    var elements = scene.actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    for(var i = 0; i < NUM; i+=1){
        this._allocateActor(elements[i]);
    }
};

/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlPhongStrategy.prototype.deallocate = function(scene){
    //DO NOTHING. THE DESCENDANTS WILL.
}


/**
 * Renders the actors one by one
 * @param {vxlScene} scene the scene to render
 */
vxlPhongStrategy.prototype.render = function(scene){

    //Updates the perspective matrix and passes it to the program
    var r       = this.renderer;
    var trx     = r.transforms
    var prg     = r.prg;
    var glsl    = vxl.def.glsl;
    
    trx.calculatePerspective();
    trx.calculateModelView();
    prg.setUniform(glsl.PERSPECTIVE_MATRIX, trx.pMatrix);
    
    var elements = scene.actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    if (scene.frameAnimation != undefined){
        scene.frameAnimation.update();
    }

    for(var i = 0; i < NUM; i+=1){
        this._renderActor(elements[i]);
    }
};



/**
 * Receives one actor and returns the GL buffers
 */
vxlPhongStrategy.prototype._allocateActor = function(actor){
   
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
 */
vxlPhongStrategy.prototype._applyActorTransform = function(actor){
    
    var r		= this.renderer;
    var trx 	= r.transforms
    var	prg 	= r.prg;
    var glsl 	= vxl.def.glsl;

    trx.push();
        
        
		mat4.translate	(trx.mvMatrix, actor.position);
		mat4.scale      (trx.mvMatrix, actor.scale);
		//@TODO: IMPLEMENT ACTOR ROTATIONS
	    
	    prg.setUniform(glsl.MODEL_VIEW_MATRIX,	r.transforms.mvMatrix);

	    trx.calculateModelViewPerspective();
        prg.setUniform(glsl.MVP_MATRIX, r.transforms.mvpMatrix);
    trx.pop();
    
    trx.calculateNormal(); 
    prg.setUniform(glsl.NORMAL_MATRIX, r.transforms.nMatrix);
    
    
    
 };


vxlPhongStrategy.prototype._renderActor = function(actor){

    if (!actor.visible) return; //Quick and simple
    
	var model 	= actor.model;
    var buffers = this._gl_buffers[actor.UID]; 
    var r  		= this.renderer;
	var gl 		= r.gl;
	var prg 	= r.prg;
	var trx 	= r.transforms;
	var glsl    = vxl.def.glsl;
	
	this._applyActorTransform(actor);
	
	var diffuse = [actor.color[0], actor.color[1], actor.color[2],1.0];
	
	if (actor.opacity < 1.0){
		diffuse[3] = actor.opacity;
	}
	else {
		diffuse[3] = 1.0;
	}
	
	prg.setUniform("uMaterialDiffuse",diffuse);
	prg.setUniform("uUseVertexColors", false);
    
    prg.disableAttribute(glsl.COLOR_ATTRIBUTE);
	prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
	prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
	
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
	}
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    	
	if (actor.colors){	
		try{
			prg.setUniform("uUseVertexColors", true);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.colors.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute(glsl.COLOR_ATTRIBUTE);
			prg.setAttributePointer(glsl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
		}
		catch(err){
        	alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
   		}
    }
    
    if(model.normals){
	    try{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
		}
	    catch(err){
	        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
    prg.setUniform("uUseShading",actor.shading);
    
    try{
		if (actor.mode == vxl.def.actor.mode.SOLID){
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (actor.mode == vxl.def.actor.mode.WIREFRAME){
			if (actor.name == 'floor'){
			     prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (actor.mode == vxl.def.actor.mode.POINTS){
			prg.setUniform("uUseShading", true);
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			gl.drawArrays(gl.POINTS,0, this.model.vertices.length/3);
		}
		else if (actor.mode == vxl.def.actor.mode.LINES){
			prg.setUniform("uUseShading", false);
			prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
			gl.drawElements(gl.LINES, actor.model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else{
            alert('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+this.mode+' is not valid.');
			throw('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+this.mode+' is not valid.');
			
		}
		//Cleaning up
		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
	     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
	catch(err){
		alert('Error rendering actor ['+actor.name+']. Error =' +err.description);
		throw('Error rendering actor ['+actor.name+']. Error =' +err.description);
	}
};

