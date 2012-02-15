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



