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
 * Models are totally independent of views and of the rendering process
 * @class Represents a geometric object. A model is represented by an actor in a scene.
 * @constructor
 * @param {String} name the name for this model
 * @param {Object} JSON_OBJECT the JSON Object that defines this model (Optional)
 * @see vxlModel#load
 * @author Diego Cantor
 */
function vxlModel(name, JSON_OBJECT){
	this.name       = name;
	this.indices 	= [];
	this.vertices 	= [];
	this.scalars 	= undefined;
	this.diffuse	= undefined;
	this.ambient    = undefined;
	this.specular   = undefined;
	this.shininness = undefined;
	this.normals 	= undefined;
	this.wireframe 	= undefined;
	this.bb         = [0,0,0,0,0,0];
    this.centre     = [0,0,0,0,0,0];
	this.mode       = vxl.def.actor.mode.SOLID
	this.image      = undefined;
	this.uri        = undefined;
	this.colors     = undefined;
	this.type       = vxl.def.model.type.SIMPLE;
	this.renderable = undefined;
   
    if (JSON_OBJECT != undefined){
        this.load(this.name, JSON_OBJECT);
    }
    
    this.setType(this.type);
};

/**
 * Sets the type of model. A renderable object is created and associated
 * with this model in case the type is MESH or BIG_DATA
 * 
 * @param {vxl.def.model.type} type the type of model
 */
vxlModel.prototype.setType = function(type){
    
    if (this.indices.length > vxl.def.model.MAX_NUM_INDICES && 
        type == vxl.def.model.type.BIG_DATA){
            throw('The model is not big enough to be of BIG_DATA type Num Indices['+this.indices.length+']');
        }
    
    
    switch(type){
        case vxl.def.model.type.MESH:
        case vxl.def.model.type.BIG_DATA:
             this.type = type;
             this.renderable = new vxlRenderable(this);
             break;
        case vxl.def.model.type.SIMPLE:
             this.type = type;
             this.renderable = undefined;
    }    
};

/**
 * Indices to draw the bounding box. The vertices in this case will correspond
 * to the actor bounding box calculation 
 * @static
 */
vxlModel.BB_INDICES = [0,1,1,2,2,3,3,0,0,4,4,5,5,6,6,7,7,4,1,5,2,6,3,7];


/**
 * Populates this model with the JSON_OBJECT (JSON object)
 * @param {String} nm the name given to this model
 * @param {Object} JSON_OBJECT the JSON object that describes the model
 */
vxlModel.prototype.load = function(nm,JSON_OBJECT){
	this.name		= nm.replace(/\.[^/.]+$/, "")
	if (JSON_OBJECT.name != null){ //if the name is defined in the JSON object, then use it
		this.name = JSON_OBJECT.name;
	}
	
	//Load all properties
	for(i in JSON_OBJECT){
		this[i] = JSON_OBJECT[i];
	}
	
	this.update();

};

/**
 * Update model state when the model has changed (changes in vertices or indices) 
 */
vxlModel.prototype.update = function(){
        //Now minimal checks
    if (this.vertices == undefined){
        alert('The model '+ this.name+' does not have vertices. Impossible to render!');
    }
    

    if(this.normals == undefined && this.indices != undefined){
        this.computeNormals();
    }
    
    
    
    if (this.wireframe == undefined){
        this.computeWireframeIndices();
    }
    
    if (this.mode == undefined){
        this.mode = vxl.def.actor.mode.SOLID;
    }
    
    if (this.texture != undefined){
        this.mode = vxl.def.actor.mode.TEXTURED;
    }
    
    this.computeBoundingBox();
    
    
    if (this.type == vxl.def.model.type.BIG_DATA ||
        this.type == vxl.def.model.type.MESH){
            this.renderable.update();
        }
    
};

/**
 * Calculates the normals for this model in case that the JSON object does not include them
 * 
 * 
 */
vxlModel.prototype.computeNormals = function(){
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
 * Flips the normals 
 */
vxlModel.prototype.flipNormals = function(){
    var ns = this.normals;
    
    if (ns == undefined) return; //no normals
    
    for (var i=0; i<ns.length; i+=1){
        ns[i] = -ns[i];
    }
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
    
    //This is the case with the scene toys
    if (this.vertices.length == 0){
        this.bb = [0,0,0,0,0,0];
        this.centre = [0,0,0,0,0,0];
        return;
    }
    
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
     //computes the centre 
    c[0] = (bbm[3] + bbm[0]) /2;
    c[1] = (bbm[4] + bbm[1]) /2;
    c[2] = (bbm[5] + bbm[2]) /2;
    
    
    this.bb = bbm;  
    this.centre = c;
};

/**
 *Returns the bounding box vertices. This method is used by the rendering engine 
 */
vxlModel.prototype.getBoundingBoxVertices = function(){
    var b = this.bb;
    return [
        b[0], b[1], b[2],
        b[0], b[4], b[2],
        b[3], b[4], b[2],
        b[3], b[1], b[2],
        b[0], b[1], b[5],
        b[0], b[4], b[5],
        b[3], b[4], b[5],
        b[3], b[1], b[5] 
        ];
};

