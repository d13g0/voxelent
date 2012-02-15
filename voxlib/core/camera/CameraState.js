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
 * Creates a vxlCameraState object and associates it with a vxlCamera. 
 * 
 * This association is unique. each camera has one vxlCameraState object. The vxlCameraState object allows to save/retrive 
 * camera states forthe camera it is associated with during the construction.
 * 
 * 
 * @class 
 * @constructor this is the constructor doc
 * @param {vxlCamera} camera
 * @author Diego Cantor
 * @see vxlCamera
  */

function vxlCameraState(camera) {
	if(!( camera instanceof vxlCamera)) {
		alert('vxlCameraState needs a vxlCamera as argument');
		return null;
	}

	this.c = camera;
	this.position = new vxlVector3(0, 0, 1);
	this.focalPoint = new vxlVector3(0, 0, 0);
	
    this.up = new vxlVector3(0, 1, 0);
	this.right = new vxlVector3(1, 0, 0);
    
	this.distance = 0;
	this.azimuth = 0;
	this.elevation = 0;
    
	this.xTr = 0;
	this.yTr = 0;
};

/**
 * Resets current camera to the standard location an orientation. This is,
 * the camera is looking at the center of the scene, located at [0,0,1] along the z axis and
 * aligned with the y axis.
 * 
 */
vxlCameraState.prototype.reset = function() {
	var c = this.c;
	c.focalPoint = new vxlVector3(0, 0, 0);
	c.up = new vxlVector3(0, 1, 0);
	c.right = new vxlVector3(1, 0, 0);
	c.distance = 0;
	c.elevation = 0;
	c.azimuth = 0;
	c.xTr = 0;
	c.yTr = 0;
	c.setPosition(0, 0, 1);
	c.setOptimalDistance();
};

/**
 * Saves the current state of the camera that this vxlCameraState object is associated with.
 */

vxlCameraState.prototype.save = function() {
	var c = this.c;
	this.distance = c.distance;
	this.azimuth = c.azimuth;
	this.elevation = c.elevation;
	this.xTr = c.xTr;
	this.yTr = c.yTr;
	vxl.vec3.set(c.position, this.position);
	vxl.vec3.set(c.focalPoint, this.focalPoint);
	vxl.vec3.set(c.up, this.up);
	vxl.vec3.set(c.right, this.right);
};

/**
 * Updates the camera with the state stored in vxlCameraState.
 */

vxlCameraState.prototype.retrieve = function() {
	var c = this.c;
	c.azimuth = this.azimuth;
	c.elevation = this.elevation;
	c.xTr = this.xTr;
	c.yTr = this.yTr;

	vxl.vec3.set(this.focalPoint, c.focalPoint);
	vxl.vec3.set(this.up, c.up);
	vxl.vec3.set(this.right, c.right);

	c.setPosition(this.position.x, this.position.y, this.position.z);
};
