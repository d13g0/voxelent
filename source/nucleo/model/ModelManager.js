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
 * vxlModelManager provides methods for loading remote and local models.
 * 
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlModelManager(){
	this.toLoad = new Array(); //analyze
	this.models = [];
	vxl.go.notifier.publish(vxl.events.MODELS_LOADED,this);
};


/**
 * Uses a JSON/Ajax mechanism to load models from the webserver.
 * @param {String} filename name of the file that will be loaded. Voxelent will look for this file inside of the 
 * 						folder defined by the configuration variable vxl.def.model.folder
 * @param {vxlScene} optional parameter. The scene that will contain an actor for this model.
 * @param {Array} attributes to add to the respective actor once the model is being loaded
 * @param {Function} callback function once the model is loaded
 */  
vxlModelManager.prototype.load = function(filename, scene) {
    var manager = this;
	if (manager.isModelLoaded(filename)) return;
	
	vxl.go.console('ModelManager.load: Requesting '+filename+'...');
    var request = new XMLHttpRequest();
    request.open("GET", filename);
    
    request.onreadystatechange = function() {
    	if (request.readyState == 4) {
      		if (request.status == 200 || ( request.status == 0 && document.domain.length ==0)){
      			var name = filename.replace(/^.*[\\\/]/, '');
       			manager.add(JSON.parse(request.responseText),name,scene);
      		}
	    	else {
				alert ('There was a problem loading the file '+filename+'. HTTP error code:'+request.status);
	  		}
    	}
    };
    
    try{
    	request.send();
    } 
    catch(e){
    	if (e.code = 1012){
    		alert('The file '+filename+' could not be accessed. \n\n'+
    		'Please make sure that the path is correct and that you have the right pemissions');
    	}
    	else{
    		alert(e);
    	}
    }	
};

/**
 * Loads a list of models and assigns them to a scene
 * @param {Array} list list of files to load 
 * @param {vxlScene} scene scene to callback when the models are loaded 
 */
vxlModelManager.prototype.loadList = function(list,scene){
	this.toLoad = list.slice(0); 
	vxl.go.console('ModelManager.loadList: models to load ->' + this.toLoad.length);
   	for(var i=0;i<this.toLoad.length; i++){
		this.load(this.toLoad[i],scene);
   	}
};

/**
 * 
 * @param {Object} JSON_OBJECT the JSON object that contains the definition of the model
 * @param {String} name name of the model to be created
 * @param {vxlScene} scene the scene to be called back when the model is created
 */
vxlModelManager.prototype.add = function(JSON_OBJECT,name,scene){
	
	var model = new vxlModel(name, JSON_OBJECT);
	
	model.loaded = true;
	this.models.push(model);
	vxl.go.console('ModelManager: model '+model.name+' created.'); 
	
	if (scene != undefined && scene instanceof vxlScene){
		vxl.go.console('ModelManager: notifying the scene...');
		if (scene.loadingMode == vxl.def.model.loadingMode.LIVE){
			scene.createActor(model);
		}
		else if (scene.loadingMode == vxl.def.model.loadingMode.LATER){
			if(this.allLoaded()){
				scene.createActors(this.models);
			}
		}
		else if (scene.loadingMode == vxl.def.model.loadingMode.DETACHED){
			//do nothing
		}
	}
	
	if(this.allLoaded()){ 
		vxl.go.notifier.fire(vxl.events.MODELS_LOADED, this);
	}
 };
 
/**
 * It will delete all of the loaded models
 */  
vxlModelManager.prototype.reset = function(){
	this.firstLoadedModel = false;
	for (var i=0; i <this.models.length; i++){
		this.models[i] = null;
	}
	
	this.models        = [];
	this.toLoad        = [];
};

/**
 * Checks if a model has been loaded yet
 * @param {String} name the name of the model to check
 */
vxlModelManager.prototype.isModelLoaded = function(name){
	for(var i=0;i<this.models.length;i++){
		if (this.models[i].name == name) return true;
	}
	return false;
};

/**
 * Returns true if all the models in the list passed to the method loadList.
 */
vxlModelManager.prototype.allLoaded = function(){
	return (this.models.length == this.toLoad.length); //TODO: Verify one by one
};


/**
 * Returns the model if it has been loaded by this model manager, null otherwise.
 * @param {String} name the name of the model to retrieve
 */
vxlModelManager.prototype.getModelByName = function(name){
 	for(var i=0, max = this.models.length; i<max; i+=1){
		if (this.models[i].name == name) return this.models[i];
	}
	return null;
};

/**
 * Defines the global Model Manager 
 */
vxl.go.modelManager = new vxlModelManager();