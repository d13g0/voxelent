var cview = new CodeViewer();

function CodeViewer(){
	this.code = [];
	this.TIMER = 0;
	this.WAIT = 1000;
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

CodeViewer.prototype.updateGUI = function(){
	$('#canvasContainer').before("<pre id='codeContainer' class='prettyprint linenums'><code id='codeArea'></code></pre>");
    $('#bottom').before("<div id='buttons'><div id='buttonsCode'>"+
	"<input type='radio' id='btnSourceCode' name='radio' onclick='cview.loadSource(0)' checked='checked'/><label for='btnSourceCode'>WebGL JS</label>"+
	"<input type='radio' id='btnVertexShader' name='radio' onclick='cview.loadSource(1)'  /><label for='btnVertexShader'>Vertex Shader</label>"+	
	"<input type='radio' id='btnFragmentShader' name='radio' onclick='cview.loadSource(2)' /><label for='btnFragmentShader'>Fragment Shader</label>"+
	"<input type='radio' id='btnHTML' name='radio' onclick='cview.loadSource(3)' /><label for='btnHTML'>HTML</label>"+
    "</div>" +
    "<div id='buttonsCanvas'><input type='checkbox' id='btnFullView'><label id='lblFullView' for='btnFullView'>Full View</label></input></div>"+
    "</div>");
	
        $('#buttonsCode').buttonset(); 
        $('#btnFullView').button(); 
        $('#btnFullView').click(
            function(){
                if ($('#btnFullView:checked').val()==null){
                    $('#canvasContainer').fadeOut(600);
                    $('#canvasContainer').hide();
                    $('#canvasContainer').width('39%');
                    $('#codeContainer, #buttonsCode, #canvasContainer').fadeIn(600);
                }
                else{
                    
                    $('#codeContainer, #buttonsCode, #canvasContainer').fadeOut(600);
                    $('#canvasContainer').hide();
                    $('#canvasContainer').width('100%');
                    $('#canvasContainer').fadeIn(600);
                    
                }
                c_width = $('#canvasContainer').width();
                c_height = $('#canvasContainer').height();
                $('canvas').attr('width',c_width);
                $('canvas').attr('height',c_height);
                console.info(c_width+'x'+c_height);
            })
    
}


CodeViewer.prototype.run = function(){
	$('#canvasContainer').before("<pre id='codeContainer' class='prettyprint linenums'><p class='wait'>One moment please. Loading source code ...</p></pre>");
	this.TIMER = setInterval((function(self) {return function() {self.execute();}})(this),this.WAIT);
}

CodeViewer.prototype.execute = function(){
	if(this.TIMER) clearInterval(this.TIMER);
	this.code[0] = window.prettyPrintOne($('#code-js').html(),'js',true);
	this.code[1] = window.prettyPrintOne($('#shader-vs').html(),'js',true);
	this.code[2] = window.prettyPrintOne($('#shader-fs').html(),'js',true);
	$('#codeContainer').remove();
    $('#cview').remove();
	var html = $(document.body).html().replace(/</g,'&lt;').replace(/>/g,'&gt;');
	html = "&lt;body onLoad='runWebGLApp()'&gt;" + html + "&lt;/body&gt;"; 
	this.code[3] = window.prettyPrintOne(html,'html',true);
    this.updateGUI();
	this.loadSource(0);
}


