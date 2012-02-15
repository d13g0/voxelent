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
 /*
  * @namespace Application Programing Interface namespace
  */
 vxl.api = new api();

/**
 * Nucleo Application Programming Interface (NAPI)
 * 
 * Using vxl.api in your programs you will be able to access many of the features offered by 
 * Voxelent's Nucleo library.
 * 
 * By design, type checking is enforced throughout the functions provided by the public API. 
 * The goal is to help novice programmers that will use the API more often than advanced programmers.
 * 
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 *  
 */ 
 function api(){}
 
 /**
  * Creates and returns a vxlView object
  * @param {String} canvas_id The canvas' Document Object Model (DOM) id.
  * @param {vxlScene} scene optional, the scene associated to this view
  * @returns {vxlView} a new vxlView object
  */
 api.prototype.setup = function(canvas_id, scene){
 	if (scene != null && !(scene instanceof vxlScene)) throw ('api.setup: scene parameter is invalid');
 	return new vxlView(canvas_id,scene);
 }
  
  /**
   * Sets the rendering rate of the current view
   * @param {Number} r the new rendering rate given as a number in milliseconds
   * @see api#setActiveView
   */
  api.prototype.setRenderRate = function(r){
	vxl.c.view.renderer.setRenderRate(r);
  }
  
  /**
   * @TODO: is this deprecated?
   */
 api.prototype.setCameraDistance = function(op){
	 g_fovy = op;
	 vxl.go.console('fovY = ' + op);
 }
 
 /**
  * If the object passed as a parameter is a vxlView then it sets it up as the current view.
  * All subsequent calls to API functions that reference the current view will be redirected
  * to affect the newly set object.
  * @param {a} the vxlView object that we want to make the current one
  */
 api.prototype.setActiveView = function(a){
	if (a instanceof vxlView){
		vxl.c.view = a
	}
 } 

 /**
  * Returns the current view. This is the view that is receiving all the API calls
  * @returns {vxlView} the current view
  */
 api.prototype.getActiveView = function(){
	return vxl.c.view;
 }
 
 
 api.prototype.setActiveActor = function(a){
	if (a instanceof vxlActor){
		vxl.c.actor = a;
	}
 }
 
 api.prototype.getActiveActor = function(){
	return vxl.c.actor;
 }

 api.prototype.setActiveCamera = function(a){
	if (a instanceof vxlCamera){
		vxl.c.camera = a;
	}
 }
 
 api.prototype.getActiveCamera = function(){
	return vxl.c.camera;
 }

 api.prototype.setLookupTable = function(name){
 	if (!vxl.go.lookupTableManager.isLoaded(name)){
		vxl.go.console('Lookup Table '+name+' has not been loaded');
		return;
	}
	
	vxl.c.view.scene.setLookupTable(name);
 }
 
 api.prototype.loadLUTS = function(){
	vxl.go.lookupTableManager.loadAll();
 }

 /**
  * Go back to square one. A clean scene with no actors
  * @TODO: Provide the option to keep the assets in the cache (vxlAssetManager)
  */
 api.prototype.resetScene = function(){
    if (vxl.c.animation) vxl.c.animation.stop();
	vxl.c.view.reset();
	vxl.go.assetManager.reset();
 }
 
 /**
  * Loads 3D models, textures and other assets to a Voxelent's scene.
  * 
  * This method is very flexible. It can load one or multiple assets depending on the type of the 
  * first parameter. If it is a String, it will try to find the file with that name in Voxelent's data folder
  * (voxdata by default). Otherwise, if  the parameter 'arguments' is an Array, loadAssets will iterate
  * through it and will try to load every element of this list. Every element being the file name.
  * 
  * Nucleo supports three different loading modes which are defined in 
  * vxl.def.asset.loadingMode:
  * 
  * LIVE: As each asset is loaded it is added immediately into the scene by creating the corresponding actor
  * 
  * LATER: All the assets are loaded first THEN the actors are created. 
  * This is useful when you want to display a full scene instead of showing incremental updates.
  * 
  * DETACHED: The assets are loaded into the AssetManager object but actors are never created.
  * This allows background loading.
  * 
  * @param {String|Array} arguments the name of the asset or the list of assets (each element being the file name).
  * @param {vxl.def.asset.loadingMode} mode the loading mode
  * @param {vxlScene} scene the scene in case we do not want to load these assets in the current one
  * 
  * @see {vxl#def#asset#loadingMode}
  * @see {vxlAssetManager}
  * @see {vxlScene#setLoadingMode}
  */
 api.prototype.loadAssets = function(arguments,mode,scene){
 	
 	var scene = scene==null?vxl.c.scene:scene;
 	var assets = [];
 	if (typeof(arguments) == 'string' || arguments instanceof String){
 		assets.push(arguments);
 	}
 	else if (arguments instanceof Array){
 		for(var i=0; i<arguments.length;i++){
			assets.push(arguments[i]);
		}
 	}
 	if (mode != undefined && mode != null){
		scene.setLoadingMode(mode);
	}
	
	vxl.go.assetManager.loadList(assets, scene);
 }
 
 
 /**
  * Activates the axis in the current view
  * The axis is always centered in the focal point of the camera
  */
 api.prototype.axisON = function(){
	vxl.c.view.scene.axis.setVisible(true);
	vxl.c.camera.refresh();
 }
 
 /**
  * Hides the axis in the current view
  */
 api.prototype.axisOFF = function(){
	vxl.c.view.scene.axis.setVisible(false);
	vxl.c.camera.refresh();
 }
 
 /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 api.prototype.boundingBoxON = function(){
	vxl.c.view.scene.boundingBox.visible = true;
	vxl.c.camera.refresh();
 }
 
  /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 api.prototype.boundingBoxOFF= function(){
	vxl.c.view.scene.boundingBox.visible = false;
	vxl.c.camera.refresh();
 }
 
 /**
  * @TODO: Reimplement behaviour in the camera
  */
 api.prototype.toggleSpin = function(){
	vxl.c.camera.spin();
 }
 
 
 api.prototype.setAmbientColor = function(r,g,b) { 
	vxl.c.view.setAmbientColor([r,g,b]);
 }
 
 api.prototype.setBackgroundColor = function(r,g,b){
	vxl.c.view.setBackgroundColor([r,g,b]);
} 

 api.prototype.setAmbientLight = function(l){
	this.setAmbientColor(l,l,l);
	vxl.c.view.refresh();
	vxl.go.console('API:Ambient light changed to '+(l*100)+'%');
	return true;
 }


/**
 * If an actor has been selected (If there is an active actor in vxl.c.actor), changes its visualization mode to WIREFRAME. Otherwise,
 * shows all the scene in WIREFRAME mode.
 * 
 */ 
api.prototype.wireframeON = function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	vxl.go.console('API:Wireframe is shown.');
 }
 
 /**
  * If there is an act
  */
 api.prototype.surfaceON = function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	vxl.go.console('API:Wireframe is hidden.');
 }
 
 api.prototype.pointsON = function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
 }
 
 /**
  * @param {Number} op  opacity value between 0 and 1 (float)
  */
 api.prototype.setActorOpacity = function(op){
    var opacity = Math.min(Math.max(0,Math.abs(op)),1);
	if (vxl.c.actor){
		vxl.c.actor.setOpacity(op);
	}
	else{
		vxl.c.view.scene.setOpacity(opacity);
	}
	vxl.c.view.refresh();
	vxl.go.console('API:Opacity changed to '+(op*100)+'%');
  }
  
 
 /**
  * @param {Number} r the red component
  * @param {Number} g the green component
  * @param {Number} b the blue component
  */
 api.prototype.setActorColor = function (r,g,b){
	var color = [r,g,b];
	if (vxl.c.actor){
		vxl.c.actor.setColor(color);
	}
	else{
		vxl.c.view.scene.setColor(color);
	}
	vxl.c.view.refresh();
 }
 
 /**
  * @param {bool} flag if true this method will flip the normals. If false normals will be
  * calculated the 'normal' way.
  */
 api.prototype.flipActorNormals = function (flag){
	if (vxl.c.actor){
		vxl.c.actor.flipNormals(flag);
	}
	else{
		vxl.c.view.scene.flipNormals(flag);
	}
	vxl.c.view.refresh();
 }
 
 
 api.prototype.stopAnimation = function(){
	if(vxl.c.animation != null) vxl.c.view.stop();
 }
 
 api.prototype.startAnimation = function(){
	if(vxl.c.animation != null) vxl.c.view.start();
 }
 
 api.prototype.setFrame = function(f){
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
 }

 api.prototype.clearAnimation = function(){
	if(vxl.c.animation){
		vxl.c.animation.stop();
		vxl.c.animation = null;
		vxl.c.view.animation = null;
	}
 } 
 
 api.prototype.resetCamera = function(){
	vxl.c.camera.reset();
 }
 
 api.prototype.saveCamera = function(){
	vxl.c.camera.save();
 }
 
 api.prototype.retrieveCamera = function(){
	vxl.c.camera.retrieve();
 }
 
 api.prototype.setAzimuth = function(a){
	vxl.c.camera.changeAzimuth(a);
 }
 
 api.prototype.setElevation = function(e){
	vxl.c.camera.changeElevation(e);
 }
 
 api.prototype.go_above = function(){
	vxl.c.camera.above();
 }
 
 api.prototype.go_below = function(){
	vxl.c.camera.below();
 }
 
 api.prototype.go_left = function(){
	vxl.c.camera.left();
 }
 
 api.prototype.go_right = function(){
	vxl.c.camera.right();
 }
 
 api.prototype.getLookupTables = function(){
    return vxl.go.lookupTableManager.getAllLoaded();
 }
 
 //api.prototype.runScript = function(file){
 //use JQuery here.
 //}
 
 /**
  * Loads a program
  */
 api.prototype.loadProgram = function(code){
    vxl.c.view.renderer.setProgram(code.NAME,code);
 }
 
 