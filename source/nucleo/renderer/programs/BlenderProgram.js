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

vxlBlenderProgram.prototype = new vxlProgram();
vxlBlenderProgram.prototype.constructor = vxlBlenderProgram;

function vxlBlenderProgram(){
    
    this.copy(vxlProgram.createFromJSON({
    
        ID : 'blender',
    
        VERTEX_SHADER : [
        
        "attribute vec3 aVertexPosition;",
        "attribute vec3 aVertexNormal;",
    
        "uniform mat4 mModelView;",
        "uniform mat4 mPerspective;",
        "uniform mat4 mNormal;",
        
        "uniform vec3 uLightPosition;",
        "uniform bool uTranslateLight;",
        
        "varying vec3 vNormal;",
        "varying vec3 vLightRay;",
        "varying vec3 vEye;",
        
        
        "void main(void) {",
        " vec4 vertex = mModelView * vec4(aVertexPosition, 1.0);",
        " vNormal = vec3(mNormal * vec4(aVertexNormal, 1.0));",
        " vec4 lightPosition = vec4(0.0);",
         
        "if (uTranslateLight){",
        "      lightPosition =   mModelView * vec4(uLightPosition, 1.0);",
        "      vLightRay = vertex.xyz - lightPosition.xyz;",
        "      vEye = -vec3(vertex.xyz);",
        "}",    
        "else {",
        "     lightPosition = vec4(uLightPosition, 1.0);",
        "     vLightRay = vertex.xyz - lightPosition.xyz;",
        "     vEye = -vec3(vertex.xyz);",
        "}",
        "gl_Position = mPerspective * mModelView * vec4(aVertexPosition, 1.0);",
        "}"].join('\n'),
        
        FRAGMENT_SHADER : [
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "uniform vec3 uLa;",
        "uniform vec3 uLd;",  
        "uniform vec3 uLs;",
        
        "uniform vec3 uKa;",
        "uniform vec3 uKd;",  
        "uniform vec3 uKs;",
        "uniform float uNs;",
        "uniform float d;",
        "uniform int illum;",
     
        "varying vec3 vNormal;",
        "varying vec3 vLightRay;",
        "varying vec3 vEye;",
    
        "void main(void)  {",
        "   if (illum ==0){",
        "       gl_FragColor = vec4(uKd,d);",
        "       return;",
        "   }",
        "   vec3 COLOR = vec3(0.0,0.0,0.0);",
        "   vec3 N =  normalize(vNormal);",
        "   vec3 L =  vec3(0.0,0.0,0.0);",
        "   vec3 E =  vec3(0.0,0.0,0.0);",
        "   vec3 R =  vec3(0.0,0.0,0.0);",
        "    if (illum == 1){",
        "        L = normalize(vLightRay);",    
        "        N = normalize(vNormal);",  
        "        COLOR += (uLa * uKa) + (uLd * uKd * clamp(dot(N, -L),0.0,1.0));",
        "        gl_FragColor =  vec4(COLOR,d);",
        "        return;",
        "   }",
        "   if (illum == 2){",
        "        E = normalize(vEye);",
        "        L = normalize(vLightRay);",
        "        R = reflect(L, N);",
        "        COLOR += (uLa * uKa);",
        "        COLOR += (uLd * uKd * clamp(dot(N,-L),0.0,1.0));",
        "        COLOR += (uLs * uKs * pow( max(dot(R, E), 0.0), uNs) * 4.0);",
        "        gl_FragColor =  vec4(COLOR,d);",
        "       return;",
        "   }" ,
        "}"].join('\n'),
        
        DEFAULTS : {
            "uLa"   : [1.0,1.0,1.0],
            "uLd"   : [1.0,1.0,1.0],
            "uLs"   : [0.8,0.8,0.8],
            "uKa"   : [1.0,1.0,1.0],
            "uKd"   : [1.0,1.0,1.0],
            "uKs"   : [1.0,1.0,1.0],
            "uNs"   : 1.0,
            "uTranslateLight" : false,
            "uLightPosition"   : [0,50,50]
        }
    }));
};


vxl.go.essl.blender = new vxlBlenderProgram();
 