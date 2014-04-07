/**
 * @class A Renderable is an intermediary object between an actor and the rendering strategy that allows rendering
 * very complex models.
 * 
 * Think of this scenario. You have a model that has more than 65K number of vertices.
 * Yes, it is going to happen eventually.
 * 
 * In WebGL you can't do more than 65K indices per draw call. This is because the type of the WebGL index array is unsigned short. 
 * So, a model with more than 65K indices could not be rendered at once.
 * 
 * In previous Voxelent versions (<0.89.3) it was required that a complex model was broken down in several
 * JSON files. This was a way to make sure that each 'part' did not get so big as to be unable to render it.
 * This is, each part had an index array of at most 16k elements.
 * 
 * For example, the VTK to JSON importer (vtk2json) handles this situation and produces parts with index arrays of length = 65K.
 * 
 * However, since version 0.89.2, it is possible to create flat shading models and also to do cell based 
 * picking. This requires generating models where triangles are not shared (so we can do flat shading).
 * Now, if triangles are not shared, then most likely, very complex models are going to surpass the 65K 
 * limit for their index array. 
 * 
 * The renderable object encapsulates a complex model and delivers parts that abide by the 65K index rule.
 * 
 * The renderables are requested internally by vxlRenderEngine whenever a model of BIG_OBJECT or  MESH types
 * need to be rendered.
 * 
 * 
 * 
 * @constructor A Renderable is an intermediary object between an actor and the rendering engine that allows rendering
 * very complex models.
 * 
 * @param{vxlActor} model the actor to be decomposed into renderable parts
  *  
 * @author Diego Cantor
 */

function vxlRenderable(actor){
    
    
    if (actor == undefined){
        throw('vxlRenderable: the actor can not be undefined');
    }
   
    
    this.actor = actor;
    this.parts = [];    
    this.update(vxl.def.renderable.task.CREATE);
};





/**
 *  Updates the renderable based on changes in the underlying model. After updating, the 
 *  renderable parts will contain any changes to the geometry, colors or other model attributes
 *  @param {Boolean} reslice if true, it will recreate the parts. Otherwise will use the current parts
 */
vxlRenderable.prototype.update = function(task){
    
    if (task == undefined){
        throw ("vxlRenderable.update: Please specify a task");
    }

  
    var model  = this._getModel();
    
    if (model == undefined) return; //no model to process
    
    switch(model.type){
        case vxl.def.model.type.MESH:     this._processMesh(model,task); break;
        case vxl.def.model.type.BIG_DATA: this._processBigData(model,task); break;
    }
   
};

/**
 * Queries the actor for a model to process
 * @private
 */
vxlRenderable.prototype._getModel = function(){
    var actor = this.actor;
    if (actor.mesh && actor.mesh.model){
        return actor.mesh.model;
    }
    else if (actor.model.type == vxl.def.model.type.BIG_DATA){
        return actor.model;
    }
    else return undefined;
};

/**
 * This methods creates renderable parts from a mesh. The implementation is straight forward
 * given that a mesh does not share triangles. This is what we need to do flat shading and therefore
 * to perform cell color based picking.
 * 
 * 
 */
vxlRenderable.prototype._processMesh = function(model,task){
    
  

    var size = vxl.def.model.MAX_NUM_INDICES;
    var N = Math.floor(model.indices.length / size), R = model.indices.length % size;
    
    if (task == vxl.def.renderable.task.CREATE){
        
        this.parts = [];
        
        for (var i=0; i<=N; i +=1){
            
            var part = new vxlModel(model.name+'-renderable-part-'+i);
            var startIndex = i*size;
            var endIndex = startIndex + size;
            var start = i * size * 3;
            var end   = start + size *3;
            
            if (i == N) {
                startIndex = N*size;
                endIndex = startIndex + R;
                start = N * size * 3;
                end   = start + R *3;
                
                if (R==0){
                    break;
                }
            }
            
            part.indices = this._reindex(model.indices.slice(startIndex,endIndex));
            part.vertices = model.vertices.slice(start, end);
            
            
            if (model.normals && model.normals.length >0){ part.normals  = model.normals.slice(start, end);  }
            if (model.colors  && model.colors.length >0) { part.colors = model.colors.slice(start, end);     }
            
            if (model.pickingColors){
                part.pickingColors = model.pickingColors.slice(start, end);
            }
            
            part.update();
      
            this.parts.push(part);
        }
    }
    
    
    
    else if (task == vxl.def.renderable.task.UPDATE_COLORS){
        for (var i=0; i<=N; i +=1){
            
            var part = this.parts[i];
            var start = i * size * 3;
            var end   = start + size *3;
            
            if (i == N) {

                start = N * size * 3;
                end   = start + R *3;
                
                if (R==0){
                    break;
                }
            }
          
            if (model.colors  && model.colors.length >0) { part.colors = model.colors.slice(start, end);  }

        }
    }
     
};

/**
 * Return indices starting from 0
 * @param {Object} indices
 */
vxlRenderable.prototype._reindex = function(indices){
    var min = indices.min();
    var i = indices.length;
    while(i--){
        indices[i] = indices[i] - min;
    }
    return indices;
};


/***
 * 
 * 
 * The idea here is to read parts of size 65K from the model index array. 
 * Then obtain vertex, normal, and color arrays for each index in the part (using _getVertexData).
 * 
 * As each part is populated, the respective index array is generated accordingly.
 * 
 */
vxlRenderable.prototype._processBigData = function(model,reslice){
    
    var global_index = model.indices;
    var size         = vxl.def.model.MAX_NUM_INDICES;
    
    if (model.mode == vxl.def.actor.mode.LINES){
        size = size - 1; //adjusting to even number of indices for partitioning.
    }
   
    var L            = global_index.length;
    var max_index    = global_index.max();
    var material     = this.actor.material;
    var has_colors   = (material.colors && material.colors.length>0);
    var has_normals  = (model.normals   && model.normals.length>0);
    var has_scalars  = (model.scalars   && model.scalars.length>0);
    var mode         = model.mode;
    
    data = {vertices:[], indices:[],mode:mode};
    if (has_colors)  { data.colors = [];  }
    if (has_normals) { data.normals = []; }
    if (has_scalars) { data.scalars = []; }
    
    index_map = {};
    part_number = 1;
    new_index = 0;
    progress = 0;
    
    for (var i=0; i<L; i +=1){
        
        index = global_index[i];
        
        if  (index_map[index] == undefined){
    
            index_map[index] = new_index;
            vertex = this._getVertexData(index);
            data.vertices.push.apply(data.vertices, vertex.coords);
                
            if (has_normals){
                data.normals.push.apply(data.normals, vertex.normal);
            }
 
            if (has_colors){
                data.colors.push.apply(data.colors, vertex.color);
            }
 
            if (has_scalars){
                data.scalars.push(vertex.scalar);
            }
            new_index +=1;
        }
        data.indices.push(index_map[index]);
        
        if ((new_index == size+1) || (i == L-1)){
            
            var part = new vxlModel(model.name+'-renderable-part-'+part_number,data);
            part.update();
            vxl.go.console('Creating part '+part.name+' ['+part_number+']',true);    
            this.parts.push(part);
            
            new_index    = 0;
            part_number += 1;
            part         = {vertices:[], indices:[],mode:mode};
            index_map    = {};
            
            data = {vertices:[], indices:[],mode:mode};
            if (has_colors)  { data.colors = [];  }
            if (has_normals) { data.normals = []; }
            if (has_scalars) { data.scalars = []; }
        } 
    }
        
};

/**
 * Useful to divide a big data model into renderable parts. The method _processBigData
 * will read information from the buffers indicated by the index in order to populate each
 * renderable part with the correct information 
 * 
 * @param {Object} index
 * @private
 */
vxlRenderable.prototype._getVertexData = function(index){
    
    var material   = this.actor.material;
    var model      = this.actor.model;
    var vertex = {};
    
    vertex.coords   = model.vertices.slice(index*3, index*3+3);
    
    if (model.normals)   {  vertex.normal  = model.normals.slice(index*3, index*3+3);  }
    if (material.colors) {  vertex.color   = material.colors.slice(index*3, index*3+3);}
    if (model.scalars)   {  vertex.scalar  = model.scalars[index];}
    
    return vertex;
    
    
};