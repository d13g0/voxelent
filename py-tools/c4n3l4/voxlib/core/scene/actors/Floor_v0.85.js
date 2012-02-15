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
    this.witness	= true;
}

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
    this.model.indices = i.slice(0);
    this.visible = true;
}




