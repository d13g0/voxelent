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
 * @private not ready yet...
 * @constructor
 * @class
 * Selects the actors that have a given visualization mode (vxl.def.actor.mode)
 * This class helps the vxlBakeEngine
 */
function vxlSilo(mode){
    this._mode = mode;
    this._actors = [];
    this.data = {};
    this.cached = {};
    this.added = {};
    this.prepare();
};

/**
 * Populates a silo with the actors from the list that have the type defined for this silo
 */
vxlSilo.prototype.populate = function(list){
    //this._actors = [];
    var N = list.length
    for(var i=0; i<N; i+=1){
        var actor = list[i];
        if (this.cached[actor.UID] == undefined && actor.mode == this._mode){
            this._actors.push(actor);
            this.cached[actor.UID] = actor;
        }
    }
};

/**
 * @private
 */
vxlSilo.prototype.prepare = function(){

    var data ={
        mixin: [],  //vertices + normals +
                    // + vertex colors or zeros if not using vertex colors.
                    
        index : [],  //indices
        
        matrix : [[],[],[],[]]
    };
    this.data = data;
};

vxlSilo.prototype.process = function(){
    //this.prepare();
    var N = this._actors.length;
    for (var i = 0; i < N; i += 1){
        var actor = this._actors[i];
        if (this.added[actor.UID] == undefined){
            this.processActor(this._actors[i]);
            this.added[actor.UID] = actor;
        }
    }  
};


vxlSilo.prototype.processActor = function(actor){
    
    var model = actor.model;
    var material = actor.material;
    
    var mixin = this.data.mixin;
    var index = this.data.index;
    var matrix = this.data.matrix;
    
    var num_vertices = model.vertices.length;
    var num_indices  = model.indices.length;
    
    //converting from Float32Array to regular js array to operate
    var actor_matrix = Array.prototype.slice.call(actor._matrix);
 
    
    // processing mixin
    if (material.colors != undefined){
        /*for (var i=0;i<num_vertices; i+=3){
            mixin.push(model.vertices[i]);
            mixin.push(model.vertices[i+1]);
            mixin.push(model.vertices[i+2]);
            mixin.push(model.normals[i]);
            mixin.push(model.normals[i+1]);
            mixin.push(model.normals[i+2]);
            mixin.push(material.colors[i]);
            mixin.push(material.colors[i+1]);
            mixin.push(material.colors[i+2]);
            matrix[0] = matrix[0].concat(actor_matrix.slice(0,4)); //glMatrix IS column-major after all :-P
            matrix[1] = matrix[1].concat(actor_matrix.slice(4,8));
            matrix[2] = matrix[2].concat(actor_matrix.slice(8,12));
            matrix[3] = matrix[3].concat(actor_matrix.slice(12,16));
        }*/
    }
    else{
        for (var i=0;i<num_vertices; i+=3){
           
            mixin = mixin.concat([
                model.vertices[i],
                model.vertices[i+1],
                model.vertices[i+2],
                model.normals[i],
                model.normals[i+1],
                model.normals[i+2],
                material.diffuse[0], 
                material.diffuse[1],
                material.diffuse[2]
                ]);
           
            matrix[0] = matrix[0].concat(actor_matrix.slice(0,4));
            matrix[1] = matrix[1].concat(actor_matrix.slice(4,8));
            matrix[2] = matrix[2].concat(actor_matrix.slice(8,12));
            matrix[3] = matrix[3].concat(actor_matrix.slice(12,16));
        }
    }
    
    //processing index
    var ind = model.indices.slice(0);
    if (index.length > 0){
        var offset = index.max()+1;
        for (var i=0; i<num_indices; i+=1){
            ind[i] += offset;
        }
        index = index.concat(ind);
    }
    else{
        index = ind;
    }
    
    this.data.mixin = mixin;
    this.data.index = index;
    this.data.matrix = matrix;

};

