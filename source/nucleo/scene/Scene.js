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
*  Each view has a vxlScene object associated to it. The actors added to the scene are those that the renderer's view will render.
*  Actors can be added/removed from the scene at any time.
*  The scene also determines the lookup table that is used by the actors in it.
*  A scene can have one or more views associated to it.
* 
*  @class
*  @constructor
*  @author Diego Cantor
*/
function vxlScene()
{
	this.views  				= [];
	this._actors 				= [];
	this.toys					= new vxlSceneToys(this);
	this.loadingMode 			= vxl.def.model.loadingMode.LIVE;
	this.normalsFlipped 		= false;
	this.lutID 					= null;
	this.timerID				= null;
	this.dispatchRate 			= 500;
	this.scalarMIN 				= Number.MAX_VALUE;
	this.scalarMAX 				= Number.MIN_VALUE;
	this.bb 					= [0, 0, 0, 0, 0, 0];
	this.centre 				= [0, 0, 0];
	this.frameAnimation			= null;
	this.UID                    = vxl.util.generateUID();

	if (vxl.c.scene  == null) vxl.c.scene 	= this;

	vxl.go.scenes.push(this);
	
	var ntf = vxl.go.notifier;
    var e = vxl.events;
    ntf.publish([e.SCENE_NEW, e.SCENE_UPDATED], this);
    ntf.subscribe([e.MODELS_LOADED, e.DEFAULT_LUT_LOADED], this);
	ntf.fire(e.SCENE_NEW, this);
};

/**
 * Handles events sent by vxlNotifier
 * @param {String} event This event should be defined in vxl.events
 * @param {Object} the source that sent the event. Useful for callbacks
 */
vxlScene.prototype.handleEvent = function(event,src){
	
    if(event == vxl.events.MODELS_LOADED){
		this.updateScalarRange();
		if (this.lutID != null) {this.setLookupTable(this.lutID);}
	}
	else if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.lutID = 'default';
		this.setLookupTable(this.lutID);
	}

};


/**
 * Sets the loading mode for this scene 
 * @param mode one of the valid loading modes
 * @see {vxl.def.model.loadingMode} 
 */
vxlScene.prototype.setLoadingMode = function(mode){
	var m = vxl.def.model.loadingMode;
	
	if (mode == undefined || mode == null || 
		(mode != m.LIVE &&  mode != m.LATER && mode != m.DETACHED)){
		 	throw('the mode '+mode+ 'is not a valid loading mode');
	}
	this.loadingMode = mode;
};




/**
 * Calculates the global bounding box and the centre for the scene. 
 * @private
 */
vxlScene.prototype._updateBoundingBoxWith = function(actor){

    //actor.computeBoundingBox();
    
    var b = actor._bb;
    
    vxl.go.console('Scene: updating metrics with ('+ b[0]+','+b[1]+','+b[2]+') - ('+b[3]+','+b[4]+','+b[5]+')');
    if (this._actors.length == 1){
        //Quicky!  
        this.bb = this._actors[0]._bb.slice(0);
        this.toys.update();
        return;
    }
    
    
    var bb = this.bb;
    var cc = this.centre;
    
	bb[0] = Math.min(bb[0],b[0]);
	bb[1] = Math.min(bb[1],b[1]);
	bb[2] = Math.min(bb[2],b[2]);
	bb[3] = Math.max(bb[3],b[3]);
	bb[4] = Math.max(bb[4],b[4]);
	bb[5] = Math.max(bb[5],b[5]);

	cc[0] = (bb[3] + bb[0]) /2;
	cc[1] = (bb[4] + bb[1]) /2;
	cc[2] = (bb[5] + bb[2]) /2;
	
	cc[0] = Math.round(cc[0]*1000)/1000;
	cc[1] = Math.round(cc[1]*1000)/1000;
	cc[2] = Math.round(cc[2]*1000)/1000;
	
	this.toys.update();

};

/**
 * Calculates the global bounding box and the center of the scene.
 * Updates the Scene's axis and bounding box toys.
 */
vxlScene.prototype.computeBoundingBox = function() {
    
    if (this._actors.length >0){
	   this.bb = this._actors[0]._bb.slice(0);
	}
	else{
	    this.bb = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	}
	
	this.centre = [0.0, 0.0, 0.0];
	
	var LEN = this._actors.length;
	for(var i=0; i<LEN; i++){
		this._updateBoundingBoxWith(this._actors[i]);
	}
};

/**
 * This function creates AND ADD a new actor to this scene
 * @param {vxlModel} model the model from which a new actor will be created AND added to this scene
 * 
 * If you are looking to create but not adding an actor call new vxlActor(model) instead.
 * 
 * @returns actor the actor that was created and added to the scene, from the model passed as parameter
 */
vxlScene.prototype.createActor = function(model){
	var actor = new vxlActor(model);
	this.addActor(actor);
	return actor;
};

/**
 * Creates multiples actors at once
 * @param models a list of models to create actors from
 */
vxlScene.prototype.createActors = function(models){
	vxl.go.console('Scene: Creating all the actors now');
	for (var i = 0; i < models.length; i++){
		this.createActor(models[i]);
	}	
};
/**
 * Adds one actor.
 * The added actor becomes the current one (vxl.c.actor)
 * @param actor the actor to be added to the scene
 */
vxlScene.prototype.addActor = function(actor){
    
    actor.setScene(this);
    
    if (this.normalsFlipped){
        actor.flipNormals(true);
    }
    
    if (this.lutID != null){
        actor.setLookupTable(this.lutID, this.scalarMIN, this.scalarMAX);
    }
    
    this._actors.push(actor);
    this._updateBoundingBoxWith(actor); 
    
    vxl.go.console('Scene: Actor for model '+actor.model.name+' added');
    
    if (this._actors.length ==1){
    	vxl.c.actor = actor; //if we have only one
    }
    else{
    	vxl.c.actor = undefined; //if we have a bunch then we don't have a current one
    }
    
    vxl.go.notifier.fire(vxl.events.SCENE_UPDATED, this);
};

/**
 * Recreates the WebGL buffers when an actor has changed its geometry 
 * @param actor the actor to be updated
 */
vxlScene.prototype.updateActor = function(actor){
    if(!this.hasActor(actor)) return;
    
    actor.dirty = true;
    for(var i = 0; i < this.views.length; i +=1){
        this.views[i].renderer.reallocate();                
    }
    actor.dirty = false;
};

/**
 * Removes one actor
 * @param actor the actor to be removed from the scene
 */
vxlScene.prototype.removeActor = function(actor){
	var idx = this._actors.indexOf(actor);
	this._actors.splice(idx,1);
    this.computeBoundingBox();
};

/**
 * Verifies if the actor passed as a parameter belongs to this scene
 * @param {vxlActor, String} actor the actor object or the actor name to verify 
 */
vxlScene.prototype.hasActor = function(actor){
	if (actor instanceof vxlActor){
		return (this._actors.indexOf(actor)!=-1)
	}
	else if (typeof(actor)=='string'){
		var aux = this.getActorByName(actor);
		return (aux != undefined);
	}
	else return false;
};


/**
 * Sets a property for all the actors in the scene
 * @param {String} property the name of the actor property
 * @param {Object} value the value of the property
 */
vxlScene.prototype.setPropertyForAll = function (property, value){
    for(var i=0; i<this._actors.length; i++){
        this._actors[i].setProperty(property, value);
    }
};


/**
 *Sets a property for a list of actors.
 * @param {Array} list list of actors (String or vxlActor)
 * @param {String} property the name of the actor property
 * @param {Object} value the value of the property
 
 */
vxlScene.prototype.setPropertyFor = function (list, property, value){
    for(var i=0; i<list.length; i++){
        if (this.hasActor(list[i])){
            var actor = undefined;
            if (typeof(list[i])=='string'){
                actor = this.getActorByName(list[i]);
            }
            else if (list[i] instanceof vxlActor){
                list[i].setProperty(property, value);
            }
            else{
                throw 'vxlScene.setPropertyFor: ERROR, the list of actors is invalid';
            }
        }
    }
};
/**
 * Updates the Scene's scalarMAX and scalarMIN properties.
 */
vxlScene.prototype.updateScalarRange = function(){
	for(var i=0;i<this._actors.length;i++){
		var actor = this._actors[i];
		if (actor.model.scalars && actor.model.scalars.max() > this.scalarMAX) this.scalarMAX = actor.model.scalars.max();
		if (actor.model.scalars && actor.model.scalars.min() < this.scalarMIN) this.scalarMIN = actor.model.scalars.min();
	}
};

/**
 * Sets a new lookup table by passing the lookup table id
 * @param lutID the lookup table id
 */
vxlScene.prototype.setLookupTable = function(lutID){
	this.lutID = lutID;
	for(var i =0, N = this._actors.length; i<N; i+=1){
     	this._actors[i].setLookupTable(lutID,this.scalarMIN, this.scalarMAX);
	}
};

/*
 * Removes all the actors from the Scene and resets the actor list
 * It will also set vxl.c.actor to null
 */
vxlScene.prototype.reset = function(){
	for(var i=0; i<this._actors.length; i++){
		this._actors[i] = null;
	}
	this._actors = [];
	vxl.c.actor = null;
	this.computeBoundingBox();
};

/**
 * Retrieves an actor object by name
 * @param name the name of the actor to retrieve
 */
vxlScene.prototype.getActorByName = function(name){
    name = name.replace(/\.[^/.]+$/, "");
	var LEN = this._actors.length;
    for(var i=0; i<LEN; i+=1){
		if(this._actors[i].name == name){
			return this._actors[i];
		}
	}
	return undefined;
};


/**
 * Retrieves an actor object by Unique Identifier (UID)
 * @param UID the actor's UID
 */
vxlScene.prototype.getActorByUID = function(UID){
    var LEN = this._actors.length;
    for(var i=0; i<LEN; i+=1){
        if(this._actors[i].UID == UID){
            return this._actors[i];
        }
    }
    return undefined;
};


/**
 * <p>Returns a list of actors based on the condition passed as parameter.</p>
 * <p>The condition is a function with the following signature:</p>
 * <p><code> condition(vxlActor): returns boolean</code></p>
 * <p>If the condition evaluates true then that actor is included in the results</p>
 * 
 * @param {function} condition the condition to evaluate in the actor list it receives an actor as a parameter
 * @returns {Array} list of actors 
 */
vxlScene.prototype.getActorsThat = function(condition){
    var idx = [];
    for (var i=0; i<this._actors.length; i+=1){
        if (condition(this._actors[i])) {
            idx.push(i);
        }
    }
    var results = [];
    for (var j=0; j<idx.length;j+=1){
        results.push(this._actors[idx[j]]);
    }
    return results;
};

/**
 * Changes the opacity for one or all actors in the scene
 * @param o opacity value [0..1]
 * @param name the name of the actor whose opacity will be changed. 
 *             If this parameter is missing, the opacity of all actors will be changed.
 */
vxlScene.prototype.setOpacity = function(o,name){
	if (name == null){
		for(var i=0; i<this._actors.length; i++){
			this._actors[i].setOpacity(o);
		}
	}
	else{
		var actor = this.getActorByName(name);
		actor.setOpacity(o);
	}

};

/**
 * Flips the normals for all the actors in the scene. This will
 * have an immediate effect in the side of the object that it is being lit.
 */
vxlScene.prototype.flipNormals = function(){
	for(var i=0; i<this._actors.length; i++){
		this._actors[i].flipNormals();
	}
};


/**
 * Changes the visualization mode for all the objects in the scene
 * @param mode the visualization mode. It can be... TODO
 */
vxlScene.prototype.setVisualizationMode = function(mode){
	if (mode == null || mode == undefined) return;
	for(var i=0; i<this._actors.length; i++){
			this._actors[i].setVisualizationMode(mode);
	}
};


/**
 * Sets the animation for this scene
 * @param {vxlFrameAnimation} animation the animation to set on this scene
 * @see vxlFrameAnimation
 */
vxlScene.prototype.setAnimation = function(animation){
	if (animation instanceof vxlFrameAnimation){
		this.frameAnimation = animation;
		this.frameAnimation.scene = this;
		
		for (var i=0;i<this.views.length;i+=1){
			this.views[i].renderer.setMode(vxl.def.renderer.mode.ANIMFRAME);
		}
		
		vxl.go.console('Scene: animation added');
	}
};
/**
 * Removes the animation if there is one associated to this scene
 * @see vxlFrameAnimation
 * @TODO: Review what happens to the actors. Should we remove them too?
 */
vxlScene.prototype.clearAnimation = function(){
	if (this.frameAnimation) {
		this.frameAnimation.scene = null;
		this.frameAnimation = null;
	}
};

/**
 * Returns a list with the actor names
 * @returns {Array} a list with the actor names
 */
vxlScene.prototype.getActorNames = function(){
	var list = [];
	for(var a=0, actorCount = this._actors.length; a < actorCount; a+=1){
		list.push(this._actors[a].name);
	}
	return list;
};

/**
 * Return a list with the actors that are currently pickable 
 */
vxlScene.prototype.getPickableActors = function(){
    
    function condition(actor){
        return actor.isPickable();
    }
    
    return this.getActorsThat(condition);
};

/**
 * Given a cell uid the scene identifies the actor it belongs to. If an actor is not found
 * this method returns null 
 * @param {String} cellUID
 * @returns {vxlActor|null}
 * 
 */
vxlScene.prototype.getActorByCellUID = function(UID){
    var list = [];
    for(var a=0, actorCount = this._actors.length; a < actorCount; a+=1){
        var actor = this._actors[a];
        if (actor.mesh != undefined && actor.mesh.hasCell(UID)){
            return actor;
        }
    }
    return null;
};