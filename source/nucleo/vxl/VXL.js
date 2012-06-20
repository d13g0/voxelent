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

if (!jQuery){
	alert('Voxelent: jQuery is not loaded. Please include JQuery in your page');	
}


/**
* @namespace Voxelent Namespace
* @property {vxl.version}   version     version 
* @property {vxl.def}       def         definition objects
* @property {vxl.go}        go          global objects
* @property {vxl.c}         c           current objects
* 
*/
var vxl = {

/**
* Version
* @namespace Voxelent Version
* @property {String} number         the number of the current version
* @property {String} codename       the codename of the current version
* @property {Array}  plugins        installed plugins if any
*/
version : 
{
   	number : '0.88',
   	codename : 'c4n314',
   	plugins  : []
},

/**
 * @namespace Voxelent Default/Definition Objects
 * @property {vxl.def.glsl}     glsl    GLSL constants
 * @property {vxl.def.lut}      lut     Lookup Table Definitions
 * @property {vxl.def.model}    model   Default values for models
 * @property {vxl.def.view}     view    Default values for views 
 * 
 */
def : {
    /**
     * @namespace GLSL constants
     * @property {String} VERTEX_SHADER Vertex Shader Id
     * @property {String} FRAGMENT_SHADER Fragment Shader Id
     */
	glsl			: { 
						VERTEX_SHADER   : 'VERTEX_SHADER',
                       
						FRAGMENT_SHADER : 'FRAGMENT_SHADER'
					},
    /** 
     * @namespace Lookup Table Definitions 
     * @property {Array}       list         List of lookup tables available
     * @property {String}      main         Lookup table loaded by default
     * @property {String}      folder       Folder relative to the web page where lookup tables can be found
     */                
	lut             : {
             
						list : ["default","aal","autumn","blackbody","bone","brodmann","cardiac",
								"copper","cortex","cte","french","fs","ge_color","gold","gooch",
								"hot","hotiron","hsv","jet","nih","nih_fire","nih_ice","pink",
								"rainramp","spectrum","surface","x_hot","x_rain"],
      
						main:"default",

						folder:""
				    },
	/**
    * @namespace Default values for models
    * @property {String} folder     Default folder where voxelent will look up for models. This folder is relative to the web page
    * @property {Array}  diffuse    A 4-valued array that contains the color for actor's default diffuse property. This array has the format [r,g,b,a]
    */
	model			: { 
						folder:"",
						diffuse: [0.9,0.0,0.0,1.0],
						/** @namespace Enumeration with the different loading modes provided by Voxelent
                          * @property {String} LIVE     Each asset is added to the scene as soon as it is downloaded
                          * @property {String} LATER    The assets are added to the scene only when ALL of them ahve been downloaded
                          * @property {String} DETACHED The assets are never added to the scene. The programmer decides when to do this.
                          */
                         loadingMode     : { LIVE:'LIVE', LATER:'LATER', DETACHED:'DETACHED'}
					},
    /**
    * @namespace Default values for views
    * @property {Array} background  A 4-valued array that contains the default background colour for view. The format is [r,g,b,a]
    */
    view			: {
    					background: [135/256,135/256,135/256,1.0]
    				},			      
	/**
    * @namespace Default values for actors
    * @property {vxl.def.actor.mode}    mode    Actor rendering modes
    */
	actor			: {
                        /** @namespace Actor Rendering Modes 
                        * @property {String} SOLID 
                        * @property {String} WIREFRAME
                        * @property {String} POINTS
                        */
						mode: {	SOLID:'SOLID', WIREFRAME:'WIREFRAME', POINTS:'POINTS'}
					},
	/**
    * @namespace Default values for cameras
    * @property {vxl.def.camera.task} task Enumeration of common camera tasks
    * @property {vxl.def.camera.type} type Camera types available in Voxelent
    */
	camera          : {
                        /** @namespace Enumeration of common camera tasks
                        * @property {Number} NONE
                        * @property {Number} PAN
                        * @property {Number} ROTATE
                        * @property {Number} DOLLY
                        */
						task      : {	NONE : 0,	PAN : 1,	ROTATE : 2,	DOLLY : 3	},
                        /** @namespace Camera types available in Voxelent
                        * @property {String} ORBITING   Orbiting Camera - Around the World
                        * @property {String} TRACKING   Tracking Camera - First Person Camera
                        */
    					type      : { ORBITING: 'ORBITING', TRACKING : 'TRACKING'}
					},
				 	
    /**
    * @namespace Default values for renderers
    * @property {vxl.def.renderer.mode} mode The rendering mode
    * @property {vxl.def.renderer.rate} rate The rendering rat
    */
	renderer 		: {
			        mode: { TIMER:'TIMER', ANIMFRAME:'ANIFRAME'}, //EXPERIMENTAL NOT WAY TO CANCEL YET },
			        rate : { SLOW: 10000,  NORMAL: 500 }
					}
},

/**
* @namespace Voxelent Events
* @property {String} DEFAULT_LUT_LOADED
* @property {String} SCENE_UPDATED
* @property {String} MODELS_LOADED
*/
events : {
	DEFAULT_LUT_LOADED 	: 'vxl.events.DEFAULT_LUT_LOADED',
	SCENE_UPDATED		: 'vxl.events.SCENE_UPDATED',
	MODELS_LOADED		: 'vxl.events.MODELS_LOADED'
},


/**
* @namespace Voxelent Global Objects
* @property {Boolean}                   debug
* @property {vxlNotifier}               notifier
* @property {vxlModelManager}           modelManager
* @property {vxlLookupTableManager}     lookupTableManager
*
*/
go : {
    debug 	 		    : false,					  
    views 			    : [], //TODO: REFACTOR THIS.Remember is here for JQuery focus and blur bindings
	_rates			    : [],
    timid 			    : 0,
    notifier            : undefined,
    modelManager        : undefined,
    lookupTableManager  : undefined,

    
	render : function(){
		vxl.c.view.renderer.render(); 
		this.timid = window.requestAnimFrame(vxl.go.render);
	},
	
	cancelRender : function(){
		//message('vxl.go.cancelRender invoked'); 
		window.cancelRequestAnimFrame(this.timid);    // not implemented yet in any browser :(
	},
	
	slowRendering : function(){

		/*vxl.go._rates = [];
		for(var i = 0; i < vxl.go.views.length; i++){
		    if (vxl.go.views[i].renderer.mode == vxl.def.renderer.mode.ANIMFRAME) continue;
			vxl.go.console('vxl.go.slowRendering: slow rendering on view '+vxl.go.views[i].name,true);
			vxl.go._rates.push(vxl.go.views[i].renderer.renderRate);
			vxl.go.views[i].renderer.setRenderRate(vxl.def.renderer.rate.SLOW);
		}*/
	},
	
	normalRendering : function(){
		
		/*for(var i = 0; i < vxl.go.views.length; i++){
		    if (vxl.go.views[i].renderer.mode == vxl.def.renderer.mode.ANIMFRAME) continue;
			vxl.go.console('vxl.go.normalRendering: go back to normal rendering on view '+vxl.go.views[i].name,true);
			vxl.go.views[i].renderer.setRenderRate(vxl.go._rates[i]);
		}*/
	},
	
	console : function(txt,flag) { 
		if (this.debug == true || flag){
			console.info(txt);
		}
	}
},

/**
* @namespace Voxelent Current Objects
* @property {vxlScene}          scene       the current scene
* @property {vxlView}           view        the current view
* @property {vxlCamera}         camera      the current camera
* @property {vxlActor}          actor       the current actor
* @property {vxlFrameAnimation} animation   the current animation
*/
c : {
	scene		: undefined,
	view		: undefined,
	camera 		: undefined,
	actor		: undefined,  
	animation 	: undefined
}

};



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
})();


$(window).bind('focus', vxl.go.normalRendering);
$(window).bind('blur', vxl.go.slowRendering);
