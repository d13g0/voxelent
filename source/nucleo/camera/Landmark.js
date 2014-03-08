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
 * Creates a vxlLandmark object and associates it with a vxlCamera. 
 * 
 * 
 * @class Stores the camera state so it can be retrieved later 
 * @constructor this is the constructor doc
 * @param {vxlCamera} camera
 * @author Diego Cantor
 * @see vxlCamera
  */

function vxlLandmark(name, camera) {
	
	if(!( camera instanceof vxlCamera)) {
		alert('vxlLandmark needs a vxlCamera as argument');
		return null;
	}
	
	this.name             = name;
	
	var c = camera;
    
    this._fov             = c._fov;
    this.Z_NEAR           = c.Z_NEAR;    
    this.Z_FAR            = c.Z_FAR;
    
    this._matrix          = mat4.set(c._matrix, mat4.create());
    this._right           = vec3.set(c._right, vec3.create());
    this._up              = vec3.set(c._up, vec3.create());
    this._forward         = vec3.set(c._forward, vec3.create());   
    this._position        = vec3.set(c._position, vec3.create());
    this._focalPoint      = vec3.set(c._focalPoint, vec3.create());
    this._distanceVector  = vec3.set(c._distanceVector, vec3.create());
    
    this._azimuth       = c._azimuth;
    this._elevation     = c._elevation;
    this._roll          = c._roll;
    this._relAzimuth    = c._relAzimuth;
    this._relElevation  = c._relElevation;
    this._relRoll       = c._relRoll;
    this._dollyingStep  = c._dollyngStep; //dollying step
    this._distance      = c._distance;
    
    this._following     = c._following;
    this._trackingMode  = c._trackingMode;
};


/**
 * Updates the camera with the state stored in vxlLandmark.
 */
vxlLandmark.prototype.retrieve = function(camera) {
    
	var c = camera;
	
	c._fov             = this._fov;
    c.Z_NEAR           = this.Z_NEAR;    
    c.Z_FAR            = this.Z_FAR;
    
    c._matrix          = mat4.set(this._matrix, mat4.create());
    c._right           = vec3.set(this._right, vec3.create());
    c._up              = vec3.set(this._up, vec3.create());
    c._forward         = vec3.set(this._forward, vec3.create());   
    c._position        = vec3.set(this._position, vec3.create());
    c._focalPoint      = vec3.set(this._focalPoint, vec3.create());
    c._distanceVector  = vec3.set(this._distanceVector, vec3.create());
    
    c._azimuth       = this._azimuth;
    c._elevation     = this._elevation;
    c._roll          = this._roll;
    c._relAzimuth    = this._relAzimuth;
    c._relElevation  = this._relElevation;
    c._relRoll       = this._relRoll;
    c._dollyingStep  = this._dollyngStep; //dollying step
    c._distance      = this._distance;
    
    c._following     = this._following;
    c._trackingMode  = this._trackingMode;
    
    c.refresh();
};
