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

vxlPickerInteractor.prototype = new vxlTrackerInteractor();
vxlPickerInteractor.prototype.constructor = vxlPickerInteractor;
/**
 * @class 
 * Interactor that implements a picking mechanism. Still in development.
 * @constructor   
 * @param {Object} view the view this interactor will observe
 * @param {Object} camera the camera this interactor will master
 * @author Diego Cantor
 */
function vxlPickerInteractor(view, camera){
	vxlTrackerInteractor.call(this, view, camera);
	this.plist 					= [];
	this.texture 				= null;
	this.framebuffer 			= null;
	this.renderbuffer 			= null;
	this.hitPropertyCallback 	= null;
	this.processHitsCallback 	= null;
	this.addHitCallback 		= null;
	this.removeHitCallback 		= null;
	this.moveCallback 			= null;
	this.picking 				= false;
    this.connectCamera(camera);
};

vxlPickerInteractor.prototype.connectCamera = function(camera){
	vxlViewInteractor.prototype.connectCamera.apply(this, camera);
	if (this.camera){
		this.configure();
	}
};

vxlPickerInteractor.prototype.configure = function(){
	
	var gl = this.camera.view.renderer.gl;
	
	var width = 512*4; //@TODO get size from this.camera.view.canvas
	var height = 512*4;
	
	//1. Init Picking Texture
	this.texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	//2. Init Render Buffer
	this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	
    
    //3. Init Frame Buffer
    this.framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
	

	//4. Clean up
	gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    //5. Assign random colors to object in current scene
    //for(var i=0, max = this.view.scene._actors.length; i<max; i+=1){
    	//this
   // }
};


vxlPickerInteractor.prototype.get2DCoords = function(ev){
	var x, y, top = 0, left = 0, obj = this.camera.view.canvas;

	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}
    
    left += window.pageXOffset;
    top  += window.pageYOffset;
 
	// return relative mouse position
	x = ev.clientX - left;
	y = c_height - (ev.clientY - top); //c_height is a global variable that we maintain in codeview.js
                                       //this variable contains the height of the canvas and it updates dynamically
                                       //as we resize the browser window.
	
	return {x:x,y:y};
};

vxlPickerInteractor.prototype._compare = function(readout, color){
    vxl.go.console('PickerInteractor: comparing object '+object.alias+' diffuse ('+Math.round(color[0]*255)+','+Math.round(color[1]*255)+','+Math.round(color[2]*255)+') == readout ('+ readout[0]+','+ readout[1]+','+ readout[2]+')');
    return (Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 &&
			Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && 
			Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
};

vxlPickerInteractor.prototype.find = function(coords){
	
	var gl = this.camera.view.renderer.gl;
	//read one pixel
	var readout = new Uint8Array(1 * 1 * 4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.readPixels(coords.x,coords.y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,readout);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var found = false;
    var scene = this.view.scene;
    if (this.hitPropertyCallback == undefined) {alert('The picker needs an object property to perform the comparison'); return;}

    for(var i = 0, max = scene._actors.length; i < max; i+=1){
        var ob = scene._actors[i];
        if (ob.name == 'floor') continue;
                
        var property  = this.hitPropertyCallback(ob);
    
        if (this._compare(readout, property)){
            var idx  = this.plist.indexOf(ob);
            if (idx != -1){
                this.plist.splice(idx,1);
                if (this.removeHitCallback){
                    this.removeHitCallback(ob); 
                }
            }
            else {
                this.plist.push(ob);
                if (this.addHitCallback){
                    this.addHitCallback(ob); 
                }
            }
            found = true;
            break;
        }
    }
    draw();
    return found;
};

vxlPickerInteractor.prototype.stop = function(){
    if (this.processHitsCallback != null && this.plist.length > 0){
        this.processHitsCallback(this.plist);
    }
    this.plist = [];
};

vxlPickerInteractor.prototype.onMouseUp = function(ev){
	if(!ev.shiftKey){
		this.stop();
	}
};

vxlPickerInteractor.prototype.onMouseDown = function(ev){
	var coords = this.get2DCoords(ev);
	this.picking = this.find(coords);
	if(!this.picking){
		this.stop();
	}
};

vxlPickerInteractor.prototype.onMouseMove = function(ev){
	this.lastX = this.x;
	this.lastY = this.y;
	this.x = ev.clientX;
	this.y = ev.clientY;
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
	if(this.picking && this.moveCallback){
		this.moveCallback(this, dx,dy);
	}
};

vxlPickerInteractor.prototype.onKeyDown = function(ev){
	//@TODO: ENTER AND EXIT PICKING MODE MANUALLY
	//this.view.listener.setInteractor(previous)
};

vxlPickerInteractor.prototype.onKeyUp = function(ev){
	
};

