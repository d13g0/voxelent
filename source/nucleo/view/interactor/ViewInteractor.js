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
 * <p> Handles the interaction between a camera and a view </p>
 * @class
 * @constructor 
 */
function vxlViewInteractor(view, camera){
    this.view   = view;
	this.camera = camera;
	
	if (view != undefined){
	   this.connectView(view);
	}
	
	if (camera != undefined){
	    this.connectCamera(camera);
	}
};

/**
 * 
 */
vxlViewInteractor.prototype.getType = function(){
    return "vxlViewInteractor";
};

/**
 * @param {vxlView} view the view 
 */
vxlViewInteractor.prototype.connectView = function(view){
  
    if (!(view instanceof vxlView)){
        throw 'ViewInteractor.connectView: the parameter is not a vxlView';
    }
    var interactor = this;
    var canvas = view.canvas;

    this.view   = view;
    this.camera = view.cameraman.active;

    
    canvas.onmousedown = function(ev) {
        interactor.onMouseDown(ev);
    };

    canvas.onmouseup = function(ev) {
        interactor.onMouseUp(ev);
    };
    
    canvas.onmousemove = function(ev) {
        interactor.onMouseMove(ev);
    };
    
    canvas.ondragover = function(ev){
        interactor.onDragOver(ev);
    };
    
    canvas.ondragleave = function(ev){
        interactor.onDragLeave(ev);
    };
    
    canvas.ondrop = function(ev){
        interactor.onDrop(ev);
    };
    
    window.onkeydown = function(ev){
        interactor.onKeyDown(ev);
    };
    
    window.onkeyup = function(ev){
        interactor.onKeyUp(ev);
    };
};


/**
 * @param {vxlCamera} c the camera to connect to this interactor
 * @todo: validate that the camera belongs to the current view. If not throw an exception.
 */
vxlViewInteractor.prototype.connectCamera = function(c){
	if (c instanceof vxlCamera){
		this.camera = c;
		this.camera.interactor = this;
	}
	else {
		throw('ViewInteractor.connectCamera: The object '+c+' is not a valid camera');
	}
};

/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onMouseUp   = function(ev){ alert('implement onMouseUp');};
/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onMouseDown = function(ev){ alert('implement onMouseDown');};
/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onMouseMove = function(ev){ alert('implement onMouseMove');};
/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onKeyDown   = function(ev){ alert('implement onKeyDown');};
/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onKeyUp     = function(ev){ alert('implement onKeyUp');};
/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onDragOver     = function(ev){ alert('implement onDragOver');};
/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onDragLeave     = function(ev){ alert('implement onDragLeave');};

/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onDrop     = function(ev){ alert('implement onDrop');};




