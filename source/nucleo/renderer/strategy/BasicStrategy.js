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
vxlBasicStrategy.prototype = new vxlRenderStrategy()
vxlBasicStrategy.prototype.constructor = vxlBasicStrategy;

/**
 * @constructor
 * @class
 * Implements a basic rendering strategy that works with the following programs:
 * 
 * vxl.def.glsl.lambert
 * vxl.def.glsl.phong
 * 
 * A vxlBasicStrategy object is selected by default as the strategy that an actor
 * will use for rendering.
 * 
 * A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * 	communicates with the program) from the actor.
 * 
 */
function vxlBasicStrategy(){
  this.renderers = [];
  this.buffers = [];
}

/**
 * Implements basic allocation of memory. Creates the WebGL buffers for the actor
 * @param{vxlActor} actor the actor to allocate memory for
 * @param{vxlRenderer} the renderer that contains the gl context to use
 */
vxlBasicStrategy.prototype.allocate = function(actor, renderer){
	//if (this.allocated) return; // if we need realocation create method reallocate to force it.
	
	//as we don't expect changes we set the buffers' data here.
   //OTHERWISE it should be done in the draw method as it is done with the axis and the bounding box
   
   if (this.renderers.indexOf(renderer)!=-1){ //if this renderer has been allocated then ignore
   		return;
   }
   
   vxl.go.console('Actor: Allocating actor '+actor.name+' for view '+ renderer.view.name);
   	
	var gl = renderer.gl;
	var model = actor.model;
    var buffer = {};
	
	buffer.vertex = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	
	if (model.normals){
		buffer.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
	}
	
	if (model.scalars != undefined || model.colors != undefined){
		buffer.color = gl.createBuffer(); //we don't BIND values or use the buffer until the lut is loaded and available
	}
	
	
	
	if (model.wireframe != undefined){
		buffer.wireframe = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
	}
	
	if (model.indices != undefined){
		buffer.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	this.renderers.push(renderer);
	this.buffers.push(buffer);

};

/**
 * Passes the matrices to the shading program
 * @param {vxlActor} the actor 
 * @param {vxlRenderer} renderer determines the context for the transformations, 
 * different renderers can have different matrices transformations 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 */
vxlBasicStrategy.prototype._updateMatrixStack = function(actor, renderer){
    
    var r	= renderer,	trx = r.transforms,	prg = r.prg;
    trx.calculateModelView();
    trx.push();
        mat4.scale      (trx.mvMatrix, actor.scale);
		mat4.translate	(trx.mvMatrix, actor.position);
		//@TODO: IMPLEMENT ACTOR ROTATIONS
		var negposition = vec3.negate(actor.position, vec3.create());
		//mat4.translate (trx.mvMatrix, negposition);
	    prg.setUniform("uMVMatrix",r.transforms.mvMatrix);
    trx.pop();
    trx.calculateNormal(); 
    prg.setUniform("uPMatrix", r.transforms.pMatrix);
    prg.setUniform("uNMatrix", r.transforms.nMatrix);
    
 };


vxlBasicStrategy.prototype.render = function(actor, renderer){
	 // @TODO: Analyze this idea
	//if (this.program){
	//renderer.setProgram(this.program);
	//} 
	//else {
	//  renderer.setProgram(renderer.defaultProgram);
	//}
	
	
	var idx = this.renderers.indexOf(renderer);

	var model = actor.model;
    var buffer = this.buffers[idx]; 
	
    //The actor is a good renderer friend.
	var gl = renderer.gl;
	var prg = renderer.prg;
	var trx = renderer.transforms;
	
	//First thing first. Handle actor transformations here
	this._updateMatrixStack(actor, renderer);
	
	if (actor.opacity < 1.0){
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		actor.diffuse[3] = this.opacity;
	}
	else {
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		actor.diffuse[3] = 1.0;
	}
	
	prg.setUniform("uMaterialDiffuse",actor.diffuse);
	prg.setUniform("uUseVertexColors", false);
    
    prg.disableAttribute("aVertexColor");
	prg.disableAttribute("aVertexNormal");
	prg.enableAttribute("aVertexPosition");
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setAttributePointer("aVertexPosition", 3, gl.FLOAT, false, 0, 0);
	}
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    	
	if (actor.colors){	
		try{
			prg.setUniform("uUseVertexColors", true);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.colors.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute("aVertexColor");
			prg.setAttributePointer("aVertexColor", 3, gl.FLOAT, false, 0, 0);
		}
		catch(err){
        	alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
   		}
    }
    
    if(model.normals){
	    try{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute("aVertexNormal");
			prg.setAttributePointer("aVertexNormal",3,gl.FLOAT, false, 0,0);
		}
	    catch(err){
	        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
    
    try{
		if (actor.mode == vxl.def.actor.mode.SOLID){
			prg.setUniform("uUseShading",true);
			prg.enableAttribute("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (actor.mode == vxl.def.actor.mode.WIREFRAME){
			prg.setUniform("uUseShading", false);
			if (actor.name == 'floor'){
			     prg.disableAttribute("aVertexNormal");
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (actor.mode == vxl.def.actor.mode.POINTS){
			prg.setUniform("uUseShading", true);
			prg.enableAttribute("aVertexNormal");
			gl.drawArrays(gl.POINTS,0, this.model.vertices.length/3);
		}
		else if (actor.mode == vxl.def.actor.mode.LINES){
			prg.setUniform("uUseShading", false);
			prg.disableAttribute("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.LINES, actor.model.indices.length, gl.UNSIGNED_SHORT,0);
		
		}
		else{
            alert('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+this.mode+' is not valid.');
			throw('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+this.mode+' is not valid.');
			
		}
		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
	     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	     

    }
	catch(err){
		alert('Error rendering actor ['+actor.name+']. Error =' +err.description);
		throw('Error rendering actor ['+actor.name+']. Error =' +err.description);
	}
};

