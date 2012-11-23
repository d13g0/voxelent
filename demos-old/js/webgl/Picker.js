function Picker(canvas){
    this.plist = [];
	this.canvas = canvas;
	this.texture = null;
	this.framebuffer = null;
	this.renderbuffer = null;
    
    this.processHitsCallback = null;
    this.addHitCallback = null;
    this.removeHitCallback = null;
    this.hitPropertyCallback = null;
    this.moveCallback = null;
    
	this.configure();
    
};

Picker.prototype.configure = function(){

	var width = 512*4;
	var height = 512*2;
	
	//1. Init Picking Texture
	this.texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	//2. Init Render Buffer
	this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	
    
    //3. Init Frame Buffer
    this.framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
	

	//4. Clean up
	gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

Picker.prototype._compare = function(readout, color){
    //console.info('comparing object '+object.alias+' diffuse ('+Math.round(color[0]*255)+','+Math.round(color[1]*255)+','+Math.round(color[2]*255)+') == readout ('+ readout[0]+','+ readout[1]+','+ readout[2]+')');
    return (Math.abs(Math.round(color[0]*255) - readout[0]) <= 1 &&
			Math.abs(Math.round(color[1]*255) - readout[1]) <= 1 && 
			Math.abs(Math.round(color[2]*255) - readout[2]) <= 1);
}

Picker.prototype.find = function(coords){
	
	//read one pixel
	var readout = new Uint8Array(1 * 1 * 4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
	gl.readPixels(coords.x,coords.y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,readout);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var found = false;
    
    if (this.hitPropertyCallback == undefined) {alert('The picker needs an object property to perform the comparison'); return;}

    for(var i = 0, max = Scene.objects.length; i < max; i+=1){
        var ob = Scene.objects[i];
        if (ob.alias == 'floor') continue;
                
        var property  = this.hitPropertyCallback(ob);
    
        if (this._compare(readout, property)){
            var idx  = this.plist.indexOf(ob);
            if (idx != -1){
                this.plist.splice(idx,1);
                if (this.removeHitCallback){
                    this.removeHitCallback(ob); 
                }
            }
            else {
                this.plist.push(ob);
                if (this.addHitCallback){
                    this.addHitCallback(ob); 
                }
            }
            found = true;
            break;
        }
    }
    draw();
    return found;
};

Picker.prototype.stop = function(){
    if (this.processHitsCallback != null && this.plist.length > 0){
        this.processHitsCallback(this.plist);
    }
    this.plist = [];
}


