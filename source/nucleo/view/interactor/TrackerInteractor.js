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
	//Only for debug purposes
	/*var task = this.task;
	var c = this.camera;
	if (task == vxl.def.camera.task.PAN){
			vxl.go.console('Trackball Camera INteractor: New Focal Point : ' + c.focalPoint.toString(1,'focalPoint'));
	}*/
	
	task = vxl.def.camera.task.NONE;
	
	this.dragging = false;
};

vxlTrackerInteractor.prototype.onMouseDown = function(ev){
	this.x = ev.clientX;
	this.y = ev.clientY;
	this.dragging = true;
	this.button = ev.button;
	//@TODO: This is a hack. Find a nice way to calculate this step parameter for dollying
	this.dstep = Math.max(this.camera.position[0],this.camera.position[1],this.camera.position[2])/100;
};

vxlTrackerInteractor.prototype.onMouseMove = function(ev){

	this.lastX = this.x;
	this.lastY = this.y;
	
	this.x = ev.clientX;
    this.y = ev.clientY;
	

	if (!this.dragging) return;
	
	
	this.ctrlPressed = ev.ctrlKey;
	this.altPressed = ev.altKey;
	
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	
	if (this.button == 0) { 
		if(this.altPressed){
			this.dolly(dy);
		}
		else{ 
			this.rotate(dx,dy);
		}
	}

	this.lastX = this.x;
    this.lastY = this.y; 

};

vxlTrackerInteractor.prototype.onKeyDown = function(ev){
	var camera = this.camera;
	
	this.keyPressed = ev.keyCode;
	this.altPressed = ev.altKey;
	
	if (!this.altPressed){
		if (this.keyPressed == 38){
			camera.changeElevation(10);
			camera.status('elevation up');
		}
		else if (this.keyPressed == 40){
			camera.changeElevation(-10);
			camera.status('elevation down');
		}
		else if (this.keyPressed == 37){
			camera.changeAzimuth(-10);
			camera.status('azimuth left');
		}
		else if (this.keyPressed == 39){
			camera.changeAzimuth(10);
			camera.status('azimuth right');
		}
		//just to try picking. later on do it better
		//else if (this.keyPressed = 80) {
			//this.picking =!camera.view.actorManager.picking;
			//camera.view.actorManager.setPicking(this.picking);
			
		//}
	}
	else if(this.altPressed && this.keyPressed !=17) {
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
};

vxlTrackerInteractor.prototype.onKeyUp = function(ev){
	if (ev.keyCode == 17){
		this.ctrlPressed = false;
	}
};

vxlTrackerInteractor.prototype.dolly = function(value){
	this.task = vxl.def.camera.task.DOLLY;
if (value>0){
        this.dloc += this.dstep;
    }
    else{
        this.dloc -= this.dstep;
    }
    this.camera.dolly(this.dloc);
	this.camera.refresh();

};

vxlTrackerInteractor.prototype.rotate = function(dx, dy){
	this.task = vxl.def.camera.task.ROTATE;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.changeAzimuth(nAzimuth);
	camera.changeElevation(nElevation);
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

