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
    this.right 		= vec3.createFrom(1, 0, 0);
	this.up         = vec3.createFrom(0, 1, 0);
	this.normal     = vec3.createFrom(0, 0, 1);
	this.position   = vec3.createFrom(0, 0, 1);
	
	this.tr         = vec3.createFrom(0, 0, 0);
    
    this.focus		= vec3.createFrom(0, 0, 0);
    this.azimuth 	= 0;
    this.elevation 	= 0;
	this.dstep  	= 0; //dollying step
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
    
	this.distance 	= 1;
	this.debug 		= false;
	this.state 	    = new vxlCameraState(this);
};


/**
 * Establishes the type of camera
 * @param {vxl.def.camera.type} t the type of camera
 * @see {vxl.def.camera}
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
 * Sets the distance from the current focal point
 * @param {Number} d 
 * @TODO: REVIEW COMMENTED CODE
 */
vxlCamera.prototype.setDistance = function(d) {
	
	if(this.distance == d) {
		return;
	}

	this.distance = d;

	// Distance should be greater than .0002
	if(this.distance < 0.0002) {
		this.distance = 0.0002;
		this.debugMessage(" Distance is set to minimum (0.0002)");
	}
	
	this.dstep = this.distance / 100;
	
	this.computePosition();
	this.updateMatrix();
	
	
	/*

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

/*
 * Calculates the distance to the focus point. This method is called internally by the dollying operation
 */
vxlCamera.prototype.computeDistance = function(){
    this.distance = vec3.dist(this.focus, this.position);
    //this method also calculates the dolly step (dstep). We make sure that there are always 100 setps between 
    //the camera position and the focus point AT ALL TIMES.
    this.dstep = this.distance / 100;
};

/**
 * Sets the camera position in the scene
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's position.

 * @param {Number, Array} x the x-coordinate. x can also be an Array [a,b,c] in this case the y and z parameters are discarded.
 * @param {Number} y the y-coordinate
 * @param {Number} z the z-coordinate
 */
vxlCamera.prototype.setPosition = function(x,y,z) {
	this.position = vxl.util.createVec3(x,y,z);
   	this.computeDistance();
   	
   	var m = this.matrix;
   	m[12] = this.position[0];
   	m[13] = this.position[1];
   	m[14] = this.position[2];
    m[15] = 1;
};

/**
 * Calculates the position based on the current distance 
 */
vxlCamera.prototype.computePosition = function(){
    var pos = vec3.create();
    
    var d = this.distance;
    var n = this.normal;
    
    pos[0] = d*n[0]; //@TODO: We might need the focal point here
    pos[1] = d*n[1];
    pos[2] = d*n[2];
    
    vec3.set(pos, this.position);
    
    var m = this.matrix;
    m[12] = this.position[0];
    m[13] = this.position[1];
    m[14] = this.position[2];
    m[15] = 1;
};

/**
 * Sets the focus point of the camera
 * 
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's focus.
 * 
 * @param {Number, Array} x the x-coordinate. x can also be an Array [a,b,c] in this case the y and z parameters are discarded.
 * @param {Number} y the y-coordinate
 * @param {Number} z the z-coordinate
 */
vxlCamera.prototype.setFocus = function(x,y,z){
	this.focus = vxl.util.createVec3(x,y,z);
	this.updateMatrix();
};

/**
 * Sets the azimuth of the camera
 * @param {Number} el the azimuth in degrees
 */
vxlCamera.prototype.setAzimuth = function(az){
    var c = this;
    c.azimuth =az;
    
    if (c.azimuth > 360 || c.azimuth <-360) {
        c.azimuth = c.azimuth % 360;
    }
    c.updateMatrix();
};

/**
 * Sets the elevation of the camera
 * @param {Number} el the elevation in degrees
 */
vxlCamera.prototype.setElevation = function(el){

    var c = this;
    
    c.elevation =el;
    
    if (c.elevation > 360 || c.elevation <-360) {
        c.elevation = c.elevation % 360;
    }
    c.updateMatrix();
};

/**
 * Performs the dollying operation in the direction indicated by the camera normal axis.
 * The dollying mechanism offered by a camera makes sure that the camera moves fast
 * towards the object when the distance is large and slow when it is very close to the object.
 * For that effect, every time that the new position  (after dollying) is calculated, the field dstep is computed.
 * 
 * @param {Number} value the dollying value 
 * @see {vxlCamera#computeDistance}
 */
vxlCamera.prototype.dolly = function(value) {
    
    var pos = vec3.create(this.position);
    var step = value*this.dstep;
   
    /* We dolly the camera along the camera normal (line of view) */
    if (this.type == vxl.def.camera.type.TRACKING){
	    var n =  this.normal; // the normal vector is always normalized. See calculateAxes
	    pos[0] += step*n[0];
	    pos[1] += step*n[1];
	    pos[2] += step*n[2];
	    
    }
    /* We dolly the camera along the z axis */
    else if (this.type == vxl.def.camera.type.ORBITING){
    	pos[2] = pos[2] + step; 
    	
    }
    
    this.setPosition(pos);
};

/**
 * Translates the camera side-to-side and up-and-down
 * @param {Number} dx the horizontal displacement
 * @param {Number} dy the vertical displacement
 */
vxlCamera.prototype.pan = function(tx, ty) {
  
   
  if (this.type == vxl.def.camera.type.ORBITING){
	   mat4.translate(this.matrix,  vec3.negate(this.position, vec3.create()));
	   vec3.add(this.position, [tx,-ty,0]);
	   mat4.translate(this.matrix, this.position); 
  }
  //@TODO: Implement for tracking camera  
   
};


/**
 * Updates the x,y and z axis of the camera according to the current camera matrix.
 * This is useful when one needs to know the values of the axis and operate with them directly.
 * Such is the case for zooming, where you need to know what is the normal axis to move
 * along it for dollying or zooming.
 */
vxlCamera.prototype.computeAxes = function(){
	var m       = this.matrix;
    vec3.set(mat4.multiplyVec4(m, [1, 0, 0, 0]), this.right);
    vec3.set(mat4.multiplyVec4(m, [0, 1, 0, 0]), this.up);
    vec3.set(mat4.multiplyVec4(m, [0, 0, 1, 0]), this.normal);
    if (this.type == vxl.def.camera.type.TRACKING){
        vec3.set(mat4.multiplyVec4(m, [0, 0, 0, 1]), this.position);
    }
    vec3.normalize(this.right);
    vec3.normalize(this.up);
    vec3.normalize(this.normal);
    //this.status();
};


/**
 * Used by the tracker when done rotation. Clear the temporary variables to store rotation.
 */
vxlCamera.prototype.clearRotation = function(){
    this.azimuth = 0;
    this.elevation = 0;
};



/**
 * Calculates the new axis based on the current camera matrix,
 * sets the rotations (azimuth and elevation) back to zero.
 * it also calculates the current distance to the focal point
 * 
 * In short, it clears the camera to proceed with another transformation
 */
vxlCamera.prototype.clear = function(){
    this.computeAxes();
    this.clearRotation();
    this.computeDistance();
};

/**
 * This method updates the current camera matrix upon changes in location, 
 * and rotation (azimuth, elevation)
 */
vxlCamera.prototype.updateMatrix = function(){
	
	//this.matrix = mat4.toRotationMat(this.matrix);

	
	if (this.type ==  vxl.def.camera.type.TRACKING){
    	        //mat4.translate(this.matrix, this.position);
                //mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
                //mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
              
     }
     else if (this.type ==  vxl.def.camera.type.ORBITING){
                
                //Rotations according to Tojiro
                var rotY  = quat4.fromAngleAxis(this.azimuth * Math.PI/180, [0,1,0]);
                var rotX  = quat4.fromAngleAxis(this.elevation * Math.PI/180, [1,0,0]);
                var rot = quat4.multiply(rotY, rotX, quat4.create());
                var rotMatrix = quat4.toMat4(rot);
                
                
                //Transformation stack:
                mat4.translate(this.matrix, vec3.negate(this.position, vec3.create()));
                mat4.translate(this.matrix, this.focus);
                mat4.multiply(this.matrix, rotMatrix);
                mat4.translate(this.matrix, vec3.negate(this.focus, vec3.create()));
                mat4.translate(this.matrix, this.position);

                
    } 
};

/**
 * Inverts the camera mattrix to obtain the correspondent Model-View Transform
 * @returns {mat4} m the Model-View Transform
 */
vxlCamera.prototype.getViewTransform = function(){
    return mat4.inverse(this.matrix, mat4.create());
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
		var d = 1.5 * maxDim / (Math.tan(this.FOV * Math.PI / 180));
		this.setPosition([cc[0], cc[1], cc[2]+ d]);
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


/**
 * If the debug field is set to true, this method will print the message passed as a parameter in the browser's console
 * @param {String} v the message to print
 */
vxlCamera.prototype.debugMessage = function(v) {
	if(this.debug) {
		console.info(v);
	}
};

/**
 * Prints a summary of the camera variables on the browser's console
 */
vxlCamera.prototype.status = function() {
	console.info('------------- Camera Status -------------');
	console.info('      type: ' + this.type);
    console.info('     right: ' + vxl.util.format(this.right, 2)); 
    console.info('        up: ' + vxl.util.format(this.up, 2));   
    console.info('    normal: ' + vxl.util.format(this.normal,2));           
    console.info('  position: ' + vxl.util.format(this.position,2));
    console.info('   azimuth: ' + vxl.util.format(this.azimuth,3));
    console.info(' elevation: ' + vxl.util.format(this.elevation,3));
};

