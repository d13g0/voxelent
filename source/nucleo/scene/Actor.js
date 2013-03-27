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
 * <pre class="prettyprint">
 * var actor = vxl.c.scene.getActorByName('example');
 * actor.setProperty('color',[1.0,0.0,0.0], vxl.def.model)
 * </pre>
 * 
 * <p>If the change should be local (for just that actor)  then you should write:</p>
 * 
 * <pre class="prettyprint">
 * var actor = vxl.c.scene.getActorByName('example');
 * actor.setProperty('color',[1.0,0.0,0.0], vxl.def.actor)
 * </pre>
 * 
 * <p> Or simply </p>
 *  
 * <pre class="prettyprint">
 * var actor = vxl.c.scene.getActorByName('example');
 * actor.setProperty('color',[1.0,0.0,0.0])
 * </pre>
 * @class Actors represent models (assets) in a Scene
 * @constructor
 */
function vxlActor(model){
  
  this._bb = [0, 0, 0, 0, 0, 0];
  this._position 	= vec3.create([0, 0, 0]);
  this._translation = vec3.create([0, 0, 0]);
  this._centre      = vec3.create([0, 0, 0]);
  this._scale 		= vec3.create([1, 1, 1]);
  this._rotation 	= vec3.create([0, 0, 0]);
  this._matrix      = mat4.identity();
  this._renderers   = [];
  this._gl_buffers  = [];
  this._picking     = vxl.def.actor.picking.DISABLED;
  this._pickingCallback = undefined;
  this._pickingColor    = undefined; //used when the picking is vxl.def.actor.picking.OBJECT
  this._trackingCameras = [];
  
  this.UID = vxl.util.generateUID();
  this.scene        = undefined;
  this.clones       = 0;
  
  this.mode         = vxl.def.actor.mode.SOLID;
  this.cull         = vxl.def.actor.cull.NONE;
  this.visible      = true;
 
  this.mesh         = undefined;
  
  this.material     = new vxlMaterial();
  this.renderable   = undefined;
  
  if (model){
  	this.model 	    = model;
  	this.name 	    = model.name;
  	this.mode       = model.mode;
  	this._bb        = model.bb.slice(0);
  	this._centre    = vec3.set(model.centre, vec3.create());
  	this.material.getFrom(model);
  	
  	if (model.type == vxl.def.model.type.BIG_DATA){
  	    this.renderable = new vxlRenderable(this);
  	}
  }
  else{
      this.model = new vxlModel();
  }
  
  var e = vxl.events;
  vxl.go.notifier.publish(
      [
        e.ACTOR_MOVED,
        e.ACTOR_SCALED,
        e.ACTOR_ROTATED,
        e.ACTOR_CHANGED_COLOR,
        e.ACTOR_CHANGED_SHADING,
      ], this);
};


/**
 *Sets the scene the actor belongs to. Used to notifiy the scene
 * about changes in actor properties 
 */
vxlActor.prototype.setScene = function(scene){
    this.scene = scene;
}


/**
 * Sets the position of this actor. 
 * 
 * 
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlActor.prototype.setPosition = function (x,y,z){
    var np = vxl.util.createVec3(x,y,z);
    vec3.subtract(np, this._position, this._translation);
    this._position = np;  
    
    var m = this._matrix;
    m[12] = this._position[0];
    m[13] = this._position[1];
    m[14] = this._position[2];
    m[15] = 1;
    this._computeBoundingBox();
    this._notifyTrackingCameras();
    vxl.go.notifier.fire(vxl.events.ACTOR_MOVED, this);
    
    return this;
};


/**
 * Translates the actor by a given vector 
 * 
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlActor.prototype.translate = function (x,y,z){
    this._translation = vxl.util.createVec3(x,y,z); 
    
    var m = this._matrix;
    mat4.translate(m,this._translation);
    this._position = vec3.createFrom(m[12], m[13], m[14]);
    this._computeBoundingBox();
    this._notifyTrackingCameras();
    vxl.go.notifier.fire(vxl.events.ACTOR_MOVED, this);
    
    return this;
};


/**
 * Rotates the actor on the X axis 
 * 
 * @param {Number} angle the angle
 */ 
vxlActor.prototype.rotateX = function (angle){
    var m = this._matrix;
    var a = vxl.util.deg2rad(vxl.util.getAngle(angle));
    mat4.rotateX(m,a);
    this._computeBoundingBox();
    vxl.go.notifier.fire(vxl.events.ACTOR_ROTATED, this);
    
    return this;
};

/**
 * Rotates the actor on the Y axis 
 * 
 * @param {Number} angle the angle
 */
vxlActor.prototype.rotateY = function (angle){
    var m = this._matrix;
    var a = vxl.util.deg2rad(vxl.util.getAngle(angle));
    mat4.rotateY(m,a);
    this._computeBoundingBox();
    vxl.go.notifier.fire(vxl.events.ACTOR_ROTATED, this);
    
    return this;
};


/**
 * Rotates the actor on the Z axis 
 * 
 * @param {Number} angle the angle
 */
vxlActor.prototype.rotateZ = function (angle){
    var m = this._matrix;
    var a = vxl.util.deg2rad(vxl.util.getAngle(angle));
    mat4.rotateZ(m,a);
    this._computeBoundingBox();
    vxl.go.notifier.fire(vxl.events.ACTOR_ROTATED, this);
    
    return this;
};

/**
 * Scales this actor. 
 * @param {Number, Array, vec3} s the scaling factor. The scaling factor is applied in all axes.
 *
 */
vxlActor.prototype.setScale = function(s,a,b){
    if (s == 0 && a == undefined && b==undefined) return;
    
    
    if (typeof(s)=="number" && a == undefined && b == undefined){
        this._scale = vxl.util.createVec3(s,s,s);
    }
    else{
        this._scale = vxl.util.createVec3(s,a,b);
    }
    
    var m = this._matrix;
    mat4.scale(m,this._scale);
    this._computeBoundingBox();
    vxl.go.notifier.fire(vxl.events.ACTOR_SCALED, this);
    
    return this;
};

/**
 * Adds a tracking camera
 * 
 * @param{vxlCamera} camera the tracking camera
 */
vxlActor.prototype.addTrackingCamera = function(camera){
    if (camera instanceof vxlCamera && camera.type !=vxl.def.camera.type.TRACKING){
        throw "vxlActor._addTrackingCamera ERROR: the selected camera is not set to tracking"
    }
    else if (camera instanceof vxlCamera){
        this._trackingCameras.push(camera);
    }
    else{
        throw "vxlActor._addTrackingCamera ERROR: the object passed as a parameter is not a vxlCamera"
    }
};

/**
 * Removes a tracking camera
 * @param{vxlCamera} camera the tracknig camera
 */
vxlActor.prototype.removeTrackingCamera = function(camera){
    var idx = this._trackingCameras.indexOf(camera);
    this._trackingCameras.splice(idx,1);
};

/**
 * Notifies all the tracking cameras of the actor translation 
 * @param {Object} camera
 */
vxlActor.prototype._notifyTrackingCameras = function(){
    for (var i=0, N = this._trackingCameras.length; i<N;i+=1){
        this._trackingCameras[i].updateWithActor(this);
    }
};

/**
 * Computes the current bounding box for this actor.
 * This method is called on demand by the scene or any other object. 
 * The bounding box is NOT automatically recalculated when 
 * moving or scaling an actor for performance reasons.
 *  
 */
vxlActor.prototype._computeBoundingBox = function(){

    var vs  = this.model.vertices;
    var vsT = [];
    var T = this._matrix;
    
    for(var i=0;i<vs.length;i=i+3){
        var x = vxl.util.createVec3(vs[i],vs[i+1],vs[i+2]);
        mat4.multiplyVec3(T, x);
        vsT.push(x[0], x[1], x[2]);    
    }
    
    var bbA = [vsT[0],vsT[1],vsT[2],vsT[0],vsT[1],vsT[2]];
    
    for(var i=0;i<vsT.length;i=i+3){
        bbA[0] = Math.min(bbA[0],vsT[i]);
        bbA[1] = Math.min(bbA[1],vsT[i+1]);
        bbA[2] = Math.min(bbA[2],vsT[i+2]);
        bbA[3] = Math.max(bbA[3],vsT[i]);
        bbA[4] = Math.max(bbA[4],vsT[i+1]);
        bbA[5] = Math.max(bbA[5],vsT[i+2]);
    }
    
     
    this._bb = bbA;
};

/**
 * Returns an array with the bounding box vertices. Good for rendering the transformed
 * bounding box (after geometric transformations) 
 * @returns {Array} a 8-element array with the vertices that constitute the actor bounding box
 */
vxlActor.prototype.getBoundingBoxVertices = function(){
    var b = this._bb; 
    return [
        b[0], b[1], b[2],
        b[0], b[4], b[2],
        b[3], b[4], b[2],
        b[3], b[1], b[2],
        b[0], b[1], b[5],
        b[0], b[4], b[5],
        b[3], b[4], b[5],
        b[3], b[1], b[5] 
        ];
};


/**
 * Returns the bounding box for this actor. The actor's bounding box observes any geometric
 * transformation suffered by the actor. Therefore it is ideal to do collision detection.
 * 
 * The format of the returned bounding box is [x-min, y-min, z-min, x-ax, y-max, z-max]
 * @returns {Array} the current bounding box.
 */
vxlActor.prototype.getBoundingBox = function(){
    return this._bb.slice[0];
}


/**
 * Returns the height for the current actor. 
 * @returns {Number} the current height
 */
vxlActor.prototype.getHeight = function(){
   var bb = this._bb
   return bb[4]-bb[1]
};


/**
* Sets the actor color. This color can be different from the original model color
* @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
* @param {Number} g if r is a number, then this parameter corresponds to the green component
* @param {Number} b if r is a number, then this parameter corresponds to the blue component
*/
vxlActor.prototype.setColor = function (r,g,b){
	this.material.diffuse = vxl.util.createVec3(r,g,b);
	if (this.mesh){
	    this.mesh.setColor(this.material.diffuse);
	} 
	vxl.go.notifier.fire(vxl.events.ACTOR_CHANGED_COLOR, this);
	
	return this;
};



/**
 * Sets the opacity of this actor. 
 * @param {Number} o a float value between 0 and 1. 
 */
vxlActor.prototype.setOpacity = function(o){
	if (o>=0 && o<=1){
		this.material.opacity = o;
	} 
	else throw 'The opacity value is not valid';
	
	return this;
};


/**
 * Sets the shininess of this actor 
 * @param {Number} s a value for the shininess 
 */
vxlActor.prototype.setShininess = function(s){
    this.material.shininess = s;
    
    return this;
};

/**
 * Associates a new texture with this actor
 * @param {String} uri the location of the texture to load 
 */
vxlActor.prototype.setTexture = function(uri){
    this.material.texture = new vxlTexture(uri);  
    this.dirty = true; //reallocation required
    return this;  
}

/**
 * If the property exists, then it updates it
 * @param {String} property name of the property 
 * @param {Object} value  value to be set
 * @param {String} scope indicates if the change is made at the actor level or at the model level
 * valid values for scope are vxl.def.model and vxl.def.actor
 * @TODO: if the property is position or scale then call the respective methods from here
 */
vxlActor.prototype.setProperty = function(property, value, scope){
    
    
    if (scope == vxl.def.actor || scope == undefined || scope == null){

        switch (property){
            case 'position': this.setPosition(value);  break;
            case 'scale':    this.setScale(value);     break;
            case 'color':    this.setColor(value);     break;
            case 'shading':  this.setShading(value);   break;
            case 'texture':  this.setTexture(value);   break;
            case 'opacity':  this.setOpacity(value);   break;
            case 'shininess':this.setShininess(value); break;
            default: this[property] = value; break;
        }
  
		vxl.go.console('Actor: The actor '+this.name+' has been updated. ['+property+' = '+value+']');
	}
	else if(scope == vxl.def.model){
		this.model[property] = value;
		vxl.go.console('vxlActor: The model '+this.model.namname+' has been updated. ['+property+' = '+value+']');
	}
	else{
		throw('vxlActor.setProperty. Scope:' + scope +' is not valid');
	}
	
	return this;
	
};

/**
 * Enables or disables the calculation of the shading. Any shader should take into account this 
 * actor property to decide how to render it.
 * 
 * @param {Boolean} flag can be true or false
 */
vxlActor.prototype.setShading = function(flag){
    this.material.shading = flag;
    vxl.go.notifier.fire(vxl.events.ACTOR_CHANGED_SHADING, this);
    return this;
};

/**
 * Returns an actor property if that property exists in the actor. Otherwise it will search 
 * in the model. This method is used by the renderer. There are some cases where actors have local changes
 * that are not reflected in the model. In these cases the renderer should pick the actor property
 * over the model property
 * @param {String} property the property name
 * @returns {Object} the property or undefined if the property is not found 
 */
vxlActor.prototype.getProperty = function(property){
    
    if (property == 'color'){
        return this.materia.diffuse; //there's no real 'color' property.
    }
	else if (this.hasOwnProperty(property)) {
		return this[property];
	}
	else if (this.material.hasOwnProperty(property)){
	   return this.material[property];   
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
	bb = this._bb;
	var cc = this._position;
	
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
	
	return this;
};

/**
 *Sets the culling mode for this actor.
 * @param {vxl.def.actor.cull} face face needs to be one of the elements defined in vxl.def.actor.cull
 *  @TODO: VALIDATE
 */
vxlActor.prototype.cullFace = function(face){
    this.cull = face;
    
    return this;
};


/**
* Sets the lookup table for this actor.
* This method will only succeed if the model that this actor represents has scalars 
* @param {String} lutID the lookup table id. See {@link vxl.def.lut} for currently supported ids.
* @param {Number} min lowest value for interpolation
* @param {Number} max highest value for interpolation
*/
vxlActor.prototype.setLookupTable = function(lutID,min,max){
	
	if (this.model.scalars == undefined) return;
	
	var self = this;
	
	function scheduledSetLookupTable(scalars){
        var lut = vxl.go.lookupTableManager.get(lutID);
        self.material.colors  = lut.getColors(self.model.scalars,min,max);
        
        //if(this.mesh){
        //    this.mesh. //update mesh with vertex colors it may require access to the original index array
       // }
       
       if (self.model.type == vxl.def.model.type.BIG_DATA){
           self.renderable.update();
       }
	}
	
	//Given that obtaining the colors can be a time consume op, it is deferred here.
	setTimeout(function(){scheduledSetLookupTable()},0);
	
	return this; 
};

/**
* Flips the normal for this actor. It delegates the task to the model
* @TODO: Review. we could want the actor to have flipped normals but not to impose this on the model. 
*/
vxlActor.prototype.flipNormals = function(){
	this.model.flipNormals();
	
	return this;
};

/**
* Sets the visibility of the actor
* @param {boolean} flag true or false
*/
vxlActor.prototype.setVisible = function(flag){
    this.visible = flag;
    
    return this;
};

/**
* Is visible?
* @returns {boolean} true if the object is visible
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
	duplicate.setScene(this.scene);
	
	//TODO: duplicate.setMatrix(this._matrix); this method should update all the other variables (position, scale, rot, etc).
     	
	//Now to save us some memory, let's SHARE the WebGL buffers that the current actor has already allocated'
	//duplicate.renderers = this._renderers;
	//duplicate.buffers   = this._gl_buffers;

	duplicate.name     += '-'+this.clones; 
	return duplicate;
};

/**
 * 
 * @param {String} type one of the possible values for vxl.def.actor.picking
 * @param {Object} callback a function that is invoked when a picking event occurs. This parameter is 
 * required if the type (first argument) is different from vxl.def.actor.picking.DISABLED 
 * the callback receives an actor object to operate over it.
 */
vxlActor.prototype.setPicker = function(type, callback){
    this._picking = type;
    
    switch(type){
        case vxl.def.actor.picking.DISABLED: 
            this._pickingCallback = undefined;
            this.mesh = undefined;
            this.renderable = undefined;
            this.setVisualizationMode(vxl.def.actor.mode.SOLID); 
            break;
        
        case vxl.def.actor.picking.CELL: 
            
            if (this.mesh == undefined){
                this.mesh = new vxlMesh(this); 
                this.mesh.setColor(this.material.diffuse);
                this.renderable = new vxlRenderable(this);
                this.setVisualizationMode(vxl.def.actor.mode.FLAT);           
            };
            
            this._pickingCallback = callback;
             
            break;
        case vxl.def.actor.picking.OBJECT:
            this._pickingColor = vxl.go.picker.getColorFor(this);
            this._pickingCallback = callback;
            break;
    }
    
    if (this.isPickable()){
        for(var i=0, N = this.scene.views.length; i<N; i+=1){
            var r = this.scene.views[i].renderer;
            if(!r.isOffscreenEnabled()){
                r.enableOffscreen();
            }
        }
    }
    //@TODO: Disable when there are no pickable actors in the scene.
    
    return this;
};

/**
 * Reports if the current actor is pickable or not
 *   
 */
vxlActor.prototype.isPickable = function(){
    return (this._picking  != vxl.def.actor.picking.DISABLED);  
};

/**
 * Returns the picking type 
 */
vxlActor.prototype.getPickingType = function(){
    return this._picking;  
};

/**
 * 
 */
vxlActor.prototype.getRenderableModel = function(){
    if (this.mesh && this.mesh.model){
        return this.mesh.model;
    }
    else if (this.model.type == vxl.def.model.type.BIG_DATA){
        return this.model;
    }
    else return undefined;
    
};

/**
 * @param {String} task type of update
 */
vxlActor.prototype.updateRenderable = function(task){
    this.renderable.update(task);
}
