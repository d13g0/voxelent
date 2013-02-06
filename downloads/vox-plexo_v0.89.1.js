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

function vxlNetwork(userID)   {
    if (userID == undefined) throw 'Network: you need to indicate a user id to register';
    this.connected      = false;
    this.sceneID        = 0;
    this.userID         = userID;
    this.descriptor     = undefined;
    vxl.c.network       = this;
    
    this._registerUser();
};

vxlNetwork.prototype.post = function(page, command, callback){
   $.post(page, {plexo:JSON.stringify(command)}, callback)
}

vxlNetwork.prototype._registerUser = function(){
    var UID = this.userID;
    var command = {method:'registerUser', user:this.userID};
    var callback = function(data){ alert (data);};
    this.post('register.php', command, callback);
};

/**
 * Joins to a session in the server. The returned scene needs to be
 * connected to a view (or views)
 */
vxlNetwork.prototype.join = function(sceneID){
    if (sceneID == this.SCENE)
    var scene = new vxlScene();
    this.descriptor = new vxlSceneDescriptor(scene, vxl.def.net.PULL);
    this.descriptor.start();
    return scene;
};

/**
 * It will push the scene to be shared periodically
 */
vxlNetwork.prototype.share = function(scene, mode){
    //1. Create scene descriptor
    this.descriptor = new vxlSceneDescriptor(scene, vxl.def.net.PUSH, mode);
    this.descriptor.start();
    return this.SCENE_ID;
};

/**
 * 
 */
vxlNetwork.prototype.leave = function(){
    this.descriptor.stop();
};


vxlNetwork.prototype.shareCamera = function(){
    
};
/**
 * 
 */
vxlNetwork.prototype.getCamera = function(userID){
    var c = new vxlCamera();
    //1. ask the server for a user camera
};



vxlNetwork.prototype.setMode = function(mode){
    
};



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

function vxlSceneDescriptor(scene, descriptorType, accessType){
    this.scene = scene;
    this.descriptorType = descriptorType;
    this.accessType = accessType;
};


vxlSceneDescriptor.prototype.start = function(){
    alert('start');
};
/*-------------------------------------------------------------------------
    This file is part of Voxelent's Plexo

    Plexo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation version 3.

    Plexo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Plexo.  If not, see <http://www.gnu.org/licenses/>.
---------------------------------------------------------------------------*/

/**
 * Reads data periodically from a data source
 * @class
 * @constructor
 */
function vxlDataStreamReader(){
    this.source = undefined;
    this.timerID = -1;
    this.rate = 50; //50ms by default
}; 

/**
 * Sets the source and the callback properties.
 * @param {Object} source source
 * @param {Object} callback function that will be invoked when data is available
 */
vxlDataStreamReader.prototype.setup = function(source,callback){
    this.source = source;
    this.callback = callback;    
}

/**
 * Abstract method to be implemented by vxlDataStreamReader descendents
 * @private
 */
vxlDataStreamReader.prototype._requestData = function(){
    //abstract method to be implemented by its descendents    
};

/**
 * Starts querying for data
 * @param {Object} rate querying rate in milliseconds
 */
vxlDataStreamReader.prototype.start = function(rate){
    this.rate = rate>0?rate:this.rate;
    this.timerID = setInterval(
        (function(self){
            return function(){
                 self._requestData();
             }
         })
         (this), this.rate);
};

/**
 * Stops querying for data
 */
vxlDataStreamReader.prototype.stop = function(){
    clearInterval(this.timerID);
    this.timerID = -1;
};
/*-------------------------------------------------------------------------
    This file is part of Voxelent's Plexo

    Plexo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation version 3.

    Plexo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Plexo.  If not, see <http://www.gnu.org/licenses/>.
---------------------------------------------------------------------------*/

vxlJSONReader.prototype               = new vxlDataStreamReader();
vxlJSONReader.prototype.constructor   = vxlJSONReader;

/**
 * Reads data periodically from a JSON file. The source can be a php that returns the JSON
 * or a JSON file in the server itself.
 * @extends vxlDataStreamReader
 * @class
 */
function vxlJSONReader(){
    vxlDataStreamReader.call(this);
}; 

/**
 * @private
 */
vxlJSONReader.prototype._requestData = function(){
    
    var self = this;
    
    var successHandler = function(){
        return function(json, textStatus){
            if (json == null) return;
             self.callback(json);
            
       }
    };
    
    var errorHandler = function(){
        return function(request, status, error){}
     };

    //executes the AJAX request
    var request  = $.ajax({
        url         : self.source,
        type        :"GET",
        dataType    :"json",
        success     : successHandler(),
        error       : errorHandler()
    });  
};
