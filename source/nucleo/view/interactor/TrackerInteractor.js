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


vxlTrackerInteractor.prototype = new vxlViewInteractor();
vxlTrackerInteractor.prototype.constructor = vxlViewInteractor;
/**
 * @class Determines the application behaviour originated by mouse and keyboard events. 
 * @constructor
 * Interprets mouse and keyboard events and translate them to camera actions
 * @augments vxlViewInteractor
 */
function vxlTrackerInteractor(){
    vxlViewInteractor.call(this);    
	this.MOTION_FACTOR = 10.0;
	this.task = vxl.def.interactor.task.NONE;
	this._x            = 0;
	this._y            = 0;
	this._lastX        = 0;
	this._lastY        = 0;
	this._lastClickedX = 0;
	this._lastClickedY = 0;
	this._ctrl_key     = false;
	this._alt_key      = false;
	this._shift_key    = false;
	this._key          = 0;
	this._button       = -1;
	this._dragging     = false;
	this._dragndrop    = false;
	this._is_mac       = vxl.util.isMac();
	
	this.addKeyAction('F', function(view,cam){view.fullscreen(true);});
	this.addKeyAction('X', function(view,cam){view.fullscreen(false);});
	
};

/**
 * Returns the type of this interactor as a string 
 */
vxlTrackerInteractor.prototype.getType = function(){
    return "vxlTrackerInteractor";
};

/**
 * Invoked when the user presses a key
 */
vxlTrackerInteractor.prototype.onKeyDown = function(ev){

    this._key             = ev.keyCode;
    this._alt_key         = ev.altKey;
    this._shift_key       = ev.shiftKey;
    
    var camera = this.camera;
    
    
    if (!this._alt_key && !this._shift_key){
        switch(this._key){
              case 38:camera.changeElevation(10);  break;
              case 40:camera.changeElevation(-10); break;
              case 37:camera.changeAzimuth(-10);   break;
              case 39:camera.changeAzimuth(10);    break;
              default: this.fireKeyAction(this._key);
        }
    }
    //PANNING
    else if(this._shift_key && this._key!=17) {
        var px = 0;
        var py = 0;
        switch(this._key){
            case 38:py = 10; break;
            case 40:py = -10;break;
            case 37:px = -10;break;
            case 39:px = 10; break;
            default: this.fireKeyAction(this._key);
        }
        if(px != 0 || py !=0){
            this.pan(px,py);
        }
    }
    this.camera.refresh();
};

/**
 * Invoked when the user releases a key
 */
vxlTrackerInteractor.prototype.onKeyUp = function(ev){
    if (ev.keyCode == 17){
        this._ctrl_key = false;
    }
};

/**
 * Invoked when the user releases the mouse
 */
vxlTrackerInteractor.prototype.onMouseUp = function(ev){
	task = vxl.def.interactor.task.NONE;
	this._dragging = false;
};

/**
 * Invoked when the user presses a mouse button
 */
vxlTrackerInteractor.prototype.onMouseDown = function(ev){
	this._x             = ev.clientX;
	this._y             = ev.clientY;
	this._lastClickedX  = this._x;
	this._lastClickedY  = this._y;
	this._button        = ev.button;
	this._dragging      = true;
};

/**
 * Invoked when the user moves the mouse
 */
vxlTrackerInteractor.prototype.onMouseMove = function(ev){

	this._lastX         = this._x;
	this._lastY         = this._y;
	this._x             = ev.clientX;
    this._y             = ev.clientY;

	if (!this._dragging) return;
    if (this._button !=0) return;  
	
	this._ctrl_key 	= ev.ctrlKey;
	
	if (this._is_mac && ev.metaKey){
	    this._ctrl_key = true;
	}
	
	this._alt_key       = ev.altKey;
	this._shift_key 	= ev.shiftKey;
	
	var rx = this._x - this._lastX;
	var ry = this._y - this._lastY;
		 
    if (this._ctrl_key && !this._shift_key){ 
		this.dolly(ry);
	}
	else if (this._shift_key && !this._ctrl_key){
		this.pan(rx,ry);
	}
	else if (this._ctrl_key && this._shift_key){
	    this.roll(ry);
	}
	else {

        this.rotate(rx,ry);
    }
	
	this.camera.refresh();
};


/**
 *  Invoked when the user drags a file over the view
 */
vxlTrackerInteractor.prototype.onDragOver = function(event){
    event.stopPropagation();
    event.preventDefault();
    
        
    if (this.view._dragndrop){
        if (!this._dragndrop){
            this.bgcolor = this.view.backgroundColor.slice(0);
            this._dragndrop = true;
        }
        event.dataTransfer.dropEffect = 'copy';
        this.view.setBackgroundColor(0,0.514,0.678); //vox color
    }
};

/**
 * Invoked when the user drags away from the view
 */
vxlTrackerInteractor.prototype.onDragLeave = function(event){
    event.stopPropagation();
    event.preventDefault();

    if (this.view._dragndrop){
        event.dataTransfer.dropEffect = 'copy';
        this.view.setBackgroundColor(this.bgcolor);
        this._dragndrop = false;
    }
    
};

/**
 * Processes the file that has been droped on the view
 * 
 * @TODO: this method only works for VTK ascii files. Review other formats 
 */
vxlTrackerInteractor.prototype.onDrop = function(event){
    event.stopPropagation();
    event.preventDefault();
    if (!this.view._dragndrop) return; //the view is configured to not accept dnd
    this._dragndrop = false;
    this.view.setBackgroundColor(this.bgcolor);
    
    var files = event.dataTransfer.files;
    var reader = new vxlVTKReader(this.view.scene);
    if (reader.isSupported()){
        reader.readFile(files[0]);
    }
    else {
        throw 'vxlTrackerInteractor.drop: File API is not supported on this browser';
    }
};

/**
 * By default, this method invokes a long shot operation on the current 
 * camera to visualize all the objects in the scene
 * @param {Object} event
 */
vxlTrackerInteractor.prototype.onDoubleClick = function(event){
    this.camera.longShot();
};


/**
 * Internal method used by this tracker to perform dollying
 * @param {Number} value the number of dollying steps
 */
vxlTrackerInteractor.prototype.dolly = function(value){
	
	this.task = vxl.def.interactor.task.DOLLY;
    this.camera.dolly(value);
};

/**
 * Internal method used by this tracker to perform rolling
 * @param {Number} value the rolling angle
 */
vxlTrackerInteractor.prototype.roll = function(value){
    
    this.task = vxl.def.interactor.task.ROLL;
    
    var canvas = this.camera.view.canvas;
    
    var dy = -20.0 / canvas.width;
    
    var rotY = value * dy * this.MOTION_FACTOR;
    
    this.camera.rotate(0,0,rotY);
};



/**    this._dragndrop = false;
 * Internal method used by this tracker to rotate the camera.
 * @param {Number} dx the rotation on the X axis (elevation)
 * @param {Number} dy the rotation on the Y axis (azimuth)
 */
vxlTrackerInteractor.prototype.rotate = function(rx, ry){
	
	this.task = vxl.def.interactor.task.ROTATE;
	
	var canvas = this.camera.view.canvas;
	var dx = -20.0 / canvas.height;
	var dy = -20.0 / canvas.width;
	var motionFactorX = this.MOTION_FACTOR;
	var motionFactorY = this.MOTION_FACTOR;
	if (rx*rx > 2 * ry *ry){
	    motionFactorY *= 0.5;
	}
	else if (ry*ry > 2* rx*rx){
	    motionFactorX *= 0.5;
	}
	
	var rotX = rx * dx * motionFactorX;
	var rotY = ry * dy * motionFactorY;
	
	this.camera.rotate(rotX, rotY);
};

/**
 * Internal method used by this tracker to perform panning 
 * @param {Object} dx
 * @param {Object} dy
 */
vxlTrackerInteractor.prototype.pan = function(dx,dy){

	this.task = vxl.def.interactor.task.PAN;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	var scene = camera.view.scene;    this._dragndrop = false;
	var dimMax = Math.max(canvas.width, canvas.height);
	var deltaX = 1 / dimMax;
	var deltaY = 1 / dimMax;
	var max = scene.bb.max();
    var ndx = dx * deltaX * this.MOTION_FACTOR * max / 2;
	var ndy = -dy * deltaY * this.MOTION_FACTOR * max / 2;

	camera.pan(ndx,ndy);
};