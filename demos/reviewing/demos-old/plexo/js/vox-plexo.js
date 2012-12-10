vox = {} || vox;  //new object or existing object if it exists before
    
vox.def = {
    view2d:{
        state:{
            idle: 'idle',
            painting:'painting',
            erasing: 'erasing'
        }
        ,
        type:{
            AXIAL   : 'AXIAL',
            SAGITTAL: 'SAGITTAL',
            CORONAL : 'CORONAL'
        }
    }
};

vox.g = {
    widgets:[],
    sliders:{}
};

//---------------------------------------------------------------------------------------------------

function getScreenDimensions() {
          var width = 0, height = 0;
          if( typeof( window.innerWidth ) == 'number' ) {
            //Non-IE
            width = window.innerWidth;
            height = window.innerHeight;
          } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
            //IE 6+ in 'standards compliant mode'
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
          } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
            //IE 4 compatible
            width = document.body.clientWidth;
            height = document.body.clientHeight;
          }
          return [width, height];
    }





/**
* temp values (image information)
*/
var ElementSpacing= [1, 1, 1];
var DimSize = [256, 256, 52];
var SCREEN = getScreenDimensions();

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
    this.strokes = [];
    this.image = new Image();
    this.image.src = file;
};

/**
 * Returns true if the stroke exists in this slice
 */
vxlMedSlice.prototype.hasStroke = function(x,y){
    for (var i=0; i< this.strokes.length; i+=1){
        if (this.strokes[i][0] == x &&
            this.strokes[i][1] == y){
            return true;
        }
    }
    return false;
}

/**
 * Returns the index of the stroke
 */
vxlMedSlice.prototype.indexOf = function(x,y){
    for (var i=0; i< this.strokes.length; i+=1){
        if (this.strokes[i][0] == x &&
            this.strokes[i][1] == y){
            return i;
        }
    }
    return -1;
}

/**
* Adds a stroke to the current slice. There is no validation of the state of the view.
* The view validates its state in vxlView2D.addStroke before delegating the call
* to the current vxlMedSlice
*
* @see {vxlView2D.addStroke}
*/
vxlMedSlice.prototype.addStroke = function(x,y){
    if (!this.hasStroke(x,y)){
        this.strokes.push([x,y])
    }
    this.drawStrokes();
};
/**
 * Removes a stroke from the current slice
 */
vxlMedSlice.prototype.removeStroke = function(x,y, eraserSize){
    
    if (this.strokes.length == 0) return;
    
    var aux = [];
    
    for (var i = 0, N = this.strokes.length; i < N; i+=1){
        var distance = Math.round(Math.sqrt(Math.pow(this.strokes[i][0] - x,2) + Math.pow(this.strokes[i][1] - y,2)));
        if (distance > eraserSize){
            aux.push(this.strokes[i])
        }
    }
    
    this.strokes = aux;
    
    this.drawImage();
    this.drawStrokes();
};

/**
 * Removes all strokes from this slice
 */
vxlMedSlice.prototype.clearStrokes = function(){
    this.strokes = []
}
/**
 * Draws the image associated with this slice
 */
vxlMedSlice.prototype.drawImage = function(){
    var width = this.view.canvas.width;
    var height = this.view.canvas.height;
    this.view.ctx.drawImage(this.image,0,0, width,height);
}
/**
* Redraws the strokes 
*/
vxlMedSlice.prototype.drawStrokes = function(){
    
    var ctx = this.view.ctx;
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#F0A5F6";
    ctx.fillStyle = "#F0A5F6";
    
    var S = this.view.scale;
    var centerX = this.view.canvas.width/2;
    var centerY = this.view.canvas.height/2;
    
    for(var i = 0, N = this.strokes.length; i < N; i+=1){
        
        var x = S * this.strokes[i][0]   + centerX*(1-S);
        var y = S * this.strokes[i][1]   + centerY*(1-S);
        
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+1,y+1);
        ctx.closePath();
        ctx.stroke();
    }
    
    
};

//--------------------------------------------------------------------------------------------------- 

/**
* this class represents a 2D medical image viewer
*/
function vxlView2D(name, widget, type){
    
    this.name = name;
    this.slices = [];
    this.currentSliceIndex = undefined;
    this.state = vox.def.view2d.state.idle;
    this.scale = 1;
    this.eraserSize = 6;
    this.widget = undefined;
    this.canvas = undefined; 
    this.interactor = new vxlView2DInteractor();
    this.setWidget(widget);
	
	
	if (type != vox.def.view2d.type.AXIAL &&
	    type != vox.def.view2d.type.CORONAL &&
	    type != vox.def.view2d.type.SAGITTAL){
	        alert('vxlView2D: invalid view type = '+ type)
	}
	else{
	   this.type = type;
	}
	
	this.listeners = [];
};
/**
* Add listeners for the purpose of synchronization between views
*/
vxlView2D.prototype.addListener = function (list){
    if (list instanceof Array)
    {
        for (var i=0; i<list.length; i+=1)
        {
        this.listeners.push (list[i]);  
        }
    }
    else
    {   
        this.listeners.push(list);
    }
};
/**
 * Setups a context
 */
vxlView2D.prototype.setupContext = function(){
    this.ctx = this.widget.canvas.getContext('2d');
    
}
/**
 * Associates a widget with this view
 */
vxlView2D.prototype.setWidget = function(widget){
    
    this.widget = widget;
    this.widget.setView(this);
    this.canvas = widget.canvas;
    this.setupContext();
    this.interactor.connectView(this);
}

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
        this.currentSliceIndex = parseInt(this.slices.length/2);
    }
    
    this.widget.updateSliderMax();
};
/**
* Adds a stroke to the current slice
*/
vxlView2D.prototype.addStroke = function(x,y){
    var currentSlice = this.slices[this.currentSliceIndex];
    if (this.state == vox.def.view2d.state.painting){
        currentSlice.addStroke(x,y);
    }
};
/**
* Removes a stroke from the current slice
*/
vxlView2D.prototype.removeStroke = function(x,y){
    var currentSlice = this.slices[this.currentSliceIndex];
    if (this.state == vox.def.view2d.state.erasing){
        currentSlice.removeStroke(x,y, this.eraserSize);
    }
};
/**
 * Asks the listeners to paint the stroke where it corresponds
 * @param {Array} coords the 3D coordinates
 */
vxlView2D.prototype.syncEraseStroke = function(coords){
    for(var i=0; i<this.listeners.length; i+=1){
         this.listeners[i].coordsToStroke(coords, true);
    }
};
/**
 * Asks the listeners to paint the stroke where it corresponds
 * @param {Array} coords the 3D coordinates
 */
vxlView2D.prototype.syncCurrentStroke = function(coords){
    for(var i=0; i<this.listeners.length; i+=1){
         this.listeners[i].coordsToStroke(coords, false);
    }
};
/**
* Asks the listeners to update their current slice according to coords
* @param {Array} coords the 3D coordinates
*/
vxlView2D.prototype.syncCurrentSlice = function(coords){
	for(var i=0; i<this.listeners.length; i+=1){
		 this.listeners[i].coordsToSliceIndex(coords);
	}
};

/**
 * Receives 3D coordinates, and paints them as the stroke where it belongs
 * @param {Array} coords the 3D coordinates 
 */
vxlView2D.prototype.coordsToStroke = function(coords, remove){
    var v2dt = vox.def.view2d.type;
    var sliceIndex = this.currentSliceIndex;
    var currentSlice = this.slices[this.currentSliceIndex];
    var numSlices = this.slices.length;
    var paintingSlice = this.currentSlice;
    var x = coords[0], y = coords[1], z = coords[2];
    
    var canvasHeight = this.canvas.height;
    var canvasWidth = this.canvas.width;
    
    var adding = (remove==undefined || !remove)
    
    switch (this.type){
        case v2dt.AXIAL:
            sliceIndex = Math.round(z * numSlices / DimSize[2]);
            paintingSlice = this.slices[sliceIndex];
            var xp = Math.round(x * canvasWidth / DimSize[0]);
            var yp = Math.round(y * canvasHeight / DimSize[1]);
            if (adding){
                paintingSlice.addStroke(xp,yp);
            }
            else{
                paintingSlice.removeStroke(xp,yp, this.eraserSize);
            }
            break;        
        
        case v2dt.SAGITTAL:
            sliceIndex = Math.round(x * numSlices / DimSize[0]);
            paintingSlice = this.slices[sliceIndex];
            var yp = Math.round(y * canvasWidth / DimSize[1]);
            var zp = Math.round(canvasHeight - (z * canvasHeight / DimSize[2]));
            if (adding){
                paintingSlice.addStroke(yp,zp);
            }
            else{
                paintingSlice.removeStroke(yp,zp, this.eraserSize);
            }
            break;
        
        case v2dt.CORONAL:
            sliceIndex = Math.round(y * numSlices / DimSize[1]);
            paintingSlice = this.slices[sliceIndex];
            var xp = Math.round(x * canvasWidth / DimSize[0]);
            var zp = Math.round(canvasHeight - (z * canvasHeight / DimSize[2]));
            if (adding){
                paintingSlice.addStroke(xp,zp);
            }
            else {
                paintingSlice.removeStroke(xp,zp, this.eraserSize);
            }
            break;
    }
};
/**
 * Receives 3D coordinates, calculates the slice that should display 
 * then displays it and updates the view connected widget
 * @param {Array} coords The coordinates in [x,y,z] format
 */
vxlView2D.prototype.coordsToSliceIndex = function(coords){
    
    var v2dt = vox.def.view2d.type;
    var sliceIndex = this.currentSliceIndex;
    var numSlices = this.slices.length;
    
    var x = coords[0], y = coords[1], z = coords[2];
    
    switch (this.type){
        case v2dt.AXIAL:
            sliceIndex = Math.round(z * numSlices / DimSize[2]);
            break;        
        case v2dt.SAGITTAL:
            sliceIndex = Math.round(x * numSlices / DimSize[0]);
            break;
        case v2dt.CORONAL:
            sliceIndex = Math.round(y * numSlices / DimSize[1]);
            break;
    }
    
    this.setCurrentSlice(sliceIndex);
    this.widget.setSliderValue(sliceIndex);
}; 
/**
 * Draws the current slice being displayed
 */    
vxlView2D.prototype.display = function(){
    var currentSlice = this.slices[this.currentSliceIndex];
    currentSlice.drawImage();
    this.widget.setSliderValue(this.currentSliceIndex);
};
/**
* Redraws the current slice adding the strokes
*/
vxlView2D.prototype.drawStrokes = function(){
    var currentSlice = this.slices[this.currentSliceIndex];
    currentSlice.drawStrokes();
};

/**
 * Sets the current slice and draws it with its annotations
 */
vxlView2D.prototype.setCurrentSlice = function(index){
    if (index >= 0 && index < this.slices.length){
        this.currentSliceIndex = index;
    }
    this.display();
    this.drawStrokes();
};
/**
* Clear the strokes for the current slice
*/
vxlView2D.prototype.clearStrokes = function(){
    for (var i=0; i< this.slices.length; i++){
        this.slices[i].clearStrokes();
    }
    this.display();
    for (var i=0; i< this.listeners.length; i++){
        for (var j=0; j < this.listeners[i].slices.length; j++){
            this.listeners[i].slices[j].clearStrokes();
        }
        this.listeners[i].display();
    }
};
/**
 * Converts 2D coordinates to 3D 
 */
vxlView2D.prototype.get3DCoords = function(x,y){
    
    var v2dt = vox.def.view2d.type;
    
    var numSlices    = this.slices.length;
    var canvasHeight = this.canvas.height;
    var canvasWidth  = this.canvas.width;
    var current      = this.currentSliceIndex;
    
    var volX,volY,volZ;
    
    y = canvasHeight - y;
    
    switch (this.type){
        case v2dt.AXIAL:
            volX = x       * DimSize[0]  / canvasWidth;
            volY = y       * DimSize[1]  / canvasHeight;
            volZ = current * DimSize[2]  / numSlices;
            break;
        case v2dt.SAGITTAL:
            volY = x       * DimSize[1]  / canvasWidth; 
            volZ = y       * DimSize[2]  / canvasHeight; 
            volX = current * DimSize[0]  / numSlices;
            break;
        case v2dt.CORONAL:
            volX = x       * DimSize[0]  / canvasWidth;
            volZ = y       * DimSize[2]  / canvasHeight;
            volY = current * DimSize[1]  / numSlices;
            break;
    }
    
    $('#sbar').html(this.name+': X,Y = ['+x+', '+y+']  coords =['+volX.toFixed(2)+', '+volY.toFixed(2)+', '+volZ.toFixed(2)+']  state = ['+this.state+']');
    
    return [volX, volY, volZ];    
};

//---------------------------------------------------------------------------------------------------


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
  
    var canvas = this.view.canvas; 
    var parent      = canvas.parentNode;
    var offsetLeft  = 0
    var offsetTop   = 0;
    
    while(parent != document.body){
        offsetLeft += parent.offsetLeft;
        offsetTop += parent.offsetTop;
        parent = parent.parentNode;
    }
            
    var x = ev.pageX - offsetLeft;
    var y = ev.pageY - offsetTop;
    
	var coords = this.view.get3DCoords(x,y);
	
	
    if (this.view.state == vox.def.view2d.state.painting){               
        this.view.addStroke(x,y);
        this.view.syncCurrentStroke(coords);
    }
    else if (this.view.state == vox.def.view2d.state.erasing){
        this.view.removeStroke(x,y);
        this.view.syncEraseStroke(coords);
    }
	else{
	   this.view.syncCurrentSlice(coords);
	}
};

vxlView2DInteractor.prototype.onMouseUp = function(ev){
    this.dragging = false;
};

vxlView2DInteractor.prototype.onMouseLeave = function(ev){
    this.dragging = false;
};

vxlView2DInteractor.prototype.onMouseMove = function(ev){
   
    
    var canvas      = this.view.canvas;
    var parent      = canvas.parentNode;
    var offsetLeft  = 0;
    var offsetTop   = 0;
    
    while(parent != document.body){
        offsetLeft += parent.offsetLeft;
        offsetTop += parent.offsetTop;
        parent = parent.parentNode;
    }
    
    var x = ev.pageX - offsetLeft;
    var y = ev.pageY - offsetTop;
    
    var coords = this.view.get3DCoords(x,y);
    
    if (this.view.state == vox.def.view2d.state.painting && this.dragging){        
        this.view.addStroke(x,y);
        this.view.syncCurrentStroke(coords);
        
    }
    else if (this.view.state == vox.def.view2d.state.erasing && this.dragging){
        this.view.removeStroke(x,y);
        this.view.syncEraseStroke(coords);
    }
    else if (this.view.state == vox.def.view2d.state.idle && this.dragging){
        this.view.syncCurrentSlice(coords);
        
    }
};

vxlView2DInteractor.prototype.onMouseWheel = function(ev){
    //TBI
};

//---------------------------------------------------------------------------------------------------

var incr_depth_var = 0;

function vxlView2DWidget(id,left,top,width,height){
    this.left           = left;
    this.top            = top;
    this.width          = width;
    this.height         = height;
    this.fullscreen     = false;
    this.view           = undefined;
    this.widget         = undefined;
    this.tools          = undefined;
    this.slider         = undefined;
    this.canvas         = undefined;
    this.divcanvas      = undefined;
    this.canvasid       = id+'-canvas';
    this.widgetid       = 'widget-for-'+this.canvasid;
    
    this.originalWidth  = width;
    this.originalHeight = height;
    this.originalTop    = top;
    this.originalLeft   = left;
    
    this.buildGUI();
    this.configureGUI(left, top, width, height);
    this.bindEvents();

    
    vox.g.widgets.push(this);
}


vxlView2DWidget.prototype.buildGUI = function(){
 
    this.widget = document.createElement('div');
    this.widget.setAttribute('id', this.widgetid);
    this.widget.className = 'widget';
    this.widget.style.position = 'absolute';
    
    // Adding tools                       
    this.tools =  document.createElement('div');
    this.tools.setAttribute('id', this.widgetid + '-tools');
    this.tools.innerHTML = "<button id='"+this.widgetid+"-pencil'>Pencil</button>"+
                      "<button id='"+this.widgetid+"-eraser'>Eraser</button>"+
                      "<button id ='"+this.widgetid+"-clear'>Clear</button>" +
                      "<button id ='"+this.widgetid+"-fullscreen'>Fullscreen</button>";
    this.widget.appendChild(this.tools);
           
    // Adding canvas
    this.divcanvas = document.createElement('div');
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id', this.canvasid);
    this.divcanvas.appendChild(this.canvas);
    this.widget.appendChild(this.divcanvas);
    
    // Adding slider
    this.slider = document.createElement('div');
    this.slider.setAttribute('id',this.widgetid + '-slider');
    this.widget.appendChild(this.slider);
    
    $('body').append(this.widget);
};

vxlView2DWidget.prototype.configureGUI = function(left,top,width,height){
    this.top = top;
    this.left = left;
    this.width = width; //>height?height:width;
    this.height = height; //>width?width:height;
    this.widget.style.top =  this.top +'px';
    this.widget.style.left = this.left + 'px';
    this.widget.style.width =  this.width + 'px'
    this.widget.style.height = this.height + 'px';
    this.canvas.setAttribute('width', this.width-50);
    this.canvas.setAttribute('height', this.height-5);
    this.slider.style.cssFloat = 'left';
    this.slider.style.marginLeft = '3px';
    this.slider.style.top = "3px";
    this.slider.style.height = this.height -55 +'px';
    this.tools.style.cssFloat = 'left';
    this.tools.style.width = '30px';
    this.divcanvas.style.cssFloat = 'left';
    var d = $(this.divcanvas);d.css('background-color','black');
};
    
vxlView2DWidget.prototype.bindEvents = function(){  

    $( "#"+this.widgetid+"-slider" ).slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 1,
            value: 0,
            });
    
    vox.g.sliders[this.widgetid+'-slider'] = {};
    
    var self = this;
    
    $(this.widget).draggable({drag:function(event,ui){ 
            if (self.view.state == vox.def.view2d.state.painting){
                return false;
            }
        }, 
        zIndex: 1000, 
        start:function(event,ui){ $(this).css('z-index',incr_depth_var++)},
        cancel: "canvas"
    });
    

    
    $('#'+this.widgetid+"-pencil").button({icons:{ primary:"ui-icon ui-icon-pencil"}, text:false});
    $('#'+this.widgetid+"-pencil").click(function(e) { 
        if (self.view.state != vox.def.view2d.state.painting){
            self.view.state = vox.def.view2d.state.painting;
        }
        else {
            self.view.state = vox.def.view2d.state.idle;
        };
    });
    
    $('#'+this.widgetid+"-eraser").button({icons:{ primary:"ui-icon ui-icon-wrench"}, text:false});
    $('#'+this.widgetid+"-eraser").click(function(e) { 
        if (self.view.state != vox.def.view2d.state.erasing){
            self.view.state = vox.def.view2d.state.erasing;
        }
        else {
            self.view.state = vox.def.view2d.state.idle;
        };
    });
     
    $('#'+this.widgetid+"-clear").button({icons:{ primary:"ui-icon-cancel"}, text:false});
    $('#'+this.widgetid+"-clear").click(function(e){
        self.view.state = vox.def.view2d.state.idle;
        self.view.clearStrokes();
    });
    
    $('#'+this.widgetid+"-fullscreen").button({icons:{ primary:"ui-icon-arrowthick-2-ne-sw"}, text:false});
    $('#'+this.widgetid+"-fullscreen").click(function(e){
        
        var divs= [];
        for (var i = 0; i < vox.g.widgets.length; i +=1){
            divs.push(vox.g.widgets[i].widget);
        }
        
        $(divs).fadeOut(1000).hide();
        
        
        if (!self.fullscreen){
            var top = 2;
            var left = 2;
            var wx = SCREEN[0] * 3 / 5;
            var wy = SCREEN[1] * 3 / 5;
            
            self.fullscreen = true;
            self.configureGUI(left,top,wx,wy)
            self.view.setupContext();
            self.view.display();
            
            var slotY  = (SCREEN[1] / (vox.g.widgets.length - 1))-5;
            var slotX  = (SCREEN[0] * 2/5) -50;
            var j = 0;
            
            for (var i = 0, N = vox.g.widgets.length; i<N; i+=1){
                
                var w = vox.g.widgets[i]; 
                
                if (w.widget.id != self.widgetid){
                    top = j * slotY;
                    
                    if (j == 0){
                        top = 2
                    }
                     
                    left = SCREEN[0] - slotX; 
                    w.configureGUI(left,top, slotX, slotY);
                    
                    if (w.view instanceof vxlView2DWidget){
                        w.view.setupContext();
                        w.view.display();
                    }
                    j ++;    
                }
            }
        }
        else{
            self.fullscreen = false;
            for (var i = 0, N = vox.g.widgets.length; i<N; i+=1){
                var w = vox.g.widgets[i]; 
                w.configureGUI(w.originalLeft, w.originalTop, w.originalWidth, w.originalHeight);
                if (w.view instanceof vxlView2DWidget){
                       w.view.setupContext();
                       w.view.display();
                }
            }
        }    
        $(divs).fadeIn(1000);
    });
};
/**
 * Sets the view associated with this widget
 */
vxlView2DWidget.prototype.setView = function(view){
    this.view = view;
    
    vox.g.sliders[this.widgetid+'-slider'].view = this.view;
    
    $( "#"+this.widgetid+"-slider" ).bind("slide", 
                function( event, ui ) { 
                    superslide(ui);
                }
   );
};
/**
 * Sets the slider current value to value
 */
vxlView2DWidget.prototype.setSliderValue = function(value){
    $('#'+this.widgetid+"-slider").slider("option","value", value);     
};
/**
 * Updates the slider maximum value after loading a set in the view
 */
vxlView2DWidget.prototype.updateSliderMax = function(){
    $( "#"+this.widgetid+"-slider" ).slider("option","max", this.view.slices.length); // need to be set to DimSize .....
};

function superslide(ui){
    vox.g.sliders[ui.handle.parentElement.id].view.setCurrentSlice(ui.value);
};



function vxlView3DWidget(id,left,top,width,height){
    
    this.fullscreen = false;
    this.view = undefined;
    this.canvasid = id+'-canvas';
    this.widgetid = 'widget-for-'+this.canvasid;
    this.widget = document.createElement('div');
    this.widget.setAttribute('id', this.widgetid);
    this.widget.style.position = 'absolute';
    this.originalWidth  = width;
    this.originalHeight = height;
    this.originalTop    = top;
    this.originalLeft   = left;
    
    this.buildGUI();
    this.configureGUI(left, top, width, height);
    this.bindEvents();
    
    vox.g.widgets.push(this);
};

vxlView3DWidget.prototype.buildGUI = function(){
    this.widget.className = 'widget';
    
    // Create tools                       
    this.tools =  document.createElement('div');
    this.tools.setAttribute('id', this.widgetid + '-tools');
    this.tools.style.cssFloat = 'left';
    this.tools.style.width = '30px';
    this.tools.innerHTML = "<button id ='"+this.widgetid+"-fullscreen'>Fullscreen</button>";

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id', this.canvasid);

    // Create div canvas
    this.divcanvas = document.createElement('div');
    this.divcanvas.style.cssFloat = 'left';
    this.divcanvas.appendChild(this.canvas);
    
    //Append tools and canvas to the widget   
    this.widget.appendChild(this.tools);
    this.widget.appendChild(this.divcanvas);
    
    $('body').append(this.widget);
    
    
};

vxlView3DWidget.prototype.bindEvents = function(){
var self = this;
    
    $(this.widget).draggable({drag:function(event,ui){ 
            if (self.view.state == vox.def.view2d.state.painting){
                return false;
            }
        }, zIndex: 1000, 
        start:function(event,ui){ $(this).css('z-index',incr_depth_var++)},
        cancel: "canvas"
    });
    

    
    $('#'+this.widgetid+"-fullscreen").button({icons:{ primary:"ui-icon-arrowthick-2-ne-sw"}, text:false});
    $('#'+this.widgetid+"-fullscreen").click({widget:self},function(e){

        var cx =0, cy =0;
        if (!self.fullscreen){
            
            cx = window.innerWidth;
            cy = window.innerHeight;
            self.fullscreen = true;
        }
        else{
            cx = self.originalWidth;
            cy = self.originalHeight;
            self.fullscreen = false;
        }    
        self.width = cx;
        self.height = cy;
        self.top = 1;
        self.left = 1;
        
        
        self.widget.width = 30 + cx + 21;
        self.widget.height = cy + 5;
        self.widget.style.top =  '1px';
        self.widget.style.left = '1px';
        self.widget.style.width = self.widget.width + 'px';
        self.widget.style.height = self.widget.height + 'px';
        
        
        self.canvas.width = cx;
        self.canvas.height = cy;
        self.view.resize();
        
        
    });    
};

vxlView3DWidget.prototype.configureGUI = function(left,top,width,height){
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.widget.style.top =  this.top +'px';
    this.widget.style.left = this.left + 'px';
    this.widget.style.width = this.width  + 'px'
    this.widget.style.height = this.height +'px';
    this.canvas.setAttribute('width', this.width -50 );
    this.canvas.setAttribute('height', this.height -5);
    var d = $(this.divcanvas);d.css('background-color','black');
    if (this.view == undefined){
        this.view = vxl.api.setup(this.canvasid);
    }
    else{
        this.view.refresh();
    }

};

/*-------------------------------------------------------------------------*/

function vxlStatusBarWidget(id, left,top,width,height){
    this.widget = document.createElement('div');
    this.widget.setAttribute('id', id);
    this.widget.style.position = 'absolute';
    this.widget.className = 'widget';
    this.widget.style.position = 'absolute';
    this.widget.style.top =  top +'px';
    this.widget.style.left = left + 'px';
    this.widget.style.width = width + 'px'
    this.widget.style.height = height +'px';
    this.widget.innerHTML = 'status bar';
    this.widget.style.textAlign = 'center';
    this.widget.style.fontSize = '13px';
    this.widget.style.fontWeight = 'bold';
    this.widget.style.fontFamily = 'Arial,Verdana,Helvetica';
    this.widget.style.color = '#555555';
    $('body').append(this.widget);
    
    $(this.widget).draggable();
};
