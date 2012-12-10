if (typeof vox == 'undefined') {
    vox = {
        def:{
            view2d:{
                state:{
                    idle: 'idle',
                    painting:'painting'
                }
            }
        }
    };
}


/**
* This class represents one slice from the serie
* @class
* @constructor
* @param view {vxlView2D} the view this slice belongs to
* @param file {string} the file (image) that this slice will handle
*/
function vxlMedSlice(view,file){
    this.view = view
    this.file = file; 
    
    this.clickX = [];
    this.clickY = [];
    this.drag   = [];
    
    this.image = new Image();
    this.image.src = file;
};

/**
* Adds a stroke to the current slice. There is no validation of the state of the view.
* The view validates its state in vxlView2D.addStroke before delegating the call
* to the current vxlMedSlice
*
* @see {vxlView2D.addStroke}
*/
vxlMedSlice.prototype.addStroke = function(x,y,dragging){
    this.clickX.push(x);
    this.clickY.push(y);
    this.drag.push(dragging);
    this.update();
};

vxlMedSlice.prototype.clearStrokes = function(){
    this.clickX = [];
    this.clickY = [];
    this.drag = [];
    this.draw();
}


vxlMedSlice.prototype.draw = function(){
 var width = this.view.canvas.width;
 var height = this.view.canvas.height;
 this.view.ctx.drawImage(this.image,0,0, width,height);
}

/**
* Draws the slice
*/
vxlMedSlice.prototype.update = function(){
    
    var ctx = this.view.ctx;
    
    var S = this.view.scale;
    var centerX = this.view.canvas.width/2;
    var centerY = this.view.canvas.height/2;
    
    for(var i = 0, N = this.clickX.length; i < N; i+=1){
        var x1 = S * this.clickX[i-1] + centerX*(1-S);
        var y1 = S * this.clickY[i-1] + centerY*(1-S);
        var x2 = S * this.clickX[i]   + centerX*(1-S);
        var y2 = S * this.clickY[i]   + centerY*(1-S);
        
        ctx.beginPath();
        if (this.drag[i] && i){ //control boundary case?
            ctx.moveTo(x1,y1);
        }
        else {
            ctx.moveTo(x2-1, y2);
        }
        ctx.lineTo(x2,y2);
        ctx.closePath();
        ctx.stroke();
    }
    
    
};

 

/**
* this class represents a 2D medical image viewer
*/
function vxlView2D(canvasId,alias){
    this.name = alias;
    this.canvas = document.getElementById(canvasId);
    this.slices = [];
    this.currentSliceIndex = undefined;
    this.state = vox.def.view2d.state.idle;
    this.scale = 1;
    
    if (this.canvas == undefined || this.canvas == null){
        throw 'CanvasNotFoundException';
    }
    else{
        this.ctx = this.canvas.getContext('2d');
       
    }
    this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = "#FFA500";
    
    this.interactor = new vxlView2DInteractor();
    this.interactor.connectView(this);
};
/**
* Loads a scan serie. It creates a vxlMedSlice for each image file
*/
vxlView2D.prototype.loadSerie = function(files){
    this.slices = [];
    for (var i=0, total = files.length; i < total; i+=1){
        var s = new vxlMedSlice(this, files[i]);
        this.slices.push(s);
    }
    if (this.slices.length > 0){
        this.currentSliceIndex = 0;
    }
};

/**
* Adds a stroke to the current slice
*/
vxlView2D.prototype.addStroke = function(x,y, dragging){
    var currentSlice = this.slices[this.currentSliceIndex];
    if (this.state == vox.def.view2d.state.painting){
        currentSlice.addStroke(x,y,dragging);
    }
};


vxlView2D.prototype.draw = function(){
    var currentSlice = this.slices[this.currentSliceIndex];
    currentSlice.draw();
}

/**
* Redraws the current slice
*/
vxlView2D.prototype.update = function(){
    var currentSlice = this.slices[this.currentSliceIndex];
    currentSlice.update();
};

vxlView2D.prototype.setCurrentSlice = function(index){
    if (index >= 0 && index < this.slices.length){
        this.currentSliceIndex = index;
    }
    this.draw();
    this.update();
}

/**
* Clear the strokes for the current slice
*/
vxlView2D.prototype.clearStrokes = function(){
    var currentSlice = this.slices[this.currentSliceIndex];
    currentSlice.clearStrokes();
};


/**
* Reacts to user gestures in View2D widgets.
* @class
* @constructor
*/
function vxlView2DInteractor(){
    this.view = undefined;
    this.dragging = false;
};
/**
* Connects this interactor to a view2D
* @param view {vxlView2D}
*/
vxlView2DInteractor.prototype.connectView = function(view){
    if (!(view instanceof vxlView2D)){
        throw 'vxlView2DInteractor.connectView: the parameter view is not a vxlView2D object';
        return;
    }
    this.view = view;
    
    
    var canvas = this.view.canvas;
    var interactor = this;
    
    canvas.onmousedown = function(ev) {
        interactor.onMouseDown(ev);
    };

    canvas.onmouseup = function(ev) {
        interactor.onMouseUp(ev);
    };
    
    canvas.onmousemove = function(ev) {
        interactor.onMouseMove(ev);
    };
    
    canvas.onmouseleave = function(ev){
        interactor.onMouseLeave(ev);
    };
    
    canvas.onmousewheel = function(ev){
        interactor.onMouseWheel(ev);
    }
    
};

vxlView2DInteractor.prototype.onMouseDown = function(ev){
    this.dragging = true;
    if (this.view.state == vox.def.view2d.state.painting){
        var canvas = this.view.canvas;
        var x = ev.pageX - canvas.offsetLeft;
        var y = ev.pageY - canvas.offsetTop;            
        this.view.addStroke(x,y,false);
    }
    
};

vxlView2DInteractor.prototype.onMouseUp = function(ev){
    this.dragging = false;
};

vxlView2DInteractor.prototype.onMouseLeave = function(ev){
    this.dragging = false;
};

vxlView2DInteractor.prototype.onMouseMove = function(ev){
    if (this.view.state == vox.def.view2d.state.painting && this.dragging){
        var canvas = this.view.canvas;
        var x = ev.pageX - canvas.offsetLeft;
        var y = ev.pageY - canvas.offsetTop;
        this.view.addStroke(x,y,true);
        this.view.update();
    }
};



vxlView2DInteractor.prototype.onMouseWheel = function(ev){
    //TBI
};