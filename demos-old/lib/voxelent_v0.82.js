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

/*------------------------------------------------------------*/
// Section 1: General 
/*------------------------------------------------------------*/

if (typeof(vxl) == 'undefined'){vxl = {};} //Library namespace

vxl.nucleo = 
{
	ver : '0.2',
	codename : 'bochica',
};

vxl.d = {};
vxl.glsl ={};
/*------------------------------------------------------------*/
// Section 2: Defaults / Definitions
/*------------------------------------------------------------*/
/**
 * Voxelent Definitions
 * @class
 * @property {Object} loadingMode modes to load assets
 */
vxl.def = {

    lutFolder       : "voxdata/luts",
    modelsFolder    : "voxdata/models",

	luts : ["default","aal","autumn","blackbody","bone","brodmann","cardiac",
			"copper","cortex","cte","french","fs","ge_color","gold","gooch",
			"hot","hotiron","hsv","jet","nih","nih_fire","nih_ice","pink",
			"rainramp","spectrum","surface","x_hot","x_rain"],

	lut             : "default",
	
	
	modelColor      : [0.9,0.9,0.9],
	ambientColor    : [0.5,0.5,0.5],
	backgroundColor : [135/256,135/256,135/256],
	
	visMode         : {	SOLID:'SOLID', WIREFRAME:'WIREFRAME', POINTS:'POINTS'},

	cameraTask      : {	NONE : 0,	PAN : 1,	ROTATE : 2,	DOLLY : 3	},
    cameraType      : { ORBITING: 'ORBITING', TRACKING : 'TRACKING'},
   
    loadingMode     : { LIVE:'LIVE', LATER:'LATER', DETACHED:'DETACHED'},

	VERTEX_SHADER   : 'VERTEX_SHADER',
	FRAGMENT_SHADER : 'FRAGMENT_SHADER',

	renderer : {
        mode: {
            TIMER:'TIMER',
            ANIMFRAME:'ANIFRAME' //EXPERIMENTAL NOT WAY TO CANCEL YET
        },
        rate : {
            SLOW: 10000,
            NORMAL: 500
        }
	}
    
};

vxl.events = {
	DEFAULT_LUT_LOADED 	: 'vxl.events.DEFAULT_LUT_LOADED',
	SCENE_UPDATED		: 'vxl.events.SCENE_UPDATED',
	MODELS_LOADED		: 'vxl.events.MODELS_LOADED'
};
/*------------------------------------------------------------*/
// Section 3: Globals Objects (go)
/*------------------------------------------------------------*/

vxl.go = {
    animationMode 	    : false,
    animationFrames	    : 1,
    modelToFrame 	    : [],
    axisOn 			    : true,
    console 		    : true,					  
    views 			    : [], //array
	_rates			    : [],
    timid 			    : 0,
    notifier            : undefined,
    modelManager        : undefined,
    lookupTableManager  : undefined,
    gui                 : undefined,
    
	render : function(){
		vxl.c.view.renderer.render(); 
		this.timid = window.requestAnimFrame(vxl.go.render);
	},
	
	cancelRender : function(){
		//message('vxl.go.cancelRender invoked'); 
		window.cancelRequestAnimFrame(this.timid);    // not implemented yet in any browser :(
	},
	
	slowRendering : function(){
		//message('slow rendering...');
		vxl.go._rates = [];
		for(var i = 0; i < vxl.go.views.length; i++){
			//message('saving previous rate: ' +i+' - '+ vxl.go.views[i].renderer.renderRate);
			vxl.go._rates.push(vxl.go.views[i].renderer.renderRate);
			vxl.go.views[i].renderer.setRenderRate(vxl.def.renderer.rate.SLOW);
		}
	},
	
	normalRendering : function(){
		//message('back to normal rendering....');
		for(var i = 0; i < vxl.go.views.length; i++){
			vxl.go.views[i].renderer.setRenderRate(vxl.go._rates[i]);
		}
	}
};



/*------------------------------------------------------------*/
// Section 4: Current 
/*------------------------------------------------------------*/

vxl.c = {
	scene		: undefined,
	view		: undefined,
	camera 		: undefined,
	actor 		: undefined,
	animation 	: undefined
}



/*------------------------------------------------------------*/	
//  Section 5: Improvements
/*------------------------------------------------------------*/

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
} )();


function message(v) { 
	var cl  = arguments.callee.caller.name;
	if (vxl.go.console == true){
		console.info(v);
	}
}



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
    
}

vxlNotifier.prototype.addTarget = function(event,t){
	//message('vxlNotifier: adding target for event '+event);
	var targetList = this.targetList;
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	targetList[event].push(t);
}


vxlNotifier.prototype.addSource = function(event,src){
	//message('vxlNotifier: adding source for event '+event);
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
}

vxlNotifier.prototype.fire = function(event){
	var targetList = this.targetList;
	var src = this.sourceList[event];
	//message('vxlNotifier: firing ' +event);
	$(document).trigger(event,[event,src,targetList]);
}

vxlNotifier.prototype.getEvents = function(){
	var list = [];
	for (var event in this.sourceList){
		list.push(event);
	}
	return list;
}

vxlNotifier.prototype.getTargetsFor = function(event){
	var targets = this.targetList[event];
	var list = [];
	for (var index=0;index<targets.length;index++){
		list.push(getObjectName(targets[index]));
	}
	return list;
}


 

    



/**
 * @class
 */
vxl.vec3 = {};

vxl.vec3.dot = function(a,b){
	if (!(a instanceof vxlVector3) || !(b instanceof vxlVector3)) {
		alert('vxl.math.vector.dot ERROR');
		return null;
	}
	return ((a.x*b.x) + (a.y*b.y) + (a.z*b.z));
}

vxl.vec3.cross = function(a,b){
	if (!(a instanceof vxlVector3) || !(b instanceof vxlVector3)) {
		alert('vxl.math.vector.cross ERROR');
		return null;
	}
	
	var Zx = a.y * b.z - a.z * b.y; 
	var Zy = a.z * b.x - a.x * b.z;
	var Zz = a.x * b.y - a.y * b.x;
	return new vxlVector3(Zx,Zy,Zz);
}
 
vxl.vec3.subtract = function (a,b){
	if (!(a instanceof vxlVector3) || !(b instanceof vxlVector3)) {
		alert('vxl.math.vector.substract ERROR');
		return null;
	}
	return new vxlVector3(a.x - b.x, a.y - b.y, a.z - b.z);
}

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
}

vxl.vec3.negate  = function(v){
	return vxl.vec3.scale(v,-1);
}

vxl.vec3.length = function(v){
 return Math.sqrt((v.x*v.x) + (v.y*v.y) + (v.z*v.z));
}

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
}

vxl.vec3.normalize = function(v){
	var le = vxl.vec3.length(v);
	if (le ==0) //message('ERROR: normalizing a vector by a zero norm');
	v.x = v.x / le;
	v.y = v.y / le;
	v.z = v.z / le;
}

vxl.vec3.set = function(a,b){
	if (a instanceof Array) {
		b.x = a[0];
		b.y = a[1];
		b.z = a[2];
    }
	else if (a instanceof vxlVector3){
		b.x = a.x;
		b.y = a.y;
		b.z = a.z;
	}
	else {
		b.x = 0; b.y =0; b.z =0;
	}
}

function vxlVector3(x,y,z){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	if (x != null) {this.x = x;}
	if (y != null) {this.y = y;}
	if (z != null) {this.z = z;}
}

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
	
}

vxl.vec3.create = function(v){
	return new vxlVector3(v[0], v[1], v[2]);	
}


function vxlVector4(x,y,z,h){
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.h = 1;
	if (x != null) {this.x = x;}
	if (y != null) {this.y = y;}
	if (z != null) {this.z = z;}
	if (h != null) {this.h = h;}
}

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
	
}

vxl.vec4 = {};

vxl.vec4.create = function(v){
	return new vxlVector4(v[0], v[1], v[2], v[3]);	
}

vxl.mat4 = {}

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
}

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
}

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
}


vxl.mat4.inverse = function(m,dest){

	  // Calculate the 4x4 determinant
    // If the determinant is zero, 
    // then the inverse matrix is not unique.
    var det = vxl.mat4._determinant4x4(m);

    if (Math.abs(det) < 1e-8)
        return null;

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
}

vxl.mat4.multVec3 = function (m,vec){
	
	var vv = new vxlVector3();
	var v  = new vxlVector3();
	
	if (vec instanceof Array) {
		v = vxl.vec3.create(vec)
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
} 


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
}

vxl.mat4.translate = function(m,v){
	m.m41 = m.m11 * v.x + m.m21 * v.y + m.m31 * v.z + m.m41;
	m.m42 = m.m12 * v.x + m.m22 * v.y + m.m32 * v.z + m.m42;
	m.m43 = m.m13 * v.x + m.m23 * v.y + m.m33 * v.z + m.m43;
	m.m44 = m.m14 * v.x + m.m24 * v.y + m.m34 * v.z + m.m44;
	return m;
    
}

vxl.mat4.scale = function(m,v){

    if (v.x == undefined)
        v.x = 1;
    if (v.z == undefined) {
        if (v.y == undefined) {
            v.y = v.x;
            v.z = v.x;
        }
        else
            v.z = 1;
    }
    else if (v.y == undefined)
        v.y = v.x;
    
    var matrix = new vxlMatrix4x4();
    matrix.m11 = v.x;
    matrix.m22 = v.y;
    matrix.m33 = v.z;
    
    vxl.mat4.multRight(m,matrix);
}

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
}


vxl.mat4.rotateX = function(mat, angle, dest) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        
        // Cache the matrix values (makes for huge speed increases!)
        var a10 = mat.m21, a11 = mat.m22, a12 = mat.m23, a13 = mat.m24;
        var a20 = mat.m31, a21 = mat.m32, a22 = mat.m33, a23 = mat.m34;

        if(!dest) { 
                dest = mat 
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
                dest = mat 
        } else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
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
}

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
}

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
}

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
}

vxl.mat4.perspective = function(m,fovy, aspect, zNear, zFar){
    var top = Math.tan(fovy * Math.PI / 360) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    vxl.mat4.frustum(m,left, right, bottom, top, zNear, zFar);
}

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
}


vxl.mat4._determinant2x2 = function(a, b, c, d){
    return a * d - b * c;
}

vxl.mat4._determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3){
    return a1 * vxl.mat4._determinant2x2(b2, b3, c2, c3)
         - b1 * vxl.mat4._determinant2x2(a2, a3, c2, c3)
         + c1 * vxl.mat4._determinant2x2(a2, a3, b2, b3);
}

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
}

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
}

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
}

vxlMatrix4x4.prototype.getAsArray = function(){
    return [
        this.m11, this.m12, this.m13, this.m14, 
        this.m21, this.m22, this.m23, this.m24, 
        this.m31, this.m32, this.m33, this.m34, 
        this.m41, this.m42, this.m43, this.m44
    ];
}

vxlMatrix4x4.prototype.getAsFloat32Array = function(){
    return new Float32Array(this.getAsArray());
}

vxlMatrix4x4.prototype.toString = function(){
	return debugMatrix(this);
}

debugMatrix = function(m){
	return 'Matrix\n'+m.m11.toFixed(2)+' '+m.m12.toFixed(2)+' '+m.m13.toFixed(2)+' '+m.m14.toFixed(2)+'\n'+
	''+m.m21.toFixed(2)+' '+m.m22.toFixed(2)+' '+m.m23.toFixed(2)+' '+m.m24.toFixed(2)+'\n'+
	''+m.m31.toFixed(2)+' '+m.m32.toFixed(2)+' '+m.m33.toFixed(2)+' '+m.m34.toFixed(2)+'\n'+
	''+m.m41.toFixed(2)+' '+m.m42.toFixed(2)+' '+m.m43.toFixed(2)+' '+m.m44.toFixed(2)+'\n';
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
 * Creates a vxlCameraState object and associates it with a vxlCamera. 
 * 
 * This association is unique. each camera has one vxlCameraState object. The vxlCameraState object allows to save/retrive 
 * camera states forthe camera it is associated with during the construction.
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
	
   
	
	if (t != undefined && t !=null){
        this.type = t;
    }
    else {
        this.type = vxl.def.cameraType.ORBITING;
    }
    

	this.distance = 0;
	this.debug = false;

};


/**
 * Establishes the type of camera
 * @param {vxl.def.cameraType} t
 */
vxlCamera.prototype.setType = function(t){
    if (t != vxl.def.cameraType.ORBITING && t != vxl.def.cameraType.TRACKING) {
        alert('Wrong Camera Type!. Setting Orbitting type by default');
        this.type = vxl.def.cameraType.ORBITING;
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
	console.info('compute distance called');
	/*var c = this;

	var d = vxl.vec3.subtract(c.focalPoint, c.position);
	c.distance = vxl.vec3.length(d);

	////message(c.focalPoint.toString(1,'fp') + ' distance=' + c.distance);

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
	//console.info('set distance called');
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
	//console.info('compute view transform called');
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
	//console.info(' pan called');
	/*@TODO: Review buggy*/
	/*//message('dx = ' + dx);
	//message('dy = ' + dy);
	var c = this;
	c.setPosition(c.position.x + dx * c.right.x, c.position.y + dy * c.up.y, c.position.z);
	c.setFocalPoint(c.focalPoint.x + dx * c.right.x, c.focalPoint.y + dy * c.up.y, c.focalPoint.z);*/

}

vxlCamera.prototype.dolly = function(value) {
	//console.info(' dolly called');
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
    
    if (this.type == vxl.def.cameraType.TRACKING){
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
    if(this.type == vxl.def.cameraType.TRACKING){
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
	//message('camera.reset');
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
	//message('camera.reset');
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
	//message('camera.reset');
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
	//message('camera.reset');
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
	//message('camera.reset');
}

vxlCamera.prototype.debugMessage = function(v) {
	if(this.debug) {
		//message(v);
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
	////message(v+' ' + c.position.toString(p,'pos') + ' ' +	c.focalPoint.toString(p,'focalPoint') + ' ' +'distance: ' + c.distance.toFixed(p));
	////message(c.up.toString(p,'up') + ' ' + c.right.toString(p,'right') + ' ' + 	'[ elevation:'+c.elevation.toFixed(p)+', azimuth:' + c.azimuth.toFixed(p)+']');

};*/

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

function vxlCameraManager(vw){
	this.view = vw;
	this.cameras = [];
	this.active = this.createCamera();
}

vxlCameraManager.prototype.reset = function(type){
	this.cameras = [];
	this.interactors = [];
	this.active = this.createCamera(type);
}

vxlCameraManager.prototype.checkBoundary = function(idx){
	if (idx <0 || idx >= this.cameras.length){
		throw('The camera '+idx+' does not exist');
	}
}

vxlCameraManager.prototype.createCamera = function(type){
	var camera = new vxlCamera(this.view, type);
	camera.init();
	
	this.cameras.push(camera);
	camera.idx = this.cameras.length - 1;
	return camera;
}

vxlCameraManager.prototype.getCamera = function(idx){
	this.checkBoundary(idx);
	return this.cameras[idx];
}

vxlCameraManager.prototype.getActiveCamera = function(){
	return this.active;
}

vxlCameraManager.prototype.switchTo = function(idx){
	this.checkBoundary(idx);
	this.active = this.cameras[idx];
	return this.active;
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

function vxlCameraInteractor(){
	this.camera = null;
}


vxlCameraInteractor.prototype.connectTo = function(c){
	if (c != null){
		if (c instanceof vxlCamera){
			this.camera = c;
			this.camera.interactor = this;
		}
		else {
			throw(' The object '+c+' is not a valid camera');
		}
	}
}

vxlCameraInteractor.prototype.onMouseUp   = function(ev){ alert('implement onMouseUp');}
vxlCameraInteractor.prototype.onMouseDown = function(ev){ alert('implement onMouseDown');}
vxlCameraInteractor.prototype.onMouseMove = function(ev){ alert('implement onMouseMove');}
vxlCameraInteractor.prototype.onKeyDown   = function(ev){ alert('implement onKeyDown');}
vxlCameraInteractor.prototype.onKeyUp     = function(ev){ alert('implement onKeyUp');}
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
 */
function vxlViewListener(vw){
	this.view = vw;
	this.interactor = new vxlTrackballCameraInteractor();
	this.picker = new vxlPickerInteractor();
	this.update();
}

vxlViewListener.prototype.setInteractor = function(i){
	this.interactor = i;
	this.update();
}


vxlViewListener.prototype.update = function(){
	var self = this;
	var canvas = this.view.canvas;
	
	var camera = this.view.cameraman.active;
	var interactor = this.interactor;
	
	interactor.connectTo(camera);

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
	}
	
	window.onkeyup = function(ev){
		interactor.onKeyUp(ev);
	}
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
//@NOTE: It allows to decouple listening from interaction behaviour

vxlTrackballCameraInteractor.prototype = new vxlCameraInteractor();

function vxlTrackballCameraInteractor(c){
	this.MOTION_FACTOR = 10.0;
	this.task = vxl.def.cameraTask.NONE;
	this.x = 0;
	this.y = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.ctrlPressed = false;
	this.altPressed = false;
	this.keyPressed = 0;
	this.button = -1;
	this.dragging = false;
	this.connectTo(c);
}



vxlTrackballCameraInteractor.prototype.onMouseUp = function(ev){
	//Only for debug purposes
	/*var task = this.task;
	var c = this.camera;
	if (task == vxl.def.cameratask.PAN){
			//message('New Focal Point : ' + c.focalPoint.toString(1,'focalPoint'));
	}*/
	
	task = vxl.def.cameraTask.NONE;
	
	this.dragging = false;
}

vxlTrackballCameraInteractor.prototype.onMouseDown = function(ev){
	this.x = ev.clientX;
	this.y = ev.clientY;
	this.dragging = true;
	this.button = ev.button;
}

vxlTrackballCameraInteractor.prototype.onMouseMove = function(ev){

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
		if(this.ctrlPressed){
			this.dolly(dy);
		}
		else{ 
			this.rotate(dx,dy);
		}
	}

	this.lastX = this.x;
    this.lastY = this.y; 

}

vxlTrackballCameraInteractor.prototype.onKeyDown = function(ev){
	var camera = this.camera;
	
	this.keyPressed = ev.keyCode;
	this.ctrlPressed = ev.ctrlKey;
	
	if (!this.ctrlPressed){
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
		else if (this.keyPressed = 80) {
			this.picking =!camera.view.actorManager.picking;
			camera.view.actorManager.setPicking(this.picking);
			
		}
	}
	else if(this.ctrlPressed && this.keyPressed !=17) {
		var px = 0;
		var py = 0;
		//message(ev);
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
}

vxlTrackballCameraInteractor.prototype.onKeyUp = function(ev){
	if (ev.keyCode == 17){
		this.ctrlPressed = false;
	}
}

vxlTrackballCameraInteractor.prototype.dolly = function(value){
	this.task = vxl.def.cameraTask.DOLLY;
	var camera = this.camera;
	var dv = 2 * this.MOTION_FACTOR * value / camera.view.canvas.height;
	
	camera.dolly(Math.pow(1.1,dv));
	

	camera.refresh();
	
}

vxlTrackballCameraInteractor.prototype.rotate = function(dx, dy){
	this.task = vxl.def.cameraTask.ROTATE;
	
	var camera = this.camera;
	var canvas = camera.view.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.changeAzimuth(nAzimuth);
	camera.changeElevation(nElevation);
	camera.refresh();
	
}

vxlTrackballCameraInteractor.prototype.pan = function(dx,dy){
	this.task = vxl.def.cameraTask.PAN;
	
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

vxlPickerInteractor.prototype = new vxlCameraInteractor();

function vxlPickerInteractor(camera){
	
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
	
	this.connectTo(camera);
}

vxlPickerInteractor.prototype.connectTo = function(camera){
	vxlCameraInteractor.apply(this, camera);
	if (this.camera){
		this.configure();
	}
}

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
}


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
}

vxlPickerInteractor.prototype._compare = function(readout, color){
    //console.info('comparing object '+object.alias+' diffuse ('+Math.round(color[0]*255)+','+Math.round(color[1]*255)+','+Math.round(color[2]*255)+') == readout ('+ readout[0]+','+ readout[1]+','+ readout[2]+')');
    return (Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 &&
			Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && 
			Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
}

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
}

vxlPickerInteractor.prototype.onMouseUp = function(ev){
	if(!ev.shiftKey){
		this.stop();
	}
}


vxlPickerInteractor.prototype.onMouseDown = function(ev){
	var coords = this.get2DCoords(ev);
	this.picking = this.find(coords);
	if(!this.picking){
		this.stop();
	}
}

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
}

vxlPickerInteractor.prototype.onKeyDown = function(ev){
	//@TODO: ENTER AND EXIT PICKING MODE MANUALLY
	//this.view.listener.setInteractor(previous)
}

vxlPickerInteractor.prototype.onKeyUp = function(ev){
	
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

vxlTransforms.prototype.calculateNormal = function(){
	vxl.mat4.identity(this.nMatrix);
    vxl.mat4.set(this.mvMatrix, this.nMatrix);
    vxl.mat4.inverse(this.nMatrix);
    vxl.mat4.transpose(this.nMatrix);
};

vxlTransforms.prototype.calculatePerspective = function(){
	vxl.mat4.identity(this.pMatrix);
	vxl.mat4.perspective(this.pMatrix, this.view.fovy, this.view.width/this.view.height, this.view.zNear, this.view.zFar);
};

vxlTransforms.prototype.update = function(){
    this.calculateModelView();
    this.calculatePerspective();
    this.calculateNormal();
};

vxlTransforms.prototype.updatePerspective = function(){
	vxl.mat4.perspective(this.transforms.pMatrix, this.view.fovy, this.view.width/this.view.height, this.view.zNear, this.view.zFar);
};

vxlTransforms.prototype.push = function(){
	var memento =  vxl.mat4.create();
	mat4.set(this.mvMatrix, memento);
	this.stack.push(memento);
};

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
vxl.glsl.diffusive = {
	
	NAME : 'diffusive',

	ATTRIBUTES : [
	"aVertexPosition", 
	"aVertexColor", 
	"aVertexNormal"],
	
	UNIFORMS : [
	"uPMatrix",
	"uNMatrix",
	"uMVMatrix",
	"uOpacity",
	"uPointSize",
	"uUseVertexColors",
	"uObjectColor",
	"uUseShading",
	"uAmbientColor",
	"uDirectionalColor",
	"uLightingDirection",
	"uUseVertexColors"
	],
	
	
    VERTEX_SHADER : [

    "attribute vec3 aVertexPosition; ",
    "attribute vec3 aVertexNormal; ",
    "attribute vec4 aVertexColor;",
    "uniform mat4 uMVMatrix; ",
    "uniform mat4 uPMatrix; ",
    "uniform mat4 uNMatrix; ",
    "uniform vec3 uLightingDirection;",
    "uniform vec3 uDirectionalColor;",
    "uniform vec3 uAmbientColor;",
    "uniform vec3 uObjectColor;",
    "uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform float uPointSize;",
    "varying vec4 vColor;",
    "varying vec4 vAux;",
    "void main(void) {",
    "   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); ",
    "	if(uUseVertexColors) {",
    "        vAux = aVertexColor;",
    "   }",
    "   else {",
    "		 vAux = vec4(uObjectColor,1.0);",
    "   }",
    "   if(uUseShading) {",
    "		vec4 transformedNormal = uNMatrix * vec4(aVertexNormal, 1.0);",
    "	    float directionalLightWeighting = max(dot(transformedNormal.xyz,uLightingDirection),0.0);",
    "	    vColor = vec4(vAux.rgb * (uAmbientColor + uDirectionalColor * directionalLightWeighting),1.0);",
    "	}",
    "   else {",
    "		vColor = vAux;",
    "   }",
    "   gl_PointSize = uPointSize;",
    "}"].join('\n'),
    
    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",

    "uniform float uOpacity;",
    "varying vec4  vColor;",

    "void main(void)  {",
    "		gl_FragColor = vec4(vColor.rgb,uOpacity);",
    "}"].join('\n'),
    
    DEFAULTS : {
        "uLightingDirection" : [0.0,0.0,1.0],
        "uDirectionalColor"  : [0.68,0.68,0.68],
        "uAmbientColor"      : [0.24,0.24,0.24]
    }
}/*-------------------------------------------------------------------------
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
vxl.glsl.phong = {

    NAME : 'phong',
    
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
    "uLightDirection",
    "uLightAmbient",
    "uLightDiffuse",
    "uLightSpecular",
    "uMaterialAmbient",
    "uMaterialDiffuse",
    "uMaterialSpecular",
    "uOpacity",
    "uPointSize",
	"uUseVertexColors",
	"uObjectColor",
	"uUseShading",
    ],
    
    VERTEX_SHADER: [
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexNormal;",
    "attribute vec3 aVertexColor;",
    "uniform mat4 uMVMatrix;",
    "uniform mat4 uPMatrix;",
    "uniform mat4 uNMatrix;",
    "uniform bool uUseVertexColors;",
    "varying vec3 vNormal;",
    "varying vec3 vEyeVec;",
    "varying vec3 vAux;",
    "void main(void) {",
    "     vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);",
    "     vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0));",
    "     vEyeVec = -vec3(vertex.xyz);",
    "	if(uUseVertexColors) {",
    "        vAux = aVertexColor;",
    "   }",
    "     gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
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
    "uniform float uOpacity;",
    "varying vec3 vNormal;",
    "varying vec3 vEyeVec;",
    "varying vec3 vAux;",
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
     "        varMaterialDiffuse = vec4(vAux,uOpacity);",
     "   }",
     "  if(uUseShading){  ",
     "  if(lambertTerm > 0.0)",
     "  {",
     "       Id = uLightDiffuse * varMaterialDiffuse * lambertTerm;",
     "       vec3 E = normalize(vEyeVec);",
     "       vec3 R = reflect(L, N);",
     "       float specular = pow( max(dot(R, E), 0.0), uShininess);",
     "       Is = uLightSpecular * uMaterialSpecular * specular;",
     "  }",
     "  vec4 finalColor = Ia + Id + Is;",
     "  finalColor.a = uOpacity;",
     "  gl_FragColor = finalColor;",
     "  } else {",
     "  gl_FragColor = vec4(1.0,1.0,1.0,1.0); ",	
     "  }",
     "}"].join('\n'),

    DEFAULTS : {
        "uShininess"        : 230.0,
        "uLightDirection"   : [0.0, 0.0, -1.0],
        "uLightAmbient"     : [0.03,0.03,0.03,1.0],
        "uLightDiffuse"     : [1.0,1.0,1.0,1.0], 
        "uLightSpecular"    : [1.0,1.0,1.0,1.0],
        "uMaterialAmbient"  : [1.0,1.0,1.0,1.0],
        "uMaterialDiffuse"  : [0.8,0.8,0.8,1.0],
        "uMaterialSpecular" : [1.0,1.0,1.0,1.0]
    }
}/*-------------------------------------------------------------------------
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

    this._webGLProgram      = {};
    this._attributeList     = {};
    this._uniformList       = {};
    this._uniformType       = {};

    this._uniform_cache     = {};
    
    this._currentWebGLProgram     =  null;
    this._currentProgramID        = "";
    this._currentUniformLocation  = {};
};

vxlProgram.prototype.register = function(id,code){
	//console.info('Registering program '+ id);
    this._codebase[id] = code;
};

vxlProgram.prototype.isRegistered = function(id){
	return (this._codebase[id] != undefined);
}
    
vxlProgram.prototype._createShader = function(type,code){
    var gl      = this._gl;
    var shader = null;
    
    if (type == vxl.def.VERTEX_SHADER){
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (type == vxl.def.FRAGMENT_SHADER){
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
    
vxlProgram.prototype.loadProgram = function(id){
    
    var programCode = this._codebase[id];
    
    var gl   = this._gl;
    var webGLProgram  = gl.createProgram();
    
    
    if (programCode.VERTEX_SHADER){
        var vs = this._createShader(vxl.def.VERTEX_SHADER,programCode.VERTEX_SHADER);
        gl.attachShader(webGLProgram, vs);
    }
    
    if (programCode.FRAGMENT_SHADER){
        var fs = this._createShader(vxl.def.FRAGMENT_SHADER,programCode.FRAGMENT_SHADER);
        gl.attachShader(webGLProgram, fs);
    }
    
    gl.linkProgram(webGLProgram);
     
    if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS)) {
        alert("Program: Could not link the shading program");
    }
    else{
        //console.info("Program: the program "+id+" has been loaded");
    }
    
    this._webGLProgram[id] = webGLProgram;
  
};

vxlProgram.prototype.isLoaded = function(id){
	return (this._webGLProgram[id] != undefined);
}

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
}
    
vxlProgram.prototype.useProgram = function(id){
    
    var gl = this._gl;
    var webGLProgram = this._webGLProgram[id];
    
    if (id in this._webGLProgram){
        
        gl.linkProgram(webGLProgram);
        gl.useProgram (webGLProgram);
        
        
        this._currentWebGLProgram = webGLProgram;
        this._currentProgramID = id;
        this._parseUniforms();
        
        //console.info('Program: the program '+id+' has been linked and is the current program');
    }
    else{
        alert("Program: the program " + id + " has NOT been loaded");
    }
};

vxlProgram.prototype.loadDefaults = function(){
    var code = this._codebase[this._currentProgramID];
    
    if ('DEFAULTS' in code){
        //console.info('Program: defaults for program '+this._currentProgramID+' found. Loading..');
        var defaults = code.DEFAULTS;
        for(var u in defaults){
            this.setUniform(u,defaults[u]);
            //console.info('Program: Uniform:'+u+', Default Value:'+defaults[u]);
        }
    }
    else{
    	//console.info('Program: WARNING: defaults for program '+this._currentProgramID+' NOT found');
    }
};

vxlProgram.prototype.setUniforms = function(obj){
	//obj is an object where every element is an uniform
	for(uni in obj){
		this.setUniform(uni,obj[uni]);
	}
}

vxlProgram.prototype.setUniform = function(uniformID, value, hint){
    
    var webGLProgram 		= this._currentWebGLProgram;
    var uniformList 		= this._uniformList[this._currentProgramID];
    var uniformLoc  		= this._currentUniformLocation;
    var uniform_cache 		= this._uniform_cache;
    
    if (uniformList.hasObject(uniformID)){
        uniformLoc[uniformID] = this._gl.getUniformLocation(webGLProgram,uniformID);
        
    }
    else{
    	alert('Program: the uniform '+uniformID+' is not defined for the program '+this._currentProgramID);
        return;
    }
    
    uniform_cache[uniformID] = value;
    this._setPolymorphicUniform(uniformID, uniformLoc[uniformID], value, hint);
};


vxlProgram.prototype.getUniform = function(uniformID){
    //TODO: Think about this
    //if(!(name in this._uniformList)){
      //  alert('Program: the uniform ' + name + ' has not been set');
        //return null;
   //}
    return this._uniform_cache[uniformID];
};

vxlProgram.prototype._getAttributeLocation = function(name){

    if(!(name in this._attributeList)){
        this._attributeList[name] = this._gl.getAttribLocation(this._currentWebGLProgram,name)
    }

    return this._attributeList[name];
};

vxlProgram.prototype._setPolymorphicUniform = function(uniformID, locationID,value,hint){

	//In the extend of what it is reasonable,
	//We cross check GLSL type information with actual javascript variable types 
	//to make the right calls
	//hint allows better casting of int and float values. If not specified default is float
    
    var gl = this._gl;
    var glslType = this._uniformType[this._currentProgramID][uniformID];
    
    if (glslType == 'bool'){
    	//if (typeof value != 'boolean') { 
    	//	//console.info('Program: the uniform '+uniformID+' is defined as bool in GLSL. However the JS variable is not');
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
    		//console.info('Program: the uniform '+uniformID+' is defined as mat4 in GLSL. However the JS variable is not.');
    	}
        gl.uniformMatrix4fv(locationID,false,value.getAsFloat32Array());
        return;
    }
    
    
    else if (value instanceof Array){
        if (hint  == 'int'){
            switch(value.length){
                case 1: { gl.uniform1iv(locationID,value); break };
                case 2: { gl.uniform2iv(locationID,value); break };
                case 3: { gl.uniform3iv(locationID,value); break };
                case 4: { gl.uniform4iv(locationID,value); break };
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

vxlProgram.prototype.setVertexAttribPointer = function(name, numElements, type, norm,stride,offset){
    var a = this._getAttributeLocation(name);
    this._gl.vertexAttribPointer(a,numElements, type, norm, stride, offset);
};

vxlProgram.prototype.enableVertexAttribArray = function(name){
    var a = this._getAttributeLocation(name);
    this._gl.enableVertexAttribArray(a);
};

vxlProgram.prototype.disableVertexAttribArray = function(name){
    var a = this._getAttributeLocation(name);
    this._gl.disableVertexAttribArray(a);
};

vxlProgram.prototype.setMatrixUniform = function(name,m){
	var u = this._gl.getUniformLocation(this._currentWebGLProgram,name);
	this._gl.uniformMatrix4fv(u,false,m.getAsFloat32Array());
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
    
    this.gl  = this.getWebGLContext();
    this.prg = new vxlProgram(this.gl);
    this.setDefaultProgram();
    
    this.transforms = new vxlTransforms(vw);
}

/**
 * Tries to obtain a WebGL context from the canvas associated with the view to which this
 * renderer belongs to.
 * @TODO: Review depth test and blending functions maybe these should be configurable.
 */
vxlRenderer.prototype.getWebGLContext = function(){
	
	var _webGLContext = null;
	var canvas = this.view.canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
	for (var i = 0; i < names.length; ++i) {
		try {
			_webGLContext = canvas.getContext(names[i]);
		} 
		catch(e) {}
		if (_webGLContext) {
			break;
		}
	}
	if (_webGLContext == null) {
		alert("Could not intiailise WebGL");
		throw("Could not initialise WebGL"); 
		return;
	}
	else {
		var _gl = _webGLContext;
		_gl.enable(_gl.DEPTH_TEST);
		_gl.enable(_gl.BLEND);
		_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
		_gl.depthFunc(_gl.LEQUAL);
	}
    return _webGLContext;
}

/**
 * Sets the program 'diffusive' as the program by default to be used by this renderer
 */
vxlRenderer.prototype.setDefaultProgram = function(){
    this.setProgram(vxl.glsl.diffusive.NAME, vxl.glsl.diffusive);
}

/**
 * Tries to add a new program definition to this renderer
 * @param {String} id program name or program alias that we will use to recognize this program in the system
 * @param {String} code contains the GLSL definition of the program
 */
vxlRenderer.prototype.setProgram = function(id, code){
	var prg = this.prg;
	if (!prg.isRegistered(id)){
		prg.register(id,code);
	}
	
	if (!prg.isLoaded(id)){
		prg.loadProgram(id);
	}
	prg.useProgram(id);
	prg.loadDefaults();
}

/**
 * Clears the rendering context
 */
vxlRenderer.prototype.clear = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height);
	
	//vxl.mat4.identity(this.pMatrix);
	//vxl.mat4.perspective(this.pMatrix, this.view.fovy, this.view.width/this.view.height, this.view.zNear, this.view.zFar);
	this.transforms.calculatePerspective();
}

/**
 * Starts the renderer
 */
vxlRenderer.prototype.start = function(){
	if(this.mode == vxl.def.renderer.mode.TIMER){
		////message('Renderer: starting rendering for view ['+this.view.name+'] at '+this.renderRate+ 'ms');
		this.timerID = setInterval((function(self) {return function() {self.render();}})(this),this.renderRate); 
	}
	else if(this.mode == vxl.def.renderer.mode.ANIMFRAME){
		//vxl.go.render();
		//message('vxl.go.render invoked');
	}
}

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
}

/**
 * Sets the rendering rate in ms
 * @param {Number} ms the new rendering rate in milliseconds
 */
vxlRenderer.prototype.setRenderRate = function(rate){ //rate in ms
	
	this.renderRate = rate;
	this.stop();

	if (this.animation && this.animation.running){
		this.animation.stop();
		this.animation.start();
	}
	
	if (rate == null || rate <=0){
		//this.mode = vxl.def.renderer.ANIMFRAME; //disabled for now
		////message('vxlRenderer.mode = ANIMFRAME');	
		return;
	}	
	else{
		this.mode = vxl.def.renderer.mode.TIMER;
		//message('Renderer: view['+this.view.name+'] mode = TIMER, render rate = ' + rate);
	}
	
	this.start();
	
}

/**
 * Sets the color used to clear the rendering context
 * @param {Array} cc the new color passed as a numeric array of three elements
 * @see vxlView#setBackgroundColor
 */
vxlRenderer.prototype.clearColor = function(cc){
	this.gl.clearColor(cc[0], cc[1], cc[2], 1.0);
}

/**
 * Sets the clear depth for the rendering context
 * @param {Number} d the new clear depth
 */
vxlRenderer.prototype.clearDepth = function(d){
	this.gl.clearDepth(d);
}


/**
 * Passes the matrices to the shading program
 */
vxlRenderer.prototype._setMatrices = function(){
    
    this.transforms.update();
    
    var prg = this.prg;
    
    prg.setUniform("uMVMatrix",this.transforms.mvMatrix);
    prg.setUniform("uPMatrix", this.transforms.pMatrix);
    prg.setUniform("uNMatrix", this.transforms.nMatrix);
 };


/**
 * Renders the scene by delegating the rendering to each actor present in the scene
 */
vxlRenderer.prototype.render = function(){	
	////console.info('Rendering view ['+this.view.name+']');
    var scene = this.view.scene;   
	this.view.prepareForRendering();
    this._setMatrices();
	//scene.allocate(this);
    scene.render(this);
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
 * @author Diego Cantor
 */
function vxlModel(name){
	this.name = name;
	this.indices 	= null;
	this.vertices 	= null;
	this.scalars 	= null;
	this.color 		= null;
	this.normals 	= null;
	this.wireframe 	= null;
	this.centre 	= null;
	this.outline 	= null;
	//texture

}

/**
 * Populates this model with the payload (JSON object)
 * @param {String} nm the name given to this model
 * @param {Object} payload the JSON object that describes the model
 */
vxlModel.prototype.load = function(nm,payload){
	this.name		= nm;
	if (payload.obj_name != null){
		this.name = payload.obj_name;
	}
	this.vertices 	= payload.vertices;
	this.indices 	= payload.indices;
	this.color 		= payload.color;
	this.scalars 	= payload.scalars;
	this.wireframe  = payload.wireframe;
	this.colors     = payload.colors;	

	if(!this.normals && !this.wireframe){
		this.getNormals();
	}
	
	
	if(!this.color){
		this.color = vxl.def.modelColor.slice(0); //so posterior modifications of the default don't affect this model
	}
	if (this.wireframe == null){
		this.getWireframeIndices();
	}
	
	this.getOutline();
	this.getCentre();
}


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
}  

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
  }
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
	}

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


//@NOTE: Actors take care of rendering models
//@NOTE: model has to be loaded to be able to create actor. look for a way to enforce this.
//@NOTE: A possible optimization is to combine several actors in one buffer. Watch optimzation video on YouTube by Gregg Tavares

/**
 * @class
 * @constructor
 */
function vxlActor(model){
  
  if (model){
  	this.model 	= model;
  	this.name 	= model.name;
  	this.color 	= model.color;
  }
  
  this.buffer = {
    vertex:null, 
    normal:null,
    color:null,
    index:null,
    wireframe:null
  }
  
  this.renderers = [];
  this.buffers = [];
  
  this.matrix = new vxlMatrix4x4();
  this.allocated = false;
  this.visible   = true;
  this.mode = vxl.def.visMode.SOLID;
  this.opacity = 1.0;
  this.colors = model?(model.colors!=null?model.colors:null):null;	//it will create colors for this actor once a lookup table had been set up
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
   
   //console.info('Preparing actor '+this.model.name+' for view '+ renderer.view.name)
   	
	var gl = renderer.gl;
	var model = this.model;
    var buffer = {};//this.buffer;
	
	buffer.vertex = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
	
	if (model.normals){
		buffer.normal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normal);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals.slice(0)), gl.STATIC_DRAW);
	}
	
	if (model.scalars || model.colors){
		buffer.color = gl.createBuffer(); //we don't BIND values or use the buffer until the lut is loaded and available
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	if (model.indices){
		buffer.index = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices.slice(0)), gl.STATIC_DRAW);
	}
	
	if (model.wireframe){
		buffer.wireframe = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe.slice(0)), gl.STATIC_DRAW);
	}
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	//this.allocated = true;
	this.renderers.push(renderer);
	this.buffers.push(buffer);
};

/**
* Deletes the WebGL buffers used for this object. After this the actor will not be rendered until a new allocation takes place
*/
vxlActor.prototype.deallocate = function(){
  var buffer = this.buffer;
  this.buffer.vertex    = null;
  this.buffer.normal    = null;
  this.buffer.color     = null;
  this.buffer.index     = null;
  this.buffer.wireframe = null;
  this.allocated = false;
  throw('exception');
};

/**
* Performs the rendering of this actor using the WebGL context provided by the renderer
*/
vxlActor.prototype.render = function(renderer){
	
	if (!this.visible){ 
		return;
	}
	
	//console.info('Rendering actor '+this.model.name+' for view '+renderer.view.name);
	var idx = this.renderers.indexOf(renderer);

	var model = this.model;
    var buffer = this.buffers[idx]; //this.buffer
	
    //@The actor is a good renderer friend. It borrows its gl and prg objects to do its own rendering.
	var gl = renderer.gl;
	var prg = renderer.prg;


	prg.setUniform("uOpacity",this.opacity); 
	prg.setUniform("uObjectColor",this.color);
	prg.setUniform("uUseVertexColors", false);
    
    prg.disableVertexAttribArray("aVertexColor");
	prg.disableVertexAttribArray("aVertexNormal");
	prg.enableVertexAttribArray("aVertexPosition");
	try{
		
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices.slice(0)), gl.STATIC_DRAW);
		prg.setVertexAttribPointer("aVertexPosition", 3, gl.FLOAT, false, 0, 0);
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
			
			prg.enableVertexAttribArray("aVertexColor");
			prg.setVertexAttribPointer("aVertexColor", 4, gl.FLOAT, false, 0, 0);
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
			
			prg.enableVertexAttribArray("aVertexNormal");
			prg.setVertexAttribPointer("aVertexNormal",3,gl.FLOAT, false, 0,0);
		}
	    catch(err){
	        alert('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
			throw('There was a problem while rendering the actor ['+this.name+']. The problem happened while handling the normal buffer. Error =' +err.description);
	    }
	}
    
    try{
		if (this.mode == vxl.def.visMode.SOLID){
			prg.setUniform("uUseShading",true);
			prg.enableVertexAttribArray("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.visMode.WIREFRAME){
			prg.setUniform("uUseShading", false);
			prg.disableVertexAttribArray("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.wireframe);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.visMode.POINTS){
			prg.setUniform("uUseShading", true);
			prg.enableVertexAttribArray("aVertexNormal");
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
}

/**
* Sets the actor color. This color can be different from the original model color
*/
vxlActor.prototype.setColor = function (c){
	this.color = c.slice(0);
	//message('Actor '+this.name+': color changed to : (' + this.color[0] +','+ this.color[1] +','+ this.color[2]+')');
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
* @param {vxl.def.visMode} mode mode needs to be one of the elments defined in vxl.def.visMode
*/
vxlActor.prototype.setMode = function(mode){
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
}

/**
* Sets the visibility of the actor
*/
vxlActor.prototype.setVisible = function(flag){
    this.visible = flag;
}

/**
* Is visible?
*/
vxlActor.prototype.isVisible = function(){
    return this.visible;
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
	this.views  = [];
	this.actors = [];
	this.loadingMode = vxl.def.loadingMode.LIVE;
	this.normalsFlipped = false;
	this.lutID = null;
	this.timerID = null;
	this.dispatchRate = 500;
	this.scalarMIN = Number.MAX_VALUE;
	this.scalarMAX = Number.MIN_VALUE;
	this.bb = [];
	this.centre = [];
	this.axisActor = new vxlAxis();
	this.boundingBoxActor = new vxlBoundingBox();
	this.actors.push(this.axisActor);
	this.actors.push(this.boundingBoxActor);

	vxl.c.scene = this;
	vxl.go.notifier.addTarget(vxl.events.MODELS_LOADED,this);
	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);
	vxl.go.notifier.addSource(vxl.events.SCENE_UPDATED, this);
}

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
}



vxlScene.prototype.setLoadingMode = function(mode){
	if (mode == undefined || mode == null || 
		(mode != vxl.def.loadingMode.LIVE && 
		 mode != vxl.def.loadingMode.LATER &&
		 mode != vxl.def.loadingMode.DETACHED)){
		 	throw('the mode '+mode+ 'is not a valid loading mode');
		 }
	this.loadingMode = mode;
}



/**
 * Calculates the global bounding box and the centre for the scene. 
 */
vxlScene.prototype.updateMetrics = function(b){
        //console.info('Scene: updating metrics with ('+ b[0]+','+b[1]+','+b[2]+') - ('+b[3]+','+b[4]+','+b[5]+')');
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
		
        this.axisActor.setCentre(this.centre);
        this.boundingBoxActor.setBoundingBox(this.bb);
}

/**
 * Calculates the global bounding box and the center of the scene.
 * Updates the Scene's axis and bounding box actors.
 */
vxlScene.prototype.computeMetrics = function() {
	this.bb = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
	this.centre = [0.0, 0.0, 0.0];
	for(var i=0; i<this.actors.length; i++){
		if (this.actors[i].witness) continue; 
		this.updateMetrics(this.actors[i].model.outline);
	}
}


vxlScene.prototype.createActor = function(model){
	
	var actor = new vxlActor(model);
	if (this.normalsFlipped){
		actor.flipNormals(true);
	}
	
	if (this.lutID != null){
		actor.setLookupTable(this.lutID, this.scalarMIN, this.scalarMAX);
	}
    
	this.actors.push(actor);
    this.updateMetrics(actor.model.outline);
    
	//message('Scene: Actor for model '+model.name+' created');
    vxl.go.notifier.fire(vxl.events.SCENE_UPDATED);
	return actor;
}

/**
 * Creates multiples actors at once
 * @param models a list of models to create actors from
 */
vxlScene.prototype.createActors = function(models){
	//message('Scene: Creating all the actors now');
	for (var i = 0; i < models.length; i++){
		this.createActor(models[i]);
	}	
}
/**
 * Adds one actor
 * @param actor the actor to be added to the scene
 */
vxlScene.prototype.addActor = function(actor){
	this.actors.push(actor);
    this.updateMetrics(actor.model.outline);
    vxl.go.notifier.fire(vxl.events.UPDATED_SCENE);
}

/**
 * Removes one actor
 * @param actor the actor to be removed from the scene
 */
vxlScene.prototype.removeActor = function(actor){
	var idx = this.actors.indexOf(actor);
	this.actors.splice(idx,1);
    this.computeMetrics();
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
}

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
}
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
	this.actors.push(this.axisActor);
	this.actors.push(this.boundingBoxActor);
	this.computeMetrics();
}

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
	return null;
}

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

}

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
 * Sets the diffusive color for one of all the actors in the scene
 * @param c the color [r,g,b,a]
 * @param name the name of the actor whose color will be changed
 */
vxlScene.prototype.setColor = function(c, name){
	if (name == null){
		//message('Scene: set color for all actors');
		for(var i=0; i<this.actors.length; i++){
			this.actors[i].setColor(c);
		}
	}
	else{
		//message('Scene: set color for active actor:'+name);
		var actor = this.getActorByName(name);
		actor.setColor(c);
	}
}

/**
 * Changes the visualization mode for all the objects in the scene
 * @param mode the visualization mode. It can be... TODO
 */
vxlScene.prototype.setVisualizationMode = function(mode){
	if (mode == null || mode == undefined) return;
	for(var i=0; i<this.actors.length; i++){
			this.actors[i].setVisualizationMode(mode);
	}
}

/**
 * Delegates rendering to each one of the actors in the actor list. It passes
 * the renderer object that contains the WebGL context to perform the rendering.
 */
vxlScene.prototype.render = function(ren){
	//ignore renderer parameter
	for (var v = 0, viewCount = this.views.length; v<viewCount; v+=1){
		var renderer = this.views[v].renderer;
		for(var a=0, actorCount = this.actors.length; a<actorCount; a+=1){
		   this.actors[a].allocate(renderer);
	       this.actors[a].render(renderer);
	    }
	}
}

/**
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
}

/**
 * Load a lookup table file
 * @param {String} name the filename of the lookup table to load
 */
vxlLookupTableManager.prototype.load = function(name){
		var self = this;
		if (this.isLoaded(name)) return;

	    var request = new XMLHttpRequest();
	    request.open("GET", vxl.def.lutFolder+'/'+name+'.lut');
	    request.onreadystatechange = function() {
	      if (request.readyState == 4) {
		    if(request.status == 404) {
				alert (name + ' does not exist');
				//message(name + ' does not exist');
			 }
			else {
				self.handle(name,JSON.parse(request.responseText));
			}
		  }
	    }
		request.send();
}
/**
 * Once the lookup table file is retrieved, this method adds it to the lookup table manager
 */
vxlLookupTableManager.prototype.handle = function (ID, payload) {
	var lut = new vxlLookupTable();
	lut.load(ID,payload);
	this.tables.push(lut);
	
	if (lut.ID == vxl.def.lut){
		vxl.go.notifier.fire(vxl.events.DEFAULT_LUT_LOADED);
	}
}
/**
 * Check if a lookup table has been loaded by this lookup table manager
 * @param {String} ID the id of the table to check
 */
vxlLookupTableManager.prototype.isLoaded = function(ID){
	for(var i=0;i<this.tables.length;i++){
		if (this.tables[i].ID == ID) return true;
	}
	return false;
}

/**
 * Retrieves a lookup table
 * @param {String} ID id of the lookup table to retrieve
 */
vxlLookupTableManager.prototype.get = function(ID){
	for(var i=0;i<this.tables.length;i++){
		if (this.tables[i].ID == ID) return this.tables[i];
	}
	return null;
}

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
}

/**
 * Checks if all the lookup tables have been loaded
 */
vxlLookupTableManager.prototype.allLoaded = function(){
	//@TODO: think of a timeout to alter this state in the case not all tables are loaded (can this happen?)
	return (vxl.def.luts.length == this.tables.length);
}

/**
 * Loads all the lookup tables defined in vxl.def.luts
 */
vxlLookupTableManager.prototype.loadAll = function(){
	for(var i=0;i<vxl.def.luts.length;i++){
		this.load(vxl.def.luts[i]);
	}
}

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

if (vxl.def.model == undefined) vxl.def.model = {};

vxl.def.model.boundingBox = new vxlModel();
vxl.def.model.boundingBox.load('bounding box', { "vertices" : [], "wireframe":[0,1,1,2,2,3,3,0,0,4,4,5,5,6,6,7,7,4,1,5,2,6,3,7], "color":[1.0,1.0,1.0]});

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
    this.mode 		= vxl.def.visMode.WIREFRAME;
    this.visible 	= false;
    this.witness	= true;
}	

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

if (vxl.def.model == undefined) vxl.def.model = {};

vxl.def.model.axis = new vxlModel();
vxl.def.model.axis.load('axis', {
                    "vertices": [	-1, 0, 0, 	 1, 0, 0, 	 0,-2, 0,	 0, 2, 0,	 0, 0,-1,	 0, 0, 1	],
                    "wireframe": [ 	0, 1, 	2, 3, 	4, 5	],
                    "colors": [	1, 1, 0 ,1,	  1, 1, 0 ,1,	0, 1 ,0 ,1,	 0, 1 ,0 ,1,  0, 0, 1 ,1,	 0, 0, 1 ,1	]
                    });
 

 vxlAxis.prototype = new vxlActor();
vxlAxis.prototype.constructor = vxlAxis;

/**
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlAxis() {
	vxlActor.call(this,vxl.def.model.axis);
	this.centre 	= [0,0,0];
	this.mode 		= vxl.def.visMode.WIREFRAME;
	this.visible 	= false;
	this.witness 	= true;
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
		alert('The canvas ' + canvasID+ ' does not exist.');
		throw('The canvas ' + canvasID+ ' does not exist.');
	}
	
	
		
	//View properties
	this.ready = false;
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.clearDepth = 10000;
	this.zNear = 0.1;
	this.zFar = 10000;
	this.fovy = 10;
	this.backgroundColor = vxl.def.backgroundColor.slice(0);
	this.ambientColor = vxl.def.ambientColor.slice(0);

	//Create Renderer
	this.renderer = new vxlRenderer(this);
	this.setBackgroundColor(this.backgroundColor);
	this.setClearDepth(this.clearDepth);
	
	//Create Camera Manager
	this.cameraman = new vxlCameraManager(this);
	
	//Create View Listener
	this.listener = new vxlViewListener(this);
	
	//Create Scene
	if (scene != null && scene instanceof vxlScene){
		this.scene = scene;
	}
	else if (vxl.c.scene){
		this.scene = vxl.c.scene;
	}
	else{
		this.scene = new vxlScene();
	
	}
	//Add this view to the scene;
	this.scene.views.push(this);
	
	//Register events to listen to
	vxl.go.notifier.addTarget(vxl.events.SCENE_UPDATED, this);
	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);
	
	 this.ready = true;
	 //message('vxlView: the view '+ this.name+' has been created');
};


/**
 * Handles the events to which a view is subscribed in Voxelent's Nucleo
 * @param {String} event the name of the event
 * @param {Object} source the origin of the event. Useful to do callbacks if necessary
 */
vxlView.prototype.handleEvent = function(event, source){
	//message('vxlView: receiving event '+event);
	if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.scene.setLookupTable(vxl.def.lut);
	}
	if (event == vxl.events.SCENE_UPDATED){
		this.cameraman.getActiveCamera().longShot();	
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
* Prepares the view for rendering
* @TODO: Frown :-/ This method is a callback from the Renderer
*/
vxlView.prototype.prepareForRendering = function(){
	if (!this.ready) return; //not ready yet?
	this.resize();
	this.clear();
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
}

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
 * Sets the ambient color
 * @param {Array} v the new ambient color given as an array of three numbers
 * 
 */
vxlView.prototype.setAmbientColor = function(v){
	this.ambientColor = v.slice(0);
	this.renderer.prg.setUniform("uAmbientColor", this.ambientColor);
};

/**
 * Sets the clear depth
 * @param {Number} d the new depth
 * @see vxlRenderer#clearDepth
 */
vxlView.prototype.setClearDepth = function(d){
	this.renderer.clearDepth(d)
};

/**
 * Refresh the view by invoking the rendering method on the renderer
 * @see vxlRenderer#render
 */
vxlView.prototype.refresh = function(){
	this.renderer.render();
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
 * vxlAssetManager provides methods for loading remote and local models.
 * 
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlAssetManager(){
	this.firstLoadedModel = false; //analyze
	this.toLoad = new Array(); //analyze
	this.assets = [];
	vxl.go.notifier.addSource(vxl.events.MODELS_LOADED,this);
};


/**
 * Creates an asset from a JSON object specification.
 * @param {Object} json the JSON object to load
 * @param {String} name the name that the asset will be identified by. This name should be unique.
 * @param {vxlScene} scene optional parameter. The scene that will contain an actor for this asset.
 */
vxlAssetManager.prototype.add = function(json, name, scene){
	this.createAsset(json,name, scene);
};

/**
 * Uses a JSON/Ajax mechanism to load assets from the webserver.
 * @param {String} name name of the file that will be loaded. Voxelent will look for this file inside of the 
 * 						folder defined by the configuration variable vxl.def.modelsFolder
 * @param {vxlScene} optional parameter. The scene that will contain an actor for this asset.
 */  
vxlAssetManager.prototype.load = function(name, scene) {
    var manager = this;
	if (manager.isModelLoaded(name)) return;
	
	//message('Requesting '+name+'...');
    var request = new XMLHttpRequest();
    request.open("GET", vxl.def.modelsFolder+'/'+name);
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
	    if(request.status == 404) {
			alert ('vxl.go.assetManager says: '+ name + ' does not exist');
		 }
		else {
			manager.createAsset(name,JSON.parse(request.responseText),scene);
		}
	  }
    }
    request.send();
};

/**
 * Loads a list of assets and assigns them to a scene
 * @param {Array} list list of files to load 
 * @param {vxlScene} scene scene to callback when the assets are loaded 
 */
vxlAssetManager.prototype.loadList = function(list,scene){
	this.toLoad = list.slice(0); 
	//message('models to load: ' + this.toLoad.length);
   	for(var i=0;i<this.toLoad.length; i++){
		this.load(this.toLoad[i],scene);
   	}
};

/**
 * 
 * @param {String} name name of the asset to be created
 * @param {Object} payload the JSON object that contains the definition of the asset
 * @param {vxlScene} scene the scene to be called back when the asset is created
 */
vxlAssetManager.prototype.createAsset = function(name,payload,scene){
	var model = new vxlModel();
	
	model.load(name,payload);
	
	if (!this.firstLoadedModel){
		scene.bb = model.outline;
		this.firstLoadedModel = true;
	}
		
	model.loaded = true;
	this.assets.push(model);
	//message('AssetManager: asset '+model.name+' created.'); 
	
	if (scene != undefined && scene instanceof vxlScene){
		//message('AssetManager: notifying the scene...');
		if (scene.loadingMode == vxl.def.loadingMode.LIVE){
			scene.createActor(model);
		}
		else if (scene.loadingMode == vxl.def.loadingMode.LATER){
			if(assetManager.allLoaded()){
				scene.createActors(assetManager.assets);
			}
		}
		else if (scene.loadingMode == vxl.def.loadingMode.DETACHED){
			//do nothing
		}
	}
	
	if(this.allLoaded()){ 
		vxl.go.notifier.fire(vxl.events.MODELS_LOADED);
	}
 };
 
/**
 * It will delete all of the loaded assets
 */  
vxlAssetManager.prototype.reset = function(){
	this.firstLoadedModel = false;
	for (var i=0; i <this.assets.length; i++){
		this.assets[i] = null;
	}
	
	this.assets        = [];
	this.toLoad        = [];
};

/**
 * Checks if a model has been loaded yet
 * @param {String} name the name of the model to check
 */
vxlAssetManager.prototype.isModelLoaded = function(name){
	for(var i=0;i<this.assets.length;i++){
		if (this.assets[i].name == name) return true;
	}
	return false;
};

/**
 * Returns true if all the models in the list passed to the method loadList.
 */
vxlAssetManager.prototype.allLoaded = function(){
	return (this.assets.length == this.toLoad.length); //TODO: Verify one by one
}


/**
 * Returns the asset if it has been loaded by this asset manager, null otherwise.
 * @param {String} name the name of the asset to retrieve
 */
vxlAssetManager.prototype.getAssetByName = function(name){
 	for(var i=0, max = this.assets.length; i<max; i+=1){
		if (this.assets[i].name == name) return this.assets[i];
	}
	return null;
};

/**
 * Defines the global Asset Manager 
 */
vxl.go.assetManager = new vxlAssetManager();/*-------------------------------------------------------------------------
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
 * @TODO: CONVERT TO A REAL ACTOR
 */
var Floor = {
    alias       : 'floor',
    wireframe   : true,
    dim         : 50,
    lines       : 50,
    vertices    : [],
    indices     : [],
    diffuse : [0.7,0.7,0.7,1.0],
    build : function(d,e){
                    if (d) Floor.dim = d;
                    if (e) Floor.lines = 2*Floor.dim/e;
                    var inc = 2*Floor.dim/Floor.lines;
                    var v = [];
                    var i = [];

                    for(var l=0;l<=Floor.lines;l++){
                        v[6*l] = -Floor.dim; 
                        v[6*l+1] = 0;
                        v[6*l+2] = -Floor.dim+(l*inc);
                        
                        v[6*l+3] = Floor.dim;
                        v[6*l+4] = 0;
                        v[6*l+5] = -Floor.dim+(l*inc);
                        
                        v[6*(Floor.lines+1)+6*l] = -Floor.dim+(l*inc); 
                        v[6*(Floor.lines+1)+6*l+1] = 0;
                        v[6*(Floor.lines+1)+6*l+2] = -Floor.dim;
                        
                        v[6*(Floor.lines+1)+6*l+3] = -Floor.dim+(l*inc);
                        v[6*(Floor.lines+1)+6*l+4] = 0;
                        v[6*(Floor.lines+1)+6*l+5] = Floor.dim;
                        
                        i[2*l] = 2*l;
                        i[2*l+1] = 2*l+1;
                        i[2*(Floor.lines+1)+2*l] = 2*(Floor.lines+1)+2*l;
                        i[2*(Floor.lines+1)+2*l+1] = 2*(Floor.lines+1)+2*l+1;        
                    }
                    Floor.vertices = v;
                    Floor.indices = i;
              }
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
 /*
  * @namespace Application Programing Interface namespace
  */
 vxl.api = new api();

/**
 * Nucleo Application Programming Interface (NAPI)
 * 
 * Using vxl.api in your programs you will be able to access many of the features offered by 
 * Voxelent's Nucleo library.
 * 
 * By design, type checking is enforced throughout the functions provided by the public API. 
 * The goal is to help novice programmers that will use the API more often than advanced programmers.
 * 
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 *  
 */ 
 function api(){}
 
 /**
  * Creates and returns a vxlView object
  * @param {String} canvas_id The canvas' Document Object Model (DOM) id.
  * @param {vxlScene} scene optional, the scene associated to this view
  * @returns {vxlView} a new vxlView object
  */
 api.prototype.setup = function(canvas_id, scene){
 	if (scene != null && !(scene instanceof vxlScene)) throw ('api.setup: scene parameter is invalid');
 	return new vxlView(canvas_id,scene);
 }
  
  /**
   * Sets the rendering rate of the current view
   * @param {Number} r the new rendering rate given as a number in milliseconds
   * @see api#setActiveView
   */
  api.prototype.setRenderRate = function(r){
	vxl.c.view.renderer.setRenderRate(r);
  }
  
  /**
   * @TODO: is this deprecated?
   */
 api.prototype.setCameraDistance = function(op){
	 g_fovy = op;
	 //message('fovY = ' + op);
 }
 
 /**
  * If the object passed as a parameter is a vxlView then it sets it up as the current view.
  * All subsequent calls to API functions that reference the current view will be redirected
  * to affect the newly set object.
  * @param {a} the vxlView object that we want to make the current one
  */
 api.prototype.setActiveView = function(a){
	if (a instanceof vxlView){
		vxl.c.view = a
	}
 } 

 /**
  * Returns the current view. This is the view that is receiving all the API calls
  * @returns {vxlView} the current view
  */
 api.prototype.getActiveView = function(){
	return vxl.c.view;
 }
 
 
 api.prototype.setActiveActor = function(a){
	if (a instanceof vxlActor){
		vxl.c.actor = a;
	}
 }
 
 api.prototype.getActiveActor = function(){
	return vxl.c.actor;
 }

 api.prototype.setActiveCamera = function(a){
	if (a instanceof vxlCamera){
		vxl.c.camera = a;
	}
 }
 
 api.prototype.getActiveCamera = function(){
	return vxl.c.camera;
 }

 api.prototype.setLookupTable = function(name){
 	if (!vxl.go.lookupTableManager.isLoaded(name)){
		//message('Lookup Table '+name+' has not been loaded');
		return;
	}
	
	vxl.c.view.scene.setLookupTable(name);
 }
 
 api.prototype.loadLUTS = function(){
	vxl.go.lookupTableManager.loadAll();
 }

 /**
  * Go back to square one. A clean scene with no actors
  * @TODO: Provide the option to keep the assets in the cache (vxlAssetManager)
  */
 api.prototype.resetScene = function(){
    if (vxl.c.animation) vxl.c.animation.stop();
	vxl.c.view.reset();
	vxl.go.assetManager.reset();
 }
 
 /**
  * Loads 3D models, textures and other assets to a Voxelent's scene.
  * 
  * This method is very flexible. It can load one or multiple assets depending on the type of the 
  * first parameter. If it is a String, it will try to find the file with that name in Voxelent's data folder
  * (voxdata by default). Otherwise, if  the parameter 'arguments' is an Array, loadAssets will iterate
  * through it and will try to load every element of this list. Every element being the file name.
  * 
  * Nucleo supports three different loading modes which are defined in 
  * vxl.def.loadingMode:
  * 
  * LIVE: As each asset is loaded it is added immediately into the scene by creating the corresponding actor
  * 
  * LATER: All the assets are loaded first THEN the actors are created. 
  * This is useful when you want to display a full scene instead of showing incremental updates.
  * 
  * DETACHED: The assets are loaded into the AssetManager object but actors are never created.
  * This allows background loading.
  * 
  * @param {String|Array} arguments the name of the asset or the list of assets (each element being the file name).
  * @param {vxl.def.loadingMode} mode the loading mode
  * @param {vxlScene} scene the scene in case we do not want to load these assets in the current one
  * 
  * @see {vxl#def#loadingMode}
  * @see {vxlAssetManager}
  * @see {vxlScene#setLoadingMode}
  */
 api.prototype.loadAssets = function(arguments,mode,scene){
 	
 	var scene = scene==null?vxl.c.scene:scene;
 	var assets = [];
 	if (typeof(arguments) == 'string' || arguments instanceof String){
 		assets.push(arguments);
 	}
 	else if (arguments instanceof Array){
 		for(var i=0; i<arguments.length;i++){
			assets.push(arguments[i]);
		}
 	}
 	if (mode != undefined && mode != null){
		scene.setLoadingMode(mode);
	}
	
	vxl.go.assetManager.loadList(assets, scene);
 }
 
 
 /**
  * Activates the axis in the current view
  * The axis is always centered in the focal point of the camera
  */
 api.prototype.axisON = function(){
	vxl.c.view.scene.axis.setVisible(true);
	vxl.c.camera.refresh();
 }
 
 /**
  * Hides the axis in the current view
  */
 api.prototype.axisOFF = function(){
	vxl.c.view.scene.axis.setVisible(false);
	vxl.c.camera.refresh();
 }
 
 /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 api.prototype.boundingBoxON = function(){
	vxl.c.view.scene.boundingBox.visible = true;
	vxl.c.camera.refresh();
 }
 
  /**
  * Shows the global bounding box of the current scene 
  * @TODO: move the bounding box to the scene object
  */
 api.prototype.boundingBoxOFF= function(){
	vxl.c.view.scene.boundingBox.visible = false;
	vxl.c.camera.refresh();
 }
 
 /**
  * @TODO: Reimplement behaviour in the camera
  */
 api.prototype.toggleSpin = function(){
	vxl.c.camera.spin();
 }
 
 
 api.prototype.setAmbientColor = function(r,g,b) { 
	vxl.c.view.setAmbientColor([r,g,b]);
 }
 
 api.prototype.setBackgroundColor = function(r,g,b){
	vxl.c.view.setBackgroundColor([r,g,b]);
} 

 api.prototype.setAmbientLight = function(l){
	this.setAmbientColor(l,l,l);
	vxl.c.view.refresh();
	//message('Ambient light changed to '+(l*100)+'%');
	return true;
 }


/**
 * If an actor has been selected (If there is an active actor in vxl.c.actor), changes its visualization mode to WIREFRAME. Otherwise,
 * shows all the scene in WIREFRAME mode.
 * 
 */ 
api.prototype.wireframeON = function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.visMode.WIREFRAME);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.visMode.WIREFRAME);
	}
	//message('Wireframe is shown.');
 }
 
 /**
  * If there is an act
  */
 api.prototype.surfaceON = function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.visMode.SOLID);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.visMode.SOLID);
	}
	//message('Wireframe is hidden.');
 }
 
 api.prototype.pointsON = function(){
	if (vxl.c.actor){
		vxl.c.actor.setVisualizationMode(vxl.def.visMode.POINTS);
	}
	else {
		vxl.c.view.scene.setVisualizationMode(vxl.def.visMode.POINTS);
	}
 }
 
 /**
  * @param {Number} op  opacity value between 0 and 1 (float)
  */
 api.prototype.setActorOpacity = function(op){
    var opacity = Math.min(Math.max(0,Math.abs(op)),1);
	if (vxl.c.actor){
		vxl.c.actor.setOpacity(op);
	}
	else{
		vxl.c.view.scene.setOpacity(opacity);
	}
	vxl.c.view.refresh();
	//message('Opacity changed to '+(op*100)+'%');
  }
  
 
 /**
  * @param {Number} r the red component
  * @param {Number} g the green component
  * @param {Number} b the blue component
  */
 api.prototype.setActorColor = function (r,g,b){
	var color = [r,g,b];
	if (vxl.c.actor){
		vxl.c.actor.setColor(color);
	}
	else{
		vxl.c.view.scene.setColor(color);
	}
	vxl.c.view.refresh();
 }
 
 /**
  * @param {bool} flag if true this method will flip the normals. If false normals will be
  * calculated the 'normal' way.
  */
 api.prototype.flipActorNormals = function (flag){
	if (vxl.c.actor){
		vxl.c.actor.flipNormals(flag);
	}
	else{
		vxl.c.view.scene.flipNormals(flag);
	}
	vxl.c.view.refresh();
 }
 
 
 api.prototype.stopAnimation = function(){
	if(vxl.c.animation != null) vxl.c.view.stop();
 }
 
 api.prototype.startAnimation = function(){
	if(vxl.c.animation != null) vxl.c.view.start();
 }
 
 api.prototype.setFrame = function(f){
	if (vxl.c.animation == null) return;
	var a = vxl.c.animation;
	a.stop();
	if (f>=1){
		a.setFrame(f);
	}
	else{
		//message('frame ' + f +' does not exist. Animation goes back to the beginning');
		a.setFrame(1);
	}
 }

 api.prototype.clearAnimation = function(){
	if(vxl.c.animation){
		vxl.c.animation.stop();
		vxl.c.animation = null;
		vxl.c.view.animation = null;
	}
 } 
 
 api.prototype.resetCamera = function(){
	vxl.c.camera.reset();
 }
 
 api.prototype.saveCamera = function(){
	vxl.c.camera.save();
 }
 
 api.prototype.retrieveCamera = function(){
	vxl.c.camera.retrieve();
 }
 
 api.prototype.setAzimuth = function(a){
	vxl.c.camera.changeAzimuth(a);
 }
 
 api.prototype.setElevation = function(e){
	vxl.c.camera.changeElevation(e);
 }
 
 api.prototype.go_above = function(){
	vxl.c.camera.above();
 }
 
 api.prototype.go_below = function(){
	vxl.c.camera.below();
 }
 
 api.prototype.go_left = function(){
	vxl.c.camera.left();
 }
 
 api.prototype.go_right = function(){
	vxl.c.camera.right();
 }
 
 api.prototype.getLookupTables = function(){
    return vxl.go.lookupTableManager.getAllLoaded();
 }
 
 //api.prototype.runScript = function(file){
 //use JQuery here.
 //}
 
 /**
  * Loads a program
  */
 api.prototype.loadProgram = function(code){
    vxl.c.view.renderer.setProgram(code.NAME,code);
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
/*
* Idea: to use a lightweight pattern. A pool of vxlModels that are reused. Every frame the information is copied to the buffers, instead of saving as many gl vbos as models
*/
/**
 * Provides frame-to-frame animation
 * 
 * @class
 */
function vxlAnimation(){
	
	this.timerID = 0;
	this.view = null;
	this.map = [];
	this.activeFrame = 1;
	this.mark = 1;
	this.running = false;
    this.frameCount = 0;
};

vxlAnimation.prototype.setup = function(vw,filelist,mtf){
	
	this.activeFrame = 1;
	this.view = vw;
	this.view.animation = this;
	for (var i=0; i<filelist.length; i++){
		this.addModelToFrame(filelist[i],mtf[i]);
	}
	//message('animation setup');
	
};

vxlAnimation.prototype.start = function(){
	if (!this.view){
		alert('animation not initiated to any view');
		return;
	}
    
    this.running = true;
	
	this.timerID = setInterval((function(self) {return function() {self.nextFrame();}})(this),500);

};

vxlAnimation.prototype.stop = function(){
	clearInterval(this.timerID);
    this.running = false;
};

vxlAnimation.prototype.addModelToFrame = function(modelName, frame){
	if (typeof(this.map[frame])=='undefined'){
		this.map[frame] = new Array();
	}
	this.map[frame].push(modelName);
    if (frame>this.frameCount) this.frameCount = frame;
};

vxlAnimation.prototype.render = function(){
	if (!this.running) return;
	
	for (var i=0; i<this.map[this.activeFrame].length; i++){
		var modelName = this.map[this.activeFrame][i];
		var actor = this.view.actorManager.getActorByName(modelName);
		if (actor != null){
			actor.allocate(this.view.renderer);
			actor.render(this.view.renderer);
			//actor.deallocate(); hypothesis. it removes the reference but it does not remove the buffer from ctx
		}
	}
	
	
	/*if (this.activeFrame == this.mark){
		var prv = this.getPreviousFrames(2);
		var nxt = this.getNextFrames(2);
	
		for (var i=0; i<2; i++){
			//this.allocateFrame(nxt[i]);
			this.deallocateFrame(prv[i]);
		}
		this.mark = nxt[1]; // whenever we reach the mark, slide the window.
	}*/
};

vxlAnimation.prototype.isValidFrame = function(f){
 return (f>=1 && f<= this.frameCount);
};

vxlAnimation.prototype.allocateFrame = function(f){
	if (!this.isValidFrame(f)) return; //fail quick and safe
	for (var i=0; i<this.map[f].length; i++){
		var modelName = this.map[f][i];
		var actor = this.view.actorManager.getActorByName(modelName);
		if (actor != null){
			actor.allocate(this.view);
		}
	}
	
};

vxlAnimation.prototype.deallocateFrame = function(f){
	if(!this.isValidFrame(f)) return; //fail quick and safe
	for (var i=0; i<this.map[f].length; i++){
		var modelName = this.map[f][i];
		var actor = this.view.actorManager.getActorByName(modelName);
		if (actor != null){
			actor.deallocate();
		}
	}
};


vxlAnimation.prototype.nextFrame = function(){
	////message('next frame:' + vxl.c.animation.activeFrame);
	if (vxl.c.animation.activeFrame < this.frameCount){
		vxl.c.animation.activeFrame++;
	}
	else{
		vxl.c.animation.activeFrame = 1;
	}
};

vxlAnimation.prototype.getNextFrames = function(n){
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
	//message('next frames: ' + list);
	return list;
};

vxlAnimation.prototype.getPreviousFrames = function(n){
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
	//message('previous frames: ' + list);
	return list;
};

vxlAnimation.prototype.setFrame = function (f){
	if (f>=1 && f <= this.frameCount){
		vxl.c.animation.activeFrame = f;
		this.render();
	}
};

function vxlMain(){
    
    
    vxl.go.gui.doBinding();

	var v = new vxlView("vxl-id-canvas");
	v.init();
	v.start();
    
  }
  