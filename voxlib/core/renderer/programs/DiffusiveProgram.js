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

/**
 * @class
 */
vxl.def.glsl.diffusive = {
	
	NAME : 'diffusive',

	ATTRIBUTES : [
	"aVertexPosition", 
	"aVertexColor", 
	"aVertexNormal"],
	
	UNIFORMS : [
	"uPMatrix",
	"uNMatrix",
	"uMVMatrix",
	"uOpacity",
	"uPointSize",
	"uUseVertexColors",
	"uObjectColor",
	"uUseShading",
	"uAmbientColor",
	"uDirectionalColor",
	"uLightingDirection",
	"uUseVertexColors"
	],
	
	
    VERTEX_SHADER : [

    "attribute vec3 aVertexPosition; ",
    "attribute vec3 aVertexNormal; ",
    "attribute vec4 aVertexColor;",
    "uniform mat4 uMVMatrix; ",
    "uniform mat4 uPMatrix; ",
    "uniform mat4 uNMatrix; ",
    "uniform vec3 uLightingDirection;",
    "uniform vec4 uDirectionalColor;",
    "uniform vec4 uAmbientColor;",
    "uniform vec4 uObjectColor;",
    "uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform float uPointSize;",
    "varying vec4 vColor;",
    "varying vec4 vAux;",
    "void main(void) {",
    "   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); ",
    "	if(uUseVertexColors) {",
    "        vAux = aVertexColor;",
    "   }",
    "   else {",
    "		 vAux = uObjectColor;",
    "   }",
    "   if(uUseShading) {",
    "		vec4 transformedNormal = uNMatrix * vec4(aVertexNormal, 1.0);",
    "	    float directionalLightWeighting = max(dot(transformedNormal.xyz,uLightingDirection),0.0);",
    "	    vColor = vAux * (uAmbientColor + uDirectionalColor * directionalLightWeighting);",
    "	}",
    "   else {",
    "		vColor = vAux;",
    "   }",
    "   gl_PointSize = uPointSize;",
    "}"].join('\n'),
    
    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",

    "uniform float uOpacity;",
    "varying vec4  vColor;",

    "void main(void)  {",
    "		gl_FragColor = vec4(vColor.rgb,uOpacity);",
    "}"].join('\n'),
    
    DEFAULTS : {
        "uLightingDirection" : [0.0,0.3,1.0],
        "uDirectionalColor"  : [0.68,0.68,0.68,1.0],
        "uAmbientColor"      : [0.24,0.24,0.24,1.0]
    }
}