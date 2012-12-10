var currentSlice = 0;
var clickX = {};
var clickY = {};
var clickDrag = {};
var currentView = 0;
var imgWidth = 0;
var imgHeight = 0;
var zoomVal = 1;
var magnifyVal = 1;
var paint = false;
var imageSource = new Array();
var canvasName = "";
var canvas = "";
var context = "";
var mouseX;
var mouseY;
var viewX;
var pencil = false;
var clear = false;
var zoomin = false;
var zoomout = false;
var s = 1;

   
   function paintCanvas() {
		
			var Source_axial = ["MR/axial0085.png", "MR/axial0086.png","MR/axial0087.png","MR/axial0088.png","MR/axial0089.png","MR/axial0090.png","MR/axial0091.png","MR/axial0092.png","MR/axial0093.png","MR/axial0094.png","MR/axial0095.png", "MR/axial0096.png", "MR/axial0097.png","MR/axial0098.png","MR/axial0099.png","MR/axial0100.png","MR/axial0101.png"];
			
			var Source_sagittal = ["MR/sagittal0085.png", "MR/sagittal0086.png","MR/sagittal0087.png","MR/sagittal0088.png","MR/sagittal0089.png","MR/sagittal0090.png","MR/sagittal0091.png","MR/sagittal0092.png","MR/sagittal0093.png","MR/sagittal0094.png","MR/sagittal0095.png", "MR/sagittal0096.png", "MR/sagittal0097.png","MR/sagittal0098.png","MR/sagittal0099.png","MR/sagittal0100.png","MR/sagittal0101.png"];
			
			var Source_coronal = ["MR/coronal0085.png", "MR/coronal0086.png","MR/coronal0087.png","MR/coronal0088.png","MR/coronal0089.png","MR/coronal0090.png","MR/coronal0091.png","MR/coronal0092.png","MR/coronal0093.png","MR/coronal0094.png","MR/coronal0095.png", "MR/coronal0096.png", "MR/coronal0097.png","MR/coronal0098.png","MR/coronal0099.png","MR/coronal0100.png","MR/coronal0101.png"];	
					
			
					
			clickX.axial = []; clickX.sagittal=[]; clickX.coronal = [];
			clickY.axial = []; clickY.sagittal=[]; clickY.coronal = [];
			clickDrag.axial = []; clickDrag.sagittal=[]; clickDrag.coronal=[];
			
			
			for(var slice = 0, max =Source_axial.length; slice <max; slice++){
				var image = new Image();
				image.src = Source_axial[slice];
				Source_axial[slice] = image;
				clickX.axial[slice] 		= [];
				clickY.axial[slice] 		= [];
				clickDrag.axial[slice] 	= [];
			}
			
			for(var slice = 0, max =Source_sagittal.length;  slice <max; slice++){
			var image = new Image();
				image.src = Source_sagittal[slice];
				Source_sagittal[slice] = image;
				clickX.sagittal[slice] 		= [];
				clickY.sagittal[slice] 		= [];
				clickDrag.sagittal[slice] 	= [];
			}
			
			for(var slice = 0, max =Source_coronal.length;  slice <max; slice++){
				var image = new Image();
				image.src = Source_coronal[slice];
				Source_coronal[slice] = image;
				clickX.coronal[slice] 		= [];
				clickY.coronal[slice] 		= [];
				clickDrag.coronal[slice] 	= [];
			}
			
			

			canvasName = "#myCanvas";
			canvas = document.getElementById("myCanvas");
			context = canvas.getContext("2d");
			context.drawImage(Source_axial[0], 30, 30);	
			context.drawImage(Source_sagittal[0], 630, 30);	
			context.drawImage(Source_coronal[0], 1230, 30);	
			imgWidth = Source_axial[0].width;
			imgHeight = Source_axial[0].height;
			
			context.strokeStyle = $('#myColour').css('background-color');
			context.lineJoin = "round";
			context.lineWidth = 5;	
			
			
		$(canvasName).mousemove(function (e) {
			if(paint){
				addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
				redraw();
				}
				
		});
					
		$(canvasName).mousedown(function (event) { 
				if (pencil)
				{
				context.strokeStyle = $('#myColour').css('background-color');
				var mouseX = event.pageX - this.offsetLeft;
				var mouseY = event.pageY - this.offsetTop;
				paint = true;
				giveMeTheView(event);
				addClick(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
				redraw();
				}
		});
		
		$(canvasName).mouseup	(function (e) { paint = false; });
			
		$(canvasName).mouseleave(function (e) { paint = false; });

		$(canvasName).mousewheel(function(e, delta) {

				giveMeTheView(e.originalEvent);
				
				if (currentView ==0) { alert('select a view first'); return;}
				
				if (e.originalEvent.detail> 0) 
				{
					if (e.altKey)
					{
						if (s < 2)
							s += 0.1*s;
						scaleFunc();
						redraw();
					}
					else
					{
						if (currentSlice > 15){
							currentSlice = 15;
						}
						scaleFunc();
						currentSlice ++;
					}
				}
				else
				{
					if (e.altKey)
					{
						if (s > 0.5)
							s -= 0.1*s ;
						scaleFunc();
						redraw();
					}
					else
					{
						currentSlice --;
						if (currentSlice < 0) {
							currentSlice = 0;
						}
						scaleFunc();
					}
				}
				context.width = context.width;
				redraw();
			
			});
			
			
		function addClick(x, y, dragging){
				  clickX[currentView][currentSlice].push(x);
				  clickY[currentView][currentSlice].push(y);
				  clickDrag[currentView][currentSlice].push(dragging);
			}
			
		function redraw(){
				
				
				 var currX = clickX[currentView][currentSlice];
				 var currY = clickY[currentView][currentSlice];
				 var currDrag = clickDrag[currentView][currentSlice];
				 var centerX = viewX + (imgWidth/2);
                 var centerY = 30 + (imgHeight/2);
				 
					for(var i=0; i < clickX[currentView][currentSlice].length; i++)
					  {
					    var xp = s*currX[i-1]+centerX*(1-s);
						var yp = s*currY[i-1]+centerY*(1-s);
						var xpp = s*currX[i]+centerX*(1-s);
						var ypp = s*currY[i]+centerY*(1-s);
					
						context.beginPath();
						if(currDrag[i] && i){
							context.moveTo(xp, yp);
						 }else{
							context.moveTo(xpp-1, ypp);
						 }
						context.lineTo(xpp, ypp);
						context.closePath();
						context.stroke();
						
					  }		
				//context.gobalCompositeOperation = currentCompositeOp;		
			}
			
		function giveMeTheView(event){
			if ((event.pageX > 30 && event.pageX < 630)){
						view = Source_axial;
						viewX = 30;
						currentView = 'axial';
			}
			else if ((event.pageX > 630 && event.pageX < 1230)){
					view = Source_sagittal;
					viewX = 630;
					currentView = 'sagittal';
			}
			else if ((event.pageX > 1230 && event.pageX < 1830))	{
					view = Source_coronal;
					viewX = 1230;
					currentView = 'coronal';
			}
		}
		
		function scaleFunc(){
			// Save the current context
			context.save();
			// Translate to the center point of our image
			context.translate(viewX + imgWidth * 0.5, 30 + imgHeight * 0.5);
			// Perform the scale
			context.scale(s, s);
			// Translate back to the top left of our image
			context.translate(-imgWidth * 0.5, -imgHeight * 0.5);
			// Draw the image
			context.drawImage(view[currentSlice], 0, 0);
			// Restore the context ready for the next draw
			context.restore();
		}
		
		// Pencil tool selected
		$("ul li:eq(2)").click(function(e) { pencil = true;});
		// Clear tool selected
		$("ul li:eq(3)").click(function(e) { 
			clickX[currentView][currentSlice] = {};
			clickY[currentView][currentSlice] = {};
			context.drawImage(view[currentSlice], viewX, 30);
			pencil = false;
		});
		// Zoom in tool selected
		$("ul li:eq(4)").click(function(e) { 
		zoomin = true;
		
		});
		
		
  }
