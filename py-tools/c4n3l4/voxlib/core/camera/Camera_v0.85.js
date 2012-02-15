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
 * @TODO: find a way to avoid hardcoding known locations up, left, right, down, etc.. maybe
 * put them into the camera interactor?
 */

/**
 * 
 * A vxlCamera object simplifies WebGL programming by providing a simple object interface to the lower level
 * matrix manipulations that are required to view a 3D scene.
 * 
 * When moving and rotating the camera, such matrices are updated and Voxelent's Nucleo will use this information
 * in order to draw the scene accordingly to the camera position an orientation.
 * 
 * A vxlCamera object requires a vxlView to be created. Having said that, a vxlView can be associated with 
 * multiple cameras.
 * 
 * @class
 * @constructor Creates a vxlCamera. 
 * @param {vxlView} vw
 * @param {Object} t the type of camera 
 * @author Diego Cantor
 */
function vxlCamera(vw,t) {

	this.view 		= vw;
    this.matrix 	= new vxlMatrix4x4();
    this.up 		= vxl.vec3.create([0, 1, 0]);
	this.right 		= vxl.vec3.create([1, 0, 0]);
	this.normal 	= vxl.vec3.create([0, 0, 0]);
    this.position 	= vxl.vec3.create([0, 0, 1]);
    this.focus		= vxl.vec3.create([0, 0, 0]);
    this.azimuth 	= 0;
    this.elevation 	= 0;
	this.steps		= 0;
    this.home 		= vxl.vec3.create([0,0,0]);
    this.id         = 0;
	
   
	
	if (t != undefined && t !=null){
        this.type = t;
    }
    else {
        this.type = vxl.def.camera.type.ORBITING;
    }
    

	this.distance = 0;
	this.debug = false;

};


/**
 * Establishes the type of camera
 * @param {vxl.def.camera.type} t
 */
vxlCamera.prototype.setType = function(t){
    if (t != vx.def.camera.type.ORBITING && t != vxl.def.camera.type.TRACKING) {
        alert('Wrong Camera Type!. Setting Orbitting type by default');
        this.type = vxl.def.camera.type.ORBITING;
    }
    else{
        this.type = t;
    }
};

/**
 *	Initializes the camera 
 */
vxlCamera.prototype.init = function() {
	var c = this;
	this.goHome([0,0,1]);
	this.setFocus([0,0,0]);
	vxl.mat4.identity(this.matrix);
};

/**
 * Sends the camera home. Wherever that home is.
 * @param {Array} h home
 */
vxlCamera.prototype.goHome = function(h){
    if (h != null){
        this.home = vxl.vec3.create(h);
    }
    this.setPosition(h);
    this.setAzimuth(0);
    this.setElevation(0);
    this.steps = 0;
};



/**
 * Calculates the distance to the current focal point
 */
vxlCamera.prototype.computeDistance = function() {
	vxl.go.console('compute distance called');
	/*var c = this;

	var d = vxl.vec3.subtract(c.focalPoint, c.position);
	c.distance = vxl.vec3.length(d);

	//vxl.go.console(c.focalPoint.toString(1,'fp') + ' distance=' + c.distance);

	if(c.distance < 1e-20) {
		c.distance = 1e-20;
		this.debugMessage(" Distance is set to minimum.");
		var vec = this.normal;

		// recalculate FocalPoint
		c.focalPoint.x = c.focalPoint.x + vec.x * c.distance;
		c.focalPoint.y = c.focalPoint.y + vec.y * c.distance;
		c.focalPoint.z = c.focalPoint.z + vec.z * c.distance;
	}

	this.normal.x = d.x / c.distance;
	this.normal.y = d.y / c.distance;
	this.normal.z = d.z / c.distance;*/
};

/**
 * Sets the distance from the current focal point
 * @param {Number} d 
 */
vxlCamera.prototype.setDistance = function(d) {
	vxl.go.console('set distance called');
	/*if(this.distance == d) {
		return;
	}

	this.distance = d;

	// Distance should be greater than .0002
	if(this.distance < 0.0002) {
		this.distance = 0.0002;
		this.debugMessage(" Distance is set to minimum.");
	}

	// we want to keep the camera pointing in the same direction
	var vec = this.normal;

	// recalculate FocalPoint
	this.focalPoint.x = this.position.x + vec.x * this.distance;
	this.focalPoint.y = this.position.y + vec.y * this.distance;
	this.focalPoint.z = this.position.z + vec.z * this.distance;

	//this.debugMessage(" Distance set to ( " +  this.distance + ")");

	this.computeViewTransform();
	this.status('setDistance DONE =');*/
};

vxlCamera.prototype.computeViewTransform = function() {
	vxl.go.console('compute view transform called');
	/*var c = this;
    this.update();*/
	/*var m = c.transform;

	
	//1. find the direction of plane normal
	c.normal = vxl.vec3.subtract(c.position, c.focalPoint);
	vxl.vec3.normalize(c.normal);


	//2. right vector
	c.right = vxl.vec3.cross(c.up, c.normal);
	vxl.vec3.normalize(c.right);


	//3. orthogonalize view up vector
	c.up = vxl.vec3.cross(c.normal, c.right);
	vxl.vec3.normalize(c.up);


	vxl.mat4.identity(m);
	m.m11 = c.right.x;
	m.m12 = c.right.y;
	m.m13 = c.right.z;

	m.m21 = c.up.x;
	m.m22 = c.up.y;
	m.m23 = c.up.z;

	m.m31 = c.normal.x;
	m.m32 = c.normal.y;
	m.m33 = c.normal.z;

	//4. translate position to origin
	var delta = new vxlVector4(-c.position.x, -c.position.y, -c.position.z, 0);
	delta = vxl.mat4.multVec4(m, delta);
	m.m14 = delta.x;
	m.m24 = delta.y;
	m.m34 = delta.z;
	m.m44 = 1;

	vxl.mat4.set(m, c.viewTransform);
	vxl.mat4.transpose(c.viewTransform);*/
    
};

/**
 * Sets the camera position in the scene
 * @param {Array} p the position
 */
vxlCamera.prototype.setPosition = function(p) {
	
    vxl.vec3.set(vxl.vec3.create(p), this.position);
    this.update();
	this.debugMessage('vxlCamera: Updated position: ' + this.position.toString(1));
};

/**
 * Sets the focus point of the camera
 * @param {Array} f the focus point
 */
vxlCamera.prototype.setFocus = function(f){
	vxl.vec3.set(vxl.vec3.create(f), this.focus);
	this.update();
	this.debugMessage('vxlCamera: Updated focus: ' + this.focus.toString(1));
};


vxlCamera.prototype.pan = function(dx, dy) {
	vxl.go.console(' pan called');
	/*@TODO: Review buggy*/
	/*message('dx = ' + dx);
	message('dy = ' + dy);
	var c = this;
	c.setPosition(c.position.x + dx * c.right.x, c.position.y + dy * c.up.y, c.position.z);
	c.setFocalPoint(c.focalPoint.x + dx * c.right.x, c.focalPoint.y + dy * c.up.y, c.focalPoint.z);*/

}

vxlCamera.prototype.dolly = function(value) {
	vxl.go.console(' dolly called');
	/*var c = this;
	if(value <= 0.0)
		return;
	var d = c.distance * value;
	c.setPosition(c.focalPoint.x - d * c.normal.x, c.focalPoint.y - d * c.normal.y, c.focalPoint.z - d * c.normal.z);*/
};

/**
 * Sets the azimuth of the camera
 * @param {Number} az the azimuth in degrees
 */
vxlCamera.prototype.setAzimuth = function(az){
    this.changeAzimuth(az - this.azimuth);
};

/**
 * Changes the azimuth of the camera
 * @param {Number} az the relative increment in degrees
 */
vxlCamera.prototype.changeAzimuth = function(az){
    var c = this;
    c.azimuth +=az;
    
    if (c.azimuth > 360 || c.azimuth <-360) {
		c.azimuth = c.azimuth % 360;
	}
    c.update();
};

/**
 * Sets the elevation of the camera
 * @param {Number} el the elevation value in degrees
 */
vxlCamera.prototype.setElevation = function(el){
    this.changeElevation(el - this.elevation);
};

/**
 * Changes the elevation of the camera
 * @param {Number} el the relative elevation increment in degrees
 */
vxlCamera.prototype.changeElevation = function(el){

    var c = this;
    
    c.elevation +=el;
    
    if (c.elevation > 360 || c.elevation <-360) {
		c.elevation = c.elevation % 360;
	}
    c.update();
};

/**
 * Updates the x,y and z axis of the camera according to the current camera matrix.
 * This is useful when one needs to know the values of the axis and operate with them directly.
 * Such is the case for zooming, where you need to know what is the normal axis to move
 * along it for dollying or zooming.
 */
vxlCamera.prototype.computeAxis = function(){
	var m       = this.matrix;
    this.right  = vxl.mat4.multVec3(m, [1, 0, 0]);
    this.up     = vxl.mat4.multVec3(m, [0, 1, 0]);
    this.normal = vxl.mat4.multVec3(m, [0, 0, 1]);
};

/**
 * This method updates the current camera matrix upon changes in location, 
 * and rotation (azimuth, elevation)
 */
vxlCamera.prototype.update = function(){
	vxl.mat4.identity(this.matrix);
	
	this.computeAxis();
    
    if (this.type == vxl.def.camera.type.TRACKING){
        vxl.mat4.translate(this.matrix, this.position);
        vxl.mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        vxl.mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
    }
    else {
        var trxLook = new vxlMatrix4x4();
        vxl.mat4.translate(this.matrix, this.focus);
        vxl.mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        vxl.mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
        vxl.mat4.translate(this.matrix, vxl.vec3.negate(this.focus));
        vxl.mat4.translate(this.matrix,this.position);
        //mat4.lookAt(this.position, this.focus, this.up, trxLook);
        //mat4.inverse(trxLook);
        //mat4.multiply(this.matrix,trxLook);
    }

    this.computeAxis();
    
    /**
    * We only update the position if we have a tracking camera.
    * For an orbiting camera we do not update the position. If
    * you don't believe me, go ahead and comment the if clause...
    * Why do you think we do not update the position?
    */
    if(this.type == vxl.def.camera.type.TRACKING){
        vxl.mat4.multVec4(this.matrix, new vxlVector4(0, 0, 0, 1), this.position);
    }
    
    
    
    this.debugMessage('------------- update -------------');
    this.debugMessage(' right: ' + this.right.toString(2)+', up: ' + this.up.toString(2)+', normal: ' + this.normal.toString(2));
    this.debugMessage('   pos: ' + this.position.toString(2));
    this.debugMessage('   azimuth: ' + this.azimuth +', elevation: '+ this.elevation);
}

/**
 * Inverts the camera mattrix to obtain the correspondent Model-View Transform
 * @returns {vxlMatrix4x4} m the Model-View Transform
 */
vxlCamera.prototype.getViewTransform = function(){
    var m = new vxlMatrix4x4();
    vxl.mat4.set(this.matrix, m);
    vxl.mat4.inverse(m);
    return m;
}

/**
 * This method updates the 3D scene
 * This is the call stack:
 * vxlCamera.refresh -> vxlView.refresh -> vxlRenderer.render
 */
vxlCamera.prototype.refresh = function() {
	this.view.refresh();
};

/**
 * This method sets the camera to a distance such that the area covered by the bounding box (parameter)
 * is viewed.
 * @param {vxlBoundingBox} bb the bounding box
 */
vxlCamera.prototype.shot = function(bb){
	var maxDim = Math.max(bb[3] - bb[0], bb[4] - bb[1]);
	var centre = this.view.scene.centre;
	
	if(maxDim != 0) {
		var distance = 1.5 * maxDim / (Math.tan(this.view.fovy * Math.PI / 180));
		this.setPosition([centre[0], centre[1], centre[2]+ distance]);
	}
	
	this.setFocus(centre);
}

/**
 * The camera moves to a position where all the actors in the scene are viewed. The actors
 * are seen in full within their surrounding environment.
 * 
 * A long shot uses the global bounding box of the view's scene
 */
vxlCamera.prototype.longShot = function() {
	this.shot(this.view.scene.bb);
}

/**
 * Saves the current camera state in a memento (vxlCameraState)
 * @see vxlCameraState
 */
vxlCamera.prototype.save = function() {
	var c = this;
	c.state.save(this);
	this.debugMessage('Viewpoint saved');
}

/**
 * Retrieves the last saved camera state from the memento (vxlCameraState)
 * @see vxlCameraState
 */
vxlCamera.prototype.retrieve = function() {
	var c = this;
	c.state.retrieve();
	this.debugMessage('Viewpoint restored');
}

/**
 * Resets the memento to the original camera state
 */
vxlCamera.prototype.reset = function() {
	var c = this;
	c.state.reset();
	vxl.go.console('Camera: reset');
}


vxlCamera.prototype.above = function() {
	var c = this;
	this.elevation = 90;
	this.azimuth = 0;
	this.xTr = 0;
	this.yTr = 0;
	vxl.vec3.set([0, 0, -1], c.up);
	vxl.vec3.set([1, 0, 0], c.right);
	c.setPosition(0, c.distance, 0);
	vxl.go.console('Camera: above');
};

vxlCamera.prototype.below = function() {
	var c = this;
	this.elevation = -90;
	this.azimuth = 0;
	this.xTr = 0;
	this.yTr = 0;
	vxl.vec3.set([0, 0, 1], c.up);
	vxl.vec3.set([1, 0, 0], c.right);
	c.setPosition(0, -c.distance, 0);
	vxl.go.console('Camera: below');
}

vxlCamera.prototype.right = function() {
	var c = this;
	this.elevation = 0;
	this.azimuth = -90;
	this.xTr = 0;
	this.yTr = 0;
	vxl.vec3.set([0, 1, 0], c.up);
	vxl.vec3.set([0, 0, 1], c.right);
	c.setPosition(-c.distance, 0, 0);
	vxl.go.console('Camera: right');
}

vxlCamera.prototype.left = function() {
	var c = this;
	this.elevation = 0;
	this.azimuth = 90;
	this.xTr = 0;
	this.yTr = 0;
	vxl.vec3.set([0, 1, 0], c.up);
	vxl.vec3.set([0, 0, 1], c.right);
	c.setPosition(c.distance, 0, 0);
	vxl.go.console('Camera: left');
}

vxlCamera.prototype.debugMessage = function(v) {
	if(this.debug) {
		vxl.go.console(v);
	}
};

/* -----------------------------------------------------------------------
vxlCamera.prototype.spin = function() {
	this.spining = !this.spining;
	if(this.spining) {
		this.spinTimerID = setInterval((function(self) {
			return function() {
				self.spinABit();
			}
		})(this), 50);
		this.changeElevation(30);
	} else {
		clearInterval(this.spinTimerID);
		this.changeElevation(-this.elevation);
		this.changeAzimuth(-this.azimuth);
	}
}

vxlCamera.prototype.spinABit = function() {
	this.changeElevation(-30);
	this.changeAzimuth(this.spinSpeed);
	this.changeElevation(30);
}

vxlCamera.prototype.moveTo = function(x, y, z) {
}

vxlCamera.prototype.status = function(v) {
	var c = this;
	var p = 1;
	//message(v+' ' + c.position.toString(p,'pos') + ' ' +	c.focalPoint.toString(p,'focalPoint') + ' ' +'distance: ' + c.distance.toFixed(p));
	//message(c.up.toString(p,'up') + ' ' + c.right.toString(p,'right') + ' ' + 	'[ elevation:'+c.elevation.toFixed(p)+', azimuth:' + c.azimuth.toFixed(p)+']');

};*/

