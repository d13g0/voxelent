
var vxl = {};

function vxlCameraState(camera){
	if (!(camera instanceof vxlCamera)) {
		alert('vxlCameraState needs a vxlCamera as argument');
		return null;
	}

	this.c = camera;
	this.position 				= new vxlVector(0,0,1);
	this.focalPoint 			= new vxlVector(0,0,0);
	this.viewUp 				= new vxlVector(0,1,0);
	this.viewRight 				= new vxlVector(1,0,0);
	this.distance 				= 0;
	this.phi 					= 0; 
	this.theta 					= 0; 
	this.xTr 					= 0;
	this.yTr					= 0;
}

vxlCameraState.prototype.reset = function(){
	var c = this.c;
	c.focalPoint 			= new vxlVector(0,0,0);
	c.viewUp 				= new vxlVector(0,1,0);
	c.viewRight 			= new vxlVector(1,0,0);
	c.distance 				= 0;
	c.elevation				= 0; 
	c.azimuth 				= 0; 
	c.xTr 					= 0;
	c.yTr					= 0;
	c.setPosition(0,0,1);
	c.setOptimalDistance();
}

vxlCameraState.prototype.save = function(){
	var c = this.c;
	this.focalPoint.copy(c.focalPoint);
	this.viewUp.copy(c.viewUp);
	this.viewRight.copy(c.viewRight);
	this.distance 	= c.distance;
	this.azimuth 	= c.azimuth;
	this.elevation	= c.elevation;
	this.xTr 		= c.xTr;
	this.yTr		= c.yTr;
	this.position.copy(c.position);
}

vxlCameraState.prototype.retrieve = function(){
	var c = this.c;
	c.focalPoint.copy(this.focalPoint);
	c.viewUp.copy(this.viewUp);
	c.viewRight.copy(this.viewRight);
	c.azimuth 		= this.azimuth;
	c.elevation 	= this.elevation; 
	c.xTr 			= this.xTr;
	c.yTr			= this.yTr;
	c.setPosition(this.position.x,this.position.y,this.position.z);
}

function vxlCamera() {


	this.position 				= new vxlVector(0,0,1);
	this.viewUp 				= new vxlVector(0,1,0);
	this.viewRight 				= new vxlVector(1,0,0);
	this.focalPoint 			= new vxlVector(0,0,0);
	
	this.viewPlaneNormal 		= new vxlVector(0,0,0);

	
	this.transform 				= new vxlMatrix4x4();
	this.viewTransform 			= new vxlMatrix4x4();
	
	this.distance 				= 0;
	this.phi 					= 0; //elevation
	this.theta 					= 0; //azimuth
	this.gamma					= 0; //pan angle
	this.xTr 					= 0;
	this.yTr					= 0;
	this.state 					= new vxlCameraState(this);
	
	this.trFactor = 0; 
	
	

	this.debug = false;
	message('camera created');
}

vxlCamera.prototype.init = function(){
	var c = this;
	c.computeViewTransform();
	c.computeDistance();
	message('camera initialized');
}

vxlCamera.prototype.computeDistance = function(){
	
	var c = this;
	var f_subtract 		= vxl.math.vector.subtract;
	
	
	var d = f_subtract(c.focalPoint, c.position);
	c.distance = Math.sqrt(d.x*d.x + d.y*d.y + d.z*d.z);
	
	
	
	//message(c.focalPoint.toString(1,'fp') + ' distance=' + c.distance);

    if (c.distance < 1e-20) 
    {
		c.distance = 1e-20;
		this.debugMessage(" Distance is set to minimum.");
		var vec = this.viewPlaneNormal;

		// recalculate FocalPoint
		c.focalPoint.x = c.focalPoint.x + vec.x * c.distance;
		c.focalPoint.y = c.focalPoint.y + vec.y * c.distance;
		c.focalPoint.z = c.focalPoint.z + vec.z * c.distance;
    }

  this.viewPlaneNormal.x = d.x / c.distance;
  this.viewPlaneNormal.y = d.y / c.distance;
  this.viewPlaneNormal.z = d.z / c.distance;
}

vxlCamera.prototype.setDistance = function(d){
if (this.distance == d)
    {
    return;
    }

  this.distance = d;

  // Distance should be greater than .0002
  if (this.distance < 0.0002)
    {
    this.distance = 0.0002;
		this.debugMessage(" Distance is set to minimum.");
    }

  // we want to keep the camera pointing in the same direction
  var vec = this.viewPlaneNormal;

	// recalculate FocalPoint
	this.focalPoint.x = this.position.x + vec.x*this.distance;
	this.focalPoint.y = this.position.y + vec.y*this.distance;
	this.focalPoint.z = this.position.z + vec.z*this.distance;

	//this.debugMessage(" Distance set to ( " +  this.distance + ")");

	this.computeViewTransform();
	this.status('setDistance DONE =');
}

/*vxlCamera.prototype.computeViewTransformOld = function(){
	// Build according to Essential Mathematics for Games and Interactive Apps 2008
	// Chapter 2.6.4 - Page 211
	
	// variables
	var c 				= this;
	var m 				= c.transform;
	var f_subtract 		= vxl.math.vector.subtract;
	var f_cross 		= vxl.math.vector.cross;
	var f_dot 			= vxl.math.vector.dot;
	var f_scale 		= vxl.math.vector.scale;
	var f_apply 		= vxl.math.matrix.apply;
	
	this.debugMessage('computing view transform...');
	//1. find the direction of sight
	c.viewPlaneNormal = f_subtract(c.focalPoint, c.position);
	c.viewPlaneNormal.normalize();
	this.debugMessage('ViewTransform: ' + c.viewPlaneNormal.toString(1,'direction of sight'));
	
	//2. orthogonalize view up vector
	// up = up - up.viewPlaneNormal * viewPlaneNormal
	c.viewUp = f_subtract(c.viewUp, f_scale(c.viewPlaneNormal, f_dot(c.viewUp,c.viewPlaneNormal)));
	c.viewUp.normalize();
	this.debugMessage('ViewTransform: ' + c.viewUp.toString(1,'viewUp'));
	
	//3. obtain third vector = side vector
	c.viewRight = f_cross(c.viewPlaneNormal,c.viewUp);
	c.viewRight.normalize();
	this.debugMessage('ViewTransform: ' + c.viewRight.toString(1,'viewRight'));
	//c.viewUp = f_cross(c.viewRight,c.viewPlaneNormal);

	m.identity();
	
	//4. load the transposed rotation matrix
	m.m11 = c.viewRight.x;
	m.m12 = c.viewRight.y;
	m.m13 = c.viewRight.z;
	m.m14 = 0;
	 
	m.m21 = c.viewUp.x;
	m.m22 = c.viewUp.y;
	m.m23 = c.viewUp.z;
	m.m24 = 0;
	 
	m.m31 = -c.viewPlaneNormal.x;
	m.m32 = -c.viewPlaneNormal.y;
	m.m33 = -c.viewPlaneNormal.z;
	m.m34 = 0;
	
	
	//5. transform traslation component
	var eyeinv = f_scale(f_apply(m,c.position),-1);
	m.m41 = eyeinv.x;
	m.m42 = eyeinv.y;
	m.m43 = eyeinv.z;
	m.m44 = 1;
	
	c.viewTransform.load(m);
	c.status('View Transform DONE = ');
}
*/

vxlCamera.prototype.computeViewTransform = function(){
	var c 				= this;
	var m 				= c.transform;
	var f_subtract 		= vxl.math.vector.subtract;
	var f_cross 		= vxl.math.vector.cross;
	var f_dot 			= vxl.math.vector.dot;
	var f_scale 		= vxl.math.vector.scale;
	var f_apply 		= vxl.math.matrix.apply;
	
	this.debugMessage('Computing view transform...');
	//1. find the direction of plane normal
	c.viewPlaneNormal = f_subtract(c.position, c.focalPoint);
	c.viewPlaneNormal.normalize();
	
	this.debugMessage('ViewTransform: ' + c.viewPlaneNormal.toString(1,'view plane normal'));
	
	//2. right vector
	c.viewRight = f_cross(c.viewUp,c.viewPlaneNormal);
	c.viewRight.normalize();
	
	this.debugMessage('ViewTransform: ' + c.viewRight.toString(1,'viewRight'));
	
	
	//3. orthogonalize view up vector
	c.viewUp = f_cross(c.viewPlaneNormal, c.viewRight);
	c.viewUp.normalize();
	
	this.debugMessage('ViewTransform: ' + c.viewUp.toString(1,'viewUp'));
	
	m.identity();
	m.m11 = c.viewRight.x;
	m.m12 = c.viewRight.y;
	m.m13 = c.viewRight.z;
	
	 
	m.m21 = c.viewUp.x;
	m.m22 = c.viewUp.y;
	m.m23 = c.viewUp.z;
	
	 
	m.m31 = c.viewPlaneNormal.x;
	m.m32 = c.viewPlaneNormal.y;
	m.m33 = c.viewPlaneNormal.z;
	
	
	//4. translate position to origin
	var delta = new vxlVector();
	delta.copy(c.position);
	
	delta = f_scale(delta,-1);
	delta.h = 0;
	
	delta = f_apply(m,delta);
	
	m.m14 = delta.x;
	m.m24 = delta.y;
	m.m34 = delta.z;
	m.m44 = 1;
	
	c.viewTransform.load(m);
	c.viewTransform.transpose();
	//c.status('View Transform DONE :');
	
}

vxlCamera.prototype.computeAngles = function(){
		
		var a = new vxlVector(0,0,1);
		var b = new vxlVector(this.position.x, 0, this.position.z); //projection of position on plane xz
		var c = new vxlVector(0,this.position.y, this.position.z); //projection of position on plane yz
		var f_dot = vxl.math.vector.dot;
		var f_norm = vxl.math.vector.norm;
		
		
		b.normalize();
		
		this.theta = Math.acos(f_dot(a,b)/(f_norm(a) * f_norm(b)));
		this.theta = this.theta * 180/Math.PI;
		if (isNaN(this.theta)) this.theta = 0;
		
		this.phi = Math.acos(f_dot(a,c)/ (f_norm(a) * f_norm(c)));
		this.phi = this.phi * 180 /Math.PI;
		if (isNaN(this.phi)) this.phi = 0;
		
		this.debugMessage('Compute Angles: [ elevation(phi):'+this.phi.toFixed(1)+', azimuth(theta):' + this.theta.toFixed(1)+']');
}

vxlCamera.prototype.setPosition = function(x,y,z){
	var c = this;
	if (c.position.x == x &&
		c.position.y == y &&
		c.position.z == z) return;
		
	c.position.load(x,y,z);
	
	this.debugMessage('Set Position: ' + c.position.toString(1,'pos'));	
    c.computeViewTransform();
    c.computeDistance();
	c.computeAngles();
}

vxlCamera.prototype.setFocalPoint = function(x,y,z){

	var c = this;
	if (c.focalPoint.x == x &&
		c.focalPoint.y == y &&
		c.focalPoint.z == z) {this.debugMessage('no changes in focal point');return;}
	
	c.focalPoint.load(x,y,z);
	c.computeViewTransform();
	c.computeDistance();
	this.debugMessage('New Focal Point' + c.focalPoint.toString(1,'focalPoint'));
}

//@working on it
vxlCamera.prototype.pan = function(dx, dy){
	message('dx = ' + dx);
	message('dy = ' + dy);
	var c = this;

	
	c.setPosition(c.position.x + dx*c.viewRight.x,
			      c.position.y + dy*c.viewRight.y,
				  c.position.z);
				  
	c.setFocalPoint(c.focalPoint.x + dx*c.viewRight.x,
					c.focalPoint.y + dy*c.viewRight.y,
					c.focalPoint.z);
	


}

vxlCamera.prototype.dolly = function(value){
	var c = this;
	if (value <= 0.0) return;
	var d = c.distance * value;
	c.setPosition(c.focalPoint.x - d*c.viewPlaneNormal.x,
                  c.focalPoint.y - d*c.viewPlaneNormal.y,
                  c.focalPoint.z - d*c.viewPlaneNormal.z);
}

vxlCamera.prototype.changeAzimuth = function(a){
	var c = this;
	c.azimuth = c.azimuth+a;
	
	c.transform.identity();
	c.transform.translate(c.focalPoint.x, c.focalPoint.y, c.focalPoint.z);
	c.transform.rotate(-a, c.viewUp.x, c.viewUp.y, c.viewUp.z);
	c.transform.translate(-c.focalPoint.x, -c.focalPoint.y, -c.focalPoint.z);
	
	var newpos = c.transform.applyToVector(c.position);
	c.setPosition(newpos.x, newpos.y,newpos.z);
	
}

vxlCamera.prototype.changeElevation = function(e){
	var c = this;
	c.elevation = c.elevation + e;
	
	var axis = new vxlVector(c.viewRight.x, c.viewRight.y, c.viewRight.z); //view sideway
	this.debugMessage('1. change elevation: axis' + axis.toString(1));
	c.transform.identity();
	c.transform.translate(c.focalPoint.x, c.focalPoint.y, c.focalPoint.z);
	c.transform.rotate(e, axis.x, axis.y, axis.z);
	c.transform.translate(-c.focalPoint.x, -c.focalPoint.y, -c.focalPoint.z);

	// now transform position
	var newpos = c.transform.applyToVector(c.position);
	this.debugMessage('2. change elevation: from ' + c.position.toString(1,'pos')+ ' to ' + newpos.toString(1,'new pos'));
	c.setPosition(newpos.x, newpos.y, newpos.z);
}

vxlCamera.prototype.orthogonalizeViewUp = function(){
	/*var c = this;
	c.viewUp.x = c.viewTransform.m21;
	c.viewUp.y = c.viewTransform.m22;
	c.viewUp.z = c.viewTransform.m23;
	c.status('orthogonalizeViewUp');*/
}

vxlCamera.prototype.setOptimalDistance = function(){
	var le = Math.max(vxl.boundingBox[3]-vxl.boundingBox[0], vxl.boundingBox[4]-vxl.boundingBox[1]);
	if (le !=0){
		var d = 1.5* le / (Math.tan(vxl.fovy*Math.PI/180));
		this.setPosition(vxl.centre[0],vxl.centre[1],d);
	}
	this.setFocalPoint(vxl.centre[0],vxl.centre[1],vxl.centre[2]);
}

vxlCamera.prototype.save = function(){
	var c = this;
	c.state.save(this);
	this.debugMessage('Viewpoint saved');
}

vxlCamera.prototype.retrieve = function(){
	var c = this;
	c.state.retrieve();
	this.debugMessage('Viewpoint restored');
}

vxlCamera.prototype.reset = function(){
	var c = this;
	c.state.reset();
	message('camera.reset');
}

vxlCamera.prototype.above = function(){
	var c = this;
	this.elevation = 90;
	this.azimuth = 0;
	this.xTr = 0;
	this.yTr = 0;
	c.viewUp.load(0,0,-1);
	c.viewRight.load(1,0,0);
	c.setPosition(0,c.distance,0);
	message('camera.reset');
}

vxlCamera.prototype.below = function(){
	var c = this;
	this.elevation = -90;
	this.azimuth = 0;
	this.xTr = 0;
	this.yTr = 0;
	c.viewUp.load(0,0,1);
	c.viewRight.load(1,0,0);
	c.setPosition(0,-c.distance,0);
	message('camera.reset');
}

vxlCamera.prototype.right = function(){
	var c = this;
	this.elevation = 0;
	this.azimuth = -90;
	this.xTr = 0;
	this.yTr = 0;
	c.viewUp.load(0,1,0);
	c.viewRight.load(0,0,1);
	c.setPosition(-c.distance,0,0);
	message('camera.reset');
}

vxlCamera.prototype.left = function(){
	var c = this;
	this.elevation = 0;
	this.azimuth = 90;
	this.xTr = 0;
	this.yTr = 0;
	c.viewUp.load(0,1,0);
	c.viewRight.load(0,0,1);
	c.setPosition(c.distance,0,0);
	message('camera.reset');
}


vxlCamera.prototype.moveTo = function(x,y,z){
}

vxlCamera.prototype.status = function(v){
	var c = this;
	var p = 1;
	message(v+' ' + c.position.toString(p,'pos') + ' ' +	c.focalPoint.toString(p,'focalPoint') + ' ' +'distance: ' + c.distance.toFixed(p));
	message(c.viewUp.toString(p,'viewUp') + ' ' + c.viewRight.toString(p,'viewRight') + ' ' + 	'[ elevation:'+c.elevation.toFixed(p)+', azimuth:' + c.azimuth.toFixed(p)+']');

}

vxlCamera.prototype.debugMessage = function(v){
	if (this.debug){
		message(v);
	}
}


function vxlCanvasListener(){

	var c = this;
	
	var canvas = null;
	this.interactor = null;
	
	this.x = 0;
	this.y = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.ctrlKey = false;
	this.keyPressed = 0;
	this.button = -1;
	this.dragging = false;
}

vxlCanvasListener.prototype.setInteractor = function(interactor){
	this.interactor = interactor;
}

vxlCanvasListener.prototype.setCanvas = function(canvas){
	this.canvas = canvas;
	var c = this;
	
	canvas.onmousedown = function(ev) {
        c.x = ev.clientX;
        c.y = ev.clientY;
		c.lastX = ev.clientX;
		c.lastY = ev.clientY;
        c.button = ev.button;
        c.dragging = true;
		if (c.interactor != null){
			c.interactor.onMouseDown(c);
		}
    };

    canvas.onmouseup = function(ev) {
		c.dragging = false;
		if (c.interactor != null){
			c.interactor.onMouseUp(c);
		}
    };
	
	canvas.onmousemove = function(ev) {
		c.ctrlKey = ev.ctrlKey;
		c.x = ev.clientX;
		c.y = ev.clientY;
		
		if (c.interactor != null){
				c.interactor.onMouseMove(c);
		}       
		
		c.lastX = ev.clientX;
        c.lastY = ev.clientY; 
    };
	
	window.onkeydown = function(ev){
		c.keyPressed = ev.keyCode;
		c.interactor.onKeyDown(c);
		c.keyPressed = 0;
	}
	
}

//@NOTE: It allows to decouple listening from interaction behaviour

vxl.cameratask = {};
vxl.cameratask.TASK_NONE = 0;
vxl.cameratask.TASK_PAN = 1
vxl.cameratask.TASK_ROTATE = 2
vxl.cameratask.TASK_DOLLY = 3

function vxlTrackballCameraInteractor(){
	this.camera = null;
	this.MOTION_FACTOR = 10.0;
	this.task = vxl.cameratask.TASK_NONE;

}

vxlTrackballCameraInteractor.prototype.setCamera = function(camera){
	this.camera = camera;
}

vxlTrackballCameraInteractor.prototype.onMouseUp = function(c){
	var task = this.task;
	var c = this.camera;
	
	if (task == vxl.cameratask.TASK_PAN){
			message('New Focal Point : ' + c.focalPoint.toString(1,'focalPoint'));
	}
	
	task = vxl.cameratask.TASK_NONE;
	
}

vxlTrackballCameraInteractor.prototype.onMouseDown = function(c){
	this.lastClickedX = c.x;
	this.lastClickedY = c.y;
}

vxlTrackballCameraInteractor.prototype.onMouseMove = function(c){
	if (this.camera == null) return;
	
	if (!c.dragging) return;
	
	var dx = c.x - c.lastX;
	var dy = c.y - c.lastY;
	
	if (c.button == 0) { 
		if(c.ctrlKey){
			this.dolly(dy);
		}
		else{ 
			this.rotate(dx,dy);
		}
	}
	else if (c.button == 1) {
		var dxm = c.x - this.lastClickedX;
		var dym = c.y - this.lastClickedY;
		this.pan(dxm,dym);
	}
}

vxlTrackballCameraInteractor.prototype.onKeyDown = function(c){
	var camera = this.camera;
	if (c.keyPressed == 38){
		camera.changeElevation(10);
		camera.status('elevation up');
	}
	else if (c.keyPressed == 40){
		camera.changeElevation(-10);
		camera.status('elevation down');
	}
	else if (c.keyPressed == 37){
		camera.changeAzimuth(-10);
		camera.status('azimuth left');
	}
	else if (c.keyPressed == 39){
		camera.changeAzimuth(10);
		camera.status('azimuth right');
	}
}

vxlTrackballCameraInteractor.prototype.dolly = function(value){
	this.task = vxl.cameratask.TASK_DOLLY;
	var camera = this.camera;
	var dv = 2 * this.MOTION_FACTOR * value / canvas.height;
	
	camera.dolly(Math.pow(1.1,dv));
	

	drawScene();
	
}

vxlTrackballCameraInteractor.prototype.rotate = function(dx, dy){
	this.task = vxl.cameratask.TASK_ROTATE;
	var camera = this.camera;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.changeAzimuth(nAzimuth);
	camera.changeElevation(nElevation);
	camera.orthogonalizeViewUp();

	drawScene();
	
}

vxlTrackballCameraInteractor.prototype.pan = function(dx,dy){
	this.task = vxl.cameratask.TASK_PAN;
	var camera = this.camera;
	
	var deltaX = -1.0 / canvas.width;
	var deltaY = -1.0 / canvas.height;
				
	var ndx = dx * deltaX; //* this.MOTION_FACTOR;
	var ndy = dy * deltaY; //* this.MOTION_FACTOR;
	
	camera.pan(ndx,ndy);
	
	drawScene();
	
}
