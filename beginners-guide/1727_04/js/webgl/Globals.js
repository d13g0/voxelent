var gl = null;     // WebGL context
var prg = null;    // The program (shaders)
var c_width = 0;   // Variable to store the width of the canvas (updated when needed by codeview.js)
var c_height = 0;  // Variable to store the height of the canvas (updated when needed by codeview.js)

var mvMatrix    = mat4.create();    // The Model-View matrix
var pMatrix     = mat4.create();    // The projection matrix
var nMatrix     = mat4.create();    // The normal matrix
var cMatrix     = mat4.create();    // The camera matrix


var home     = [0,-2,-50];
var position = [0,-2,-50];
var rotation = [0,0,0];

var coords = -1;

var COORDS_WORLD = 1;
var COORDS_CAMERA = 2;
var requestUpdate = false;

var updateLightPosition = false;
