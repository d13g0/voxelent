/**
 * A Renderable is an intermediary object between a mesh and a model that allows rendering
 * very complex models.
 * 
 * Think of this scenario. You have a model that has more than 16K number of vertices.
 * Yes, it is going to happen eventually.
 * 
 * In WebGL you can't do more than 16K indices per draw call. So, such a model could not be
 * rendered at once.
 * 
 * In previous Voxelent versions (<0.89.3) it was required that a complex model was broken down in several
 * json files. This was a way to make sure that each 'part' did not get so big as to be unable to render it.
 * This is, each part had an index array of at most 16k elements.
 * 
 * The VTK to JSON importer handles this situation and produces parts with index arrays of length = 16K.
 * 
 * However, since version 0.89.2, it is possible to create flat shading models and also to do cell based 
 * picking. This requires generating models where triangles are not shared (so we can do flat shading).
 * Now, if triangles are not shared, then most likely, very complex models are going to surpass the 16K 
 * limit for their index array. 
 * 
 * The renderable object encapsulates a complex model and delivers parts that abide by the 16K rule.
 * 
 * The renderables are internally handled by vxlRenderStrategy whenever the model needs to be represented
 * with flat shading, or when we need to do cell based picking. In both cases renderables are generated or queried
 * if they already exist for the given actor.
 */

function vxlRenderable(mesh){
    this.mesh = mesh;
    this.parts = [];    
}

/**
 * This methods creates renderable parts from a mesh. The implementation is straight forward
 * given that a mesh does not share triangles for rendering (so we can do flat shading and cell picking)
 * @param {vxlMesh} mesh
 */
vxlRenderable.prototype.update = function(){
    
    this.parts = [];
    
    var model = this.mesh._model;
    
    var size = vxl.def.model.maxNumIndices;
    
    var N = Math.floor(model.indices.length / size), R = model.indices.length % size;
    
    for (var i=0; i<N; i +=1){
        var part = new vxlModel(model.name+'-renderable-part-'+i);
        part.indices = this._reindex(model.indices.slice(i*size,i*size + size));
        part.vertices = model.vertices.slice(i*size*3, (i+1)*size*3 );
        
        if (model.normals){
            part.normals  = model.normals.slice(i*size*3, (i+1)*size*3);
        }
        
        if (model.colors){
            part.colors = model.colors.slice(i*size*3, (i+1)*size*3);
        }
        
        if (model.pickingColors){
            part.pickingColors = model.pickingColors.slice(i*size*3, (i+1)*size*3);
        }
        part.update();
  
        this.parts.push(part);
    }
    
    if (R > 0){
        var part = new vxlModel(model.name+'-renderable-part-'+N);
        part.indices = this._reindex(model.indices.slice(N*size,N*size+R));
        part.vertices = model.vertices.slice(N*size*3, N*size*3+R*3);
        
        if (model.normals){
            part.normals = model.normals.slice(N*size*3, N*size*3+R*3);
        }
        
        if (model.colors){
            part.colors = model.colors.slice(N*size*3, N*size*3+R*3)
        }
        
        if (model.pickingColors){
            part.pickingColors = model.pickingColors.slice(N*size*3, N*size*3+R*3);
        }
        
        part.update();
        this.parts.push(part);
    }
     
};

/**
 * Return indices starting from 0
 * @param {Object} indices
 */
vxlRenderable.prototype._reindex = function(indices){
    var min = indices.min();
    for(var i=0, N = indices.length; i<N;i+=1){
        indices[i] = indices[i] - min;
    }
    return indices;
}
