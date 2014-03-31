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
    this.fps            = 0;
    this.engine 		= undefined;
    this._time          = 0;
    this._startDate     = 0;
    this._running       = false;
    this.setEngine(vxlRenderEngine);
    this.setProgram(vxl.go.essl.lambert);
};

/**
 * Sets the current rendering engine. 
 * 
 * <p>The parameter can be a class definition or an instance of the engine</p>
 * 
 * @param {vxlEngine} p_engine The engine to be used (function reference or instance)  
 */
vxlRenderer.prototype.setEngine = function(p_engine){
    
    var instance = undefined;
    //Create a new instance
    if (typeof p_engine == 'function'){
        instance  = new p_engine();
    }
    //Use this instance
    else if (typeof p_engine == 'object'){
        instance = p_engine;
    }
    else{
        console.warn('vxlRenderer.setEngine WARN: '+p_engine+' is not an engine');
        console.warn('vxlRenderer.setEngine WARN: using vxlRenderEngine by default');
        instance = new vxlRenderEngine();
        
    }
    instance.init(this);
    this.engine = instance;
};

/**
 * Sets the current rendering program 
 * 
 * <p>The parameter can be a class definition or an instance of the program</p>
 * 
 * @param {vxlProgram} p_program the program to be used (function reference or instance)
 */
vxlRenderer.prototype.setProgram = function(p_program,p_force_it){
    this.engine.setProgram(p_program, p_force_it);
};

/**
 * When the current program is being enforced by the renderer (see setProgram), any
 * subsequent call to setProgram will be unsuccessful. So for instance, actors
 * who want to use a different program to be rendered would not be able to do so.
 * 
 * This method releases the current program from being enforced 
 */
vxlRenderer.prototype.releaseProgram = function(){
    this.engine.releaseProgram();
};




/**
 * Clears the WebGL scene
 */
vxlRenderer.prototype.clear = function(){
    this.engine.clear();
};

/**
 * Sets the color used to clear the rendering context
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 * @see vxlView#setBackgroundColor
 */
vxlRenderer.prototype.clearColor = function(r,g,b){
    this.engine.clearColor(r,g,b);
};

/**
 * Sets the clear depth for the rendering context
 * @param {Number} d the new clear depth
 */
vxlRenderer.prototype.clearDepth = function(d){
    this.engine.clearDepth(d);
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
    this.engine.enableOffscreen();    
};

/**
 * Returns true if the offscreen rendering is enabled. False otherwise. 
 */
vxlRenderer.prototype.isOffscreenEnabled = function(){
    return this.engine.isOffscreenEnabled();  
};


vxlRenderer.prototype.readOffscreenPixel = function(x,y){
    return this.engine.readOffscreenPixel(x,y);
};

/**
 * Sets the rendering mode. Options are in vxl.def.renderer.mode
 * This method updates the rendering mode and tries to restart the rendering process
 * @param {String} mode the mode to set
 * @see vxl.def.render.mode
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
	else if (this.mode == 'DEBUG'){
	    //do not start the rendering
	    this.clear();
	}
};

/**
 * Implements a self adjusting timer
 * @see <a href="http://www.sitepoint.com/creating-accurate-timers-in-javascript/">Creating accurate timers in JavasScript</a>
 * @private   
 */
vxlRenderer.prototype._timeUp = function(){
    if (!this._running || this.mode == vxl.def.renderer.mode.ANIMFRAME) return;
    
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
        };
    })(this), this.renderRate - diff);
};
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
 * @class  Encapsulates a renderer exception
 * @param {Object} message
 */
function vxlRendererException(message){
    this.message = message;
};

