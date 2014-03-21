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
 * The azimuth, elevation and roll operations occur with respect to the standard coordinate system:
 * right =[1,0,0], up = [0,1,0] and normal 
 * of 
 * 
 * @class Like a real camera it moves around the 3D scene displaying the current point of view in the browser
 * @constructor Creates a vxlCamera. 
 * @param {vxlView} vw
 * @param {Object} t the type of camera 
 * @author Diego Cantor
 */
function vxlCamera(vw,t) {
    this.UID            = vxl.util.generateUID(); //unique identification key
    this.view           = vw;

    this._fov           = vxl.def.camera.fov;
    this.Z_NEAR         = vxl.def.camera.near;    
    this.Z_FAR          = vxl.def.camera.far;
    
    this._matrix 	      = mat4.identity();
    this._right 		  = vec3.createFrom(1, 0, 0);
	this._up              = vec3.createFrom(0, 1, 0);
	this._forward          = vec3.createFrom(0, 0, 1);	
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
    
    this.landmarks         = [];
    this._lmarkAnimationID = undefined; //useful to interrupt landmark animations

	if (t != undefined && t !=null){
        this.type = t;
    }
    else {
        this.type = vxl.def.camera.type.EXPLORING;
    }
    
};

/**
 * Establishes the type of camera
 * @param {vxl.def.camera.type} type the type of camera
 * @param {vxl.def.camera.tracking} trackingMode if the camera is of tracking type, the tracking mode can be set as 
 * an optional parameter here.
 * @see {vxl.def.camera}
 */
vxlCamera.prototype.setType = function(type, trackingMode){
    
    if (type != vxl.def.camera.type.ORBITING && 
        type != vxl.def.camera.type.TRACKING &&
        type != vxl.def.camera.type.EXPLORING) {
        console.error('vxlCamera.setType ERROR type'+ type +' unknown. Setting camera to EXPLORING type.');
        this.type = vxl.def.camera.type.EXPLORING;
    }
    else {
        this.type = type;
    }
    
    if (this.type  == vxl.def.camera.type.TRACKING && trackingMode != undefined){
        this.setTrackingMode(trackingMode);
    }
};

/**
 * Sets the tracking type of this camera when it follows an actor
 * <p> to set the tracking type of the camera <code>myCamera</code> you should make sure that your camera is of tracking type with:
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
    if (this.type != vxl.def.camera.type.TRACKING){
        alert("Impossible to set a tracking mode if the camera is not of tracking type");
        throw("Impossible to set a tracking mode if the camera is not of tracking type");
    }
    if (mode == undefined) return;
    this._trackingMode = mode;
};

/**
 * Follows a given actor. If this operation is called on an ORBITING camera,
 * the camera mode will change to be a TRACKING camera.
 * 
 * @param {vxlActor} actor actor to track
 * @param {String} trackingType one of the possible values of <code>vxl.def.camera.tracking</code>
 * @see {vxlCamera#setType, vxl.def.camera.tracking}
 */
vxlCamera.prototype.follow = function(actor, trackingType){
    this.setType(vxl.def.camera.type.TRACKING, trackingType);
    if (actor == undefined || actor == null){
        alert("vxlCamera.follow: Unable to follow undefined/null actor");
        console.error("vxlCamera.follow: Unable to follow undefined/null actor");
    }
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
        case vxl.def.camera.tracking.CINEMATIC:
                this.setFocalPoint(actor._position);
                break;
        case vxl.def.camera.tracking.TRANSLATIONAL:
                this.translate(actor._translation);  
                this.setFocalPoint(actor._position);      
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
    this._setPosition(x,y,z);
    this.setFocalPoint(this._focalPoint);
};

/**
 * Looks at a given point in space (sets the focal point of this camera).
 * 
 * Note: If the camera is doing cinematic tracking, the up vector will be affected.
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlCamera.prototype.setFocalPoint = function(x,y,z) {
    
    var up = vec3.create([0,1,0]);
    //var up = vec3.create(this._up);
    this._focalPoint = vxl.util.createVec3(x,y,z);
    
    if (this._trackingMode == vxl.def.camera.tracking.CINEMATIC){
        var d  = vec3.subtract(this._focalPoint, this._position, vec3.create());
        var x  = d[0], y = d[1],  z = d[2],  r  = vec3.length(d);
        var el =      Math.asin(y/r)  * vxl.def.rad2deg;
        var az = 90 + Math.atan2(z,x) * vxl.def.rad2deg;
        var m = mat4.identity();
        mat4.rotateY(m, az * vxl.def.deg2rad);
        mat4.rotateX(m, el * vxl.def.deg2rad);
        up = mat4.multiplyVec3(m, [0,1,0], vec3.create());
    }
    
    mat4.inverse(mat4.lookAt(this._position, this._focalPoint, up), this._matrix);
    
    this._getAxes();
    this._getDistance();
    this._getAngles();
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
    var n = this._forward;
    var f = this._focalPoint;
    
    pos[0] = d*n[0] + f[0];
    pos[1] = d*n[1] + f[1];
    pos[2] = d*n[2] + f[2];
    
    this._setPosition(pos);
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
    this.setRoll(this._roll + rl);
};
/**
 * Sets the initial azimuth of the camera
 * @param {Number} el the azimuth in degrees
 */
vxlCamera.prototype.setAzimuth = function(az){
    this._azimuth = this._getAngle(az);
    this._computeMatrix();
    
    this._getAxes();
    if (this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        this._getPosition();
    }
    else if (this.type == vxl.def.camera.type.TRACKING){
        this._getFocalPoint();
    }
};

/**
 * Sets the initial elevation of the camera
 * @param {Number} el the elevation in degrees
 */
vxlCamera.prototype.setElevation = function(el){
    this._elevation =this._getAngle(el);
    this._computeMatrix();
    
    this._getAxes();
    if (this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        this._getPosition();
    }
    else if (this.type == vxl.def.camera.type.TRACKING){
        this._getFocalPoint();
    }
};

/**
 * Sets the initial roll of the camera
 * Rotates the camera around its view (forward) axis
 * @param {Number} angle the roll angle
 */
vxlCamera.prototype.setRoll = function(angle){
    this._roll = this._getAngle(angle);
    this._computeMatrix();
       
    this._getAxes();
    if (this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        this._getPosition();
    }
    else if (this.type == vxl.def.camera.type.TRACKING){
        this._getFocalPoint();
    }
};

/**
 * Changes the azimuth and elevation with respect to the current camera axes
 * @param {Number} azimuth the relative azimuth
 * @param {Number} elevation the relative elevation
 * @param {Number} roll the relative roll
 */
vxlCamera.prototype.rotate = function(azimuth,elevation,roll){
   
    if (this.type == vxl.def.camera.type.EXPLORING){ 
        
        azimuth   = this._getAngle(azimuth);
        elevation = this._getAngle(elevation);
        roll      = this._getAngle(roll);
        
        var rotX  = quat4.fromAngleAxis(elevation * vxl.def.deg2rad, [1,0,0]);
        var rotY  = quat4.fromAngleAxis(azimuth   * vxl.def.deg2rad, [0,1,0]);
        var rotZ  = quat4.fromAngleAxis(roll      * vxl.def.deg2rad, [0,0,1]); 
        var rotQ = quat4.multiply(rotY, rotX, quat4.create());
        
        rotQ = quat4.multiply(rotQ, rotZ, quat4.create());
        var rotMatrix = quat4.toMat4(rotQ);
        mat4.translate(this._matrix, [0,0,-this._distance]);
        mat4.multiply(this._matrix, rotMatrix);
        mat4.translate(this._matrix, [0,0,this._distance]);
    }
    else {
        if (Math.abs(this._elevation + elevation) > 90) return; //don't allow
        this._relElevation = this._getAngle(elevation);
        this._relAzimuth = this._getAngle(azimuth);
        this._relRoll = this._getAngle(roll);
        this._elevation += this._relElevation;
        this._azimuth += this._relAzimuth;
        this._roll += this._relRoll;
        
        this._computeMatrix();
    }
    
       
    this._getAxes();
    if (this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        this._getPosition();
    }
    else if (this.type == vxl.def.camera.type.TRACKING){
        this._getFocalPoint();
    }
    
   this._update();
};


/**
 * Performs the dollying operation in the direction indicated by the camera normal axis.
 * The dollying mechanism offered by a camera makes sure that the camera moves fast
 * towards the object when the distance is large and slow when it is very close to the object.
 * For that effect, every time that the new position  (after dollying) is calculated, the field dstep is computed.
 * 
 * @param {Number} value the dollying value 
 * 
 */
vxlCamera.prototype.dolly = function(value) {
    
	var    n =  this._forward; 
    var pos = vec3.create(this._position);
    var step = value*this._dollyingStep;
    pos[0] += step*n[0];
    pos[1] += step*n[1];
    pos[2] += step*n[2];
    
    this._setPosition(pos);
    if (this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.DYNAMIC){
        this._getDistance();
    }
    else if (this.type == vxl.def.camera.type.TRACKING){
        //move the focal point and keep the distance
        vec3.add(pos, this._distanceVector, this._focalPoint);
    }
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
    
    var coords = vxl.util.createVec3(x,y,z);
    var pos = vec3.create(this._position);
    
    vec3.add(pos, vec3.scale(this._right  ,coords[0], vec3.create()));
    vec3.add(pos, vec3.scale(this._up     ,coords[1],vec3.create()));    
    vec3.add(pos, vec3.scale(this._forward ,coords[2], vec3.create()));
    
    this._setPosition(pos);
    
   /* var fp  = vec3.create(this._focalPoint);
    vec3.add(fp, vec3.scale(this._right  ,x, vec3.create()));
    vec3.add(fp, vec3.scale(this._up     ,y, vec3.create()));    
    vec3.add(fp, vec3.scale(this._forward ,z, vec3.create()));*/
    
 
    //this.setFocalPoint(fp);
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
    else if (typeof(actor) == 'string'){
        var actor = this.view.scene.getActorByName(actor);
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
    else if (typeof(actor) == 'string'){
        var actor = this.view.scene.getActorByName(actor);
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
 * Changes the field of view of the  camera
 * 
 * @param{Number} fov the field of view in degrees [0-360] 
 * @see <a href="http://en.wikipedia.org/wiki/Angle_of_view">Angle of view</a>
 */
vxlCamera.prototype.setFieldOfView = function(fov){
    this._fov = fov;
};

/**
 * Creates a new landmark without moving the camera. It basically defines
 * 'future' landmarks.
 * @param {String} name the landmark given name
 * @param {Array, vec3} position the position of this landmark
 * @param {Array, vec3} focalPoint the desired focalPoint for the camera at the landmark
 * @see vxlLandmark
 */
vxlCamera.prototype.createLandmark = function(name, position, focalPoint){
	
	var c = new vxlCamera(this.view, this.type);
	c.setPosition(position);
	c.setFocalPoint(focalPoint);
	var l = new vxlLandmark(name, c);
	this.landmarks.push(l);
};

/**
 * Saves the current camera state in a landmark
 * @param {String} name the landmark name
 * @see vxlLandmark
 */
vxlCamera.prototype.setLandmark = function(name) {
    var l = new vxlLandmark (name, this);
    this.landmarks.push(l);
};

/**
 * Retrieves the landmark by name from the known landmarks
 * @param {String} name the landmark name
 * @param {Number} length (optional) the duration of the animation 
 * @param {Number} fps (optional) the number of frames per second (estmate)  
 * two landmarks.
 * @see vxlLandmark
 */
vxlCamera.prototype.gotoLandmark = function(name,length,fps) {
	
	var lmark = undefined;
	
	for(var i=0, N =this.landmarks.length; i<N;i+=1){
        if (this.landmarks[i].name == name){
        	lmark = this.landmarks[i];
        	break;
        }
	}
	
	if (lmark == undefined){
		console.warn('vxlCamera.goTo: landmark with name: '+name+', was not found');
		return;
	}
    
	if (length == undefined || length == 0){
		lmark.retrieve(this);
        return;
	}
	
	if (this._lmarkAnimationID != undefined){
		window.clearTimeout(this._lmarkAnimationID);
	}
	
	var self = this;
	var dest_pos = lmark._position;
	var dest_fp = lmark._focalPoint;
	
	if (length == undefined){ length = 1000; }
	if (fps == undefined) {fps ==  20; } 
	
	var interactor = this.view.interactor;
	interactor.disconnectFromView(); //do not process events during animation
	
	function animate(length, resolution){
		var steps = (length / 100) * (resolution / 10),
        speed = length / steps,
        count = 0,
        start = new Date().getTime();

		function iteration(){
			
			if(count++ != steps){
				percent = count/steps;
				var inter_fp = vec3.lerp(self._focalPoint, dest_fp,percent);
				var inter_pos = vec3.lerp(self._position, dest_pos,percent);
				
				
				self.setFocalPoint(inter_fp);
				self.setPosition(inter_pos);
				self.refresh();
				
				var dist = vec3.dist(inter_fp,dest_fp) + vec3.dist(inter_pos,dest_pos);
				if (dist >0.01){
					var diff = (new Date().getTime() - start) - (count * speed);
					self._lmarkAnimationID = window.setTimeout(iteration, (speed - diff));
				}
				else{
					self.setFocalPoint(dest_fp);
					self.setPosition(dest_pos);
					self.refresh();
					interactor.connectView(this.view); //reconnect interactor
				}
				return;
			}
		};
		
		//first time invocation
		self._lmarkAnimationID = window.setTimeout(iteration, speed);
	}
	
	animate(length,fps); 
	
};
/**
 * The animation map has one entry per gotoLandmark step
 * steps = [ ['landmark_1',duration_1, fps_1],
 *           ['landmark_2',duration_2, fps_2],
 *           ...
 *           ['landmark_N,duration_N,fps_N]];
 * }
 */
vxlCamera.prototype.doLandmarkAnimation = function(steps){
	
	var _steps = steps.slice(0); //copy so we can destroy it
	var camera = this;
	
	function processStep(){
		if (_steps.length ==0){
			return;
		}
		
		step = _steps.splice(0,1)[0];

		lmark = step[0];
		duration = step[1];
		fps = step[2];
		camera.gotoLandmark(lmark,duration,fps);
		window.setTimeout(processStep,duration);
	}
	
	processStep();
};

/**
 * Returns a list of known landmarks
 */
vxlCamera.prototype.getLandmarks = function(){
  var lmarks = [];
  for(var i=0, N =this.landmarks.length; i<N;i+=1){
      lmarks.push(this.landmarks[i].name);
  }
  return lmarks;  
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
		var d = 1.5 * maxDim / (Math.tan(this._fov * Math.PI / 180));
		this.setPosition([cc[0], cc[1], cc[2]+ d]);
	}
	
	this.setFocalPoint(cc);
};



/**
 * Prints a summary of the camera variables on the browser's console
 */
vxlCamera.prototype.status = function() {
	console.info('------------- Camera Status -------------');
	console.info('       type: ' + this.type);
    console.info('      right: ' + vxl.util.format(this._right, 2)); 
    console.info('         up: ' + vxl.util.format(this._up, 2));   
    console.info('    forward: ' + vxl.util.format(this._forward,2));           
    console.info('   position: ' + vxl.util.format(this._position,2));
    console.info('focal point: ' + vxl.util.format(this._focalPoint,2));
    console.info('   d vector: ' + vxl.util.format(this._distanceVector,2));
    console.info('    azimuth: ' + vxl.util.format(this._azimuth,3));
    console.info('  elevation: ' + vxl.util.format(this._elevation,3));
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
    this._update();
};

/**
 * Sets the  camera matrix
 * @private
 */
vxlCamera.prototype._computeMatrix = function(){
    
    mat4.identity(this._matrix);
    
    var rotX  = quat4.fromAngleAxis(this._elevation * vxl.def.deg2rad, [1,0,0]);
    var rotY  = quat4.fromAngleAxis(this._azimuth   * vxl.def.deg2rad, [0,1,0]);
    var rotZ  = quat4.fromAngleAxis(this._roll      * vxl.def.deg2rad, [0,0,1]); 
    
    if(this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        rotX  = quat4.fromAngleAxis(-this._elevation * vxl.def.deg2rad, [1,0,0]);
    } 
   
    
    var rotQ = quat4.multiply(rotY, rotX, quat4.create());
    rotQ = quat4.multiply(rotQ, rotZ, quat4.create());
    var rotMatrix = quat4.toMat4(rotQ);
    
    if (this.type ==  vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        mat4.translate(this._matrix, this._focalPoint);
        mat4.multiply(this._matrix, rotMatrix);
        mat4.translate(this._matrix, [0,0,this._distance]);
    } 
    else if(this.type ==  vxl.def.camera.type.TRACKING){
        mat4.translate(this._matrix, this._position);
        mat4.multiply(this._matrix, rotMatrix);
    }
};

/*
 * Updates the camera matrix. Used on rotate to avoid gimbal lock
 * @private
 */
/*vxlCamera.prototype._updateMatrix = function(){
   
    var rotX  = quat4.fromAngleAxis(this._relElevation * vxl.def.deg2rad, [1,0,0]);
    var rotY  = quat4.fromAngleAxis(this._relAzimuth   * vxl.def.deg2rad, [0,1,0]);
    var rotZ  = quat4.fromAngleAxis(this._relRoll      * vxl.def.deg2rad, [0,0,1]); 
    var rotQ = quat4.multiply(rotY, rotX, quat4.create());
    rotQ = quat4.multiply(rotQ, rotZ, quat4.create());
    var rotMatrix = quat4.toMat4(rotQ);
    
    if (this.type ==  vxl.def.camera.type.ORBITING){
        mat4.translate(this._matrix, [0,0,-this._distance]);
        mat4.multiply(this._matrix, rotMatrix);
        mat4.translate(this._matrix, [0,0,this._distance]);
    } 
    else if(this.type ==  vxl.def.camera.type.TRACKING){
        mat4.multiply(this._matrix, rotMatrix);
    }
    
    this._relElevation  = 0;
    this._relAzimuth    = 0;
    this._relRoll       = 0;
};*/


/**
 * Sets the camera position in the camera matrix
 * @private
 */
vxlCamera.prototype._setPosition = function(x,y,z){
    this._position = vxl.util.createVec3(x,y,z);
    var m = this._matrix;
    m[12] = this._position[0];
    m[13] = this._position[1];
    m[14] = this._position[2];
    m[15] = 1;
};

/**
 * Recalculates axes based on the current matrix
 * @private
 */
vxlCamera.prototype._getAxes = function(){
    var m       = this._matrix;
    vec3.set(mat4.multiplyVec4(m, [1, 0, 0, 0]), this._right);
    vec3.set(mat4.multiplyVec4(m, [0, 1, 0, 0]), this._up);
    vec3.set(mat4.multiplyVec4(m, [0, 0, 1, 0]), this._forward);
    vec3.normalize(this._right);
    vec3.normalize(this._up);
    vec3.normalize(this._forward);
};

/**
 * Recalculates the position based on the current matrix
 * Called only when camera is of ORBITING type
 * @private
 */
vxlCamera.prototype._getPosition = function(){
    var m       = this._matrix;
    vec3.set(mat4.multiplyVec4(m, [0, 0, 0, 1]), this._position);
    this._getDistance();
};

/**
 * Called only when camera is of TRACKING type
 * @private
 */
vxlCamera.prototype._getFocalPoint = function(){
    mat4.multiplyVec3(mat4.toRotationMat(this._matrix), [0,0,-this._distance], this._distanceVector); 
    vec3.add(this._position, this._distanceVector, this._focalPoint);
    this._getDistance();               
};

/**
 * Recalculates the distance variables based on the current state
 * @private
 */
vxlCamera.prototype._getDistance = function(){
    this._distanceVector = vec3.subtract(this._focalPoint, this._position, vec3.create());
    this._distance = vec3.length(this._distanceVector);
    this._dollyingStep = this._distance / 100;
};

/**
 * Recalculates euler angles based on the current state
 * @private
 */
vxlCamera.prototype._getAngles = function(){
    //Recalculates angles  
    var x = this._distanceVector[0], y = this._distanceVector[1],  z = this._distanceVector[2];
    var r = vec3.length(this._distanceVector);
    
    if (this.type == vxl.def.camera.type.ORBITING || this.type == vxl.def.camera.type.EXPLORING){
        this._elevation = -1 * Math.asin(y/r)    * vxl.def.rad2deg;
    }
    else{
        this._elevation = Math.asin(y/r)    * vxl.def.rad2deg;
    }
    this._azimuth   = Math.atan2(-x,-z) * vxl.def.rad2deg;
};


/**
 * Recalculates the camera state from the camera matrix
 * @private
 */
vxlCamera.prototype._update = function(){
    this._getAxes();
    this._getPosition();
    this._getDistance();
    this._getAngles();
};

/**
 * @private
 */
vxlCamera.prototype._calculateAngles = function(){
    var rotM = mat4.toMat3(this._matrix);
    var Q = mat3.toQuat4(rotM);
    var x = Q[0], y = Q[1], z = Q[2], w=Q[3];
    
    var roll  = Math.atan2(2 * (w * x + y * z),1 - 2 * (x * x + y * y)) * vxl.def.rad2deg;
    var pitch = Math.asin (2 * (w * y - z * y)) * vxl.def.rad2deg;
    var yaw   = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y *y + z * z)) * vxl.def.rad2deg;
    
    console.info(' roll :' + vxl.util.format(roll,2));
    console.info('pitch :' + vxl.util.format(pitch,2));
    console.info('  yaw :' + vxl.util.format(yaw,2));
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
 
