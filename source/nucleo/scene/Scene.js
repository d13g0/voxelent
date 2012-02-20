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
	this.actors 				= [];
	this.toys					= new vxlSceneToys(this);
	this.loadingMode 			= vxl.def.model.loadingMode.LIVE;
	this.normalsFlipped 		= false;
	this.lutID 					= null;
	this.timerID				= null;
	this.dispatchRate 			= 500;
	this.scalarMIN 				= Number.MAX_VALUE;
	this.scalarMAX 				= Number.MIN_VALUE;
	this.bb 					= [];
	this.centre 				= [];
	this.frameAnimation			= null;
	if (vxl.c.scene  == null) vxl.c.scene 	= this;
	vxl.go.notifier.addTarget(vxl.events.MODELS_LOADED,this);
	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);
	vxl.go.notifier.addSource(vxl.events.SCENE_UPDATED, this);
};

/**
 * Handles events sent by vxlNotifier
 * @param {String} event This event should be defined in vxl.events
 * @param {Object} the source that sent the event. Useful for callbacks
 */
vxlScene.prototype.handleEvent = function(event,src){
	if(event  == vxl.events.MODELS_LOADED){
		this.updateScalarRange();
		if (this.lutID != null) this.setLookupTable(this.lutID);
	}
	
	if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.lutID = 'default';
		this.setLookupTable(this.lutID);
	}
};



vxlScene.prototype.setLoadingMode = function(mode){
	if (mode == undefined || mode == null || 
		(mode != vxl.def.model.loadingMode.LIVE && 
		 mode != vxl.def.model.loadingMode.LATER &&
		 mode != vxl.def.model.loadingMode.DETACHED)){
		 	throw('the mode '+mode+ 'is not a valid loading mode');
		 }
	this.loadingMode = mode;
};




/**
 * Calculates the global bounding box and the centre for the scene. 
 */
vxlScene.prototype.updateMetrics = function(b){
        vxl.go.console('Scene: updating metrics with ('+ b[0]+','+b[1]+','+b[2]+') - ('+b[3]+','+b[4]+','+b[5]+')');
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
 * Updates the Scene's axis and bounding box actors.
 */
vxlScene.prototype.computeMetrics = function() {
	this.bb = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	this.centre = [0.0, 0.0, 0.0];
	for(var i=0; i<this.actors.length; i++){
		this.updateMetrics(this.actors[i].model.outline);
	}
};


vxlScene.prototype.createActor = function(model){
	
	var actor = new vxlActor(model);
	if (this.normalsFlipped){
		actor.flipNormals(true);
	}
	
	if (this.lutID != null){
		actor.setLookupTable(this.lutID, this.scalarMIN, this.scalarMAX);
	}
    
	this.actors.push(actor);
    this.updateMetrics(actor.model.outline); //TODO: What if the actor moves? use actor bounding box instead
    
	vxl.go.console('Scene: Actor for model '+model.name+' created');
	vxl.c.actor = actor;
    vxl.go.notifier.fire(vxl.events.SCENE_UPDATED);
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
 * Adds one actor
 * @param actor the actor to be added to the scene
 */
vxlScene.prototype.addActor = function(actor){
	this.actors.push(actor);
    this.updateMetrics(actor.model.outline);
    vxl.go.notifier.fire(vxl.events.SCENE_UPDATED);
};

/**
 * Removes one actor
 * @param actor the actor to be removed from the scene
 */
vxlScene.prototype.removeActor = function(actor){
	var idx = this.actors.indexOf(actor);
	this.actors.splice(idx,1);
    this.computeMetrics();
};

/**
 * Updates the Scene's scalarMAX and scalarMIN properties.
 */
vxlScene.prototype.updateScalarRange = function(){
	for(var i=0;i<this.actors.length;i++){
		var actor = this.actors[i];
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
	for(var i =0; i<this.actors.length; i++){
		var actor = this.actors[i];
		if (actor.setLookupTable){
			actor.setLookupTable(lutID,this.scalarMIN, this.scalarMAX);
		}
	}
};
/**
 * Allocates WebGL memory for the actors in this scene
 * @param renderer the renderer that will render the scene
 */
//vxlScene.prototype.allocate = function(renderer){
	//for(var i=0; i<this.actors.length; i++){
		//this.actors[i].allocate(renderer);
	//}
//}

/*
 * Removes all the actors from the Scene and resets the actor list
 * It will also set vxl.c.actor to null
 */
vxlScene.prototype.reset = function(){
	for(var i=0; i<this.actors.length; i++){
		this.actors[i] = null;
	}
	this.actors = [];
	vxl.c.actor = null;
	this.computeMetrics();
};

/**
 * Retrieves an actor object by name
 * @param name the name of the actor to retrieve
 */
vxlScene.prototype.getActorByName = function(name){
	for(var i=0; i<this.actors.length; i++){
		if(this.actors[i].name == name){
			return this.actors[i];
		}
	}
	return undefined;
};

/**
 * Changes the opacity for one or all actors in the scene
 * @param o opacity value [0..1]
 * @param name the name of the actor whose opacity will be changed. 
 *             If this parameter is missing, the opacity of all actors will be changed.
 */
vxlScene.prototype.setOpacity = function(o,name){
	if (name == null){
		for(var i=0; i<this.actors.length; i++){
			this.actors[i].setOpacity(o);
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
vxlScene.prototype.flipNormals = function(flag){
	this.normalsFlipped = flag;
	for(var i=0; i<this.actors.length; i++){
		this.actors[i].flipNormals(flag);
	}
};


/**
 * Changes the visualization mode for all the objects in the scene
 * @param mode the visualization mode. It can be... TODO
 */
vxlScene.prototype.setVisualizationMode = function(mode){
	if (mode == null || mode == undefined) return;
	for(var i=0; i<this.actors.length; i++){
			this.actors[i].setVisualizationMode(mode);
	}
};

/**
 * Calls the renderer process for all the views this scene is associated with
 */
vxlScene.prototype.render = function(){

	for (var i = 0, viewCount = this.views.length; i < viewCount; i+=1){
		var r = this.views[i].renderer;
		
		r.clear();
		
		this.toys.render(r);
		
		if (this.frameAnimation != undefined){
			this.frameAnimation.render(r);
		}
		else{
			for(var a=0, actorCount = this.actors.length; a < actorCount; a+=1){
				   this.actors[a].allocate(r);
			       this.actors[a].render(r);
			}
	    }
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
		vxl.go.console('Scene: animation added');
	}
};
/**
 * Removes the animation if there is one associated to this scene
 * @see vxlFrameAnimation
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
	for(var a=0, actorCount = this.actors.length; a < actorCount; a+=1){
		list.push(this.actors[a].name);
	}
	return list;
};
