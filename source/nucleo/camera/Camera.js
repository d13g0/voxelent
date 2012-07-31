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

    this.id             = 0;
    this.FOV            = vxl.def.camera.fov;
    this.Z_NEAR         = vxl.def.camera.near;    
    this.Z_FAR          = vxl.def.camera.far;
	this.view 		    = vw;
    this.matrix 	    = mat4.identity();
    this.right 		    = vec3.createFrom(1, 0, 0);
	this.up             = vec3.createFrom(0, 1, 0);
	this.normal         = vec3.createFrom(0, 0, 1);	
	this.position       = vec3.createFrom(0, 0, 1);
	this.focalPoint     = vec3.createFrom(0, 0, 0);
	this.cRot           = vec3.createFrom(0, 0, 0);
    this.azimuth 	    = 0;
    this.elevation 	    = 0;
    this.relAzimuth     = 0;
    this.relElevation   = 0;
	this.dstep  	    = 0; //dollying step
    this.m              = mat4.identity();
    this.distance       = 1;
    this.debug          = false;
    this.states         = [];

	if (t != undefined && t !=null){
        this.type = t;
    }
    else {
        this.type = vxl.def.camera.type.ORBITING;
    }
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
 * Sets the camera position in the scene
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's position.

 * @param {Number, Array} x the x-coordinate. x can also be an Array [a,b,c] in this case the y and z parameters are discarded.
 * @param {Number} y the y-coordinate
 * @param {Number} z the z-coordinate
 */
vxlCamera.prototype.setPosition = function(x,y,z) {
    this.position = vxl.util.createVec3(x,y,z);
    this._updateDistance();
    
    var m = this.matrix;
    m[12] = this.position[0];
    m[13] = this.position[1];
    m[14] = this.position[2];
    m[15] = 1;
    this._updateCentreRotation();
};


/**
 * Sets the focal point of the camera
 * 
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's focus.
 * 
 * @param {Number, Array} x the x-coordinate. x can also be an Array [a,b,c] in this case the y and z parameters are discarded.
 * @param {Number} y the y-coordinate
 * @param {Number} z the z-coordinate
 */
vxlCamera.prototype.setFocalPoint = function(x,y,z){
    this.focalPoint = vxl.util.createVec3(x,y,z);
    this._updateCentreRotation();
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
    
    this._updatePosition();
    this._updateMatrix();
    
    /*
    // we want to keep the camera pointing in the same direction
    var vec = this.normal;
    // recalculate FocalPoint
    this.focalPoint.x = this.position.x + vec.x * this.distance;
    this.focalPoint.y = this.position.y + vec.y * this.distance;
    this.focalPoint.z = this.position.z + vec.z * this.distance;
*/
};

/**
 * Change the azimuth of the camera
 * @param {Number} el the azimuth increment in degrees
 */
vxlCamera.prototype.changeAzimuth = function(az){
    this.setAzimuth(this.azimuth + az);
};

/**
 * Change the elevation of the camera
 * @param {Number} el the elevation increment in degrees
 */
vxlCamera.prototype.changeElevation = function(el){
    this.setElevation(this.elevation + el);
};

/**
 * Sets the azimuth of the camera
 * @param {Number} el the azimuth in degrees
 */
vxlCamera.prototype.setAzimuth = function(az){
    this.azimuth = this._getAngle(az);
    this._setInitialMatrix();
};

/**
 * Sets the elevation of the camera
 * @param {Number} el the elevation in degrees
 */
vxlCamera.prototype.setElevation = function(el){
    this.elevation =this._getAngle(el);
    this._setInitialMatrix();
};


/**
 * Returns an angle between 0 and 360 degrees
 * @private
 */
vxlCamera.prototype._getAngle = function(angle){
    if (angle > 360 || angle <-360) {
        return angle % 360;
    }
    else return angle;
};


//---------------------------------------------------------------------------------------------//
// CAMERA HANDLING OPERATIONS
//---------------------------------------------------------------------------------------------//

/**
 * Changes the azimuth and elevation with respect to the current camera axes
 * @param {Number} azimuth the relative azimuth
 * @param {Number} elevation the relative elevation
 */
vxlCamera.prototype.rotate = function(azimuth,elevation){
    this.relElevation = this._getAngle(elevation);
    this.relAzimuth   = this._getAngle(azimuth);
    
    this.elevation += this.relElevation;
    this.azimuth += this.relAzimuth;
    
    this._updateMatrix();
};

/**
 * Performs the dollying operation in the direction indicated by the camera normal axis.
 * The dollying mechanism offered by a camera makes sure that the camera moves fast
 * towards the object when the distance is large and slow when it is very close to the object.
 * For that effect, every time that the new position  (after dollying) is calculated, the field dstep is computed.
 * 
 * @param {Number} value the dollying value 
 * @see {vxlCamera#_updateDistance}
 */
vxlCamera.prototype.dolly = function(value) {
    this._updateAxes();
	var    n =  this.normal; 
    var pos = vec3.create(this.position);
    var step = value*this.dstep;
    pos[0] += step*n[0];
    pos[1] += step*n[1];
    pos[2] += step*n[2];
    this.setPosition(pos);
};

/**
 * Translates the camera side-to-side and up-and-down
 * @param {Number} dx the horizontal displacement
 * @param {Number} dy the vertical displacement
 */
vxlCamera.prototype.pan = function(tx, ty) {
    this._updateAxes();
    if (this.type == vxl.def.camera.type.ORBITING){
	   mat4.translate(this.matrix,  vec3.negate(this.position, vec3.create()));
	   vec3.add(this.position, [tx,-ty,0]);
	   mat4.translate(this.matrix, this.position); 
    }
    //@TODO: Implement for tracking camera  
};


/**
 * Calculates the new axis based on the current camera matrix,
 * sets the rotations (azimuth and elevation) back to zero.
 * it also calculates the current distance to the focal point
 * 
 * In short, it clears the camera to proceed with another transformation
 */
//vxlCamera.prototype.clear = function(){
  //  this._updateAxes();
    //this._updateDistance();
//};
//---------------------------------------------------------------------------------------------//

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
    
    this.setElevation(0);
    this.setAzimuth(0);
    
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
	
	this.setFocalPoint(cc);
};

/**
 * The camera moves to a position where all the actors in the scene are viewed. The actors
 * are seen in full within their surrounding environment.
 * 
 * A long shot uses the global bounding box of the view's scene
 */
vxlCamera.prototype.longShot = function() {
    this.view.scene.computeBoundingBox(); //perfect example of BY DEMAND UPDATING OF BB
	this.shot(this.view.scene.bb);
};

/**
 * Saves the current camera state in a memento (vxlCameraState)
 * @see vxlCameraState
 */
vxlCamera.prototype.save = function(name) {
    var landmark = new vxlCameraState(name, this);
	this.states.push(landmark);
};

/**
 * Retrieves the last saved camera state from the memento (vxlCameraState)
 * @see vxlCameraState
 */
vxlCamera.prototype.retrieve = function(name) {
	for(var i=0;i<this.states.length;i+=1){
	    if (this.states[i].name == name){
	        this.states[i].retrieve();
	        return;
	    }
	}
    throw 'vxlCamera.retrieve: state '+name+' not found'
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

//---------------------------------------------------------------------------------------------//
// PRIVATE METHODS
//---------------------------------------------------------------------------------------------//

/**
 * Sets the rotation matrix according to the azimuth and elevation properties of this camera
 * @private
 */
vxlCamera.prototype._setInitialMatrix = function(){
    this.matrix = mat4.identity();
    
    mat4.translate(this.matrix, this.focalPoint);
    mat4.rotateY  (this.matrix, this.azimuth   * Math.PI / 180);
    mat4.rotateX  (this.matrix, this.elevation * Math.PI / 180);
    mat4.translate(this.matrix, vec3.negate(this.focalPoint, vec3.create()));
    mat4.translate(this.matrix, this.position);
};

/**
 * This method updates the current camera matrix upon changes in location, 
 * and rotation (azimuth, elevation)
 * @private
 */
vxlCamera.prototype._updateMatrix = function(){

    if (this.type ==  vxl.def.camera.type.TRACKING){
        //mat4.translate(this.matrix, this.position);
        //mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        //mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
              
     }
     else if (this.type ==  vxl.def.camera.type.ORBITING){
               
        //Rotations according to Tojiro
        var rotY  = quat4.fromAngleAxis(this.relAzimuth * Math.PI/180, [0,1,0]);
        var rotX  = quat4.fromAngleAxis(this.relElevation * Math.PI/180, [1,0,0]);
        var rotQ = quat4.multiply(rotY, rotX, quat4.create());
        var rotMatrix = quat4.toMat4(rotQ);
    
        mat4.translate(this.matrix, this.cRot)
        mat4.multiply(this.matrix, rotMatrix);
        mat4.translate(this.matrix, vec3.negate(this.cRot, vec3.create()));
    
        this.relAzimuth = 0;
        this.relElevation = 0;
    } 
};

/**
 * Updates the x,y and z axis of the camera according to the current camera matrix.
 * This is useful when one needs to know the values of the axis and operate with them directly.
 * Such is the case for zooming, where you need to know what is the normal axis to move
 * along it for dollying or zooming.
 * @private
 */
vxlCamera.prototype._updateAxes = function(){
    var m       = this.matrix;
    vec3.set(mat4.multiplyVec4(m, [1, 0, 0, 0]), this.right);
    vec3.set(mat4.multiplyVec4(m, [0, 1, 0, 0]), this.up);
    vec3.set(mat4.multiplyVec4(m, [0, 0, 1, 0]), this.normal);
    vec3.set(mat4.multiplyVec4(m, [0, 0, 0, 1]), this.position);
    
    vec3.normalize(this.right);
    vec3.normalize(this.up);
    vec3.normalize(this.normal);
    
    this._updateCentreRotation();
};

/**
 * Calculates the distance to the focal point. This method is called internally by the dollying operation
 * @private
 */
vxlCamera.prototype._updateDistance = function(){
    this.distance = vec3.dist(this.focalPoint, this.position);
    //this method also calculates the dolly step (dstep). 
    //We make sure that there are always 100 setps between 
    //the camera position and the focus point AT ALL TIMES.
    this.dstep = this.distance / 100;
};


/**
 * Updates the vector that moves the camera to the center of rotation
 * This method is supposed to be called internally by other methods that 
 * update the position or the focal point
 * @private
 */
vxlCamera.prototype._updateCentreRotation = function(){
    this.cRot = vec3.subtract(this.focalPoint, this.position, vec3.create());
    var cMat = mat4.inverse(mat4.toRotationMat(this.matrix), mat4.create());
    mat4.multiplyVec3(cMat, this.cRot);
};


/**
 * Calculates the position based on the current distance
 * @private 
 */
vxlCamera.prototype._updatePosition = function(){
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
    
    this._updateCentreRotation();
};