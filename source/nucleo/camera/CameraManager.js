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
 * @class
 * @constructor
 * @param {vxlView} vw the view
 * @see vxlCamera
 * @see vxlView
 */
function vxlCameraManager(vw){
	this.view = vw;
	this.cameras = [];
	this.active = this.createCamera();
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
	this.active = this.createCamera(type);
}

/**
 * Utilitary method that check if the index idx is between 0 and the size of the camera array
 * @param {Number} idx the index to check.
 */
vxlCameraManager.prototype.checkBoundary = function(idx){
	if (idx <0 || idx >= this.cameras.length){
		throw('The camera '+idx+' does not exist');
	}
}
/**
 * Creates a camera
 * @param {vxl.def.camera.type} type the type of camera to create
 */
vxlCameraManager.prototype.createCamera = function(type){
	var camera = new vxlCamera(this.view, type);
	camera.init();
	
	this.cameras.push(camera);
	camera.idx = this.cameras.length - 1;
	return camera;
}

/**
 * Returns the camera with index idx
 * @param {Number} idx the index of the camera to return
 */
vxlCameraManager.prototype.getCamera = function(idx){
	this.checkBoundary(idx);
	return this.cameras[idx];
}

/**
 * Returns a reference to the current camera. There is always an active camera
 */
vxlCameraManager.prototype.getActiveCamera = function(){
	return this.active;
}

/**
 * Changes the active camera to the camera with index idx
 * @param {Number} idx the index of the camera to make active
 */
vxlCameraManager.prototype.switchTo = function(idx){
	this.checkBoundary(idx);
	this.active = this.cameras[idx];
	return this.active;
}

