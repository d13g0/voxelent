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
    
	this.view       	= vw;
	this.renderRate 	= vxl.def.renderer.rate.NORMAL;
	this.mode       	= vxl.def.renderer.mode.TIMER;
    this.gl         	= this.getWebGLContext();
    this.pm        	    = new vxlProgramManager(this.gl);
    this.transforms 	= new vxlTransforms(vw);
    this.fps            = 0;
    this.currentProgram = undefined;
    this.engine 		= new vxlRenderEngine(this);
    
    
    this._time          = 0;
    this._startDate     = 0;
    this._running       = false;
    this._clearColor    = undefined;
    this._renderTarget  = undefined;
    
    this._knownPrograms = {};
    this._enforce       = false; //to enforce the program or not
    this.setProgram(vxl.go.essl.lambert);
    
}

/**
 * Tries to obtain a WebGL context from the canvas associated with the view to which this
 * renderer belongs to.
 * @TODO: Review depth test and blending functions maybe these should be configurable.
 */
vxlRenderer.prototype.getWebGLContext = function(){
	
	var WEB_GL_CONTEXT = null;
	var canvas     = this.view.canvas;
	this.width     = canvas.width;
	this.height    = canvas.height;
	
	var names      = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
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
		//@TODO: print a nicer jquery  alert
		alert("Sorry: WebGL is not available on this browser. Have you tried the newest version of Firefox, Chrome or Safari?"); 
		return;
	}
	else {
		this._initializeGLContext(WEB_GL_CONTEXT);
		
	}
    return WEB_GL_CONTEXT;
};

/**
 * Initializes the WebGL context
 *
 * @private 
 */
vxlRenderer.prototype._initializeGLContext = function(gl){
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LESS);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};


/**
 * Tries to add a new program definition to this renderer
 * @param {vxlProgram} program an instance of a vxlProgram object or one of its descendents
 * @param {vxlEngine} engine (optional) a new engine
 */
vxlRenderer.prototype.setProgram = function(program,engine,forceIt){
    
    
    if (this._enforce && program.ID != this.currentProgram.ID){
        throw new vxlRendererException("The current program is being enforced. Please use vxlRenderer.releaseProgram first");
    }
    
    if (forceIt != undefined && forceIt == true){
        this._enforce = true;
    }
    else{
        this._enforce = false;
    }
    
    
    //Check if the program has be instantiated before
    if (this._knownPrograms[program.ID] == undefined || this._enforce){
        this._knownPrograms[program.ID]= program;
    }
    
    var prg = this._knownPrograms[program.ID];
    var pm = this.pm;

	if (!pm.isRegistered(prg.ID)){
		pm.register(prg);
	}
	
	if (!pm.isLoaded(prg.ID)){
		pm.loadProgram(prg.ID);
	}
	
	pm.useProgram(prg.ID);
	pm.loadDefaults();
	
	this.currentProgram = prg;
	
	if (engine != undefined && engine != this.engine){
	   this.setEngine(engine);
	}
	
	
};

/**
 * When the current program is being enforced by the renderer (see setProgram), any
 * subsequent call to setProgram will be unsuccessful. So for instance, actors
 * who want to use a different program to be rendered would not be able to do so.
 * 
 * This method releases the current program from being enforced 
 */
vxlRenderer.prototype.releaseProgram = function(){
    this._enforce = false;
}

/**
 * Sets the current rendering engine. 
 * 
 * @param {vxlEngine} engine The engine to be used.  
 */
vxlRenderer.prototype.setEngine = function(engine){
    if (engine != null && engine != undefined){
        this.engine = engine
    }
    else if (this.engine == undefined){
        this.engine = new vxlRenderEngine(this);
    }
}


/**
 * Clears the rendering context
 */
vxlRenderer.prototype.clear = function(){
    this.gl.clearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height); //@TODO: Think about dividing view ports for multi-view apps - March 19/2012
	this.transforms.calculatePerspective();
};

/**
 * Sets the rendering mode. Options are in vxl.def.renderer.mode
 * This method updates the rendering mode and tries to restart the rendering process
 * @param {String} mode the mode to set
 */
vxlRenderer.prototype.setMode = function(mode){
    this.stop();
    this.mode = mode;
    this.start();   
};

/**
 * Starts the renderer
 */
vxlRenderer.prototype.start = function(){
    
    this._running = true;
    this._startDate = new Date().getTime();
    this._time  = 0;
    
	if(this.mode == vxl.def.renderer.mode.TIMER){
		vxl.go.console('Renderer: starting rendering for view ['+this.view.name+'] at '+this.renderRate+ 'ms');
		this._timeUp();
		//this.timerID = setInterval((function(self) {return function() {self.render();}})(this),this.renderRate); 
	}
	else if(this.mode == vxl.def.renderer.mode.ANIMFRAME){
	    vxl.go.console('Renderer: starting rendering at the fastest speed',true);
		vxl.go.renderman.render();
	}
};

/**
 * Implements a self adjusting timer
 * @see <a href="http://www.sitepoint.com/creating-accurate-timers-in-javascript/">Creating accurate timers in JavasScript</a>
 * @private   
 */
vxlRenderer.prototype._timeUp = function(){
    if (!this._running) return;
    
    this.render();
    
    if (this._time == this.renderRate * 100){  
        this._time = 0;
        this._startDate = new Date().getTime();
    }
    
    this._time += this.renderRate;

    var diff = (new Date().getTime() - this._startDate) - this._time;
    
    if (diff > this.renderRate) diff = 0; //ignore it
    
    setTimeout((function(self){
        return function(){
            self._timeUp();
        }
    })(this), this.renderRate - diff);
}
/**
 * Stops the renderer
 */
vxlRenderer.prototype.stop = function(){
	if (this.mode == vxl.def.renderer.mode.TIMER){
		//clearInterval(this.timerID);
		this._running = false;
	}
	else if (this.mode == vxl.def.renderer.mode.ANIMFRAME){
		vxl.go.renderman.cancel();
	}
};

/**
 * Sets the rendering rate in ms
 * @param {Number} /test-baking.htmlrate the new rendering rate in milliseconds
 */
vxlRenderer.prototype.setRenderRate = function(rate){ //rate in ms
    
    if (rate == undefined || rate <=0){ 
        throw 'vxlRenderer.setRenderRate: the rate cannot be zero or undefined';
    } 
    
    if (this.mode == vxl.def.renderer.mode.ANIMFRAME){
        throw 'vxlRenderer.setRenderRate: if the mode is ANIMFRAME render rate is irrelevant';
    }
      
	this.stop();
	this.renderRate = rate;
	this.start();
    
    vxl.go.console('Renderer: view['+this.view.name+'], render rate = ' + rate,true);

};

/**
 * Sets the color used to clear the rendering context
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 * @see vxlView#setBackgroundColor
 */
vxlRenderer.prototype.clearColor = function(r,g,b){
    var cc = vxl.util.createArr3(r,g,b);
    this._clearColor = cc;
	this.gl.clearColor(cc[0], cc[1], cc[2], 1.0);
};

/**
 * Sets the clear depth for the rendering context
 * @param {Number} d the new clear depth
 */
vxlRenderer.prototype.clearDepth = function(d){
	this.gl.clearDepth(d);
};

/**
 * Renders the scene using the current engine
 */
vxlRenderer.prototype.render = function(){
    var engine = this.engine, scene = this.view.scene, start = undefined, elapsed = undefined;
    
    this.clear();                   //clear the canvas
    engine.allocate(scene);	    //allocate memory for actors added since last rendering
    
    start = new Date().getTime();
    engine.render(scene);
    elapsed = new Date().getTime() - start;
    
    engine.deallocate(scene);     //deallocate memory if necessary
    
    // calculating FPS metric
    if(elapsed >0){
        this.fps = Math.round((this.fps * 0.80 + (1000.0/elapsed) * 0.2)* 100)/100;
    }
    
};

/**
 * Reallocates the actors marked as dirty, without requiring rerendering. This mechanism allows
 * to update the GL buffers for dirty actors. 
 */
vxlRenderer.prototype.reallocate = function(){
  this.engine.allocate(this.view.scene);  
};

/**
 * Disables offscreen rendering
 *  
 */
vxlRenderer.prototype.disableOffscreen = function(){
    this.engine.disableOffscreen();
};


/**
 *Sets the render target for this renderer 
 */
vxlRenderer.prototype.enableOffscreen = function(){
    this._renderTarget = new vxlRenderTarget(this);
    this.engine.enableOffscreen(this._renderTarget);    
};

/**
 * Returns true if the offscreen rendering is enabled. False otherwise. 
 */
vxlRenderer.prototype.isOffscreenEnabled = function(){
    return this.engine.isOffscreenEnabled();  
};


/**
 * @class  Encapsulates a renderer exception
 * @param {Object} message
 */
function vxlRendererException(message){
    this.message = message;
};

