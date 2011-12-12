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

function vxlActor(model){
  
  this.matrix = new vxlMatrix4x4();
  this.model = model;
  this.name = model.name;
  
  this.gl_vertices_buffer = null;
  this.gl_normals_buffer = null;
  this.gl_colors_buffer = null;
  this.gl_indices_buffer = null;
  this.gl_wireframe_buffer = null;
  this.gl_allocation = false;
  
  this.visualizationMode = vxl.def.visMode.SOLID;
  this.opacity = 1.0;
  this.color = model.color;
  this.colors = null;
  
};

vxlActor.prototype.setColor = function (c){
	this.color = c.slice(0);
	message('Actor '+this.name+': color changed to : (' + this.color[0] +','+ this.color[1] +','+ this.color[2]+')');
};

vxlActor.prototype.setLookupTable = function(lutID,min,max){
	if (this.model.scalars){
		var lut = vxl.go.lookupTableManager.get(lutID);
		this.colors  = lut.getColors(this.model.scalars,min,max);
	}
};

vxlActor.prototype.setVisualizationMode = function(mode){
	this.visualizationMode = mode;
};

vxlActor.prototype.allocate = function(renderer){
	
	if (this.gl_allocation) return; // if we need realocation create method reallocate to force it.
	
	//as we don't expect changes we set the buffers' data here.
   //OTHERWISE it should be done in the draw method as it is don with the axis and the bounding box
   
	var gl = renderer.gl;
	var model = this.model;
	
	this.gl_vertices_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_vertices_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	
	this.gl_normals_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_normals_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
	
	if (model.scalars){
		this.gl_colors_buffer = gl.createBuffer(); //we don't BIND values or use the buffer until the lut is loaded and available
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	this.gl_indices_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_indices_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
	
	this.gl_wireframe_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_wireframe_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.wireframe), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	this.gl_allocation = true;
};

vxlActor.prototype.deallocate = function(){
  this.gl_vertices_buffer = null;
  this.gl_normals_buffer = null;
  this.gl_colors_buffer = null;
  this.gl_indices_buffer = null;
  this.gl_wireframe_buffer = null;
  this.gl_allocation = false;
};

vxlActor.prototype.render = function(renderer){
	
	if (!this.gl_allocation){ //lazy allocation
		return;
	}
	
	var model = this.model;
	
    //@The actor is a good renderer friend. It borrows its gl and prg objects to do its own rendering.
	var gl = renderer.gl;
	var prg = renderer.prg;

	 try{
		
		shader.enableVertexAttribArray("aVertexPosition");
		shader.disableVertexAttribArray("aVertexColor");
		prg.setUniform("uOpacity",this.opacity);
		prg.setUniform("uObjectColor",this.color);
		prg.setUniform("uUseVertexColors", false);
		
		
		if (this.colors != null){
			shader.setUniform1i("uUseVertexColors", true);
			shader.enableVertexAttribArray("aVertexColor");
			gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_colors_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
			prg.setVertexAttribPointer("aVertexColor", 4, gl.FLOAT, false, 0, 0);
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_vertices_buffer);
		prg.setVertexAttribPointer("aVertexPosition", 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_normals_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
		prg.setVertexAttribPointer("aVertexNormal",3,gl.FLOAT, false, 0,0);
		
		
		if (this.visualizationMode == vxl.def.visMode.SOLID){
			prg.setUniform1i("uUseShading",true);
			prg.enableVertexAttribArray("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_indices_buffer);
			gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.visualizationMode == vxl.def.visMode.WIREFRAME){
			prg.setUniform1i("uUseShading", false);
			prg.disableVertexAttribArray("aVertexNormal");
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_wireframe_buffer);
			gl.drawElements(gl.LINES, model.wireframe.length, gl.UNSIGNED_SHORT,0);
		}
		else if (this.visualizationMode == vxl.def.visMode.POINTS){
			prg.setUniform1i("uUseShading", true);
			prg.enableVertexAttribArray("aVertexNormal");
			gl.drawArrays(gl.POINTS,0, this.model.vertices.length/3);
		}
		else{
			alert('visualization mode: '+this.visualizationMode+' not defined for actor '+this.name);
		}
}
	catch(err){
		alert('vxlActor.draw ['+this.name+'] error =' +err);
		message(err.description);
	}
}

vxlActor.prototype.renderForPicking = function(renderer,i){
	
	if (!this.gl_allocation){ //lazy allocation
		return;
	}
	
	var model = this.model;
		
	var gl = renderer.gl;
	var prg = renderer.prg;
	
	try{
		
		prg.enableVertexAttribArray("aVertexPosition");
		prg.disableVertexAttribArray("aVertexColor");
		prg.disableVertexAttribArray("aVertexNormal");
		prg.setUniform1f("uOpacity",1.0);
		prg.setUniform3f("uObjectColor", 0,0,i/256);
		prg.setUniform1i("uUseVertexColors", false);
		prg.setUniform1i("uUseShading",false);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_vertices_buffer);
		prg.setVertexAttribPointer("aVertexPosition", 3, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_indices_buffer);
		gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		
		
	}
	catch(err){
		alert('vxlActor.draw ['+this.name+'] error =' +err);
		message(err.description);
	}
}
