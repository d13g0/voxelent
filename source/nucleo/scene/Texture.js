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
 * Creates an empty texture object
 * @param {String} uri texture location
 */
function vxlTexture(uri){
    var self = this;

    this.image = new Image();
    this.image.onload = function(){
        self._handleLoadedImage();
    }
    
    this.uri = uri;
    if (this.uri != undefined){
        this.load(this.uri);
    }
    
    this.mag = vxl.def.texture.filter.LINEAR;
    this.min = vxl.def.texture.filter.LINEAR_MIPMAP_LINEAR;     
};

/**
 * Loads an image and it associates it to this texture object
 * @param {Object} uri the location of the image to load into this texture object
 */
vxlTexture.prototype.load = function(uri){
   this.image.src = uri;
};

/**
 * @private
 */
vxlTexture.prototype._handleLoadedImage = function(){
    /*var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, null);*/   
};

/**
 * Returns the appropriate gl constant that identifies the current magnification
 * filter applied to this texture
 * @param {Object} gl the gl context
 */
vxlTexture.prototype.getMagFilter = function(gl){
    
  var tf = vxl.def.texture.filter;  
  switch(this.mag){
      case tf.LINEAR: return gl.LINEAR; break;
      case tf.NEAREST: return gl.NEAREST; break;
      default: return gl.NEAREST; 
  }
};

/**
 * Returns the appropriate gl constant that identifies the current minification filter
 * applied to this texture
 * @param {Object} gl the gl context 
 */
vxlTexture.prototype.getMinFilter = function(gl){
    var tf = vxl.def.texture.filter;
    switch(this.min){
      case tf.LINEAR: return gl.LINEAR; break;
      case tf.NEAREST: return gl.NEAREST; break;
      case tf.LINEAR_MIPMAP_LINEAR : return gl.LINEAR_MIPMAP_LINEAR; break;
      case tf.LINEAR_MIPMAP_NEAREST: return gl.LINEAR_MIPMAP_NEAREST; break;
      case tf.NEAREST_MIPMAP_LINEAR: return gl.NEAREST_MIPMAP_LINEAR; break;
      case tf.NEAREST_MIPMAP_NEAREST: return gl.NEAREST_MIPMAP_NEAREST; break;
      default: return gl.NEAREST; 
  }
};
