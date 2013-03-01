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
 * @private
 */
vxl.def.glsl.lambert = {
	
	ID : 'lambert',

	ATTRIBUTES : [
	"aVertexPosition", 
	"aVertexColor", 
	"aVertexNormal",
	"aVertexTextureCoords"],
	
	UNIFORMS : [
	"mModelView",
	"mNormal",
	"mPerspective",
	"mModelViewPerspective",
	"uPointSize",
	"uLightDirection",
	"uLightAmbient",
	"uLightDiffuse",
	"uMaterialDiffuse",
	"uUseVertexColors",
	"uUseShading",
	"uUseTextures",
	"uUseLightTranslation",
	"uSampler"
	],
	
	
    VERTEX_SHADER : [
    
    "attribute vec3 aVertexPosition;",
	"attribute vec3 aVertexNormal;",
	"attribute vec3 aVertexColor;",
	"attribute vec2 aVertexTextureCoords;",
    "uniform float uPointSize;",
	"uniform mat4 mModelView;",
	"uniform mat4 mPerspective;",
	"uniform mat4 mModelViewPerspective;",
	"uniform mat4 mNormal;",
	"uniform vec3 uLightDirection;",
	"uniform vec4 uLightAmbient;",  
	"uniform vec4 uLightDiffuse;",
	"uniform vec4 uMaterialDiffuse;",
	"uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform bool uUseLightTranslation;",
    "uniform bool uUseTextures;",
	"varying vec4 vFinalColor;",
    "varying vec2 vTextureCoords;",
    
    "void main(void) {",
    "	gl_Position = mModelViewPerspective * vec4(aVertexPosition, 1.0);",
    "	gl_PointSize = uPointSize;",
    
    "	if (uUseVertexColors) {",
    "		vFinalColor = vec4(aVertexColor,1.0);",
    "	}",
    "   else {",
    "       vFinalColor = uMaterialDiffuse;",
    "   }",
    "	if (uUseShading){",
    "		vec3 N = vec3(mNormal * vec4(aVertexNormal, 1.0));",
	"		vec3 L = normalize(uLightDirection);",
	"		if (uUseLightTranslation){ L = vec3(mNormal * vec4(L,1.0));}",
	"		float lambertTerm = max(dot(N,-L),0.4);",
	"		vec4 Ia = uLightAmbient;",
	"		vec4 Id = vFinalColor * uLightDiffuse * lambertTerm;",
    "		vFinalColor = Ia + Id;",
	"		vFinalColor.a = uMaterialDiffuse.a;",
	"	}" ,
	"   if (uUseTextures){" ,
	"       vTextureCoords = aVertexTextureCoords;",
    "   }",
	"}"].join('\n'),
    
    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",

    "varying vec4      vFinalColor;",
    "varying vec2      vTextureCoords;",
    "uniform bool      uUseTextures;",
    "uniform sampler2D uSampler;",

    "void main(void)  {",
    "   if (uUseTextures){",
    "       gl_FragColor = texture2D(uSampler, vTextureCoords);",
    "   }",
    "   else{",
    "		gl_FragColor = vFinalColor;",
    "   }",
    "}"].join('\n'),
    
    DEFAULTS : {
        "uLightDirection" 	: [0.0,0.0,-1.0],
        "uLightAmbient"   	: [0.0,0.0,0.0,1.0],
        "uLightDiffuse"   	: [1.0,1.0,1.0,1.0],
        "uMaterialDiffuse" 	: [0.9,0.9,0.9,1.0],
        "uPointSize"		: 1.0,
        "uUseLightTranslation" : false
    }
};