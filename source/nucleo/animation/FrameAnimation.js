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
/*
* Idea: to use a lightweight pattern. A pool of vxlModels that are reused.
* Every frame the information is copied to the buffers, instead of saving as many gl vbos as models
*/
/**
 * Provides frame-to-frame animation
 * 
 * @class
 * @constructor
 * @param map  JSON object where each property name is one frame and each property value
 * is a list of actors 
 * var map = {"frame1":["actor1","actor2"], "frame2":["actor3","actor4"]}
 */
function vxlFrameAnimation(map){
	this.scene             = null;
	this.timerID           = 0;
	this.actorByFrameMap   = [];
	this.activeFrame       = 1;
	this.mark              = 1;
	this.running           = false;
    this.frameCount        = 0;
    this.renderRate        = 500;
    this._setup(map);
    if (vxl.c.animation == null) vxl.c.animation = this;
};

/**
 * The actor will appear in the indicated frame of this animation
 * @param {Number} frame the frame
 * @param {String} actorName the name of the actor. It must exist.
 */
vxlFrameAnimation.prototype.addActorToFrame = function(frame,actorName){
	if (typeof(this.actorByFrameMap[frame])=='undefined'){
		this.actorByFrameMap[frame] = new Array();
	}
	if (this.actorByFrameMap[frame].indexOf(actorName) == -1){
		this.actorByFrameMap[frame].push(actorName);
	}
    if (frame>this.frameCount) this.frameCount = frame;
};

/**
 * Map is a JSON object where each property name is one frame and each property value
 * is a list of actors 
 * 
 * var map = {"frame1":["actor1","actor2"], "frame2":["actor3","actor4"]}
 * 
 */
vxlFrameAnimation.prototype._setup = function(map){
	this.activeFrame = 1;

	for (var f in map){
		var actorList = map[f];
		var frame = parseInt(f.substr(5,f.length));
		for(var i=0, max = actorList.length; i < max; i+=1){
			this.addActorToFrame(frame,actorList[i]);
		}
	}
	vxl.go.console('FrameAnimation: Setup finished.');
};

/**
 * Starts the animation loop
 */
vxlFrameAnimation.prototype.start = function(){
	if (this.scene == null) throw 'FrameAnimation: the animation is not associated with any scene. Please use scene.setFrameAnimation method';

    this.running = true;
	this.timerID = setInterval((function(self) {return function() {self.nextFrame();}})(this),this.renderRate);
};

/**
 * Stops the animation loop
 */
vxlFrameAnimation.prototype.stop = function(){
	clearInterval(this.timerID);
    this.running = false;
};

vxlFrameAnimation.prototype.setFrameRate = function(rate){
	if (rate <=0) return;
	this.renderRate = rate;
	this.stop();
	this.start();
}


/**
 * Performs the animation rendering. The Scene delegates the rendering to a FrameAnimation object
 * when this object is registered with the scene.
 */
vxlFrameAnimation.prototype.render = function(renderer){
	if (this.scene == null) throw 'FrameAnimation: the animation is not associated with any scene. Please use scene.setFrameAnimation method';
	//if (!this.running) return;
	
	for (var i=0; i<this.actorByFrameMap[this.activeFrame].length; i++){
		var actorName = this.actorByFrameMap[this.activeFrame][i];
		var actor = this.scene.getActorByName(actorName);
		if (actor != null){
			actor.allocate(renderer);
			actor.render(renderer);
		}
	}
};

/**
 * Verifies if the frame number passed as parameter is in the range of the current animation
 * @param f a frame number
 * @returns true if the number passed as parameter is a valid frame number, false otherwise
 */
vxlFrameAnimation.prototype.isValidFrame = function(f){
 return (f>=1 && f<= this.frameCount);
};

/**
 * Moves the animation to the next valid frame. If the activeFrame is the last frame in the animation, then
 * the animation is reset to the first frame.
 */
vxlFrameAnimation.prototype.nextFrame = function(){
	if (this.activeFrame < this.frameCount){
		this.activeFrame++;
	}
	else{
		this.activeFrame = 1;
	}
};

/**
 * Gets the next n valid frames. Works as a circular buffer.
 */
vxlFrameAnimation.prototype.getNextFrames = function(n){
	var list = [];
	var c = this.activeFrame;
	if (n> this.frameCount) n = this.frameCount;
	for (var i=1; i <=n; i++){
		var next = c + i;
		if (this.isValidFrame(next)){
			list.push(next);
		}
		else{
			list.push(next-this.frameCount);
		}
	}
	vxl.go.console('Animation: next frames: ' + list);
	return list;
};

/**
 * Gets the previous n frames. Works as a circular buffer.
 */
vxlFrameAnimation.prototype.getPreviousFrames = function(n){
	var list = [];
	var c = this.activeFrame;
	if (n> this.frameCount) n = this.frameCount;
	for (var i=1; i <=n; i++){
		var previous = c - i;
		if (this.isValidFrame(previous)){
			list.push(previous);
		}
		else{
			list.push(this.frameCount+previous);
		}
	}
	vxl.go.console('Animation: previous frames: ' + list);
	return list;
};

/**
 * Sets f as the active frame
 * @param f the frame to set as active
 */
vxlFrameAnimation.prototype.setFrame = function (f){
	if (f>=1 && f <= this.frameCount){
		this.activeFrame = f;
		this.render();
	}
};

