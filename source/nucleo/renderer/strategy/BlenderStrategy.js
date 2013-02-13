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
vxlBlenderStrategy.prototype = new vxlBasicStrategy()
vxlBlenderStrategy.prototype.constructor = vxlBlenderStrategy;

/**
 * Implements the strategy to render Blender scenes that have been exported to the OBJ format and from there
 * to the Voxelent format.
 * @author Diego Cantor
 * @class
 * Implements the strategy to render Blender scenes that have been exported to the OBJ format and from there
 * to the Voxelent format. 
 * @extends vxlBasicStrategy
 * @constructor 
 * @param {vxlRenderer} renderer the renderer associated to this strategy
 *  
 */
function vxlBlenderStrategy(renderer) {
	vxlBasicStrategy.call(this,renderer);
}

/**
 * Renders the scene
 * @param {Object} scene
 */
vxlBlenderStrategy.prototype.render = function(scene){
    
    //Updates the perspective matrix and passes it to the program
    var r       = this.renderer;
    var trx     = r.transforms
    var prg     = r.prg;
    var glsl    = vxl.def.glsl;
    
    trx.calculatePerspective();
    trx.calculateModelView();
    prg.setUniform(glsl.PERSPECTIVE_MATRIX, trx.pMatrix);
    
    var elements = scene._actors.concat(scene.toys.list);
    var NUM = elements.length;
    
    if (scene.frameAnimation != undefined){
        scene.frameAnimation.update();
    }

    for(var i = 0; i < NUM; i+=1){
        this._renderActor(elements[i]);
    }
};


/**
 * Passes the matrices to the shading program
 * @param {vxlActor} the actor 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 * @private
 */
vxlBlenderStrategy.prototype._applyActorTransform = function(actor){
    
    var r       = this.renderer;
    var trx     = r.transforms
    var prg     = r.prg;
    var glsl    = vxl.def.glsl;

    trx.push();
        mat4.translate  (trx.mvMatrix, actor._position);
        mat4.scale      (trx.mvMatrix, actor._scale);
        //@TODO: IMPLEMENT ACTOR ROTATIONS
        
        prg.setUniform(glsl.MODEL_VIEW_MATRIX,  r.transforms.mvMatrix);
    trx.pop();
    
    trx.calculateNormal(); 
    prg.setUniform(glsl.NORMAL_MATRIX, r.transforms.nMatrix);
    
    
    
 };

/**
 * @private
 * @param {Object} actor
 */
vxlBlenderStrategy.prototype._renderActor = function(actor){
	
	if (actor.name == 'bounding box' || actor.name == 'axis' || actor.name =='floor'){
		return;
	}

	var model 	= actor.model;
    var buffers = this._gl_buffers[actor.UID]; 
    var r  		= this.renderer;
	var gl 		= r.gl;
	var prg 	= r.prg;
	var trx 	= r.transforms;
	var glsl    = vxl.def.glsl;
	
	gl.disable(gl.CULL_FACE);
    
    if (actor.cull != vxl.def.actor.cull.NONE){
        gl.enable(gl.CULL_FACE);
        
        switch (actor.cull){
            case vxl.def.actor.cull.BACK: gl.cullFace(gl.BACK); break;
            case vxl.def.actor.cull.FRONT: gl.cullFace(gl.FRONT); break;
        }
    }
    
	this._applyActorTransform(actor);
	
	prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
	prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
	
	prg.setUniform("uKa", actor.getProperty("Ka"));
	prg.setUniform("uKd", actor.getProperty("Kd"));
	prg.setUniform("uKs", actor.getProperty("Ks"));
	prg.setUniform("uNs", actor.getProperty("Ns"));
	prg.setUniform("d", actor.getProperty("opacity"));
	prg.setUniform("illum", actor.getProperty("illum"));
	
	
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
	}
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
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
	
	
	try{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
		gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);

    	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	catch(err){
		alert('Error rendering actor ['+actor.name+']. Error =' +err.description);
		throw('Error rendering actor ['+actor.name+']. Error =' +err.description);
	}

};