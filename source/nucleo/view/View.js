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
* @class the class that manages what it is rendered the HTML5 canvas on the web page 
* @constructor
* @param {String} canvasID id of the canvas in the DOM tree. That's all we need to setup a vxlView for you
* @param {vxlScene} scene if this view is sharing a scene, this parameter corresponds to the scene being shared.
* @param {Boolean} handleLayout if true or absent, the canvas will be resized dynamically
* @author Diego Cantor
*/

function vxlView(canvasID, scene, handleLayout){

	//this.id = 0; //@TODO: Who handles this? Maybe one Scene has several Views?
	
	this.canvas = document.getElementById(canvasID);
	
	if (this.canvas == null){
		alert('View: the canvas ' + canvasID+ ' does not exist.');
		throw('View: the canvas ' + canvasID+ ' does not exist.');
	}
	
	this.name = canvasID;
	
    //View dimensions
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	
	//Clear depth and background color
	this.clearDepth = 1.0;
	this.backgroundColor = vxl.def.view.background.slice(0);
	
	//Drag and drop
	this.dragndrop = false;

	//Create Renderer
	this.renderer = new vxlRenderer(this);
	this.setBackgroundColor(this.backgroundColor);
	this.setClearDepth(this.clearDepth);
	
	//Create Camera Manager
	this.cameraman = new vxlCameraManager(this);
	
	//Create View Interactor
	this.interactor = new vxlTrackerInteractor();
	
	this.interactor.connectView(this);
	
	//Create Scene
	if (scene != null && scene instanceof vxlScene){
		this.scene = scene;
	}
	else if (vxl.c.scene != undefined){
		this.scene = vxl.c.scene;
	}
	else{
		this.scene = new vxlScene();
	
	}
	//Add this view to the scene;
	this.scene.views.push(this);
	
	if (vxl.c.view == undefined){
		vxl.c.view = this;
	}
	
	vxl.go.views.push(this);
	
	if (handleLayout == undefined){
	    handleLayout = true;
	}
	
	this.setAutoResize(handleLayout);
	this._fullscreenFlag = true;
	
	this.UID = vxl.util.generateUID();


    var ntf = vxl.go.notifier;
    var e   = vxl.events;
    ntf.publish(e.VIEW_NEW, this);
    ntf.subscribe(e.DEFAULT_LUT_LOADED,this);
    ntf.fire(e.VIEW_NEW, this);

	vxl.go.console('View: the view '+ this.name+' has been created');
};


/**
 * Handles the events to which a view is subscribed in Voxelent's Nucleo
 * @param {String} event the name of the event
 * @param {Object} source the origin of the event. Useful to do callbacks if necessary
 */
vxlView.prototype.handleEvent = function(event, source){
	vxl.go.console('vxlView ['+this.name+']: receiving event '+event);
	if (event == vxl.events.DEFAULT_LUT_LOADED){
		this.scene.setLookupTable(vxl.def.lut.main);
	}
};


/**
 * Clears the scene. Delegates this task to the renderer.
 */
vxlView.prototype.clear = function(){
	this.renderer.clear();
};

/**
 * It creates a div around the canvas to handle resizing appropriately
 * @private 
 */
vxlView.prototype._wrapDiv = function(){
    
    $(this.canvas).css({
        position: 'absolute',
        height: 'auto',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
        margin: "5px"
    });
    
    $(this.canvas).wrap('<div id='+this.name+'-wrapper />');
    $('#'+this.name+'-wrapper').css({
       width:'100%',
       height:'100%' 
    });
    
    this.canvas.focus();
}

/**
 * Resizes the canvas so it fits its parent node in the DOM tree
 */
vxlView.prototype.resize = function(){
    var parent = this.canvas.parentNode;
    this.width = $(parent).width()-5;       
    this.height = $(parent).height()-5;
    
    if (this.width > window.innerWidth - 5){
    	this.width = window.innerWidth -5;
    }
    
    if (this.height > window.innerHeight - 5){
    	this.height = window.innerHeight - 5;
    }
    
    $(this.canvas).attr('width', this.width);
    $(this.canvas).attr('height', this.height);
}

/**
 * Enables automatic resizing of the view when the browser window is resized
 * @param flag enbles automatic resizing if true, disables it if false
 */
vxlView.prototype.setAutoResize = function(flag){
    
    if (flag){
         this._wrapDiv();
         this.resize(); //first time
        $(window).resize((function(self){return function(){self.resize();}})(this));
    }
    else{
        $(window).unbind('resize');
    }
};


/**
 * Run non standard code (mozilla, webkit) 
 *@private 
 */
vxlView.prototype._runPrefixMethod = function(obj,method){
    
    var pfx = ["webkit", "moz", "ms", "o", ""];
    var p = 0, m, t;

    while (p < pfx.length && !obj[m]) {
        m = method;
        if (pfx[p] == "") {
            m = m.substr(0,1).toLowerCase() + m.substr(1);
        }
        m = pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            pfx = [pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }
};

/**
 * Handles HTML5 Full screen for this view 
 * @param {Boolean} flag set flag to true if fullscreen is wanted. Set it to false to exit fullscreen.
 */
vxlView.prototype.fullscreen = function(flag){
    if (!this._fullscreenFlag) return; //ignore request if fullscreen is not active
    if (flag == true){
        this._runPrefixMethod(this.canvas, "RequestFullScreen");
    }
    else{
        if (this._runPrefixMethod(document,"FullScreen") || 
            this._runPrefixMethod(document,"isFullScreen")){
            this._runPrefixMethod(document,"CancelFullScreen");
        }    
    }

};

/**
 * Forbids this view from going to Full Screen mode
 */
vxlView.prototype.disableFullScreen = function(){
    this._fullscreenFlag = false;
}

/**
 * Enables this view to go to Full Screen mode. Fullscreen mode is available by default.
 */
vxlView.prototype.enableFullScreen = function(){
    this._fullscreenFlag = true;
}

/**
 * Starts the view
 */
vxlView.prototype.start = function(){
	this.renderer.start();
	this.refresh();
};

/**
 * Stops the view
 */
vxlView.prototype.stop = function(){
	this.renderer.stop();
};

/**
 * Resets the view
 */
vxlView.prototype.reset = function(){
	this.stop();
	this.scene.reset();
	this.cameraman.reset();
	this.start();
};

/**
 * Sets the view's background color
 * @param {Number, Array, vec3} r it can be the red component, a 3-dimensional Array or a vec3 (glMatrix)
 * @param {Number} g if r is a number, then this parameter corresponds to the green component
 * @param {Number} b if r is a number, then this parameter corresponds to the blue component
 
 * @see vxlRenderer#clearColor
 */
vxlView.prototype.setBackgroundColor = function(r,g,b){
	this.backgroundColor = vxl.util.createColor(r,g,b); 
	this.renderer.clearColor(this.backgroundColor);
};


/**
 * Sets the clear depth
 * @param {Number} d the new depth
 * @see vxlRenderer#clearDepth
 */
vxlView.prototype.setClearDepth = function(d){
	this.renderer.clearDepth(d);
};

/**
 * Refresh the view 
 * @see vxlRenderer#render
 */
vxlView.prototype.refresh = function(){
    this.renderer.render();
};

/**
 * Uses the interactor passed as parameter to handle user gestures
 * @param {vxlViewInteractor} interactor an instance of a vxlViewInteractor
 * 
 */
 vxlView.prototype.setInteractor = function(i){
    this.interactor = i;
    this.interactor.connectView(this);
};

/**
 *Sets the drag and drop flag 
 * @param {Boolean} flag
 */
vxlView.prototype.setDragAndDrop = function(flag){
    this.dragndrop = flag;
};

/**
 * Get FPS metric from the view renderer
 */
vxlView.prototype.getFPS = function(){
    return this.renderer.fps;
    
};

