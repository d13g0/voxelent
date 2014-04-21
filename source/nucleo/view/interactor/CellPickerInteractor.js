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

vxlCellPickerInteractor.prototype = new vxlViewInteractor();
vxlCellPickerInteractor.prototype.constructor = vxlCellPickerInteractor;
/**
 * @class 
 * Interactor that implements a picking mechanism. Implemented in 0.89.1
 * @constructor   
 * @param {Object} view the view this interactor will observe
 * @param {Object} camera the camera this interactor will master
 * @author Diego Cantor
 */
function vxlCellPickerInteractor(){
    vxlTrackerInteractor.call(this);
    this.timerID = -1;
    this.list = [];
    this.rate = 5;

};


vxlCellPickerInteractor.prototype.getType = function(){
    return "vxlCellPickerInteractor";
};

vxlCellPickerInteractor.prototype.get2DCoords = function(ev){
    var x, y, top = 0, left = 0, obj = this.view.canvas;
    var rect = obj.getBoundingClientRect();
    x = ev.clientX - rect.left;
    y = vxl.c.view.canvas.height - (ev.clientY - rect.top); 
    return [x,y];
};


/**
 *  Reacts to the onmouse up event on the canvas
 * @param {Object} ev
 */
vxlCellPickerInteractor.prototype.onMouseUp   = function(ev){
    vxlTrackerInteractor.prototype.onMouseUp.call(this,ev);
    this.view.canvas.style.cursor = 'default';
    if (this.timerID != -1){
        clearInterval(this.timerID);
    }
};

/**
 * Reacts to the onmouse event on the canvas 
 * @param {Object} ev mouse event
 */
vxlCellPickerInteractor.prototype.onMouseDown = function(ev){ 
    vxlTrackerInteractor.prototype.onMouseDown.call(this,ev);
    ev.preventDefault();
    this.view.canvas.style.cursor = 'crosshair';
    this.list.push(this.get2DCoords(ev));
    this._doWork();   
    
    
    if (this.timerID != -1){
        clearInterval(this.timerID);
    }
    this.timerID = setInterval((function(self) {return function() {self._doWork();}})(this),this.rate); 
};

/**
 * Reacts to the onmouse move event on the canvas  
 * @param {Object} ev
 */
vxlCellPickerInteractor.prototype.onMouseMove = function(ev){ 
    ev.preventDefault();
    if (this._dragging){
        this.list.push(this.get2DCoords(ev));
    }
};

vxlCellPickerInteractor.prototype._doWork = function(){
  var i        = this.list.length;
  var renderer = this.view.renderer;
  var scene    = this.view.scene;  
  while(i--){
        var coords = this.list.pop();
        var color  = renderer.readOffscreenPixel(coords[0], coords[1]);

        if (color[0] == 0 && color[1] == 0 && color[2] == 0 && color[3] ==0){
            continue;
        }
        
        var results = vxl.go.picker.query(color);
        
        if (results == null) continue;
        
        var actor  = scene.getActorByCellUID(results.uid);
        
        if (actor == null) { //try object UID
            actor = scene.getActorByUID(results.uid);
        }
        
        if (actor != null && actor.isPickable() && actor._pick_callback != undefined){
            actor._pick_callback(actor, results.uid);
        }
  }
};


vxlCellPickerInteractor.prototype.onKeyDown       = function(ev){};
vxlCellPickerInteractor.prototype.onKeyUp         = function(ev){};
vxlCellPickerInteractor.prototype.onDragOver      = function(ev){ };
vxlCellPickerInteractor.prototype.onDragLeave     = function(ev){};
vxlCellPickerInteractor.prototype.onDrop          = function(ev){};
vxlCellPickerInteractor.prototype.onDoubleClick     = function(ev){};