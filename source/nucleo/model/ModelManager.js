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
	this.toLoad = []; 
	this.models = [];
	
	var e = vxl.events;
	vxl.go.notifier.publish([
	       e.MODELS_LOADING,
	       e.MODEL_NEW,
	       e.MODELS_LOADED
	    ],this);
};


/**
 * Uses a JSON/Ajax mechanism to load models from a Web Server.
 * @param {String} filename The name of the file that will be loaded. 
 * @param {vxlScene} scene The scene that will create an actor for this model. This parameter is optional.
 */  
vxlModelManager.prototype.load = function(filename, scene) {
    var manager = this;
    
    var name = filename.replace(/^.*[\\\/]/, '');
	
	if (manager.isModelLoaded(name)) return;
	
	vxl.go.console('ModelManager.load: Requesting '+filename+'...');
	vxl.go.notifier.fire(vxl.events.MODELS_LOADING, this);
	
	var successHandler = function(manager,name,scene){
		return function(json, textStatus){
			manager.add(json,name,scene);
		}
	};
	
	var errorHandler = function(filename){
		return function(request, status, error){
			
			if(error.code = 1012){
				alert('The file '+filename+' could not be accessed. \n\n'+
    			'Please make sure that the path is correct and that you have the right pemissions');
			}
			else{
				alert ('There was a problem loading the file '+filename+'. HTTP error code:'+request.status);
			}		
		}
	};
	
	var request  = $.ajax({
		url			:filename,
		type		:"GET",
		dataType	:"json",
		success 	: successHandler(manager,name,scene),
		error		: errorHandler(filename)
	});    
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
	
	var self = this;
	
	function scheduledAdd(){
	
    	
    	var model = new vxlModel(name, JSON_OBJECT);
    	
    	model.loaded = true;
    	self.models.push(model);
    	self.toLoad.splice(name,1); //removes it from the pending list if exists
    	
    	vxl.go.console('ModelManager: model '+model.name+' created.'); 
    	
    	if (scene != undefined && scene instanceof vxlScene){
    		vxl.go.console('ModelManager: notifying the scene...');
    		if (scene.loadingMode == vxl.def.model.loadingMode.LIVE){
    			scene.createActor(model);
    		}
    		else if (scene.loadingMode == vxl.def.model.loadingMode.LATER){
    			if(self.allLoaded()){
    				scene.createActors(self.models);
    			}
    		}
    		else if (scene.loadingMode == vxl.def.model.loadingMode.DETACHED){
    			//do nothing
    		}
    	}
    	
        
        
        
    	if(self.allLoaded()){ 
    		vxl.go.notifier.fire(vxl.events.MODELS_LOADED, self);
    	}
    	else{
    	    vxl.go.notifier.fire(vxl.events.MODEL_NEW, self);
    	}
	}
	
	setTimeout(function(){scheduledAdd()},0);
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
 * Returns true if all the models in the list passed to the method loadList have been loaded.
 */
vxlModelManager.prototype.allLoaded = function(){
	return (this.toLoad.length == 0);
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