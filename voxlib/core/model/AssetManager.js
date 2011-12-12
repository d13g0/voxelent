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
 * Central repository for local and remote assets
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlAssetManager(){
	
	this.firstLoadedModel = false; //analyze
	this.toLoad = new Array(); //analyze
	
	this.assets = [];
	
	vxl.go.notifier.addSource('vxl.event.all_models_loaded',this);
}


/**
 * Adds local objects (For instance floor)
 */
vxlAssetManager.prototype.add = function(json_asset){
	alert('not implemented');
	this.createAsset(json_asset.alias, json_asset);
	
}

/**
 * 
 */  
vxlAssetManager.prototype.load = function(name, scene) {
    var assetManager = this;
	if (assetManager.isModelLoaded(name)) return;
	
	message('Requesting '+name+'...');
    var request = new XMLHttpRequest();
    request.open("GET", vxl.def.modelsFolder+'/'+name);
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
	    if(request.status == 404) {
			alert ('vxl.go.assetManager says: '+ name + ' does not exist');
		 }
		else {
			assetManager.createAsset(name,JSON.parse(request.responseText),scene);
		}
	  }
    }
    request.send();
  }

/**
 * 
 * @param {Array} list list of files to load 
 * @param {vxlScene} scene scene to callback when the assets are loaded 
 */
vxlAssetManager.prototype.loadList = function(list,scene){
	this.toLoad = list.slice(0); 
	message('models to load: ' + this.toLoad.length);
   	for(var i=0;i<this.toLoad.length; i++){
		this.load(this.toLoad[i],scene);
   	}
}


/**
 *
 * @param {String} name name of the asset to be created
 * @param {Object} payload the JSON object that contains the definition of the asset
 * @param {vxlScene} scene the scene to be called back when the asset is created
 */
vxlAssetManager.prototype.createAsset = function(name,payload,scene){
	
	var assetManager = this;
	var model = new vxlModel();
	
	model.load(name,payload);
	
	if (!assetManager.firstLoadedModel){
		vxl.go.centre = model.centre; //@TODO: vxl.go.centre dissapears and now we have centres per scene.
		vxl.go.boundingBox = model.outline;
		assetManager.firstLoadedModel = true;
	}
		
	model.loaded = true;
	assetManager.assets.push(model);
	message('AssetManager: asset '+model.name+' created.'); 
	
	if (scene != undefined && scene instanceof vxlScene){
		scene.updateGlobals(model.outline);
		message('AssetManager: notifying the scene...');
		if (scene.loadingMode == vxl.def.loadingMode.LIVE){
			scene.createActor(model);
		}
		else if (scene.loadingMode == vxl.def.loadingMode.LATER){
			if(assetManager.allLoaded()){
				scene.createActors(assetManager.assets);
			}
		}
		else if (scene.loadingMode == vxl.def.loadingMode.DETACHED){
			//do nothing
		}
	}
	
	if(assetManager.allLoaded()){ 
		vxl.go.notifier.fire('vxl.event.all_models_loaded');
	}
  }
  
vxlAssetManager.prototype.reset = function(){
	this.firstLoadedModel = false;
	for (var i=0; i <this.assets.length; i++){
		this.assets[i] = null;
	}
	
	vxl.go.boundingBox = [0,0,0,0,0,0]; //TODO: Move this to the scene object
	vxl.go.centre      = [0,0,0]; //TODO: Move this to the scene object
	this.assets        = [];
	this.toLoad        = [];
}

vxlAssetManager.prototype.isModelLoaded = function(name){
	for(var i=0;i<this.assets.length;i++){
		if (this.assets[i].name == name) return true;
	}
	return false;
}

vxlAssetManager.prototype.allLoaded = function(){
	return (this.assets.length == this.toLoad.length); //TODO: Verify one by one
}




vxlAssetManager.prototype.getAssetByName = function(assetName){
 	for(var i=0; i<this.assets.length; i++){
		if (this.assets[i].name == assetName) return this.assets[i];
	}
	return null;
}

vxl.go.assetManager = new vxlAssetManager();