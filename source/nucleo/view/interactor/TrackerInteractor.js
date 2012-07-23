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
 * @class
 * @constructor
 * Interprets mouse and keyboard events and translate them to camera actions
 */
function vxlTrackerInteractor(view,camera){
    vxlViewInteractor.call(this, view, camera);    
	this.MOTION_FACTOR = 10.0;
	this.task = vxl.def.camera.task.NONE;
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
	this.dloc = 0;
};

vxlTrackerInteractor.prototype.getType = function(){
    return "vxlTrackerInteractor";
};

vxlTrackerInteractor.prototype.onMouseUp = function(ev){
	task = vxl.def.camera.task.NONE;
	this.camera.clear();
	this.dragging = false;
};

vxlTrackerInteractor.prototype.onMouseDown = function(ev){
	this.x             = ev.clientX;
	this.y             = ev.clientY;
	this.lastClikedX   = this.x;
	this.lastclickedY  = this.y;
	this.button        = ev.button;
	this.dragging      = true;
};

vxlTrackerInteractor.prototype.onMouseMove = function(ev){

	this.lastX         = this.x;
	this.lastY         = this.y;
	
	this.x             = ev.clientX;
    this.y             = ev.clientY;
	

	if (!this.dragging) return;
	
	
	this.ctrlPressed 	= ev.ctrlKey;
	this.altPressed 	= ev.altKey;
	this.shiftPressed 	= ev.shiftKey;
	
	
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	
	if (this.button == 0) { 
	    if (this.altPressed){ 
			this.dolly(dy);
		}
		else if (this.shiftPressed){
			this.pan(dx,dy);
		}
		else{
		    this.rotate(dx,dy);
		}
	}

};


vxlTrackerInteractor.prototype.onKeyUp = function(ev){
    if (ev.keyCode == 17){
        this.ctrlPressed = false;
    }
    
    this.camera.clear();
};

vxlTrackerInteractor.prototype.onKeyDown = function(ev){
	var camera = this.camera;
	
	this.keyPressed = ev.keyCode;
	this.altPressed = ev.altKey;
	this.shiftPressed = ev.shiftKey;
	
	if (!this.altPressed && !this.shiftPressed){
		if (this.keyPressed == 38){
			camera.setElevation(10);
			
		}
		else if (this.keyPressed == 40){
			camera.setElevation(-10);
			
		}
		else if (this.keyPressed == 37){
			camera.setAzimuth(-10);
			
		}
		else if (this.keyPressed == 39){
			camera.setAzimuth(10);
			
		}
		//just to try picking. later on do it better
		//else if (this.keyPressed = 80) {
			//this.picking =!camera.view.actorManager.picking;
			//camera.view.actorManager.setPicking(this.picking);
			
		//}
	}
	else if(this.shiftPressed && this.keyPressed !=17) {
		var px = 0;
		var py = 0;
		vxl.go.console(ev);
		if (this.keyPressed == 38){
			py = 10;
		}
		else if (this.keyPressed == 40){
			py = -10;
		}
		else if (this.keyPressed == 37){
			px = -10;
		}
		else if (this.keyPressed == 39){
			px = 10;
		}
		if(px != 0 || py !=0){
			this.pan(px,py);
		}
	}
	camera.refresh();
};



/**
 * Internal method used by this tracker to perform dollying
 * @param {Number} value the number of dollying steps
 */
vxlTrackerInteractor.prototype.dolly = function(value){
	this.task = vxl.def.camera.task.DOLLY;
    if (value>0){
        this.dloc += Math.abs(value);
    }
    else{
        this.dloc -= Math.abs(value);
    }
    this.camera.dolly(value);
	this.camera.refresh();
};

/**
 * Internal method used by this tracker to rotate the camera.
 * @param {Number} dx the rotation on the X axis (elevation)
 * @param {Number} dy the rotation on the Y axis (azimuth)
 */
vxlTrackerInteractor.prototype.rotate = function(dx, dy){
	this.task = vxl.def.camera.task.ROTATE;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera._rotate(nAzimuth,nElevation);
	camera.refresh();
	
};

vxlTrackerInteractor.prototype.pan = function(dx,dy){
	this.task = vxl.def.camera.task.PAN;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	var scene = camera.view.scene;
	
	var dimMax = Math.max(canvas.width, canvas.height);
	
	var deltaX = 1 / dimMax;
	var deltaY = 1 / dimMax;
				
	var ndx = dx * deltaX * this.MOTION_FACTOR * scene.bb.max();
	var ndy = dy * deltaY * this.MOTION_FACTOR * scene.bb.max();

	camera.pan(ndx,ndy);
	camera.refresh();
	
};

