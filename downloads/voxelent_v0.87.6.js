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
try{
    if (!jQuery){
    	alert('Voxelent: jQuery is not loaded. Please include JQuery in your page');	
    }
}catch(e){
    alert('Voxelent: jQuery is not loaded. Please include JQuery in your page');
}


/**
* @namespace Voxelent Namespace
* @property {vxl.version}   version     version 
* @property {vxl.def}       def         definition objects
* @property {vxl.go}        go          global objects
* @property {vxl.c}         c           current objects
* 
*/
var vxl = {

/**
* Version
* @namespace Voxelent Version
* @property {String} number         the number of the current version
* @property {String} codename       the codename of the current version
* @property {Array}  plugins        installed plugins if any
*/
version : 
{
   	number : '0.87.6',
   	codename : 'c4n314',
   	plugins  : []
},

/**
 * @namespace Voxelent Default/Definition Objects
 * @property {vxl.def.glsl}     glsl    GLSL constants
 * @property {vxl.def.lut}      lut     Lookup Table Definitions
 * @property {vxl.def.model}    model   Default values for models
 * @property {vxl.def.view}     view    Default values for views 
 * 
 */
def : {
    /**
     * @namespace GLSL constants
     * @property {String} VERTEX_SHADER Vertex Shader Id
     * @property {String} FRAGMENT_SHADER Fragment Shader Id
     */
	glsl			: { 
						VERTEX_SHADER   	: 'VERTEX_SHADER',
						FRAGMENT_SHADER 	: 'FRAGMENT_SHADER',
						MODEL_VIEW_MATRIX  	: 'mModelView',
						NORMAL_MATRIX   	: 'mNormal',
						PERSPECTIVE_MATRIX 	: 'mPerspective',
						VERTEX_ATTRIBUTE    : 'aVertexPosition',
						NORMAL_ATTRIBUTE    : 'aVertexNormal',
						COLOR_ATTRIBUTE     : 'aVertexColor'
					},
    /** 
     * @namespace Lookup Table Definitions 
     * @property {Array}       list         List of lookup tables available
     * @property {String}      main         Lookup table loaded by default
     */                
	lut             : {
             
						list : ["default","aal","autumn","blackbody","bone","brodmann","cardiac",
								"copper","cortex","cte","french","fs","ge_color","gold","gooch",
								"hot","hotiron","hsv","jet","nih","nih_fire","nih_ice","pink",
								"rainramp","spectrum","surface","x_hot","x_rain"],
      
						main:"default"

				    },
	/**
    * @namespace Default values for models
    * @property {Array}  diffuse    A 4-valued array that contains the color for actor's default diffuse property. This array has the format [r,g,b,a]
    */
	model			: { 
						diffuse: [0.9,0.0,0.0,1.0],
						/** @namespace Enumeration with the different loading modes provided by Voxelent
                          * @property {String} LIVE     Each asset is added to the scene as soon as it is downloaded
                          * @property {String} LATER    The assets are added to the scene only when ALL of them ahve been downloaded
                          * @property {String} DETACHED The assets are never added to the scene. The programmer decides when to do this.
                          */
                         loadingMode     : { LIVE:'LIVE', LATER:'LATER', DETACHED:'DETACHED'}
					},
    /**
    * @namespace Default values for views
    * @property {Array} background  A 4-valued array that contains the default background colour for view. The format is [r,g,b,a]
    */
    view			: {
    					background: [135/256,135/256,135/256,1.0]
    				},			      
	/**
    * @namespace Default values for actors
    * @property {vxl.def.actor.mode}    mode    Actor rendering modes
    */
	actor			: {
                        /** @namespace Actor Rendering Modes 
                        * @property {String} SOLID 
                        * @property {String} WIREFRAME
                        * @property {String} POINTS
                        * @property {String} LINES
                        */
						mode: {	SOLID:'SOLID', WIREFRAME:'WIREFRAME', POINTS:'POINTS', LINES:'LINES'}
					},
	/**
    * @namespace Default values for cameras
    * @property {vxl.def.camera.task} task Enumeration of common camera tasks
    * @property {vxl.def.camera.type} type Camera types available in Voxelent
    */
	camera          : {
                        /** @namespace Enumeration of common camera tasks
                        * @property {Number} NONE
                        * @property {Number} PAN
                        * @property {Number} ROTATE
                        * @property {Number} DOLLY
                        */
						task      : {	NONE : 0,	PAN : 1,	ROTATE : 2,	DOLLY : 3	},
                        /** @namespace Camera types available in Voxelent
                        * @property {String} ORBITING   Orbiting Camera - Around the World
                        * @property {String} TRACKING   Tracking Camera - First Person Camera
                        */
    					type      : { ORBITING: 'ORBITING', TRACKING : 'TRACKING'},
    					
    					right     : [1,0,0],
    					up        : [0,1,0],
    					normal    : [0,0,1],
    					fov       : 30,
    					near      : 0.1,
    					far       : 10000
    					
    					
					},
				 	
    /**
    * @namespace Default values for renderers
    * @property {vxl.def.renderer.mode} mode The rendering mode
    * @property {vxl.def.renderer.rate} rate The rendering rat
    */
	renderer 		: {
			        mode: { TIMER:'TIMER', ANIMFRAME:'ANIFRAME'}, //EXPERIMENTAL NOT WAY TO CANCEL YET },
			        rate : { SLOW: 10000,  NORMAL: 500 }
					}
},

/**
* @namespace Voxelent Events
* @property {String} DEFAULT_LUT_LOADED
* @property {String} SCENE_UPDATED
* @property {String} MODELS_LOADED
*/
events : {
	DEFAULT_LUT_LOADED 	: 'vxl.events.DEFAULT_LUT_LOADED',
	SCENE_UPDATED		: 'vxl.events.SCENE_UPDATED',
	MODELS_LOADED		: 'vxl.events.MODELS_LOADED',
	ACTOR_BB_UPDATED    : 'vxl.events.ACTOR_BB_UPDATED'
},


/**
* @namespace Voxelent Global Objects
* @property {Boolean}                   debug
* @property {vxlNotifier}               notifier
* @property {vxlModelManager}           modelManager
* @property {vxlLookupTableManager}     lookupTableManager
*
*/
go : {
    debug 	 		    : false,					  
    views 			    : [], //TODO: REFACTOR THIS.Remember is here for JQuery focus and blur bindings
	_rates			    : [],
    timid 			    : 0,
    notifier            : undefined,
    modelManager        : undefined,
    lookupTableManager  : undefined,

    
	render : function(){
		vxl.c.view.renderer.render(); 
		this.timid = window.requestAnimFrame(vxl.go.render);
	},
	
	cancelRender : function(){
		//message('vxl.go.cancelRender invoked'); 
		window.cancelRequestAnimFrame(this.timid);    // not implemented yet in any browser :(
	},
	
	slowRendering : function(){

		/*vxl.go._rates = [];
		for(var i = 0; i < vxl.go.views.length; i++){
		    if (vxl.go.views[i].renderer.mode == vxl.def.renderer.mode.ANIMFRAME) continue;
			vxl.go.console('vxl.go.slowRendering: slow rendering on view '+vxl.go.views[i].name,true);
			vxl.go._rates.push(vxl.go.views[i].renderer.renderRate);
			vxl.go.views[i].renderer.setRenderRate(vxl.def.renderer.rate.SLOW);
		}*/
	},
	
	normalRendering : function(){
		
		/*for(var i = 0; i < vxl.go.views.length; i++){
		    if (vxl.go.views[i].renderer.mode == vxl.def.renderer.mode.ANIMFRAME) continue;
			vxl.go.console('vxl.go.normalRendering: go back to normal rendering on view '+vxl.go.views[i].name,true);
			vxl.go.views[i].renderer.setRenderRate(vxl.go._rates[i]);
		}*/
	},
	
	console : function(txt,flag) { 
		if (this.debug == true || flag){
			console.info(txt);
		}
	}
},

/**
* @namespace Voxelent Current Objects
* @property {vxlScene}          scene       the current scene
* @property {vxlView}           view        the current view
* @property {vxlCamera}         camera      the current camera
* @property {vxlActor}          actor       the current actor
* @property {vxlFrameAnimation} animation   the current animation
*/
c : {
	scene		: undefined,
	view		: undefined,
	camera 		: undefined,
	actor		: undefined,  
	animation 	: undefined
},
/**
 * Utility functions
 * @namespace Voxelent Util methods
 * 
 */
util : {
    /**
     * Formats Arrays, vec3 and vec4 for display
     * 
     * @param {Array, vec3, vec4} arr the object to format
     * @param {Number} digits the number of decimal figures
     */
	format: function(arr, digits){
		var p = Math.pow(10,digits);
		if (typeof(arr) == 'object'){
			
			var result = '['; 
			for (var i=0; i < arr.length-1; i+=1){
				result  += Math.round(arr[i] * p) / p + ', '; 
			}
			result += Math.round(arr[arr.length-1] * p) / p  + ']'
		}
		else if (typeof(arr) == 'number'){
			result = '[' + Math.round(arr * p) / p  + ']';
		}
		return result;
	},
	
	/**
	 * Creates a vector from a set of parameters
	 * @param {Array, vec3, Number} x it can be an Array, a vec3 or a number
	 * @param {Number} y if x is a number, this parameter corresponds to the y-component
	 * @param {Number} z if x is a number, this parameter corresponds to the z-component
	 */
	createVec3: function(x,y,z){
	    var vvv = vec3.create();
	    if (x instanceof Array){
            vec3.set(vec3.create(x), vvv)
        }
        else if (x instanceof determineMatrixArrayType()){
            vec3.set(x, vvv)
        }
        else{
            vec3.set(vec3.createFrom(x,y,z), vvv);
        }
        return vvv;
	}
}

};

Array.prototype.max = function(){
	return Math.max.apply(null, this);
};

Array.prototype.min = function(){
	return Math.min.apply(null, this);
};

Array.prototype.hasObject = (
  !Array.indexOf ? function (o)
  {
    var l = this.length + 1;
    while (l -= 1)
    {
        if (this[l - 1] === o)
        {
            return true;
        }
    }
    return false;
  } : function (o)
  {
    return (this.indexOf(o) !== -1);
  }
);

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
})();


$(window).bind('focus', vxl.go.normalRendering);
$(window).bind('blur', vxl.go.slowRendering);

vxl.go.notifier = new vxlNotifier();

/**
 * <p> 
 * Handles asynchronous communication among classes in Voxelent 
 * using a publisher-subscriber mechanism
 * </p>
 * 
 * @class
 * @constructor
 */
function vxlNotifier(){
	this.targetList = {};
	this.sourceList = {};
    
};

/**
 * <p>Used by any class to declare the events that the class will listen for.</p>
  
 * @param {Object} list
 * @param {Object} receiver
 */
vxlNotifier.prototype.subscribe = function(list,receiver){
	if (typeof(list)=='string'){
		this.addTarget(list,receiver);
	}
	else if (list instanceof Array){
		for (var i=0;i<list.length;i+=1){
			this.addTarget(list[i],receiver);
		}
	}
	else {
		throw 'vxlNotifier.receives: this method receives a string or a list of strings'
	}
};

/**
 * <p>Used by any class to declare the events that the class will generate</p> 
 * @param {Object} list
 * @param {Object} sender
 */
vxlNotifier.prototype.publish = function(list,sender){
	if (typeof(list)== 'string'){
		this.addSource(list,sender);
	}
	else if (list instanceof Array){
		for (var i=0;i<list.length;i+=1){
			this.addSource(list[i],sender);
		}
	}
	else {
		throw 'vxlNotifier.sends: this method receives a string or a list of strings'
	}
}


/**
 * Any class can use this method to tell the notifier that it will listen to 
 * a particular event.
 * 
 * @param {Object} event the event the class will listen to
 * @param {Object} target the object that will listen for the event
 */
vxlNotifier.prototype.addTarget = function(event, target){
	vxl.go.console('vxlNotifier: adding target for event '+event);
	var targetList = this.targetList;
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	targetList[event].push(target);
};


/**
 * Any class can use this method to tell the notifier that it will emit a particular event
 * 
 * @param {Object} event the event to emit
 * @param {Object} src the object that will emit the event
 */
vxlNotifier.prototype.addSource = function(event,src){
	vxl.go.console('vxlNotifier: adding source for event '+event);
	var targetList = this.targetList;
	var sourceList = this.sourceList;
	
	if (sourceList[event]== undefined){
		sourceList[event] = [];
	}
	
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	
	sourceList[event].push(src);
	
	$(document).bind(event, function(e,event,src,targetList){
		for (var index=0;index<targetList[event].length;index++){
			targetList[event][index].handleEvent(event,src);
		}
	});
};

/**
 * <p>Invoked by any class when it needs to emit an event that should be propagated to other
 * objects in the library</p>
 * 
 * <p>The notifier will first verify if the object emitting the event has been authorized to do so.
 * This is, the object should have registered using either <code>addSource</code> or <code>sends</code>.
 * After that, the notifier will retrieve a list of the objects that have registered as listeners of 
 * the particular event and fires the event to them using JQuery.
 * </p>
 *  
 * @param {Object} event
 * @param {Object} src
 */
vxlNotifier.prototype.fire = function(event, src){
	var targetList = this.targetList;
	
    var idx = this.sourceList[event].indexOf(src);
    if (idx == -1){
    	throw 'The source '+src+' is not registered to trigger the event '+event+'. Did you use vxlNotifier.addSource?';
    }
	vxl.go.console('vxlNotifier: firing ' +event);
	$(document).trigger(event,[event,src,targetList]);
};

/**
 * Gets a list of the events handled by this vxlNotifier 
 */
vxlNotifier.prototype.getEvents = function(){
	var list = [];
	for (var event in this.sourceList){
		list.push(event);
	}
	return list;
};


/**
 * Get a list of the objects that are currently registered to listen for a particular event 
 * @param {Object} event the event in question
 */
vxlNotifier.prototype.getTargetsFor = function(event){
	var targets = this.targetList[event];
	var list = [];
	for (var index=0;index<targets.length;index++){
		list.push(getObjectName(targets[index]));
	}
	return list;
};


 

    



/**
 * @fileoverview gl-matrix - High performance matrix and vector operations for WebGL
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 1.3.4
 */

/*
 * Copyright (c) 2012 Brandon Jones, Colin MacKenzie IV
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// Updated to use a modification of the "returnExportsGlobal" pattern from https://github.com/umdjs/umd

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return factory(root);
        });
    } else {
        // Browser globals
        factory(root);
    }
}(this, function (root) {
    "use strict";

    var glMath = {};
    (function() {
        if (typeof(Float32Array) != 'undefined') {
            var y = new Float32Array(1);
            var i = new Int32Array(y.buffer);

            /**
             * Fast way to calculate the inverse square root,
             * see http://jsperf.com/inverse-square-root/5
             *
             * If typed arrays are not available, a slower
             * implementation will be used.
             *
             * @param {Number} number the number
             * @returns {Number} Inverse square root
             */
            glMath.invsqrt = function(number) {
              var x2 = number * 0.5;
              y[0] = number;
              var threehalfs = 1.5;

              i[0] = 0x5f3759df - (i[0] >> 1);

              var number2 = y[0];

              return number2 * (threehalfs - (x2 * number2 * number2));
            };
        } else {
            glMath.invsqrt = function(number) { return 1.0 / Math.sqrt(number); };
        }
    })();

    /**
     * @class System-specific optimal array type
     * @name MatrixArray
     */
    var MatrixArray = null;
    
    // explicitly sets and returns the type of array to use within glMatrix
    function setMatrixArrayType(type) {
        MatrixArray = type;
        return MatrixArray;
    }

    // auto-detects and returns the best type of array to use within glMatrix, falling
    // back to Array if typed arrays are unsupported
    function determineMatrixArrayType() {
        MatrixArray = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
        return MatrixArray;
    }
    
    determineMatrixArrayType();

    /**
     * @class 3 Dimensional Vector
     * @name vec3
     */
    var vec3 = {};
     
    /**
     * Creates a new instance of a vec3 using the default array type
     * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
     *
     * @param {vec3} [vec] vec3 containing values to initialize with
     *
     * @returns {vec3} New vec3
     */
    vec3.create = function (vec) {
        var dest = new MatrixArray(3);

        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
            dest[2] = vec[2];
        } else {
            dest[0] = dest[1] = dest[2] = 0;
        }

        return dest;
    };

    /**
     * Creates a new instance of a vec3, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value
     * @param {number} z Z value

     * @returns {vec3} New vec3
     */
    vec3.createFrom = function (x, y, z) {
        var dest = new MatrixArray(3);

        dest[0] = x;
        dest[1] = y;
        dest[2] = z;

        return dest;
    };

    /**
     * Copies the values of one vec3 to another
     *
     * @param {vec3} vec vec3 containing values to copy
     * @param {vec3} dest vec3 receiving copied values
     *
     * @returns {vec3} dest
     */
    vec3.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        dest[2] = vec[2];

        return dest;
    };

    /**
     * Performs a vector addition
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.add = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] += vec2[0];
            vec[1] += vec2[1];
            vec[2] += vec2[2];
            return vec;
        }

        dest[0] = vec[0] + vec2[0];
        dest[1] = vec[1] + vec2[1];
        dest[2] = vec[2] + vec2[2];
        return dest;
    };

    /**
     * Performs a vector subtraction
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.subtract = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] -= vec2[0];
            vec[1] -= vec2[1];
            vec[2] -= vec2[2];
            return vec;
        }

        dest[0] = vec[0] - vec2[0];
        dest[1] = vec[1] - vec2[1];
        dest[2] = vec[2] - vec2[2];
        return dest;
    };

    /**
     * Performs a vector multiplication
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.multiply = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] *= vec2[0];
            vec[1] *= vec2[1];
            vec[2] *= vec2[2];
            return vec;
        }

        dest[0] = vec[0] * vec2[0];
        dest[1] = vec[1] * vec2[1];
        dest[2] = vec[2] * vec2[2];
        return dest;
    };

    /**
     * Negates the components of a vec3
     *
     * @param {vec3} vec vec3 to negate
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.negate = function (vec, dest) {
        if (!dest) { dest = vec; }

        dest[0] = -vec[0];
        dest[1] = -vec[1];
        dest[2] = -vec[2];
        return dest;
    };

    /**
     * Multiplies the components of a vec3 by a scalar value
     *
     * @param {vec3} vec vec3 to scale
     * @param {number} val Value to scale by
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.scale = function (vec, val, dest) {
        if (!dest || vec === dest) {
            vec[0] *= val;
            vec[1] *= val;
            vec[2] *= val;
            return vec;
        }

        dest[0] = vec[0] * val;
        dest[1] = vec[1] * val;
        dest[2] = vec[2] * val;
        return dest;
    };

    /**
     * Generates a unit vector of the same direction as the provided vec3
     * If vector length is 0, returns [0, 0, 0]
     *
     * @param {vec3} vec vec3 to normalize
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.normalize = function (vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2],
            len = Math.sqrt(x * x + y * y + z * z);

        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        } else if (len === 1) {
            dest[0] = x;
            dest[1] = y;
            dest[2] = z;
            return dest;
        }

        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        return dest;
    };

    /**
     * Generates the cross product of two vec3s
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.cross = function (vec, vec2, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2],
            x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

        dest[0] = y * z2 - z * y2;
        dest[1] = z * x2 - x * z2;
        dest[2] = x * y2 - y * x2;
        return dest;
    };

    /**
     * Caclulates the length of a vec3
     *
     * @param {vec3} vec vec3 to calculate length of
     *
     * @returns {number} Length of vec
     */
    vec3.length = function (vec) {
        var x = vec[0], y = vec[1], z = vec[2];
        return Math.sqrt(x * x + y * y + z * z);
    };

    /**
     * Caclulates the dot product of two vec3s
     *
     * @param {vec3} vec First operand
     * @param {vec3} vec2 Second operand
     *
     * @returns {number} Dot product of vec and vec2
     */
    vec3.dot = function (vec, vec2) {
        return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
    };

    /**
     * Generates a unit vector pointing from one vector to another
     *
     * @param {vec3} vec Origin vec3
     * @param {vec3} vec2 vec3 to point to
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.direction = function (vec, vec2, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0] - vec2[0],
            y = vec[1] - vec2[1],
            z = vec[2] - vec2[2],
            len = Math.sqrt(x * x + y * y + z * z);

        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        }

        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        return dest;
    };

    /**
     * Performs a linear interpolation between two vec3
     *
     * @param {vec3} vec First vector
     * @param {vec3} vec2 Second vector
     * @param {number} lerp Interpolation amount between the two inputs
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.lerp = function (vec, vec2, lerp, dest) {
        if (!dest) { dest = vec; }

        dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
        dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
        dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

        return dest;
    };

    /**
     * Calculates the euclidian distance between two vec3
     *
     * Params:
     * @param {vec3} vec First vector
     * @param {vec3} vec2 Second vector
     *
     * @returns {number} Distance between vec and vec2
     */
    vec3.dist = function (vec, vec2) {
        var x = vec2[0] - vec[0],
            y = vec2[1] - vec[1],
            z = vec2[2] - vec[2];
            
        return Math.sqrt(x*x + y*y + z*z);
    };

    // Pre-allocated to prevent unecessary garbage collection
    var unprojectMat = null;
    var unprojectVec = new MatrixArray(4);
    /**
     * Projects the specified vec3 from screen space into object space
     * Based on the <a href="http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup">Mesa gluUnProject implementation</a>
     *
     * @param {vec3} vec Screen-space vector to project
     * @param {mat4} view View matrix
     * @param {mat4} proj Projection matrix
     * @param {vec4} viewport Viewport as given to gl.viewport [x, y, width, height]
     * @param {vec3} [dest] vec3 receiving unprojected result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    vec3.unproject = function (vec, view, proj, viewport, dest) {
        if (!dest) { dest = vec; }

        if(!unprojectMat) {
            unprojectMat = mat4.create();
        }

        var m = unprojectMat;
        var v = unprojectVec;
        
        v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
        v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
        v[2] = 2.0 * vec[2] - 1.0;
        v[3] = 1.0;
        
        mat4.multiply(proj, view, m);
        if(!mat4.inverse(m)) { return null; }
        
        mat4.multiplyVec4(m, v);
        if(v[3] === 0.0) { return null; }

        dest[0] = v[0] / v[3];
        dest[1] = v[1] / v[3];
        dest[2] = v[2] / v[3];
        
        return dest;
    };

    var xUnitVec3 = vec3.createFrom(1,0,0);
    var yUnitVec3 = vec3.createFrom(0,1,0);
    var zUnitVec3 = vec3.createFrom(0,0,1);

    /**
     * Generates a quaternion of rotation between two given normalized vectors
     *
     * @param {vec3} a Normalized source vector
     * @param {vec3} b Normalized target vector
     * @param {quat4} [dest] quat4 receiving operation result.
     *
     * @returns {quat4} dest if specified, a new quat4 otherwise
     */
    vec3.rotationTo = function (a, b, dest) {
        if (!dest) { dest = quat4.create(); }

        var d = vec3.dot(a, b);
        var axis = vec3.create();
        if (d >= 1.0) {
            quat4.set(identityQuat4, dest);
        } else if (d < (0.000001 - 1.0)) {
            vec3.cross(xUnitVec3, a, axis);
            if (axis.length < 0.000001)
                vec3.cross(yUnitVec3, a, axis);
            if (axis.length < 0.000001)
                vec3.cross(zUnitVec3, a, axis);
            vec3.normalize(axis);
            quat4.fromAxisAngle(axis, Math.PI, dest);
        } else {
            var s = Math.sqrt((1.0 + d) * 2.0);
            var sInv = 1.0 / s;
            vec3.cross(a, b, axis);
            dest[0] = axis[0] * sInv;
            dest[1] = axis[1] * sInv;
            dest[2] = axis[2] * sInv;
            dest[3] = s * 0.5;
            quat4.normalize(dest);
        }
        if (dest[3] > 1.0) dest[3] = 1.0;
        else if (dest[3] < -1.0) dest[3] = -1.0;
        return dest;
    };

    /**
     * Returns a string representation of a vector
     *
     * @param {vec3} vec Vector to represent as a string
     *
     * @returns {string} String representation of vec
     */
    vec3.str = function (vec) {
        return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
    };

    /**
     * @class 3x3 Matrix
     * @name mat3
     */
    var mat3 = {};

    /**
     * Creates a new instance of a mat3 using the default array type
     * Any javascript array-like object containing at least 9 numeric elements can serve as a mat3
     *
     * @param {mat3} [mat] mat3 containing values to initialize with
     *
     * @returns {mat3} New mat3
     */
    mat3.create = function (mat) {
        var dest = new MatrixArray(9);

        if (mat) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8];
        } else {
            dest[0] = dest[1] =
            dest[2] = dest[3] =
            dest[4] = dest[5] =
            dest[6] = dest[7] =
            dest[8] = 0;
        }

        return dest;
    };

    /**
     * Creates a new instance of a mat3, initializing it with the given arguments
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22

     * @returns {mat3} New mat3
     */
    mat3.createFrom = function (m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        var dest = new MatrixArray(9);

        dest[0] = m00;
        dest[1] = m01;
        dest[2] = m02;
        dest[3] = m10;
        dest[4] = m11;
        dest[5] = m12;
        dest[6] = m20;
        dest[7] = m21;
        dest[8] = m22;

        return dest;
    };

    /**
     * Calculates the determinant of a mat3
     *
     * @param {mat3} mat mat3 to calculate determinant of
     *
     * @returns {Number} determinant of mat
     */
    mat3.determinant = function (mat) {
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[3], a11 = mat[4], a12 = mat[5],
            a20 = mat[6], a21 = mat[7], a22 = mat[8];

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    };

    /**
     * Calculates the inverse matrix of a mat3
     *
     * @param {mat3} mat mat3 to calculate inverse of
     * @param {mat3} [dest] mat3 receiving inverse matrix. If not specified result is written to mat
     *
     * @param {mat3} dest is specified, mat otherwise, null if matrix cannot be inverted
     */
    mat3.inverse = function (mat, dest) {
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[3], a11 = mat[4], a12 = mat[5],
            a20 = mat[6], a21 = mat[7], a22 = mat[8],

            b01 = a22 * a11 - a12 * a21,
            b11 = -a22 * a10 + a12 * a20,
            b21 = a21 * a10 - a11 * a20,

            d = a00 * b01 + a01 * b11 + a02 * b21,
            id;

        if (!d) { return null; }
        id = 1 / d;

        if (!dest) { dest = mat3.create(); }

        dest[0] = b01 * id;
        dest[1] = (-a22 * a01 + a02 * a21) * id;
        dest[2] = (a12 * a01 - a02 * a11) * id;
        dest[3] = b11 * id;
        dest[4] = (a22 * a00 - a02 * a20) * id;
        dest[5] = (-a12 * a00 + a02 * a10) * id;
        dest[6] = b21 * id;
        dest[7] = (-a21 * a00 + a01 * a20) * id;
        dest[8] = (a11 * a00 - a01 * a10) * id;
        return dest;
    };
    
    /**
     * Performs a matrix multiplication
     *
     * @param {mat3} mat First operand
     * @param {mat3} mat2 Second operand
     * @param {mat3} [dest] mat3 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat3} dest if specified, mat otherwise
     */
    mat3.multiply = function (mat, mat2, dest) {
        if (!dest) { dest = mat; }
        

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[3], a11 = mat[4], a12 = mat[5],
            a20 = mat[6], a21 = mat[7], a22 = mat[8],

            b00 = mat2[0], b01 = mat2[1], b02 = mat2[2],
            b10 = mat2[3], b11 = mat2[4], b12 = mat2[5],
            b20 = mat2[6], b21 = mat2[7], b22 = mat2[8];

        dest[0] = b00 * a00 + b01 * a10 + b02 * a20;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22;

        dest[3] = b10 * a00 + b11 * a10 + b12 * a20;
        dest[4] = b10 * a01 + b11 * a11 + b12 * a21;
        dest[5] = b10 * a02 + b11 * a12 + b12 * a22;

        dest[6] = b20 * a00 + b21 * a10 + b22 * a20;
        dest[7] = b20 * a01 + b21 * a11 + b22 * a21;
        dest[8] = b20 * a02 + b21 * a12 + b22 * a22;

        return dest;
    };

    /**
     * Transforms the vec2 according to the given mat3.
     *
     * @param {mat3} matrix mat3 to multiply against
     * @param {vec2} vec    the vector to multiply
     * @param {vec2} [dest] an optional receiving vector. If not given, vec is used.
     *
     * @returns {vec2} The multiplication result
     **/
    mat3.multiplyVec2 = function(matrix, vec, dest) {
      if (!dest) dest = vec;
      var x = vec[0], y = vec[1];
      dest[0] = x * matrix[0] + y * matrix[3] + matrix[6];
      dest[1] = x * matrix[1] + y * matrix[4] + matrix[7];
      return dest;
    };

    /**
     * Transforms the vec3 according to the given mat3
     *
     * @param {mat3} matrix mat3 to multiply against
     * @param {vec3} vec    the vector to multiply
     * @param {vec3} [dest] an optional receiving vector. If not given, vec is used.
     *
     * @returns {vec3} The multiplication result
     **/
    mat3.multiplyVec3 = function(matrix, vec, dest) {
      if (!dest) dest = vec;
      var x = vec[0], y = vec[1], z = vec[2];
      dest[0] = x * matrix[0] + y * matrix[3] + z * matrix[6];
      dest[1] = x * matrix[1] + y * matrix[4] + z * matrix[7];
      dest[2] = x * matrix[2] + y * matrix[5] + z * matrix[8];
      
      return dest;
    };

    /**
     * Copies the values of one mat3 to another
     *
     * @param {mat3} mat mat3 containing values to copy
     * @param {mat3} dest mat3 receiving copied values
     *
     * @returns {mat3} dest
     */
    mat3.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        return dest;
    };

    /**
     * Sets a mat3 to an identity matrix
     *
     * @param {mat3} dest mat3 to set
     *
     * @returns dest if specified, otherwise a new mat3
     */
    mat3.identity = function (dest) {
        if (!dest) { dest = mat3.create(); }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 1;
        dest[5] = 0;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 1;
        return dest;
    };

    /**
     * Transposes a mat3 (flips the values over the diagonal)
     *
     * Params:
     * @param {mat3} mat mat3 to transpose
     * @param {mat3} [dest] mat3 receiving transposed values. If not specified result is written to mat
     *
     * @returns {mat3} dest is specified, mat otherwise
     */
    mat3.transpose = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (!dest || mat === dest) {
            var a01 = mat[1], a02 = mat[2],
                a12 = mat[5];

            mat[1] = mat[3];
            mat[2] = mat[6];
            mat[3] = a01;
            mat[5] = mat[7];
            mat[6] = a02;
            mat[7] = a12;
            return mat;
        }

        dest[0] = mat[0];
        dest[1] = mat[3];
        dest[2] = mat[6];
        dest[3] = mat[1];
        dest[4] = mat[4];
        dest[5] = mat[7];
        dest[6] = mat[2];
        dest[7] = mat[5];
        dest[8] = mat[8];
        return dest;
    };

    /**
     * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
     *
     * @param {mat3} mat mat3 containing values to copy
     * @param {mat4} [dest] mat4 receiving copied values
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat3.toMat4 = function (mat, dest) {
        if (!dest) { dest = mat4.create(); }

        dest[15] = 1;
        dest[14] = 0;
        dest[13] = 0;
        dest[12] = 0;

        dest[11] = 0;
        dest[10] = mat[8];
        dest[9] = mat[7];
        dest[8] = mat[6];

        dest[7] = 0;
        dest[6] = mat[5];
        dest[5] = mat[4];
        dest[4] = mat[3];

        dest[3] = 0;
        dest[2] = mat[2];
        dest[1] = mat[1];
        dest[0] = mat[0];

        return dest;
    };

    /**
     * Returns a string representation of a mat3
     *
     * @param {mat3} mat mat3 to represent as a string
     *
     * @param {string} String representation of mat
     */
    mat3.str = function (mat) {
        return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
            ', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] +
            ', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
    };

    /**
     * @class 4x4 Matrix
     * @name mat4
     */
    var mat4 = {};

    /**
     * Creates a new instance of a mat4 using the default array type
     * Any javascript array-like object containing at least 16 numeric elements can serve as a mat4
     *
     * @param {mat4} [mat] mat4 containing values to initialize with
     *
     * @returns {mat4} New mat4
     */
    mat4.create = function (mat) {
        var dest = new MatrixArray(16);

        if(arguments.length === 4) {
            dest[0] = arguments[0];
            dest[1] = arguments[1];
            dest[2] = arguments[2];
            dest[3] = arguments[3];
            dest[4] = arguments[4];
            dest[5] = arguments[5];
            dest[6] = arguments[6];
            dest[7] = arguments[7];
            dest[8] = arguments[8];
            dest[9] = arguments[9];
            dest[10] = arguments[10];
            dest[11] = arguments[11];
            dest[12] = arguments[12];
            dest[13] = arguments[13];
            dest[14] = arguments[14];
            dest[15] = arguments[15];
        } else if (mat) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8];
            dest[9] = mat[9];
            dest[10] = mat[10];
            dest[11] = mat[11];
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        return dest;
    };

    /**
     * Creates a new instance of a mat4, initializing it with the given arguments
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m02
     * @param {number} m03
     * @param {number} m10
     * @param {number} m11
     * @param {number} m12
     * @param {number} m13
     * @param {number} m20
     * @param {number} m21
     * @param {number} m22
     * @param {number} m23
     * @param {number} m30
     * @param {number} m31
     * @param {number} m32
     * @param {number} m33

     * @returns {mat4} New mat4
     */
    mat4.createFrom = function (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
        var dest = new MatrixArray(16);

        dest[0] = m00;
        dest[1] = m01;
        dest[2] = m02;
        dest[3] = m03;
        dest[4] = m10;
        dest[5] = m11;
        dest[6] = m12;
        dest[7] = m13;
        dest[8] = m20;
        dest[9] = m21;
        dest[10] = m22;
        dest[11] = m23;
        dest[12] = m30;
        dest[13] = m31;
        dest[14] = m32;
        dest[15] = m33;

        return dest;
    };

    /**
     * Copies the values of one mat4 to another
     *
     * @param {mat4} mat mat4 containing values to copy
     * @param {mat4} dest mat4 receiving copied values
     *
     * @returns {mat4} dest
     */
    mat4.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest;
    };

    /**
     * Sets a mat4 to an identity matrix
     *
     * @param {mat4} dest mat4 to set
     *
     * @returns {mat4} dest
     */
    mat4.identity = function (dest) {
        if (!dest) { dest = mat4.create(); }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 1;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = 1;
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest;
    };

    /**
     * Transposes a mat4 (flips the values over the diagonal)
     *
     * @param {mat4} mat mat4 to transpose
     * @param {mat4} [dest] mat4 receiving transposed values. If not specified result is written to mat
     *
     * @param {mat4} dest is specified, mat otherwise
     */
    mat4.transpose = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (!dest || mat === dest) {
            var a01 = mat[1], a02 = mat[2], a03 = mat[3],
                a12 = mat[6], a13 = mat[7],
                a23 = mat[11];

            mat[1] = mat[4];
            mat[2] = mat[8];
            mat[3] = mat[12];
            mat[4] = a01;
            mat[6] = mat[9];
            mat[7] = mat[13];
            mat[8] = a02;
            mat[9] = a12;
            mat[11] = mat[14];
            mat[12] = a03;
            mat[13] = a13;
            mat[14] = a23;
            return mat;
        }

        dest[0] = mat[0];
        dest[1] = mat[4];
        dest[2] = mat[8];
        dest[3] = mat[12];
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = mat[9];
        dest[7] = mat[13];
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = mat[14];
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest;
    };

    /**
     * Calculates the determinant of a mat4
     *
     * @param {mat4} mat mat4 to calculate determinant of
     *
     * @returns {number} determinant of mat
     */
    mat4.determinant = function (mat) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
            a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
            a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

        return (a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
                a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
                a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
                a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
                a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
                a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33);
    };

    /**
     * Calculates the inverse matrix of a mat4
     *
     * @param {mat4} mat mat4 to calculate inverse of
     * @param {mat4} [dest] mat4 receiving inverse matrix. If not specified result is written to mat
     *
     * @param {mat4} dest is specified, mat otherwise, null if matrix cannot be inverted
     */
    mat4.inverse = function (mat, dest) {
        if (!dest) { dest = mat; }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
            a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
            a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,

            d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
            invDet;

            // Calculate the determinant
            if (!d) { return null; }
            invDet = 1 / d;

        dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

        return dest;
    };

    /**
     * Copies the upper 3x3 elements of a mat4 into another mat4
     *
     * @param {mat4} mat mat4 containing values to copy
     * @param {mat4} [dest] mat4 receiving copied values
     *
     * @returns {mat4} dest is specified, a new mat4 otherwise
     */
    mat4.toRotationMat = function (mat, dest) {
        if (!dest) { dest = mat4.create(); }

        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;

        return dest;
    };

    /**
     * Copies the upper 3x3 elements of a mat4 into a mat3
     *
     * @param {mat4} mat mat4 containing values to copy
     * @param {mat3} [dest] mat3 receiving copied values
     *
     * @returns {mat3} dest is specified, a new mat3 otherwise
     */
    mat4.toMat3 = function (mat, dest) {
        if (!dest) { dest = mat3.create(); }

        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[4];
        dest[4] = mat[5];
        dest[5] = mat[6];
        dest[6] = mat[8];
        dest[7] = mat[9];
        dest[8] = mat[10];

        return dest;
    };

    /**
     * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
     * The resulting matrix is useful for calculating transformed normals
     *
     * Params:
     * @param {mat4} mat mat4 containing values to invert and copy
     * @param {mat3} [dest] mat3 receiving values
     *
     * @returns {mat3} dest is specified, a new mat3 otherwise, null if the matrix cannot be inverted
     */
    mat4.toInverseMat3 = function (mat, dest) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2],
            a10 = mat[4], a11 = mat[5], a12 = mat[6],
            a20 = mat[8], a21 = mat[9], a22 = mat[10],

            b01 = a22 * a11 - a12 * a21,
            b11 = -a22 * a10 + a12 * a20,
            b21 = a21 * a10 - a11 * a20,

            d = a00 * b01 + a01 * b11 + a02 * b21,
            id;

        if (!d) { return null; }
        id = 1 / d;

        if (!dest) { dest = mat3.create(); }

        dest[0] = b01 * id;
        dest[1] = (-a22 * a01 + a02 * a21) * id;
        dest[2] = (a12 * a01 - a02 * a11) * id;
        dest[3] = b11 * id;
        dest[4] = (a22 * a00 - a02 * a20) * id;
        dest[5] = (-a12 * a00 + a02 * a10) * id;
        dest[6] = b21 * id;
        dest[7] = (-a21 * a00 + a01 * a20) * id;
        dest[8] = (a11 * a00 - a01 * a10) * id;

        return dest;
    };

    /**
     * Performs a matrix multiplication
     *
     * @param {mat4} mat First operand
     * @param {mat4} mat2 Second operand
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.multiply = function (mat, mat2, dest) {
        if (!dest) { dest = mat; }

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
            a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
            a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

            b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3],
            b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7],
            b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11],
            b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];

        dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return dest;
    };

    /**
     * Transforms a vec3 with the given matrix
     * 4th vector component is implicitly '1'
     *
     * @param {mat4} mat mat4 to transform the vector with
     * @param {vec3} vec vec3 to transform
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec3} dest if specified, vec otherwise
     */
    mat4.multiplyVec3 = function (mat, vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2];

        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];

        return dest;
    };

    /**
     * Transforms a vec4 with the given matrix
     *
     * @param {mat4} mat mat4 to transform the vector with
     * @param {vec4} vec vec4 to transform
     * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec4} dest if specified, vec otherwise
     */
    mat4.multiplyVec4 = function (mat, vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2], w = vec[3];

        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
        dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;

        return dest;
    };

    /**
     * Translates a matrix by the given vector
     *
     * @param {mat4} mat mat4 to translate
     * @param {vec3} vec vec3 specifying the translation
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.translate = function (mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2],
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23;

        if (!dest || mat === dest) {
            mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
            mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
            mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
            mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
            return mat;
        }

        a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
        a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
        a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

        dest[0] = a00; dest[1] = a01; dest[2] = a02; dest[3] = a03;
        dest[4] = a10; dest[5] = a11; dest[6] = a12; dest[7] = a13;
        dest[8] = a20; dest[9] = a21; dest[10] = a22; dest[11] = a23;

        dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
        dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
        dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
        dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
        return dest;
    };

    /**
     * Scales a matrix by the given vector
     *
     * @param {mat4} mat mat4 to scale
     * @param {vec3} vec vec3 specifying the scale for each axis
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @param {mat4} dest if specified, mat otherwise
     */
    mat4.scale = function (mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2];

        if (!dest || mat === dest) {
            mat[0] *= x;
            mat[1] *= x;
            mat[2] *= x;
            mat[3] *= x;
            mat[4] *= y;
            mat[5] *= y;
            mat[6] *= y;
            mat[7] *= y;
            mat[8] *= z;
            mat[9] *= z;
            mat[10] *= z;
            mat[11] *= z;
            return mat;
        }

        dest[0] = mat[0] * x;
        dest[1] = mat[1] * x;
        dest[2] = mat[2] * x;
        dest[3] = mat[3] * x;
        dest[4] = mat[4] * y;
        dest[5] = mat[5] * y;
        dest[6] = mat[6] * y;
        dest[7] = mat[7] * y;
        dest[8] = mat[8] * z;
        dest[9] = mat[9] * z;
        dest[10] = mat[10] * z;
        dest[11] = mat[11] * z;
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the specified axis
     * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {vec3} axis vec3 representing the axis to rotate around
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotate = function (mat, angle, axis, dest) {
        var x = axis[0], y = axis[1], z = axis[2],
            len = Math.sqrt(x * x + y * y + z * z),
            s, c, t,
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            b00, b01, b02,
            b10, b11, b12,
            b20, b21, b22;

        if (!len) { return null; }
        if (len !== 1) {
            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;
        }

        s = Math.sin(angle);
        c = Math.cos(angle);
        t = 1 - c;

        a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
        a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
        a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform rotation-specific matrix multiplication
        dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
        dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
        dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
        dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

        dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
        dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
        dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
        dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

        dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
        dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
        dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
        dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotateX = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a10 = mat[4],
            a11 = mat[5],
            a12 = mat[6],
            a13 = mat[7],
            a20 = mat[8],
            a21 = mat[9],
            a22 = mat[10],
            a23 = mat[11];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];

            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform axis-specific matrix multiplication
        dest[4] = a10 * c + a20 * s;
        dest[5] = a11 * c + a21 * s;
        dest[6] = a12 * c + a22 * s;
        dest[7] = a13 * c + a23 * s;

        dest[8] = a10 * -s + a20 * c;
        dest[9] = a11 * -s + a21 * c;
        dest[10] = a12 * -s + a22 * c;
        dest[11] = a13 * -s + a23 * c;
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotateY = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a00 = mat[0],
            a01 = mat[1],
            a02 = mat[2],
            a03 = mat[3],
            a20 = mat[8],
            a21 = mat[9],
            a22 = mat[10],
            a23 = mat[11];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];

            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform axis-specific matrix multiplication
        dest[0] = a00 * c + a20 * -s;
        dest[1] = a01 * c + a21 * -s;
        dest[2] = a02 * c + a22 * -s;
        dest[3] = a03 * c + a23 * -s;

        dest[8] = a00 * s + a20 * c;
        dest[9] = a01 * s + a21 * c;
        dest[10] = a02 * s + a22 * c;
        dest[11] = a03 * s + a23 * c;
        return dest;
    };

    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} mat mat4 to rotate
     * @param {number} angle Angle (in radians) to rotate
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
     *
     * @returns {mat4} dest if specified, mat otherwise
     */
    mat4.rotateZ = function (mat, angle, dest) {
        var s = Math.sin(angle),
            c = Math.cos(angle),
            a00 = mat[0],
            a01 = mat[1],
            a02 = mat[2],
            a03 = mat[3],
            a10 = mat[4],
            a11 = mat[5],
            a12 = mat[6],
            a13 = mat[7];

        if (!dest) {
            dest = mat;
        } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
            dest[8] = mat[8];
            dest[9] = mat[9];
            dest[10] = mat[10];
            dest[11] = mat[11];

            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15];
        }

        // Perform axis-specific matrix multiplication
        dest[0] = a00 * c + a10 * s;
        dest[1] = a01 * c + a11 * s;
        dest[2] = a02 * c + a12 * s;
        dest[3] = a03 * c + a13 * s;

        dest[4] = a00 * -s + a10 * c;
        dest[5] = a01 * -s + a11 * c;
        dest[6] = a02 * -s + a12 * c;
        dest[7] = a03 * -s + a13 * c;

        return dest;
    };

    /**
     * Generates a frustum matrix with the given bounds
     *
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.frustum = function (left, right, bottom, top, near, far, dest) {
        if (!dest) { dest = mat4.create(); }
        var rl = (right - left),
            tb = (top - bottom),
            fn = (far - near);
        dest[0] = (near * 2) / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = (near * 2) / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = (right + left) / rl;
        dest[9] = (top + bottom) / tb;
        dest[10] = -(far + near) / fn;
        dest[11] = -1;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far * near * 2) / fn;
        dest[15] = 0;
        return dest;
    };

    /**
     * Generates a perspective projection matrix with the given bounds
     *
     * @param {number} fovy Vertical field of view
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.perspective = function (fovy, aspect, near, far, dest) {
        var top = near * Math.tan(fovy * Math.PI / 360.0),
            right = top * aspect;
        return mat4.frustum(-right, right, -top, top, near, far, dest);
    };

    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.ortho = function (left, right, bottom, top, near, far, dest) {
        if (!dest) { dest = mat4.create(); }
        var rl = (right - left),
            tb = (top - bottom),
            fn = (far - near);
        dest[0] = 2 / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 2 / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = -2 / fn;
        dest[11] = 0;
        dest[12] = -(left + right) / rl;
        dest[13] = -(top + bottom) / tb;
        dest[14] = -(far + near) / fn;
        dest[15] = 1;
        return dest;
    };

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     *
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing "up"
     * @param {mat4} [dest] mat4 frustum matrix will be written into
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.lookAt = function (eye, center, up, dest) {
        if (!dest) { dest = mat4.create(); }

        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
            eyex = eye[0],
            eyey = eye[1],
            eyez = eye[2],
            upx = up[0],
            upy = up[1],
            upz = up[2],
            centerx = center[0],
            centery = center[1],
            centerz = center[2];

        if (eyex === centerx && eyey === centery && eyez === centerz) {
            return mat4.identity(dest);
        }

        //vec3.direction(eye, center, z);
        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        // normalize (no check needed for 0 because of early return)
        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        //vec3.normalize(vec3.cross(up, z, x));
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        //vec3.normalize(vec3.cross(z, x, y));
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[3] = 0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[7] = 0;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[11] = 0;
        dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        dest[15] = 1;

        return dest;
    };

    /**
     * Creates a matrix from a quaternion rotation and vector translation
     * This is equivalent to (but much faster than):
     *
     *     mat4.identity(dest);
     *     mat4.translate(dest, vec);
     *     var quatMat = mat4.create();
     *     quat4.toMat4(quat, quatMat);
     *     mat4.multiply(dest, quatMat);
     *
     * @param {quat4} quat Rotation quaternion
     * @param {vec3} vec Translation vector
     * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to a new mat4
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    mat4.fromRotationTranslation = function (quat, vec, dest) {
        if (!dest) { dest = mat4.create(); }

        // Quaternion math
        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = 0;
        dest[4] = xy - wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz + wx;
        dest[7] = 0;
        dest[8] = xz + wy;
        dest[9] = yz - wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;
        dest[12] = vec[0];
        dest[13] = vec[1];
        dest[14] = vec[2];
        dest[15] = 1;
        
        return dest;
    };

    /**
     * Returns a string representation of a mat4
     *
     * @param {mat4} mat mat4 to represent as a string
     *
     * @returns {string} String representation of mat
     */
    mat4.str = function (mat) {
        return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
            ', ' + mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
            ', ' + mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
            ', ' + mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
    };

    /**
     * @class Quaternion
     * @name quat4
     */
    var quat4 = {};

    /**
     * Creates a new instance of a quat4 using the default array type
     * Any javascript array containing at least 4 numeric elements can serve as a quat4
     *
     * @param {quat4} [quat] quat4 containing values to initialize with
     *
     * @returns {quat4} New quat4
     */
    quat4.create = function (quat) {
        var dest = new MatrixArray(4);

        if (quat) {
            dest[0] = quat[0];
            dest[1] = quat[1];
            dest[2] = quat[2];
            dest[3] = quat[3];
        } else {
            dest[0] = dest[1] = dest[2] = dest[3] = 0;
        }

        return dest;
    };

    /**
     * Creates a new instance of a quat4, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value
     * @param {number} z Z value
     * @param {number} w W value

     * @returns {quat4} New quat4
     */
    quat4.createFrom = function (x, y, z, w) {
        var dest = new MatrixArray(4);

        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = w;

        return dest;
    };

    /**
     * Copies the values of one quat4 to another
     *
     * @param {quat4} quat quat4 containing values to copy
     * @param {quat4} dest quat4 receiving copied values
     *
     * @returns {quat4} dest
     */
    quat4.set = function (quat, dest) {
        dest[0] = quat[0];
        dest[1] = quat[1];
        dest[2] = quat[2];
        dest[3] = quat[3];

        return dest;
    };

    /**
     * Creates a new identity Quat4
     *
     * @param {quat4} [dest] quat4 receiving copied values
     *
     * @returns {quat4} dest is specified, new quat4 otherwise
     */
    quat4.identity = function (dest) {
        if (!dest) { dest = quat4.create(); }
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };

    var identityQuat4 = quat4.identity();

    /**
     * Calculates the W component of a quat4 from the X, Y, and Z components.
     * Assumes that quaternion is 1 unit in length.
     * Any existing W component will be ignored.
     *
     * @param {quat4} quat quat4 to calculate W component of
     * @param {quat4} [dest] quat4 receiving calculated values. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.calculateW = function (quat, dest) {
        var x = quat[0], y = quat[1], z = quat[2];

        if (!dest || quat === dest) {
            quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
            return quat;
        }
        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
        return dest;
    };

    /**
     * Calculates the dot product of two quaternions
     *
     * @param {quat4} quat First operand
     * @param {quat4} quat2 Second operand
     *
     * @return {number} Dot product of quat and quat2
     */
    quat4.dot = function(quat, quat2){
        return quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
    };

    /**
     * Calculates the inverse of a quat4
     *
     * @param {quat4} quat quat4 to calculate inverse of
     * @param {quat4} [dest] quat4 receiving inverse values. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.inverse = function(quat, dest) {
        var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3],
            dot = q0*q0 + q1*q1 + q2*q2 + q3*q3,
            invDot = dot ? 1.0/dot : 0;
        
        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
        
        if(!dest || quat === dest) {
            quat[0] *= -invDot;
            quat[1] *= -invDot;
            quat[2] *= -invDot;
            quat[3] *= invDot;
            return quat;
        }
        dest[0] = -quat[0]*invDot;
        dest[1] = -quat[1]*invDot;
        dest[2] = -quat[2]*invDot;
        dest[3] = quat[3]*invDot;
        return dest;
    };


    /**
     * Calculates the conjugate of a quat4
     * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
     *
     * @param {quat4} quat quat4 to calculate conjugate of
     * @param {quat4} [dest] quat4 receiving conjugate values. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.conjugate = function (quat, dest) {
        if (!dest || quat === dest) {
            quat[0] *= -1;
            quat[1] *= -1;
            quat[2] *= -1;
            return quat;
        }
        dest[0] = -quat[0];
        dest[1] = -quat[1];
        dest[2] = -quat[2];
        dest[3] = quat[3];
        return dest;
    };

    /**
     * Calculates the length of a quat4
     *
     * Params:
     * @param {quat4} quat quat4 to calculate length of
     *
     * @returns Length of quat
     */
    quat4.length = function (quat) {
        var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
        return Math.sqrt(x * x + y * y + z * z + w * w);
    };

    /**
     * Generates a unit quaternion of the same direction as the provided quat4
     * If quaternion length is 0, returns [0, 0, 0, 0]
     *
     * @param {quat4} quat quat4 to normalize
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.normalize = function (quat, dest) {
        if (!dest) { dest = quat; }

        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            len = Math.sqrt(x * x + y * y + z * z + w * w);
        if (len === 0) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            return dest;
        }
        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        dest[3] = w * len;

        return dest;
    };

    /**
     * Performs quaternion addition
     *
     * @param {quat4} quat First operand
     * @param {quat4} quat2 Second operand
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.add = function (quat, quat2, dest) {
        if(!dest || quat === dest) {
            quat[0] += quat2[0];
            quat[1] += quat2[1];
            quat[2] += quat2[2];
            quat[3] += quat2[3];
            return quat;
        }
        dest[0] = quat[0]+quat2[0];
        dest[1] = quat[1]+quat2[1];
        dest[2] = quat[2]+quat2[2];
        dest[3] = quat[3]+quat2[3];
        return dest;
    };

    /**
     * Performs a quaternion multiplication
     *
     * @param {quat4} quat First operand
     * @param {quat4} quat2 Second operand
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.multiply = function (quat, quat2, dest) {
        if (!dest) { dest = quat; }

        var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
            qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

        dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return dest;
    };

    /**
     * Transforms a vec3 with the given quaternion
     *
     * @param {quat4} quat quat4 to transform the vector with
     * @param {vec3} vec vec3 to transform
     * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
     *
     * @returns dest if specified, vec otherwise
     */
    quat4.multiplyVec3 = function (quat, vec, dest) {
        if (!dest) { dest = vec; }

        var x = vec[0], y = vec[1], z = vec[2],
            qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3],

            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return dest;
    };

    /**
     * Multiplies the components of a quaternion by a scalar value
     *
     * @param {quat4} quat to scale
     * @param {number} val Value to scale by
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.scale = function (quat, val, dest) {
        if(!dest || quat === dest) {
            quat[0] *= val;
            quat[1] *= val;
            quat[2] *= val;
            quat[3] *= val;
            return quat;
        }
        dest[0] = quat[0]*val;
        dest[1] = quat[1]*val;
        dest[2] = quat[2]*val;
        dest[3] = quat[3]*val;
        return dest;
    };

    /**
     * Calculates a 3x3 matrix from the given quat4
     *
     * @param {quat4} quat quat4 to create matrix from
     * @param {mat3} [dest] mat3 receiving operation result
     *
     * @returns {mat3} dest if specified, a new mat3 otherwise
     */
    quat4.toMat3 = function (quat, dest) {
        if (!dest) { dest = mat3.create(); }

        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;

        dest[3] = xy - wz;
        dest[4] = 1 - (xx + zz);
        dest[5] = yz + wx;

        dest[6] = xz + wy;
        dest[7] = yz - wx;
        dest[8] = 1 - (xx + yy);

        return dest;
    };

    /**
     * Calculates a 4x4 matrix from the given quat4
     *
     * @param {quat4} quat quat4 to create matrix from
     * @param {mat4} [dest] mat4 receiving operation result
     *
     * @returns {mat4} dest if specified, a new mat4 otherwise
     */
    quat4.toMat4 = function (quat, dest) {
        if (!dest) { dest = mat4.create(); }

        var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2;

        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = 0;

        dest[4] = xy - wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz + wx;
        dest[7] = 0;

        dest[8] = xz + wy;
        dest[9] = yz - wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;

        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;

        return dest;
    };

    /**
     * Performs a spherical linear interpolation between two quat4
     *
     * @param {quat4} quat First quaternion
     * @param {quat4} quat2 Second quaternion
     * @param {number} slerp Interpolation amount between the two inputs
     * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
     *
     * @returns {quat4} dest if specified, quat otherwise
     */
    quat4.slerp = function (quat, quat2, slerp, dest) {
        if (!dest) { dest = quat; }

        var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
            halfTheta,
            sinHalfTheta,
            ratioA,
            ratioB;

        if (Math.abs(cosHalfTheta) >= 1.0) {
            if (dest !== quat) {
                dest[0] = quat[0];
                dest[1] = quat[1];
                dest[2] = quat[2];
                dest[3] = quat[3];
            }
            return dest;
        }

        halfTheta = Math.acos(cosHalfTheta);
        sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001) {
            dest[0] = (quat[0] * 0.5 + quat2[0] * 0.5);
            dest[1] = (quat[1] * 0.5 + quat2[1] * 0.5);
            dest[2] = (quat[2] * 0.5 + quat2[2] * 0.5);
            dest[3] = (quat[3] * 0.5 + quat2[3] * 0.5);
            return dest;
        }

        ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
        ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;

        dest[0] = (quat[0] * ratioA + quat2[0] * ratioB);
        dest[1] = (quat[1] * ratioA + quat2[1] * ratioB);
        dest[2] = (quat[2] * ratioA + quat2[2] * ratioB);
        dest[3] = (quat[3] * ratioA + quat2[3] * ratioB);

        return dest;
    };

    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     * If dest is omitted, a new quaternion will be created.
     *
     * @param {mat3}  mat    the rotation matrix
     * @param {quat4} [dest] an optional receiving quaternion
     *
     * @returns {quat4} the quaternion constructed from the rotation matrix
     *
     */
    quat4.fromRotationMatrix = function(mat, dest) {
        if (!dest) dest = quat4.create();
        
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".

        var fTrace = mat[0] + mat[4] + mat[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            dest[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            dest[0] = (mat[7]-mat[5])*fRoot;
            dest[1] = (mat[2]-mat[6])*fRoot;
            dest[2] = (mat[3]-mat[1])*fRoot;
        } else {
            // |w| <= 1/2
            var s_iNext = quat4.fromRotationMatrix.s_iNext = quat4.fromRotationMatrix.s_iNext || [1,2,0];
            var i = 0;
            if ( mat[4] > mat[0] )
              i = 1;
            if ( mat[8] > mat[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(mat[i*3+i]-mat[j*3+j]-mat[k*3+k] + 1.0);
            dest[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            dest[3] = (mat[k*3+j] - mat[j*3+k]) * fRoot;
            dest[j] = (mat[j*3+i] + mat[i*3+j]) * fRoot;
            dest[k] = (mat[k*3+i] + mat[i*3+k]) * fRoot;
        }
        
        return dest;
    };

    /**
     * Alias. See the description for quat4.fromRotationMatrix().
     */
    mat3.toQuat4 = quat4.fromRotationMatrix;

    (function() {
        var mat = mat3.create();
        
        /**
         * Creates a quaternion from the 3 given vectors. They must be perpendicular
         * to one another and represent the X, Y and Z axes.
         *
         * If dest is omitted, a new quat4 will be created.
         *
         * Example: The default OpenGL orientation has a view vector [0, 0, -1],
         * right vector [1, 0, 0], and up vector [0, 1, 0]. A quaternion representing
         * this orientation could be constructed with:
         *
         *   quat = quat4.fromAxes([0, 0, -1], [1, 0, 0], [0, 1, 0], quat4.create());
         *
         * @param {vec3}  view   the view vector, or direction the object is pointing in
         * @param {vec3}  right  the right vector, or direction to the "right" of the object
         * @param {vec3}  up     the up vector, or direction towards the object's "up"
         * @param {quat4} [dest] an optional receiving quat4
         *
         * @returns {quat4} dest
         **/
        quat4.fromAxes = function(view, right, up, dest) {
            mat[0] = right[0];
            mat[3] = right[1];
            mat[6] = right[2];

            mat[1] = up[0];
            mat[4] = up[1];
            mat[7] = up[2];

            mat[2] = view[0];
            mat[5] = view[1];
            mat[8] = view[2];

            return quat4.fromRotationMatrix(mat, dest);
        };
    })();

    /**
     * Sets a quat4 to the Identity and returns it.
     *
     * @param {quat4} [dest] quat4 to set. If omitted, a
     * new quat4 will be created.
     *
     * @returns {quat4} dest
     */
    quat4.identity = function(dest) {
        if (!dest) dest = quat4.create();
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };

    /**
     * Sets a quat4 from the given angle and rotation axis,
     * then returns it. If dest is not given, a new quat4 is created.
     *
     * @param {Number} angle  the angle in radians
     * @param {vec3}   axis   the axis around which to rotate
     * @param {quat4}  [dest] the optional quat4 to store the result
     *
     * @returns {quat4} dest
     **/
    quat4.fromAngleAxis = function(angle, axis, dest) {
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)
        if (!dest) dest = quat4.create();
        
        var half = angle * 0.5;
        var s = Math.sin(half);
        dest[3] = Math.cos(half);
        dest[0] = s * axis[0];
        dest[1] = s * axis[1];
        dest[2] = s * axis[2];
        
        return dest;
    };

    /**
     * Stores the angle and axis in a vec4, where the XYZ components represent
     * the axis and the W (4th) component is the angle in radians.
     *
     * If dest is not given, src will be modified in place and returned, after
     * which it should not be considered not a quaternion (just an axis and angle).
     *
     * @param {quat4} quat   the quaternion whose angle and axis to store
     * @param {vec4}  [dest] the optional vec4 to receive the data
     *
     * @returns {vec4} dest
     */
    quat4.toAngleAxis = function(src, dest) {
        if (!dest) dest = src;
        // The quaternion representing the rotation is
        //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

        var sqrlen = src[0]*src[0]+src[1]*src[1]+src[2]*src[2];
        if (sqrlen > 0)
        {
            dest[3] = 2 * Math.acos(src[3]);
            var invlen = glMath.invsqrt(sqrlen);
            dest[0] = src[0]*invlen;
            dest[1] = src[1]*invlen;
            dest[2] = src[2]*invlen;
        } else {
            // angle is 0 (mod 2*pi), so any axis will do
            dest[3] = 0;
            dest[0] = 1;
            dest[1] = 0;
            dest[2] = 0;
        }
        
        return dest;
    };

    /**
     * Returns a string representation of a quaternion
     *
     * @param {quat4} quat quat4 to represent as a string
     *
     * @returns {string} String representation of quat
     */
    quat4.str = function (quat) {
        return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
    };
    
    /**
     * @class 2 Dimensional Vector
     * @name vec2
     */
    var vec2 = {};
     
    /**
     * Creates a new vec2, initializing it from vec if vec
     * is given.
     *
     * @param {vec2} [vec] the vector's initial contents
     * @returns {vec2} a new 2D vector
     */
    vec2.create = function(vec) {
        var dest = new MatrixArray(2);

        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
        } else {
            dest[0] = 0;
            dest[1] = 0;
        }
        return dest;
    };

    /**
     * Creates a new instance of a vec2, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value

     * @returns {vec2} New vec2
     */
    vec2.createFrom = function (x, y) {
        var dest = new MatrixArray(2);

        dest[0] = x;
        dest[1] = y;

        return dest;
    };
    
    /**
     * Adds the vec2's together. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.add = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] + vecB[0];
        dest[1] = vecA[1] + vecB[1];
        return dest;
    };
    
    /**
     * Subtracts vecB from vecA. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.subtract = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] - vecB[0];
        dest[1] = vecA[1] - vecB[1];
        return dest;
    };
    
    /**
     * Multiplies vecA with vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.multiply = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] * vecB[0];
        dest[1] = vecA[1] * vecB[1];
        return dest;
    };
    
    /**
     * Divides vecA by vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec2} vecA the first operand
     * @param {vec2} vecB the second operand
     * @param {vec2} [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.divide = function(vecA, vecB, dest) {
        if (!dest) dest = vecB;
        dest[0] = vecA[0] / vecB[0];
        dest[1] = vecA[1] / vecB[1];
        return dest;
    };
    
    /**
     * Scales vecA by some scalar number. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecA.
     *
     * This is the same as multiplying each component of vecA
     * by the given scalar.
     *
     * @param {vec2}   vecA the vector to be scaled
     * @param {Number} scalar the amount to scale the vector by
     * @param {vec2}   [dest] the optional receiving vector
     * @returns {vec2} dest
     */
    vec2.scale = function(vecA, scalar, dest) {
        if (!dest) dest = vecA;
        dest[0] = vecA[0] * scalar;
        dest[1] = vecA[1] * scalar;
        return dest;
    };

    /**
     * Calculates the euclidian distance between two vec2
     *
     * Params:
     * @param {vec2} vecA First vector
     * @param {vec2} vecB Second vector
     *
     * @returns {number} Distance between vecA and vecB
     */
    vec2.dist = function (vecA, vecB) {
        var x = vecB[0] - vecA[0],
            y = vecB[1] - vecA[1];
        return Math.sqrt(x*x + y*y);
    };

    /**
     * Copies the values of one vec2 to another
     *
     * @param {vec2} vec vec2 containing values to copy
     * @param {vec2} dest vec2 receiving copied values
     *
     * @returns {vec2} dest
     */
    vec2.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        return dest;
    };

    /**
     * Negates the components of a vec2
     *
     * @param {vec2} vec vec2 to negate
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec2} dest if specified, vec otherwise
     */
    vec2.negate = function (vec, dest) {
        if (!dest) { dest = vec; }
        dest[0] = -vec[0];
        dest[1] = -vec[1];
        return dest;
    };

    /**
     * Normlize a vec2
     *
     * @param {vec2} vec vec2 to normalize
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec2} dest if specified, vec otherwise
     */
    vec2.normalize = function (vec, dest) {
        if (!dest) { dest = vec; }
        var mag = vec[0] * vec[0] + vec[1] * vec[1];
        if (mag > 0) {
            mag = Math.sqrt(mag);
            dest[0] = vec[0] / mag;
            dest[1] = vec[1] / mag;
        } else {
            dest[0] = dest[1] = 0;
        }
        return dest;
    };

    /**
     * Computes the cross product of two vec2's. Note that the cross product must by definition
     * produce a 3D vector. If a dest vector is given, it will contain the resultant 3D vector.
     * Otherwise, a scalar number will be returned, representing the vector's Z coordinate, since
     * its X and Y must always equal 0.
     *
     * Examples:
     *    var crossResult = vec3.create();
     *    vec2.cross([1, 2], [3, 4], crossResult);
     *    //=> [0, 0, -2]
     *
     *    vec2.cross([1, 2], [3, 4]);
     *    //=> -2
     *
     * See http://stackoverflow.com/questions/243945/calculating-a-2d-vectors-cross-product
     * for some interesting facts.
     *
     * @param {vec2} vecA left operand
     * @param {vec2} vecB right operand
     * @param {vec2} [dest] optional vec2 receiving result. If not specified a scalar is returned
     *
     */
    vec2.cross = function (vecA, vecB, dest) {
        var z = vecA[0] * vecB[1] - vecA[1] * vecB[0];
        if (!dest) return z;
        dest[0] = dest[1] = 0;
        dest[2] = z;
        return dest;
    };
    
    /**
     * Caclulates the length of a vec2
     *
     * @param {vec2} vec vec2 to calculate length of
     *
     * @returns {Number} Length of vec
     */
    vec2.length = function (vec) {
      var x = vec[0], y = vec[1];
      return Math.sqrt(x * x + y * y);
    };

    /**
     * Caclulates the dot product of two vec2s
     *
     * @param {vec3} vecA First operand
     * @param {vec3} vecB Second operand
     *
     * @returns {Number} Dot product of vecA and vecB
     */
    vec2.dot = function (vecA, vecB) {
        return vecA[0] * vecB[0] + vecA[1] * vecB[1];
    };
    
    /**
     * Generates a 2D unit vector pointing from one vector to another
     *
     * @param {vec2} vecA Origin vec2
     * @param {vec2} vecB vec2 to point to
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vecA
     *
     * @returns {vec2} dest if specified, vecA otherwise
     */
    vec2.direction = function (vecA, vecB, dest) {
        if (!dest) { dest = vecA; }

        var x = vecA[0] - vecB[0],
            y = vecA[1] - vecB[1],
            len = x * x + y * y;

        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        }

        len = 1 / Math.sqrt(len);
        dest[0] = x * len;
        dest[1] = y * len;
        return dest;
    };

    /**
     * Performs a linear interpolation between two vec2
     *
     * @param {vec2} vecA First vector
     * @param {vec2} vecB Second vector
     * @param {Number} lerp Interpolation amount between the two inputs
     * @param {vec2} [dest] vec2 receiving operation result. If not specified result is written to vecA
     *
     * @returns {vec2} dest if specified, vecA otherwise
     */
    vec2.lerp = function (vecA, vecB, lerp, dest) {
        if (!dest) { dest = vecA; }
        dest[0] = vecA[0] + lerp * (vecB[0] - vecA[0]);
        dest[1] = vecA[1] + lerp * (vecB[1] - vecA[1]);
        return dest;
    };

    /**
     * Returns a string representation of a vector
     *
     * @param {vec2} vec Vector to represent as a string
     *
     * @returns {String} String representation of vec
     */
    vec2.str = function (vec) {
        return '[' + vec[0] + ', ' + vec[1] + ']';
    };
    
    /**
     * @class 2x2 Matrix
     * @name mat2
     */
    var mat2 = {};
    
    /**
     * Creates a new 2x2 matrix. If src is given, the new matrix
     * is initialized to those values.
     *
     * @param {mat2} [src] the seed values for the new matrix, if any
     * @returns {mat2} a new matrix
     */
    mat2.create = function(src) {
        var dest = new MatrixArray(4);
        
        if (src) {
            dest[0] = src[0];
            dest[1] = src[1];
            dest[2] = src[2];
            dest[3] = src[3];
        } else {
            dest[0] = dest[1] = dest[2] = dest[3] = 0;
        }
        return dest;
    };

    /**
     * Creates a new instance of a mat2, initializing it with the given arguments
     *
     * @param {number} m00
     * @param {number} m01
     * @param {number} m10
     * @param {number} m11

     * @returns {mat2} New mat2
     */
    mat2.createFrom = function (m00, m01, m10, m11) {
        var dest = new MatrixArray(4);

        dest[0] = m00;
        dest[1] = m01;
        dest[2] = m10;
        dest[3] = m11;

        return dest;
    };
    
    /**
     * Copies the values of one mat2 to another
     *
     * @param {mat2} mat mat2 containing values to copy
     * @param {mat2} dest mat2 receiving copied values
     *
     * @returns {mat2} dest
     */
    mat2.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        return dest;
    };

    /**
     * Sets a mat2 to an identity matrix
     *
     * @param {mat2} [dest] mat2 to set. If omitted a new one will be created.
     *
     * @returns {mat2} dest
     */
    mat2.identity = function (dest) {
        if (!dest) { dest = mat2.create(); }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };

    /**
     * Transposes a mat2 (flips the values over the diagonal)
     *
     * @param {mat2} mat mat2 to transpose
     * @param {mat2} [dest] mat2 receiving transposed values. If not specified result is written to mat
     *
     * @param {mat2} dest if specified, mat otherwise
     */
    mat2.transpose = function (mat, dest) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (!dest || mat === dest) {
            var a00 = mat[1];
            mat[1] = mat[2];
            mat[2] = a00;
            return mat;
        }
        
        dest[0] = mat[0];
        dest[1] = mat[2];
        dest[2] = mat[1];
        dest[3] = mat[3];
        return dest;
    };

    /**
     * Calculates the determinant of a mat2
     *
     * @param {mat2} mat mat2 to calculate determinant of
     *
     * @returns {Number} determinant of mat
     */
    mat2.determinant = function (mat) {
      return mat[0] * mat[3] - mat[2] * mat[1];
    };
    
    /**
     * Calculates the inverse matrix of a mat2
     *
     * @param {mat2} mat mat2 to calculate inverse of
     * @param {mat2} [dest] mat2 receiving inverse matrix. If not specified result is written to mat
     *
     * @param {mat2} dest is specified, mat otherwise, null if matrix cannot be inverted
     */
    mat2.inverse = function (mat, dest) {
        if (!dest) { dest = mat; }
        var a0 = mat[0], a1 = mat[1], a2 = mat[2], a3 = mat[3];
        var det = a0 * a3 - a2 * a1;
        if (!det) return null;
        
        det = 1.0 / det;
        dest[0] =  a3 * det;
        dest[1] = -a1 * det;
        dest[2] = -a2 * det;
        dest[3] =  a0 * det;
        return dest;
    };
    
    /**
     * Performs a matrix multiplication
     *
     * @param {mat2} matA First operand
     * @param {mat2} matB Second operand
     * @param {mat2} [dest] mat2 receiving operation result. If not specified result is written to matA
     *
     * @returns {mat2} dest if specified, matA otherwise
     */
    mat2.multiply = function (matA, matB, dest) {
        if (!dest) { dest = matA; }
        var a11 = matA[0],
            a12 = matA[1],
            a21 = matA[2],
            a22 = matA[3];
        dest[0] = a11 * matB[0] + a12 * matB[2];
        dest[1] = a11 * matB[1] + a12 * matB[3];
        dest[2] = a21 * matB[0] + a22 * matB[2];
        dest[3] = a21 * matB[1] + a22 * matB[3];
        return dest;
    };

    /**
     * Rotates a 2x2 matrix by an angle
     *
     * @param {mat2}   mat   The matrix to rotate
     * @param {Number} angle The angle in radians
     * @param {mat2} [dest]  Optional mat2 receiving the result. If omitted mat will be used.
     *
     * @returns {mat2} dest if specified, mat otherwise
     */
    mat2.rotate = function (mat, angle, dest) {
        if (!dest) { dest = mat; }
        var a11 = mat[0],
            a12 = mat[1],
            a21 = mat[2],
            a22 = mat[3],
            s = Math.sin(angle),
            c = Math.cos(angle);
        dest[0] = a11 *  c + a12 * s;
        dest[1] = a11 * -s + a12 * c;
        dest[2] = a21 *  c + a22 * s;
        dest[3] = a21 * -s + a22 * c;
        return dest;
    };

    /**
     * Multiplies the vec2 by the given 2x2 matrix
     *
     * @param {mat2} matrix the 2x2 matrix to multiply against
     * @param {vec2} vec    the vector to multiply
     * @param {vec2} [dest] an optional receiving vector. If not given, vec is used.
     *
     * @returns {vec2} The multiplication result
     **/
    mat2.multiplyVec2 = function(matrix, vec, dest) {
      if (!dest) dest = vec;
      var x = vec[0], y = vec[1];
      dest[0] = x * matrix[0] + y * matrix[1];
      dest[1] = x * matrix[2] + y * matrix[3];
      return dest;
    };
    
    /**
     * Scales the mat2 by the dimensions in the given vec2
     *
     * @param {mat2} matrix the 2x2 matrix to scale
     * @param {vec2} vec    the vector containing the dimensions to scale by
     * @param {vec2} [dest] an optional receiving mat2. If not given, matrix is used.
     *
     * @returns {mat2} dest if specified, matrix otherwise
     **/
    mat2.scale = function(matrix, vec, dest) {
      if (!dest) { dest = matrix; }
      var a11 = matrix[0],
          a12 = matrix[1],
          a21 = matrix[2],
          a22 = matrix[3],
          b11 = vec[0],
          b22 = vec[1];
      dest[0] = a11 * b11;
      dest[1] = a12 * b22;
      dest[2] = a21 * b11;
      dest[3] = a22 * b22;
      return dest;
    };

    /**
     * Returns a string representation of a mat2
     *
     * @param {mat2} mat mat2 to represent as a string
     *
     * @param {String} String representation of mat
     */
    mat2.str = function (mat) {
        return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + ']';
    };
    
    /**
     * @class 4 Dimensional Vector
     * @name vec4
     */
    var vec4 = {};
     
    /**
     * Creates a new vec4, initializing it from vec if vec
     * is given.
     *
     * @param {vec4} [vec] the vector's initial contents
     * @returns {vec4} a new 2D vector
     */
    vec4.create = function(vec) {
        var dest = new MatrixArray(4);
        
        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
            dest[2] = vec[2];
            dest[3] = vec[3];
        } else {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
        }
        return dest;
    };

    /**
     * Creates a new instance of a vec4, initializing it with the given arguments
     *
     * @param {number} x X value
     * @param {number} y Y value
     * @param {number} z Z value
     * @param {number} w W value

     * @returns {vec4} New vec4
     */
    vec4.createFrom = function (x, y, z, w) {
        var dest = new MatrixArray(4);

        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = w;

        return dest;
    };
    
    /**
     * Adds the vec4's together. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.add = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] + vecB[0];
      dest[1] = vecA[1] + vecB[1];
      dest[2] = vecA[2] + vecB[2];
      dest[3] = vecA[3] + vecB[3];
      return dest;
    };
    
    /**
     * Subtracts vecB from vecA. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.subtract = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] - vecB[0];
      dest[1] = vecA[1] - vecB[1];
      dest[2] = vecA[2] - vecB[2];
      dest[3] = vecA[3] - vecB[3];
      return dest;
    };
    
    /**
     * Multiplies vecA with vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.multiply = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] * vecB[0];
      dest[1] = vecA[1] * vecB[1];
      dest[2] = vecA[2] * vecB[2];
      dest[3] = vecA[3] * vecB[3];
      return dest;
    };
    
    /**
     * Divides vecA by vecB. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecB.
     *
     * @param {vec4} vecA the first operand
     * @param {vec4} vecB the second operand
     * @param {vec4} [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.divide = function(vecA, vecB, dest) {
      if (!dest) dest = vecB;
      dest[0] = vecA[0] / vecB[0];
      dest[1] = vecA[1] / vecB[1];
      dest[2] = vecA[2] / vecB[2];
      dest[3] = vecA[3] / vecB[3];
      return dest;
    };
    
    /**
     * Scales vecA by some scalar number. If dest is given, the result
     * is stored there. Otherwise, the result is stored in vecA.
     *
     * This is the same as multiplying each component of vecA
     * by the given scalar.
     *
     * @param {vec4}   vecA the vector to be scaled
     * @param {Number} scalar the amount to scale the vector by
     * @param {vec4}   [dest] the optional receiving vector
     * @returns {vec4} dest
     */
    vec4.scale = function(vecA, scalar, dest) {
      if (!dest) dest = vecA;
      dest[0] = vecA[0] * scalar;
      dest[1] = vecA[1] * scalar;
      dest[2] = vecA[2] * scalar;
      dest[3] = vecA[3] * scalar;
      return dest;
    };

    /**
     * Copies the values of one vec4 to another
     *
     * @param {vec4} vec vec4 containing values to copy
     * @param {vec4} dest vec4 receiving copied values
     *
     * @returns {vec4} dest
     */
    vec4.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        dest[2] = vec[2];
        dest[3] = vec[3];
        return dest;
    };

    /**
     * Negates the components of a vec4
     *
     * @param {vec4} vec vec4 to negate
     * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
     *
     * @returns {vec4} dest if specified, vec otherwise
     */
    vec4.negate = function (vec, dest) {
        if (!dest) { dest = vec; }
        dest[0] = -vec[0];
        dest[1] = -vec[1];
        dest[2] = -vec[2];
        dest[3] = -vec[3];
        return dest;
    };

    /**
     * Performs a linear interpolation between two vec4
     *
     * @param {vec4} vecA First vector
     * @param {vec4} vecB Second vector
     * @param {Number} lerp Interpolation amount between the two inputs
     * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vecA
     *
     * @returns {vec4} dest if specified, vecA otherwise
     */
    vec4.lerp = function (vecA, vecB, lerp, dest) {
        if (!dest) { dest = vecA; }
        dest[0] = vecA[0] + lerp * (vecB[0] - vecA[0]);
        dest[1] = vecA[1] + lerp * (vecB[1] - vecA[1]);
        dest[2] = vecA[2] + lerp * (vecB[2] - vecA[2]);
        dest[3] = vecA[3] + lerp * (vecB[3] - vecA[3]);
        return dest;
    };

    /**
     * Returns a string representation of a vector
     *
     * @param {vec4} vec Vector to represent as a string
     *
     * @returns {String} String representation of vec
     */
    vec4.str = function (vec) {
        return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ', ' + vec[3] + ']';
    };

    /*
     * Exports
     */

    if(root) {
        root.glMatrixArrayType = MatrixArray;
        root.MatrixArray = MatrixArray;
        root.setMatrixArrayType = setMatrixArrayType;
        root.determineMatrixArrayType = determineMatrixArrayType;
        root.glMath = glMath;
        root.vec2 = vec2;
        root.vec3 = vec3;
        root.vec4 = vec4;
        root.mat2 = mat2;
        root.mat3 = mat3;
        root.mat4 = mat4;
        root.quat4 = quat4;
    }

    return {
        glMatrixArrayType: MatrixArray,
        MatrixArray: MatrixArray,
        setMatrixArrayType: setMatrixArrayType,
        determineMatrixArrayType: determineMatrixArrayType,
        glMath: glMath,
        vec2: vec2,
        vec3: vec3,
        vec4: vec4,
        mat2: mat2,
        mat3: mat3,
        mat4: mat4,
        quat4: quat4
    };
}));
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
 * Creates a vxlCameraState object and associates it with a vxlCamera. 
 * 
 * This association is unique. each camera has one vxlCameraState object. The vxlCameraState object allows to save/retrive 
 * camera states for the camera it is associated with during the construction.
 * 
 * 
 * @class 
 * @constructor this is the constructor doc
 * @param {vxlCamera} camera
 * @author Diego Cantor
 * @see vxlCamera
  */

function vxlCameraState(camera) {
	if(!( camera instanceof vxlCamera)) {
		alert('vxlCameraState needs a vxlCamera as argument');
		return null;
	}

	this.c             = camera;
	this.position      = vec3.createFrom(0, 0, 1);
	this.focus    	   = vec3.createFrom(0, 0, 0);
	
    this.up            = vec3.createFrom(0, 1, 0);
	this.right         = vec3.createFrom(1, 0, 0);
    
	this.distance      = 0;
	this.azimuth       = 0;
	this.elevation     = 0;
    
	this.xTr           = 0;
	this.yTr           = 0;
};

/**
 * Resets current camera to the standard location an orientation. This is,
 * the camera is looking at the center of the scene, located at [0,0,1] along the z axis and
 * aligned with the y axis.
 * 
 */
vxlCameraState.prototype.reset = function() {
	var c = this.c;
	c.focus            = vec3.createFrom(0, 0, 0);
	c.up               = vec3.createFrom(0, 1, 0);
	c.right            = vec3.createFrom(1, 0, 0);
	c.distance         = 0;
	c.elevation        = 0;
	c.azimuth          = 0;
	c.setPosition(0, 0, 1);
};

/**
 * Saves the current state of the camera that this vxlCameraState object is associated with.
 */

vxlCameraState.prototype.save = function() {
	var c = this.c;
	this.distance = c.distance;
	this.azimuth = c.azimuth;
	this.elevation = c.elevation;
	vec3.set(c.position, this.position);
	vec3.set(c.focus, this.focus);
	vec3.set(c.up, this.up);
	vec3.set(c.right, this.right);
};

/**
 * Updates the camera with the state stored in vxlCameraState.
 */
vxlCameraState.prototype.retrieve = function() {
	var c = this.c;
	c.azimuth = this.azimuth;
	c.elevation = this.elevation;

	vec3.set(this.focus, c.focus);
	vec3.set(this.up, c.up);
	vec3.set(this.right, c.right);

	c.setPosition(this.position);
};
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

    this.id         = 0;
    this.FOV        = vxl.def.camera.fov;
    this.Z_NEAR     = vxl.def.camera.near;    
    this.Z_FAR      = vxl.def.camera.far;
	
	this.view 		= vw;
    
    this.matrix 	= mat4.identity();

    this.right 		= vec3.createFrom(1, 0, 0);
	this.up         = vec3.createFrom(0, 1, 0);
	this.normal     = vec3.createFrom(0, 0, 1);	
	this.position   = vec3.createFrom(0, 0, 1);
	this.focalPoint = vec3.createFrom(0, 0, 0);
	this.tr         = vec3.createFrom(0, 0, 0);
	this.cRot       = vec3.createFrom(0, 0, 0);
    
    
    this.azimuth 	= 0;
    this.elevation 	= 0;
	this.dstep  	= 0; //dollying step

    this.m = mat4.identity();

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
	
	this._updatePosition();
	this._updateMatrix();
	
	
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

/**
 * Calculates the distance to the focus point. This method is called internally by the dollying operation
 * @private
 */
vxlCamera.prototype._updateDistance = function(){
    this.distance = vec3.dist(this.focalPoint, this.position);
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
   	this._updateDistance();
   	
   	var m = this.matrix;
   	m[12] = this.position[0];
   	m[13] = this.position[1];
   	m[14] = this.position[2];
    m[15] = 1;
    
    this._updateCentreRotation();
    
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
 * Sets the azimuth of the camera
 * @param {Number} el the azimuth in degrees
 */
vxlCamera.prototype.setAzimuth = function(az){
    var c = this;
    c.azimuth =az;
    
    if (c.azimuth > 360 || c.azimuth <-360) {
        c.azimuth = c.azimuth % 360;
    }
    c._updateMatrix();
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
    c._updateMatrix();
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
    //this.status(); //for debugging purposes
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
}


/**
 * Used by the tracker when done rotation. Clear the temporary variables to store rotation.
 * @private
 */
vxlCamera.prototype._clearRotation = function(){
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
    this._updateAxes();
    this._clearRotation();
    this._updateDistance();
};

/**
 * This method updates the current camera matrix upon changes in location, 
 * and rotation (azimuth, elevation)
 */
vxlCamera.prototype._updateMatrix = function(){
    
    
		
	if (this.type ==  vxl.def.camera.type.TRACKING){
    	        //mat4.translate(this.matrix, this.position);
                //mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
                //mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
              
     }
     else if (this.type ==  vxl.def.camera.type.ORBITING){
         
               
                //Rotations according to Tojiro
                var rotY  = quat4.fromAngleAxis(this.azimuth * Math.PI/180, [0,1,0]);
                var rotX  = quat4.fromAngleAxis(this.elevation * Math.PI/180, [1,0,0]);
                var rotQ = quat4.multiply(rotY, rotX, quat4.create());
                var rotMatrix = quat4.toMat4(rotQ);
                
                

                mat4.translate(this.matrix, this.cRot)
                mat4.multiply(this.matrix, rotMatrix);
                mat4.translate(this.matrix, vec3.negate(this.cRot, vec3.create()));

                
    } 
};

/**
 * Inverts the camera mattrix to obtain the correspondent Model-View Transform
 * @returns {mat4} m the Model-View Transform
 */
vxlCamera.prototype.getViewTransform = function(){
    return mat4.inverse(this.matrix, mat4.create());
    //return this.m;
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
	
	this.setFocalPoint(cc);
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
 * @class
 * @constructor
 * @param {vxlView} vw the view
 * @see vxlCamera
 * @see vxlView
 */
function vxlCameraManager(vw){
	this.view = vw;
	this.cameras = [];
	this.active = this.createCamera();
	if (vxl.c.camera == undefined){
	    vxl.c.camera = this.active;
	}
}

/**
 * Resets the camera manager and creates one camera
 * @param {vxl.def.camera.type} type the type of amera
 */
vxlCameraManager.prototype.reset = function(type){
	this.cameras = [];
	this.interactors = [];
	this.active = this.createCamera(type);
};

/**
 * Utilitary method that check if the index idx is between 0 and the size of the camera array
 * @param {Number} idx the index to check.
 */
vxlCameraManager.prototype.checkBoundary = function(idx){
	if (idx <0 || idx >= this.cameras.length){
		throw('The camera '+idx+' does not exist');
	}
};
/**
 * Creates a camera
 * @param {vxl.def.camera.type} type the type of camera to create
 */
vxlCameraManager.prototype.createCamera = function(type){
	var camera = new vxlCamera(this.view, type);
	
	this.cameras.push(camera);
	camera.idx = this.cameras.length - 1;
	return camera;
};

/**
 * Returns the camera with index idx
 * @param {Number} idx the index of the camera to return
 */
vxlCameraManager.prototype.getCamera = function(idx){
	this.checkBoundary(idx);
	return this.cameras[idx];
};

/**
 * Returns a reference to the current camera. There is always an active camera
 */
vxlCameraManager.prototype.getActiveCamera = function(){
	return this.active;
};

/**
 * Changes the active camera to the camera with index idx
 * @param {Number} idx the index of the camera to make active
 */
vxlCameraManager.prototype.switchTo = function(idx){
    var view = this.view;
	this.checkBoundary(idx);
	this.active = this.cameras[idx];
    
    if (view.interactor != undefined) {
        view.interactor.connectCamera(this.active);
    }
    else{
        vxl.go.console('Camera Manager: switching to camera ['+idx+'] while the view '+view.name+' does not have an interactor set');
    }
	return this.active;
};

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

function vxlViewInteractor(view, camera){
    this.view   = view;
	this.camera = camera;
	
	if (view != undefined){
	   this.connectView(view);
	}
	
	if (camera != undefined){
	    this.connectCamera(camera);
	}
}

vxlViewInteractor.prototype.getType = function(){
    return "vxlViewInteractor";
}


vxlViewInteractor.prototype.connectView = function(view){
  
    if (!(view instanceof vxlView)){
        throw 'ViewInteractor.connectView: the parameter is not a vxlView';
    }
    var interactor = this;
    var canvas = view.canvas;

    this.view   = view;
    this.camera = view.cameraman.active;

    
    canvas.onmousedown = function(ev) {
        interactor.onMouseDown(ev);
    };

    canvas.onmouseup = function(ev) {
        interactor.onMouseUp(ev);
    };
    
    canvas.onmousemove = function(ev) {
        interactor.onMouseMove(ev);
    };
    
    window.onkeydown = function(ev){
        interactor.onKeyDown(ev);
    };
    
    window.onkeyup = function(ev){
        interactor.onKeyUp(ev);
    };
};


/**
 * @param {vxlCamera} c the camera to connect to this interactor
 * @todo: validate that the camera belongs to the current view. If not throw an exception.
 */
vxlViewInteractor.prototype.connectCamera = function(c){
	if (c instanceof vxlCamera){
		this.camera = c;
		this.camera.interactor = this;
	}
	else {
		throw('ViewInteractor.connectCamera: The object '+c+' is not a valid camera');
	}
};

vxlViewInteractor.prototype.onMouseUp   = function(ev){ alert('implement onMouseUp');};
vxlViewInteractor.prototype.onMouseDown = function(ev){ alert('implement onMouseDown');};
vxlViewInteractor.prototype.onMouseMove = function(ev){ alert('implement onMouseMove');};
vxlViewInteractor.prototype.onKeyDown   = function(ev){ alert('implement onKeyDown');};
vxlViewInteractor.prototype.onKeyUp     = function(ev){ alert('implement onKeyUp');};


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
	this.lastClickedX = 0;
	this.lastClickedY = 0;
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
	task = vxl.def.camera.task.NONE;
	this.camera.clear();
	this.dragging = false;
};

vxlTrackerInteractor.prototype.onMouseDown = function(ev){
	this.x             = ev.clientX;
	this.y             = ev.clientY;
	this.lastClikedX   = this.x;
	this.lastclickedY  = this.y;
	this.button        = ev.button;
	this.dragging      = true;
};

vxlTrackerInteractor.prototype.onMouseMove = function(ev){

	this.lastX         = this.x;
	this.lastY         = this.y;
	
	this.x             = ev.clientX;
    this.y             = ev.clientY;
	

	if (!this.dragging) return;
	
	
	this.ctrlPressed 	= ev.ctrlKey;
	this.altPressed 	= ev.altKey;
	this.shiftPressed 	= ev.shiftKey;
	
	
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	
	if (this.button == 0) { 
	    if (this.altPressed){ 
			this.dolly(dy);
		}
		else if (this.shiftPressed){
			this.pan(dx,dy);
		}
		else{
		    this.rotate(dx,dy);
		}
	}

};


vxlTrackerInteractor.prototype.onKeyUp = function(ev){
    if (ev.keyCode == 17){
        this.ctrlPressed = false;
    }
    
    this.camera.clear();
};

vxlTrackerInteractor.prototype.onKeyDown = function(ev){
	var camera = this.camera;
	
	this.keyPressed = ev.keyCode;
	this.altPressed = ev.altKey;
	this.shiftPressed = ev.shiftKey;
	
	if (!this.altPressed && !this.shiftPressed){
		if (this.keyPressed == 38){
			camera.setElevation(10);
			
		}
		else if (this.keyPressed == 40){
			camera.setElevation(-10);
			
		}
		else if (this.keyPressed == 37){
			camera.setAzimuth(-10);
			
		}
		else if (this.keyPressed == 39){
			camera.setAzimuth(10);
			
		}
		//just to try picking. later on do it better
		//else if (this.keyPressed = 80) {
			//this.picking =!camera.view.actorManager.picking;
			//camera.view.actorManager.setPicking(this.picking);
			
		//}
	}
	else if(this.shiftPressed && this.keyPressed !=17) {
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
	camera.refresh();
};



/**
 * Internal method used by this tracker to perform dollying
 * @param {Number} value the number of dollying steps
 */
vxlTrackerInteractor.prototype.dolly = function(value){
	this.task = vxl.def.camera.task.DOLLY;
    if (value>0){
        this.dloc += Math.abs(value);
    }
    else{
        this.dloc -= Math.abs(value);
    }
    this.camera.dolly(value);
	this.camera.refresh();
};

/**
 * Internal method used by this tracker to rotate the camera.
 * @param {Number} dx the rotation on the X axis (elevation)
 * @param {Number} dy the rotation on the Y axis (azimuth)
 */
vxlTrackerInteractor.prototype.rotate = function(dx, dy){
	this.task = vxl.def.camera.task.ROTATE;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.setAzimuth(nAzimuth);
	camera.setElevation(nElevation);
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

vxlPickerInteractor.prototype = new vxlTrackerInteractor();
vxlPickerInteractor.prototype.constructor = vxlPickerInteractor;

function vxlPickerInteractor(view, camera){
	vxlTrackerInteractor.call(this, view, camera);
	this.plist 					= [];
	this.texture 				= null;
	this.framebuffer 			= null;
	this.renderbuffer 			= null;
	this.hitPropertyCallback 	= null;
	this.processHitsCallback 	= null;
	this.addHitCallback 		= null;
	this.removeHitCallback 		= null;
	this.moveCallback 			= null;
	this.picking 				= false;
    this.connectCamera(camera);
};

vxlPickerInteractor.prototype.connectCamera = function(camera){
	vxlViewInteractor.prototype.connectCamera.apply(this, camera);
	if (this.camera){
		this.configure();
	}
};

vxlPickerInteractor.prototype.configure = function(){
	
	var gl = this.camera.view.renderer.gl;
	
	var width = 512*4; //@TODO get size from this.camera.view.canvas
	var height = 512*4;
	
	//1. Init Picking Texture
	this.texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	//2. Init Render Buffer
	this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	
    
    //3. Init Frame Buffer
    this.framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
	

	//4. Clean up
	gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    //5. Assign random colors to object in current scene
    //for(var i=0, max = this.view.scene.actors.length; i<max; i+=1){
    	//this
   // }
};


vxlPickerInteractor.prototype.get2DCoords = function(ev){
	var x, y, top = 0, left = 0, obj = this.camera.view.canvas;

	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}
    
    left += window.pageXOffset;
    top  += window.pageYOffset;
 
	// return relative mouse position
	x = ev.clientX - left;
	y = c_height - (ev.clientY - top); //c_height is a global variable that we maintain in codeview.js
                                       //this variable contains the height of the canvas and it updates dynamically
                                       //as we resize the browser window.
	
	return {x:x,y:y};
};

vxlPickerInteractor.prototype._compare = function(readout, color){
    vxl.go.console('PickerInteractor: comparing object '+object.alias+' diffuse ('+Math.round(color[0]*255)+','+Math.round(color[1]*255)+','+Math.round(color[2]*255)+') == readout ('+ readout[0]+','+ readout[1]+','+ readout[2]+')');
    return (Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 &&
			Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && 
			Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
};

vxlPickerInteractor.prototype.find = function(coords){
	
	var gl = this.camera.view.renderer.gl;
	//read one pixel
	var readout = new Uint8Array(1 * 1 * 4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.readPixels(coords.x,coords.y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,readout);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var found = false;
    var scene = this.view.scene;
    if (this.hitPropertyCallback == undefined) {alert('The picker needs an object property to perform the comparison'); return;}

    for(var i = 0, max = scene.actors.length; i < max; i+=1){
        var ob = scene.actors[i];
        if (ob.name == 'floor') continue;
                
        var property  = this.hitPropertyCallback(ob);
    
        if (this._compare(readout, property)){
            var idx  = this.plist.indexOf(ob);
            if (idx != -1){
                this.plist.splice(idx,1);
                if (this.removeHitCallback){
                    this.removeHitCallback(ob); 
                }
            }
            else {
                this.plist.push(ob);
                if (this.addHitCallback){
                    this.addHitCallback(ob); 
                }
            }
            found = true;
            break;
        }
    }
    draw();
    return found;
};

vxlPickerInteractor.prototype.stop = function(){
    if (this.processHitsCallback != null && this.plist.length > 0){
        this.processHitsCallback(this.plist);
    }
    this.plist = [];
};

vxlPickerInteractor.prototype.onMouseUp = function(ev){
	if(!ev.shiftKey){
		this.stop();
	}
};

vxlPickerInteractor.prototype.onMouseDown = function(ev){
	var coords = this.get2DCoords(ev);
	this.picking = this.find(coords);
	if(!this.picking){
		this.stop();
	}
};

vxlPickerInteractor.prototype.onMouseMove = function(ev){
	this.lastX = this.x;
	this.lastY = this.y;
	this.x = ev.clientX;
	this.y = ev.clientY;
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	if(this.picking && this.moveCallback){
		this.moveCallback(this, dx,dy);
	}
};

vxlPickerInteractor.prototype.onKeyDown = function(ev){
	//@TODO: ENTER AND EXIT PICKING MODE MANUALLY
	//this.view.listener.setInteractor(previous)
};

vxlPickerInteractor.prototype.onKeyUp = function(ev){
	
};

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
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlTransforms(vw){
	this.stack = [];
	this.view = vw;
	this.mvMatrix    = mat4.identity();    // The Model-View matrix
	this.pMatrix     = mat4.identity();    // The projection matrix
	this.nMatrix     = mat4.identity();    // The normal matrix
	this.cMatrix     = mat4.identity();    // The camera matrix	
};

/**
 * Calculates the Model-View matrix for the current camera.
 */
vxlTransforms.prototype.calculateModelView = function(){
	mat4.set(this.view.cameraman.active.getViewTransform(), this.mvMatrix);
    
};

/**
 * Calculates the normal matrix corresponding to the current Model-View matrix
 */
vxlTransforms.prototype.calculateNormal = function(){
	mat4.identity(this.nMatrix);
    mat4.set(this.mvMatrix, this.nMatrix);
    mat4.inverse(this.nMatrix);
    mat4.transpose(this.nMatrix);
};

/**
 * Calculates the perspective matrix given the current camera
 */
vxlTransforms.prototype.calculatePerspective = function(){
    var c = this.view.cameraman.active;
    var vw = this.view;
	mat4.identity(this.pMatrix);
	mat4.perspective(c.FOV, vw.width/vw.height, c.Z_NEAR, c.Z_FAR, this.pMatrix);
};

/**
 * Calculate the transforms for the current view.renderer
 * 
 */
vxlTransforms.prototype.update = function(){
    this.calculateModelView();
    this.calculatePerspective();
    this.calculateNormal();
};

/**
 * Saves the current Model-View matrix in the stack. This
 * operation is called by vxlActor.updateMatrixStack
 * @see vxlActor#updateMatrixStack
 */

vxlTransforms.prototype.push = function(){
	var memento =  mat4.create();
	mat4.set(this.mvMatrix, memento);
	this.stack.push(memento);
};

/**
 * Retrieves the last Model-View transformation in the matrix stack.
 * This operation is called by vxlActor.updateMatrixStack
 */
vxlTransforms.prototype.pop = function(){
	if(this.stack.length == 0) return;
	this.mvMatrix  =  this.stack.pop();
};/*-------------------------------------------------------------------------
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
 * @class
 */
vxl.def.glsl.lambert = {
	
	ID : 'lambert',

	ATTRIBUTES : [
	"aVertexPosition", 
	"aVertexColor", 
	"aVertexNormal"],
	
	UNIFORMS : [
	"mModelView",
	"mNormal",
	"mPerspective",
	"uPointSize",
	"uLightDirection",
	"uLightAmbient",
	"uLightDiffuse",
	"uMaterialDiffuse",
	"uUseVertexColors",
	"uUseShading",
	"uUseLightTranslation"],
	
	
    VERTEX_SHADER : [
    
    "attribute vec3 aVertexPosition;",
	"attribute vec3 aVertexNormal;",
	"attribute vec3 aVertexColor;",
    "uniform float uPointSize;",
	"uniform mat4 mModelView;",
	"uniform mat4 mPerspective;",
	"uniform mat4 mNormal;",
	"uniform vec3 uLightDirection;",
	"uniform vec4 uLightAmbient;",  
	"uniform vec4 uLightDiffuse;",
	"uniform vec4 uMaterialDiffuse;",
	"uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform bool uUseLightTranslation;",
	"varying vec4 vFinalColor;",
    
    "void main(void) {",
    "	gl_Position = mPerspective * mModelView * vec4(aVertexPosition, 1.0);",
    "	gl_PointSize = uPointSize;",
    "	if (uUseVertexColors) {",
    "		vFinalColor = vec4(aVertexColor,1.0);",
    "	}",
    "   else {",
    "       vFinalColor = uMaterialDiffuse;",
    "   }",
    "	if (uUseShading){",
    "		vec3 N = vec3(mNormal * vec4(aVertexNormal, 1.0));",
	"		vec3 L = normalize(uLightDirection);",
	"		if (uUseLightTranslation){ L = vec3(mNormal * vec4(L,1.0));}",
	"		float lambertTerm = max(dot(N,-L),0.4);",
	"		vec4 Ia = uLightAmbient;",
	"		vec4 Id = vFinalColor * uLightDiffuse * lambertTerm;",
    "		vFinalColor = Ia + Id;",
	"		vFinalColor.a = uMaterialDiffuse.a;",
	"	}" ,
	"}"].join('\n'),
    
    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",

    "varying vec4  vFinalColor;",

    "void main(void)  {",
    "		gl_FragColor = vFinalColor;",
    "}"].join('\n'),
    
    DEFAULTS : {
        "uLightDirection" 	: [0.0,0.0,-1.0],
        "uLightAmbient"   	: [0.0,0.0,0.0,1.0],
        "uLightDiffuse"   	: [1.0,1.0,1.0,1.0],
        "uMaterialDiffuse" 	: [0.9,0.9,0.9,1.0],
        "uPointSize"		: 1.0,
        "uUseLightTranslation" : false
    }
};/*-------------------------------------------------------------------------
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
 * @class
 */
vxl.def.glsl.phong = {

    ID : 'phong',
    
    ATTRIBUTES: [
    "aVertexPosition",
    "aVertexNormal",
    "aVertexColor",
    ],
    
    UNIFORMS : [
    "uMVMatrix",
    "uPMatrix",
    "uNMatrix",
    "uShininess",
    "uPointSize",
    "uLightDirection",
    "uLightAmbient",
    "uLightDiffuse",
    "uLightSpecular",
    "uMaterialAmbient",
    "uMaterialDiffuse",
    "uMaterialSpecular",
	"uUseVertexColors",
	"uUseShading",
    "uUseLightTranslation"],
    
    VERTEX_SHADER: [
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexNormal;",
    "attribute vec3 aVertexColor;",
    "uniform float uPointSize;",
    "uniform mat4 uMVMatrix;",
    "uniform mat4 uPMatrix;",
    "uniform mat4 uNMatrix;",
    "uniform bool uUseVertexColors;",
    "varying vec3 vNormal;",
    "varying vec3 vEyeVec;",
    "varying vec4 vFinalColor;",
    
    "void main(void) {",
    "  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
    "  gl_PointSize = uPointSize;",
    "   if(uUseVertexColors) {",
    "       vFinalColor = vec4(aVertexColor,1.0);",
    "       return;",  
    "   }",
    "   vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);",
    "   vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0));",
    "   vEyeVec = -vec3(vertex.xyz);",
    "}"].join('\n'),

    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",
    
    "uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform float uShininess;      ",
    "uniform vec3 uLightDirection;  ",
    
    "uniform vec4 uLightAmbient;    ",
    "uniform vec4 uLightDiffuse;    ",
    "uniform vec4 uLightSpecular;   ",
    
    "uniform vec4 uMaterialAmbient; ",
    "uniform vec4 uMaterialDiffuse; ",
    "uniform vec4 uMaterialSpecular;",
    
    "varying vec3 vNormal;",
    "varying vec3 vEyeVec;",
    "varying vec4 vFinalColor;",
    "void main(void)",
    "{",
    
     "  vec3 L = normalize(uLightDirection);",
     "  vec3 N = normalize(vNormal);",
     "  float lambertTerm = dot(N,-L);",
     "  vec4 Ia = uLightAmbient * uMaterialAmbient;",
     "  vec4 Id = vec4(0.0,0.0,0.0,1.0);",
     "  vec4 Is = vec4(0.0,0.0,0.0,1.0);",
     "  vec4 varMaterialDiffuse = uMaterialDiffuse;",
     "	if(uUseVertexColors) {",
     "        varMaterialDiffuse = vFinalColor;",
     "   }",
     "  if(uUseShading){  ",
     "      if(lambertTerm > 0.0)",
     "      {",
     "          Id = uLightDiffuse * varMaterialDiffuse * lambertTerm;",
     "          vec3 E = normalize(vEyeVec);",
     "          vec3 R = reflect(L, N);",
     "          float specular = pow( max(dot(R, E), 0.0), uShininess);",
     "          Is = uLightSpecular * uMaterialSpecular * specular;",
     "      }",
     "      gl_FragColor = Ia + Id + Is;",
     "      gl_FragColor.a = uMaterialDiffuse.a;",
     "  } ",
     "  else {",
     "      gl_FragColor = varMaterialDiffuse; ",	
     "  }",
     "}"].join('\n'),

    DEFAULTS : {
        "uShininess"        : 230.0,
        "uLightDirection"   : [0.0, -1.0, -1.0],
        "uLightAmbient"     : [0.03,0.03,0.03,1.0],
        "uLightDiffuse"     : [1.0,1.0,1.0,1.0], 
        "uLightSpecular"    : [1.0,1.0,1.0,1.0],
        "uMaterialAmbient"  : [1.0,1.0,1.0,1.0],
        "uMaterialDiffuse"  : [0.8,0.8,0.8,1.0],
        "uMaterialSpecular" : [1.0,1.0,1.0,1.0]
    }
};/*-------------------------------------------------------------------------
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
 * @class
 */
vxl.def.glsl.blender = {
	
	ID : 'blender',

	ATTRIBUTES : [
	"aVertexPosition", 
	"aVertexNormal"],
	
	UNIFORMS : [
	"mModelView",
	"mNormal",
	"mPerspective",
	"uLa",
	"uLd",
	"uLs",
	"uLightPosition",
	"uTranslateLight",
	"uKa",
	"uKd",
	"uKs",
	"uNs",
	"d",
	"illum"
	],
	
	
    VERTEX_SHADER : [
    
    "attribute vec3 aVertexPosition;",
	"attribute vec3 aVertexNormal;",

	"uniform mat4 mModelView;",
	"uniform mat4 mPerspective;",
	"uniform mat4 mNormal;",
	
	"uniform vec3 uLightPosition;",
	"uniform bool uTranslateLight;",
    
    "varying vec3 vNormal;",
    "varying vec3 vLightRay;",
    "varying vec3 vEye;",
	
    
    "void main(void) {",
    " vec4 vertex = mModelView * vec4(aVertexPosition, 1.0);",
    " vNormal = vec3(mNormal * vec4(aVertexNormal, 1.0));",
    " vec4 lightPosition = vec4(0.0);",
     
    "if (uTranslateLight){",
    "      lightPosition =   mModelView * vec4(uLightPosition, 1.0);",
    "      vLightRay = vertex.xyz - lightPosition.xyz;",
    "      vEye = -vec3(vertex.xyz);",
    "}",    
    "else {",
    "     lightPosition = vec4(uLightPosition, 1.0);",
    "     vLightRay = vertex.xyz - lightPosition.xyz;",
    "     vEye = -vec3(vertex.xyz);",
    "}",
    "gl_Position = mPerspective * mModelView * vec4(aVertexPosition, 1.0);",
	"}"].join('\n'),
    
    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",
    "uniform vec3 uLa;",
	"uniform vec3 uLd;",  
	"uniform vec3 uLs;",
	
    "uniform vec3 uKa;",
	"uniform vec3 uKd;",  
	"uniform vec3 uKs;",
	"uniform float uNs;",
	"uniform float d;",
    "uniform int illum;",
 
    "varying vec3 vNormal;",
    "varying vec3 vLightRay;",
    "varying vec3 vEye;",

    "void main(void)  {",
    "	if (illum ==0){",
    "		gl_FragColor = vec4(uKd,d);",
    "		return;",
    "	}",
    "	vec3 COLOR = vec3(0.0,0.0,0.0);",
    "   vec3 N =  normalize(vNormal);",
    "   vec3 L =  vec3(0.0,0.0,0.0);",
    "   vec3 E =  vec3(0.0,0.0,0.0);",
    "   vec3 R =  vec3(0.0,0.0,0.0);",
	"    if (illum == 1){",
	"        L = normalize(vLightRay);",	
	"        N = normalize(vNormal);",	
	"        COLOR += (uLa * uKa) + (uLd * uKd * clamp(dot(N, -L),0.0,1.0));",
	"        gl_FragColor =  vec4(COLOR,d);",
	"        return;",
	"   }",
	"   if (illum == 2){",
	"        E = normalize(vEye);",
	"        L = normalize(vLightRay);",
	"        R = reflect(L, N);",
	"        COLOR += (uLa * uKa);",
	"        COLOR += (uLd * uKd * clamp(dot(N,-L),0.0,1.0));",
	"        COLOR += (uLs * uKs * pow( max(dot(R, E), 0.0), uNs) * 4.0);",
	"        gl_FragColor =  vec4(COLOR,d);",
	"       return;",
    "	}" ,
    "}"].join('\n'),
    
    DEFAULTS : {
        "uLa" 	: [1.0,1.0,1.0],
        "uLd"   : [1.0,1.0,1.0],
        "uLs"  	: [0.8,0.8,0.8],
        "uKa"   : [1.0,1.0,1.0],
        "uKd"   : [1.0,1.0,1.0],
        "uKs"   : [1.0,1.0,1.0],
        "uNs"   : 1.0,
        "uTranslateLight" : false,
        "uLightPosition"   : [0,50,50]
    }
};/*-------------------------------------------------------------------------
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
 * <p>Presents a simple interface to communicate with a ESSL (GLSL) program
 * This class is responsible for creating, compiling and linking any ESSL program.
 * It also has methods to query and set uniforms and attributes belonging to the program
 * that is being currently executed in the GPU</P>
 * 
 * <p>a vxlProgram maintains a database of the programs that have been linked to the GPU. 
 * This way, program switching is easier as it is not necessary to go through the 
 * compilation and linking process every time</p>
 * @class
 * @constructor
 */
function vxlProgram (gl) {
    this._gl                = gl;
    this._codebase          = {};

    this._program           = {};
    this._attributeList     = {};
    this._uniformList       = {};
    this._uniformType       = {};

    this._uniform_cache     = {};
    
    this._currentWebGLProgram     =  null;
    this._currentProgramID        = "";
    this._currentUniformLocation  = {};
};


/**
 * Register a program in the database
 * @param {JSON} the program to register
 */
vxlProgram.prototype.register = function(glslObject){
	/*@TODO: this method receives a JSON Object we could instead
	 * receive a text file and parse it into JSON. This would make
	 * the writing of shaders much easier.
	 */
	vxl.go.console('Registering program '+ glslObject.ID);
    this._codebase[glslObject.ID] = glslObject;
};

/**
 * Verifies whether a program is loaded in the database or not
 * @param {String} ID program id
 * @returns true if the program is registered, false otherwise
 */
vxlProgram.prototype.isRegistered = function(ID){
	return (this._codebase[ID] != undefined);
};

/**
 * Loads a program
 * @param {String} ID the id of the program to load
 */
vxlProgram.prototype.loadProgram = function(ID){
    
    var code = this._codebase[ID];
    
    var gl   = this._gl;
    var WEB_GL_PROGRAM  = gl.createProgram();
    
    
    if (code.VERTEX_SHADER){
        var vs = this._createShader(vxl.def.glsl.VERTEX_SHADER,code.VERTEX_SHADER);
        gl.attachShader(WEB_GL_PROGRAM, vs);
    }
    
    if (code.FRAGMENT_SHADER){
        var fs = this._createShader(vxl.def.glsl.FRAGMENT_SHADER,code.FRAGMENT_SHADER);
        gl.attachShader(WEB_GL_PROGRAM, fs);
    }
    
    gl.linkProgram(WEB_GL_PROGRAM);
     
    if (!gl.getProgramParameter(WEB_GL_PROGRAM, gl.LINK_STATUS)) {
        alert("Program: Could not link the shading program");
    }
    else{
        //vxl.go.console("Program: the program "+ID+" has been loaded");
    }
    
    this._program[ID] = WEB_GL_PROGRAM;
  
};

/**
 * Verifies if a program is loaded
 * @param {String} ID the program id
 * @returns true if the program is loaded, false otherwise
 */
vxlProgram.prototype.isLoaded = function(ID){
    return (this._program[ID] != undefined);
};

/**
 * Uses a program from the database.
 * If you are not sure if the program you want to use is in the database then call vxlRenderer.setProgram instead
 * @param {String} ID the program id
 * @see vxlRenderer#setProgram
 */
vxlProgram.prototype.useProgram = function(ID){

    var gl = this._gl;
    var WEB_GL_PROGRAM = this._program[ID];
    
    if (WEB_GL_PROGRAM != undefined && WEB_GL_PROGRAM != null){
        
        if (WEB_GL_PROGRAM == this._currentWebGLProgram) return;
        
        //gl.linkProgram(WEB_GL_PROGRAM);
        gl.useProgram (WEB_GL_PROGRAM);
        
        this._currentWebGLProgram = WEB_GL_PROGRAM;
        this._currentProgramID = ID;
        this._parseUniforms();
        
        //vxl.go.console('Program: the program '+ID+' has been linked and is the current program');
    }
    else{
        alert("Program: the program " + ID + " has NOT been loaded");
    }
};

    
/**
 * Loads the uniform defaults for the current program
 */
vxlProgram.prototype.loadDefaults = function(){
    var code = this._codebase[this._currentProgramID];
    
    if ('DEFAULTS' in code){
        //vxl.go.console('Program: defaults for program '+this._currentProgramID+' found. Loading..');
        var defaults = code.DEFAULTS;
        for(var u in defaults){
            this.setUniform(u,defaults[u]);
            //vxl.go.console('Program: Uniform:'+u+', Default Value:'+defaults[u]);
        }
    }
    else{
    	vxl.go.console('Program: WARNING: defaults for program '+this._currentProgramID+' NOT found');
    }
};

/**
 * Sets all the uniforms defined by the object obj
 * @param {Object} an object containing uniform names and values. Every property of this object
 * will be considered a uniform
 */
vxlProgram.prototype.setUniforms = function(obj){
	for(uni in obj){
		this.setUniform(uni,obj[uni]);
	}
};

/**
 * Sets a uniform.
 * Uses polymorphism to make the programmers life happier
 * @param {String} uniform name
 * @param {Object} the value
 */
vxlProgram.prototype.setUniform = function(uniformID, value, hint){
    
    var webGLProgram 		= this._currentWebGLProgram;
    var uniformList 		= this._uniformList[this._currentProgramID];
    var uniformLoc  		= this._currentUniformLocation;
    var uniform_cache 		= this._uniform_cache;
    
    if (uniformList.hasObject(uniformID)){
        uniformLoc[uniformID] = this._gl.getUniformLocation(webGLProgram,uniformID);
        
    }
    else{
    	throw('Program: the uniform '+uniformID+' is not defined for the program '+this._currentProgramID);
        return;
    }
    
    uniform_cache[uniformID] = value;
    this._setPolymorphicUniform(uniformID, uniformLoc[uniformID], value, hint);
};

/**
 * Returns a uniform value from the cache maintained by vxlProgram
 * @param {String} the uniform id
 */
vxlProgram.prototype.getUniform = function(uniformID){
    //TODO: Think about this
    //if(!(name in this._uniformList)){
      //  alert('Program: the uniform ' + name + ' has not been set');
        //return null;
   //}
    return this._uniform_cache[uniformID];
};

/**
 * This method tells the WebGL context how to access the information contained in the
 * WebGL buffer associated with the attribute
 * @param {String} name name of the attribute
 * 
 */
vxlProgram.prototype.setAttributePointer = function(name, numElements, type, norm,stride,offset){
    var a = this._getAttributeLocation(name);
    this._gl.vertexAttribPointer(a,numElements, type, norm, stride, offset);
};

/**
 * Enables a vertex attribute array
 * @param {String} name the name of the attribute array to enable
 */
vxlProgram.prototype.enableAttribute = function(name){
   var a = this._getAttributeLocation(name);
   this._gl.enableVertexAttribArray(a);
};

/**
 * Disables a vertex attribute array
 * @param {String} name the name of the attribute array to disable
 * 
 */
vxlProgram.prototype.disableAttribute = function(name){
    var a = this._getAttributeLocation(name);
    this._gl.disableVertexAttribArray(a);
};

/**
 * Creates a WebGL shader
 * 
 * @private This method is private.
 */
vxlProgram.prototype._createShader = function(type,code){
    var gl      = this._gl;
    var shader = null;
    
    if (type == vxl.def.glsl.VERTEX_SHADER){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (type == vxl.def.glsl.FRAGMENT_SHADER){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    
    if (code == undefined || code == null){
        alert('Error getting the code for shader of type ' + type);
    }
    
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }
    
    return shader;
};
    

/**
 * Parses uniforms
 * This method is private
 * @private
 * 
 */
vxlProgram.prototype._parseUniforms = function(id){
    
    vs = this._codebase[this._currentProgramID].VERTEX_SHADER;
    fs = this._codebase[this._currentProgramID].FRAGMENT_SHADER;
    /*@TODO: look for a way to retrieve uNames directly from the parsing of the shaders
    this should simplify the structure of the JSON file representing the program*/
    uNames = this._codebase[this._currentProgramID].UNIFORMS;
    
    uTypes = {};
    
    
    for (var i=0;i< uNames.length; i++){
        var uniformID = uNames[i];
        var rex = new RegExp('uniform\\s+\\w+\\s'+uniformID,'g');
        
        if (vs.search(rex) != -1){
            uTypes[uniformID] = vs.substring(vs.search(rex),vs.length).substring(0,vs.indexOf(';')).split(' ')[1];
        }
        
        else if(fs.search(rex) != 1){
            uTypes[uniformID] = fs.substring(fs.search(rex),fs.length).substring(0,fs.indexOf(';')).split(' ')[1];
        }
        
        else{
            alert('Program: In the program '+this._currentProgramID+' the uniform '+uniformID+' is listed but not used');
        }
    }
    
    
    this._uniformList[this._currentProgramID] = uNames;
    this._uniformType[this._currentProgramID] = uTypes; 
};

/**
 * Obtains an attribute location
 * This method is private
 * @param {String} name
 * @private
 */
vxlProgram.prototype._getAttributeLocation = function(name){

    if(!(name in this._attributeList)){
        this._attributeList[name] = this._gl.getAttribLocation(this._currentWebGLProgram,name);
    }

    return this._attributeList[name];
};

/**
 * This is one of the jewels of Voxelent. Based on the information contained in the 
 * program database, it will do the appropriate gl call to set the uniform
 * This method is private. Use setUniform instead.
 * @see vxlProgram#setUniform
 * @private 
 */
vxlProgram.prototype._setPolymorphicUniform = function(uniformID, locationID,value,hint){

	//In the extend of what it is reasonable,
	//We cross check GLSL type information with actual javascript variable types 
	//to make the right calls
	//hint allows better casting of int and float values. If not specified default is float
    
    var gl = this._gl;
    var glslType = this._uniformType[this._currentProgramID][uniformID];
    
    if (glslType == 'bool'){
    	//if (typeof value != 'boolean') { 
    	//	vxl.go.console('Program: the uniform '+uniformID+' is defined as bool in GLSL. However the JS variable is not');
    	//}/
        gl.uniform1i(locationID,value);
        return;
    }
    
    else if (glslType == 'float'){
    	gl.uniform1f(locationID,value);
    	return;
    }
    
    else if (glslType == 'int'){
        gl.uniform1i(locationID,value);
        return;
    }
    
    else if (glslType == 'mat4'){    
        gl.uniformMatrix4fv(locationID,false,value);
        return;
    }
    
    
    else if (value instanceof Array){
        if (hint  == 'int'){
            switch(value.length){
                case 1: { gl.uniform1iv(locationID,value); break; };
                case 2: { gl.uniform2iv(locationID,value); break; };
                case 3: { gl.uniform3iv(locationID,value); break; };
                case 4: { gl.uniform4iv(locationID,value); break; };
                default: alert('ERROR');
            }
       }
       else{
            switch(value.length){
                case 1 : { gl.uniform1fv(locationID,value); break; }
                case 2 : { gl.uniform2fv(locationID,value); break; }
                case 3 : { gl.uniform3fv(locationID,value); break; }
                case 4 : { gl.uniform4fv(locationID,value); break; }
                default: alert('ERROR');
            }
       }
    }
    
    else {
    	alert('Program: ERROR. The uniform  '+uniformID+ ' could not be mapped');
    }
};
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
 * One of the main classes of Voxelent's Nucleo
 * A renderer object encapsulates most of the low level calls to WebGL.
 * It is here where Nucleo obtains a reference to the WebGL context.
 * 
 * It is also here here (and in the Actor class) where all the attributes and uniforms are passed
 * to the rendering program.
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlRenderer(vw){
    
	this.view       	= vw;
	this.renderRate 	= vxl.def.renderer.rate.NORMAL;
	this.mode       	= vxl.def.renderer.mode.TIMER;
    this.timerID    	= 0;
    this.gl         	= this.getWebGLContext();
    this.prg        	=   new vxlProgram(this.gl);
    this.transforms 	= new vxlTransforms(vw);
    this.currentProgram = undefined;
    this.strategy 		= undefined;
    
    this.setProgram(vxl.def.glsl.lambert, vxlBasicStrategy);
    
}

/**
 * Tries to obtain a WebGL context from the canvas associated with the view to which this
 * renderer belongs to.
 * @TODO: Review depth test and blending functions maybe these should be configurable.
 */
vxlRenderer.prototype.getWebGLContext = function(){
	
	var WEB_GL_CONTEXT = null;
	var canvas = this.view.canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
	for (var i = 0; i < names.length; ++i) {
		try {
			WEB_GL_CONTEXT = canvas.getContext(names[i]);
		} 
		catch(e) {}
		if (WEB_GL_CONTEXT) {
			break;
		}
	}
	if (WEB_GL_CONTEXT == null) {
		//@TODO: print a nicer jquery  alert
		alert("Sorry: WebGL is not available on this browser. Have you tried the newest version of Firefox, Chrome or Safari?"); 
		return;
	}
	else {
		var _gl = WEB_GL_CONTEXT;
		_gl.enable(_gl.DEPTH_TEST);
		_gl.enable(_gl.BLEND);
		_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
		_gl.depthFunc(_gl.LESS);
	}
    return WEB_GL_CONTEXT;
};

/**
 * Tries to add a new program definition to this renderer
 * @param {Object} program JSON program definition.
 * @param {vxlRenderStrategy} strategy 
 * @see {vxl.def.glsl.phong}
 * @see {vxl.def.glsl.lambert}
 */
vxlRenderer.prototype.setProgram = function(program,strategy){
    
    if(this.currentProgram != undefined && this.currentProgram == program){
        return;
    }
    
    var prg = this.prg;

	if (!prg.isRegistered(program.ID)){
		prg.register(program);
	}
	
	if (!prg.isLoaded(program.ID)){
		prg.loadProgram(program.ID);
	}
	prg.useProgram(program.ID);
	prg.loadDefaults();
	
	this.currentProgram = program;
	
	if(strategy != null && strategy != undefined){
		this.strategy = new strategy(this);
		//this.strategy.renderer = this;
	}
	else{
		this.strategy = new vxlBasicStrategy(this);
	}
};




/**
 * Clears the rendering context
 */
vxlRenderer.prototype.clear = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height); //@TODO: Think about dividing view ports for multi-view apps - March 19/2012
	this.transforms.calculatePerspective();
};

/**
 * Sets the rendering mode. Options are in vxl.def.renderer.mode
 * This method updates the rendering mode and tries to restart the rendering process
 * @param {String} mode the mode to set
 */
vxlRenderer.prototype.setMode = function(mode){
    this.stop();
    this.mode = mode;
    this.start();   
};

/**
 * Starts the renderer
 */
vxlRenderer.prototype.start = function(){
	if(this.mode == vxl.def.renderer.mode.TIMER){
		vxl.go.console('Renderer: starting rendering for view ['+this.view.name+'] at '+this.renderRate+ 'ms');
		this.timerID = setInterval((function(self) {return function() {self.render();}})(this),this.renderRate); 
	}
	else if(this.mode == vxl.def.renderer.mode.ANIMFRAME){
	    vxl.go.console('Renderer: starting rendering at the fastest speed',true);
		vxl.go.render();
	}
};

/**
 * Stops the renderer
 */
vxlRenderer.prototype.stop = function(){
	if (this.mode == vxl.def.renderer.mode.TIMER){
		clearInterval(this.timerID);
	}
	else if (this.mode == vxl.def.renderer.mode.ANIMFRAME){
		//vxl.go.cancelRender();
	}
};

/**
 * Sets the rendering rate in ms
 * @param {Number} rate the new rendering rate in milliseconds
 */
vxlRenderer.prototype.setRenderRate = function(rate){ //rate in ms
    
    if (rate == undefined || rate <=0){ 
        throw 'vxlRenderer.setRenderRate: the rate cannot be zero or undefined';
    } 
    
    if (this.mode == vxl.def.renderer.mode.ANIMFRAME){
        throw 'vxlRenderer.setRenderRate: if the mode is ANIMFRAME render rate is irrelevant';
    }
      
	this.stop();
	this.renderRate = rate;
	this.start();
    
    vxl.go.console('Renderer: view['+this.view.name+'], render rate = ' + rate,true);

};

/**
 * Sets the color used to clear the rendering context
 * @param {Array} cc the new color passed as a numeric array of three elements
 * @see vxlView#setBackgroundColor
 */
vxlRenderer.prototype.clearColor = function(cc){
	this.gl.clearColor(cc[0], cc[1], cc[2], 1.0);
};

/**
 * Sets the clear depth for the rendering context
 * @param {Number} d the new clear depth
 */
vxlRenderer.prototype.clearDepth = function(d){
	this.gl.clearDepth(d);
};

/**
 * Delegates rendering to the scene
 */
vxlRenderer.prototype.render = function(){
    this.clear();	
    this.view.scene.render(this);
};

/**
 * @private 
 * 
 */
vxlRenderer.prototype._allocateActor = function(actor){
	return this.strategy.allocate(actor);
}

/**
 * @private 
 */
vxlRenderer.prototype._deallocateActor = function(actor){
	this.strategy.deallocate(actor);
} 

/**
 * @private 
 */
 
 vxlRenderer.prototype._renderActor = function(actor){
 	this.strategy.render(actor);
 }
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
 * Models are totally independend of views and of the rendering process
 * @class
 * @constructor
 * @param {String} name the name for this model
 * @param {Object} JSON_OBJECT the JSON Object that defines this model (Optional)
 * @see vxlModel#load
 * @author Diego Cantor
 */
function vxlModel(name, JSON_OBJECT){
	this.name = name;
	this.indices 	= null;
	this.vertices 	= null;
	this.scalars 	= null;
	this.diffuse	= null;
	this.normals 	= null;
	this.wireframe 	= null;
	this.centre 	= null;
	this.bb     	= null;
	this.mode       = null;
	//@TODO implement textures
    
    if (JSON_OBJECT != undefined){
        this.load(this.name, JSON_OBJECT);
    }
}

/**
 * Populates this model with the JSON_OBJECT (JSON object)
 * @param {String} nm the name given to this model
 * @param {Object} JSON_OBJECT the JSON object that describes the model
 */
vxlModel.prototype.load = function(nm,JSON_OBJECT){
	this.name		= nm;
	if (JSON_OBJECT.name != null){
		this.name = JSON_OBJECT.name;
	}
	
	//Load all properties
	for(i in JSON_OBJECT){
		this[i] = JSON_OBJECT[i];
	}
	
	//Now minimal checks
	if (this.vertices == undefined){
		alert('The model '+ this.name+' does not have vertices. Impossible to render!');
	}
	

	if(this.normals == undefined && this.indices != undefined){
		this.computeNormals();
	}
	
	if(this.diffuse == undefined){
		//We copy the default by value so posterior modifications of the default do not affect this model
		this.diffuse = vxl.def.model.diffuse.slice(0); 
	}
	
	if (this.wireframe == undefined){
		this.computeWireframeIndices();
	}
	
	if (this.mode == undefined){
		this.mode == vxl.def.actor.mode.SOLID;
	}
	this.computeBoundingBox();
};




/**
 * Calculates the normals for this model in case that the JSON object does not include them
 * 
 * @param {bool} reverse if true will calculate the reversed normals
 * 
 */
vxlModel.prototype.computeNormals = function(reverse){
	if (reverse == undefined){
		reverse = false;
	}
  //face normal calculation
    var vs = this.vertices;
	var ind = this.indices;
	var x=0; 
    var y=1;
	var z=2;
	
	var ns = [];
	for(var i=0;i<vs.length;i=i+3){ //for each index, initialize normal x, normal y, normal z
		ns[i+x]=0.0;
		ns[i+y]=0.0;
		ns[i+z]=0.0;
	}
	
	for(var i=0;i<ind.length;i=i+3){ //we work on triads of vertex to calculate normals so i = i+3 (i = indices index)
		var v1 = [];
		var v2 = [];
		var normal = [];	
		//p2 - p1
		v1[x] = vs[3*ind[i+2]+x] - vs[3*ind[i+1]+x];
		v1[y] = vs[3*ind[i+2]+y] - vs[3*ind[i+1]+y];
		v1[z] = vs[3*ind[i+2]+z] - vs[3*ind[i+1]+z];
		//p0 - p1
		v2[x] = vs[3*ind[i]+x] - vs[3*ind[i+1]+x];
		v2[y] = vs[3*ind[i]+y] - vs[3*ind[i+1]+y];
		v2[z] = vs[3*ind[i]+z] - vs[3*ind[i+1]+z];
		//cross product
		normal[x] = v1[y]*v2[z] - v1[z]*v2[y];
		normal[y] = v1[z]*v2[x] - v1[x]*v2[z];
		normal[z] = v1[x]*v2[y] - v1[y]*v2[x];
		
		if (reverse){
			normal[x] = -normal[x];
			normal[y] = -normal[y]; 
			normal[z] = -normal[z]; 
		}
		
		for(j=0;j<3;j++){ //update the normals of the triangle
			ns[3*ind[i+j]+x] =  ns[3*ind[i+j]+x] + normal[x];
			ns[3*ind[i+j]+y] =  ns[3*ind[i+j]+y] + normal[y];
			ns[3*ind[i+j]+z] =  ns[3*ind[i+j]+z] + normal[z];
		}
	}
		
	//normalize the result
	for(var i=0;i<vs.length;i=i+3){ //the increment here is because each vertex occurs with an offset of 3 in the array (due to x, y, z contiguous values)
	
	    var nn=[];
		nn[x] = ns[i+x];
		nn[y] = ns[i+y];
		nn[z] = ns[i+z];
		
		var len = Math.sqrt((nn[x]*nn[x])+(nn[y]*nn[y])+(nn[z]*nn[z]));
		if (len == 0) len = 1.0;
		
		nn[x] = nn[x]/len;
		nn[y] = nn[y]/len;
		nn[z] = nn[z]/len;
		
		ns[i+x] = nn[x];
		ns[i+y] = nn[y];
		ns[i+z] = nn[z];
	}
	this.normals = ns;
};
  
/**
 * Generate the wireframe indices using the model indices
 */  
vxlModel.prototype.computeWireframeIndices = function(){
	var ind = this.indices;
    var wfi = [];
	var j = 0;
	for(var i=0; i<ind.length; i=i+3){
	   wfi[j] = ind[i];
	   wfi[j+1] = ind[i+1];
	   wfi[j+2] = ind[i+1];
	   wfi[j+3] = ind[i+2];
	   wfi[j+4] = ind[i+2];
	   wfi[j+5] = ind[i];
	   j = j+6;
	}
	this.wireframe = wfi;
};


/**
 * Calculate the bounding box of this model and its centre
 * 
 */
vxlModel.prototype.computeBoundingBox = function(){	
	var vs = this.vertices;
	var bbm  = [vs[0],vs[1],vs[2],vs[0],vs[1],vs[2]];
	  
	for(var i=0;i<vs.length;i=i+3){
		bbm[0] = Math.min(bbm[0],vs[i]);
		bbm[1] = Math.min(bbm[1],vs[i+1]);
		bbm[2] = Math.min(bbm[2],vs[i+2]);
		bbm[3] = Math.max(bbm[3],vs[i]);
		bbm[4] = Math.max(bbm[4],vs[i+1]);
		bbm[5] = Math.max(bbm[5],vs[i+2]);
	}
	
	
	var c = [0, 0, 0];
      
    c[0] = (bbm[3] + bbm[0]) /2;
    c[1] = (bbm[4] + bbm[1]) /2;
    c[2] = (bbm[5] + bbm[2]) /2;
    
    
    this.bb = bbm;  
    this.centre = c;
};


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


//@NOTE: Actors take care of rendering models
//@NOTE: model has to be loaded to be able to create actor. look for a way to enforce this.
//@NOTE: A possible optimization is to combine several actors in one buffer. Watch optimzation video on YouTube by Gregg Tavares

/**
 * <p>
 * An actor is a representation of a model in voxelent. Actors can cache model properties 
 * and modified them. This is useful when there are several actors based in the same model
 * but each one of them needs to have a different version of any given model property (i.e. color)
 * </p>
 * <p> 
 * To propagate one change for all the actors based in the same model, the setProperty method
 * should be invoked by setting the third parameter (scope) like this:
 * </p>
 * 
 * <pre>
 * var actor = vxl.c.scene.getActorByName('example.json');
 * actor.setProperty('color',[1.0,0.0,0.0], vxl.def.model)
 * </pre>
 * 
 * <p>If the change should be local (for just that actor)  then you should write:</p>
 * 
 * <pre>
 * var actor = vxl.c.scene.getActorByName('example.json');
 * actor.setProperty('color',[1.0,0.0,0.0], vxl.def.actor)
 * </pre>
 * 
 * <p> Or simply </p>
 *  
 * <pre>
 * var actor = vxl.c.scene.getActorByName('example.json');
 * actor.setProperty('color',[1.0,0.0,0.0])
 * </pre>
 * @class
 * @constructor
 */
function vxlActor(model){
  
  this.bb = [0, 0, 0, 0, 0, 0];
  this.position 	= vec3.create([0, 0, 0]);
  this.scale 		= vec3.create([1, 1, 1]);
  this.rotation 	= vec3.create([0, 0, 0]);

  this.visible   = true;
  this.mode = vxl.def.actor.mode.SOLID;
  this.opacity = 1.0;
  this.colors = model?(model.colors!=null?model.colors:null):null;	//it will create colors for this actor once a lookup table had been set up
  this.clones  = 0;
  
  this._renderers = [];
  this._gl_buffers = [];

  
  if (model){
  	this.model 	 = model;
  	this.name 	 = model.name;
  	this.color   = model.diffuse;
  	this.bb 	 = model.bb.slice(0);
  	this.mode    = model.mode==undefined?vxl.def.actor.mode.SOLID:model.mode;
  }
  
  vxl.go.notifier.addSource(vxl.events.ACTOR_BB_UPDATED, this);
  
};


/**
 * Sets the position of this actor. 
 * 
 * It updates the bounding box according to the position of the actor. The position of the actor
 * is initially [0,0,0] and it is relative to the model centre. If the model is not centered in 
 * the origin, then the actor's position will be relative to the model centre.
 * 
 * @param {Number, Array, vec3} x it can be the x coordinate, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} y if x is a number, then this parameter corresponds to the y-coordinate
 * @param {Number} z if x is a number, then this parameter corresponds to the z-coordinate
 */
vxlActor.prototype.setPosition = function (x,y,z){
    
    var bb = this.bb;
    var currentPos = vec3.set(this.position, vec3.create());
    
    this.position = vxl.util.createVec3(x,y,z); 
    
    //Now recalculate the bounding box 
    var shift = vec3.subtract(this.position, currentPos, vec3.create());
    bb[0] += shift[0];
    bb[1] += shift[1];
    bb[2] += shift[2];
    bb[3] += shift[0];
    bb[4] += shift[1];
    bb[5] += shift[2];
    
    vxl.go.notifier.fire(vxl.events.ACTOR_BB_UPDATED, this);
};
/**
 * Scales this actor. 
 * @param {Number, Array, vec3} s the scaling factor. The scaling factor is applied in all axes.
 *
 */
vxlActor.prototype.setScale = function(s){
    
    var bb = this.bb;
    
    if (typeof(s)=="number"){
        this.scale = vxl.util.createVec3(s,s,s);
        //@TODO: TEST
        bb[0] *= s
    	bb[1] += s
    	bb[2] += s
    	bb[3] += s
    	bb[4] += s
    	bb[5] += s
    }
    else{
        this.scale = vxl.util.createVec3(s);
        
        //@TODO: TEST
        bb[0] *= this.scale[0];
    	bb[1] += this.scale[1];
    	bb[2] += this.scale[2];
    	
    	bb[3] += this.scale[0];
    	bb[4] += this.scale[1];
    	bb[5] += this.scale[2];
    }
    
    vxl.go.notifier.fire(vxl.events.ACTOR_BB_UPDATED, this);
};

/**
* Sets the actor color. This color can be different from the original model color
* @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
* @param {Number} g if r is a number, then this parameter corresponds to the green component
* @param {Number} b if r is a number, then this parameter corresponds to the blue component
*/
vxlActor.prototype.setColor = function (r,g,b){
	this.color = vxl.util.createVec3(r,g,b); 
	vxl.go.console('Actor '+this.name+': color changed to : (' + this.color[0] +','+ this.color[1] +','+ this.color[2]+')');
};



/**
 * Sets the opacity of this actor. 
 * @param {Number} o a float value between 0 and 1. 
 */
vxlActor.prototype.setOpacity = function(o){
	if (o>=0 && o<=1){
		this.opacity = o;
	}
	else throw 'The opacity value is not valid';
};


/**
 * If the property exists, then it updates it
 * @param {String} property 
 * @param {Object} value 
 * @param {String} scope indicates if the change is made at the actor level or at the model level
 * valid values for scope are vxl.def.model and vxl.def.actor
 * @TODO: if the property is position or scale then call the respective methods from here
 */
vxlActor.prototype.setProperty = function(property, value, scope){
    
    if (property == 'position') {
    	this.setPosition(value);
    	return;
    }
    
    if (property == 'scale')    {
    	this.setScale(value);
    	return;
    }
    
    if (scope == vxl.def.actor || scope == undefined || scope == null){
		this[property] = value;
		vxl.go.console('Actor: The actor '+this.name+' has been updated. ['+property+' = '+value+']');
	}
	else if(scope == vxl.def.model){
		this.model[property] = value;
	}
	else{
		throw('vxlActor.setProperty. Scope:' + scope +' is not valid');
	}
	
};

/**
 * Returns an actor property if that property exists in the actor. Otherwise it will search 
 * in the model. This method is used by the renderer. There are some cases where actors have local changes
 * that are not reflected in the model. In these cases the renderer should pick the actor property
 * over the model property
 * @param{String} property the property name
 * @returns{Object} the property or undefined if the property is not found 
 */
vxlActor.prototype.getProperty = function(property){
	if (this.hasOwnProperty(property)) {
		return this[property];
	}
	else if (this.model.hasOwnProperty(property)){
		return this.model[property];
	}
	else {
		return undefined;
	}
};

/**
 * Estimates the current position as
 * the center of the current bounding box. 
 * This method does not update the internal position of the actor
 * it only returns an estimate based on the location of its bounding box.
 */
vxlActor.prototype.computePosition = function(){
	bb = this.bb;
	var cc = this.position;
	
	cc[0] = (bb[3] + bb[0]) /2;
	cc[1] = (bb[4] + bb[1]) /2;
	cc[2] = (bb[5] + bb[2]) /2;
		
	cc[0] = Math.round(cc[0]*1000)/1000;
	cc[1] = Math.round(cc[1]*1000)/1000;
	cc[2] = Math.round(cc[2]*1000)/1000;
	
	return vec3.create(cc); 
};


/**
* Sets the visualization mode for this actor.
* @param {vxl.def.actor.mode} mode mode needs to be one of the elements defined in vxl.def.actor.mode
* @TODO: VALIDATE
*/
vxlActor.prototype.setVisualizationMode = function(mode){
	this.mode = mode;
};

/**
* Sets the lookup table for this actor.
* This method will only succeed if the model that this actor represents has scalars 
* @param {String} lutID the lookup table id. @see{vxl.def.lut.list} for currently supported ids.
* @param {Number} min lowest value for interpolation
* @param {Number} max highest value for interpolation
*/
vxlActor.prototype.setLookupTable = function(lutID,min,max){
	if (this.model.scalars){
		var lut = vxl.go.lookupTableManager.get(lutID);
		this.colors  = lut.getColors(this.model.scalars,min,max);
	}
};

/**
* Flips the normal for this actor. It delegates the task to the model
* @TODO: Review. we could want the actor to have flipped normals but not to impose this on the model. 
*/
vxlActor.prototype.flipNormals = function(){
	this.model.getNormals(true);
};

/**
* Sets the visibility of the actor
* @param flag true or false
*/
vxlActor.prototype.setVisible = function(flag){
    this.visible = flag;
};

/**
* Is visible?
*/
vxlActor.prototype.isVisible = function(){
    return this.visible;
};

/**
 * Duplicates this actor.
 * 
 * Properties copied by REFERENCE:
 * model,
 * buffers,
 * renderers
 * 
 * Everything else is copied by VALUE.
 * 
 * This method is fundamental to replicate objects in the scene, without having to duplicate
 * the shared model. A cloned actor however can have different position, colors, properties, etc.
 * 
 * If a cloned actor modifies his internal model, any other actor that shares the model will be
 * affected. 
 * 
 * The returned actor is not added to the scene automatically. It is up the
 * programmer to determine the scene the cloned actor needs to be added to if any.
 * 
 * @see vxlModel
 * @returns {vxlActor} an actor 
 */
vxlActor.prototype.clone = function(){
    this.clones++;
	
	var duplicate = new vxlActor(this.model);
	duplicate['program']   = this['program'];
	vec3.set(this.scale,    duplicate.scale);
	vec3.set(this.position, duplicate.position);
	
	
	//Now to save us some memory, let's SHARE the WebGL buffers that the current actor has already allocated'
	//duplicate.renderers = this.renderers;
	//duplicate.buffers   = this.buffers;
	//duplicate.model 	= this.model;
	duplicate.name     += '-'+this.clones; 
	return duplicate;
};


/**
* @private
* It gives the strategy the opportunity to allocate memory for this actor. For instance
* WebGL buffers.
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly.
*/
vxlActor.prototype._allocate = function(renderer){
	if (this._renderers.indexOf(renderer)!=-1){ //if this renderer has been allocated then ignore
   		return;
   }
   
   var buffers = renderer._allocateActor(this);
   
   this._renderers.push(renderer);
   this._gl_buffers.push(buffers);

};

/**
* @private
* It gives the strategy the opportunity to deallocate memory for this actor.
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly. 
*/
vxlActor.prototype._deallocate = function(renderer){
  renderer._deallocateActor(this);
};

/**
* @private
* Delegates the rendering of the actor to the strategy
* 
* This method is private and it is only supposed to be called by other objects inside
* voxelent. Do not invoke directly. 
*/
vxlActor.prototype._render = function(renderer){
	
	if (!this.visible){ 
		return;
	}
	renderer._renderActor(this);
};

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
 * @class
 *  A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * 	communicates with the program) from the actor.
 * 
 *  Any rendering strategy should extend from vxlRenderStrategy or one of its descendants
 */
function vxlRenderStrategy(renderer){
	this.renderer = renderer;
}


/**
 * @param {vxlActor} actor the actor to allocate memory for
 */
vxlRenderStrategy.prototype.allocate = function(actor){
	//DO NOTHING. THE DESCENDANTS WILL.
}


/**
 * @param {vxlActor} actor the actor to deallocate memory from
 */
vxlRenderStrategy.prototype.deallocate = function(actor){
	//DO NOTHING. THE DESCENDANTS WILL.
}
/**
 * @param {vxlActor} actor	the actor to render
 */
vxlRenderStrategy.prototype.render = function(actor){
	//DO NOTHING. THE DESCENDANTS WILL.
}


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

//Inheritance stuff
vxlBasicStrategy.prototype = new vxlRenderStrategy(undefined)
vxlBasicStrategy.prototype.constructor = vxlBasicStrategy;

/**
 * @constructor
 * @class
 * Implements a basic rendering strategy that works with the following programs:
 * 
 * vxl.def.glsl.lambert
 * vxl.def.glsl.phong
 * 
 * A vxlBasicStrategy object is selected by default as the strategy that an actor
 * will use for rendering.
 * 
 * A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * 	communicates with the program) from the actor.
 * 
 */
function vxlBasicStrategy(renderer){
	vxlRenderStrategy.call(this,renderer);
}

/**
 * Implements basic allocation of memory. Creates the WebGL buffers for the actor
 * @param{vxlActor} actor the actor to allocate memory for
  * @returns an object that contains the allocated WebGL buffers
 */
vxlBasicStrategy.prototype.allocate = function(actor){
   
    vxl.go.console('Actor: Allocating actor '+actor.name+' for view '+ this.renderer.view.name);
   	
	var gl = this.renderer.gl;
	var model = actor.model;
    var buffers = {};
	
	//Vertex Buffer
	buffers.vertex = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	
	//Index Buffer
	if (model.indices != undefined){
		buffers.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
	}
	
	//Normals Buffer
	if (model.normals){
		buffers.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
	}
	
	//Color Buffer for scalars
	if (model.scalars != undefined || model.colors != undefined){
		buffers.color = gl.createBuffer(); //we don't BIND values or use the buffers until the lut is loaded and available
	}
	
	//Wireframe Buffer 
	if (model.wireframe != undefined){
		buffers.wireframe = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
	}
	
	//Cleaning up
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	return buffers;
};

/**
 * Passes the matrices to the shading program
 * @param {vxlActor} the actor 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 */
vxlBasicStrategy.prototype.applyActorTransform = function(actor){
    
    var r		= this.renderer;
    var trx 	= r.transforms
    var	prg 	= r.prg;
    var glsl 	= vxl.def.glsl;
    
    trx.calculateModelView();
    
    trx.push();
        mat4.scale      (trx.mvMatrix, actor.scale);
		mat4.translate	(trx.mvMatrix, actor.position);
		//@TODO: IMPLEMENT ACTOR ROTATIONS
	    prg.setUniform(glsl.MODEL_VIEW_MATRIX,	r.transforms.mvMatrix);
    trx.pop();
    
    trx.calculateNormal(); 
    
    prg.setUniform(glsl.PERSPECTIVE_MATRIX, 	r.transforms.pMatrix);
    prg.setUniform(glsl.NORMAL_MATRIX, 			r.transforms.nMatrix);
    
 };


vxlBasicStrategy.prototype.render = function(actor){

	var model 	= actor.model;
	var idx 	= actor._renderers.indexOf(this.renderer);
    var buffers = actor._gl_buffers[idx]; 
    var r  		= this.renderer;
	var gl 		= r.gl;
	var prg 	= r.prg;
	var trx 	= r.transforms;
	var glsl    = vxl.def.glsl;
	
	this.applyActorTransform(actor);
	
	var diffuse = [actor.color[0], actor.color[1], actor.color[2],1.0];
	
	if (actor.opacity < 1.0){
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		diffuse[3] = this.opacity;
	}
	else {
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		diffuse[3] = 1.0;
	}
	
	prg.setUniform("uMaterialDiffuse",diffuse);
	prg.setUniform("uUseVertexColors", false);
    
    prg.disableAttribute(glsl.COLOR_ATTRIBUTE);
	prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
	prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
	
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
	}
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    	
	if (actor.colors){	
		try{
			prg.setUniform("uUseVertexColors", true);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(actor.colors.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute(glsl.COLOR_ATTRIBUTE);
			prg.setAttributePointer(glsl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
		}
		catch(err){
        	alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the color buffer. Error =' +err.description);
   		}
    }
    
    if(model.normals){
	    try{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
		}
	    catch(err){
	        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
    
    try{
		if (actor.mode == vxl.def.actor.mode.SOLID){
			prg.setUniform("uUseShading",true);
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (actor.mode == vxl.def.actor.mode.WIREFRAME){
			prg.setUniform("uUseShading", false);
			if (actor.name == 'floor'){
			     prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.wireframe);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (actor.mode == vxl.def.actor.mode.POINTS){
			prg.setUniform("uUseShading", true);
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			gl.drawArrays(gl.POINTS,0, this.model.vertices.length/3);
		}
		else if (actor.mode == vxl.def.actor.mode.LINES){
			prg.setUniform("uUseShading", false);
			prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
			gl.drawElements(gl.LINES, actor.model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else{
            alert('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+this.mode+' is not valid.');
			throw('There was a problem while rendering the actor ['+actor.name+']. The visualization mode: '+this.mode+' is not valid.');
			
		}
		//Cleaning up
		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
	     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
	catch(err){
		alert('Error rendering actor ['+actor.name+']. Error =' +err.description);
		throw('Error rendering actor ['+actor.name+']. Error =' +err.description);
	}
};

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
//Inheritance stuff
vxlBlenderStrategy.prototype = new vxlBasicStrategy()
vxlBlenderStrategy.prototype.constructor = vxlBlenderStrategy;


function vxlBlenderStrategy(renderer) {
	vxlBasicStrategy.call(this,renderer);
}

vxlBlenderStrategy.prototype.render = function(actor){
	
	if (actor.name == 'bounding box' || actor.name == 'axis' || actor.name =='floor'){
		return;
	}

	var model 	= actor.model;
	var idx 	= actor._renderers.indexOf(this.renderer);
    var buffers = actor._gl_buffers[idx]; 
    var r  		= this.renderer;
	var gl 		= r.gl;
	var prg 	= r.prg;
	var trx 	= r.transforms;
	var glsl    = vxl.def.glsl;
	
	this.applyActorTransform(actor);
	
	prg.disableAttribute(glsl.NORMAL_ATTRIBUTE);
	prg.enableAttribute(glsl.VERTEX_ATTRIBUTE);
	
	prg.setUniform("uKa", actor.getProperty("Ka"));
	prg.setUniform("uKd", actor.getProperty("Kd"));
	prg.setUniform("uKs", actor.getProperty("Ks"));
	prg.setUniform("uNs", actor.getProperty("Ns"));
	prg.setUniform("d", actor.getProperty("opacity"));
	prg.setUniform("illum", actor.getProperty("illum"));
	
	
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setAttributePointer(glsl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 0, 0);
	}
    catch(err){
        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    
    if(model.normals){
	    try{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute(glsl.NORMAL_ATTRIBUTE);
			prg.setAttributePointer(glsl.NORMAL_ATTRIBUTE,3,gl.FLOAT, false, 0,0);
		}
	    catch(err){
	        alert('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+actor.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
	
	
	try{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
		gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);

    	gl.bindBuffer(gl.ARRAY_BUFFER, null);
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	catch(err){
		alert('Error rendering actor ['+actor.name+']. Error =' +err.description);
		throw('Error rendering actor ['+actor.name+']. Error =' +err.description);
	}

};/*-------------------------------------------------------------------------
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
*  Each view has a vxlScene object associated to it. The actors added to the scene are those that the renderer's view will render.
*  Actors can be added/removed from the scene at any time.
*  The scene also determines the lookup table that is used by the actors in it.
*  A scene can have one or more views associated to it.
* 
*  @class
*  @constructor
*  @author Diego Cantor
*/
function vxlScene()
{
	this.views  				= [];
	this.actors 				= [];
	this.toys					= new vxlSceneToys(this);
	this.loadingMode 			= vxl.def.model.loadingMode.LIVE;
	this.normalsFlipped 		= false;
	this.lutID 					= null;
	this.timerID				= null;
	this.dispatchRate 			= 500;
	this.scalarMIN 				= Number.MAX_VALUE;
	this.scalarMAX 				= Number.MIN_VALUE;
	this.bb 					= [0, 0, 0, 0, 0, 0];
	this.centre 				= [0, 0, 0];
	this.frameAnimation			= null;

	if (vxl.c.scene  == null) vxl.c.scene 	= this;
	
	//Fancier than previous version, eh?
	//1. simpler semantics
	//2. one call 
	var ntf = vxl.go.notifier;
	var e = vxl.events;
	ntf.publish([e.SCENE_UPDATED], this);
	ntf.subscribe([e.MODELS_LOADED, e.DEFAULT_LUT_LOADED, e.ACTOR_BB_UPDATED], this)
};

/**
 * Handles events sent by vxlNotifier
 * @param {String} event This event should be defined in vxl.events
 * @param {Object} the source that sent the event. Useful for callbacks
 */
vxlScene.prototype.handleEvent = function(event,src){
	
	if (event == vxl.events.ACTOR_BB_UPDATED){
		if (this.hasActor(src)){
			this._computeBoundingBox();
		}
	}
	else if(event == vxl.events.MODELS_LOADED){
		this.updateScalarRange();
		if (this.lutID != null) {this.setLookupTable(this.lutID);}
	}
	else if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.lutID = 'default';
		this.setLookupTable(this.lutID);
	}

};


/**
 * Sets the loading mode for this scene 
 * @param mode one of the valid loading modes
 * @see {vxl.def.model.loadingMode} 
 */
vxlScene.prototype.setLoadingMode = function(mode){
	var m = vxl.def.model.loadingMode;
	
	if (mode == undefined || mode == null || 
		(mode != m.LIVE &&  mode != m.LATER && mode != m.DETACHED)){
		 	throw('the mode '+mode+ 'is not a valid loading mode');
	}
	this.loadingMode = mode;
};




/**
 * Calculates the global bounding box and the centre for the scene. 
 * @private
 */
vxlScene.prototype._updateBoundingBox = function(b){
    
    vxl.go.console('Scene: updating metrics with ('+ b[0]+','+b[1]+','+b[2]+') - ('+b[3]+','+b[4]+','+b[5]+')');
    if (this.actors.length == 1){
        //Quicky!  
        this.bb = this.actors[0].bb.slice(0);
        this.toys.update();
        return;
    }
    
    
    var bb = this.bb;
    var cc = this.centre;
    
	bb[0] = Math.min(bb[0],b[0]);
	bb[1] = Math.min(bb[1],b[1]);
	bb[2] = Math.min(bb[2],b[2]);
	bb[3] = Math.max(bb[3],b[3]);
	bb[4] = Math.max(bb[4],b[4]);
	bb[5] = Math.max(bb[5],b[5]);

	cc[0] = (bb[3] + bb[0]) /2;
	cc[1] = (bb[4] + bb[1]) /2;
	cc[2] = (bb[5] + bb[2]) /2;
	
	cc[0] = Math.round(cc[0]*1000)/1000;
	cc[1] = Math.round(cc[1]*1000)/1000;
	cc[2] = Math.round(cc[2]*1000)/1000;
	
	this.toys.update();

};

/**
 * Calculates the global bounding box and the center of the scene.
 * Updates the Scene's axis and bounding box actors.
 * @private
 */
vxlScene.prototype._computeBoundingBox = function() {
	this.bb = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	this.centre = [0.0, 0.0, 0.0];
	for(var i=0; i<this.actors.length; i++){
		this._updateBoundingBox(this.actors[i].bb);
	}
};

/**
 * This function creates AND ADD a new actor to this scene
 * @param {vxlModel} the model from which a new actor will be created AND added to this scene
 * 
 * If you are looking to create but not adding an actor call new vxlActor(model) instead.
 * 
 * @returns actor the actor that was created and added to the scene, from the model passed as parameter
 */
vxlScene.prototype.createActor = function(model){
	var actor = new vxlActor(model);
	this.addActor(actor);
	return actor;
};

/**
 * Creates multiples actors at once
 * @param models a list of models to create actors from
 */
vxlScene.prototype.createActors = function(models){
	vxl.go.console('Scene: Creating all the actors now');
	for (var i = 0; i < models.length; i++){
		this.createActor(models[i]);
	}	
};
/**
 * Adds one actor.
 * The added actor becomes the current one (vxl.c.actor)
 * @param actor the actor to be added to the scene
 */
vxlScene.prototype.addActor = function(actor){
    if (this.normalsFlipped){
        actor.flipNormals(true);
    }
    
    if (this.lutID != null){
        actor.setLookupTable(this.lutID, this.scalarMIN, this.scalarMAX);
    }
    
    this.actors.push(actor);
    this._updateBoundingBox(actor.bb); 
    
    vxl.go.console('Scene: Actor for model '+actor.model.name+' added');
    vxl.c.actor = actor;
    vxl.go.notifier.fire(vxl.events.SCENE_UPDATED, this);
};

/**
 * Removes one actor
 * @param actor the actor to be removed from the scene
 */
vxlScene.prototype.removeActor = function(actor){
	var idx = this.actors.indexOf(actor);
	this.actors.splice(idx,1);
    this._computeBoundingBox();
};

/**
 * Verifies if the actor passed as a parameter belongs to this scene
 * @param {vxlActor, String} actor the actor object or the actor name to verify 
 */
vxlScene.prototype.hasActor = function(actor){
	if (actor instanceof vxlActor){
		return (this.actors.indexOf(actor)!=-1)
	}
	else if (typeof(actor)=='string'){
		var aux = this.getActorByName(actor);
		return (aux != undefined);
	}
	else return false;
}

/**
 * Updates the Scene's scalarMAX and scalarMIN properties.
 */
vxlScene.prototype.updateScalarRange = function(){
	for(var i=0;i<this.actors.length;i++){
		var actor = this.actors[i];
		if (actor.model.scalars && actor.model.scalars.max() > this.scalarMAX) this.scalarMAX = actor.model.scalars.max();
		if (actor.model.scalars && actor.model.scalars.min() < this.scalarMIN) this.scalarMIN = actor.model.scalars.min();
	}
};

/**
 * Sets a new lookup table by passing the lookup table id
 * @param lutID the lookup table id
 */
vxlScene.prototype.setLookupTable = function(lutID){
	this.lutID = lutID;
	for(var i =0; i<this.actors.length; i++){
		var actor = this.actors[i];
		if (actor.setLookupTable){
			actor.setLookupTable(lutID,this.scalarMIN, this.scalarMAX);
		}
	}
};
/**
 * Allocates WebGL memory for the actors in this scene
 * @param renderer the renderer that will render the scene
 */
//vxlScene.prototype.allocate = function(renderer){
	//for(var i=0; i<this.actors.length; i++){
		//this.actors[i].allocate(renderer);
	//}
//}

/*
 * Removes all the actors from the Scene and resets the actor list
 * It will also set vxl.c.actor to null
 */
vxlScene.prototype.reset = function(){
	for(var i=0; i<this.actors.length; i++){
		this.actors[i] = null;
	}
	this.actors = [];
	vxl.c.actor = null;
	this._computeBoundingBox();
};

/**
 * Retrieves an actor object by name
 * @param name the name of the actor to retrieve
 */
vxlScene.prototype.getActorByName = function(name){
	for(var i=0; i<this.actors.length; i++){
		if(this.actors[i].name == name){
			return this.actors[i];
		}
	}
	return undefined;
};

/**
 * Changes the opacity for one or all actors in the scene
 * @param o opacity value [0..1]
 * @param name the name of the actor whose opacity will be changed. 
 *             If this parameter is missing, the opacity of all actors will be changed.
 */
vxlScene.prototype.setOpacity = function(o,name){
	if (name == null){
		for(var i=0; i<this.actors.length; i++){
			this.actors[i].setOpacity(o);
		}
	}
	else{
		var actor = this.getActorByName(name);
		actor.setOpacity(o);
	}

};

/**
 * Flips the normals for all the actors in the scene. This will
 * have an immediate effect in the side of the object that it is being lit.
 */
vxlScene.prototype.flipNormals = function(flag){
	this.normalsFlipped = flag;
	for(var i=0; i<this.actors.length; i++){
		this.actors[i].flipNormals(flag);
	}
};


/**
 * Changes the visualization mode for all the objects in the scene
 * @param mode the visualization mode. It can be... TODO
 */
vxlScene.prototype.setVisualizationMode = function(mode){
	if (mode == null || mode == undefined) return;
	for(var i=0; i<this.actors.length; i++){
			this.actors[i].setVisualizationMode(mode);
	}
};

/**
 * Calls the renderer process for all the views this scene is associated with
 */
vxlScene.prototype.render = function(renderer){

	//for (var i = 0, viewCount = this.views.length; i < viewCount; i+=1){
	//	var r = this.views[i].renderer;
		var r = renderer;
		r.clear();
		
		this.toys.render(r);
		
		if (this.frameAnimation != undefined){
			this.frameAnimation.render(r);
		}
		else{
			for(var a=0, actorCount = this.actors.length; a < actorCount; a+=1){
				   this.actors[a]._allocate(r);
			       this.actors[a]._render(r);
			}
	    }
	//}
};

/**
 * Sets the animation for this scene
 * @param {vxlFrameAnimation} animation the animation to set on this scene
 * @see vxlFrameAnimation
 */
vxlScene.prototype.setAnimation = function(animation){
	if (animation instanceof vxlFrameAnimation){
		this.frameAnimation = animation;
		this.frameAnimation.scene = this;
		vxl.go.console('Scene: animation added');
	}
};
/**
 * Removes the animation if there is one associated to this scene
 * @see vxlFrameAnimation
 */
vxlScene.prototype.clearAnimation = function(){
	if (this.frameAnimation) {
		this.frameAnimation.scene = null;
		this.frameAnimation = null;
	}
};

/**
 * Returns a list with the actor names
 * @returns {Array} a list with the actor names
 */
vxlScene.prototype.getActorNames = function(){
	var list = [];
	for(var a=0, actorCount = this.actors.length; a < actorCount; a+=1){
		list.push(this.actors[a].name);
	}
	return list;
};



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
 * @class Manages the axis, the bounding box and the floor
 * These are auxiliary objects or 'toys'
 */
function vxlSceneToys(scn){
    
    this.scene = scn;
    this.list   = [];

	this.axis 				= new vxlAxis();
	this.boundingbox 		= new vxlBoundingBox();
	this.floor  			= new vxlFloor();
	
	this.list.push(this.axis);
    this.list.push(this.boundingbox);
    this.list.push(this.floor);
};

/**
 * Updates the toys according to information from the scene
 * 
 */
vxlSceneToys.prototype.update = function(){
    this.axis.setCentre(this.scene.centre);
    this.boundingbox.setBoundingBox(this.scene.bb);
};
/**
 * Renders the toys
 * @param {vxlRenderer} r the renderer
 */
vxlSceneToys.prototype.render = function(r){
    for(var t = 0, max = this.list.length; t < max; t +=1){
        this.list[t]._allocate(r);
        this.list[t]._render(r);
    }
};/**
 * @class
 * @constructor
 */
function vxlLookupTable(){
	this.ID = null;
	this.map = null;
	this.max = Number.MIN_VALUE;
	this.min = Number.MAX_VALUE;
}

vxlLookupTable.prototype.load = function(ID,payload){
	this.ID = ID;
	this.map = payload;
	for (var key in this.map) {
		var n = Number(key);
		if (n < this.min) {this.min = n;}
		else if (n >= this.max) {this.max = n;}
    }
}

vxlLookupTable.prototype.getColor = function(value){
	var l = this;
	var key = Math.round(value);
	if (key >= l.min && key <= l.max){
	    var c = [l.map[key][0],l.map[key][1],l.map[key][2]];
		return c;
	}
	else if (key <l.min) { //truncate to min value
			return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2]];
	}
	else if (key>l.max){ //truncate to max value
		return  [l.map[l.max][0],l.map[l.max][1],l.map[l.max][2]];
	}
	else{
		alert('assertion error in getColor routine');
		return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2]];
	}
		
}

/**
*
*	@param s array with scalar data
*	@param max range
*	@param min range
*	@returns unpacked colors translated through this lookup table 
*/
vxlLookupTable.prototype.getColors = function(s,min,max){
	var c = [];
	
	for(var i=0;i<s.length;i++){
		var value = s[i] * this.max / max;
		var cc = this.getColor(value);
		c.push(cc[0]);
		c.push(cc[1]);
		c.push(cc[2]);
	
	}
	
	return c;
}
/**
 * Manages the lookup table files. The constructor will try to load all
 * the lookup tables defined in vxl.def.luts at once.
 * 
 * @class
 * @constructor
 */
function vxlLookupTableManager(){
	this.lutTimerID = 0;
	this.tables = [];
	this.location = "";
	vxl.go.notifier.addSource(vxl.events.DEFAULT_LUT_LOADED,this);
};

vxlLookupTableManager.prototype.setLocation = function(loc){
	this.location = loc;
}

/**
 * Load a lookup table file
 * @param {String} name the filename of the lookup table to load
 */
vxlLookupTableManager.prototype.load = function(name){
		var self = this;
		if (this.isLoaded(name)) return;

	    var request = new XMLHttpRequest();
	    request.open("GET", this.location+'/'+name+'.lut');
	    request.onreadystatechange = function() {
	      if (request.readyState == 4) {
		    if(request.status == 404) {
				alert (name + ' does not exist');
				vxl.go.console('LookupTableManager: '+name + ' does not exist');
			 }
			else {
				self.handle(name,JSON.parse(request.responseText));
			}
		  }
	    };
		request.send();
};
/**
 * Once the lookup table file is retrieved, this method adds it to the lookup table manager
 */
vxlLookupTableManager.prototype.handle = function (ID, payload) {
	var lut = new vxlLookupTable();
	lut.load(ID,payload);
	this.tables.push(lut);
	
	if (lut.ID == vxl.def.lut.main){
		vxl.go.notifier.fire(vxl.events.DEFAULT_LUT_LOADED, this);
	}
};
/**
 * Check if a lookup table has been loaded by this lookup table manager
 * @param {String} ID the id of the table to check
 */
vxlLookupTableManager.prototype.isLoaded = function(ID){
	for(var i=0;i<this.tables.length;i++){
		if (this.tables[i].ID == ID) return true;
	}
	return false;
};

/**
 * Retrieves a lookup table
 * @param {String} ID id of the lookup table to retrieve
 */
vxlLookupTableManager.prototype.get = function(ID){
	for(var i=0;i<this.tables.length;i++){
		if (this.tables[i].ID == ID) return this.tables[i];
	}
	return null;
};

/**
 * Returns a list with the names of all of the lookup tables that have been loaded.
 * @returns {Array} an array with the names of the lookup tables that have been loaded
 */
vxlLookupTableManager.prototype.getAllLoaded = function(){
    var tablenames = [];
    for(var i=0;i<this.tables.length;i++){
        tablenames[i] = this.tables[i].ID;
    }
    return tablenames;
};

/**
 * Checks if all the lookup tables have been loaded
 */
vxlLookupTableManager.prototype.allLoaded = function(){
	//@TODO: think of a timeout to alter this state in the case not all tables are loaded (can this happen?)
	return (vxl.def.lut.list.length == this.tables.length);
};

/**
 * Loads all the lookup tables defined in vxl.def.luts
 */
vxlLookupTableManager.prototype.loadAll = function(){
	for(var i=0;i<vxl.def.lut.list.length;i++){
		this.load(vxl.def.lut.list[i]);
	}
};

/**
 * Creates the global lookup table manager and load all the lookup tables at once
 */
vxl.go.lookupTableManager = new vxlLookupTableManager();
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


vxl.def.model.boundingBox = new vxlModel();
vxl.def.model.boundingBox.load('bounding box', { "vertices" : [], "wireframe":[0,1,1,2,2,3,3,0,0,4,4,5,5,6,6,7,7,4,1,5,2,6,3,7], "diffuse":[1.0,1.0,1.0,1.0]});

//vxlBoundingBox IS a vxlActor                                               
vxlBoundingBox.prototype = new vxlActor();
vxlBoundingBox.prototype.constructor = vxlBoundingBox;

/**
 * @class
 * @constructor
 * @extends vxlActor
 */
function vxlBoundingBox() {
	vxlActor.call(this, vxl.def.model.boundingBox);
	this.bb 		= [];
    this.mode 		= vxl.def.actor.mode.WIREFRAME;
    this.visible 	= false;
    this.toy    	= true;
};

/**
* Sets the bounding box
* @param {Array} b the bounding box. The format of this param should be [x1,y1,z1,x2,y2,z2]
* where x1,y1,z1 correspond to the minimum bounding coordinates and x2,y2,z2 correspond to the
* maximum bounding coordinates
*/
vxlBoundingBox.prototype.setBoundingBox = function(b){
	this.bb = [
		b[0], b[1], b[2],
		b[0], b[4], b[2],
		b[3], b[4], b[2],
		b[3], b[1], b[2],
		b[0], b[1], b[5],
		b[0], b[4], b[5],
		b[3], b[4], b[5],
		b[3], b[1], b[5] 
		];
        
    this.model.vertices = this.bb;
};



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


vxl.def.model.axis = new vxlModel();
vxl.def.model.axis.load('axis', {
                    	"vertices": [	-1, 0, 0, 	 1, 0, 0, 	 0,-2, 0,	 0, 2, 0,	 0, 0,-1,	 0, 0, 1	],
                    	"wireframe": [ 	0, 1, 	2, 3, 	4, 5	],
                    	"colors": [	1, 1, 0, 	  1, 1, 0, 	0, 1 ,0, 	 0, 1 ,0,   0, 0, 1,	 0, 0, 1 	]
                    	});
 

vxlAxis.prototype 				= new vxlActor();
vxlAxis.prototype.constructor 	= vxlAxis;

/**
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlAxis() {
	vxlActor.call(this,vxl.def.model.axis);
	this.centre 	= [0,0,0];
	this.mode 		= vxl.def.actor.mode.WIREFRAME;
	this.visible 	= false;
	this.toy     	= true;
};

/**
* Sets the centre of the axis actor in the scene
*/
vxlAxis.prototype.setCentre = function (ctr){
    var x = ctr[0];
	var y = ctr[1];
	var z = ctr[2];
	
	this.centre[0] = x;
	this.centre[1] = y;
	this.centre[2] = z;
    
    var ver = this.model.vertices;
	
	ver[0] = x-1;
	ver[1] = y;
	ver[2] = z;
	
	ver[3] = x+1;
	ver[4] = y;
	ver[5] = z;
	
	ver[6] = x;
	ver[7] = y-2;
	ver[8] = z;
	
	ver[9] = x;
	ver[10] = y+2;
	ver[11] = z;
	
	ver[12] = x;
	ver[13] = y;
	ver[14] = z-1;
	
	ver[15] = x;
	ver[16] = y;
	ver[17] = z+1;
};/*-------------------------------------------------------------------------
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


vxl.def.model.floor = new vxlModel();
vxl.def.model.floor.load('floor',{"vertices":[],"indices":[],"diffuse":[1.0,1.0,1.0,1.0]});

vxlFloor.prototype = new vxlActor();
vxlFloor.prototype.constructor = vxlFloor;

/**
 * @class
 * @constructor
 * @extends vxlActor
 */
function vxlFloor(){
	vxlActor.call(this, vxl.def.model.floor);
	this.mode 		= vxl.def.actor.mode.WIREFRAME;
    this.visible 	= false;
    this.toy    	= true;
};

/**
 * Creates the grid
 */
vxlFloor.prototype.setGrid =function(dimension, spacing){

	var dim = dimension;
    var lines = 2*dim/spacing;
    var inc = 2*dim/lines;
    var v = [];
    var i = [];

    for(var l=0;l<=lines;l++){
        v[6*l] = -dim; 
        v[6*l+1] = 0;
        v[6*l+2] = -dim+(l*inc);
        
        v[6*l+3] = dim;
        v[6*l+4] = 0;
        v[6*l+5] = -dim+(l*inc);
        
        v[6*(lines+1)+6*l] = -dim+(l*inc); 
        v[6*(lines+1)+6*l+1] = 0;
        v[6*(lines+1)+6*l+2] = -dim;
        
        v[6*(lines+1)+6*l+3] = -dim+(l*inc);
        v[6*(lines+1)+6*l+4] = 0;
        v[6*(lines+1)+6*l+5] = dim;
        
        i[2*l] = 2*l;
        i[2*l+1] = 2*l+1;
        i[2*(lines+1)+2*l] = 2*(lines+1)+2*l;
        i[2*(lines+1)+2*l+1] = 2*(lines+1)+2*l+1;        
    }
    this.model.vertices = v.slice(0);
    this.model.wireframe = i.slice(0);
    this.visible = true;
};




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
* Each HTML5 canvas is assigned a view object (vxlView) in Voxelent's Nucleo.
* 
* A vxlView provides the code to handle cameras, interaction and rendering capabilities, plus actor handling on the 
* HTML5 canvas that otherwise would need to be written over and over for each application
* if you were writing a WebGL app from scratch.
* Luckily this is not the case. You have the awesome vxlView who takes care of all these little details for you.
* @class
* @constructor
* @param {String} canvasID id of the canvas in the DOM tree. That's all we need to setup a vxlView for you
* @param {vxlScene} scene if this view is sharing a scene, this parameter corresponds to the scene being shared.
* @author Diego Cantor
*/

function vxlView(canvasID, scene){
	//View Identification
	//this.id = 0; //@TODO: Who handles this? Maybe one Scene has several Views?
	this.name = canvasID;
	this.canvas = document.getElementById(this.name);
	if (this.canvas == null){
		alert('View: the canvas ' + canvasID+ ' does not exist.');
		throw('View: the canvas ' + canvasID+ ' does not exist.');
	}
	

	this.width = this.canvas.width;
	this.height = this.canvas.height;
	
	this.clearDepth = 1.0;
	this.backgroundColor = vxl.def.view.background.slice(0);

	//Create Renderer
	this.renderer = new vxlRenderer(this);
	this.setBackgroundColor(this.backgroundColor);
	this.setClearDepth(this.clearDepth);
	
	//Create Camera Manager
	this.cameraman = new vxlCameraManager(this);
	
	//Create View Interactor
	this.interactor = new vxlTrackerInteractor(this);
	
	//Create Scene
	if (scene != null && scene instanceof vxlScene){
		this.scene = scene;
	}
	else if (vxl.c.scene != undefined){
		this.scene = vxl.c.scene;
	}
	else{
		this.scene = new vxlScene();
	
	}
	//Add this view to the scene;
	this.scene.views.push(this);
	
	
	//Namespace access updates
	

	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);     //Register events to listen to
	
	if (vxl.c.view == undefined){
		vxl.c.view = this;
	}
	
	vxl.go.views.push(this);
	this.setAutoResize(true);

	vxl.go.console('View: the view '+ this.name+' has been created');
};


/**
 * Handles the events to which a view is subscribed in Voxelent's Nucleo
 * @param {String} event the name of the event
 * @param {Object} source the origin of the event. Useful to do callbacks if necessary
 */
vxlView.prototype.handleEvent = function(event, source){
	vxl.go.console('vxlView ['+this.name+']: receiving event '+event);
	if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.scene.setLookupTable(vxl.def.lut.main);
	}
};


/**
 * Clears the scene. Delegates this task to the renderer.
 */
vxlView.prototype.clear = function(){
	this.renderer.clear();
};

/**
 * Resizes the canvas so it fits its parent node in the DOM tree
 */
vxlView.prototype.resize = function(){
    var parent = this.canvas.parentNode;
    this.width = $(parent).width()-5;       
    this.height = $(parent).height()-5;
    
    if (this.width > window.innerWidth - 5){
    	this.width = window.innerWidth -5;
    }
    
    if (this.height > window.innerHeight - 5){
    	this.height = window.innerHeight - 5;
    }
    
    $(this.canvas).attr('width', this.width);
    $(this.canvas).attr('height', this.height);
}

/**
 * Enables automatic resizing of the view when the browser window is resized
 * @param flag enbles automatic resizing if true, disables it if false
 */
vxlView.prototype.setAutoResize = function(flag){
    if (flag){
         this.resize(); //first time
        $(window).resize((function(self){return function(){self.resize();}})(this));
    }
    else{
        $(window).unbind('resize');
    }
}

/**
 * Starts the view
 */
vxlView.prototype.start = function(){
	this.renderer.start();
	this.refresh();
};

/**
 * Stops the view
 */
vxlView.prototype.stop = function(){
	this.renderer.stop();
};

/**
 * Resets the view
 */
vxlView.prototype.reset = function(){
	this.stop();
	this.scene.reset();
	this.cameraman.reset();
	this.start();
};

/**
 * Sets the view's background color
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 
 * @see vxlRenderer#clearColor
 */
vxlView.prototype.setBackgroundColor = function(r,g,b){
	this.backgroundColor = vxl.util.createVec3(r,g,b); 
	this.renderer.clearColor(this.backgroundColor);
};


/**
 * Sets the clear depth
 * @param {Number} d the new depth
 * @see vxlRenderer#clearDepth
 */
vxlView.prototype.setClearDepth = function(d){
	this.renderer.clearDepth(d);
};

/**
 * Refresh the view by invoking the rendering method on the renderer
 * @see vxlRenderer#render
 */
vxlView.prototype.refresh = function(){
	this.renderer.render();
};

/**
 * Uses the interactor passed as parameter to handle user gestures
 * @param {vxlViewInteractor} interactor an instance of a vxlViewInteractor
 * 
 */
 vxlView.prototype.setInteractor = function(i){
    this.interactor = i;
    this.interactor.connectView(this);
};

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
 * Creates vxlModel objects and assigns them to a vxlScene. 
 * 
 * vxlModelManager provides methods for loading remote and local models.
 * 
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlModelManager(){
	this.toLoad = new Array(); //analyze
	this.models = [];
	vxl.go.notifier.addSource(vxl.events.MODELS_LOADED,this);
};


/**
 * Uses a JSON/Ajax mechanism to load models from the webserver.
 * @param {String} filename name of the file that will be loaded. Voxelent will look for this file inside of the 
 * 						folder defined by the configuration variable vxl.def.model.folder
 * @param {vxlScene} optional parameter. The scene that will contain an actor for this model.
 * @param {Array} attributes to add to the respective actor once the model is being loaded
 * @param {Function} callback function once the model is loaded
 */  
vxlModelManager.prototype.load = function(filename, scene) {
    var manager = this;
	if (manager.isModelLoaded(filename)) return;
	
	vxl.go.console('ModelManager.load: Requesting '+filename+'...');
    var request = new XMLHttpRequest();
    request.open("GET", filename);
    
    request.onreadystatechange = function() {
    	if (request.readyState == 4) {
      		if (request.status == 200 || ( request.status == 0 && document.domain.length ==0)){
      			var name = filename.replace(/^.*[\\\/]/, '');
       			manager.add(JSON.parse(request.responseText),name,scene);
      		}
	    	else {
				alert ('There was a problem loading the file '+filename+'. HTTP error code:'+request.status);
	  		}
    	}
    };
    
    try{
    	request.send();
    } 
    catch(e){
    	if (e.code = 1012){
    		alert('The file '+filename+' could not be accessed. \n\n'+
    		'Please make sure that the path is correct and that you have the right pemissions');
    	}
    	else{
    		alert(e);
    	}
    }	
};

/**
 * Loads a list of models and assigns them to a scene
 * @param {Array} list list of files to load 
 * @param {vxlScene} scene scene to callback when the models are loaded 
 */
vxlModelManager.prototype.loadList = function(list,scene){
	this.toLoad = list.slice(0); 
	vxl.go.console('ModelManager.loadList: models to load ->' + this.toLoad.length);
   	for(var i=0;i<this.toLoad.length; i++){
		this.load(this.toLoad[i],scene);
   	}
};

/**
 * 
 * @param {Object} JSON_OBJECT the JSON object that contains the definition of the model
 * @param {String} name name of the model to be created
 * @param {vxlScene} scene the scene to be called back when the model is created
 */
vxlModelManager.prototype.add = function(JSON_OBJECT,name,scene){
	
	var model = new vxlModel(name, JSON_OBJECT);
	
	model.loaded = true;
	this.models.push(model);
	vxl.go.console('ModelManager: model '+model.name+' created.'); 
	
	if (scene != undefined && scene instanceof vxlScene){
		vxl.go.console('ModelManager: notifying the scene...');
		if (scene.loadingMode == vxl.def.model.loadingMode.LIVE){
			scene.createActor(model);
		}
		else if (scene.loadingMode == vxl.def.model.loadingMode.LATER){
			if(this.allLoaded()){
				scene.createActors(this.models);
			}
		}
		else if (scene.loadingMode == vxl.def.model.loadingMode.DETACHED){
			//do nothing
		}
	}
	
	if(this.allLoaded()){ 
		vxl.go.notifier.fire(vxl.events.MODELS_LOADED, this);
	}
 };
 
/**
 * It will delete all of the loaded models
 */  
vxlModelManager.prototype.reset = function(){
	this.firstLoadedModel = false;
	for (var i=0; i <this.models.length; i++){
		this.models[i] = null;
	}
	
	this.models        = [];
	this.toLoad        = [];
};

/**
 * Checks if a model has been loaded yet
 * @param {String} name the name of the model to check
 */
vxlModelManager.prototype.isModelLoaded = function(name){
	for(var i=0;i<this.models.length;i++){
		if (this.models[i].name == name) return true;
	}
	return false;
};

/**
 * Returns true if all the models in the list passed to the method loadList.
 */
vxlModelManager.prototype.allLoaded = function(){
	return (this.models.length == this.toLoad.length); //TODO: Verify one by one
};


/**
 * Returns the model if it has been loaded by this model manager, null otherwise.
 * @param {String} name the name of the model to retrieve
 */
vxlModelManager.prototype.getModelByName = function(name){
 	for(var i=0, max = this.models.length; i<max; i+=1){
		if (this.models[i].name == name) return this.models[i];
	}
	return null;
};

/**
 * Defines the global Model Manager 
 */
vxl.go.modelManager = new vxlModelManager();/*-------------------------------------------------------------------------
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
 * @namespace Application Programing Interface namespace.
 *  
 * Using vxl.api in your programs you will be able to access many of the features offered by 
 * Voxelent's Nucleo library.
 * 
 * By design, type checking is enforced throughout the functions provided by the public API. 
 * The goal is to help novice programmers that will use the API more often than advanced programmers.
  */
vxl.api = {
 
 /**
  * Creates and returns a vxlView object
  * @param {String} canvas_id The canvas' Document Object Model (DOM) id.
  * @param {vxlScene} scene optional, the scene associated to this view
  * @returns {vxlView} a new vxlView object
  */
 setup : function(canvas_id, scene){
 	if (scene != null && !(scene instanceof vxlScene)) throw ('api.setup: scene parameter is invalid');
 	return new vxlView(canvas_id,scene);
 },
  
  /**
   * Sets the rendering rate of the current view
   * @param {Number} r the new rendering rate given as a number in milliseconds
   * @see api#setCurrentView
   */
 setRenderRate : function(r){
	vxl.c.view.renderer.setRenderRate(r);
  },
  
  /**
   * @TODO: is this deprecated?
   */
 setCameraDistance :  function(op){
	 g_fovy = op;
	 vxl.go.console('fovY = ' + op);
 },
 
 /**
  * If the object passed as a parameter is a vxlView then it sets it up as the current view.
  * All subsequent calls to API functions that reference the current view will be redirected
  * to affect the newly set object.
  * @param {a} the vxlView object that we want to make the current one
  */
 setCurrentView :  function(a){
	if (a instanceof vxlView){
		vxl.c.view = a;
	}
 },

 /**
  * Returns the current view. This is the view that is receiving all the API calls
  * @returns {vxlView} the current view
  */
 getCurrentView :  function(){
	return vxl.c.view;
 },
 
 
 /**
  * Sets the current actor
  * @param {vxlActor, String} actor This could be an actor object or an actor name
  * 
  * If the actor name is passed to this method, there must be a current scene. 
  * Otherwise an exception will raise.
  */
 setCurrentActor :  function(actor){
	if (actor instanceof vxlActor){
		vxl.c.actor = actor;
	}
	else if (typeof actor == 'string'){
		if (vxl.c.scene == undefined) throw ('vxl.api.setCurrentActor: there is no Current scene. Please call vxl.api.setCurrentScene');
		
		var theActor = vxl.c.scene.getActorByName(actor);
		if (theActor != undefined){
			vxl.c.actor = theActor;
		}
		else {
			throw ('vxl.api.setCurrentActor: the actor '+actor+' does not exist in the current scene');
		}
	}
	else{
	    vxl.c.actor = actor;
	}
 },
 
 getCurrentActor :  function(){
	return vxl.c.actor;
 },

 setCurrentCamera :  function(a){
	if (a instanceof vxlCamera){
		vxl.c.camera = a;
	}
 },
 
 getCurrentCamera :  function(){
	return vxl.c.camera;
 },

 setLookupTable :  function(name){
 	if (!vxl.go.lookupTableManager.isLoaded(name)){
		vxl.go.console('Lookup Table '+name+' has not been loaded');
		return;
	}
	
	vxl.c.view.scene.setLookupTable(name);
 },
 
 /**
  *@param {String} folder. This parameter is required. It specifies the location from where
  * the lookup tables will be loaded. If this parameter is not passed the current folder will
  * be used. The current folder is determined on running time and it is the folder where voxelent is 
  * located.
  */
 loadLUTS :  function(folder){
 	vxl.go.lookupTableManager.setLocation(folder);
	vxl.go.lookupTableManager.loadAll();
 },

 /**
  * Go back to square one. A clean scene with no actors
  * @TODO: Provide the option to keep the models in the cache (vxlModelManager)
  */
 resetScene :  function(){
    if (vxl.c.animation) vxl.c.animation.stop();
	vxl.c.view.reset();
	vxl.go.modelManager.reset();
 },
 
 /**
  * Loads 3D models, textures and other models to a Voxelent's scene.
  * 
  * This method is very flexible. It can load one or multiple models depending on the type of the 
  * first parameter. If it is a String, it will try to find the file with that name in Voxelent's data folder
  * (voxdata by default). Otherwise, if  the parameter 'arguments' is an Array, load will iterate
  * through it and will try to load every element of this list. Every element being the file name.
  * 
  * Nucleo supports three different loading modes which are defined in 
  * vxl.def.model.loadingMode:
  * 
  * LIVE: As each asset is loaded it is added immediately into the scene by creating the corresponding actor
  * 
  * LATER: All the models are loaded first THEN the actors are created. 
  * This is useful when you want to display a full scene instead of showing incremental updates.
  * 
  * DETACHED: The models are loaded into the vxlModelManager object but actors are never created.
  * This allows background loading.
  * 
  * @param {String|Array} arguments the name of the asset or the list of models (each element being the file name).
  * @param {vxl.def.model.loadingMode} mode the loading mode
  * @param {vxlScene} scene the scene in case we do not want to load these models in the current one
  * @param {String} path the path that will be concatenated to the list of files (optional).
  * 
  * @see {vxl#def#asset#loadingMode}
  * @see {vxlAssetManager}
  * @see {vxlScene#setLoadingMode}
  * 
  */
 load :  function(arguments,mode,scene,path){
 	
 	function getPath(path){
 		if (path ==undefined || path == null) {
 			return "";
 		}
 		else if (path.length - 1 == path.lastIndexOf('/')){
 			return path;
 		}
 		else return path + '/';
 	}
 	
 	var scene = scene==null?vxl.c.scene:scene;
 	var models = [];
 	if (typeof(arguments) == 'string' || arguments instanceof String){
 		models.push(getPath(path)  + arguments);
 	}
 	else if (arguments instanceof Array){
 		p = getPath(path);
 		for(var i=0; i<arguments.length;i++){
			models.push(p + arguments[i]);
		}
 	}
 	if (mode != undefined && mode != null){
		scene.setLoadingMode(mode);
	}
	
	vxl.go.modelManager.loadList(models, scene);
 },
 
 
 /**
  * Activates the axis in the current view
  * The axis is always centered in the focal point of the camera
  */
 axisON :  function(){
	vxl.c.view.scene.toys.axis.setVisible(true);
	vxl.c.camera.refresh();
 },
 
 /**
  * Hides the axis in the current view
  */
 axisOFF :  function(){
	vxl.c.view.scene.toys.axis.setVisible(false);
	vxl.c.camera.refresh();
 },
 
 /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 boundingBoxON :  function(){
	vxl.c.view.scene.toys.boundingbox.setVisible(true);
	vxl.c.camera.refresh();
 },
 
  /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 boundingBoxOFF:  function(){
	vxl.c.view.scene.toys.boundingbox.setVisible(false);
	vxl.c.camera.refresh();
 },
 
 /**
  * @TODO: Reimplement behaviour in the camera
  */
 toggleSpin :  function(){
	//TODO: RECODE IT.
	alert('not implemented');
 },
 

/**
 * Sets the background color of the current view.
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 */ 
 setBackgroundColor :  function(r,g,b){
	vxl.c.view.setBackgroundColor(r,g,b);
 },



/**
 * If an actor has been selected (If there is an current actor in vxl.c.actor), 
 * changes its visualization mode to WIREFRAME. 
 * Otherwise,shows all the scene in WIREFRAME mode.
 * 
 * @see vxl.def.actor.mode
 */ 
wireframeON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	else {
		vxl.c.scene.setVisualizationMode(vxl.def.actor.mode.WIREFRAME);
	}
	vxl.go.console('API:Wireframe is shown.');
 },
 
 /**
  * Changes the visualization mode of the current actor (or all the actors if there's no current actor')
  * to a solid representation
  * @see vxl.def.actor.mode
  */
 surfaceON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.SOLID);
	}
	vxl.go.console('API:Wireframe is hidden.');
 },
 
 /**
  * Changes the visualization mode of the current actor (or all the actors if there's no current actor')
  * to a point representation
  * @see vxl.def.actor.mode
  */
 pointsON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
 },
 
 /**
  * Retrieves an actor object by name
  * @param {String} actorName the name of the actor
  * @param {vxlScene} scene looks in the specified scene. This parameter is optional. 
  * If not specified, the current scene (vxl.c.scene) will be queried
  *  
  */
 getActorByName :  function(actorName,scene){
 	var _scene = scene;
 	if (_scene == undefined){ //look in the current scene
 		if (vxl.c.scene == undefined){
 			throw ('vxl.api.getActorByName: There is no current scene. Please the scene you want to look the actor '+actorName+' into');
 		}
 		else{
 			_scene = vxl.c.scene;
 		}
 	}
 	
 	return _scene.getActorByName(actorName);
 },
 
 /**
  * @param {Number} op  opacity value between 0 and 1 (float)
  * @TODO: Reevaluate this method. Opacity is shader dependent
  */
 setActorOpacity :  function(op){
    var opacity = Math.min(Math.max(0,Math.abs(op)),1);
	if (vxl.c.actor){
		vxl.c.actor.setOpacity(op);
	}
	else{
		vxl.c.view.scene.setOpacity(opacity);
	}
	vxl.c.view.refresh();
	vxl.go.console('API:Opacity changed to '+(op*100)+'%');
  },
  
 
 /**
  * @param actor it can be a vxlActor or a String with the actor name
  * @param {String} property the property to change 
  * @param {Object} value the new value
  */
 setActorProperty :  function (actor, property, value){
	
	if (vxl.c.scene == undefined) throw ('vxl.api.setActorProperty: there is no current scene. Please call vxl.api.setCurrentScene');
	
	var scene = vxl.c.scene;
	var _actor = actor;
	if (_actor instanceof vxlActor){
		_actor.setProperty(property,value);
	}
	else{ //TODO: assuming string.VALIDATE!
		_actor = scene.getActorByName(_actor);
		_actor.setPropert(property,value);
	}
 },
 
 /**
  * @param {bool} flag if true this method will flip the normals. If false normals will be
  * calculated the 'normal' way.
  */
 flipActorNormals :  function (flag){
	if (vxl.c.actor){
		vxl.c.actor.flipNormals(flag);
	}
	else{
		vxl.c.view.scene.flipNormals(flag);
	}
	vxl.c.view.refresh();
 },
 
 /**
  *If there is an animation object (vxl.c.animation) then
  * it stops the animation 
  */
 stopAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.stop();
 },
 
 /**
  *If there is an animation object (vxl.c.animation) then 
  * it starts the animation 
  */
 startAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.start();
 },
 
 /**
  * If there is a vxlFrameAnimation object attached to the scene then it 
  * sets the current animation frame
  * @param {Number} f the animation frame index
  */
 setFrame :  function(f){
	if (vxl.c.animation == null) return;
	var a = vxl.c.animation;
	a.stop();
	if (f>=1){
		a.setFrame(f);
	}
	else{
		vxl.go.console('API:frame ' + f +' does not exist. Animation goes back to the beginning');
		a.setFrame(1);
	}
 },

 /**
  *Removes the current animation from the scene 
  */
 clearAnimation :  function(){
	if(vxl.c.animation){
		vxl.c.animation.stop();
		vxl.c.animation = null;
	}
 },
 /**
  * Resets the current camera
  */
 resetCamera :  function(){
	vxl.c.camera.reset();
 },
 
 /**
  * Saves the current camera state
  */
 saveCamera :  function(){
	vxl.c.camera.save();
 },
 
 /**
  * Retrieves the last saved camera state
  */
 retrieveCamera :  function(){
	vxl.c.camera.retrieve();
 },
 
 /**
  * Sets the azimuth of the camera
  * @param {Number} a azimuth
  */
 setAzimuth :  function(a){
	vxl.c.camera.setAzimuth(a);
 },
 
 /**
  * Sets the elevation of the camera
  * @param {Number} e elevation
  */
 setElevation :  function(e){
	vxl.c.camera.setElevation(e);
 },
 
 
 getLookupTables :  function(){
    return vxl.go.lookupTableManager.getAllLoaded();
 },
 
 //runScript :  function(file){
 //use JQuery here.
 //}
 
 /**
  * Loads a program
  * @param{vxlView} view the view to configure
  * @param{Object} program a JSON object that defines the progrma to execute
  * @param{vxlRenderStrategy} strategy the strategy that the renderer should follow to communicate with the program
  */
 setProgram :  function(view,program,strategy){
    view.renderer.setProgram(program,strategy);
    
 },
 
 //TODO: Wwork in progress... sorry for the mess.
 //buildProgramFromDOM: function(id,VERTEX_SHADER_DOM_ID,FRAGMENT_SHADER_DOM_ID){
 //       var vshader= document.getElementById(VERTEX_SHADER_DOM_ID);
        
     
 //},
 
 /**
  * Sets a uniform
  */
  setUniform: function(uniformID, value,hint){
      vxl.c.view.renderer.prg.setUniform(uniformID, value,hint);
  },
  
  /**
   * Return the uniform names of the current program
   */
  getUniformNames: function(){
      return vxl.c.view.renderer.prg._uniformList[vxl.c.view.renderer.prg._currentProgramID].slice(0);
  },
  
  subscribe: function(event, context){
  	vxl.go.notifier.addTarget(event, context);
  }
  
 }; 
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
/*
* Idea: to use a lightweight pattern. A pool of vxlModels that are reused.
* Every frame the information is copied to the buffers, instead of saving as many gl vbos as models
*/
/**
 * Provides frame-to-frame animation
 * 
 * @class
 * @constructor
 * @param map  JSON object where each property name is one frame and each property value
 * is a list of actors 
 * var map = {"frame1":["actor1","actor2"], "frame2":["actor3","actor4"]}
 */
function vxlFrameAnimation(map){
	this.scene             = null;
	this.timerID           = 0;
	this.actorByFrameMap   = [];
	this.activeFrame       = 1;
	this.mark              = 1;
	this.running           = false;
    this.frameCount        = 0;
    this.renderRate        = 500;
    this._setup(map);
    if (vxl.c.animation == null) vxl.c.animation = this;
};

/**
 * The actor will appear in the indicated frame of this animation
 * @param {Number} frame the frame
 * @param {String} actorName the name of the actor. It must exist.
 */
vxlFrameAnimation.prototype.addActorToFrame = function(frame,actorName){
	if (typeof(this.actorByFrameMap[frame])=='undefined'){
		this.actorByFrameMap[frame] = new Array();
	}
	if (this.actorByFrameMap[frame].indexOf(actorName) == -1){
		this.actorByFrameMap[frame].push(actorName);
	}
    if (frame>this.frameCount) this.frameCount = frame;
};

/**
 * Map is a JSON object where each property name is one frame and each property value
 * is a list of actors 
 * 
 * var map = {"frame1":["actor1","actor2"], "frame2":["actor3","actor4"]}
 * 
 */
vxlFrameAnimation.prototype._setup = function(map){
	this.activeFrame = 1;

	for (var f in map){
		var actorList = map[f];
		var frame = parseInt(f.substr(5,f.length));
		for(var i=0, max = actorList.length; i < max; i+=1){
			this.addActorToFrame(frame,actorList[i]);
		}
	}
	vxl.go.console('FrameAnimation: Setup finished.');
};

/**
 * Starts the animation loop
 */
vxlFrameAnimation.prototype.start = function(){
	if (this.scene == null) throw 'FrameAnimation: the animation is not associated with any scene. Please use scene.setFrameAnimation method';

    this.running = true;
	this.timerID = setInterval((function(self) {return function() {self.nextFrame();}})(this),this.renderRate);
};

/**
 * Stops the animation loop
 */
vxlFrameAnimation.prototype.stop = function(){
	clearInterval(this.timerID);
    this.running = false;
};

vxlFrameAnimation.prototype.setFrameRate = function(rate){
	if (rate <=0) return;
	this.renderRate = rate;
	this.stop();
	this.start();
};


/**
 * Performs the animation rendering. The Scene delegates the rendering to a FrameAnimation object
 * when this object is registered with the scene.
 */
vxlFrameAnimation.prototype.render = function(renderer){
	if (this.scene == null) throw 'FrameAnimation: the animation is not associated with any scene. Please use scene.setFrameAnimation method';
	//if (!this.running) return;
	
	for (var i=0; i<this.actorByFrameMap[this.activeFrame].length; i++){
		var actorName = this.actorByFrameMap[this.activeFrame][i];
		var actor = this.scene.getActorByName(actorName);
		if (actor != null){
			actor.allocate(renderer);
			actor.render(renderer);
		}
	}
};

/**
 * Verifies if the frame number passed as parameter is in the range of the current animation
 * @param f a frame number
 * @returns true if the number passed as parameter is a valid frame number, false otherwise
 */
vxlFrameAnimation.prototype.isValidFrame = function(f){
 return (f>=1 && f<= this.frameCount);
};

/**
 * Moves the animation to the next valid frame. If the activeFrame is the last frame in the animation, then
 * the animation is reset to the first frame.
 */
vxlFrameAnimation.prototype.nextFrame = function(){
	if (this.activeFrame < this.frameCount){
		this.activeFrame++;
	}
	else{
		this.activeFrame = 1;
	}
};

/**
 * Gets the next n valid frames. Works as a circular buffer.
 */
vxlFrameAnimation.prototype.getNextFrames = function(n){
	var list = [];
	var c = this.activeFrame;
	if (n> this.frameCount) n = this.frameCount;
	for (var i=1; i <=n; i++){
		var next = c + i;
		if (this.isValidFrame(next)){
			list.push(next);
		}
		else{
			list.push(next-this.frameCount);
		}
	}
	vxl.go.console('Animation: next frames: ' + list);
	return list;
};

/**
 * Gets the previous n frames. Works as a circular buffer.
 */
vxlFrameAnimation.prototype.getPreviousFrames = function(n){
	var list = [];
	var c = this.activeFrame;
	if (n> this.frameCount) n = this.frameCount;
	for (var i=1; i <=n; i++){
		var previous = c - i;
		if (this.isValidFrame(previous)){
			list.push(previous);
		}
		else{
			list.push(this.frameCount+previous);
		}
	}
	vxl.go.console('Animation: previous frames: ' + list);
	return list;
};

/**
 * Sets f as the active frame
 * @param f the frame to set as active
 */
vxlFrameAnimation.prototype.setFrame = function (f){
	if (f>=1 && f <= this.frameCount){
		this.activeFrame = f;
		this.render();
	}
};

