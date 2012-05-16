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
