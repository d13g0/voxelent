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
    this.FOV        = 30;
    this.Z_NEAR     = 0.1;    
    this.Z_FAR      = 10000;     
    
	
   
	
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
    if (t != vxl.def.camera.type.ORBITING && t != vxl.def.camera.type.TRACKING) {
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
 * Sets the distance from the current focal point
 * @param {Number} d 
 * @TODO: REVIEW AND IMPLEMENT
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


/**
 * Sets the camera position in the scene
 * @param {Array} p the position
 */
vxlCamera.prototype.setPosition = function(p) {
	
    vxl.vec3.set(vxl.vec3.create(p), this.position);
    this.update();
	this.debugMessage('Camera: Updated position: ' + this.position.toString(1));
};

/**
 * Sets the focus point of the camera
 * @param {Array} f the focus point
 */
vxlCamera.prototype.setFocus = function(f){
	vxl.vec3.set(vxl.vec3.create(f), this.focus);
	this.update();
	this.debugMessage('Camera: Updated focus: ' + this.focus.toString(1));
};


vxlCamera.prototype.pan = function(dx, dy) {
	vxl.go.console('Camera: pan called');
	/*@TODO: Review buggy*/
	/*message('dx = ' + dx);
	message('dy = ' + dy);
	var c = this;
	c.setPosition(c.position.x + dx * c.right.x, c.position.y + dy * c.up.y, c.position.z);
	c.setFocalPoint(c.focalPoint.x + dx * c.right.x, c.focalPoint.y + dy * c.up.y, c.focalPoint.z);*/

};

vxlCamera.prototype.dolly = function(value) {
    var c = this;
    
    var p =  vxl.vec3.create();
    var n =  vxl.vec3.create();
    
    p = c.position;
    
    var step = value - c.steps;
    
    vxl.vec3.normalize(c.normal,n);
    
    var newPosition = vxl.vec3.create();
    
    if(c.type == vxl.def.camera.type.TRACKING){
        newPosition.x = p.x - step*n.x;
        newPosition.y = p.y - step*n.y;
        newPosition.z = p.z - step*n.z;
    }
    else{
        newPosition.x = p.x;
        newPosition.y = p.y;
        newPosition.z = p.z - step; 
    }
    
    c.setPosition([newPosition.x, newPosition.y, newPosition.z]); //@TODO: fix this syntax ambivalence
    c.steps = value;
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
};

/**
 * Inverts the camera mattrix to obtain the correspondent Model-View Transform
 * @returns {vxlMatrix4x4} m the Model-View Transform
 */
vxlCamera.prototype.getViewTransform = function(){
    var m = new vxlMatrix4x4();
    vxl.mat4.set(this.matrix, m);
    vxl.mat4.inverse(m);
    return m;
};

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
		var distance = 1.5 * maxDim / (Math.tan(this.FOV * Math.PI / 180));
		this.setPosition([centre[0], centre[1], centre[2]+ distance]);
	}
	
	this.setFocus(centre);
};

/**
 * The camera moves to a position where all the actors in the scene are viewed. The actors
 * are seen in full within their surrounding environment.
 * 
 * A long shot uses the global bounding box of the view's scene
 */
vxlCamera.prototype.longShot = function() {
	this.shot(this.view.scene.bb);
};

/**
 * Saves the current camera state in a memento (vxlCameraState)
 * @see vxlCameraState
 */
vxlCamera.prototype.save = function() {
	var c = this;
	c.state.save(this);
	this.debugMessage('Viewpoint saved');
};

/**
 * Retrieves the last saved camera state from the memento (vxlCameraState)
 * @see vxlCameraState
 */
vxlCamera.prototype.retrieve = function() {
	var c = this;
	c.state.retrieve();
	this.debugMessage('Viewpoint restored');
};

/**
 * Resets the memento to the original camera state
 */
vxlCamera.prototype.reset = function() {
	var c = this;
	c.state.reset();
	vxl.go.console('Camera: reset');
};


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
};

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
};

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
};

vxlCamera.prototype.debugMessage = function(v) {
	if(this.debug) {
		vxl.go.console(v);
	}
};


vxlCamera.prototype.status = function(v) {
	var c = this;
	var p = 1;
	vxl.go.console('Camera:'+v+' ' + c.position.toString(p,'pos') + ' ' +	c.focus.toString(p,'focalPoint') + ' ' +'distance: ' + c.distance.toFixed(p));
	vxl.go.console(c.up.toString(p,'up') + ' ' + c.right.toString(p,'right') + ' ' + 	'[ elevation:'+c.elevation.toFixed(p)+', azimuth:' + c.azimuth.toFixed(p)+']');

};
