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
 * Creates vxlModel objects and assigns them to a vxlScene. 
 * 
 * vxlAssetManager provides methods for loading remote and local models.
 * 
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlAssetManager(){
	this.firstLoadedModel = false; //analyze
	this.toLoad = new Array(); //analyze
	this.assets = [];
	vxl.go.notifier.addSource(vxl.events.MODELS_LOADED,this);
};


/**
 * Creates an asset from a JSON object specification.
 * @param {Object} json the JSON object to load
 * @param {String} name the name that the asset will be identified by. This name should be unique.
 * @param {vxlScene} scene optional parameter. The scene that will contain an actor for this asset.
 */
vxlAssetManager.prototype.add = function(json, name, scene){
	this.createAsset(json,name, scene);
};

/**
 * Uses a JSON/Ajax mechanism to load assets from the webserver.
 * @param {String} name name of the file that will be loaded. Voxelent will look for this file inside of the 
 * 						folder defined by the configuration variable vxl.def.model.folder
 * @param {vxlScene} optional parameter. The scene that will contain an actor for this asset.
 */  
vxlAssetManager.prototype.load = function(name, scene) {
    var manager = this;
	if (manager.isModelLoaded(name)) return;
	
	vxl.go.console('AssetManager: Requesting '+name+'...');
    var request = new XMLHttpRequest();
    request.open("GET", vxl.def.model.folder+'/'+name);
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
	    if(request.status == 404) {
			alert ('vxl.go.assetManager says: '+ name + ' does not exist');
		 }
		else {
			manager.createAsset(name,JSON.parse(request.responseText),scene);
		}
	  }
    }
    request.send();
};

/**
 * Loads a list of assets and assigns them to a scene
 * @param {Array} list list of files to load 
 * @param {vxlScene} scene scene to callback when the assets are loaded 
 */
vxlAssetManager.prototype.loadList = function(list,scene){
	this.toLoad = list.slice(0); 
	vxl.go.console('models to load: ' + this.toLoad.length);
   	for(var i=0;i<this.toLoad.length; i++){
		this.load(this.toLoad[i],scene);
   	}
};

/**
 * 
 * @param {String} name name of the asset to be created
 * @param {Object} payload the JSON object that contains the definition of the asset
 * @param {vxlScene} scene the scene to be called back when the asset is created
 */
vxlAssetManager.prototype.createAsset = function(name,payload,scene){
	var model = new vxlModel();
	
	model.load(name,payload);
	
	if (!this.firstLoadedModel){
		scene.bb = model.outline;
		this.firstLoadedModel = true;
	}
		
	model.loaded = true;
	this.assets.push(model);
	vxl.go.console('AssetManager: asset '+model.name+' created.'); 
	
	if (scene != undefined && scene instanceof vxlScene){
		vxl.go.console('AssetManager: notifying the scene...');
		if (scene.loadingMode == vxl.def.asset.loadingMode.LIVE){
			scene.createActor(model);
		}
		else if (scene.loadingMode == vxl.def.asset.loadingMode.LATER){
			if(assetManager.allLoaded()){
				scene.createActors(assetManager.assets);
			}
		}
		else if (scene.loadingMode == vxl.def.asset.loadingMode.DETACHED){
			//do nothing
		}
	}
	
	if(this.allLoaded()){ 
		vxl.go.notifier.fire(vxl.events.MODELS_LOADED);
	}
 };
 
/**
 * It will delete all of the loaded assets
 */  
vxlAssetManager.prototype.reset = function(){
	this.firstLoadedModel = false;
	for (var i=0; i <this.assets.length; i++){
		this.assets[i] = null;
	}
	
	this.assets        = [];
	this.toLoad        = [];
};

/**
 * Checks if a model has been loaded yet
 * @param {String} name the name of the model to check
 */
vxlAssetManager.prototype.isModelLoaded = function(name){
	for(var i=0;i<this.assets.length;i++){
		if (this.assets[i].name == name) return true;
	}
	return false;
};

/**
 * Returns true if all the models in the list passed to the method loadList.
 */
vxlAssetManager.prototype.allLoaded = function(){
	return (this.assets.length == this.toLoad.length); //TODO: Verify one by one
}


/**
 * Returns the asset if it has been loaded by this asset manager, null otherwise.
 * @param {String} name the name of the asset to retrieve
 */
vxlAssetManager.prototype.getAssetByName = function(name){
 	for(var i=0, max = this.assets.length; i<max; i+=1){
		if (this.assets[i].name == name) return this.assets[i];
	}
	return null;
};

/**
 * Defines the global Asset Manager 
 */
vxl.go.assetManager = new vxlAssetManager();