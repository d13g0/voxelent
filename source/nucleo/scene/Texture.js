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
 * <p>
 * A vxlTexture is a representation of a raster image in Voxelent. Textures can be loaded providing a
 * URI
 * </p>
 * <p> 
 * To set the magnification and minification filters for a texture please refer to the constants
 * defined in <code>vxl.def.texture.filter</code>. A vxlTexture object uses the <code>min</code> and
 * <code>mag</code> properties to set these filters. For example: </p>
 * 
 * <pre class="prettyprint">
 * var texture = new vxlTexture('iphone_screen.png');
 * texture.min = vxl.def.texture.filter.LINEAR;
 * texture.mag = vxl.def.texture.filter.NEAREST;
 * </pre>
 * 
 * <p>The maginfication and minification filters by default are:
 * vxl.def.texture.filter.LINEAR and vxl.def.texture.filter.LINEAR_MIPMAP_LINEAR respectively    
 * </p>
 * 
 * <p>Under normal circumstances you will not need to create a vxlTexture. An actor representing a model with texture
 * information in it will create a vxlTexture automatically. In this case you can access the available vxlTexture object from the actor like this:</p>
 *  
 * <pre class="prettyprint">
 * var actor = vxl.c.scene.getActorByName('iphone_screen.json');
 * actor.texture.min = [set the filter here using the constants defined in vxl.def.texture.filter]
 * actor.texture.mag = [set the filter here using the constants defined in vxl.def.texture.filter]
 * </pre>
 * 
 * <p>If you want to replace the texture object with a new raster image, you can write something like this:</p>
 * 
 * <pre class="prettyprint">
 * var actor = vxl.c.scene.getActorByName('iphone_screen.json');
 * var wallpaper = new vxlTexture('new_wallpaper.png');
 * actor.setTexture(wallpaper);
 * </pre>
 * @class A vxlTexture is a representation of a raster image in Voxelent. 
 * @constructor
 * @param {String} uri texture location
 * @author Diego Cantor
 */
function vxlTexture(uri){
    var self = this;

    this.image = new Image();
    this.image.onload = function(){
        self._onLoad();
    };
    
    this.image.onError = function(){
        self._onError();
    };
    
    this.uri = uri;
    if (this.uri != undefined){
        this.load(this.uri);
    }
    
    this.mag = vxl.def.texture.filter.LINEAR;
    this.min = vxl.def.texture.filter.LINEAR_MIPMAP_LINEAR;
    this.loaded = false;     
};

/**
 * Sets the magnification filter. 
 * @param {String} magfilter one of the options in vxl.def.texture.filter
 * @see {vxl.def.texture.filter}
 */
vxlTexture.prototype.setMagFilter = function(magfilter){
    this.mag = magfilter;
};

/**
 * Sets the minification filter. 
 * @param {String} minfilter one of the options in vxl.def.texture.filter
 * @see {vxl.def.texture.filter}
 */
vxlTexture.prototype.setMinFilter = function(minfilter){
    this.min = minfilter;  
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
vxlTexture.prototype._onError = function(){
    console.info('vxlTexture: the texture '+this.uri+' could not be found.');
    this.loaded = false;
};

/**
 * @private
 */
vxlTexture.prototype._onLoad = function(){
    this.loaded = true;
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

