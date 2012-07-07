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


//@NOTE: Actors take care of rendering models
//@NOTE: model has to be loaded to be able to create actor. look for a way to enforce this.
//@NOTE: A possible optimization is to combine several actors in one buffer. Watch optimzation video on YouTube by Gregg Tavares

/**
 * @class
 * @constructor
 */
function vxlActor(model){
  
  
  
  this.bb = []
  this.allocated = false;
  this.visible   = true;
  this.mode = vxl.def.actor.mode.SOLID;
  this.opacity = 1.0;
  this.colors = model?(model.colors!=null?model.colors:null):null;	//it will create colors for this actor once a lookup table had been set up
  
  this.position 	= vec3.create([0, 0, 0]);
  this.scale 		= vec3.create([1, 1, 1]);
  this.rotation 	= vec3.create([0, 0, 0]);
  
  this.program       = undefined;
  this.picking_color = undefined;
  
  this.renderers = [];
  this.buffers = [];
  this.clones  = 0;
  
  if (model){
  	this.model 	 = model;
  	this.name 	 = model.name;
  	this.diffuse = model.diffuse;
  	this.bb 	 = model.outline;
  	this.mode    = model.mode;
  }
  
};


/**
 * If the property exists, then it updates it
 * @param {String} property 
 * @param {Object} value 
 * @TODO: if the property is position or scale then call the respective methods from here
 */
vxlActor.prototype.setProperty = function(property, value){
    if (property == 'position') throw 'Actor.setProperty(position), please use setPosition instead';
    if (property == 'scale')    throw 'Actor.setProperty(scale), please use setScale instead';
    
	if (this.hasOwnProperty(property)){
		this[property] = value;
		vxl.go.console('Actor: The actor '+this.name+' has been updated. ['+property+' = '+value+']');
	}
	else {
		throw ('Actor: the property '+ property+' does not exist');
	}
};

vxlActor.prototype.setPosition = function (position){
    this.position = vec3.create(position);
    throw('todo: recalculate bounding box');
    //TODO: Recalculate bounding box
};

vxlActor.prototype.setScale = function(scale){
    this.scale = vec3.create(scale);
    throw('todo: recalculate bounding box');
    //TODO: Recalculate bounding box
};

vxlActor.prototype.getPosition = function(){
	cc = this.centre;
	bb = this.bb;
	
	cc[0] = (bb[3] + bb[0]) /2;
	cc[1] = (bb[4] + bb[1]) /2;
	cc[2] = (bb[5] + bb[2]) /2;
		
	cc[0] = Math.round(cc[0]*1000)/1000;
	cc[1] = Math.round(cc[1]*1000)/1000;
	cc[2] = Math.round(cc[2]*1000)/1000;
	
	return cc;
};
/**
* Creates the internal WebGL buffers that will store geometry, normals, colors, etc for this Actor.
* It uses the renderer passed as a parameter to retrieve the gl context to use.
*/
vxlActor.prototype.allocate = function(renderer){
	
	//if (this.allocated) return; // if we need realocation create method reallocate to force it.
	
	//as we don't expect changes we set the buffers' data here.
   //OTHERWISE it should be done in the draw method as it is done with the axis and the bounding box
   
   if (this.renderers.indexOf(renderer)!=-1){ //if this renderer has been allocated then ignore
   		return;
   }
   
   vxl.go.console('Actor: Allocating actor '+this.name+' for view '+ renderer.view.name);
   	
	var gl = renderer.gl;
	var model = this.model;
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
* Deletes the WebGL buffers used for this object. After this the actor will not be rendered until a new allocation takes place
*/
vxlActor.prototype.deallocate = function(){

  throw('exception');
};



/**
 * Passes the matrices to the shading program
 * @param renderer determines the context for the transformations, 
 * different rendereres can have different matrices transformations 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 */
vxlActor.prototype.updateMatrixStack = function(renderer){
    
    var r	= renderer,	trx = r.transforms,	prg = r.prg;
    trx.calculateModelView();
    trx.push();
        mat4.scale      (trx.mvMatrix, this.scale);
		mat4.translate	(trx.mvMatrix, this.position);
		//TODO: Implement actor rotations
	    prg.setUniform("uMVMatrix",r.transforms.mvMatrix);
    trx.pop();
    trx.calculateNormal(); 
    prg.setUniform("uPMatrix", r.transforms.pMatrix);
    prg.setUniform("uNMatrix", r.transforms.nMatrix);
    
 };

/**
* Performs the rendering of this actor using the WebGL context provided by the renderer
* This method has the most WebGL code in all Nucleo.
* 
*/
vxlActor.prototype.render = function(renderer){
	
	
	if (!this.visible){ 
		return;
	}

	//if (this.program){
	  //renderer.setProgram(this.program);
	//} 
	//else {
	  //  renderer.setProgram(renderer.defaultProgram);
//	}
	
	
	var idx = this.renderers.indexOf(renderer);

	var model = this.model;
    var buffer = this.buffers[idx]; 
	
    //The actor is a good renderer friend.
	var gl = renderer.gl;
	var prg = renderer.prg;
	var trx = renderer.transforms;
	
	//First thing first. Handle actor transformations here
	this.updateMatrixStack(renderer);
	
	if (this.opacity < 1.0){
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		this.diffuse[3] = this.opacity;
	}
	else {
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		this.diffuse[3] = 1.0;
	}
	
	prg.setUniform("uMaterialDiffuse",this.diffuse);
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
        alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    	
	if (this.colors){	
		try{
			prg.setUniform("uUseVertexColors", true);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute("aVertexColor");
			prg.setAttributePointer("aVertexColor", 3, gl.FLOAT, false, 0, 0);
		}
		catch(err){
        	alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the color buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the color buffer. Error =' +err.description);
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
	        alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
    
    try{
		if (this.mode == vxl.def.actor.mode.SOLID){
			prg.setUniform("uUseShading",true);
			prg.enableAttribute("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.actor.mode.WIREFRAME){
			prg.setUniform("uUseShading", false);
			if (this.name == 'floor'){
			     prg.disableAttribute("aVertexNormal");
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.actor.mode.POINTS){
			prg.setUniform("uUseShading", true);
			prg.enableAttribute("aVertexNormal");
			gl.drawArrays(gl.POINTS,0, this.model.vertices.length/3);
		}
		else if (this.mode == vxl.def.actor.mode.LINES){
			prg.setUniform("uUseShading", false);
			prg.disableAttribute("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.LINES, this.model.indices.length, gl.UNSIGNED_SHORT,0);
		
		}
		else{
            alert('There was a problem while rendering the actor ['+this.name+']. The visualization mode: '+this.mode+' is not valid.');
			throw('There was a problem while rendering the actor ['+this.name+']. The visualization mode: '+this.mode+' is not valid.');
			
		}
		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
	     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	     

    }
	catch(err){
		alert('Error rendering actor ['+this.name+']. Error =' +err.description);
		throw('Error rendering actor ['+this.name+']. Error =' +err.description);
	}
	
};

/**
* Sets the actor color. This color can be different from the original model color
* @TODO: Deprecated
*/
vxlActor.prototype.setColor = function (c){
	this.color = c.slice(0);
	vxl.go.console('Actor '+this.name+': color changed to : (' + this.color[0] +','+ this.color[1] +','+ this.color[2]+')');
};

/**
* Sets the lookup table for this actor
*/
vxlActor.prototype.setLookupTable = function(lutID,min,max){
	if (this.model.scalars){
		var lut = vxl.go.lookupTableManager.get(lutID);
		this.colors  = lut.getColors(this.model.scalars,min,max);
	}
};

/**
* Sets the visualization mode for this actor.
* @param {vxl.def.actor.mode} mode mode needs to be one of the elements defined in vxl.def.actor.mode
* @TODO: VALIDATE
*/
vxlActor.prototype.setVisualizationMode = function(mode){
	this.mode = mode;
};

/**
 * Sets the opacity of this actor. 
 * @param {Number} o a float value between 0 and 1. 
 */
vxlActor.prototype.setOpacity = function(o){
	if (o>=0 && o<=1){
		this.opacity = o;
	}
	else throw 'The opacity value is not valid';
};

/**
* Flips the normal for this actor. It delegates the task to the model
* @TODO: Review. we could want the actor to have flipped normals but not to impose this on the model. 
*/
vxlActor.prototype.flipNormals = function(){
	this.model.getNormals(true);
};

/**
* Sets the visibility of the actor
* @param flag true or false
*/
vxlActor.prototype.setVisible = function(flag){
    this.visible = flag;
};

/**
* Is visible?
*/
vxlActor.prototype.isVisible = function(){
    return this.visible;
};

/**
 * Duplicates this actor.
 * 
 * Properties copied by REFERENCE:
 * model,
 * buffers,
 * renderers
 * 
 * Everything else is copied by VALUE.
 * 
 * This method is fundamental to replicate objects in the scene, without having to duplicate
 * the shared model. A cloned actor however can have different position, colors, properties, etc.
 * 
 * If a cloned actor modifies his internal model, any other actor that shares the model will be
 * affected. 
 * 
 * The returned actor is not added to the scene automatically. It is up the
 * programmer to determine the scene the cloned actor needs to be added to if any.
 * 
 * @see vxlModel
 * @returns {vxlActor} an actor 
 */
vxlActor.prototype.clone = function(){
    this.clones++;
	
	var duplicate = new vxlActor(this.model);
	duplicate['program']   = this['program'];
	vec3.set(this.scale,    duplicate.scale);
	vec3.set(this.position, duplicate.position);
	
	
	//Now to save us some memory, let's SHARE the WebGL buffers that the current actor has already allocated'
	//duplicate.renderers = this.renderers;
	//duplicate.buffers   = this.buffers;
	//duplicate.model 	= this.model;
	duplicate.name     += '-'+this.clones; 
	return duplicate;
};

