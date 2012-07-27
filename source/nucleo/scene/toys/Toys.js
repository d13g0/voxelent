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
 * @class Manages the axis, the bounding box and the floor
 * These are auxiliary objects or 'toys'
 */
function vxlSceneToys(scn){
    
    this.scene = scn;
    this.list   = [];

	this.axis 				= new vxlAxis();
	this.boundingbox 		= new vxlBoundingBox();
	this.floor  			= new vxlFloor();
	
	this.list.push(this.axis);
    this.list.push(this.boundingbox);
    this.list.push(this.floor);
};

/**
 * Updates the toys according to information from the scene
 * 
 */
vxlSceneToys.prototype.update = function(){
    this.axis.setCentre(this.scene.centre);
    this.boundingbox.setBoundingBox(this.scene.bb);
};

