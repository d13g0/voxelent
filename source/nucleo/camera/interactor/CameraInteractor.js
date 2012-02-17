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

function vxlCameraInteractor(){
	this.camera = null;
}


vxlCameraInteractor.prototype.connectTo = function(c){
	if (c != null){
		if (c instanceof vxlCamera){
			this.camera = c;
			this.camera.interactor = this;
		}
		else {
			throw(' The object '+c+' is not a valid camera');
		}
	}
}

vxlCameraInteractor.prototype.onMouseUp   = function(ev){ alert('implement onMouseUp');}
vxlCameraInteractor.prototype.onMouseDown = function(ev){ alert('implement onMouseDown');}
vxlCameraInteractor.prototype.onMouseMove = function(ev){ alert('implement onMouseMove');}
vxlCameraInteractor.prototype.onKeyDown   = function(ev){ alert('implement onKeyDown');}
vxlCameraInteractor.prototype.onKeyUp     = function(ev){ alert('implement onKeyUp');}
