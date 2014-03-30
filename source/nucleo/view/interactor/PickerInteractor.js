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

vxlPickerInteractor.prototype = new vxlViewInteractor();
vxlPickerInteractor.prototype.constructor = vxlPickerInteractor;
/**
 * @class 
 * Interactor that implements a picking mechanism. Implemented in 0.89.1
 * @constructor   
 * @param {Object} view the view this interactor will observe
 * @param {Object} camera the camera this interactor will master
 * @author Diego Cantor
 */
function vxlPickerInteractor(){
	vxlViewInteractor.call(this);
	this._drag = false;
	this.timerID = -1;
	this.list = [];
	this.rate = 50;

};


vxlPickerInteractor.prototype.getType = function(){
    return "vxlPickerInteractor";
};

vxlPickerInteractor.prototype.get2DCoords = function(ev){
    var x, y, top = 0, left = 0, obj = this.view.canvas;
    var rect = obj.getBoundingClientRect();
     
    // return relative mouse position
    x = ev.clientX - rect.left;
    y = vxl.c.view.canvas.height - (ev.clientY - rect.top); 
                                       //this variable contains the height of the canvas and it updates dynamically
                                       //as we resize the browser window.
    //console.info('x='+x+', y='+y);
    return [x,y];
    
};


/**
 *  Reacts to the onmouse up event on the canvas
 * @param {Object} ev
 */
vxlPickerInteractor.prototype.onMouseUp   = function(ev){
    this._drag = false;
    if (this.timerID != -1){
        clearInterval(this.timerID);
    }
    
    
};

/**
 * Reacts to the onmouse event on the canvas 
 * @param {Object} ev mouse event
 */
vxlPickerInteractor.prototype.onMouseDown = function(ev){ 
    ev.preventDefault();
    this.view.canvas.style.cursor = 'crosshair'
    this.list.push(this.get2DCoords(ev));
    this._doWork();   
    this._drag = true;
    
    if (this.timerID != -1){
        clearInterval(this.timerID);
    }
    this.timerID = setInterval((function(self) {return function() {self._doWork();}})(this),this.rate); 
};

/**
 * Reacts to the onmouse move event on the canvas  
 * @param {Object} ev
 */
vxlPickerInteractor.prototype.onMouseMove = function(ev){ 
    ev.preventDefault();
    if (this._drag){
        this.list.push(this.get2DCoords(ev));
    }
};

vxlPickerInteractor.prototype._doWork = function(){
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
        
        if (actor != null && actor.isPickable() && actor._pickingCallback != undefined){
            actor._pickingCallback(actor, results.uid);
        }
  }
};


vxlPickerInteractor.prototype.onKeyDown       = function(ev){};
vxlPickerInteractor.prototype.onKeyUp         = function(ev){};
vxlPickerInteractor.prototype.onDragOver      = function(ev){ };
vxlPickerInteractor.prototype.onDragLeave     = function(ev){};
vxlPickerInteractor.prototype.onDrop          = function(ev){};
vxlViewInteractor.prototype.onDoubleClick     = function(ev){};

