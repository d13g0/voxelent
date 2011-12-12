
function vxlShader(ctx){
	this.program = null;
	this.gl = ctx;
}

vxlShader.prototype.useProgram = function(prg){
	this.program = prg;
	this.init();
}

vxlShader.prototype.createShader = function(type){
	var shader =  null;
	var gl = this.gl;
	
	if (type == vxl.def.VERTEX_SHADER){
		shader = gl.createShader(gl.VERTEX_SHADER);
	}
	else if (type == vxl.def.FRAGMENT_SHADER){
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}

	
	var code = this.program.getCode(type);
	
	if (code == null) {alert('Error getting the code for shader of type ' + type); return null;}
	
	gl.shaderSource(shader, code);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

vxlShader.prototype.init = function(){
	
	var vertexShader = this.createShader(vxl.def.VERTEX_SHADER);
	var fragmentShader = this.createShader(vxl.def.FRAGMENT_SHADER);
	
	var prg = this.gl.createProgram();
	this.gl.attachShader(prg, vertexShader);
	this.gl.attachShader(prg, fragmentShader);
	this.gl.linkProgram(prg);

	if (!this.gl.getProgramParameter(prg, this.gl.LINK_STATUS)) {
		alert("Could not initialise shading program");
	}
	this.gl.useProgram(prg);
	this.program.setReferences(prg);
}

vxlShader.prototype.setUniform3f = function(name,vec){
	var u = this.program.getUniformReference(name);
	if (u == null) {
		message('uniform ' +  name  + ' does not exist');
	}
	else{
		this.gl.uniform3f(u,vec[0],vec[1],vec[2]);
	}
	
}

vxlShader.prototype.setUniform1i = function(name,flag){
	var u = this.program.getUniformReference(name);
	if (u == null) {
		message('uniform ' +  name  + ' does not exist');
	}
	else{
		this.gl.uniform1i(u,flag);
	}
	
}

vxlShader.prototype.setUniform1f = function(name,flag){
	var u = this.program.getUniformReference(name);
	if (u == null) {
		message('uniform ' +  name  + ' does not exist');
	}
	else{
		this.gl.uniform1f(u,flag);
	}
	
}

vxlShader.prototype.setMatrixUniform = function(name, m){
	var u = this.program.getUniformReference(name);
	this.gl.uniformMatrix4fv(u,false,m.getAsFloat32Array());
}

vxlShader.prototype.enableVertexAttribArray = function(name){
	var a = this.program.getAttributeReference(name);
	this.gl.enableVertexAttribArray(a);
}

vxlShader.prototype.disableVertexAttribArray = function(name){
	var a = this.program.getAttributeReference(name);
	this.gl.disableVertexAttribArray(a);
}

vxlShader.prototype.setVertexAttribPointer = function(name, numElements, type, norm,stride,offset){
	var a = this.program.getAttributeReference(name);
	this.gl.vertexAttribPointer(a,numElements, type, norm, stride, offset);
}

vxlShader.prototype.setDefaults = function(){
	this.program.setDefaults();
}