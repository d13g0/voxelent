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
function vxlAxis() {

	this.visible = false;
	
	this.axisPositionBuffer = null;
	this.axisIndexBuffer = null;
	this.axisColorBuffer = null;
	
	
	this.gl_allocation = false;
	this.ver = [	-1, 0, 0, 	 1, 0, 0, 	 0,-2, 0,	 0, 2, 0,	 0, 0,-1,	 0, 0, 1	];
	this.ind = [ 	0, 1, 	2, 3, 	4, 5	];
	this.col = [	1, 1, 0 ,1,	  1, 1, 0 ,1,	0, 1 ,0 ,1,	 0, 1 ,0 ,1,  0, 0, 1 ,1,	 0, 0, 1 ,1	];
	this.centre = [0,0,0];
}

	vxlAxis.prototype.setVisible = function(v){
		this.visible = v;
	}

	vxlAxis.prototype.isVisible = function(){
		return this.visible;
	}
	
	vxlAxis.prototype.setCentre = function (ctr){
	    var x = ctr[0];
		var y = ctr[1];
		var z = ctr[2];
		
		this.centre[0] = x;
		this.centre[1] = y;
		this.centre[2] = z;
		
		this.ver[0] = x-1;
		this.ver[1] = y;
		this.ver[2] = z;
		
		this.ver[3] = x+1;
		this.ver[4] = y;
		this.ver[5] = z;
		
		this.ver[6] = x;
		this.ver[7] = y-2;
		this.ver[8] = z;
		
		this.ver[9] = x;
		this.ver[10] = y+2;
		this.ver[11] = z;
		
		this.ver[12] = x;
		this.ver[13] = y;
		this.ver[14] = z-1;
		
		this.ver[15] = x;
		this.ver[16] = y;
		this.ver[17] = z+1;
		
	}

	vxlAxis.prototype.allocate = function(renderer){
		var gl = renderer.gl;
		this.axisPositionBuffer = gl.createBuffer();
		this.axisIndexBuffer = gl.createBuffer();
		this.axisColorBuffer = gl.createBuffer();
		this.gl_allocation = true;
	}

	vxlAxis.prototype.render = function(renderer){
		
		if(!this.gl_allocation) return;
		if(this.ver.length == 0) return;
		if (!this.visible) return;
		
		var prg = renderer.prg;
		var gl = renderer.gl;
		

	    try{
			//1. Set shading parameters
			prg.enableVertexAttribArray("aVertexPosition",true);
			prg.enableVertexAttribArray("aVertexColor",true);
			prg.setUniform("uOpacity",1.0);
			prg.setUniform("uUseShading", false);
			prg.setUniform("uUseVertexColors", true);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.axisPositionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.ver), gl.STATIC_DRAW);
			prg.setVertexAttribPointer("aVertexPosition", 3, gl.FLOAT, false,0,0);
				
			gl.bindBuffer(gl.ARRAY_BUFFER, this.axisColorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.col), gl.STATIC_DRAW);
			prg.setVertexAttribPointer("aVertexColor", 4, gl.FLOAT, false,0,0);
				
				
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.axisIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.ind), gl.STATIC_DRAW);
			gl.drawElements(gl.LINES, this.ind.length, gl.UNSIGNED_SHORT,0);
		}
		catch(err){
			alert('vxlAxis.draw:' +err);
			message(err.description);
		}
	}

	
