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
 * @private
 * @class
 */

vxlBakeProgram.prototype = new vxlProgram();
vxlBakeProgram.prototype.constructor = vxlBakeProgram;

function vxlBakeProgram(){
    
    this.copy(vxlProgram.createFromJSON({
    
        ID : 'bake',
    
        VERTEX_SHADER : [
        "attribute vec3 aVertexPosition;",
        "attribute vec3 aVertexNormal;",
        "attribute vec3 aVertexColor;",
        "attribute vec3 aPosition;",
        "attribute vec3 aScale;",
        "attribute float aShading;",
        
        "uniform mat4 mModelView;",
        "uniform mat4 mPerspective;",
        "uniform mat4 mNormal;",
        "uniform mat4 mModelViewPerspective;",
    
        "uniform vec3 uLightDirection;",
        "uniform vec4 uLightAmbient;",  
        "uniform vec4 uLightDiffuse;",
        "uniform bool uUseLightTranslation;",
        "varying vec4 vFinalColor;",
        
        "void main(void) {",
        "   vec3 position = (aVertexPosition * aScale) + aPosition;",
        "   gl_Position = mModelViewPerspective * vec4(position, 1.0);",
        "   vFinalColor = vec4(aVertexColor,1.0);",
        
        "   if (aShading == 1.0){",
        "      vec3 N = vec3(mNormal * vec4(aVertexNormal, 1.0));",
        "      vec3 L = normalize(uLightDirection);",
        "      if (uUseLightTranslation) { L = vec3(mNormal * vec4(L,1.0));}",
        "      float lambertTerm = max(dot(N,-L),0.4);",
        "      vec4 Ia = uLightAmbient;",
        "      vec4 Id = vFinalColor * uLightDiffuse * lambertTerm;",
        "      vFinalColor = Ia + Id;",
        "      vFinalColor.a = 1.0;",
        "   }",
        "}"].join('\n'),
        
        FRAGMENT_SHADER : [
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
    
        "varying vec4  vFinalColor;",
    
        "void main(void)  {",
        "       gl_FragColor = vFinalColor;",
        "}"].join('\n'),
        
        DEFAULTS : {
            "uLightDirection"   : [0.0,0.0,-1.0],
            "uLightAmbient"     : [0.0,0.0,0.0,1.0],
            "uLightDiffuse"     : [1.0,1.0,1.0,1.0],
            "uUseLightTranslation" : false
        }
    }));
 
}; 



vxl.go.essl.bake = new vxlBakeProgram();


