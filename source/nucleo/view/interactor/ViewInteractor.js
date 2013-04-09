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
function vxlViewInteractor(){
    this.view   = undefined;
	this.camera = undefined;
	this.UID    = vxl.util.generateUID();
	this.keymap = {};
	this.keysEnabled = true; //keys enabled by default
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
    
    canvas.ondblclick = function(ev){
        interactor.onDoubleClick(ev);
    }
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
 * Maps a key code to a function
 * @param {String} key
 * @param {Object} fn
 */
vxlViewInteractor.prototype.addKeyAction = function(key, fn){
    var keycode = key.charCodeAt(0);
    this.keymap[keycode] = fn;
};

/**
 * Removes a key binding
 * @param {String} key
 */
vxlViewInteractor.prototype.removeKeyAction = function(key){
    var keycode = key.charCodeAt(0);
    delete this.keymap[keycode];
};

/**
 * Invokes the function associated with a key code
 * @param {Object} keycode
 */
vxlViewInteractor.prototype.fireKeyAction = function(keycode){
    
    if (!this.keysEnabled) return;
    if (this.keymap[keycode]){
        this.keymap[keycode](this.view, this.camera);
    }
};

vxlViewInteractor.prototype.enableKeyActions = function(flag){
    this.keysEnabled = flag;
}


