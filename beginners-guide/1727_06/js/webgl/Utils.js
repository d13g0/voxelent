
var	Utils = {
	
	/**
	* Obtains a WebGL context for the canvas with id 'canvas-element-id'
	* This function is invoked when the WebGL app is starting.
	*/
	getGLContext : function(name){
	    
		var canvas = document.getElementById(name);
		var ctx = null;
		
		if (canvas == null){
			alert('there is no canvas on this page');
			return null;
		}
		else {
			c_width = canvas.width;
			c_height = canvas.height;
		}
				
		var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	
		for (var i = 0; i < names.length; ++i) {
		try {
			ctx = canvas.getContext(names[i]);
		} 
		catch(e) {}
			if (ctx) {
				break;
			}
		}
		if (ctx == null) {
			alert("Could not initialise WebGL");
			return null;
		}
		else {
			return ctx;
		}
	},
	
	requestAnimFrame : function(o){
		requestAnimFrame(o);
	},
    
    //indices have to be completely defined NO TRIANGLE_STRIP only TRIANGLES
    calculateNormals : function(vs, ind){
        var x=0; 
        var y=1;
        var z=2;
        
        var ns = [];
        for(var i=0;i<vs.length;i=i+3){ //for each vertex, initialize normal x, normal y, normal z
            ns[i+x]=0.0;
            ns[i+y]=0.0;
            ns[i+z]=0.0;
        }
        
        for(var i=0;i<ind.length;i=i+3){ //we work on triads of vertices to calculate normals so i = i+3 (i = indices index)
            var v1 = [];
            var v2 = [];
            var normal = [];	
            //p2 - p1
            v1[x] = vs[3*ind[i+2]+x] - vs[3*ind[i+1]+x];
            v1[y] = vs[3*ind[i+2]+y] - vs[3*ind[i+1]+y];
            v1[z] = vs[3*ind[i+2]+z] - vs[3*ind[i+1]+z];
            //p0 - p1
            v2[x] = vs[3*ind[i]+x] - vs[3*ind[i+1]+x];
            v2[y] = vs[3*ind[i]+y] - vs[3*ind[i+1]+y];
            v2[z] = vs[3*ind[i]+z] - vs[3*ind[i+1]+z];
            //cross product by Sarrus Rule
            normal[x] = v1[y]*v2[z] - v1[z]*v2[y];
            normal[y] = v1[z]*v2[x] - v1[x]*v2[z];
            normal[z] = v1[x]*v2[y] - v1[y]*v2[x];
            for(j=0;j<3;j++){ //update the normals of that triangle: sum of vectors
                ns[3*ind[i+j]+x] =  ns[3*ind[i+j]+x] + normal[x];
                ns[3*ind[i+j]+y] =  ns[3*ind[i+j]+y] + normal[y];
                ns[3*ind[i+j]+z] =  ns[3*ind[i+j]+z] + normal[z];
            }
        }
        //normalize the result
        for(var i=0;i<vs.length;i=i+3){ //the increment here is because each vertex occurs with an offset of 3 in the array (due to x, y, z contiguous values)
        
            var nn=[];
            nn[x] = ns[i+x];
            nn[y] = ns[i+y];
            nn[z] = ns[i+z];
            
            var len = Math.sqrt((nn[x]*nn[x])+(nn[y]*nn[y])+(nn[z]*nn[z]));
            if (len == 0) len = 1.0;
            
            nn[x] = nn[x]/len;
            nn[y] = nn[y]/len;
            nn[z] = nn[z]/len;
            
            ns[i+x] = nn[x];
            ns[i+y] = nn[y];
            ns[i+z] = nn[z];
        }
        
        return ns;
    },
 

    calculateTangents : function(vertices, normals)
    {
        var vs = vertices;
        var ts = [];
        for(var i=0;i<vs.length; i++){
            ts[i]=0.0;
        }
        return ts;
    }
}
	
	/**
	* Provides requestAnimationFrame in a cross browser way.
	*/
	requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
	})();
	