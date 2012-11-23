var Program = {

    /**
    * Utilitary function that allows to set up the shaders (program) using an embedded script (look at the beginning of this source code)
    */
    getShader : function(gl, id) {
       var script = document.getElementById(id);
       if (!script) {
           return null;
       }

        var str = "";
        var k = script.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (script.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (script.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    
    /**
    * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
    * what to do with every vertex and fragment that we pass it. 
    * The vertex shader and the fragment shader together are called the program.
    */
    load : function() {

     var fragmentShader          = Program.getShader(gl, "shader-fs");
     var vertexShader            = Program.getShader(gl, "shader-vs");
     
     prg = gl.createProgram();
     gl.attachShader(prg, vertexShader);
     gl.attachShader(prg, fragmentShader);
     gl.linkProgram(prg);

     if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
     }

     gl.useProgram(prg);

     prg.aVertexPosition  = gl.getAttribLocation(prg, "aVertexPosition");
     prg.aVertexNormal    = gl.getAttribLocation(prg, "aVertexNormal");
     prg.aVertexColor     = gl.getAttribLocation(prg, "aVertexColor");
     
     prg.uPMatrix         = gl.getUniformLocation(prg, "uPMatrix");
     prg.uMVMatrix        = gl.getUniformLocation(prg, "uMVMatrix");
     prg.uNMatrix         = gl.getUniformLocation(prg, "uNMatrix");
     
     prg.uMaterialDiffuse  = gl.getUniformLocation(prg, "uMaterialDiffuse");
     prg.uLightAmbient     = gl.getUniformLocation(prg, "uLightAmbient");
     prg.uLightDiffuse     = gl.getUniformLocation(prg, "uLightDiffuse");
     prg.uLightPosition    = gl.getUniformLocation(prg, "uLightPosition");
     prg.uUpdateLight      = gl.getUniformLocation(prg, "uUpdateLight");
     prg.uWireframe        = gl.getUniformLocation(prg, "uWireframe");
     prg.uPerVertexColor   = gl.getUniformLocation(prg, "uPerVertexColor");


     gl.uniform3fv(prg.uLightPosition,    [0, 120, 120]);
     gl.uniform4fv(prg.uLightAmbient,      [0.20,0.20,0.20,1.0]);
     gl.uniform4fv(prg.uLightDiffuse,      [1.0,1.0,1.0,1.0]); 
    }
}