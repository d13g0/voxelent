if (typeof(vxl) == 'undefined'){vxl = {};}

vxl.ver = "_v0.1";
vxl.slug = "c4rd4m0m"

vxl.loader = {
    required :[
    	 'voxlib/required/jquery-1.4.2.min.js'
    ],

	core : [
	
		 'vxl/VXL',
		 'vxl/Notifier', 
		 'vxl/Math3D', 
		 'camera/Camera', 
		 'camera/CanvasListener', 
		 'camera/TrackballCameraInteractor', 
		 'view/render/Renderer', 
		 'view/render/Shader', 
		 'view/render/DefaultShadingProgram', 
		 'view/actor/Actor', 
		 'view/actor/ActorManager', 
		 'view/actor/LookupTable', 
		 'view/actor/LookupTableManager', 
		 'view/actor/BoundingBox', 
		 'view/actor/Axis', 
		 'view/View', 
		 'scene/Model', 
		 'scene/ModelManager', 
		 'vxl/API', 
		 'animation/Animation', 
		 'vxl/Main'
    ],
    
	run : function(){
    
            for (var c = 0; c < this.required.length; c++){
            	var x = vxl.slug + '/'+ this.required[c] + vxl.ver + '.js';
                this.load(x);
            }
            
			for (var c = 0; c < this.core.length; c++){
                var x = vxl.slug + '/voxlib/core/' + this.core[c]+vxl.ver+'.js';
                //console.info(x);
                this.load(x);
			}
            
            
		},
    
    load : function(file){
        var voxCode = document.createElement('script')
        voxCode.setAttribute("type","text/javascript")
        voxCode.setAttribute("src", file);
        document.getElementsByTagName("head")[0].appendChild(voxCode);
    }
        
};

vxl.loader.run();
