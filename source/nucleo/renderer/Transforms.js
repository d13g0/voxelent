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
 * @author Diego Cantor
 */
function vxlTransforms(vw){
	this.stack = [];
	this.view = vw;
	this.mvMatrix    = new vxlMatrix4x4();    // The Model-View matrix
	this.pMatrix     = new vxlMatrix4x4();    // The projection matrix
	this.nMatrix     = new vxlMatrix4x4();    // The normal matrix
	this.cMatrix     = new vxlMatrix4x4();    // The camera matrix	
};

/**
 * Calculates the Model-View matrix for the current camera.
 */
vxlTransforms.prototype.calculateModelView = function(){
	vxl.mat4.set(this.view.cameraman.active.getViewTransform(), this.mvMatrix);
    
};

/**
 * Calculates the normal matrix corresponding to the current Model-View matrix
 */
vxlTransforms.prototype.calculateNormal = function(){
	vxl.mat4.identity(this.nMatrix);
    vxl.mat4.set(this.mvMatrix, this.nMatrix);
    vxl.mat4.inverse(this.nMatrix);
    vxl.mat4.transpose(this.nMatrix);
};

/**
 * Calculates the perspective matrix given the current camera
 */
vxlTransforms.prototype.calculatePerspective = function(){
    var c = this.view.cameraman.active;
    var vw = this.view;
	vxl.mat4.identity(this.pMatrix);
	vxl.mat4.perspective(this.pMatrix, c.FOV, vw.width/vw.height, c.Z_NEAR, c.Z_FAR);
};

/**
 * Calculate the transforms for the current view.renderer
 * 
 */
vxlTransforms.prototype.update = function(){
    this.calculateModelView();
    this.calculatePerspective();
    this.calculateNormal();
};

/**
 * Saves the current Model-View matrix in the stack. This
 * operation is called by vxlActor.updateMatrixStack
 * @see vxlActor#updateMatrixStack
 */

vxlTransforms.prototype.push = function(){
	var memento =  new vxlMatrix4x4();
	vxl.mat4.set(this.mvMatrix, memento);
	this.stack.push(memento);
};

/**
 * Retrieves the last Model-View transformation in the matrix stack.
 * This operation is called by vxlActor.updateMatrixStack
 */
vxlTransforms.prototype.pop = function(){
	if(this.stack.length == 0) return;
	this.mvMatrix  =  this.stack.pop();
};