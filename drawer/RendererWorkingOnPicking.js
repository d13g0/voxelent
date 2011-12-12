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
function vxlRenderer(vw){
    
	this.renderRate = vxl.def.renderer.rate.NORMAL;
	this.mode       = vxl.def.renderer.mode.TIMER;
    this.timerID    = 0;
    
    this.view       = vw;
    this.transforms = new vxlTransforms(this.view.camera);
    this.transforms.init();
    
    this.gl  = this.getWebGLContext();
    this.prg = this.getProgram();
  
}

vxlRenderer.prototype.getWebGLContext = function(){
	
	var _webGLContext = null;
	var canvas = this.view.canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
	for (var i = 0; i < names.length; ++i) {
		try {
			_webGLContext = canvas.getContext(names[i]);
		} 
		catch(e) {}
		if (_webGLContext) {
			break;
		}
	}
	if (_webGLContext == null) {
		alert("Could not initialise WebGL"); 
		return;
	}
	else {
		var _gl = _webGLContext;
		_gl.enable(_gl.DEPTH_TEST);
		_gl.enable(_gl.BLEND);
		_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
		_gl.depthFunc(_gl.LEQUAL);
	}
    return _webGLContext;
}

vxlRenderer.prototype.getProgram = function(){
    
    var prg = new vxlProgram(this.gl);
    
    prg.register("diffusive", vxl.def.program.diffusive);
	
    prg.loadProgram("diffusive");
    prg.useProgram("diffusive");
    prg.loadProgramDefaults();
    
    return prg;
}

vxlRenderer.prototype.clear = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(0, 0, this.view.canvas.width, this.view.canvas.height);
	vxl.mat4.identity(this.pMatrix);
	vxl.mat4.perspective(this.pMatrix, this.view.fovy, this.view.width/this.view.height, this.view.zNear, this.view.zFar);
}

vxlRenderer.prototype.start = function(){
	if(this.mode == vxl.def.renderer.mode.TIMER){
		message('starting renderer at '+this.renderRate+ 'ms');
		this.timerID = setInterval((function(self) {return function() {self.render();}})(this),this.renderRate); 
	}
	else if(this.mode == vxl.def.renderer.mode.ANIMFRAME){
		vxl.go.render();
		message('vxl.go.render invoked');
	}
}

vxlRenderer.prototype.stop = function(){
	if (this.mode == vxl.def.renderer.mode.TIMER){
		clearInterval(this.timerID);
	}
	else if (this.mode == vxl.def.renderer.mode.ANIMFRAME){
		vxl.go.cancelRender();
	}
}

vxlRenderer.prototype.setRenderRate = function(rate){ //rate in ms
	
	this.renderRate = rate;
	this.stop();
	
	
	if (this.animation && this.animation.running){
		this.animation.stop();
		this.animation.start();
	}
	
	if (rate == null || rate <=0){
		//this.mode = vxl.def.renderer.ANIMFRAME; //disabled for now
		//message('vxlRenderer.mode = ANIMFRAME');	
		return;
	}	
	else{
		this.mode = vxl.def.renderer.mode.TIMER;
		message('vxlRenderer.mode = TIMER, render rate = ' + rate);
	}
	
	this.start();
	
}

vxlRenderer.prototype.clearColor = function(cc){
	this.gl.clearColor(cc[0], cc[1], cc[2], 1.0);
}

vxlRenderer.prototype.clearDepth = function(d){
	this.gl.clearDepth(d);
}

/*-------------------------------------------------------------------------------------------------*/
/*                                             RENDER SCENE
/*-------------------------------------------------------------------------------------------------*/
vxlRenderer.prototype.render = function(){
	
	var gl = this.gl;
    var actorManager = this.view.actorManager;
	var animation = this.view.animation;
    
	this.view.update();
	
    this.transforms.calculateModelView();
    this.transforms.calculateNormal();
    
    this.prg.setUniform("uMVMatrix", this.transforms.mvMatrix);
    this.prg.setUniform("uPMatrix",  this.transforms.pMatrix);
    this.prg.setUniform("uNMatrix",  this.transforms.nMatrix);
 	
	this.view.boundingBox.render(this);
	this.view.axis.render(this);
	
	actorManager.allocate(this);
    
    for(var i=0; i<actorManager.actors.length; i++){
       gl.bindBuffer(gl.ARRAY_BUFFER, null);
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
       actorManager.actors[i].render(this);
    }
	
	/* FULL CODE if (actorManager.picking){
		for(var i=0; i<actorManager.actors.length; i++){
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			actorManager.actors[i].renderForPicking(this);
		}
	}
	else{*/
        //if (animation != null && animation.running){
          //  animation.render();
        //}
        //else {
     //       for(var i=0; i<actorManager.actors.length; i++){
       //         gl.bindBuffer(gl.ARRAY_BUFFER, null);
         //       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
           //     actorManager.actors[i].render(this);
           // }
        //}
	//}
	
	//fps.time = Date.now();
    //if (fps.lastFireTime !== undefined)  fps.update(fps.time - fps.lastFireTime);
    // fps.lastFireTime = fps.time;
	//@TODO: RENDER ANIMATION
}

