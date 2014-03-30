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

vxlDashEngine.prototype = new vxlEngine();
vxlDashEngine.prototype.constructor = vxlDashEngine;

/**
 * @private
 * creates a new vxlDashEngine
 * This engine minimizes the number of drawArray and drawElements calls by
 * combining multiple actors in the same VBO.
 * 
 * vxlDashEngine has replaced the old vxlBakeEngine. 
 * vxlDashEnginereduces the number of drawArray, drawElement WebGL calls
 * by grouping together similar actors, combining the respective arrays. This is a complex engine
 * and there is lot to do (for instance there is no support for big data or picking yet.)
 * The new class vxlSilo simplifies the code of vxlDashEngine. vxlSilo*
 * grups actors that have the same visualization mode and delivers the javascript arrays and metadata
 * that will be passed as attributes and uniforms (respectively) to the ESSL program.
 * Pending in vxlDashEngine
 * ----------------------------
 * 
 * SOLID, WIREFRAME, POINTS, LINES, BOUNDING_BOX, BB_AND_SOLID, WIRED_AND_SOLID, FLAT.
 * TEXTURED actors: this is a bit more complicated (combining textures, grouping actors by texture used?)
 * FLAT actors: related to picking too and to flat mesh representation.
 * Picking
 *  Multilight support (also pending in vxlRenderEngine)
 * 
 * 
 * 
 * 
 * 
 * @param {Object} renderer
 */
function vxlDashEngine(renderer){
    vxlEngine.call(this);
    this.silos ={};
    this._createSilos();
    this._gl_buffers = {};
    this._createGLBuffers();
    this.essl = vxl.util.extend(
        vxl.def.essl,{
        ACTOR_MATRIX: "aActorMatrix"      
    });
};


vxlRenderEngine.prototype.configure = function(){
    vxlEngine.prototype.configure.call(this);
    var gl = this.gl;
    gl.clearDepth(1.0);
    gl.disable(gl.CULL_FACE);
};

/**
 * @private
 */
vxlDashEngine.prototype._createSilos = function(){
   for (key in vxl.def.actor.mode){
        this.silos[key] = {};
        this.silos[key] = new vxlSilo(key);
    }
};

/**
 * @private
 */
vxlDashEngine.prototype._createGLBuffers = function(){
    var gl = this.renderer.gl;
    for (key in vxl.def.actor.mode){
        this._gl_buffers[key] = {};
        this._gl_buffers[key].mixin = gl.createBuffer();
        this._gl_buffers[key].index = gl.createBuffer();
        this._gl_buffers[key].matrix = gl.createBuffer();
    }
};

/**
 * Allocates the scene passed as parameter. This prepares the engine to do the render call
 * @param {Object} scene the scene to be rendered
 */
vxlDashEngine.prototype.allocate = function(scene){
    var actors = scene._actors;
    
    for (key in this.silos){
        this.silos[key].populate(actors);
        this.silos[key].process();
    }
    
};

/**
 * Performs the rendering. Unlike the default render
 * @param {Object} scene the scene to render
 */
vxlDashEngine.prototype.render = function(scene){
    var r       = this.renderer;
    var trx     = r.transforms
    var pm      = r.pm;
    var gl      = r.gl;
    var essl    = this.essl;
    
    //if there is nothing to render yet then quit
    if (scene._actors.length == 0) return;
    
    //set uniforms
    trx.update();
    pm.setUniform(essl.PERSPECTIVE_MATRIX, trx.pMatrix);
    pm.setUniform(essl.MODEL_VIEW_MATRIX,  trx.mvMatrix);
    pm.setUniform(essl.NORMAL_MATRIX,      trx.nMatrix);
    pm.setUniform(essl.MVP_MATRIX,         trx.mvpMatrix);
    
    
    //Renders the actors that have a SOLID visualization mode
    this._renderSolid();
    
};

/**
 * Performs any clean up task that the engine needs to do after rendering
 * @param {Object} scene the scene that was just rendered
 */
vxlDashEngine.prototype.deallocate = function(scene){
    
};

vxlDashEngine.prototype.enableMatrixAttribute = function(name){
    var r       = this.renderer;
    var gl  = r.gl;
    var prg = r.pm._essl;
    var m       = vxl.def.actor.mode;
    var silo    = this.silos[m.SOLID];
    var data = silo.data;
    
    var loc  = gl.getAttribLocation(prg, name);
    
    //enable the attribute
    gl.enableVertexAttribArray(loc);
    gl.enableVertexAttribArray(loc + 1);
    gl.enableVertexAttribArray(loc + 2);
    gl.enableVertexAttribArray(loc + 3);
    //bind buffer 
    var matrix0_buffer = gl.createBuffer();
    var matrix1_buffer = gl.createBuffer();
    var matrix2_buffer = gl.createBuffer();
    var matrix3_buffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, matrix0_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.matrix[0]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(loc,4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, matrix1_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.matrix[1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(loc+1,4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, matrix2_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.matrix[2]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(loc+2,4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, matrix3_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.matrix[3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(loc+3,4, gl.FLOAT, false, 0, 0);
    
    
    
}


vxlDashEngine.prototype._renderSolid = function(){
     var m       = vxl.def.actor.mode;
     var silo    = this.silos[m.SOLID];
     var data    = silo.data;
     var r       = this.renderer;
     var trx     = r.transforms
     var pm      = r.pm;
     var gl      = r.gl;
     var essl    = this.essl;
     
     
     
     pm.setUniform("uUseShading",true);
     
     pm.enableAttribute(essl.VERTEX_ATTRIBUTE);
     pm.enableAttribute(essl.NORMAL_ATTRIBUTE);
     pm.enableAttribute(essl.COLOR_ATTRIBUTE);
     
     this.enableMatrixAttribute(essl.ACTOR_MATRIX);
     
     var dataVBO = this._gl_buffers[m.SOLID].mixin;
     gl.bindBuffer(gl.ARRAY_BUFFER, dataVBO);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.mixin), gl.STATIC_DRAW);   
     pm.setAttributePointer(essl.VERTEX_ATTRIBUTE, 3, gl.FLOAT, false, 36, 0);
     pm.setAttributePointer(essl.NORMAL_ATTRIBUTE, 3, gl.FLOAT, false, 36, 12);
     pm.setAttributePointer(essl.COLOR_ATTRIBUTE, 3, gl.FLOAT, false, 36, 24);
     
     
     
     
     var indexVBO = this._gl_buffers[m.SOLID].index;
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexVBO);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.index), gl.STATIC_DRAW);
     gl.drawElements(gl.TRIANGLES, data.index.length, gl.UNSIGNED_SHORT,0);
};



