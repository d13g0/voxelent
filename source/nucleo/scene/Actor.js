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
  
  this.bb = [0, 0, 0, 0, 0, 0];
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
  this.clones  = 0;
  this.strategy = new vxlBasicStrategy();

  if (model){
  	this.model 	 = model;
  	this.name 	 = model.name;
  	this.diffuse = model.diffuse;
  	this.bb 	 = model.bb.slice(0);
  	this.mode    = model.mode==undefined?vxl.def.actor.mode.SOLID:model.mode;
  }
};


/**
 * Sets the position of this actor. 
 * 
 * It updates the bounding box according to the position of the actor. The position of the actor
 * is initially [0,0,0] and it is relative to the model centre. If the model is not centered in 
 * the origin, then the actor's position will be relative to the model centre.
 * 
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a glMatrix vec3
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlActor.prototype.setPosition = function (x,y,z){
    
    var bb = this.bb;
    
    this.position = vxl.util.createVec3(x,y,z); 
    
    var currentPos = vec3.set(this.position, vec3.create()); 
    
    //Now recalculate the bounding box 
    var shift = vec3.subtract(this.position, currentPos, vec3.create());
    bb[0] += shift[0];
    bb[1] += shift[1];
    bb[2] += shift[2];
    bb[3] += shift[0];
    bb[4] += shift[1];
    bb[5] += shift[2];
    
};
/**
 * Scales this actor. 
 * @param {Number, Array, vec3} s the scaling factor. The scaling factor is applied in all axes.
 *
 */
vxlActor.prototype.setScale = function(s){
    
    if (typeof(s)=="number"){
        this.scale = vxl.util.createVec3(s,s,s);
    }
    else{
        this.scale = vxl.util.createVec3(s);
    }
    //TODO: Recalculate bounding box
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


/**
 * Estimates the current position as
 * the center of the current bounding box. 
 * This method does not update the internal position of the actor
 * it only returns an estimate based on the location of its bounding box.
 */
vxlActor.prototype.computePosition = function(){
	bb = this.bb;
	var cc = this.position;
	
	cc[0] = (bb[3] + bb[0]) /2;
	cc[1] = (bb[4] + bb[1]) /2;
	cc[2] = (bb[5] + bb[2]) /2;
		
	cc[0] = Math.round(cc[0]*1000)/1000;
	cc[1] = Math.round(cc[1]*1000)/1000;
	cc[2] = Math.round(cc[2]*1000)/1000;
	
	return vec3.create(cc); 
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
* Sets the lookup table for this actor.
* This method will only succeed if the model that this actor represents has scalars 
* @param {String} lutID the lookup table id. @see{vxl.def.lut.list} for currently supported ids.
* @param {Number} min lowest value for interpolation
* @param {Number} max highest value for interpolation
*/
vxlActor.prototype.setLookupTable = function(lutID,min,max){
	if (this.model.scalars){
		var lut = vxl.go.lookupTableManager.get(lutID);
		this.colors  = lut.getColors(this.model.scalars,min,max);
	}
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


/**
* @private
* It gives the strategy the opportunity to allocate memory for this actor. For instance
* WebGL buffers.
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly.
*/
vxlActor.prototype._allocate = function(renderer){
	this.strategy.allocate(this,renderer);
};

/**
* @private
* It gives the strategy the opportunity to deallocate memory for this actor.
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly. 
*/
vxlActor.prototype._deallocate = function(){
  this.strategy.deallocate(this,renderer);
};

/**
* @private
* Delegates the rendering of the actor to the strategy
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly. 
*/
vxlActor.prototype._render = function(renderer){
	
	if (!this.visible){ 
		return;
	}
	this.strategy.render(this, renderer);
};

