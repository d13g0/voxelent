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
 * @class Encapsulates the matrices required to perform 3D rendering
 * @constructor
 * @author Diego Cantor
 */
function vxlTransforms(vw){
	this._stack = [];
	this.view = vw;
	this.mvMatrix    = mat4.create();    // The Model-View matrix
	this.pMatrix     = mat4.create();    // The projection matrix
	this.nMatrix     = mat4.create();    // The normal matrix
	this.cMatrix     = mat4.create();    // The camera matrix
	this.mvpMatrix   = mat4.create();	
};

/**
 * Calculates the Model-View matrix for the current camera.
 */
vxlTransforms.prototype.calculateModelView = function(){
	mat4.copy(this.mvMatrix, this.view.cameraman.active.getViewTransform());
    
};

/**
 * Calculates the normal matrix corresponding to the current Model-View matrix
 */
vxlTransforms.prototype.calculateNormal = function(){
	this.nMatrix = mat4.clone(this.mvMatrix);
    this.nMatrix = mat4.invert(mat4.create(), this.nMatrix);
    this.nMatrix = mat4.transpose(this.nMatrix, this.nMatrix);
};

/**
 * Calculates the perspective matrix given the current camera
 */
vxlTransforms.prototype.calculatePerspective = function(){
    var c = this.view.cameraman.active;
    var vw = this.view;
    var rads = vxl.util.deg2rad(c._fov);
	mat4.perspective(this.pMatrix, rads, vw.width/vw.height, c.Z_NEAR, c.Z_FAR);
};


vxlTransforms.prototype.calculateModelViewPerspective = function(){
    mat4.multiply(this.mvpMatrix, this.pMatrix, this.mvMatrix);
}
/**
 * Calculate the transforms for the current view.renderer
 * 
 */
vxlTransforms.prototype.update = function(){
    this.calculateModelView();
    this.calculatePerspective();
    this.calculateNormal();
    this.calculateModelViewPerspective();
};

/**
 * Saves the current Model-View matrix in the stack. This
 * operation is called by vxlActor.updateMatrixStack
 * @see vxlActor#updateMatrixStack
 */

vxlTransforms.prototype.push = function(){
	var memento =  mat4.create();
	mat4.copy(memento, this.mvMatrix);
	this._stack.push(memento);
};

/**
 * Retrieves the last Model-View transformation in the matrix stack.
 * This operation is called by vxlActor.updateMatrixStack
 */
vxlTransforms.prototype.pop = function(){
	if(this._stack.length == 0) return;
	this.mvMatrix  =  this._stack.pop();
	this.calculatePerspective();
	this.calculateNormal();
	this.calculateModelViewPerspective();
};