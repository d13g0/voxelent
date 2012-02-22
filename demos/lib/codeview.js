var cview = new CodeViewer();

$(window).resize(function(){cview.updateCanvasSize();});

function CodeViewer(){
	this.code = [];
    
	this.TIMER = 0;
	this.WAIT = 1000;
    
    this.MODE_VIEW = 0;
    this.MODE_VIEW_AND_CODE = 1;
    this.MODE_VIEW_AND_CONTROLS = 2;
    this.NO_CONTROLS = false;
    this.mode = this.MODE_VIEW;
    this.height = 400;
}

CodeViewer.prototype.loadSource = function(idx){
	
	if (idx>=0 && idx <this.code.length){
		$('#codeContainer').empty();
		var c  = document.createElement("code");
		c.id = 'codeArea';
		c.innerHTML = this.code[idx];
		$('#codeContainer').append(c);
	}
}
CodeViewer.prototype.showViewAndCode = function(){
    $('#canvasContainer, #codeContainer, #buttonsCode, #bottom').fadeOut(600).hide();
    this.updateHeight(400);
	$('#bottom').width('100%');
    $('#buttons').after($('#bottom').detach());
   	$('#canvasContainer').width('39%');
	$('#codeContainer, #buttonsCode, #canvasContainer, #bottom').fadeIn(600);
   	this.updateCanvasSize();
	this.mode = this.MODE_VIEW_AND_CODE;
}

CodeViewer.prototype.showViewAndControls = function(){
	$('#canvasContainer, #codeContainer, #buttonsCode, #bottom').fadeOut(600).hide();
	this.updateHeight(400);
    $('#contents').prepend($('#bottom').detach());
	$('#canvasContainer').width('39%');
	$('#bottom').width('60%');
	$('#bottom, #canvasContainer').fadeIn(600);
    this.updateCanvasSize();
	this.mode = this.MODE_VIEW_AND_CONTROLS;
}

CodeViewer.prototype.showView = function(){
    $('#canvasContainer, #codeContainer, #buttonsCode, #bottom').fadeOut(600).hide();
    this.updateHeight(this.height);
    $('#buttons').after($('#bottom').detach());
	$('#canvasContainer, #bottom').width('100%').fadeIn(600);
	this.updateCanvasSize();
	this.mode = this.MODE_VIEW;

}

CodeViewer.prototype.updateCanvasSize = function(){
    c_width = $('#canvasContainer').width();
    c_height = $('#canvasContainer').height();
    $('canvas').attr('width',c_width);
    $('canvas').attr('height',c_height);
}

CodeViewer.prototype.updateHeight = function(h){
	$('#canvasContainer, #codeContainer, #contents').css('height',h+'px');
}

CodeViewer.prototype.updateGUI = function(){

    var canvas_container = document.getElementById('canvasContainer');
    
    //1. Create DOM Elements
	var buttons = document.createElement('div');
    buttons.id = 'buttons';
    
    var buttons_code = document.createElement('div');
    buttons_code.id = 'buttonsCode';
    buttons_code.innerHTML = 
    "<input type='radio' id='btnSourceCode' name='radio' onclick='cview.loadSource(0)' checked='checked'/><label for='btnSourceCode'>WebGL JS</label>"+
    "<input type='radio' id='btnVertexShader' name='radio' onclick='cview.loadSource(1)'  /><label for='btnVertexShader'>Vertex Shader</label>"+	
    "<input type='radio' id='btnFragmentShader' name='radio' onclick='cview.loadSource(2)' /><label for='btnFragmentShader'>Fragment Shader</label>"+
    "<input type='radio' id='btnHTML' name='radio' onclick='cview.loadSource(3)' /><label for='btnHTML'>HTML</label>";
    
    var buttons_canvas = document.createElement('div');
    buttons_canvas.id = 'buttonsCanvas';
    
    var btnFullView = document.createElement('input');
    btnFullView.id = 'btnFullView';
    btnFullView.setAttribute('type','radio');
	btnFullView.setAttribute('name','mode');
	btnFullView.setAttribute('value','view');
    
	var btnShowCode = document.createElement('input');
    btnShowCode.id = 'btnShowCode';
    btnShowCode.setAttribute('type','radio');
	btnShowCode.setAttribute('name','mode');
	btnShowCode.setAttribute('value','code');
	
	var btnShowControls = document.createElement('input');
	btnShowControls.id = 'btnShowControls';
	btnShowControls.setAttribute('type','radio');
	btnShowControls.setAttribute('name','mode');
	btnShowControls.setAttribute('value','controls');
	
    buttons_canvas.appendChild(btnFullView);
	buttons_canvas.appendChild(btnShowCode);
	if(!this.NO_CONTROLS)	buttons_canvas.appendChild(btnShowControls);
		
	if (this.mode == this.MODE_VIEW){
		btnFullView.setAttribute('checked','checked');
	}
	else if (this.mode == this.MODE_VIEW_AND_CODE){
		btnShowCode.setAttribute('checked','checked');
	}
	else if (this.mdoe == this.MODE_VIEW_AND_CONTROLS){
		btnShowControls.setAttribute('checked','checked');
	}
	
	
	
    
    buttons.appendChild(buttons_code);
    buttons.appendChild(buttons_canvas);
    
    var code_container = document.createElement('pre');
    code_container.id = 'codeContainer';
    code_container.class = 'prettyprint linenums';
    
    var code_area = document.createElement('code');
    code_area.id = 'codeArea';

    code_container.appendChild(code_area);
	
	var bottom = document.getElementById('bottom');
    
    
    //2. Decide on the state of the DOM Elements upon current mode of the CodeViewer
    
    if(this.mode == this.MODE_VIEW){
        canvas_container.style.width    = '100%';
        code_container.style.display    = 'none';
        buttons_code.style.display      = 'none';
        btnFullView.checked             = true;
		bottom.style.display			= 'block';
    }
    else if (this.mode == this.MODE_CODE_AND_VIEW){
        code_container.style.display    = 'block';
        buttons_code.style.display      = 'block';
		
        btnFullView.checked             = false;
		bottom.style.display			= 'block';

    }
    else if (this.mode == this.MODE_VIEW_AND_CONTROLS){
		canvas_container.style.width    = '39%';
		code_container.style.display    = 'none';
		buttons_code.style.display      = 'none';
		bottom.style.width				= '60%';
		bottom.style.position			= 'relative';
    }
	
	    
   
    //3. Assembling GUI
    $('#canvasContainer').before(code_container);$('#bottom').before(buttons);
    
	if(this.mode == this.MODE_VIEW_AND_CONTROLS){
		$('#contents').prepend($('#bottom').detach());
	}
    //4. Look and Feel
    
    $('#btnFullView').after("<label id='lblFullView' for='btnFullView'>View</label>");
	$('#btnShowCode').after("<label id='lblShowCode' for='btnShowCode'>Code</label>");
	$('#btnShowControls').after("<label id='lblShowControls' for='btnShowControls'>Controls</label>");
	$('#buttonsCanvas').buttonset();
	
	$('#buttonsCode').buttonset(); 
    
	$('input[name="mode"]').change(function(){
		var mode = $('input[name="mode"]:checked').val();
		if (mode == 'view'){
			cview.showView();
		}
		else if (mode == 'controls'){
			cview.showViewAndControls();
		}
		else if (mode == 'code'){
			cview.showViewAndCode();
		}
	});
	   
	   
    this.updateHeight(this.height);
    //5. Show Canvas
    this.updateCanvasSize();
	var selector;
	if(this.mode == this.MODE_VIEW){
		selector = '#canvasContainer';
	}
	else if (this.mode == this.MODE_VIEW_AND_CONTROLS){
		selector = '#canvasContainer, #bottom';
	}
	
	$(selector).fadeIn(600);
}


CodeViewer.prototype.run = function(m,nc,h){
    if(m != null) this.mode = m;
	if (nc != null && nc == true) this.NO_CONTROLS = true;
    if (h != null) this.height = h;
	
    if (this.mode == this.MODE_VIEW_AND_CODE){
        $('#canvasContainer').before("<pre id='codeContainer' class='prettyprint linenums'><p class='wait'>One moment please. Loading source code ...</p></pre>");
    }
	
	this.TIMER = setInterval((function(self) {return function() {self.execute();}})(this),this.WAIT);
}

CodeViewer.prototype.execute = function(){
	
	if(this.TIMER) clearInterval(this.TIMER);
	
	this.code[0] = window.prettyPrintOne($('#code-js').html(),'js',true);
	
	this.code[1] = window.prettyPrintOne($('#shader-vs').html(),'js',true);
	
	this.code[2] = window.prettyPrintOne($('#shader-fs').html(),'js',true);
	
	$('#codeContainer, #cview').remove();
    var html = $(document.body).html().replace(/</g,'&lt;').replace(/>/g,'&gt;');
	html = "&lt;body onLoad='runWebGLApp()'&gt;" + html + "&lt;/body&gt;"; 
	this.code[3] = window.prettyPrintOne(html,'html',true);
	
	this.updateGUI();
 	
	this.loadSource(0);
	
}


