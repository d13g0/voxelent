/*
* Idea: to use a lightweight pattern. A pool of vxlModels that are reused. Every frame the information is copied to the buffers, instead of saving as many gl vbos as models
*/

function vxlAnimation(){
	
	this.timerID = 0;
	this.view = null;
	this.map = [];
	this.activeFrame = 1;
	this.mark = 1;
	this.running = false;
    this.frameCount = 0;
};

vxlAnimation.prototype.setup = function(vw,filelist,mtf){
	
	this.activeFrame = 1;
	this.view = vw;
	this.view.animation = this;
	for (var i=0; i<filelist.length; i++){
		this.addModelToFrame(filelist[i],mtf[i]);
	}
	message('animation setup');
	
};

vxlAnimation.prototype.start = function(){
	if (!this.view){
		alert('animation not initiated to any view');
		return;
	}
    
    this.running = true;
	
	this.timerID = setInterval((function(self) {return function() {self.nextFrame();}})(this),500);

};

vxlAnimation.prototype.stop = function(){
	clearInterval(this.timerID);
    this.running = false;
};

vxlAnimation.prototype.addModelToFrame = function(modelName, frame){
	if (typeof(this.map[frame])=='undefined'){
		this.map[frame] = new Array();
	}
	this.map[frame].push(modelName);
    if (frame>this.frameCount) this.frameCount = frame;
};

vxlAnimation.prototype.render = function(){
	if (!this.running) return;
	
	for (var i=0; i<this.map[this.activeFrame].length; i++){
		var modelName = this.map[this.activeFrame][i];
		var actor = this.view.actorManager.getActorByName(modelName);
		if (actor != null){
			actor.allocate(this.view.renderer);
			actor.render(this.view.renderer);
			//actor.deallocate(); hypothesis. it removes the reference but it does not remove the buffer from ctx
		}
	}
	
	
	/*if (this.activeFrame == this.mark){
		var prv = this.getPreviousFrames(2);
		var nxt = this.getNextFrames(2);
	
		for (var i=0; i<2; i++){
			//this.allocateFrame(nxt[i]);
			this.deallocateFrame(prv[i]);
		}
		this.mark = nxt[1]; // whenever we reach the mark, slide the window.
	}*/
};

vxlAnimation.prototype.isValidFrame = function(f){
 return (f>=1 && f<= this.frameCount);
};

vxlAnimation.prototype.allocateFrame = function(f){
	if (!this.isValidFrame(f)) return; //fail quick and safe
	for (var i=0; i<this.map[f].length; i++){
		var modelName = this.map[f][i];
		var actor = this.view.actorManager.getActorByName(modelName);
		if (actor != null){
			actor.allocate(this.view);
		}
	}
	
};

vxlAnimation.prototype.deallocateFrame = function(f){
	if(!this.isValidFrame(f)) return; //fail quick and safe
	for (var i=0; i<this.map[f].length; i++){
		var modelName = this.map[f][i];
		var actor = this.view.actorManager.getActorByName(modelName);
		if (actor != null){
			actor.deallocate();
		}
	}
};


vxlAnimation.prototype.nextFrame = function(){
	//message('next frame:' + vxl.c.animation.activeFrame);
	if (vxl.c.animation.activeFrame < this.frameCount){
		vxl.c.animation.activeFrame++;
	}
	else{
		vxl.c.animation.activeFrame = 1;
	}
};

vxlAnimation.prototype.getNextFrames = function(n){
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
	message('next frames: ' + list);
	return list;
};

vxlAnimation.prototype.getPreviousFrames = function(n){
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
	message('previous frames: ' + list);
	return list;
};

vxlAnimation.prototype.setFrame = function (f){
	if (f>=1 && f <= this.frameCount){
		vxl.c.animation.activeFrame = f;
		this.render();
	}
};

