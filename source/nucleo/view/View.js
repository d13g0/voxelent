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
* Each HTML5 canvas is assigned a view object (vxlView) in Voxelent's Nucleo.
* 
* A vxlView provides the code to handle cameras, interaction and rendering capabilities, plus actor handling on the 
* HTML5 canvas that otherwise would need to be written over and over for each application
* if you were writing a WebGL app from scratch.
* Luckily this is not the case. You have the awesome vxlView who takes care of all these little details for you.
* @class
* @constructor
* @param {String} canvasID id of the canvas in the DOM tree. That's all we need to setup a vxlView for you
* @param {vxlScene} scene if this view is sharing a scene, this parameter corresponds to the scene being shared.
* @author Diego Cantor
*/

function vxlView(canvasID, scene){
	//View Identification
	//this.id = 0; //@TODO: Who handles this? Maybe one Scene has several Views?
	this.name = canvasID;
	this.canvas = document.getElementById(this.name);
	if (this.canvas == null){
		alert('View: the canvas ' + canvasID+ ' does not exist.');
		throw('View: the canvas ' + canvasID+ ' does not exist.');
	}
	

	this.width = this.canvas.width;
	this.height = this.canvas.height;
	
	this.clearDepth = 1.0;
	this.backgroundColor = vxl.def.view.background.slice(0);

	//Create Renderer
	this.renderer = new vxlRenderer(this);
	this.setBackgroundColor(this.backgroundColor);
	this.setClearDepth(this.clearDepth);
	
	//Create Camera Manager
	this.cameraman = new vxlCameraManager(this);
	
	//Create View Interactor
	this.interactor = new vxlTrackerInteractor(this);
	
	//Create Scene
	if (scene != null && scene instanceof vxlScene){
		this.scene = scene;
	}
	else if (vxl.c.scene != undefined){
		this.scene = vxl.c.scene;
	}
	else{
		this.scene = new vxlScene();
	
	}
	//Add this view to the scene;
	this.scene.views.push(this);
	
	
	//Namespace access updates
	

	vxl.go.notifier.addTarget(vxl.events.DEFAULT_LUT_LOADED,this);     //Register events to listen to
	
	if (vxl.c.view == undefined){
		vxl.c.view = this;
	}
	
	vxl.go.views.push(this);
	this.setAutoResize(true);

	vxl.go.console('View: the view '+ this.name+' has been created');
};


/**
 * Handles the events to which a view is subscribed in Voxelent's Nucleo
 * @param {String} event the name of the event
 * @param {Object} source the origin of the event. Useful to do callbacks if necessary
 */
vxlView.prototype.handleEvent = function(event, source){
	vxl.go.console('vxlView ['+this.name+']: receiving event '+event);
	if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.scene.setLookupTable(vxl.def.lut.main);
	}
};


/**
 * Clears the scene. Delegates this task to the renderer.
 */
vxlView.prototype.clear = function(){
	this.renderer.clear();
};

/**
 * Resizes the canvas so it fits its parent node in the DOM tree
 */
vxlView.prototype.resize = function(){
    var parent = this.canvas.parentNode;
    this.width = $(parent).width()-5;       //@TODO: Review this -5 business here.... March 12/2012
    this.height = $(parent).height()-5;
    $(this.canvas).attr('width', this.width);
    $(this.canvas).attr('height', this.height);
}

/**
 * Enables automatic resizing of the view when the browser window is resized
 * @param flag enbles automatic resizing if true, disables it if false
 */
vxlView.prototype.setAutoResize = function(flag){
    if (flag){
         this.resize(); //first time
        $(window).resize((function(self){return function(){self.resize();}})(this));
    }
    else{
        $(window).unbind('resize');
    }
}

/**
 * Starts the view
 */
vxlView.prototype.start = function(){
	this.renderer.start();
	this.refresh();
};

/**
 * Stops the view
 */
vxlView.prototype.stop = function(){
	this.renderer.stop();
};

/**
 * Resets the view
 */
vxlView.prototype.reset = function(){
	this.stop();
	this.scene.reset();
	this.cameraman.reset();
	this.start();
};

/**
 * Sets the background color. Delegated to the renderer
 * @param {Array} v the new color given as an array of three numbers
 * @see vxlRenderer#clearColor
 */
vxlView.prototype.setBackgroundColor = function(v){
	this.backgroundColor = v.slice(0);
	this.renderer.clearColor(this.backgroundColor);
};


/**
 * Sets the clear depth
 * @param {Number} d the new depth
 * @see vxlRenderer#clearDepth
 */
vxlView.prototype.setClearDepth = function(d){
	this.renderer.clearDepth(d);
};

/**
 * Refresh the view by invoking the rendering method on the renderer
 * @see vxlRenderer#render
 */
vxlView.prototype.refresh = function(){
	this.renderer.render();
};

/**
 * Uses the interactor passed as parameter to handle user gestures
 * @param {vxlViewInteractor} interactor an instance of a vxlViewInteractor
 * 
 */
 vxlView.prototype.setInteractor = function(i){
    this.interactor = i;
    this.interactor.connectView(this);
};

