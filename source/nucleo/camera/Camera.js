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
    this.matrix 	= mat4.identity();
    this.up 		= vec3.createFrom(0, 1, 0);
	this.right 		= vec3.createFrom(1, 0, 0);
	this.normal 	= vec3.createFrom(0, 0, 0);
    this.position 	= vec3.createFrom(0, 0, 1);
    this.focus		= vec3.createFrom(0, 0, 0);
    this.azimuth 	= 0;
    this.elevation 	= 0;
	this.steps		= 0;
    this.home 		= vec3.createFrom(0,0,0);
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
    
	this.distance 	= 0;
	this.debug 		= false;
	this.state 	    = new vxlCameraState(this);
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
 * Sends the camera home. Wherever that home is.
 * @param {Number, Array} x it can be a number or an array containing three numbers
 * @param {Number} y if x is a number, this parameter contains the y coordinate
 * @param {Number} z if x is a number, this parameter contains the z coordinate
 */
vxlCamera.prototype.goHome = function(x,y,z){
    if (x != null){
        if (x instanceof Array){
			vec3.set(vec3.create(x), this.home)
		}
		else if (x instanceof determineMatrixArrayType()){
			vec3.set(x, this.home)
		}
		else{
    		vec3.set(vec3.createFrom(x,y,z), this.home);
   		}
    }
    
    this.setPosition(this.home);
	this.setAzimuth(0);
    this.setElevation(0);
    this.steps = 0;
};

/**
 *	Initializes the camera 
 */
vxlCamera.prototype.init = function() {
	var c = this;
	c.goHome(0,0,1);
	c.setFocus(0,0,0);
	mat4.identity(this.matrix);
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
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's position.
 * 
 * x could be an Array[3] or a glMatrix vec3 too. In this case the y, and z parameters
 * are discarded.
 */
vxlCamera.prototype.setPosition = function(x,y,z) {
	
	if (x instanceof Array){
		vec3.set(vec3.create(x), this.position)
	}
	else if (x instanceof determineMatrixArrayType()){
		vec3.set(x, this.position)
	}
	else{
    	vec3.set(vec3.createFrom(x,y,z), this.position);
   	}
    this.update();
	this.debugMessage('Camera: Updated position: ' + this.position.toString(1));
};

/**
 * Sets the focus point of the camera
 * 
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's focus.
 * 
 * x could be an Array[3] or a glMatrix vec3 too. In this case the y, and z parameters
 * are discarded.
 */
vxlCamera.prototype.setFocus = function(x,y,z){
	if (x instanceof Array){
		vec3.set(vec3.create(x), this.focus)
	}
	else if (x instanceof determineMatrixArrayType()){
		vec3.set(x, this.focus)
	}
	else{
    	vec3.set(vec3.createFrom(x,y,z), this.focus);
   	}
	this.update();
	this.debugMessage('Camera: Updated focus: ' + this.focus.toString(1));
};


vxlCamera.prototype.pan = function(dx, dy) {
	
	/*@TODO: Review buggy*/
	var c = this;
	c.setPosition(c.position[0] + dx * c.right[0], 
		          c.position[1] + dy * c.up[1], 
		          c.position[2]);
	c.setFocus(c.focus[0] + dx * c.right[0], 
		       c.focus[1] + dy * c.up[1], 
		       c.focus[2]);
};

/**
 * Performs the dollying operation in the direction indicated by the camera normal axis.
 * This operation is also known as zoom in/zoom out
 * 
 * @param {Number} value the dollying value 
 */
vxlCamera.prototype.dolly = function(value) {
    var c = this;
    
    var p =  vec3.create();
    var n =  vec3.create();
    
    p = c.position;
    
    var step = value - c.steps;
    
    vec3.normalize(c.normal,n);
    
    var newPosition = vec3.create();
    
    if(c.type == vxl.def.camera.type.TRACKING){
        newPosition[0] = p[0] - step*n[0];
        newPosition[1] = p[1] - step*n[1];
        newPosition[2] = p[2] - step*n[2];
    }
    else{
        newPosition[0] = p[0];
        newPosition[1] = p[1];
        newPosition[2] = p[2] - step; 
    }
    
    c.setPosition(newPosition); 
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
    this.right  = mat4.multiplyVec4(m, [1, 0, 0, 0]);
    this.up     = mat4.multiplyVec4(m, [0, 1, 0, 0]);
    this.normal = mat4.multiplyVec4(m, [0, 0, 1, 0]);
    
    vec3.normalize(this.right);
    vec3.normalize(this.up);
    vec3.normalize(this.normal);
};

/**
 * This method updates the current camera matrix upon changes in location, 
 * and rotation (azimuth, elevation)
 */
vxlCamera.prototype.update = function(){
	mat4.identity(this.matrix);
	
	this.computeAxis();
    
    if (this.type == vxl.def.camera.type.TRACKING){
        mat4.translate(this.matrix, this.position);
        mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
    }
    else {
        var trxLook = mat4.identity();
        var negfocus = vec3.create();
        mat4.translate(this.matrix, this.focus);
        mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
        vec3.negate(this.focus, negfocus);
        mat4.translate(this.matrix, negfocus);
        mat4.translate(this.matrix,this.position);
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
        mat4.multiplyVec4(this.matrix, vec4.create([0, 0, 0, 1]), this.position);
    }
    
    
    
    this.debugMessage('------------- update -------------');
    this.debugMessage('  right: ' + vxl.util.format(this.right, 2)); 
    this.debugMessage('     up: ' + vxl.util.format(this.up, 2));   
    this.debugMessage(' normal: ' + vxl.util.format(this.normal,2));
                      
    this.debugMessage('  position: ' + vxl.util.format(this.position,2));
    this.debugMessage('   azimuth: ' + vxl.util.format(this.azimuth,3));
    this.debugMessage(' elevation: ' + vxl.util.format(this.elevation,3));
};

/**
 * Inverts the camera mattrix to obtain the correspondent Model-View Transform
 * @returns {mat4} m the Model-View Transform
 */
vxlCamera.prototype.getViewTransform = function(){
    var m = mat4.identity();
    mat4.set(this.matrix, m);
    mat4.inverse(m);
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
 *@param {String} actorName. The name of the actor that the camera will focus on 
 */
vxlCamera.prototype.focusOn = function(actorName){
	var actor = this.view.scene.getActorByName(actorName);
	if (actor == undefined){
		throw 'The actor '+actorName+' does not exist'
	}
	this.shot(actor.bb);	
	
}

/**
 * This method sets the camera to a distance such that the area covered by the bounding box (parameter)
 * is viewed.
 * @param {vxlBoundingBox} bb the bounding box
 */
vxlCamera.prototype.shot = function(bb){
	var maxDim = Math.max(bb[3] - bb[0], bb[4] - bb[1]);
	
	cc = [0,0,0];

	cc[0] = (bb[3] + bb[0]) /2;
	cc[1] = (bb[4] + bb[1]) /2;
	cc[2] = (bb[5] + bb[2]) /2;
		
	cc[0] = Math.round(cc[0]*1000)/1000;
	cc[1] = Math.round(cc[1]*1000)/1000;
	cc[2] = Math.round(cc[2]*1000)/1000;
	
	if(maxDim != 0) {
		var distance = 1.5 * maxDim / (Math.tan(this.FOV * Math.PI / 180));
		this.setPosition([cc[0], cc[1], cc[2]+ distance]);
	}
	
	this.setFocus(cc);
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
	vec3.set([0, 0, -1], c.up);
	vec3.set([1, 0, 0], c.right);
	c.setPosition(0, c.distance, 0);
	vxl.go.console('Camera: above');
};

vxlCamera.prototype.below = function() {
	var c = this;
	this.elevation = -90;
	this.azimuth = 0;
	this.xTr = 0;
	this.yTr = 0;
	vec3.set([0, 0, 1], c.up);
	vec3.set([1, 0, 0], c.right);
	c.setPosition(0, -c.distance, 0);
	vxl.go.console('Camera: below');
};

vxlCamera.prototype.right = function() {
	var c = this;
	this.elevation = 0;
	this.azimuth = -90;
	this.xTr = 0;
	this.yTr = 0;
	vec3.set([0, 1, 0], c.up);
	vec3.set([0, 0, 1], c.right);
	c.setPosition(-c.distance, 0, 0);
	vxl.go.console('Camera: right');
};

vxlCamera.prototype.left = function() {
	var c = this;
	this.elevation = 0;
	this.azimuth = 90;
	this.xTr = 0;
	this.yTr = 0;
	vec3.set([0, 1, 0], c.up);
	vec3.set([0, 0, 1], c.right);
	c.setPosition(c.distance, 0, 0);
	vxl.go.console('Camera: left');
};

vxlCamera.prototype.debugMessage = function(v) {
	if(this.debug) {
		console.info(v);
	}
};


vxlCamera.prototype.status = function(v) {
	var c = this;
	var p = 1;
	vxl.go.console('Camera:'+v+' ' + c.position.toString(p,'pos') + ' ' +	c.focus.toString(p,'focalPoint') + ' ' +'distance: ' + c.distance.toFixed(p));
	vxl.go.console(c.up.toString(p,'up') + ' ' + c.right.toString(p,'right') + ' ' + 	'[ elevation:'+c.elevation.toFixed(p)+', azimuth:' + c.azimuth.toFixed(p)+']');

};

