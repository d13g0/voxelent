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
 * 	communicates with the program) from the actor.
 * 
 *  Any rendering strategy should extend from vxlRenderStrategy or one of its descendants
 */
function vxlRenderStrategy(renderer){
	this.renderer = renderer;
}


/**
 * @param {vxlActor} actor the actor to allocate memory for
 */
vxlRenderStrategy.prototype.allocate = function(actor){
	//DO NOTHING. THE DESCENDANTS WILL.
}


/**
 * @param {vxlActor} actor the actor to deallocate memory from
 */
vxlRenderStrategy.prototype.deallocate = function(actor){
	//DO NOTHING. THE DESCENDANTS WILL.
}
/**
 * @param {vxlActor} actor	the actor to render
 */
vxlRenderStrategy.prototype.render = function(actor){
	//DO NOTHING. THE DESCENDANTS WILL.
}


