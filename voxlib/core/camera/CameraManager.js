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

function vxlCameraManager(vw){
	this.view = vw;
	this.cameras = [];
	this.active = this.createCamera();
}

vxlCameraManager.prototype.reset = function(type){
	this.cameras = [];
	this.interactors = [];
	this.active = this.createCamera(type);
}

vxlCameraManager.prototype.checkBoundary = function(idx){
	if (idx <0 || idx >= this.cameras.length){
		throw('The camera '+idx+' does not exist');
	}
}

vxlCameraManager.prototype.createCamera = function(type){
	var camera = new vxlCamera(this.view, type);
	camera.init();
	
	this.cameras.push(camera);
	camera.idx = this.cameras.length - 1;
	return camera;
}

vxlCameraManager.prototype.getCamera = function(idx){
	this.checkBoundary(idx);
	return this.cameras[idx];
}

vxlCameraManager.prototype.getActiveCamera = function(){
	return this.active;
}

vxlCameraManager.prototype.switchTo = function(idx){
	this.checkBoundary(idx);
	this.active = this.cameras[idx];
	return this.active;
}

