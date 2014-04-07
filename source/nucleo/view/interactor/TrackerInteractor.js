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
	this.x = 0;
	this.y = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.lastClickedX = 0;
	this.lastClickedY = 0;
	this.ctrlPressed = false;
	this.altPressed = false;
	this.keyPressed = 0;
	this.button = -1;
	this.dragging = false;
	this.dragndrop = false;
	this.isMac = vxl.util.isMac();
	
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
 * Reacts to the window onKeyDown event 
 */
vxlTrackerInteractor.prototype.onKeyDown = function(ev){

    this.keyPressed = ev.keyCode;
    this.altPressed = ev.altKey;
    this.shiftPressed = ev.shiftKey;
    
    var camera = this.camera;
    
    
    if (!this.altPressed && !this.shiftPressed){
        switch(this.keyPressed){
              case 38:camera.changeElevation(10);  break;
              case 40:camera.changeElevation(-10); break;
              case 37:camera.changeAzimuth(-10);   break;
              case 39:camera.changeAzimuth(10);    break;
              default: this.fireKeyAction(this.keyPressed);
        }
    }
    //PANNING
    else if(this.shiftPressed && this.keyPressed !=17) {
        var px = 0;
        var py = 0;
        switch(this.keyPressed){
            case 38:py = 10; break;
            case 40:py = -10;break;
            case 37:px = -10;break;
            case 39:px = 10; break;
            default: this.fireKeyAction(this.keyPressed);
        }
        if(px != 0 || py !=0){
            this.pan(px,py);
        }
    }
    this.camera.refresh();
};

/**
 * Reacts to the canvas onkeyup event 
 */
vxlTrackerInteractor.prototype.onKeyUp = function(ev){
    if (ev.keyCode == 17){
        this.ctrlPressed = false;
    }
};

/**
 *Reacts to the canvas onmouseup event 
 */
vxlTrackerInteractor.prototype.onMouseUp = function(ev){
	task = vxl.def.interactor.task.NONE;
	this.dragging = false;
};

/**
 *Reacts to the canvas onmousedown event 
 */
vxlTrackerInteractor.prototype.onMouseDown = function(ev){
	this.x             = ev.clientX;
	this.y             = ev.clientY;
	this.lastClikedX   = this.x;
	this.lastClickedY  = this.y;
	this.button        = ev.button;
	this.dragging      = true;
};

/**
 *Reacts to the canvas onmousemove event 
 */
vxlTrackerInteractor.prototype.onMouseMove = function(ev){

	this.lastX         = this.x;
	this.lastY         = this.y;
	this.x             = ev.clientX;
    this.y             = ev.clientY;

	if (!this.dragging) return;
    if (this.button !=0) return;  
	
	this.ctrlPressed 	= ev.ctrlKey;
	
	if (this.isMac && ev.metaKey){
	    this.ctrlPressed = true;
	}
	
	this.altPressed 	= ev.altKey;
	this.shiftPressed 	= ev.shiftKey;
	
	var rx = this.x - this.lastX;
	var ry = this.y - this.lastY;
		 
    if (this.ctrlPressed && !this.shiftPressed){ 
		this.dolly(ry);
	}
	else if (this.shiftPressed && !this.ctrlPressed){
		this.pan(rx,ry);
	}
	else if (this.ctrlPressed && this.shiftPressed){
	    this.roll(ry);
	}
	else {

        this.rotate(rx,ry);
    }
	
	this.camera.refresh();
};


/**
 *  Implements the behaviour of the tracker on the ondragover mouse event
 */
vxlTrackerInteractor.prototype.onDragOver = function(event){
    event.stopPropagation();
    event.preventDefault();
    
        
    if (this.view.dragndrop){
        if (!this.dragndrop){
            this.bgcolor = this.view.backgroundColor.slice(0);
            this.dragndrop = true;
        }
        event.dataTransfer.dropEffect = 'copy';
        this.view.setBackgroundColor(0,0.514,0.678);
    }
};

/**
 * Implements the behaviour of the tracker on the ondragleave mouse event 
 */
vxlTrackerInteractor.prototype.onDragLeave = function(event){
    event.stopPropagation();
    event.preventDefault();

    if (this.view.dragndrop){
        event.dataTransfer.dropEffect = 'copy';
        this.view.setBackgroundColor(this.bgcolor);
        this.dragndrop = false;
    }
    
};

/**
 * Implements the behaviour of the tracker on the ondrop mouse event
 * @TODO: this method only works for VTK ascii files. Review other formats 
 */
vxlTrackerInteractor.prototype.onDrop = function(event){
    event.stopPropagation();
    event.preventDefault();
    if (!this.view.dragndrop) return; //the view is configured to not accept dnd
    this.dragndrop = false;
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
 * Calls the current camera longShot method 
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



/**    this.dragndrop = false;
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
	var scene = camera.view.scene;    this.dragndrop = false;
	var dimMax = Math.max(canvas.width, canvas.height);
	var deltaX = 1 / dimMax;
	var deltaY = 1 / dimMax;
	var max = scene.bb.max();
    var ndx = dx * deltaX * this.MOTION_FACTOR * max / 2;
	var ndy = -dy * deltaY * this.MOTION_FACTOR * max / 2;

	camera.pan(ndx,ndy);
};