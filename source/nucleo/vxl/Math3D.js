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


