function PostProcess(canvas, shaderId){
    this.canvas = canvas;
    this.texture = null;
    this.framebuffer = null;
    this.renderbuffer = null;

    this.c_width = this.canvas.width;
    this.c_height = this.canvas.height;

    this.vertexBuffer = null;
    this.textureBuffer = null;

    this.shader = null;
    this.uniforms = {};
    this.attribs = {};

    this.startTime = Date.now();
    
    this.configureFramebuffer();
    this.configureGeometry();
    this.configureShader(shaderId);
};

PostProcess.prototype.configureFramebuffer = function(){
    var self = this;
    var width = this.c_width;
    var height = this.c_height;
    
    //1. Init Color Texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    //2. Init Render Buffer
    this.renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    
    //3. Init Frame Buffer
    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
    
    //4. Clean up
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

PostProcess.prototype.configureGeometry = function(){
    //1. Define the geometry for the fullscreen quad
    var vertices = [
        -1.0,-1.0,
         1.0,-1.0,
        -1.0, 1.0,

        -1.0, 1.0,
         1.0,-1.0,
         1.0, 1.0
    ];

    var textureCoords = [
         0.0, 0.0,
         1.0, 0.0,
         0.0, 1.0,

         0.0, 1.0,
         1.0, 0.0,
         1.0, 1.0
    ];

    //2. Init the buffers
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    //3. Clean up
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

PostProcess.prototype.configureShader = function(id){
    // Compile the shader
    var vertexShader = Program.getShader(gl, "post-common-vs");
    var fragmentShader = Program.getShader(gl, id);

    // Cleans up previously created shader objects if we call configureShader again
    if(this.shader) {
        gl.deleteProgram(this.shader);
    }

    this.shader = gl.createProgram();
    gl.attachShader(this.shader, vertexShader);
    gl.attachShader(this.shader, fragmentShader);
    gl.linkProgram(this.shader);

    if (!gl.getProgramParameter(this.shader, gl.LINK_STATUS)) {
        alert("Could not initialise post-process shader");
    }

    // Store all the attributes and uniforms for later use
    var i, count, attrib, uniform;
    this.attrib = {};
    count = gl.getProgramParameter(this.shader, gl.ACTIVE_ATTRIBUTES);
    for (i = 0; i < count; i++) {
        attrib = gl.getActiveAttrib(this.shader, i);
        this.attrib[attrib.name] = gl.getAttribLocation(this.shader, attrib.name);
    }

    this.uniform = {};
    count = gl.getProgramParameter(this.shader, gl.ACTIVE_UNIFORMS);
    for (i = 0; i < count; i++) {
        uniform = gl.getActiveUniform(this.shader, i);
        this.uniform[uniform.name] = gl.getUniformLocation(this.shader, uniform.name);
    }
};

PostProcess.prototype.validateSize = function(){
    var width = this.canvas.width;
    var height = this.canvas.height;

    if(width != this.c_width || height != this.c_height) {
        //1. Resize Color Texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        //2. Resize Render Buffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        
        //3. Clean up
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this.c_width = width;
        this.c_height = height;
    }
};

PostProcess.prototype.bind = function(){
    // Use the Post Process shader
    gl.useProgram(this.shader);

    // Bind the quad geometry
    gl.enableVertexAttribArray(this.attrib.aVertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.attrib.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.attrib.aVertexTextureCoords);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(this.attrib.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

    // Bind the texture from the framebuffer
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniform.uSampler, 0);

    // If the post process shader uses time as an input, pass it in here
    if(this.uniform.uTime) {
        gl.uniform1f(this.uniform.uTime, (Date.now() - this.startTime)/1000.0);
    }

    // The inverse texture size can be useful for effects which require precise pixel lookup
    if(this.uniform.uInverseTextureSize) {
        gl.uniform2f(this.uniform.uInverseTextureSize, 1.0/this.c_width, 1.0/this.c_height);
    }
};

PostProcess.prototype.draw = function() {
    // Draw the quad!
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};
