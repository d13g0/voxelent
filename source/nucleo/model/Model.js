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
	this.diffuse	= null;
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
	//copy by reference (no slicing) as models are loaded once
	this.vertices 	= payload.vertices;
	this.indices 	= payload.indices;
	this.diffuse 	= payload.diffuse;
	this.scalars 	= payload.scalars;
	this.wireframe  = payload.wireframe;
	this.colors     = payload.colors;	

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


