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


function vxlMaterial(model){
    this.ambient   = vxl.def.material.ambient;
    this.diffuse   = vxl.def.material.diffuse;
    this.specular  = vxl.def.material.specular;
    this.shininess = vxl.def.material.shininess;
    this.opacity   = vxl.def.material.opacity;
    this.shading   = vxl.def.material.shading;
    this.texture   = undefined;
    this.colors    = undefined;

    if (model){
        this.getFrom(model);
    } 
};

/**
 * 
 * @param {Object} model the model from where the material properties are read
 */
vxlMaterial.prototype.getFrom = function(model){
 
    
    if (model.ambient != undefined)
    {
        this.ambient = model.ambient.slice(0);
    }
    
    if (model.diffuse != undefined){
        this.diffuse = model.diffuse.slice(0) 
    }
    
    if (model.specular != undefined){
        this.specular = model.specular.slice(0);
    }
    
    if (model.color != undefined){
        this.diffuse = model.color.slice(0);
    }
    
    if (model.shininess != undefined){
        this.shininess = model.shininess;
    }
    
    if (model.opacity != undefined){
        this.opacity = model.opacity;
    }
    
    if (model.shading != undefined){
        this.shading = model.shading;
    }
    
    if (model.texture != undefined){
        this.texture = new vxlTexture(model.path + model.texture); 
    }
    
    if (model.colors != undefined){
        this.colors = model.colors;
    }
    
    
};

/**
 *  Clones this material
 *  @see vxlActor#clone
 */
vxlMaterial.prototype.clone = function(){
    var copy = new vxlMaterial();
    var self = this;
     
    for (var prop in self){
        if (self.hasOwnProperty(prop)) {
            if (self[prop] instanceof Array){
                copy[prop] = self[prop].slice(0);
            }
            else {
               copy[prop] = self[prop];               
            }
        }
    }
    return copy;
};



