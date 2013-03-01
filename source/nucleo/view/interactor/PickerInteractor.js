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
    return {x:x,y:y};
};


/**
 *  Reacts to the onmouse up event on the canvas
 * @param {Object} ev
 */
vxlPickerInteractor.prototype.onMouseUp   = function(ev){
    
    var rt     = this.view.renderer._renderTarget;
    var coords = this.get2DCoords(ev);
    var color  = rt.readPixel(coords);
    
    
    var results = vxl.go.picker.query(color);
    
    if (results == null) return;
    
    var actor  = this.view.scene.getActorByCellUID(results.uid);
    
    if (actor == null) { //try object UID
        actor = this.view.scene.getActorByUID(results.uid);
    }
    
    if (actor != null){
        //console.info('vxlPickerInteractor: actor ['+actor.name+'] has been picked');
       
        if (actor.isPickable() && actor._pickingCallback != undefined){
            actor._pickingCallback(actor, results.uid);
        }
    }
};

/**
 * Reacts to the onmouse event on the canvas 
 * @param {Object} ev mouse event
 */
vxlPickerInteractor.prototype.onMouseDown = function(ev){ 
    
};

/**
 * Reacts to the onmouse move event on the canvas  
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onMouseMove = function(ev){ 

};

/**
 * Reacts to the key down event 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onKeyDown   = function(ev){
    
};

/**
 * Abstract method to be implemented by the descendants 
 * @param {Object} ev
 */
vxlViewInteractor.prototype.onKeyUp     = function(ev){ 

};


