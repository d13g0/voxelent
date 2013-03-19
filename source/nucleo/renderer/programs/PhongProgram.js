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

vxlPhongProgram.prototype = new vxlProgram();
vxlPhongProgram.prototype.constructor = vxlPhongProgram;

function vxlPhongProgram(){
    this.createFromJSON({

    ID : 'phong',
    
    
    VERTEX_SHADER: [
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexNormal;",
    "attribute vec3 aVertexColor;",
    "attribute vec2 aVertexTextureCoords;",
    "uniform float uPointSize;",
    "uniform mat4 mModelView;",
    "uniform mat4 mPerspective;",
    "uniform mat4 mModelViewPerspective;",
    "uniform mat4 mNormal;",
    "uniform bool uUseVertexColors;",
    "varying vec3 vNormal;",
    "varying vec3 vEyeVec;",
    "varying vec4 vFinalColor;",
    "varying vec2 vTextureCoords;",
    "uniform bool uUseTextures;",
    
    "void main(void) {",
    "  gl_Position = mPerspective * mModelView * vec4(aVertexPosition, 1.0);",
    "  gl_PointSize = uPointSize;",
    "   if(uUseVertexColors) {",
    "       vFinalColor = vec4(aVertexColor,1.0);",
    "       return;",  
    "   }",
    "   vec4 vertex = mModelView * vec4(aVertexPosition, 1.0);",
    "   vNormal = vec3(mNormal * vec4(aVertexNormal, 1.0));",
    "   vEyeVec = -vec3(vertex.xyz);",
    "   if (uUseTextures){" ,
    "       vTextureCoords = aVertexTextureCoords;",
    "   }",
    "}"].join('\n'),

    FRAGMENT_SHADER : [
    "#ifdef GL_ES",
    "precision highp float;",
    "#endif",
    
    "uniform bool uUseShading;",
    "uniform bool uUseVertexColors;",
    "uniform float uShininess;      ",
    "uniform vec3 uLightDirection;  ",
    
    "uniform vec4 uLightAmbient;    ",
    "uniform vec4 uLightDiffuse;    ",
    "uniform vec4 uLightSpecular;   ",
    
    "uniform vec4 uMaterialAmbient; ",
    "uniform vec4 uMaterialDiffuse; ",
    "uniform vec4 uMaterialSpecular;",
    
    "varying vec3 vNormal;",
    "varying vec3 vEyeVec;",
    "varying vec4 vFinalColor;",
    
    "varying vec2      vTextureCoords;",
    "uniform bool      uUseTextures;",
    "uniform sampler2D uSampler;",
    
    "void main(void)",
    "{",
     "  vec4 finalColor = vec4(0.0);",
     "  vec3 L = normalize(uLightDirection);",
     "  vec3 N = normalize(vNormal);",
     "  float lambertTerm = dot(N,-L);",
     "  vec4 Ia = uLightAmbient * uMaterialAmbient;",
     "  vec4 Id = vec4(0.0,0.0,0.0,1.0);",
     "  vec4 Is = vec4(0.0,0.0,0.0,1.0);",
     "  vec4 varMaterialDiffuse = uMaterialDiffuse;",
     "  if(uUseVertexColors) {",
     "        varMaterialDiffuse = vFinalColor;",
     "   }",
     "  if(uUseShading){  ",
     "      if(lambertTerm > 0.0)",
     "      {",
     "          Id = uLightDiffuse * varMaterialDiffuse * lambertTerm;",
     "          vec3 E = normalize(vEyeVec);",
     "          vec3 R = reflect(L, N);",
     "          float specular = pow( max(dot(R, E), 0.0), uShininess);",
     "          Is = uLightSpecular * uMaterialSpecular * specular;",
     "      }",
     "      finalColor = Ia + Id + Is;",
     "      finalColor.a = uMaterialDiffuse.a;",
     "  } ",
     "  else {",
     "      finalColor = varMaterialDiffuse; ", 
     "  }",
     "   if (uUseTextures){",
     "       finalColor =  texture2D(uSampler, vec2(vTextureCoords.s, vTextureCoords.t));",
     "   }",
     "   gl_FragColor = finalColor;",
     "}"].join('\n'),

    DEFAULTS : {
        "uShininess"        : 230.0,
        "uLightDirection"   : [0.0, -1.0, -1.0],
        "uLightAmbient"     : [0.03,0.03,0.03,1.0],
        "uLightDiffuse"     : [1.0,1.0,1.0,1.0], 
        "uLightSpecular"    : [1.0,1.0,1.0,1.0],
        "uMaterialAmbient"  : [1.0,1.0,1.0,1.0],
        "uMaterialDiffuse"  : [0.8,0.8,0.8,1.0],
        "uMaterialSpecular" : [1.0,1.0,1.0,1.0]
    }
});
   
}; 

vxl.go.essl.phong = new vxlPhongProgram();
