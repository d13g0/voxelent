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
* @param {String} canvas_id this corresponds id of the canvas in the DOM tree. That's all we need to setup a vxlView for you
* @author Diego Cantor
*/

function vxlView(canvas_id){
	
	this.id = 0;
	this.renderer = null;
	this.canvas = null;
	this.canvasName = canvas_id;
	this.canvasListener = null;
	this.interactor = null;
	this.animation = null;
	
	this.scene = new vxlScene(this);
	this.axis = new vxlAxis(this);
	
    this.boundingBox = new vxlBoundingBox(this);
	this.camera = new vxlCamera(this);

	this.ready = false;
	this.width = 0;
	this.height = 0;
	this.clearDepth = 10000;
	this.zNear = 0.1;
	this.zFar = 10000;
	this.fovy = 10;
	this.bgColor = vxl.def.backgroundColor.slice(0);
	this.ambientColor = vxl.def.ambientColor.slice(0);
	
	this.init();
	
	vxl.go.notifier.addTarget('vxl.event.default_lut_loaded',this);
	vxl.go.notifier.addTarget('vxl.event.globals_updated', this);
	
	if (vxl.c.view == null) vxl.c.view = this;
	
	vxl.go.views.push(this);
	this.id = vxl.go.views.length -1;
}
/**
 * Handles the events to which a view is subscribed in Voxelent's Nucleo
 * @param {String} event the name of the event
 * @param {Object} source the origin of the event. Useful to do callbacks if necessary
 */
vxlView.prototype.handleEvent = function(event, source){
	message('vxlView: receiving event '+event);
	if (event == 'vxl.event.default_lut_loaded'){
		
		this.actorManager.setLookupTable(vxl.def.lut);
	}
	if (event == 'vxl.event.globals_updated'){
		this.camera.longShot();	
	}
}

/**
 * Queries the DOM to obtain a reference to the canvas that this view will be associated with
 */
vxlView.prototype.initDOMCanvas = function(){
	this.canvas = document.getElementById(this.canvasName);

	if (this.canvas == null){
		alert('The canvas ' + domCanvasName+ ' does not exist.');
		throw('The canvas ' + domCanvasName+ ' does not exist.');
	}
	
	this.resize();
}

/**
 * Creates the view's renderer object and sets the default's background color.
 */
vxlView.prototype.initRenderer = function(){
	this.renderer = new vxlRenderer(this);
	this.setBackgroundColor(this.bgColor);
	this.setClearDepth(this.clearDepth);
}

/**
 * Initializes auxiliary objects:
 * bounding box, axis, interactor, canvas listener, camera interactor and camera
 * @TODO do a better job here: bounding box and axis should belong to the scene not to the view
 */
vxlView.prototype.initAuxObjects = function(){
	
	this.boundingBox.allocate(this.renderer);
	this.boundingBox.visible = false;
	
	this.axis.allocate(this.renderer);
	this.axis.setVisible(true);//(vxl.go.axisOn);
	
	this.interactor = new vxlTrackballCameraInteractor(this.camera);
	this.canvasListener = new vxlCanvasListener(this.canvas, this.interactor);
	
	this.camera.init();
	vxl.c.camera = this.camera; //@TODO: REVIEW
}	

/**
 * Procedure to initialize the view and its dependent objects
 */
vxlView.prototype.init = function(){
	this.initDOMCanvas();
	this.initRenderer();
	this.initAuxObjects();
	this.ready = true;
}

/**
 * Clears the scene. Delegates this task to the renderer.
 */
vxlView.prototype.clear = function(){
	this.renderer.clear();
}


/**
 * Update the width and height of this view with the width and height of the canvas.
 * @TODO: review the jquery binding that calls this function
 */
vxlView.prototype.resize = function(){

	//THE FOLLWING LINE IS CONSIDERED HARD-CODE. REVIEW.
	//var cont = document.getElementById("vxl-id-view"); //pointing to the DIV whose parent is a TD
	
	/*if ((this.canvas.width != cont.clientWidth)||(this.canvas.height != cont.clientHeight)) {
		this.canvas.width=cont.clientWidth;
		this.canvas.height=cont.clientHeight;
		$('#vxl-id-canvas').width(this.canvas.width);
		$('#vxl-id-canvas').height(this.canvas.height);
		message('resized to ' + this.canvas.width + 'x' + this.canvas.height);
	}*/
	
	this.width = this.canvas.width;
	this.height = this.canvas.height;
}

/** 
* Prepares the view for rendering
* @TODO: Frown :-/ This method is a callback from the Renderer
*/
vxlView.prototype.prepareForRendering = function(){
	if (!this.ready) return; //not ready yet?
	this.resize();
	this.clear();
	this.boundingBox.setBoundingBox(vxl.go.boundingBox);
	this.axis.setCentre(vxl.go.centre);
}

/**
 * Starts the view
 */
vxlView.prototype.start = function(){
	this.renderer.start();
	this.refresh();
}

/**
 * Stops the view
 */
vxlView.prototype.stop = function(){
	this.renderer.stop();
}

/**
 * Resets the vew
 */
vxlView.prototype.reset = function(){
	this.stop();
	this.actorManager.reset();
	this.camera.reset();
	this.start();
}

/**
 * Sets the background color. Delegated to the renderer
 * @param {Array} v the new color given as an array of three numbers
 * @see vxlRenderer#clearColor
 */
vxlView.prototype.setBackgroundColor = function(v){
	this.bgColor = v.slice(0);
	this.renderer.clearColor(this.bgColor);
}
/**
 * Sets the ambient color
 * @param {Array} v the new ambient color given as an array of three numbers
 * 
 */
vxlView.prototype.setAmbientColor = function(v){
	this.ambientColor = v.slice(0);
	this.renderer.prg.setUniform("uAmbientColor", this.ambientColor);
}

/**
 * Sets the clear depth
 * @param {Number} d the new depth
 * @see vxlRenderer#clearDepth
 */
vxlView.prototype.setClearDepth = function(d){
	this.renderer.clearDepth(d)
}

/**
 * Refresh the view by invoking the rendering method on the renderer
 * @see vxlRenderer#render
 */
vxlView.prototype.refresh = function(){
	this.renderer.render();
}