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
 *  A rendering strategy allows decoupling rendering specific code (i.e. code that access and 
 * 	communicates with the program) from the scene.
 * 
 *  Any rendering strategy should extend from vxlRenderStrategy or one of its descendants
 */
function vxlRenderStrategy(renderer){
	this.renderer = renderer;
}


/**
 * @param {vxlScene} scene the scene to allocate memory for
 */
vxlRenderStrategy.prototype.allocate = function(scene){
	//DO NOTHING. THE DESCENDANTS WILL.
}


/**
 * @param {vxlScene} scene the scene to deallocate memory from
 */
vxlRenderStrategy.prototype.deallocate = function(scene){
	//DO NOTHING. THE DESCENDANTS WILL.
}

/**
 * @param {vxlScene} scene the scene to render
 */
vxlRenderStrategy.prototype.render = function(scene){
	//DO NOTHING. THE DESCENDANTS WILL.
}


