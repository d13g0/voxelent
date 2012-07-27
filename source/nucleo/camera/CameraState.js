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
 * camera states for the camera it is associated with during the construction.
 * 
 * 
 * @class 
 * @constructor this is the constructor doc
 * @param {vxlCamera} camera
 * @author Diego Cantor
 * @see vxlCamera
  */

function vxlCameraState(name, camera) {
	if(!( camera instanceof vxlCamera)) {
		alert('vxlCameraState needs a vxlCamera as argument');
		return null;
	}
    
    this.name          = name;
	this.c             = camera;
    this.FOV            = c.FOV
    this.Z_NEAR         = c.Z_NEAR;    
    this.Z_FAR          = c.Z_FAR;
    this.matrix         = mat4.identity();
    this.right          = vec3.createFrom(1, 0, 0); //@TODO: COPY REAL VALUES
    this.up             = vec3.createFrom(0, 1, 0);
    this.normal         = vec3.createFrom(0, 0, 1); 
    this.position       = vec3.createFrom(0, 0, 1);
    this.focalPoint     = vec3.createFrom(0, 0, 0);
    this.cRot           = vec3.createFrom(0, 0, 0);
    this.azimuth        = c.azimuth;
    this.elevation      = c.elevation;
    this.type           = c.type;
    this.distance       = c.distance;
};


/**
 * Updates the camera with the state stored in vxlCameraState.
 */
vxlCameraState.prototype.retrieve = function() {
    //@TODO: Finish implementation
	var c = this.c;
	c.azimuth = this.azimuth;
	c.elevation = this.elevation;
	vec3.set(this.focus, c.focus);
	vec3.set(this.up, c.up);
	vec3.set(this.right, c.right);
	c.setPosition(this.position);
};
