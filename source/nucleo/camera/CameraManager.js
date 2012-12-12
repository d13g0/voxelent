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
 * @class The camera manager is responsible for controlling the cameras associated with a view 
 * @constructor
 * @param {vxlView} vw the view
 * @see vxlCamera
 * @see vxlView
 */
function vxlCameraManager(vw){
	this.view = vw;
	this.cameras = [];
	this.active = this.create();
	if (vxl.c.camera == undefined){
	    vxl.c.camera = this.active;
	}
}

/**
 * Resets the camera manager and creates one camera
 * @param {vxl.def.camera.type} type the type of amera
 */
vxlCameraManager.prototype.reset = function(type){
	this.cameras = [];
	this.interactors = [];
	this.active = this.create(type);
};


/**
 * Creates a camera
 * @param {vxl.def.camera.type} type the type of camera to create
 */
vxlCameraManager.prototype.create = function(type){
	var camera = new vxlCamera(this.view, type);
	this.cameras.push(camera);
	return camera;
};

/**
 * Removes a camera from the camera manager. Please notice that this operation
 * will cause reindexing. So, if the camera manager has cameras 0, 1, 2  and camera 1
 * is removed then camera 2 will be now camera 1 so the index is maintained.
 * 
  * @param {Number} idx the index of the camera to be removed
 */
vxlCameraManager.prototype.remove = function(idx){
    if (this.cameras.length == 1){
        throw ('vxlCameraManager.remove ERROR: the camera manager must not eliminate the last camera standing. Operation cancelled');
    }
    else{
        this.cameras.splice(idx,1);
    }
};

/**
 * Returns the camera with index idx
 * @param {Number} idx the index of the camera to return
 */
vxlCameraManager.prototype.get = function(idx){
	this._checkBoundary(idx);
	return this.cameras[idx];
};


/**
 * Changes the active camera to the camera with index idx
 * @param {Number} idx the index of the camera to make active
 */
vxlCameraManager.prototype.switchTo = function(idx){
    var view = this.view;
	this._checkBoundary(idx);
	this.active = this.cameras[idx];
    
    if (view.interactor != undefined) {
        view.interactor.connectCamera(this.active);
    }
    else{
        throw ('vxlCameraManager.switchTo ERROR: switching to camera ['+idx+'] while the view '+view.name+' does not have an interactor set');
    }
    
    vxl.c.camera = this.active;
	
	return this.active;
};

/**
 * Utilitary method that check if the index idx is between 0 and the size of the camera array
 * @param {Number} idx the index to check.
 * @private
 */
vxlCameraManager.prototype._checkBoundary = function(idx){
    if (idx <0 || idx >= this.cameras.length){
        throw('The camera '+idx+' does not exist');
    }
};