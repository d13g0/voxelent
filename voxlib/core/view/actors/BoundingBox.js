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
vxlBoundingBox.js

*/

function vxlBoundingBox() {
	this.visible = false;
	this.vbo = null;
	this.ibo = null;
	this.gl_allocation = false;
	this.bb = [];
	this.ind = [0,1,1,2,2,3,3,0,0,7,7,4,4,3,4,5,5,2,1,6,6,5,6,7];
}	

	vxlBoundingBox.prototype.allocate = function(renderer){
		this.vbo = renderer.gl.createBuffer();
		this.ibo = renderer.gl.createBuffer();
		this.gl_allocation = true;
	}
	
	vxlBoundingBox.prototype.setBoundingBox = function(b){
		
		this.bb = [
		b[0], b[4], b[5],
		b[3], b[4], b[5], 	 	
		b[3], b[1], b[5], 	 
		b[0], b[1], b[5], 	 
		b[0], b[1], b[2], 	 
		b[3], b[1], b[2], 	 
		b[3], b[4], b[2], 	 
		b[0], b[4], b[2]
		];
	}

	vxlBoundingBox.prototype.render = function(renderer){


	    if(!this.gl_allocation) return;
		if(this.bb.length == 0) return;
		if (!this.visible) return;
		
		var prg = renderer.prg;
		var gl = renderer.gl;
		
		try{
			//1. Set shading parameters
			prg.setUniform("uOpacity",1.0);
			prg.setUniform("uUseShading", false);
			prg.setUniform("uUseVertexColors", false);
			prg.setUniform("uObjectColor",[1.0,1.0,1.0]);
			prg.enableVertexAttribArray("aVertexPosition");
			prg.disableVertexAttribArray("aVertexNormal");
			prg.disableVertexAttribArray("aVertexColor");
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bb), gl.STATIC_DRAW)
			prg.setVertexAttribPointer("aVertexPosition", 3, gl.FLOAT, false,0,0);
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.ind), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, this.ind.length, gl.UNSIGNED_SHORT,0);
		}
		catch(err){
			alert('vxlBoundingBox.draw:'+err);
			message(err.description);
		}
	}


