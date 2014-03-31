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
 * Engine interface
 */
function vxlEngine(){
    
    this.gl           = undefined;
    this.pm           = undefined;
    this._view        = undefined;
    this._clear_color = undefined;
    this._transforms  = undefined;   //@TODO review

};

/*-------------------------------------------------------------------------*/
//Virtual Methods
/*-------------------------------------------------------------------------*/
vxlEngine.prototype.allocate           = function(scene){};
vxlEngine.prototype.render             = function(scene){};
vxlEngine.prototype.deallocate         = function(scene){};
vxlEngine.prototype.reallocate         = function(scene){};
vxlEngine.prototype.disableOffscreen   = function(){};
vxlEngine.prototype.enableOffscreen    = function(){};
vxlEngine.prototype.isOffscreenEnabled = function(){};
vxlEngine.prototype.readOffscreenPixel = function(x,y){};

/*-------------------------------------------------------------------------*/
// Engine Set Up
/*-------------------------------------------------------------------------*/
/**
 * Initializes the engine
 * @param {Object} p_renderer the renderer using this instance of the engine
 */
vxlEngine.prototype.init = function(p_renderer){
    
    this._getGL(p_renderer);
    this.pm           = new vxlProgramManager(this.gl);  
    this._view        = p_renderer.view;
    this._clear_color = this._view.backgroundColor;
    this._transforms  = new vxlTransforms(p_renderer.view);
    this.configure();
};

/**
 * Obtains the WebGL context
 */
vxlEngine.prototype._getGL = function(p_renderer){
    var ctx        = undefined;
    var canvas     = p_renderer.view.canvas;
    var names      = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    
    this.gl        = undefined;
    
    for (var i = 0; i < names.length; ++i) {
        try {
            ctx = canvas.getContext(names[i]);
        } 
        catch(e) {}
        if (ctx) {
            break;
        }
    }
    if (ctx == null) {
        //@TODO: print a nicer jquery  alert
        alert("Sorry: WebGL is not available on this browser. Have you tried the newest version of Firefox, Chrome or Safari?"); 
        return undefined;
    }
    else {
        this.gl = ctx;
    }
};

/**
* Configures some gl variables
* 
* 
*/
vxlEngine.prototype.configure = function(){
    //@TODO: Review depth test and blending functions maybe these should be configurable
    var gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LESS);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 
};

/*-------------------------------------------------------------------------*/
// Clearing the canvas methods
/*-------------------------------------------------------------------------*/
/**
 * Clears the canvas
 */
vxlEngine.prototype.clear = function(){
    var gl     = this.gl;
    var canvas = this._view.canvas;
    var width  = canvas.width;
    var height = canvas.height;
    var cc     = this._clear_color;
    
    gl.clearColor(cc[0], cc[1], cc[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, width, height); //@TODO: Think about dividing view ports for multi-view apps - March 19/2012
    
    this._transforms.calculatePerspective();
};

/**
 * Sets the color used to clear the canvas
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 * @see vxlView#setBackgroundColor
 */
vxlEngine.prototype.clearColor = function(r,g,b){
    var cc = vxl.util.createArr3(r,g,b);
    this._clear_color = cc;
    this.gl.clearColor(cc[0], cc[1], cc[2], 1.0);
};

/**
 * Sets the clear depth
 * @param {Number} d the new clear depth
 */
vxlEngine.prototype.clearDepth = function(d){
    this.gl.clearDepth(d);
};

/*-------------------------------------------------------------------------*/
// Working with Programs
/*-------------------------------------------------------------------------*/
vxlEngine.prototype.releaseProgram = function(){
   this.pm.releaseProgram();
};

vxlEngine.prototype.setProgram = function(p_program, p_force_it){
    this.pm.setProgram(p_program, p_force_it);
};
