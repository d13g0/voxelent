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
 * @class Like a real camera it moves around the 3D scene displaying the current point of view in the browser
 * @constructor Creates a vxlCamera. 
 * @param {vxlView} vw
 * @param {Object} t the type of camera 
 * @author Diego Cantor
 */
function vxlCamera(vw,t) {

    this.id             = 0;    //Used by the camera manager to switch cameras
    this.UID            = vxl.util.generateUID(); //unique identification key
    this.view           = vw;

    this.FOV            = vxl.def.camera.fov;
    this.Z_NEAR         = vxl.def.camera.near;    
    this.Z_FAR          = vxl.def.camera.far;
    
    this._matrix 	      = mat4.identity();
    this._right 		  = vec3.createFrom(1, 0, 0);
	this._up              = vec3.createFrom(0, 1, 0);
	this._normal          = vec3.createFrom(0, 0, 1);	
	this._position        = vec3.createFrom(0, 0, 1);
	this._focalPoint      = vec3.createFrom(0, 0, 0);
	this._distanceVector  = vec3.createFrom(0, 0, 0);
    
    this._azimuth 	    = 0;
    this._elevation     = 0;
    this._roll          = 0;
	this._relAzimuth    = 0;
    this._relElevation  = 0;
    this._relRoll       = 0;
	this._dollyingStep  = 0; //dollying step
    this._distance      = 1;
    
    this._following     = undefined;
    this._trackingMode  = vxl.def.camera.tracking.DEFAULT;
    
    this.states         = [];

	if (t != undefined && t !=null){
        this.type = t;
    }
    else {
        this.type = vxl.def.camera.type.ORBITING;
    }
};

/**
 * Uses the current camera axes as the standard rotation and translation axes 
 */
vxlCamera.prototype.setAxes = function(){
    this._updateAxes();
};

/**
 * Establishes the type of camera
 * @param {vxl.def.camera.type} type the type of camera
 * @param {vxl.def.camera.tracking} trackingMode if the camera is of tracking type, the tracking mode can be set as 
 * an optional parameter here.
 * @see {vxl.def.camera}
 */
vxlCamera.prototype.setType = function(type, trackingMode){
    
    if (type != vxl.def.camera.type.ORBITING && type != vxl.def.camera.type.TRACKING) {
        console.error('vxlCamera.setType ERROR type'+ type +' unknown. Setting camera to ORBITING type.');
        this.type = vxl.def.camera.type.ORBITING;
    }
    else {
        this.type = type
    }
    
    if (this.type  == vxl.def.camera.type.TRACKING && trackingMode != undefined){
        this.setTrackingMode(trackingMode);
    }
};

/**
 * Sets the tracking mode of this camera when it follows an actor
 * <p> to set the tracking mode of the camera <code>myCamera</code> you should make sure that your camera is of tracking type with:
 *  <code>myCamera.setType(vxl.def.camera.type.TRACKING)</code>.
 *  For instance:
 * </p>
 *  <pre class='prettyprint'>
 *  var actor = vxl.api.getActor('cone'); //from the current scene
 *  var camera = vxl.c.camera;
 *  camera.setType(vxl.def.camera.type.TRACKING);
 *  camera.setTrackingMode(vxl.def.camera.tracking.ROTATIONAL);
 *  camera.follow(actor);
 * </pre>
 * <p> a shorter way would be:</p>
 * <pre class='prettyprint'>
 *  var actor = vxl.api.getActor('cone'); //from the current scene
 *  var camera = vxl.c.camera;
 *  camera.setType(vxl.def.camera.type.TRACKING);
 *  camera.follow(actor, vxl.def.camera.tracking.ROTATIONAL);
 * </pre>
 * @see vxlCamera#follow, vxlCamera#setTrackingMode
 */
vxlCamera.prototype.setTrackingMode = function(mode){
    if (mode == undefined) return;
    this._trackingMode = mode;
};

/**
 * Follows a given actor. If this operation is called on an ORBITING camera,
 * the camera type will change to be a TRACKING camera.
 * @param {vxlActor} actor actor to track
 * @param {String} trackingMode one of the possible values of <code>vxl.def.camera.tracking</code>
 * @see {vxlCamera#setType, vxl.def.camera.tracking}
 */
vxlCamera.prototype.follow = function(actor, trackingMode){
    this.setType(vxl.def.camera.type.TRACKING, trackingMode);
    this._following = actor;
    
    actor.addTrackingCamera(this);
};

/**
 * Stops following an actor  
 */
vxlCamera.prototype.unfollow = function(){
    this._following.removeTrackingCamera(this);
    this._following = undefined;
};

/**
 * Updates the camera according to the current tracking mode. This method is a callback used by the 
 * vxlActor class to notify the camera of any actor transformations. This is applicable of course only when
 * this camera is following the actor passed as parameter here
 * @param {vxlActor} actor the actor being followed by this camera
 */
vxlCamera.prototype.updateWithActor = function(actor){
    if (this._following != actor) return; //fail safe
    
    switch(this._trackingMode){
        case vxl.def.camera.tracking.DEFAULT:
                break;
        case vxl.def.camera.tracking.ROTATIONAL:
                this.setFocalPoint(actor._position);
                break;
        case vxl.def.camera.tracking.TRANSLATIONAL:
                this.translate(actor._translation);        
                break;
    }
};
/**
 *<p>Sets the camera position in the scene
 * This method has three parameters x,y,z which represent the coordinates for 
 * the camera's position.
 * </p>
 * <p>
 * This method takes into account the current focal point. The camera will look at the
 * focal point after this operation. If you want to move the camera position and the focal point
 * simultaneously, then use <code>vxlCamera.translate</code>.
 * </p>
 *  
 *  * @param {Number, Array} x the x-coordinate. x can also be an Array [a,b,c] in this case the y and z parameters are discarded.
 * @param {Number} y the y-coordinate
 * @param {Number} z the z-coordinate
 * @see{vxlCamera#translate}
 */
vxlCamera.prototype.setPosition = function(x,y,z) {
    this._position = vxl.util.createVec3(x,y,z);
    
    var m = this._matrix;
    m[12] = this._position[0];
    m[13] = this._position[1];
    m[14] = this._position[2];
    m[15] = 1;
    
    this._updateDistance();
    this.setFocalPoint(this._focalPoint);
};

/**
 * Position the camera to a given distance from the current focal point
 * @param {Number} d the distance
 * @TODO: REVIEW COMMENTED CODE
 */
vxlCamera.prototype.setDistance = function(d) {
    
    if(this._distance == d || d <0) {
        return;
    }

    this._distance = d;

    // Distance should be greater than .0002
    if(this._distance < 0.0002) {
        this._distance = 0.0002;
        console.warn(" vxlCamera.setDistance WARN: Distance is set to minimum (0.0002)");
    }
    
    this._dollyingStep = this._distance / 100;
    
    var pos = vec3.create();
    
    var d = this._distance;
    var n = this._normal;
    var f = this._focalPoint;
    
    pos[0] = d*n[0] + f[0];
    pos[1] = d*n[1] + f[1];
    pos[2] = d*n[2] + f[2];
    
    vec3.set(pos, this._position);
    
    var m = this._matrix;
    m[12] = this._position[0];
    m[13] = this._position[1];
    m[14] = this._position[2];
    m[15] = 1;
    
    this._updateDistance();
};

/**
 * Changes the initial azimuth of the camera
 * @param {Number} el the azimuth increment in degrees
 */
vxlCamera.prototype.changeAzimuth = function(az){
    this.setAzimuth(this._azimuth + az);
};

/**
 * Changes the initial elevation of the camera
 * @param {Number} el the elevation increment in degrees
 */
vxlCamera.prototype.changeElevation = function(el){
    this.setElevation(this._elevation + el);
};


/**
 * Changes the initial roll of the camera
 * @param {Number} rl the roll increment in degrees
 */
vxlCamera.prototype.changeRoll = function(rl){
    this.roll(this._roll + rl);
};
/**
 * Sets the initial azimuth of the camera
 * @param {Number} el the azimuth in degrees
 */
vxlCamera.prototype.setAzimuth = function(az){
    this._azimuth = this._getAngle(az);
    this._setInitialMatrix();
};

/**
 * Sets the initial elevation of the camera
 * @param {Number} el the elevation in degrees
 */
vxlCamera.prototype.setElevation = function(el){
    this._elevation =this._getAngle(el);
    this._setInitialMatrix();
};

/**
 * Sets the initial roll of the camera
 * Rotates the camera around its view (forward) axis
 * @param {Number} angle the roll angle
 */
vxlCamera.prototype.setRoll = function(angle){
       this._roll = this._getAngle(angle);
       this._setInitialMatrix();  
};

/**
 * Changes the azimuth and elevation with respect to the current camera axes
 * @param {Number} azimuth the relative azimuth
 * @param {Number} elevation the relative elevation
 */
vxlCamera.prototype.rotate = function(azimuth,elevation,roll){
    this._relElevation = this._getAngle(elevation);
    this._relAzimuth   = this._getAngle(azimuth);
    this._relRoll      = this._getAngle(roll);
    
    this._elevation += this._relElevation;
    this._azimuth   += this._relAzimuth;
    this._roll      += this._relRoll;
    
    this._rotateMatrix();
    this._updateAxes();
    this._updateAngles();
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
	var    n =  this._normal; 
    var pos = vec3.create(this._position);
    var step = value*this._dollyingStep;
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
    this.translate(tx,ty,0); 
};

/**
 * Translates the camera by a given vector 
 * 
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlCamera.prototype.translate = function(x,y,z){
    
    this._updateAxes();
    
    var pos = vec3.create(this._position);
    
    vec3.add(pos, vec3.scale(this._right  ,x, vec3.create()));
    vec3.add(pos, vec3.scale(this._up     ,y, vec3.create()));    
    vec3.add(pos, vec3.scale(this._normal ,z, vec3.create()));
    
    var fp  = vec3.create(this._focalPoint);
    vec3.add(fp, vec3.scale(this._right  ,x, vec3.create()));
    vec3.add(fp, vec3.scale(this._up     ,y, vec3.create()));    
    vec3.add(fp, vec3.scale(this._normal ,z, vec3.create()));
    
    
    this.setPosition(pos);
    this.setFocalPoint(fp);
};


/**
 * Looks at a given point in space (sets the focal point of this camera)
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlCamera.prototype.setFocalPoint = function(x,y,z) {
    
    this._focalPoint = vxl.util.createVec3(x,y,z);
    
    this._updateAxes();
    mat4.inverse(mat4.lookAt(this._position, this._focalPoint, this._up), this._matrix);
    this._updateAxes();
    this._updateAngles();
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
 *  Looks at a given actor without displacing the camera
 *  @param {String, vxlActor} actor The name of the actor or the actor object this camera will look at. 
 */
vxlCamera.prototype.lookAt = function(actor){
    if (actor instanceof vxlActor){
          this.setFocalPoint(actor._position);
    }
    else if (typeof(x) == 'string'){
        var actor = this.view.scene.getActorByName(actorName);
        if (actor == undefined){
            throw 'vxlCamera.lookAt ERROR: The actor '+actorName+' does not exist'
        }
        else{
            this.setFocalPoint(actor._position);
        }
    }  
};


/**
 *  Performs a close up of an actor.
 *  @param {String, vxlActor}  actor The name of the actor or the actor object this camera will look at.
 *  @see <a href="http://en.wikipedia.org/wiki/Close-up">Close-up (Wikipedia)</a>
 */
vxlCamera.prototype.closeUp = function(actor){
	if (actor instanceof vxlActor){
        this._shot(actor._bb);
    }
    else if (typeof(x) == 'string'){
        var actor = this.view.scene.getActorByName(actorName);
        if (actor == undefined){
            throw 'vxlCamera.lookAt ERROR: The actor '+actorName+' does not exist'
        }
        else{
	       this._shot(actor._bb);
	    }
	}	
};

/**
 * The camera moves to a position where all the actors in the scene are viewed. The actors
 * are seen in full within their surrounding environment.
 * 
 * A long shot uses the global bounding box of the view's scene
 * @see <a href="http://en.wikipedia.org/wiki/Long_shot">Long Shot (Wikipedia)</a>
 */
vxlCamera.prototype.longShot = function() {
    this.view.scene.computeBoundingBox(); //perfect example of BY DEMAND UPDATING OF BB
    this._shot(this.view.scene.bb);
};


/**
 * This method sets the camera to a distance such that the area covered by the bounding box (parameter)
 * is viewed.
 * @param {vxlBoundingBox} bb the bounding box
 */
vxlCamera.prototype._shot = function(bb){
    
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
	console.info('       type: ' + this.type);
    console.info('      right: ' + vxl.util.format(this._right, 2)); 
    console.info('         up: ' + vxl.util.format(this._up, 2));   
    console.info('     normal: ' + vxl.util.format(this._normal,2));           
    console.info('   position: ' + vxl.util.format(this._position,2));
    console.info('    azimuth: ' + vxl.util.format(this._azimuth,3));
    console.info('  elevation: ' + vxl.util.format(this._elevation,3));
    console.info('focal point: ' + vxl.util.format(this._focalPoint,3));
    console.info('   distance: ' + vxl.util.format(this._distance,2));
};


/**
 * Inverts the camera mattrix to obtain the correspondent Model-View Transform
 * @returns {mat4} m the Model-View Transform
 */
vxlCamera.prototype.getViewTransform = function(){
    return mat4.inverse(this._matrix, mat4.create());
};

/**
 * Sets the camera matrix
 * @param {mat4} matrix the new camera matrix
 */
vxlCamera.prototype.setMatrix = function(matrix){
    this._matrix = matrix;
    this._updateAxes();
    this._updateAngles();
}

/**
 * Sets the initial camera matrix
 * @private
 */
vxlCamera.prototype._setInitialMatrix = function(){
    
    mat4.identity(this._matrix);
    
    var rotX  = quat4.fromAngleAxis(this._elevation * vxl.def.deg2rad, [1,0,0]);
    var rotY  = quat4.fromAngleAxis(this._azimuth   * vxl.def.deg2rad, [0,1,0]);
    var rotZ  = quat4.fromAngleAxis(this._roll      * vxl.def.deg2rad, [0,0,1]); 
    var rotQ = quat4.multiply(rotY, rotX, quat4.create());
    var rotMatrix = quat4.toMat4(rotQ);
    
    mat4.translate(this._matrix, this._focalPoint);
    mat4.multiply(this._matrix, rotMatrix);
    var r = vec3.subtract(this._position, this._focalPoint, vec3.create());
    mat4.translate(this._matrix, r);
    
    this._updateAxes();
    
};

/**
 * This method updates the current camera matrix upon changes in location, 
 * and rotation (azimuth, elevation)
 * @see <a href='http://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Quaternion_rotation_operations'>Quaternions in Wikipedia</a>
 * @private
 */
vxlCamera.prototype._rotateMatrix = function(){

    var rotX  = quat4.fromAngleAxis(this._relElevation * vxl.def.deg2rad, [1,0,0]); 
    var rotY  = quat4.fromAngleAxis(this._relAzimuth   * vxl.def.deg2rad, [0,1,0]);
    var rotZ  = quat4.fromAngleAxis(this._relRoll      * vxl.def.deg2rad, [0,0,1]);
    var rotQ = quat4.multiply(rotX, rotY, quat4.create());
    rotQ = quat4.multiply(rotQ, rotZ, quat4.create());
    var rotMatrix = quat4.toMat4(rotQ);
    
    
    if (this.type ==  vxl.def.camera.type.TRACKING){
        
        mat4.multiply(this._matrix, rotMatrix);
        
        mat4.multiplyVec3(this._matrix, this._distanceVector);              //updating distance vector and focal point
        vec3.add(this._position, this._distanceVector, this._focalPoint);
              
    }
    else if (this.type ==  vxl.def.camera.type.ORBITING){
        mat4.translate(this._matrix, [0,0,-this._distance]);
        mat4.multiply (this._matrix, rotMatrix);
        mat4.translate(this._matrix, [0,0,this._distance]);
    }
    
    this._relAzimuth   = 0;
    this._relElevation = 0;
    this._relRoll      = 0;
};



/**
 * Updates the x,y and z axis of the camera according to the current camera matrix.
 * This is useful when one needs to know the values of the axis and operate with them directly.
 * Such is the case for zooming, where you need to know what is the normal axis to move
 * along it for dollying or zooming.
 * @private
 */
vxlCamera.prototype._updateAxes = function(){
   
    var m       = this._matrix;
    vec3.set(mat4.multiplyVec4(m, [1, 0, 0, 0]), this._right);
    vec3.set(mat4.multiplyVec4(m, [0, 1, 0, 0]), this._up);
    vec3.set(mat4.multiplyVec4(m, [0, 0, 1, 0]), this._normal);
    vec3.set(mat4.multiplyVec4(m, [0, 0, 0, 1]), this._position);
    
    vec3.normalize(this._right);
    vec3.normalize(this._up);
    vec3.normalize(this._normal);
    

    this._updateDistance();
};


/**
 * Updates the vector that moves the camera to the center of rotation. Called internally
 * when the focal point or the position of the camera are updated
 * @private
 */
vxlCamera.prototype._updateDistance = function(){
    this._distanceVector = vec3.subtract(this._focalPoint, this._position, vec3.create());
    this._distance = vec3.length(this._distanceVector);
    this._dollyingStep = this._distance / 100;
};

/**
 * Calculate the standard angles
 * @private
 */
vxlCamera.prototype._updateAngles = function(){
    var p = this._position, f = this._focalPoint;
       
    var d = vec3.subtract(f, p, vec3.create());  //distance vector
    
    var x = d[0], y =d[1], z =d[2], r = vec3.length(d);
    
    
    var ele = Math.asin(y/r) * vxl.def.rad2deg;
    var azi = 90 + Math.atan2(z,x) * vxl.def.rad2deg;
    
    this._elevation = ele;
    this._azimuth   = azi;
};


/**
 * Returns an angle between 0 and 360 degrees
 * @private
 */
vxlCamera.prototype._getAngle = function(angle){
   
    if (angle == undefined){
         return 0;
    }
    else if (angle > 360 || angle <-360) {
        return angle % 360;
    }
    else return angle;
};
 