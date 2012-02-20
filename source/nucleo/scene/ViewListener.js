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
 */
function vxlViewListener(vw){
	this.view = vw;
	this.interactor = new vxlTrackballCameraInteractor();
	this.picker = new vxlPickerInteractor();
	this.update();
};

vxlViewListener.prototype.setInteractor = function(i){
	this.interactor = i;
	this.update();
};


vxlViewListener.prototype.update = function(){
	var self = this;
	var canvas = this.view.canvas;
	
	var camera = this.view.cameraman.active;
	var interactor = this.interactor;
	
	interactor.connectTo(camera);

	canvas.onmousedown = function(ev) {
		interactor.onMouseDown(ev);
    };

    canvas.onmouseup = function(ev) {
		interactor.onMouseUp(ev);
    };
	
	canvas.onmousemove = function(ev) {
		interactor.onMouseMove(ev);
    };
	
	window.onkeydown = function(ev){
		interactor.onKeyDown(ev);
	};
	
	window.onkeyup = function(ev){
		interactor.onKeyUp(ev);
	};
};
