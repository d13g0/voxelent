/**
* Camera Interactor
*
* This object listens for mouse and keyboard events on the canvas, then, it interprets them and sends the intended instruction to the camera
*/
function CameraInteractor(camera,canvas){
    
    this.camera = camera;
    this.canvas = canvas;
    this.update();
    
    this.dragging = false;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.button = 0;
    this.ctrl = false;
    this.key = 0;
    
    this.MOTION_FACTOR = 10.0;
    this.dloc = 0;
    this.dstep = 0;
    
}

CameraInteractor.prototype.onMouseUp = function(ev){
    this.dragging = false;
}

CameraInteractor.prototype.onMouseDown = function(ev){
    this.dragging = true;
    this.x = ev.clientX;
	this.y = ev.clientY;
	this.button = ev.button;
	this.dstep = Math.max(this.camera.position[0],this.camera.position[1],this.camera.position[2])/100;
}

CameraInteractor.prototype.onMouseMove = function(ev){
	this.lastX = this.x;
	this.lastY = this.y;
	this.x = ev.clientX;
    this.y = ev.clientY;
	
	if (!this.dragging) return;
	this.ctrl = ev.ctrlKey;
	this.alt = ev.altKey;
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	
	if (this.button == 0) { 
		if(this.ctrl){
			this.dolly(dy);
		}
		else{ 
			this.rotate(dx,dy);
		}
	}
}

CameraInteractor.prototype.onKeyDown = function(ev){
    var c = this.camera;
	
	this.key = ev.keyCode;
	this.ctrl = ev.ctrlKey;
	
	if (!this.ctrl){
		if (this.key == 38){
			c.changeElevation(10);
		}
		else if (this.key == 40){
			c.changeElevation(-10);
		}
		else if (this.key == 37){
			c.changeAzimuth(-10);
		}
		else if (this.key == 39){
			c.changeAzimuth(10);
		}
        else if (this.key == 87) {  //w
            if(fovy) fovy+=5;
            console.info('FovY:'+fovy);
        }
        else if (this.key == 78) { //n
            if(fovy) fovy-=5;
            console.info('FovY:'+fovy);
        }
	}
     
}

CameraInteractor.prototype.onKeyUp = function(ev){
    if (ev.keyCode == 17){
		this.ctrl = false;
	}
}

CameraInteractor.prototype.update = function(){
    var self = this;
	var canvas = this.canvas;
	

	canvas.onmousedown = function(ev) {
		self.onMouseDown(ev);
    }

    canvas.onmouseup = function(ev) {
		self.onMouseUp(ev);
    }
	
	canvas.onmousemove = function(ev) {
		self.onMouseMove(ev);
    }
	
	window.onkeydown = function(ev){
		self.onKeyDown(ev);
	}
	
	window.onkeyup = function(ev){
		self.onKeyUp(ev);
	}
}

CameraInteractor.prototype.dolly = function(value){
 	if (value>0){
 		this.dloc += this.dstep;
 	}
 	else{
 		this.dloc -= this.dstep;
 	}
	this.camera.dolly(this.dloc);
}

CameraInteractor.prototype.rotate = function(dx, dy){
	
	
	var camera = this.camera;
	var canvas = this.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth   = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.changeAzimuth(nAzimuth);
	camera.changeElevation(nElevation);
}