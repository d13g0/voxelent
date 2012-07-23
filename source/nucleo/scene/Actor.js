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
 * <p>
 * An actor is a representation of a model in Voxelent. Actors can cache model properties 
 * and modified them. This is useful when there are several actors based in the same model
 * but each one of them needs to have a different version of any given model property (i.e. color)
 * </p>
 * <p> 
 * To propagate one change for all the actors based in the same model, the setProperty method
 * should be invoked by setting the third parameter (scope) like this:
 * </p>
 * 
 * <pre>
 * var actor = vxl.c.scene.getActorByName('example.json');
 * actor.setProperty('color',[1.0,0.0,0.0], vxl.def.model)
 * </pre>
 * 
 * <p>If the change should be local (for just that actor)  then you should write:</p>
 * 
 * <pre>
 * var actor = vxl.c.scene.getActorByName('example.json');
 * actor.setProperty('color',[1.0,0.0,0.0], vxl.def.actor)
 * </pre>
 * 
 * <p> Or simply </p>
 *  
 * <pre>
 * var actor = vxl.c.scene.getActorByName('example.json');
 * actor.setProperty('color',[1.0,0.0,0.0])
 * </pre>
 * @class
 * @constructor
 */
function vxlActor(model){
  
  this.bb = [0, 0, 0, 0, 0, 0];
  this.position 	= vec3.create([0, 0, 0]);
  this.scale 		= vec3.create([1, 1, 1]);
  this.rotation 	= vec3.create([0, 0, 0]);

  this.visible      = true;
  this.mode         = vxl.def.actor.mode.SOLID;
  this.opacity      = 1.0;
  this.colors       = model?(model.colors!=null?model.colors:null):null;	//it will create colors for this actor once a lookup table had been set up
  this.clones       = 0;
  
  this._renderers   = [];
  this._gl_buffers  = [];
  this.shading      = true;

  
  if (model){
  	this.model 	    = model;
  	this.name 	    = model.name;
  	//In the newest versions of Voxelent JSON format, the diffuse property has been replaced with color property.
  	this.color      = model.color!=undefined?model.color:(model.diffuse!=undefined?model.diffuse:undefined); 
  	this.bb 	    = model.bb.slice(0);
  	this.mode       = model.mode==undefined?vxl.def.actor.mode.SOLID:model.mode;
  }
  
  vxl.go.notifier.publish(vxl.events.ACTOR_BB_UPDATED, this);
  
};


/**
 * Sets the position of this actor. 
 * 
 * It updates the bounding box according to the position of the actor. The position of the actor
 * is initially [0,0,0] and it is relative to the model centre. If the model is not centered in 
 * the origin, then the actor's position will be relative to the model centre.
 * 
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlActor.prototype.setPosition = function (x,y,z){
    
    var bb = this.bb;
    var currentPos = vec3.set(this.position, vec3.create());
    
    this.position = vxl.util.createVec3(x,y,z); 
    
    //Now recalculate the bounding box 
    var shift = vec3.subtract(this.position, currentPos, vec3.create());
    bb[0] += shift[0];
    bb[1] += shift[1];
    bb[2] += shift[2];
    bb[3] += shift[0];
    bb[4] += shift[1];
    bb[5] += shift[2];
    
    vxl.go.notifier.fire(vxl.events.ACTOR_BB_UPDATED, this);
};
/**
 * Scales this actor. 
 * @param {Number, Array, vec3} s the scaling factor. The scaling factor is applied in all axes.
 *
 */
vxlActor.prototype.setScale = function(s){
    
    var bb = this.bb;
    
    if (typeof(s)=="number"){
        this.scale = vxl.util.createVec3(s,s,s);
        //@TODO: TEST
        bb[0] *= s
    	bb[1] += s
    	bb[2] += s
    	bb[3] += s
    	bb[4] += s
    	bb[5] += s
    }
    else{
        this.scale = vxl.util.createVec3(s);
        
        //@TODO: TEST
        bb[0] *= this.scale[0];
    	bb[1] += this.scale[1];
    	bb[2] += this.scale[2];
    	
    	bb[3] += this.scale[0];
    	bb[4] += this.scale[1];
    	bb[5] += this.scale[2];
    }
    
    vxl.go.notifier.fire(vxl.events.ACTOR_BB_UPDATED, this);
};

/**
* Sets the actor color. This color can be different from the original model color
* @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
* @param {Number} g if r is a number, then this parameter corresponds to the green component
* @param {Number} b if r is a number, then this parameter corresponds to the blue component
*/
vxlActor.prototype.setColor = function (r,g,b){
	this.color = vxl.util.createVec3(r,g,b); 
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
 * @param {String} scope indicates if the change is made at the actor level or at the model level
 * valid values for scope are vxl.def.model and vxl.def.actor
 * @TODO: if the property is position or scale then call the respective methods from here
 */
vxlActor.prototype.setProperty = function(property, value, scope){
    
    if (property == 'position') {
    	this.setPosition(value);
    	return;
    }
    
    if (property == 'scale')    {
    	this.setScale(value);
    	return;
    }
    
    if (scope == vxl.def.actor || scope == undefined || scope == null){
		this[property] = value;
		vxl.go.console('Actor: The actor '+this.name+' has been updated. ['+property+' = '+value+']');
	}
	else if(scope == vxl.def.model){
		this.model[property] = value;
	}
	else{
		throw('vxlActor.setProperty. Scope:' + scope +' is not valid');
	}
	
};

/**
 * Enables or disables the calculation of the shading. Any shader should take into account this 
 * actor property to decide how to render it.
 * 
 * @param {Boolean} flag can be true or false
 */
vxlActor.prototype.setShading = function(flag){
    this.shading = flag;
}

/**
 * Returns an actor property if that property exists in the actor. Otherwise it will search 
 * in the model. This method is used by the renderer. There are some cases where actors have local changes
 * that are not reflected in the model. In these cases the renderer should pick the actor property
 * over the model property
 * @param{String} property the property name
 * @returns{Object} the property or undefined if the property is not found 
 */
vxlActor.prototype.getProperty = function(property){
	if (this.hasOwnProperty(property)) {
		return this[property];
	}
	else if (this.model.hasOwnProperty(property)){
		return this.model[property];
	}
	else {
		return undefined;
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
	
	vec3.set(this.scale,    duplicate.scale);
	vec3.set(this.position, duplicate.position);
	
	
	//Now to save us some memory, let's SHARE the WebGL buffers that the current actor has already allocated'
	//duplicate.renderers = this._renderers;
	//duplicate.buffers   = this._gl_buffers;

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
	if (this._renderers.indexOf(renderer)!=-1){ //if this renderer has been allocated then ignore
   		return;
   }
   
   var buffers = renderer._allocateActor(this);
   
   this._renderers.push(renderer);
   this._gl_buffers.push(buffers);

};

/**
* @private
* It gives the strategy the opportunity to deallocate memory for this actor.
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly. 
*/
vxlActor.prototype._deallocate = function(renderer){
  renderer._deallocateActor(this);
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
	renderer._renderActor(this);
};

