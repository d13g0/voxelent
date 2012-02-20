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
 * One of the main classes of Voxelent's Nucleo
 * A renderer object encapsulates most of the low level calls to WebGL.
 * It is here where Nucleo obtains a reference to the WebGL context.
 * 
 * It is also here here (and in the Actor class) where all the attributes and uniforms are passed
 * to the rendering program.
 * 
 * @class
 * @constructor
 * @author Diego Cantor
 */
function vxlRenderer(vw){
    
	this.renderRate = vxl.def.renderer.rate.NORMAL;
	this.mode       = vxl.def.renderer.mode.TIMER;
    this.timerID    = 0;
    
    this.view       = vw;
    
    this.gl         = this.getWebGLContext();
    this.prg        =   new vxlProgram(this.gl);
     
    this.transforms = new vxlTransforms(vw);
    
    this.setDefaultProgram();
}

/**
 * Tries to obtain a WebGL context from the canvas associated with the view to which this
 * renderer belongs to.
 * @TODO: Review depth test and blending functions maybe these should be configurable.
 */
vxlRenderer.prototype.getWebGLContext = function(){
	
	var WEB_GL_CONTEXT = null;
	var canvas = this.view.canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
	for (var i = 0; i < names.length; ++i) {
		try {
			WEB_GL_CONTEXT = canvas.getContext(names[i]);
		} 
		catch(e) {}
		if (WEB_GL_CONTEXT) {
			break;
		}
	}
	if (WEB_GL_CONTEXT == null) {
		alert("Could not intiailise WebGL");
		throw("Could not initialise WebGL"); 
		return;
	}
	else {
		var _gl = WEB_GL_CONTEXT;
		_gl.enable(_gl.DEPTH_TEST);
		_gl.enable(_gl.BLEND);
		_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
		_gl.depthFunc(_gl.LESS);
	}
    return WEB_GL_CONTEXT;
};

/**
 * Sets the program 'diffusive' as the program by default to be used by this renderer
 */
vxlRenderer.prototype.setDefaultProgram = function(){
    this.setProgram(vxl.def.glsl.diffusive);
};

/**
 * Tries to add a new program definition to this renderer
 * @param {Object} program definition. See the diffuse and phong examples below.
 * @see {vxl.def.glsl.phong}
 * @see {vxl.def.glsl.diffuse}
 */
vxlRenderer.prototype.setProgram = function(glslObject){
	var prg = this.prg;

	if (!prg.isRegistered(glslObject.ID)){
		prg.register(glslObject);
	}
	
	if (!prg.isLoaded(glslObject.ID)){
		prg.loadProgram(glslObject.ID);
	}
	prg.useProgram(glslObject.ID);
	prg.loadDefaults();
};

/**
 * Clears the rendering context
 */
vxlRenderer.prototype.clear = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height);
	
	//vxl.mat4.identity(this.pMatrix);
	//vxl.mat4.perspective(this.pMatrix, this.view.fovy, this.view.width/this.view.height, this.view.zNear, this.view.zFar);
	this.transforms.calculatePerspective();
};

/**
 * Starts the renderer
 */
vxlRenderer.prototype.start = function(){
	if(this.mode == vxl.def.renderer.mode.TIMER){
		//vxl.go.console('Renderer: starting rendering for view ['+this.view.name+'] at '+this.renderRate+ 'ms');
		this.timerID = setInterval((function(self) {return function() {self.render();}})(this),this.renderRate); 
	}
	else if(this.mode == vxl.def.renderer.mode.ANIMFRAME){
		//vxl.go.render();
		message('Renderer for animation invoked');
	}
};

/**
 * Stops the renderer
 */
vxlRenderer.prototype.stop = function(){
	if (this.mode == vxl.def.renderer.mode.TIMER){
		clearInterval(this.timerID);
	}
	else if (this.mode == vxl.def.renderer.mode.ANIMFRAME){
		//vxl.go.cancelRender();
	}
};

/**
 * Sets the rendering rate in ms
 * @param {Number} rate the new rendering rate in milliseconds
 */
vxlRenderer.prototype.setRenderRate = function(rate){ //rate in ms
	
	this.renderRate = rate;
	this.stop();

	
	if (rate == null || rate <=0){
		//this.mode = vxl.def.renderer.ANIMFRAME; //disabled for now
		//message('vxlRenderer.mode = ANIMFRAME');	
		return;
	}	
	else{
		this.mode = vxl.def.renderer.mode.TIMER;
		vxl.go.console('Renderer: view['+this.view.name+'] mode = TIMER, render rate = ' + rate,true);
	}
	
	this.start();
	
};

/**
 * Sets the color used to clear the rendering context
 * @param {Array} cc the new color passed as a numeric array of three elements
 * @see vxlView#setBackgroundColor
 */
vxlRenderer.prototype.clearColor = function(cc){
	this.gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
};

/**
 * Sets the clear depth for the rendering context
 * @param {Number} d the new clear depth
 */
vxlRenderer.prototype.clearDepth = function(d){
	this.gl.clearDepth(d);
};

/**
 * Renders the scene by delegating the rendering to each actor present in the scene
 */
vxlRenderer.prototype.render = function(){	
	this.view.resize();
    this.view.scene.render();
};
