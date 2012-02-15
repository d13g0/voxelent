vxl.go.gui = new gui(); 

function gui(){
	vxl.go.notifier.addTarget('vxl.event.all_models_loaded',this);
}

gui.prototype.handleEvent = function(event,source){
	if (event == 'vxl.event.all_models_loaded'){
		message('updating gui with new scene info...');
		this.fillActiveActorCombo();
	}
 }
 
 //THE FOLLOWING METHOD IS CONSIDERED HARD-CODE. REVIEW.
 gui.prototype.doBinding = function(){
    $('#vxl-id-canvas-container').width(40);
	$('#vxl-id-canvas-container').height(40);
	$('#vxl-id-color-background').css('width',50);
	$('#vxl-id-tab-labels').insertBefore('#vxl-id-scene-tab'); //rendering problem WtContainerWidget
	$('#vxl-id-tabs').tabs();
	$('#vxl-id-surface-options').buttonset();
	$('#vxl-id-surface-solid-radiobutton').click(function(){ vxl.api.surfaceON();});
	$('#vxl-id-surface-wireframe-radiobutton').click(function(){vxl.api.wireframeON();});
	$('#vxl-id-surface-points-radiobutton').click(function(){vxl.api.pointsON();});
	$('#vxl-id-reset-view').button({icons: { primary: 'ui-icon-home' } });
	$('#vxl-id-save-view').button({icons:{primary: 'ui-icon-tag'}});
	$('#vxl-id-above-view').button({icons:{primary: 'ui-icon-triangle-1-n'}});
	$('#vxl-id-below-view').button({icons:{primary: 'ui-icon-triangle-1-s'}});
	$('#vxl-id-right-view').button({icons:{primary: 'ui-icon-triangle-1-e'}});
	$('#vxl-id-left-view').button({icons:{primary: 'ui-icon-triangle-1-w'}});
	$('#vxl-id-retrieve-view').button({icons:{primary: 'ui-icon-arrowreturnthick-1-w'}});
	$('#vxl-id-opacity-slider').slider({
		range:"min",
		min:0,
		max:100,
		value:100,
		slide: function(event,ui){
			vxl.api.setActorOpacity(ui.value/100);
		}
	});
	$('#vxl-id-ambientlight-slider').slider({
		range:"min",
		min:0,
		max:100,
		value:50,
		slide: function(event, ui){
			vxl.api.setAmbientColor(ui.value/100,ui.value/100,ui.value/100);
		}
	});
	
	
	$('#vxl-id-combo-active-actor').change(function(){vxl.go.gui.selectActiveActor();});
	
	$('#vxl-id-colorpicker').ColorPicker({
		onSubmit: function(hsb, hex, rgb, el) {
			
			$(el).val(hex);
			$(el).ColorPickerHide();
			vxl.api.setActorColor(rgb.r/256,rgb.g/256,rgb.b/256);
		},
		
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		}
	})
	.bind('keyup', function(){
		$(this).ColorPickerSetColor(this.value);
	});
	
	
	$('#vxl-id-color-background').ColorPicker({
		onSubmit: function(hsb, hex, rgb, el) {
			
			$(el).val(hex);
			$(el).ColorPickerHide();
			vxl.api.setBackgroundColor(rgb.r/256,rgb.g/256,rgb.b/256);
		},
		
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		
		
		onChange:function(hsb, hex, rgb, el) {
			
			$(el).val(hex);
			$(el).ColorPickerHide();
			vxl.api.setBackgroundColor(rgb.r/256,rgb.g/256,rgb.b/256);
		}
	})
	.bind('keyup', function(){
		$(this).ColorPickerSetColor(this.value);
	});
	
  }
  
 gui.prototype.selectActiveActor = function(txt){
		var active = [];
		
		$("#vxl-id-combo-active-actor option:selected").each(function () {
            active.push($(this).text());
        });
		
		if (active[0] == 'all'){
			vxl.c.actor = null;
		}
		else{
			vxl.c.actor = vxl.c.view.actorManager.getActorByName(active[0]);
		}
  }
  
 gui.prototype.fillActiveActorCombo = function(){
	$("#vxl-id-combo-active-actor").html = "";
	 var options = '';
	 var sorted = [];
	 var actors = vxl.c.view.actorManager.actors;
	 
	 message('filling combo with '+actors.length+' actors');
	 for (var i = 0; i < actors.length; i++) {
			sorted.push(actors[i].name);
	  }
	  
	  sorted.sort();
	  
	  options += '<option value="all">all</option>';
      for (var i = 0; i < sorted.length; i++) {
        options += '<option value="' + sorted[i]+ '">' + sorted[i] + '</option>';
      }
      $("#vxl-id-combo-active-actor").html(options);
 }
 

 
 
 /*
gui.prototype.message = function(v){
    var cl  = arguments.callee.caller.name;
	//var msg = cl+': '+v;
	//$('#vxl-id-console-message').html('<p>'+msg+'</p>');
	if (vxl.gui.consoleON) console.info(v);
 }*/