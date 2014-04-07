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
 * This is a class that interfaces between the current camera and the rendering engine.
 * It contains the matrices used by the current camera and that will be used for 
 * performing rendering calculations.
 * 
 * This class also keeps track of the push-pop operations on the model-view matrix stack.
 * This is required to combine local and global transformations.
 * 
 * @class Encapsulates the matrices required to perform 3D rendering
 * @constructor
 * @author Diego Cantor
 * @param {vxlView} p_view the view that this object will refer to.
 */
function vxlTransforms(p_view){
	
	this._stack = [];
	this.view = p_view;
	
	this.model_view               = mat4.create();   // The Model-View matrix
	this.projection               = mat4.create();   // The projection matrix
	this.camera                   = mat4.create();   // The camera matrix
	this.normal                   = mat4.create();   // The normal matrix
	this.projection_model_view   = mat4.create();	
};

/**
 * Calculates the current model-view transform.
 * This reference is updated whenever the active camera changes.
 */
vxlTransforms.prototype.calculateModelView = function(){
    //Copy is required so we can do push pop operations
	this.model_view = mat4.copy(this.model_view,this.view.cameraman.active.getViewTransform());
    
};

/**
 *Calculates the current camera matrix from the current model-view matrix 
 */
vxlTransforms.prototype.calculateCamera = function(){
    this.camera = mat4.inverse(this.camera, this.model_view);
};

/**
 * Calculates the normal matrix corresponding to the current Model-View matrix
 */
vxlTransforms.prototype.calculateNormal = function(){
	this.normal = mat4.clone(this.model_view);
    this.normal = mat4.invert(mat4.create(), this.normal);
    this.normal = mat4.transpose(this.normal, this.normal);
};

/**
 * Calculates the projection matrix given the current camera.
 * The projection may be orthographic or perspective
 */
vxlTransforms.prototype.calculateProjection = function(){
    var c = this.view.cameraman.active;
    c.updatePerspective();
    this.projection = c._perspective;  //for now
};

/**
 * Calculates the projection-model-view matrix 
 */
vxlTransforms.prototype.calculateProjectionModelView = function(){
    mat4.multiply(this.projection_model_view, this.projection, this.model_view);
};

/**
 * Calculate the transforms for the current view.renderer
 * 
 */
vxlTransforms.prototype.update = function(){
    this.calculateModelView();
    this.calculateProjection();
    this.calculateNormal();
    this.calculateProjectionModelView();
};

/**
 * Saves the current Model-View matrix in the stack. This
 * operation is called by vxlActor.updateMatrixStack
 * @see vxlActor#updateMatrixStack
 */

vxlTransforms.prototype.push = function(){
	var memento =  mat4.create();
	mat4.copy(memento, this.model_view);
	this._stack.push(memento);
};

/**
 * Retrieves the last Model-View transformation in the matrix stack.
 * This operation is called by vxlActor.updateMatrixStack
 */
vxlTransforms.prototype.pop = function(){
	if(this._stack.length == 0) return;
	
	this.model_view  =  this._stack.pop();
	
	this.calculatePerspective();
	this.calculateNormal();
	this.calculateProjectionModelView();
};