var t ="
<script id="shader-vs" type="x-shader/x-vertex">

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform vec3 uLightPosition;
uniform vec4 uMaterialDiffuse;
uniform bool uWireframe;
uniform bool uPerVertexColor;
uniform bool uUpdateLight;

varying vec3 vNormal;
varying vec3 vLightRay;
varying vec3 vEyeVec;
varying vec4 vFinalColor;

void main(void) {
	
  if (uWireframe) {
        if (uPerVertexColor){
            vFinalColor = aVertexColor;
        }
        else{
            vFinalColor = uMaterialDiffuse;
        }
    }


 //Transformed vertex position
 vec4 vertex = uMVMatrix * vec4(aVertexPosition, 1.0);
 
 //Transformed normal position
 vNormal = vec3(uNMatrix * vec4(aVertexNormal, 1.0));

 //Transformed light position
 vec4 light = vec4(uLightPosition,1.0);
 
 if(uUpdateLight){
     light = uMVMatrix * vec4(uLightPosition,1.0);
  }
	
 //Light position
 vLightRay = vertex.xyz-light.xyz;
 
 //Vector Eye
 vEyeVec = -vec3(vertex.xyz);
 
 //Final vertex position
 gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

}	
</script>

<script id="shader-fs" type="x-shader/x-fragment">
#ifdef GL_ES
precision highp float;
#endif

uniform bool uWireframe;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialSpecular;
uniform float uShininess;       

varying vec3 vNormal;
varying vec3 vLightRay;
varying vec3 vEyeVec;
varying vec4 vFinalColor;

void main(void)
{
	if(uWireframe){
		gl_FragColor = vFinalColor;
	}
	else{
    	vec3 L = normalize(vLightRay);
    	vec3 N = normalize(vNormal);

    	//Lambert's cosine law
    	float lambertTerm = dot(N,-L);
    
    	//Ambient Term  
    	vec4 Ia = uLightAmbient * uMaterialAmbient;

    	//Diffuse Term
    	vec4 Id = vec4(0.0,0.0,0.0,1.0);

    	//Specular Term
    	vec4 Is = vec4(0.0,0.0,0.0,1.0);

    	if(lambertTerm > 0.0)
    	{
        	Id = uLightDiffuse * uMaterialDiffuse * lambertTerm; 
        	vec3 E = normalize(vEyeVec);
        	vec3 R = reflect(L, N);
        	float specular = pow( max(dot(R, E), 0.0), uShininess);
        	Is = uLightSpecular * uMaterialSpecular * specular;
    	}

    	//Final color
    	vec4 finalColor = Ia + Id + Is;
    	finalColor.a = 1.0;
    	gl_FragColor = finalColor;
    }

}
</script>";
