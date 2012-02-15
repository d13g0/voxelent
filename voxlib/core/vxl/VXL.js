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
/*------------------------------------------------------------*/
// Checking for JQuery
/*------------------------------------------------------------*/
if (!jQuery){
	alert('Voxelent: jQuery is not loaded. Please include JQuery in your page');	
}

/*------------------------------------------------------------*/
// Section 1: General 
/*------------------------------------------------------------*/

if (typeof(vxl) == 'undefined'){vxl = {};} //Library namespace

vxl.version = 
{
	number : '0.85',
	codename : 'c4n314',
	plugins  : []
};


/*------------------------------------------------------------*/
// Section 2: Defaults / Definitions
/*------------------------------------------------------------*/
/**
 * Voxelent Definitions
 * @class
 */
vxl.def = {
	glsl			: {
						VERTEX_SHADER   : 'VERTEX_SHADER',
						FRAGMENT_SHADER : 'FRAGMENT_SHADER'
					},
	lut             : {
						list : ["default","aal","autumn","blackbody","bone","brodmann","cardiac",
								"copper","cortex","cte","french","fs","ge_color","gold","gooch",
								"hot","hotiron","hsv","jet","nih","nih_fire","nih_ice","pink",
								"rainramp","spectrum","surface","x_hot","x_rain"],
						main:"default",
						
						folder:"voxdata/luts"
				    },
	
	model			: {
						folder:"voxdata/models",
						diffuse: [0.9,0.0,0.0,1.0]
					},
    
    view			: {
    					background: [135/256,135/256,135/256,1.0]
    				},			      
	
	actor			: {
						mode: {	SOLID:'SOLID', WIREFRAME:'WIREFRAME', POINTS:'POINTS'}
					},
	
	camera          : {
						task      : {	NONE : 0,	PAN : 1,	ROTATE : 2,	DOLLY : 3	},
    					type      : { ORBITING: 'ORBITING', TRACKING : 'TRACKING'}
					},
	
	asset			: {
						 loadingMode     : { LIVE:'LIVE', LATER:'LATER', DETACHED:'DETACHED'}
					},				 	

	renderer 		: {
			        mode: { TIMER:'TIMER', ANIMFRAME:'ANIFRAME'}, //EXPERIMENTAL NOT WAY TO CANCEL YET },
			        rate : { SLOW: 10000,  NORMAL: 500 }
					}
};

vxl.events = {
	DEFAULT_LUT_LOADED 	: 'vxl.events.DEFAULT_LUT_LOADED',
	SCENE_UPDATED		: 'vxl.events.SCENE_UPDATED',
	MODELS_LOADED		: 'vxl.events.MODELS_LOADED'
};
/*------------------------------------------------------------*/
// Section 3: Globals Objects (go)
/*------------------------------------------------------------*/

vxl.go = {
    axisOn 			    : true,
    debug 	 		    : true,					  
    views 			    : [], //array
	_rates			    : [],
    timid 			    : 0,
    notifier            : undefined,
    assetManager        : undefined,
    lookupTableManager  : undefined,
    gui                 : undefined,
    
	render : function(){
		vxl.c.view.renderer.render(); 
		this.timid = window.requestAnimFrame(vxl.go.render);
	},
	
	cancelRender : function(){
		//message('vxl.go.cancelRender invoked'); 
		window.cancelRequestAnimFrame(this.timid);    // not implemented yet in any browser :(
	},
	
	slowRendering : function(){
		//message('slow rendering...');
		vxl.go._rates = [];
		for(var i = 0; i < vxl.go.views.length; i++){
			//message('saving previous rate: ' +i+' - '+ vxl.go.views[i].renderer.renderRate);
			vxl.go._rates.push(vxl.go.views[i].renderer.renderRate);
			vxl.go.views[i].renderer.setRenderRate(vxl.def.renderer.rate.SLOW);
		}
	},
	
	normalRendering : function(){
		//message('back to normal rendering....');
		for(var i = 0; i < vxl.go.views.length; i++){
			vxl.go.views[i].renderer.setRenderRate(vxl.go._rates[i]);
		}
	},
	
	console : function(txt,flag) { 
		if (this.debug == true || flag){
			console.info(txt);
		}
	}
};



/*------------------------------------------------------------*/
// Section 4: Current 
/*------------------------------------------------------------*/

vxl.c = {
	scene		: undefined,
	view		: undefined,
	camera 		: undefined,
	actor 		: undefined,
	animation 	: undefined
}



/*------------------------------------------------------------*/	
//  Section 5: Improvements
/*------------------------------------------------------------*/

Array.prototype.max = function(){
	return Math.max.apply(Math, this);
};

Array.prototype.min = function(){
	return Math.min.apply(Math, this);
};

Array.prototype.hasObject = (
  !Array.indexOf ? function (o)
  {
    var l = this.length + 1;
    while (l -= 1)
    {
        if (this[l - 1] === o)
        {
            return true;
        }
    }
    return false;
  } : function (o)
  {
    return (this.indexOf(o) !== -1);
  }
);




window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();






$(window).bind('focus', vxl.go.normalRendering);
$(window).bind('blur', vxl.go.slowRendering);
