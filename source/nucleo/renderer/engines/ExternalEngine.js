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

vxlExternalEngine.prototype = new vxlEngine();
vxlExternalEngine.prototype.constructor = vxlExternalEngine;
/**
 * 
 * @param {Object} allocate
 * @param {Object} render
 * @param {Object} deallocate
 */
function vxlExternalEngine(renderer, allocate, render, deallocate){
    vxlEngine.call(this);
    this.renderer = renderer;
    this.allocateCallback = allocate;
    this.renderCallback = render;
    this.deallocateCallback = deallocate;
}


vxlExternalEngine.prototype.allocate = function(scene){
    this.allocateCallback(this.renderer, scene);
};


vxlExternalEngine.prototype.render = function(scene){
    this.renderCallback(this.renderer, scene);  
};

vxlExternalEngine.prototype.deallocate = function(scene){
    this.deallocateCallback(this.renderer, scene);  
};
