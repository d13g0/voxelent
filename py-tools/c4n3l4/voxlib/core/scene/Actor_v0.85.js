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
  	if (this.diffuse != null && this.diffuse.length == 3) this.diffuse.push(1.0);
  }
  
  
  this.buffer = {
    vertex:null, 
    normal:null,
    color:null,
    index:null
  }
  
  this.renderers = [];
  this.buffers = [];
  
  this.matrix = new vxlMatrix4x4();
  this.allocated = false;
  this.visible   = true;
  this.mode = vxl.def.actor.mode.SOLID;
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
   
   vxl.go.console('Actor: Allocating actor '+this.model.name+' for view '+ renderer.view.name)
   	
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
	
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
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
	prg.setUniform("uObjectColor",this.diffuse);
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
		if (this.mode == vxl.def.actor.mode.SOLID){
			prg.setUniform("uUseShading",true);
			prg.enableVertexAttribArray("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.actor.mode.WIREFRAME){
			prg.setUniform("uUseShading", false);
			prg.disableVertexAttribArray("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.index);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices.slice(0)), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.mode == vxl.def.actor.mode.POINTS){
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
* @param {vxl.def.actor.mode} mode mode needs to be one of the elments defined in vxl.def.actor.mode
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

