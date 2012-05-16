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

if (!jQuery){
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
   	number : '0.88',
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
						VERTEX_SHADER   : 'VERTEX_SHADER',
                       
						FRAGMENT_SHADER : 'FRAGMENT_SHADER'
					},
    /** 
     * @namespace Lookup Table Definitions 
     * @property {Array}       list         List of lookup tables available
     * @property {String}      main         Lookup table loaded by default
     * @property {String}      folder       Folder relative to the web page where lookup tables can be found
     */                
	lut             : {
             
						list : ["default","aal","autumn","blackbody","bone","brodmann","cardiac",
								"copper","cortex","cte","french","fs","ge_color","gold","gooch",
								"hot","hotiron","hsv","jet","nih","nih_fire","nih_ice","pink",
								"rainramp","spectrum","surface","x_hot","x_rain"],
      
						main:"default",

						folder:"voxdata/luts"
				    },
	/**
    * @namespace Default values for models
    * @property {String} folder     Default folder where voxelent will look up for models. This folder is relative to the web page
    * @property {Array}  diffuse    A 4-valued array that contains the color for actor's default diffuse property. This array has the format [r,g,b,a]
    */
	model			: { 
						folder:"voxdata/models",
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
                        */
						mode: {	SOLID:'SOLID', WIREFRAME:'WIREFRAME', POINTS:'POINTS'}
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
    					type      : { ORBITING: 'ORBITING', TRACKING : 'TRACKING'}
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
	MODELS_LOADED		: 'vxl.events.MODELS_LOADED'
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
}

};



Array.prototype.max = function(){
	return Math.max.apply(Math, this);
};

Array.prototype.min = function(){
	return Math.min.apply(Math, this);
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
 * @class
 * @constructor
 */
function vxlNotifier(){
	this.targetList = {};
	this.sourceList = {};
    
};

vxlNotifier.prototype.addTarget = function(event,t){
	vxl.go.console('vxlNotifier: adding target for event '+event);
	var targetList = this.targetList;
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	targetList[event].push(t);
};


vxlNotifier.prototype.addSource = function(event,src){
	vxl.go.console('vxlNotifier: adding source for event '+event);
	var targetList = this.targetList;
	var sourceList = this.sourceList;
	
	if (sourceList[event]== undefined){
		sourceList[event] = src;
	}
	
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	
	$(document).bind(event, function(e,event,src,targetList){
		for (var index=0;index<targetList[event].length;index++){
			targetList[event][index].handleEvent(event,src);
		}
	});
};

vxlNotifier.prototype.fire = function(event){
	var targetList = this.targetList;
	var src = this.sourceList[event];
	vxl.go.console('vxlNotifier: firing ' +event);
	$(document).trigger(event,[event,src,targetList]);
};

vxlNotifier.prototype.getEvents = function(){
	var list = [];
	for (var event in this.sourceList){
		list.push(event);
	}
	return list;
};

vxlNotifier.prototype.getTargetsFor = function(event){
	var targets = this.targetList[event];
	var list = [];
	for (var index=0;index<targets.length;index++){
		list.push(getObjectName(targets[index]));
	}
	return list;
};


 

    



/**
 * @class
 * 3-tuple vector operations
 */
vxl.vec3 = {};

vxl.vec3.dot = function(a,b){
	if (!(a instanceof vxlVector3) || !(b instanceof vxlVector3)) {
		alert('vxl.math.vector.dot ERROR');
		return null;
	}
	return ((a.x*b.x) + (a.y*b.y) + (a.z*b.z));
};

vxl.vec3.cross = function(a,b){
	if (!(a instanceof vxlVector3) || !(b instanceof vxlVector3)) {
		alert('vxl.math.vector.cross ERROR');
		return null;
	}
	
	var Zx = a.y * b.z - a.z * b.y; 
	var Zy = a.z * b.x - a.x * b.z;
	var Zz = a.x * b.y - a.y * b.x;
	return new vxlVector3(Zx,Zy,Zz);
};
 
vxl.vec3.subtract = function (a,b){
	if (!(a instanceof vxlVector3) || !(b instanceof vxlVector3)) {
		alert('vxl.math.vector.substract ERROR');
		return null;
	}
	return new vxlVector3(a.x - b.x, a.y - b.y, a.z - b.z);
};

vxl.vec3.scale = function(v,s){
	if (!(v instanceof vxlVector3)){
		alert('vxl.math.vector.scale ERROR');
		return null;
	}
	var vv = new vxlVector3();
	vv.x = v.x * s;
	vv.y = v.y * s;
	vv.z = v.z * s;
	return vv;
};

vxl.vec3.negate  = function(v){
	return vxl.vec3.scale(v,-1);
};

vxl.vec3.length = function(v){
 return Math.sqrt((v.x*v.x) + (v.y*v.y) + (v.z*v.z));
};

vxl.vec3.round = function(v,n){
	var v = this;
	if (n == null || n == undefined || n <0) {
		v.x = Math.round(v.x);
		v.y = Math.round(v.y);
		v.z = Math.round(v.z);
	}
	v.x = Math.round(v.x*10*n)/(10*n);
	v.y = Math.round(v.y*10*n)/(10*n);
	v.z = Math.round(v.z*10*n)/(10*n);
};

vxl.vec3.normalize = function(v,n){
	var le = vxl.vec3.length(v);
	
	if (le ==0) throw('ERROR: normalizing a vector by a zero norm');
	
	if (n == undefined){
	   v.x = v.x / le;
	   v.y = v.y / le;
	   v.z = v.z / le;
	}
	else{
	    n.x = v.x / le;
	    n.y = v.y / le;
	    n.z = v.z / le;
	}
};

vxl.vec3.set = function(a,b){
	if (a instanceof Array) {
		b.x = a[0];
		b.y = a[1];
		b.z = a[2];
    }
	else if (a instanceof vxlVector3){
		b['x'] = a['x'];
		b['y'] = a['y'];
		b['z'] = a['z'];
	}
	else {
		b.x = 0; b.y =0; b.z =0;
	}
};

function vxlVector3(x,y,z){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	if (x != null) {this.x = x;}
	if (y != null) {this.y = y;}
	if (z != null) {this.z = z;}
};

vxlVector3.prototype.toString = function(p,n){
	
	var v = this;
	var name = 'vector ';
	
	if (isNaN(v.x) || isNaN(v.y) || isNaN(v.z)){
		return 'vector ' +n+' does not have numeric values';
	}
	
	if (n != null){
		name = n;
	}
	
	if (p == null){
		return name +': (' + v.x +','+v.y+','+v.z+')';
	}
	else if (p>0){
		return name+':(' + v.x.toFixed(p) +','+v.y.toFixed(p)+','+v.z.toFixed(p)+')';
	}
	
};

vxl.vec3.create = function(v){
    if (v != undefined){
	   return new vxlVector3(v[0], v[1], v[2]);
	}
	else {
	   return new vxlVector3();
	}	
};


function vxlVector4(x,y,z,h){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.h = 1;
	if (x != null) {this.x = x;}
	if (y != null) {this.y = y;}
	if (z != null) {this.z = z;}
	if (h != null) {this.h = h;}
};

vxlVector4.prototype.toString = function(p,n){
	
	var v = this;
	var name = 'vector ';
	
	if (isNaN(v.x) || isNaN(v.y) || isNaN(v.z)){
		return 'vector ' +n+' does not have numeric values';
	}
	
	if (n != null){
		name = n;
	}
	
	if (p == null){
		return name +': (' + v.x +','+v.y+','+v.z+','+v.h+')';
	}
	else if (p>0){
		return name+':(' + v.x.toFixed(p) +','+v.y.toFixed(p)+','+v.z.toFixed(p)+','+v.h.toFixed(p)+')';
	}
	
};
/**
 * @class
 * 4-tuple vector operations
 */
vxl.vec4 = {};

vxl.vec4.create = function(v){
	return new vxlVector4(v[0], v[1], v[2], v[3]);	
};


/**
 * @class
 * 4x4 Matrix operations
 */
vxl.mat4 = {};

vxl.mat4.set = function(src, dst){
	if (arguments.length == 2) {
        if ("length" in src && src.length == 16) {
            dst.m11 = src[0];
            dst.m12 = src[1];
            dst.m13 = src[2];
            dst.m14 = src[3];

            dst.m21 = src[4];
            dst.m22 = src[5];
            dst.m23 = src[6];
            dst.m24 = src[7];

            dst.m31 = src[8];
            dst.m32 = src[9];
            dst.m33 = src[10];
            dst.m34 = src[11];

            dst.m41 = src[12];
            dst.m42 = src[13];
            dst.m43 = src[14];
            dst.m44 = src[15];
            return;
        }
        else if (src instanceof vxlMatrix4x4) {
        
            dst.m11 = src.m11;
            dst.m12 = src.m12;
            dst.m13 = src.m13;
            dst.m14 = src.m14;

            dst.m21 = src.m21;
            dst.m22 = src.m22;
            dst.m23 = src.m23;
            dst.m24 = src.m24;

            dst.m31 = src.m31;
            dst.m32 = src.m32;
            dst.m33 = src.m33;
            dst.m34 = src.m34;

            dst.m41 = src.m41;
            dst.m42 = src.m42;
            dst.m43 = src.m43;
            dst.m44 = src.m44;
            return;
        }
    }
};

vxl.mat4.identity = function (m){
	m.m11 = 1;
    m.m12 = 0;
    m.m13 = 0;
    m.m14 = 0;
    
    m.m21 = 0;
    m.m22 = 1;
    m.m23 = 0;
    m.m24 = 0;
    
    m.m31 = 0;
    m.m32 = 0;
    m.m33 = 1;
    m.m34 = 0;
    
    m.m41 = 0;
    m.m42 = 0;
    m.m43 = 0;
    m.m44 = 1;
};

vxl.mat4.transpose = function(m){
	var tmp = m.m12;
    m.m12 = m.m21;
    m.m21 = tmp;
    
    tmp = m.m13;
    m.m13 = m.m31;
    m.m31 = tmp;
    
    tmp = m.m14;
    m.m14 = m.m41;
    m.m41 = tmp;
    
    tmp = m.m23;
    m.m23 = m.m32;
    m.m32 = tmp;
    
    tmp = m.m24;
    m.m24 = m.m42;
    m.m42 = tmp;
    
    tmp = m.m34;
    m.m34 = m.m43;
    m.m43 = tmp;
};


vxl.mat4.inverse = function(m,dest){

	  // Calculate the 4x4 determinant
    // If the determinant is zero, 
    // then the inverse matrix is not unique.
    var det = vxl.mat4._determinant4x4(m);

    if (Math.abs(det) < 1e-8){
        return null;
    }
    vxl.mat4._makeAdjoint(m);

    // Scale the adjoint matrix to get the inverse
    m.m11 /= det;
    m.m12 /= det;
    m.m13 /= det;
    m.m14 /= det;
    
    m.m21 /= det;
    m.m22 /= det;
    m.m23 /= det;
    m.m24 /= det;
    
    m.m31 /= det;
    m.m32 /= det;
    m.m33 /= det;
    m.m34 /= det;
    
    m.m41 /= det;
    m.m42 /= det;
    m.m43 /= det;
    m.m44 /= det;
};

vxl.mat4.multVec3 = function (m,vec){
	
	var vv = new vxlVector3();
	var v  = new vxlVector3();
	
	if (vec instanceof Array) {
		v = vxl.vec3.create(vec);
	}
	else if (vec instanceof vxlVector3){
		v = vec;
	}
	else{
		alert('error');
	}
	
	vv.x = m.m11 * v.x + m.m12 * v.y + m.m13 * v.z; 
	vv.y = m.m21 * v.x + m.m22 * v.y + m.m23 * v.z; 
	vv.z = m.m31 * v.x + m.m32 * v.y + m.m33 * v.z;
	
	return vv;
};


vxl.mat4.multVec4 = function(m,vec){
	
	var vv = new vxlVector4();
	var v = new vxlVector4();
	
	if (vec instanceof Array){
		v = vxl.vec4.create(vec);	
	}
	else if (vec instanceof vxlVector4){
		v = vec;
	}
	else{
		alert('error');
	}
	
	
	vv.x = m.m11 * v.x + m.m12 * v.y + m.m13 * v.z + m.m14 * v.h; 
	vv.y = m.m21 * v.x + m.m22 * v.y + m.m23 * v.z + m.m24 * v.h;
	vv.z = m.m31 * v.x + m.m32 * v.y + m.m33 * v.z + m.m34 * v.h;
	vv.h = m.m41 * v.x + m.m42 * v.y + m.m43 * v.z + m.m44 * v.h;

	return vv;
};

vxl.mat4.translate = function(m,v){
	m.m41 = m.m11 * v.x + m.m21 * v.y + m.m31 * v.z + m.m41;
	m.m42 = m.m12 * v.x + m.m22 * v.y + m.m32 * v.z + m.m42;
	m.m43 = m.m13 * v.x + m.m23 * v.y + m.m33 * v.z + m.m43;
	m.m44 = m.m14 * v.x + m.m24 * v.y + m.m34 * v.z + m.m44;
	return m;
    
};

vxl.mat4.scale = function(m,v){

    m.m11 *= v.x;
    m.m12 *= v.x;
    m.m13 *= v.x;
    m.m14 *= v.x;
    m.m21 *= v.y;
    m.m22 *= v.y;
    m.m23 *= v.y;
    m.m24 *= v.y;
    m.m31 *= v.z;
    m.m32 *= v.z;
    m.m33 *= v.z;
    m.m34 *= v.z;
   
};

vxl.mat4.rotate = function(m,angle,v){

    // angles are in degrees. Switch to radians
    angle = angle / 180 * Math.PI;
    
    angle /= 2;
    var sinA = Math.sin(angle);
    var cosA = Math.cos(angle);
    var sinA2 = sinA * sinA;
    
    // normalize
    var length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length == 0) {
        // bad vector, just use something reasonable
        v.x = 0;
        v.y = 0;
        v.z = 1;
    } else if (length != 1) {
        v.x /= length;
        v.y /= length;
        v.z /= length;
    }
    
    var mat = new vxlMatrix4x4();

    // optimize case where axis is along major axis
    if (v.x == 1 && v.y == 0 && v.z == 0) {
        mat.m11 = 1;
        mat.m12 = 0;
        mat.m13 = 0;
        mat.m21 = 0;
        mat.m22 = 1 - 2 * sinA2;
        mat.m23 = 2 * sinA * cosA;
        mat.m31 = 0;
        mat.m32 = -2 * sinA * cosA;
        mat.m33 = 1 - 2 * sinA2;
        mat.m14 = mat.m24 = mat.m34 = 0;
        mat.m41 = mat.m42 = mat.m43 = 0;
        mat.m44 = 1;
    } else if (v.x == 0 && v.y == 1 && v.z == 0) {
        mat.m11 = 1 - 2 * sinA2;
        mat.m12 = 0;
        mat.m13 = -2 * sinA * cosA;
        mat.m21 = 0;
        mat.m22 = 1;
        mat.m23 = 0;
        mat.m31 = 2 * sinA * cosA;
        mat.m32 = 0;
        mat.m33 = 1 - 2 * sinA2;
        mat.m14 = mat.m24 = mat.m34 = 0;
        mat.m41 = mat.m42 = mat.m43 = 0;
        mat.m44 = 1;
    } else if (v.x == 0 && v.y == 0 && v.z == 1) {
        mat.m11 = 1 - 2 * sinA2;
        mat.m12 = 2 * sinA * cosA;
        mat.m13 = 0;
        mat.m21 = -2 * sinA * cosA;
        mat.m22 = 1 - 2 * sinA2;
        mat.m23 = 0;
        mat.m31 = 0;
        mat.m32 = 0;
        mat.m33 = 1;
        mat.m14 = mat.m24 = mat.m34 = 0;
        mat.m41 = mat.m42 = mat.m43 = 0;
        mat.m44 = 1;
    } else {
        var x2 = v.x*v.x;
        var y2 = v.y*v.y;
        var z2 = v.z*v.z;
    
        mat.m11 = 1 - 2 * (y2 + z2) * sinA2;
        mat.m12 = 2 * (v.x * v.y * sinA2 + v.z * sinA * cosA);
        mat.m13 = 2 * (v.x * v.z * sinA2 - v.y * sinA * cosA);
        mat.m21 = 2 * (v.y * v.x * sinA2 - v.z * sinA * cosA);
        mat.m22 = 1 - 2 * (z2 + x2) * sinA2;
        mat.m23 = 2 * (v.y * v.z * sinA2 + v.x * sinA * cosA);
        mat.m31 = 2 * (v.z * v.x * sinA2 + v.y * sinA * cosA);
        mat.m32 = 2 * (v.z * v.y * sinA2 - v.x * sinA * cosA);
        mat.m33 = 1 - 2 * (x2 + y2) * sinA2;
        mat.m14 = mat.m24 = mat.m34 = 0;
        mat.m41 = mat.m42 = mat.m43 = 0;
        mat.m44 = 1;
    }
	vxl.mat4.multRight(m,mat);
};


vxl.mat4.rotateX = function(mat, angle, dest) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        
        // Cache the matrix values (makes for huge speed increases!)
        var a10 = mat.m21, a11 = mat.m22, a12 = mat.m23, a13 = mat.m24;
        var a20 = mat.m31, a21 = mat.m32, a22 = mat.m33, a23 = mat.m34;

        if(!dest) { 
                dest = mat;
        } else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
                dest.m11 = mat.m11;
                dest.m12 = mat.m12;
                dest.m13 = mat.m13;
                dest.m14 = mat.m14;
                
                dest.m41 = mat.m41;
                dest.m42 = mat.m42;
                dest.m43 = mat.m43;
                dest.m44 = mat.m44;
        }
        
        // Perform axis-specific matrix multiplication
        dest.m21 = a10*c + a20*s;
        dest.m22 = a11*c + a21*s;
        dest.m23 = a12*c + a22*s;
        dest.m24 = a13*c + a23*s;
        
        dest.m31 = a10*-s + a20*c;
        dest.m32 = a11*-s + a21*c;
        dest.m33 = a12*-s + a22*c;
        dest.m34 = a13*-s + a23*c;
        return dest;
};

vxl.mat4.rotateY = function(mat, angle, dest) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = mat.m11, a01 = mat.m12, a02 = mat.m13, a03 = mat.m14;
        var a20 = mat.m31, a21 = mat.m32, a22 = mat.m33, a23 = mat.m34;
        
        if(!dest) { 
                dest = mat;
        } 
        else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
                dest.m21 = mat.m21;
                dest.m22 = mat.m22;
                dest.m23 = mat.m23;
                dest.m24 = mat.m24;
                
                dest.m41 = mat.m41;
                dest.m42 = mat.m42;
                dest.m43 = mat.m43;
                dest.m44 = mat.m44;
        }
        
        // Perform axis-specific matrix multiplication
        dest.m11 = a00*c + a20*-s;
        dest.m12 = a01*c + a21*-s;
        dest.m13 = a02*c + a22*-s;
        dest.m14 = a03*c + a23*-s;
        
        dest.m31 = a00*s + a20*c;
        dest.m32 = a01*s + a21*c;
        dest.m33 = a02*s + a22*c;
        dest.m34 = a03*s + a23*c;
        return dest;
};


vxl.mat4.multRight = function(m,mat){
    var m11 = (m.m11 * mat.m11 + m.m12 * mat.m21
               + m.m13 * mat.m31 + m.m14 * mat.m41);
    var m12 = (m.m11 * mat.m12 + m.m12 * mat.m22
               + m.m13 * mat.m32 + m.m14 * mat.m42);
    var m13 = (m.m11 * mat.m13 + m.m12 * mat.m23
               + m.m13 * mat.m33 + m.m14 * mat.m43);
    var m14 = (m.m11 * mat.m14 + m.m12 * mat.m24
               + m.m13 * mat.m34 + m.m14 * mat.m44);

    var m21 = (m.m21 * mat.m11 + m.m22 * mat.m21
               + m.m23 * mat.m31 + m.m24 * mat.m41);
    var m22 = (m.m21 * mat.m12 + m.m22 * mat.m22
               + m.m23 * mat.m32 + m.m24 * mat.m42);
    var m23 = (m.m21 * mat.m13 + m.m22 * mat.m23
               + m.m23 * mat.m33 + m.m24 * mat.m43);
    var m24 = (m.m21 * mat.m14 + m.m22 * mat.m24
               + m.m23 * mat.m34 + m.m24 * mat.m44);

    var m31 = (m.m31 * mat.m11 + m.m32 * mat.m21
               + m.m33 * mat.m31 + m.m34 * mat.m41);
    var m32 = (m.m31 * mat.m12 + m.m32 * mat.m22
               + m.m33 * mat.m32 + m.m34 * mat.m42);
    var m33 = (m.m31 * mat.m13 + m.m32 * mat.m23
               + m.m33 * mat.m33 + m.m34 * mat.m43);
    var m34 = (m.m31 * mat.m14 + m.m32 * mat.m24
               + m.m33 * mat.m34 + m.m34 * mat.m44);

    var m41 = (m.m41 * mat.m11 + m.m42 * mat.m21
               + m.m43 * mat.m31 + m.m44 * mat.m41);
    var m42 = (m.m41 * mat.m12 + m.m42 * mat.m22
               + m.m43 * mat.m32 + m.m44 * mat.m42);
    var m43 = (m.m41 * mat.m13 + m.m42 * mat.m23
               + m.m43 * mat.m33 + m.m44 * mat.m43);
    var m44 = (m.m41 * mat.m14 + m.m42 * mat.m24
               + m.m43 * mat.m34 + m.m44 * mat.m44);
    
    m.m11 = m11;
    m.m12 = m12;
    m.m13 = m13;
    m.m14 = m14;
    
    m.m21 = m21;
    m.m22 = m22;
    m.m23 = m23;
    m.m24 = m24;
    
    m.m31 = m31;
    m.m32 = m32;
    m.m33 = m33;
    m.m34 = m34;
    
    m.m41 = m41;
    m.m42 = m42;
    m.m43 = m43;
    m.m44 = m44;
};

vxl.mat4.multLeft = function(m,mat){
    var m11 = (mat.m11 * m.m11 + mat.m12 * m.m21
               + mat.m13 * m.m31 + mat.m14 * m.m41);
    var m12 = (mat.m11 * m.m12 + mat.m12 * m.m22
               + mat.m13 * m.m32 + mat.m14 * m.m42);
    var m13 = (mat.m11 * m.m13 + mat.m12 * m.m23
               + mat.m13 * m.m33 + mat.m14 * m.m43);
    var m14 = (mat.m11 * m.m14 + mat.m12 * m.m24
               + mat.m13 * m.m34 + mat.m14 * m.m44);

    var m21 = (mat.m21 * m.m11 + mat.m22 * m.m21
               + mat.m23 * m.m31 + mat.m24 * m.m41);
    var m22 = (mat.m21 * m.m12 + mat.m22 * m.m22
               + mat.m23 * m.m32 + mat.m24 * m.m42);
    var m23 = (mat.m21 * m.m13 + mat.m22 * m.m23
               + mat.m23 * m.m33 + mat.m24 * m.m43);
    var m24 = (mat.m21 * m.m14 + mat.m22 * m.m24
               + mat.m23 * m.m34 + mat.m24 * m.m44);

    var m31 = (mat.m31 * m.m11 + mat.m32 * m.m21
               + mat.m33 * m.m31 + mat.m34 * m.m41);
    var m32 = (mat.m31 * m.m12 + mat.m32 * m.m22
               + mat.m33 * m.m32 + mat.m34 * m.m42);
    var m33 = (mat.m31 * m.m13 + mat.m32 * m.m23
               + mat.m33 * m.m33 + mat.m34 * m.m43);
    var m34 = (mat.m31 * m.m14 + mat.m32 * m.m24
               + mat.m33 * m.m34 + mat.m34 * m.m44);

    var m41 = (mat.m41 * m.m11 + mat.m42 * m.m21
               + mat.m43 * m.m31 + mat.m44 * m.m41);
    var m42 = (mat.m41 * m.m12 + mat.m42 * m.m22
               + mat.m43 * m.m32 + mat.m44 * m.m42);
    var m43 = (mat.m41 * m.m13 + mat.m42 * m.m23
               + mat.m43 * m.m33 + mat.m44 * m.m43);
    var m44 = (mat.m41 * m.m14 + mat.m42 * m.m24
               + mat.m43 * m.m34 + mat.m44 * m.m44);
    
    m.m11 = m11;
    m.m12 = m12;
    m.m13 = m13;
    m.m14 = m14;

    m.m21 = m21;
    m.m22 = m22;
    m.m23 = m23;
    m.m24 = m24;

    m.m31 = m31;
    m.m32 = m32;
    m.m33 = m33;
    m.m34 = m34;

    m.m41 = m41;
    m.m42 = m42;
    m.m43 = m43;
    m.m44 = m44;
};

vxl.mat4.ortho = function(m,left, right, bottom, top, near, far){
    var tx = (left + right) / (left - right);
    var ty = (top + bottom) / (top - bottom);
    var tz = (far + near) / (far - near);
    
    var matrix = new vxlMatrix4x4();
    matrix.m11 = 2 / (left - right);
    matrix.m12 = 0;
    matrix.m13 = 0;
    matrix.m14 = 0;
    matrix.m21 = 0;
    matrix.m22 = 2 / (top - bottom);
    matrix.m23 = 0;
    matrix.m24 = 0;
    matrix.m31 = 0;
    matrix.m32 = 0;
    matrix.m33 = -2 / (far - near);
    matrix.m34 = 0;
    matrix.m41 = tx;
    matrix.m42 = ty;
    matrix.m43 = tz;
    matrix.m44 = 1;
    
    vxl.mat4.multRight(m,matrix);
};

vxl.mat4.frustum = function(m,left, right, bottom, top, near, far){
    var matrix = new vxlMatrix4x4();
    var A = (right + left) / (right - left);
    var B = (top + bottom) / (top - bottom);
    var C = -(far + near) / (far - near);
    var D = -(2 * far * near) / (far - near);
    
    matrix.m11 = (2 * near) / (right - left);
    matrix.m12 = 0;
    matrix.m13 = 0;
    matrix.m14 = 0;
    
    matrix.m21 = 0;
    matrix.m22 = 2 * near / (top - bottom);
    matrix.m23 = 0;
    matrix.m24 = 0;
    
    matrix.m31 = A;
    matrix.m32 = B;
    matrix.m33 = C;
    matrix.m34 = -1;
    
    matrix.m41 = 0;
    matrix.m42 = 0;
    matrix.m43 = D;
    matrix.m44 = 0;
    
    vxl.mat4.multRight(m,matrix);
};

vxl.mat4.perspective = function(m,fovy, aspect, zNear, zFar){
    var top = Math.tan(fovy * Math.PI / 360) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    vxl.mat4.frustum(m,left, right, bottom, top, zNear, zFar);
};

vxl.mat4.lookat = function(m,eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz){
    var matrix = new vxlMatrix4x4();
    
    // Make rotation matrix

    // Z vector
    var zx = eyex - centerx;
    var zy = eyey - centery;
    var zz = eyez - centerz;
    var mag = Math.sqrt(zx * zx + zy * zy + zz * zz);
    if (mag) {
        zx /= mag;
        zy /= mag;
        zz /= mag;
    }

    // Y vector
    var yx = upx;
    var yy = upy;
    var yz = upz;

    // X vector = Y cross Z
    xx =  yy * zz - yz * zy;
    xy = -yx * zz + yz * zx;
    xz =  yx * zy - yy * zx;

    // Recompute Y = Z cross X
    yx = zy * xz - zz * xy;
    yy = -zx * xz + zz * xx;
    yx = zx * xy - zy * xx;

    // cross product gives area of parallelogram, which is < 1.0 for
    // non-perpendicular unit-length vectors; so normalize x, y here

    mag = Math.sqrt(xx * xx + xy * xy + xz * xz);
    if (mag) {
        xx /= mag;
        xy /= mag;
        xz /= mag;
    }

    mag = Math.sqrt(yx * yx + yy * yy + yz * yz);
    if (mag) {
        yx /= mag;
        yy /= mag;
        yz /= mag;
    }

    matrix.m11 = xx;
    matrix.m12 = xy;
    matrix.m13 = xz;
    matrix.m14 = 0;
    
    matrix.m21 = yx;
    matrix.m22 = yy;
    matrix.m23 = yz;
    matrix.m24 = 0;
    
    matrix.m31 = zx;
    matrix.m32 = zy;
    matrix.m33 = zz;
    matrix.m34 = 0;
    
    matrix.m41 = 0;
    matrix.m42 = 0;
    matrix.m43 = 0;
    matrix.m44 = 1;
    matrix.translate(-eyex, -eyey, -eyez);
    
    vxl.mat4.multRight(m,matrix);
};


vxl.mat4._determinant2x2 = function(a, b, c, d){
    return a * d - b * c;
};

vxl.mat4._determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3){
    return a1 * vxl.mat4._determinant2x2(b2, b3, c2, c3)
         - b1 * vxl.mat4._determinant2x2(a2, a3, c2, c3)
         + c1 * vxl.mat4._determinant2x2(a2, a3, b2, b3);
};

vxl.mat4._determinant4x4 = function(m){
    var a1 = m.m11;
    var b1 = m.m12; 
    var c1 = m.m13;
    var d1 = m.m14;

    var a2 = m.m21;
    var b2 = m.m22; 
    var c2 = m.m23;
    var d2 = m.m24;

    var a3 = m.m31;
    var b3 = m.m32; 
    var c3 = m.m33;
    var d3 = m.m34;

    var a4 = m.m41;
    var b4 = m.m42; 
    var c4 = m.m43;
    var d4 = m.m44;

    return a1 * vxl.mat4._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
         - b1 * vxl.mat4._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
         + c1 * vxl.mat4._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
         - d1 * vxl.mat4._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
};

vxl.mat4._makeAdjoint = function(m){
    var a1 = m.m11;
    var b1 = m.m12; 
    var c1 = m.m13;
    var d1 = m.m14;

    var a2 = m.m21;
    var b2 = m.m22; 
    var c2 = m.m23;
    var d2 = m.m24;

    var a3 = m.m31;
    var b3 = m.m32; 
    var c3 = m.m33;
    var d3 = m.m34;

    var a4 = m.m41;
    var b4 = m.m42; 
    var c4 = m.m43;
    var d4 = m.m44;

    // Row column labeling reversed since we transpose rows & columns
    m.m11  =   vxl.mat4._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
    m.m21  = - vxl.mat4._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
    m.m31  =   vxl.mat4._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
    m.m41  = - vxl.mat4._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
        
    m.m12  = - vxl.mat4._determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
    m.m22  =   vxl.mat4._determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
    m.m32  = - vxl.mat4._determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
    m.m42  =   vxl.mat4._determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);
        
    m.m13  =   vxl.mat4._determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
    m.m23  = - vxl.mat4._determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
    m.m33  =   vxl.mat4._determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
    m.m43  = - vxl.mat4._determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);
        
    m.m14  = - vxl.mat4._determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
    m.m24  =   vxl.mat4._determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
    m.m34  = - vxl.mat4._determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
    m.m44  =   vxl.mat4._determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
};

vxlMatrix4x4 = function(m){
   
   this.m11 = 0;
   this.m12 = 0;
   this.m13 = 0;
   this.m14 = 0;
   
   this.m21 = 0;
   this.m22 = 0;
   this.m23 = 0;
   this.m24 = 0;
   
   this.m31 = 0;
   this.m32 = 0;
   this.m33 = 0;
   this.m34 = 0;
   
   this.m41 = 0;
   this.m42 = 0;
   this.m43 = 0;
   this.m44 = 0;
   
   if (arguments.length == 1 && m instanceof vxlMatrix){
		vxl.mat4.set(m, this);
   }
};

vxlMatrix4x4.prototype.getAsArray = function(){
    return [
        this.m11, this.m12, this.m13, this.m14, 
        this.m21, this.m22, this.m23, this.m24, 
        this.m31, this.m32, this.m33, this.m34, 
        this.m41, this.m42, this.m43, this.m44
    ];
};

vxlMatrix4x4.prototype.getAsFloat32Array = function(){
    return new Float32Array(this.getAsArray());
};

vxlMatrix4x4.prototype.toString = function(){
    var m = this;
	return 'Matrix\n'+m.m11.toFixed(2)+' '+m.m12.toFixed(2)+' '+m.m13.toFixed(2)+' '+m.m14.toFixed(2)+'\n'+
    ''+m.m21.toFixed(2)+' '+m.m22.toFixed(2)+' '+m.m23.toFixed(2)+' '+m.m24.toFixed(2)+'\n'+
    ''+m.m31.toFixed(2)+' '+m.m32.toFixed(2)+' '+m.m33.toFixed(2)+' '+m.m34.toFixed(2)+'\n'+
    ''+m.m41.toFixed(2)+' '+m.m42.toFixed(2)+' '+m.m43.toFixed(2)+' '+m.m44.toFixed(2)+'\n';
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

	this.c = camera;
	this.position = new vxlVector3(0, 0, 1);
	this.focalPoint = new vxlVector3(0, 0, 0);
	
    this.up = new vxlVector3(0, 1, 0);
	this.right = new vxlVector3(1, 0, 0);
    
	this.distance = 0;
	this.azimuth = 0;
	this.elevation = 0;
    
	this.xTr = 0;
	this.yTr = 0;
};

/**
 * Resets current camera to the standard location an orientation. This is,
 * the camera is looking at the center of the scene, located at [0,0,1] along the z axis and
 * aligned with the y axis.
 * 
 */
vxlCameraState.prototype.reset = function() {
	var c = this.c;
	c.focalPoint = new vxlVector3(0, 0, 0);
	c.up = new vxlVector3(0, 1, 0);
	c.right = new vxlVector3(1, 0, 0);
	c.distance = 0;
	c.elevation = 0;
	c.azimuth = 0;
	c.xTr = 0;
	c.yTr = 0;
	c.setPosition(0, 0, 1);
	c.setOptimalDistance();
};

/**
 * Saves the current state of the camera that this vxlCameraState object is associated with.
 */

vxlCameraState.prototype.save = function() {
	var c = this.c;
	this.distance = c.distance;
	this.azimuth = c.azimuth;
	this.elevation = c.elevation;
	this.xTr = c.xTr;
	this.yTr = c.yTr;
	vxl.vec3.set(c.position, this.position);
	vxl.vec3.set(c.focalPoint, this.focalPoint);
	vxl.vec3.set(c.up, this.up);
	vxl.vec3.set(c.right, this.right);
};

/**
 * Updates the camera with the state stored in vxlCameraState.
 */
vxlCameraState.prototype.retrieve = function() {
	var c = this.c;
	c.azimuth = this.azimuth;
	c.elevation = this.elevation;
	c.xTr = this.xTr;
	c.yTr = this.yTr;

	vxl.vec3.set(this.focalPoint, c.focalPoint);
	vxl.vec3.set(this.up, c.up);
	vxl.vec3.set(this.right, c.right);

	c.setPosition(this.position.x, this.position.y, this.position.z);
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
	camera.init();
	
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
	//Only for debug purposes
	/*var task = this.task;
	var c = this.camera;
	if (task == vxl.def.camera.task.PAN){
			vxl.go.console('Trackball Camera INteractor: New Focal Point : ' + c.focalPoint.toString(1,'focalPoint'));
	}*/
	
	task = vxl.def.camera.task.NONE;
	
	this.dragging = false;
};

vxlTrackerInteractor.prototype.onMouseDown = function(ev){
	this.x = ev.clientX;
	this.y = ev.clientY;
	this.dragging = true;
	this.button = ev.button;
	this.dstep = Math.max(this.camera.position.x,this.camera.position.y,this.camera.position.z)/100;
};

vxlTrackerInteractor.prototype.onMouseMove = function(ev){

	this.lastX = this.x;
	this.lastY = this.y;
	
	this.x = ev.clientX;
    this.y = ev.clientY;
	

	if (!this.dragging) return;
	
	
	this.ctrlPressed = ev.ctrlKey;
	this.altPressed = ev.altKey;
	
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	
	if (this.button == 0) { 
		if(this.altPressed){
			this.dolly(dy);
		}
		else{ 
			this.rotate(dx,dy);
		}
	}

	this.lastX = this.x;
    this.lastY = this.y; 

};

vxlTrackerInteractor.prototype.onKeyDown = function(ev){
	var camera = this.camera;
	
	this.keyPressed = ev.keyCode;
	this.altPressed = ev.altKey;
	
	if (!this.altPressed){
		if (this.keyPressed == 38){
			camera.changeElevation(10);
			camera.status('elevation up');
		}
		else if (this.keyPressed == 40){
			camera.changeElevation(-10);
			camera.status('elevation down');
		}
		else if (this.keyPressed == 37){
			camera.changeAzimuth(-10);
			camera.status('azimuth left');
		}
		else if (this.keyPressed == 39){
			camera.changeAzimuth(10);
			camera.status('azimuth right');
		}
		//just to try picking. later on do it better
		//else if (this.keyPressed = 80) {
			//this.picking =!camera.view.actorManager.picking;
			//camera.view.actorManager.setPicking(this.picking);
			
		//}
	}
	else if(this.altPressed && this.keyPressed !=17) {
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
};

vxlTrackerInteractor.prototype.onKeyUp = function(ev){
	if (ev.keyCode == 17){
		this.ctrlPressed = false;
	}
};

vxlTrackerInteractor.prototype.dolly = function(value){
	this.task = vxl.def.camera.task.DOLLY;
if (value>0){
        this.dloc += this.dstep;
    }
    else{
        this.dloc -= this.dstep;
    }
    this.camera.dolly(this.dloc);
	this.camera.refresh();

};

vxlTrackerInteractor.prototype.rotate = function(dx, dy){
	this.task = vxl.def.camera.task.ROTATE;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.changeAzimuth(nAzimuth);
	camera.changeElevation(nElevation);
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
	this.mvMatrix    = new vxlMatrix4x4();    // The Model-View matrix
	this.pMatrix     = new vxlMatrix4x4();    // The projection matrix
	this.nMatrix     = new vxlMatrix4x4();    // The normal matrix
	this.cMatrix     = new vxlMatrix4x4();    // The camera matrix	
};

/**
 * Calculates the Model-View matrix for the current camera.
 */
vxlTransforms.prototype.calculateModelView = function(){
	vxl.mat4.set(this.view.cameraman.active.getViewTransform(), this.mvMatrix);
    
};

/**
 * Calculates the normal matrix corresponding to the current Model-View matrix
 */
vxlTransforms.prototype.calculateNormal = function(){
	vxl.mat4.identity(this.nMatrix);
    vxl.mat4.set(this.mvMatrix, this.nMatrix);
    vxl.mat4.inverse(this.nMatrix);
    vxl.mat4.transpose(this.nMatrix);
};

/**
 * Calculates the perspective matrix given the current camera
 */
vxlTransforms.prototype.calculatePerspective = function(){
    var c = this.view.cameraman.active;
    var vw = this.view;
	vxl.mat4.identity(this.pMatrix);
	vxl.mat4.perspective(this.pMatrix, c.FOV, vw.width/vw.height, c.Z_NEAR, c.Z_FAR);
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
	var memento =  new vxlMatrix4x4();
	vxl.mat4.set(this.mvMatrix, memento);
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
vxl.def.glsl.diffusive = {
	
	ID : 'diffusive',

	ATTRIBUTES : [
	"aVertexPosition", 
	"aVertexColor", 
	"aVertexNormal"],
	
	UNIFORMS : [
	"uMVMatrix",
	"uNMatrix",
	"uPMatrix",
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
	"uniform mat4 uMVMatrix;",
	"uniform mat4 uPMatrix;",
	"uniform mat4 uNMatrix;",
	"uniform vec3 uLightDirection;",
	"uniform vec4 uLightAmbient;",  
	"uniform vec4 uLightDiffuse;",
	"uniform vec4 uMaterialDiffuse;",
	"uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform bool uUseLightTranslation;",
	"varying vec4 vFinalColor;",
    
    "void main(void) {",
    "	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
    "	gl_PointSize = uPointSize;",
    "	if (uUseVertexColors) {",
    "		vFinalColor = vec4(aVertexColor,1.0);",
    "	}",
    "   else {",
    "       vFinalColor = uMaterialDiffuse;",
    "   }",
    "	if (uUseShading){",
    "		vec3 N = vec3(uNMatrix * vec4(aVertexNormal, 1.0));",
	"		vec3 L = normalize(uLightDirection);",
	"		if (uUseLightTranslation){ L = vec3(uNMatrix * vec4(L,1.0));}",
	"		float lambertTerm = max(dot(N,-L),0.4);",
	"		vec4 Ia = uLightAmbient;",
	"		vec4 Id = vFinalColor * uLightDiffuse * lambertTerm;",
    "		vFinalColor = Ia + Id;",
	"		vFinalColor.a = uMaterialDiffuse.a;",
	"	}", 
	"	else {",
	"		vFinalColor = uMaterialDiffuse;",
	"	}",
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
 * @param {Object} the program to register
 */
vxlProgram.prototype.register = function(glslObject){
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
 * This method is private.
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
 */
vxlProgram.prototype._parseUniforms = function(id){
    
    vs = this._codebase[this._currentProgramID].VERTEX_SHADER;
    fs = this._codebase[this._currentProgramID].FRAGMENT_SHADER;
    uNames = this._codebase[this._currentProgramID].UNIFORMS;
    
    uTypes = {};
    
    
    for (var i=0;i< uNames.length; i++){
        var uniformID = uNames[i];
        var rex = new RegExp('uniform.*'+uniformID,'g');
        
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
    	if (!(value instanceof vxlMatrix4x4)){
    		vxl.go.console('Program: the uniform '+uniformID+' is defined as mat4 in GLSL. However the JS variable is not.');
    	}
        gl.uniformMatrix4fv(locationID,false,value.getAsFloat32Array());
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
    
	this.renderRate = vxl.def.renderer.rate.NORMAL;
	this.mode       = vxl.def.renderer.mode.TIMER;
    this.timerID    = 0;
    
    this.view       = vw;
    
    this.gl         = this.getWebGLContext();
    this.prg        =   new vxlProgram(this.gl);

      
    this.transforms = new vxlTransforms(vw);
    
    this.currentProgram      = undefined;
    this.defaultProgram      = undefined;
    this.setDefaultProgram(vxl.def.glsl.diffusive);
   
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
 * Sets the program 'diffusive' as the program by default to be used by this renderer
 * @param {vxl.def.glsl.program} program to make default
 */
vxlRenderer.prototype.setDefaultProgram = function(program){
    this.setProgram(program);
    this.defaultProgram = program;
};




/**
 * Tries to add a new program definition to this renderer
 * @param {Object} program definition. See the diffuse and phong examples below.
 * @see {vxl.def.glsl.phong}
 * @see {vxl.def.glsl.diffuse}
 */
vxlRenderer.prototype.setProgram = function(program){
    
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
};




/**
 * Clears the rendering context
 */
vxlRenderer.prototype.clear = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height);
	this.transforms.calculatePerspective();
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
	this.gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
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
	this.view.resize();
    this.view.scene.render();
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
	this.outline 	= null;
	//texture
    
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
	//copy by reference (no slicing) as models are loaded once
	this.vertices 	= JSON_OBJECT.vertices;
	this.indices 	= JSON_OBJECT.indices;
	this.diffuse 	= JSON_OBJECT.diffuse;
	this.scalars 	= JSON_OBJECT.scalars;
	this.wireframe  = JSON_OBJECT.wireframe;
	this.colors     = JSON_OBJECT.colors;	

	if(this.normals == undefined && this.indices != undefined){
		this.getNormals();
	}
	
	if(this.diffuse == undefined){
		//We copy the default by value so posterior modifications of the default do not affect this model
		this.diffuse = vxl.def.model.diffuse.slice(0); 
	}
	
	if (this.wireframe == undefined){
		this.getWireframeIndices();
	}
	
	this.getOutline();
	this.getCentre();
};


/**
 * Calculates the normals for this model in case that the JSON object does not include them
 * 
 * @param {bool} reverse if true will calculate the reversed normals
 * 
 */
vxlModel.prototype.getNormals = function(reverse){
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
vxlModel.prototype.getWireframeIndices = function(){
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
 * Calculate the centre of this model
 */  
vxlModel.prototype.getCentre = function(){
	  var bb = this.outline;
      var c = [0, 0, 0];
	  
  	  c[0] = (bb[3] + bb[0]) /2;
	  c[1] = (bb[4] + bb[1]) /2;
	  c[2] = (bb[5] + bb[2]) /2;
	  
	  this.centre = c;
};

/**
 * Calculate the outline of this model (bounding box)
 */
vxlModel.prototype.getOutline = function(){	
	var vs = this.vertices;
	var bb  = [vs[0],vs[1],vs[2],vs[0],vs[1],vs[2]];
	  
	for(var i=0;i<vs.length;i=i+3){
		bb[0] = Math.min(bb[0],vs[i]);
		bb[1] = Math.min(bb[1],vs[i+1]);
		bb[2] = Math.min(bb[2],vs[i+2]);
		bb[3] = Math.max(bb[3],vs[i]);
		bb[4] = Math.max(bb[4],vs[i+1]);
		bb[5] = Math.max(bb[5],vs[i+2]);
	}
	this.outline = bb;
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
 * @class
 * @constructor
 */
function vxlActor(model){
  
  if (model){
  	this.model 	 = model;
  	this.name 	 = model.name;
  	this.diffuse = model.diffuse;
  }
  
  this.allocated = false;
  this.visible   = true;
  this.mode = vxl.def.actor.mode.SOLID;
  this.opacity = 1.0;
  this.colors = model?(model.colors!=null?model.colors:null):null;	//it will create colors for this actor once a lookup table had been set up
  
  this.position 	= vxl.vec3.create([0, 0, 0]);
  this.scale 		= vxl.vec3.create([1, 1, 1]);
  this.rotation 	= vxl.vec3.create([0, 0, 0]);
  
  this.program       = undefined;
  this.picking_color = undefined;
  
  this.renderers = [];
  this.buffers = [];
  this.clones  = 0;
};


/**
 * If the property exists, then it updates it
 * @param {String} property 
 * @param {Object} value 
 * @TODO: if the property is position or scale then call the respective methods from here
 */
vxlActor.prototype.setProperty = function(property, value){
    if (property == 'position') throw 'Actor.setProperty(position), please use setPosition instead';
    if (property == 'scale')    throw 'Actor.setProperty(scale), please use setScale instead';
    
	if (this.hasOwnProperty(property)){
		this[property] = value;
		vxl.go.console('Actor: The actor '+this.name+' has been updated. ['+property+' = '+value+']');
	}
	else {
		throw ('Actor: the property '+ property+' does not exist');
	}
};

vxlActor.prototype.setPosition = function (position){
    this.position = vxl.vec3.create(position);
    //TODO: Recalculate bounding box
};

vxlActor.prototype.setScale = function(scale){
    this.scale = vxl.vec3.create(scale);
    //TODO: Recalculate bounding box
};

/**
* Creates the internal WebGL buffers that will store geometry, normals, colors, etc for this Actor.
* It uses the renderer passed as a parameter to retrieve the gl context to use.
*/
vxlActor.prototype.allocate = function(renderer){
	
	//if (this.allocated) return; // if we need realocation create method reallocate to force it.
	
	//as we don't expect changes we set the buffers' data here.
   //OTHERWISE it should be done in the draw method as it is done with the axis and the bounding box
   
   if (this.renderers.indexOf(renderer)!=-1){ //if this renderer has been allocated then ignore
   		return;
   }
   
   vxl.go.console('Actor: Allocating actor '+this.name+' for view '+ renderer.view.name);
   	
	var gl = renderer.gl;
	var model = this.model;
    var buffer = {};
	
	buffer.vertex = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	
	if (model.normals){
		buffer.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
	}
	
	if (model.scalars != undefined || model.colors != undefined){
		buffer.color = gl.createBuffer(); //we don't BIND values or use the buffer until the lut is loaded and available
	}
	
	
	
	if (model.wireframe != undefined){
		buffer.wireframe = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
	}
	
	if (model.indices != undefined){
		buffer.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	this.renderers.push(renderer);
	this.buffers.push(buffer);
};

/**
* Deletes the WebGL buffers used for this object. After this the actor will not be rendered until a new allocation takes place
*/
vxlActor.prototype.deallocate = function(){

  throw('exception');
};



/**
 * Passes the matrices to the shading program
 * @param renderer determines the context for the transformations, 
 * different rendereres can have different matrices transformations 
 * we will update each Model-View matrix of each renderer according to
 * the actor position,scale and rotation.
 */
vxlActor.prototype.updateMatrixStack = function(renderer){
    
    var r	= renderer,	trx = r.transforms,	prg = r.prg;
    trx.calculateModelView();
    trx.push();
        vxl.mat4.scale      (trx.mvMatrix, this.scale);
		vxl.mat4.translate	(trx.mvMatrix, this.position);
		//TODO: Implement actor rotations
	     prg.setUniform("uMVMatrix",r.transforms.mvMatrix);
    trx.pop();
    trx.calculateNormal(); 
    prg.setUniform("uPMatrix", r.transforms.pMatrix);
    prg.setUniform("uNMatrix", r.transforms.nMatrix);
    
 };

/**
* Performs the rendering of this actor using the WebGL context provided by the renderer
* This method has the most WebGL code in all Nucleo.
* 
*/
vxlActor.prototype.render = function(renderer){
	
	
	if (!this.visible){ 
		return;
	}

	//if (this.program){
	  //renderer.setProgram(this.program);
	//} 
	//else {
	  //  renderer.setProgram(renderer.defaultProgram);
//	}
	
	
	var idx = this.renderers.indexOf(renderer);

	var model = this.model;
    var buffer = this.buffers[idx]; 
	
    //The actor is a good renderer friend.
	var gl = renderer.gl;
	var prg = renderer.prg;
	var trx = renderer.transforms;
	
	//First thing first. Handle actor transformations here
	this.updateMatrixStack(renderer);
	
	if (this.opacity < 1.0){
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		this.diffuse[3] = this.opacity;
	}
	else {
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		this.diffuse[3] = 1.0;
	}
	
	prg.setUniform("uMaterialDiffuse",this.diffuse);
	prg.setUniform("uUseVertexColors", false);
    
    prg.disableAttribute("aVertexColor");
	prg.disableAttribute("aVertexNormal");
	prg.enableAttribute("aVertexPosition");
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setAttributePointer("aVertexPosition", 3, gl.FLOAT, false, 0, 0);
	}
    catch(err){
        alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
		throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the vertex buffer. Error =' +err.description);
    }
    	
	if (this.colors){	
		try{
			prg.setUniform("uUseVertexColors", true);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute("aVertexColor");
			prg.setAttributePointer("aVertexColor", 4, gl.FLOAT, false, 0, 0);
		}
		catch(err){
        	alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the color buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the color buffer. Error =' +err.description);
   		}
    }
	
    
    if(model.normals){
	    try{
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals.slice(0)), gl.STATIC_DRAW);
			
			prg.enableAttribute("aVertexNormal");
			prg.setAttributePointer("aVertexNormal",3,gl.FLOAT, false, 0,0);
		}
	    catch(err){
	        alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
    
    try{
		if (this.mode == vxl.def.actor.mode.SOLID){
			prg.setUniform("uUseShading",true);
			prg.enableAttribute("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.actor.mode.WIREFRAME){
			prg.setUniform("uUseShading", true);
			if (this.name == 'floor'){
			     prg.disableAttribute("aVertexNormal");
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.actor.mode.POINTS){
			prg.setUniform("uUseShading", true);
			prg.enableAttribute("aVertexNormal");
			gl.drawArrays(gl.POINTS,0, this.model.vertices.length/3);
		}
		else{
            alert('There was a problem while rendering the actor ['+this.name+']. The visualization mode: '+this.mode+' is not valid.');
			throw('There was a problem while rendering the actor ['+this.name+']. The visualization mode: '+this.mode+' is not valid.');
			
		}
		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
	     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	     

    }
	catch(err){
		alert('Error rendering actor ['+this.name+']. Error =' +err.description);
		throw('Error rendering actor ['+this.name+']. Error =' +err.description);
	}
	
};

/**
* Sets the actor color. This color can be different from the original model color
*/
vxlActor.prototype.setColor = function (c){
	this.color = c.slice(0);
	vxl.go.console('Actor '+this.name+': color changed to : (' + this.color[0] +','+ this.color[1] +','+ this.color[2]+')');
};

/**
* Sets the lookup table for this actor
*/
vxlActor.prototype.setLookupTable = function(lutID,min,max){
	if (this.model.scalars){
		var lut = vxl.go.lookupTableManager.get(lutID);
		this.colors  = lut.getColors(this.model.scalars,min,max);
	}
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
	vxl.vec3.set(this.scale,    duplicate.scale);
	vxl.vec3.set(this.position, duplicate.position);
	
	
	//Now to save us some memory, let's SHARE the WebGL buffers that the current actor has already allocated'
	//duplicate.renderers = this.renderers;
	//duplicate.buffers   = this.buffers;
	//duplicate.model 	= this.model;
	duplicate.name     += '-'+this.clones; 
	return duplicate;
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
	this.bb 					= [];
	this.centre 				= [];
	this.frameAnimation			= null;

	if (vxl.c.scene  == null) vxl.c.scene 	= this;
	vxl.go.notifier.addTarget(vxl.events.MODELS_LOADED,this);
	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);
	vxl.go.notifier.addSource(vxl.events.SCENE_UPDATED, this);
};

/**
 * Handles events sent by vxlNotifier
 * @param {String} event This event should be defined in vxl.events
 * @param {Object} the source that sent the event. Useful for callbacks
 */
vxlScene.prototype.handleEvent = function(event,src){
	if(event  == vxl.events.MODELS_LOADED){
		this.updateScalarRange();
		if (this.lutID != null) this.setLookupTable(this.lutID);
	}
	
	if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.lutID = 'default';
		this.setLookupTable(this.lutID);
	}
};



vxlScene.prototype.setLoadingMode = function(mode){
	if (mode == undefined || mode == null || 
		(mode != vxl.def.model.loadingMode.LIVE && 
		 mode != vxl.def.model.loadingMode.LATER &&
		 mode != vxl.def.model.loadingMode.DETACHED)){
		 	throw('the mode '+mode+ 'is not a valid loading mode');
		 }
	this.loadingMode = mode;
};




/**
 * Calculates the global bounding box and the centre for the scene. 
 */
vxlScene.prototype.updateMetrics = function(b){
        vxl.go.console('Scene: updating metrics with ('+ b[0]+','+b[1]+','+b[2]+') - ('+b[3]+','+b[4]+','+b[5]+')');
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
 */
vxlScene.prototype.computeMetrics = function() {
	this.bb = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	this.centre = [0.0, 0.0, 0.0];
	for(var i=0; i<this.actors.length; i++){
		this.updateMetrics(this.actors[i].model.outline);
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
    this.updateMetrics(actor.model.outline); //TODO: What if the actor moves? use actor bounding box instead
    
    vxl.go.console('Scene: Actor for model '+actor.model.name+' added');
    vxl.c.actor = actor;
    vxl.go.notifier.fire(vxl.events.SCENE_UPDATED);
};

/**
 * Removes one actor
 * @param actor the actor to be removed from the scene
 */
vxlScene.prototype.removeActor = function(actor){
	var idx = this.actors.indexOf(actor);
	this.actors.splice(idx,1);
    this.computeMetrics();
};

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
	this.computeMetrics();
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
vxlScene.prototype.render = function(){

	for (var i = 0, viewCount = this.views.length; i < viewCount; i+=1){
		var r = this.views[i].renderer;
		
		r.clear();
		
		this.toys.render(r);
		
		if (this.frameAnimation != undefined){
			this.frameAnimation.render(r);
		}
		else{
			for(var a=0, actorCount = this.actors.length; a < actorCount; a+=1){
				   this.actors[a].allocate(r);
			       this.actors[a].render(r);
			}
	    }
	}
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
        this.list[t].allocate(r);
        this.list[t].render(r);
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
	    var c = [l.map[key][0],l.map[key][1],l.map[key][2],1.0];
		return c;
	}
	else if (key <l.min) { //truncate to min value
			return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2],1.0];
	}
	else if (key>l.max){ //truncate to max value
		return  [l.map[l.max][0],l.map[l.max][1],l.map[l.max][2],1.0];
	}
	else{
		alert('assertion error in getColor routine');
		return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2],1.0];
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
		c.push(cc[3]);
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
	vxl.go.notifier.addSource(vxl.events.DEFAULT_LUT_LOADED,this);
	this.loadAll();
};

/**
 * Load a lookup table file
 * @param {String} name the filename of the lookup table to load
 */
vxlLookupTableManager.prototype.load = function(name){
		var self = this;
		if (this.isLoaded(name)) return;

	    var request = new XMLHttpRequest();
	    request.open("GET", vxl.def.lut.folder+'/'+name+'.lut');
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
		vxl.go.notifier.fire(vxl.events.DEFAULT_LUT_LOADED);
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
}	;

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
                    	"colors": [	1, 1, 0 ,1,	  1, 1, 0 ,1,	0, 1 ,0 ,1,	 0, 1 ,0 ,1,  0, 0, 1 ,1,	 0, 0, 1 ,1	]
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
	this.clearDepth = 10000;
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
	
	//Register events to listen to
	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);
	
	if (vxl.c.view == undefined){
		vxl.c.view = this;
	}
	
	vxl.go.views.push(this);

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
 * Update the width and height of this view with the width and height of the canvas.
 * @TODO: review the JQuery binding that calls this function
 */
vxlView.prototype.resize = function(){
	this.width = this.canvas.width;
	this.height = this.canvas.height;
};


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
 * Sets the background color. Delegated to the renderer
 * @param {Array} v the new color given as an array of three numbers
 * @see vxlRenderer#clearColor
 */
vxlView.prototype.setBackgroundColor = function(v){
	this.backgroundColor = v.slice(0);
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
	this.firstLoadedModel = false; //analyze
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
    request.open("GET", vxl.def.model.folder+'/'+filename);
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
	    if(request.status == 404) {
			throw 'ModelManager.load: '+ filename + ' does not exist';
		 }
		else {
		    
			manager.add(JSON.parse(request.responseText),filename,scene);
		}
	  }
    };
    request.send();
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
	
	
	if (!this.firstLoadedModel){
		scene.bb = model.outline;
		this.firstLoadedModel = true;
	}
		
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
		vxl.go.notifier.fire(vxl.events.MODELS_LOADED);
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
 
 loadLUTS :  function(){
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
  * 
  * @see {vxl#def#asset#loadingMode}
  * @see {vxlAssetManager}
  * @see {vxlScene#setLoadingMode}
  */
 load :  function(arguments,mode,scene){
 	
 	var scene = scene==null?vxl.c.scene:scene;
 	var models = [];
 	if (typeof(arguments) == 'string' || arguments instanceof String){
 		models.push(arguments);
 	}
 	else if (arguments instanceof Array){
 		for(var i=0; i<arguments.length;i++){
			models.push(arguments[i]);
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
 * Sets the background colour of this view.
 * @param color a 4-valued array containing the [r,g,b,a] values to use.
 */ 
 setBackgroundColor :  function(color){
	vxl.c.view.setBackgroundColor(color);
 },



/**
 * If an actor has been selected (If there is an current actor in vxl.c.actor), changes its visualization mode to WIREFRAME. Otherwise,
 * shows all the scene in WIREFRAME mode.
 * 
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
  * If there is an act
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
 
 pointsON :  function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.actor.mode.POINTS);
	}
 },
 
 
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
  * @param {String} the property to change 
  * @param {Object} the new value
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
 
 
 stopAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.stop();
 },
 
 startAnimation :  function(){
	if(vxl.c.animation != null) vxl.c.animation.start();
 },
 
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

 clearAnimation :  function(){
	if(vxl.c.animation){
		vxl.c.animation.stop();
		vxl.c.animation = null;
	}
 },
 
 resetCamera :  function(){
	vxl.c.camera.reset();
 },
 
 saveCamera :  function(){
	vxl.c.camera.save();
 },
 
 retrieveCamera :  function(){
	vxl.c.camera.retrieve();
 },
 
 setAzimuth :  function(a){
	vxl.c.camera.changeAzimuth(a);
 },
 
 setElevation :  function(e){
	vxl.c.camera.changeElevation(e);
 },
 
 go_above :  function(){
	vxl.c.camera.above();
 },
 
 go_below :  function(){
	vxl.c.camera.below();
 },
 
 go_left :  function(){
	vxl.c.camera.left();
 },
 
 go_right :  function(){
	vxl.c.camera.right();
 },
 
 getLookupTables :  function(){
    return vxl.go.lookupTableManager.getAllLoaded();
 },
 
 //runScript :  function(file){
 //use JQuery here.
 //}
 
 /**
  * Loads a program
  * @param definition one of voxelent's programs
  */
 setDefaultProgram :  function(program){
    vxl.c.view.renderer.setDefaultProgram(program);
    
 },
 
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

