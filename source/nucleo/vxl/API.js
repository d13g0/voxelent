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
 * @namespace Application Programing Interface namespace.
 *  
 * Using vxl.api in your programs you will be able to access many of the features offered by 
 * Voxelent's Nucleo library.
 * 
 * By design, type checking is enforced throughout the functions provided by the public API. 
 * The goal is to help novice programmers that will use the API more often than advanced programmers.
  */
vxl.api = {
 
 /**
  * Creates and returns a vxlView object
  * @param {String} canvas_id The canvas' Document Object Model (DOM) id.
  * @param {vxlScene} scene optional, the scene associated to this view
  * @returns {vxlView} a new vxlView object
  */
 setup : function(canvas_id, scene){
 	if (scene != null && !(scene instanceof vxlScene)) throw ('api.setup: scene parameter is invalid');
 	return new vxlView(canvas_id,scene);
 },
  
  /**
   * Sets the rendering rate of the current view
   * @param {Number} r the new rendering rate given as a number in milliseconds
   * @see api#setCurrentView
   */
 setRenderRate : function(r){
	vxl.c.view.renderer.setRenderRate(r);
  },
  
  /**
   * @TODO: is this deprecated?
   */
 setCameraDistance :  function(op){
	 g_fovy = op;
	 vxl.go.console('fovY = ' + op);
 },
 
 /**
  * If the object passed as a parameter is a vxlView then it sets it up as the current view.
  * All subsequent calls to API functions that reference the current view will be redirected
  * to affect the newly set object.
  * @param {a} the vxlView object that we want to make the current one
  */
 setCurrentView :  function(a){
	if (a instanceof vxlView){
		vxl.c.view = a;
	}
 },

 /**
  * Returns the current view. This is the view that is receiving all the API calls
  * @returns {vxlView} the current view
  */
 getCurrentView :  function(){
	return vxl.c.view;
 },
 
 
 /**
  * Sets the current actor
  * @param {vxlActor, String} actor This could be an actor object or an actor name
  * 
  * If the actor name is passed to this method, there must be a current scene. 
  * Otherwise an exception will raise.
  */
 setCurrentActor :  function(actor){
	if (actor instanceof vxlActor){
		vxl.c.actor = actor;
	}
	else if (typeof actor == 'string'){
		if (vxl.c.scene == undefined) throw ('vxl.api.setCurrentActor: there is no Current scene. Please call vxl.api.setCurrentScene');
		var theActor = vxl.c.scene.getActorByName(actor);
		if (theActor != undefined){
			vxl.c.actor = theActor;
		}
		else {
			throw ('vxl.api.setCurrentActor: the actor '+actor+' does not exist in the current scene');
		}
	}
 },
 
 getCurrentActor :  function(){
	return vxl.c.actor;
 },

 setCurrentCamera :  function(a){
	if (a instanceof vxlCamera){
		vxl.c.camera = a;
	}
 },
 
 getCurrentCamera :  function(){
	return vxl.c.camera;
 },

 setLookupTable :  function(name){
 	if (!vxl.go.lookupTableManager.isLoaded(name)){
		vxl.go.console('Lookup Table '+name+' has not been loaded');
		return;
	}
	
	vxl.c.view.scene.setLookupTable(name);
 },
 
 loadLUTS :  function(){
	vxl.go.lookupTableManager.loadAll();
 },

 /**
  * Go back to square one. A clean scene with no actors
  * @TODO: Provide the option to keep the models in the cache (vxlModelManager)
  */
 resetScene :  function(){
    if (vxl.c.animation) vxl.c.animation.stop();
	vxl.c.view.reset();
	vxl.go.modelManager.reset();
 },
 
 /**
  * Loads 3D models, textures and other models to a Voxelent's scene.
  * 
  * This method is very flexible. It can load one or multiple models depending on the type of the 
  * first parameter. If it is a String, it will try to find the file with that name in Voxelent's data folder
  * (voxdata by default). Otherwise, if  the parameter 'arguments' is an Array, load will iterate
  * through it and will try to load every element of this list. Every element being the file name.
  * 
  * Nucleo supports three different loading modes which are defined in 
  * vxl.def.model.loadingMode:
  * 
  * LIVE: As each asset is loaded it is added immediately into the scene by creating the corresponding actor
  * 
  * LATER: All the models are loaded first THEN the actors are created. 
  * This is useful when you want to display a full scene instead of showing incremental updates.
  * 
  * DETACHED: The models are loaded into the vxlModelManager object but actors are never created.
  * This allows background loading.
  * 
  * @param {String|Array} arguments the name of the asset or the list of models (each element being the file name).
  * @param {vxl.def.model.loadingMode} mode the loading mode
  * @param {vxlScene} scene the scene in case we do not want to load these models in the current one
  * 
  * @see {vxl#def#asset#loadingMode}
  * @see {vxlAssetManager}
  * @see {vxlScene#setLoadingMode}
  */
 load :  function(arguments,mode,scene){
 	
 	var scene = scene==null?vxl.c.scene:scene;
 	var models = [];
 	if (typeof(arguments) == 'string' || arguments instanceof String){
 		models.push(arguments);
 	}
 	else if (arguments instanceof Array){
 		for(var i=0; i<arguments.length;i++){
			models.push(arguments[i]);
		}
 	}
 	if (mode != undefined && mode != null){
		scene.setLoadingMode(mode);
	}
	
	vxl.go.modelManager.loadList(models, scene);
 },
 
 
 /**
  * Activates the axis in the current view
  * The axis is always centered in the focal point of the camera
  */
 axisON :  function(){
	vxl.c.view.scene.toys.axis.setVisible(true);
	vxl.c.camera.refresh();
 },
 
 /**
  * Hides the axis in the current view
  */
 axisOFF :  function(){
	vxl.c.view.scene.toys.axis.setVisible(false);
	vxl.c.camera.refresh();
 },
 
 /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 boundingBoxON :  function(){
	vxl.c.view.scene.toys.boundingbox.setVisible(true);
	vxl.c.camera.refresh();
 },
 
  /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 boundingBoxOFF:  function(){
	vxl.c.view.scene.toys.boundingbox.setVisible(false);
	vxl.c.camera.refresh();
 },
 
 /**
  * @TODO: Reimplement behaviour in the camera
  */
 toggleSpin :  function(){
	//TODO: RECODE IT.
	alert('not implemented');
 },
 

/**
 * Sets the background colour of this view.
 * @param color a 4-valued array containing the [r,g,b,a] values to use.
 */ 
 setBackgroundColor :  function(color){
	vxl.c.view.setBackgroundColor(color);
 },



/**
 * If an actor has been selected (If there is an current actor in vxl.c.actor), changes its visualization mode to WIREFRAME. Otherwise,
 * shows all the scene in WIREFRAME mode.
 * 
 */ 
wireframeON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	vxl.go.console('API:Wireframe is shown.');
 },
 
 /**
  * If there is an act
  */
 surfaceON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	vxl.go.console('API:Wireframe is hidden.');
 },
 
 pointsON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
 },
 
 
 getActorByName :  function(actorName,scene){
 	var _scene = scene;
 	if (_scene == undefined){ //look in the current scene
 		if (vxl.c.scene == undefined){
 			throw ('vxl.api.getActorByName: There is no current scene. Please the scene you want to look the actor '+actorName+' into');
 		}
 		else{
 			_scene = vxl.c.scene;
 		}
 	}
 	
 	return _scene.getActorByName(actorName);
 },
 
 /**
  * @param {Number} op  opacity value between 0 and 1 (float)
  * @TODO: Reevaluate this method. Opacity is shader dependent
  */
 setActorOpacity :  function(op){
    var opacity = Math.min(Math.max(0,Math.abs(op)),1);
	if (vxl.c.actor){
		vxl.c.actor.setOpacity(op);
	}
	else{
		vxl.c.view.scene.setOpacity(opacity);
	}
	vxl.c.view.refresh();
	vxl.go.console('API:Opacity changed to '+(op*100)+'%');
  },
  
 
 /**
  * @param actor it can be a vxlActor or a String with the actor name
  * @param {String} the property to change 
  * @param {Object} the new value
  */
 setActorProperty :  function (actor, property, value){
	
	if (vxl.c.scene == undefined) throw ('vxl.api.setActorProperty: there is no current scene. Please call vxl.api.setCurrentScene');
	
	var scene = vxl.c.scene;
	var _actor = actor;
	if (_actor instanceof vxlActor){
		_actor.setProperty(property,value);
	}
	else{ //TODO: assuming string.VALIDATE!
		_actor = scene.getActorByName(_actor);
		_actor.setPropert(property,value);
	}
 },
 
 /**
  * @param {bool} flag if true this method will flip the normals. If false normals will be
  * calculated the 'normal' way.
  */
 flipActorNormals :  function (flag){
	if (vxl.c.actor){
		vxl.c.actor.flipNormals(flag);
	}
	else{
		vxl.c.view.scene.flipNormals(flag);
	}
	vxl.c.view.refresh();
 },
 
 
 stopAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.stop();
 },
 
 startAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.start();
 },
 
 setFrame :  function(f){
	if (vxl.c.animation == null) return;
	var a = vxl.c.animation;
	a.stop();
	if (f>=1){
		a.setFrame(f);
	}
	else{
		vxl.go.console('API:frame ' + f +' does not exist. Animation goes back to the beginning');
		a.setFrame(1);
	}
 },

 clearAnimation :  function(){
	if(vxl.c.animation){
		vxl.c.animation.stop();
		vxl.c.animation = null;
	}
 },
 
 resetCamera :  function(){
	vxl.c.camera.reset();
 },
 
 saveCamera :  function(){
	vxl.c.camera.save();
 },
 
 retrieveCamera :  function(){
	vxl.c.camera.retrieve();
 },
 
 setAzimuth :  function(a){
	vxl.c.camera.changeAzimuth(a);
 },
 
 setElevation :  function(e){
	vxl.c.camera.changeElevation(e);
 },
 
 go_above :  function(){
	vxl.c.camera.above();
 },
 
 go_below :  function(){
	vxl.c.camera.below();
 },
 
 go_left :  function(){
	vxl.c.camera.left();
 },
 
 go_right :  function(){
	vxl.c.camera.right();
 },
 
 getLookupTables :  function(){
    return vxl.go.lookupTableManager.getAllLoaded();
 },
 
 //runScript :  function(file){
 //use JQuery here.
 //}
 
 /**
  * Loads a program
  * @param definition one of voxelent's programs
  */
 setProgram :  function(definition){
    vxl.c.view.renderer.setProgram(definition);
 }

 }; 
 