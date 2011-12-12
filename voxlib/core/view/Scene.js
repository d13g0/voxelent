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
*  @class
*  @constructor
*  @author Diego Cantor
*/
function vxlScene(vw)
{
	this.view = vw;
	this.actors = [];
	this.loadingMode = vxl.def.loadingMode.LIVE;
	
	this.lutID = null;
	this.scalarmin = Number.MAX_VALUE;
	this.scalarmax = Number.MIN_VALUE;
	
	
	this.picking = false;
	this.normalsFlipped = false;
	
	vxl.go.notifier.addTarget("vxl.event.all_models_loaded",this);
	vxl.go.notifier.addTarget("vxl.event.default_lut_loaded",this);
	vxl.go.notifier.addSource('vxl.event.globals_updated', this);
}


vxlScene.prototype.handleEvent = function(event,src){
	if(event  == 'vxl.event.all_models_loaded'){
		this.updateScalarRange();
		if (this.lutID != null) this.setLookupTable(this.lutID);
	}
	
	if (event == 'vxl.event.default_lut_loaded'){
		this.lutID = 'default';
		this.setLookupTable(this.lutID);
	}
}




vxlScene.prototype.setLoadingMode = function(mode){
	if (mode == undefined || mode == null || 
		(mode != vxl.def.loadingMode.LIVE && 
		 mode != vxl.def.loadingMode.LATER &&
		 mode != vxl.def.loadingMode.DETACHED)){
		 	throw('the mode '+mode+ 'is not a valid loading mode');
		 }
	this.loadingMode = mode;
}



/**
 * Calculates the global bounding box for the scene. This will soon be deprecated/moved
 * as the calculation should happen per scene and this is a shared repository of assets.
 * @TODO: Move to the scene object
 *  
 */
vxlScene.prototype.updateGlobals = function(b){
        var bb = vxl.go.boundingBox;
        var cc = vxl.go.centre;
        
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
		
		vxl.go.notifier.fire('vxl.event.globals_updated');
}

/**
 * Calculates the global bounding box and the center of the scene
 */
vxlScene.prototype.computeGlobals = function() {
	vxl.go.boundingBox = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	vxl.go.centre = [0.0, 0.0, 0.0];
	for(var i=0; i<this.models.length; i++){
		this.updateGlobals(this.models[i].outline);
	}
}


vxlScene.prototype.createActor = function(model){
	
	var actor = new vxlActor(model);
	if (this.normalsFlipped){
		actor.flipNormals(true);
	}
	
	if (this.lutID != null){
		actor.setLookupTable(this.lutID, this.scalarmin, this.scalarmax);
	}
	this.actors.push(actor);
	message('Scene: Actor for model '+model.name+' created');
	return actor;
}

vxlScene.prototype.createActors = function(models){
	message('Scene: Creating all the actors now..');
	for (var i = 0; i < models.length; i++){
		this.createActor(models[i]);
	}	
}

vxlScene.prototype.updateScalarRange = function(){
	for(var i=0;i<this.actors.length;i++){
		var actor = this.actors[i];
		if (actor.model.scalars && actor.model.scalars.max() > this.scalarmax) this.scalarmax = actor.model.scalars.max();
		if (actor.model.scalars && actor.model.scalars.min() < this.scalarmin) this.scalarmin = actor.model.scalars.min();
	}
}


vxlScene.prototype.setLookupTable = function(lutID){
	this.lutID = lutID;
	for(var i =0; i<this.actors.length; i++){
		var actor = this.actors[i];
		actor.setLookupTable(lutID,this.scalarmin, this.scalarmax);
	}
}

vxlScene.prototype.allocate = function(renderer){
	for(var i=0; i<this.actors.length; i++){
		this.actors[i].allocate(renderer);
	}
}


vxlScene.prototype.reset = function(){
	for(var i=0; i<this.actors.length; i++){
		this.actors[i] = null;
	}
	this.actors = [];
	vxl.c.actor = null;
}

vxlScene.prototype.getActorByName = function(name){
	for(var i=0; i<this.actors.length; i++){
		if(this.actors[i].name == name){
			return this.actors[i];
		}
	}
	return null;
}


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

}

vxlScene.prototype.flipNormals = function(flag){
	this.normalsFlipped = flag;
	for(var i=0; i<this.actors.length; i++){
		this.actors[i].flipNormals(flag);
	}
};


vxlScene.prototype.setColor = function(c, name){
	if (name == null){
		message('actor manager: set color for all actors');
		for(var i=0; i<this.actors.length; i++){
			this.actors[i].setColor(c);
		}
	}
	else{
		message('actor manager: set color for active actor:'+name);
		var actor = this.getActorByName(name);
		actor.setColor(c);
	}
}

vxlScene.prototype.setVisualizationMode = function(mode){
	if (mode == null || mode == undefined) return;
	for(var i=0; i<this.actors.length; i++){
			this.actors[i].setVisualizationMode(mode);
	}
}

vxlScene.prototype.setPicking = function(b){
	this.picking = b;
}
