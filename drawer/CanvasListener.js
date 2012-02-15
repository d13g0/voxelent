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
function vxlCanvasListener(c, i){
	this.canvas = c;
	this.interactor = i;
	this.updateLinks();
}

vxlCanvasListener.prototype.changeInteractor = function(i){
	this.interactor = i;
	this.updateLinks();
}	


vxlCanvasListener.prototype.changeCanvas = function(c){
	this.canvas = c;
	this.updateLinks();
}

vxlCanvasListener.prototype.updateLinks = function(){
	var self = this;
	var canvas = this.canvas;
	

	canvas.onmousedown = function(ev) {
		self.interactor.onMouseDown(ev);
    };

    canvas.onmouseup = function(ev) {
		self.interactor.onMouseUp(ev);
    };
	
	canvas.onmousemove = function(ev) {
		self.interactor.onMouseMove(ev);
    };
	
	window.onkeydown = function(ev){
		self.interactor.onKeyDown(ev);
	}
	
	window.onkeyup = function(ev){
		self.interactor.onKeyUp(ev);
	}
}
