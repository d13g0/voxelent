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
 * In a mesh, the geometry is structured in units called cells (triangles).
 * This class provides operations on individual cells.
 * 
 * @class Provides cell by cell operations on models
 * @constructor 
 * @param {vxlModel} model the model for this mesh
 * @author Diego Cantor
 */
function vxlMesh(model){
    
    this.cells = [];
    this.indices = [];
    this.normals = [];
    this.renderable = undefined;
    this.color = [0.8,0.8,0.8]; 
    
    this._init(model);
};

vxlMesh.prototype.setColor = function(color){
    this.color = color;
    
    
    if (this.renderable){
        this.updateRenderableColors();
    }
}
/**
 * Identifies the cells existing in the 
 * @private
 */
vxlMesh.prototype._init = function(model){
    
    var ver = model.vertices;
    var ind = model.indices;
    
    var self = this;
    
    
    function initMesh(){
        var start = new Date().getTime();
        for(var i=0, L = ind.length; i<L; i+=3){ //for all indices
            idx  = ind[i];
            var triangle = [],x,y,z,idx;

            x = ver[idx*3];
            y = ver[idx*3 + 1];
            z = ver[idx*3 + 2];   
            triangle.push([x,y,z]);

            idx = ind[i+1];
            x = ver[idx*3];
            y = ver[idx*3 + 1];
            z = ver[idx*3 + 2];   
            triangle.push([x,y,z]);

            idx = ind[i+2];            
            x = ver[idx*3];
            y = ver[idx*3 + 1];
            z = ver[idx*3 + 2];   
            triangle.push([x,y,z]);

            self.indices.push([ind[i], ind[i+1], ind[i+2]]);
            self.cells.push(new vxlCell(triangle));
        }
        var col = [self.color[0], self.color[1], self.color[2]];
        for (var i=0, L =self.cells.length; i<L; i+=1){
            self.normals.push(self.cells[i]._normal);
            self.cells[i].color = col; //BEWARE FLOATARRAYS DONT TRANSLATE WELL
        }
        
        self.renderable = self._getRenderable();
        var elapsed = new Date().getTime() - start;
        console.info('Mesh ['+ model.name +'] generated in '+elapsed+ ' ms');
    };
    
    //because this operation is time consuming it is deferred here.
    //this causes that the reenderable object is not available in the renderer
    //until this op finishes.
   setTimeout(function(){initMesh()},0);
};


/**
 * Returns a renderable model of the mesh
 * @private
 */
vxlMesh.prototype._getRenderable = function(){
    
    var r = new vxlModel();
    
    r.colors = [];
    r.pickingColors = [];
    for(var i=0, count = this.cells.length; i<count; i +=1){
            r.indices   = r.indices.concat([i*3, i*3+1, i*3+2]);
            r.vertices  = r.vertices.concat(this.cells[i].getFlattenVertices());
            for (var j = 0; j<3;j+=1){
                r.colors    = r.colors.concat(this.cells[i].color);
                r.pickingColors = r.pickingColors.concat(this.cells[i]._pickingColor);
            }
    }
    
    r.computeNormals();
    return r;
};

/**
 * @TODO: Improve. given a cell, find its index and update just that 
 */
vxlMesh.prototype.updateRenderableColors = function(){
    var r = this.renderable;
    r.colors = [];
    r.pickingColors = [];
    for(var i=0, count = this.cells.length; i<count; i +=1){
            for (var j = 0; j<3;j+=1){
                r.colors    = r.colors.concat(this.cells[i].color);
                r.pickingColors = r.pickingColors.concat(this.cells[i]._pickingColor);
            }
    }
};
 
/**
 * Determines if this mesh contains the cell indicated by the parameter cellUID
 * @param {string} cellUID the unique identifier of a cell
 */
vxlMesh.prototype.hasCell = function(cellUID){
  for(var i=0, count= this.cells.length; i < count; i+=1){
      if (this.cells[i].UID == cellUID){
          return true;
      }
  } 
  return false; 
};  

/**
 * Determines if this mesh contains the cell indicated by the parameter cellUID
 * @param {string} cellUID the unique identifier of a cell
 */
vxlMesh.prototype.getCell = function(cellUID){
  for(var i=0, count= this.cells.length; i < count; i+=1){
      if (this.cells[i].UID == cellUID){
          return this.cells[i];
      }
  } 
  return null; 
};


vxlMesh.prototype.removeCell = function(cellUID){
  var idx = -1;
  for(var i=0, count= this.cells.length; i < count; i+=1){
      if (this.cells[i].UID == cellUID){
          idx = i;
          break;
      }
  }
  if (idx !=-1) 
   this.cells.splice(idx,1);
};  

/**
 * This is just an experimental method. Determines what cells are facing the camera. 
 * May be this can be used for anything? I don't know! 
 * Maybe to see through a surface??
 *
 * @param {Object} camera
 * @param {Object} angle
 */
vxlMesh.prototype.intersect = function(camera, angle){
    
    var ray = camera._normal;
    
    selection = [];

    for(var i=0;i<this.normals.length; i+=1){
        var dp = Math.acos(vec3.dot(ray, this.normals[i])) * vxl.def.rad2deg;
        if (Math.abs(dp) <= angle){
            selection = selection.concat(this.indices[i]);
        }  
    }
    return selection;
};