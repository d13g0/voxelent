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
 * @param {vxlModel} prior the model for this mesh
 * @author Diego Cantor
 */
function vxlMesh(prior){
    
    if (prior == undefined){
        throw('vxlMesh: the model passed as parameter cannot be undefined');
    }
    
    this.name = prior.name +'-mesh';
    this.cells = [];
    this.color = [0.8,0.8,0.8]; 
    this._model = undefined;                  //internal representation of the mesh
    this._createMesh(prior);
};



/**
 * Identifies the cells existing in the 
 * @private
 */
vxlMesh.prototype._createMesh = function(prior){
    
    var ver = prior.vertices;
    var ind = prior.indices;
    
    var self = this;
    this.cells = [];
    
    function buildMesh(){
        var start = new Date().getTime();
        
        var cellIndex = 0;
        
        //@TODO: assign colors if they exist. Should we give the option to change luts here?
        // probably not. Every time the actor changes its LUT the mesh should react and update its colors  

        var meshColor = [self.color[0], self.color[1], self.color[2]];
        
        //1. CREATE CELLS
        for(var i=0, L = ind.length; i<L; i+=3){ 
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

            
            self.cells.push(new vxlCell(cellIndex, triangle, meshColor));
            cellIndex += 1;
        }
        
        
        self._createInternalModel();
        
        var elapsed = new Date().getTime() - start;
        console.info('Mesh ['+ self.name +'] generated in '+elapsed+ ' ms');
    };
    
    //because this operation is time consuming it is deferred here.
    //this causes that the mesh is not available for rendering until this operation finishes.
   setTimeout(function(){buildMesh()},0);
};


/**
 * Based on the mesh information it creates an internal model of the mesh.
 * @private
 * 
 */
vxlMesh.prototype._createInternalModel = function(){
    
    this._model = new vxlModel(this.name+'-model');
    
    var model = this._model;
    
    model.colors = [];
    model.pickingColors = [];
    
    for(var i=0, count = this.cells.length; i<count; i +=1){
            model.indices.push.apply(model.indices,[i*3, i*3+1, i*3+2]);
            model.vertices.push.apply(model.vertices,this.cells[i].getFlattenVertices());
            
            for (var j = 0; j<3;j+=1){
                model.colors.push.apply(model.colors,this.cells[i].color);
                model.pickingColors.push.apply(model.pickingColors, this.cells[i]._pickingColor);
            }
    }
    
    model.computeNormals();
    
    model.setType(vxl.def.model.type.MESH);
};

/**
 * @param {vec3} color the new color
 * @private
 */
vxlMesh.prototype._setModelColor = function(color){
    
    if (this._model == undefined) return;
    
    var model = this._model;
    model.colors = [];
    
    for(var i=0, count = this.cells.length; i<count; i +=1){
            this.cells[i].color = [color[0], color[1], color[2]];
            for (var j = 0; j<3;j+=1){
                model.colors.push.apply(model.colors,this.cells[i].color);
            }
    }
    
    model.update();
};

/**
 * Receives an array with vertex colors (one color per vertex) 
 * interpolates these colors and assign cell colors
 */
vxlMesh.prototype.updateColorUsingVertexColors = function(vcolors){
    
};

/**
 * Update the mesh colors based on the current cell colors
 */
vxlMesh.prototype.updateColor = function(){
    var model = this._model;
    
    model.colors = [];
    model.pickingColors = [];
    for(var i=0, count = this.cells.length; i<count; i +=1){
           
            for (var j = 0; j<3;j+=1){
                model.colors.push.apply(model.colors,this.cells[i].color);
                model.pickingColors.push.apply(model.pickingColors, this.cells[i]._pickingColor);
            }
    }
    
    model.update();
};

/**
 * Sets the mesh color
 */
vxlMesh.prototype.setColor = function(color){
    this.color = color;
    this._setModelColor(this.color);
};

 
/**
 * Determines if this mesh contains the cell indicated by the parameter cellUID
 * @param {String} cellUID the unique identifier of a cell
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
 * @param {String} cellUID the unique identifier of a cell
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
  if (idx !=-1) {
        this.cells.splice(idx,1);
        this._createInternalModel();
   }

   
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

    /*for(var i=0;i<this.normals.length; i+=1){
        var dp = Math.acos(vec3.dot(ray, this.normals[i])) * vxl.def.rad2deg;
        if (Math.abs(dp) <= angle){
            selection = selection.concat(this.indices[i]);
        }  
    }*/
    return selection;
};

