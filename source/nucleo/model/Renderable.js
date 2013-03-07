/**
 * @class A Renderable is an intermediary object between a model and the rendering strategy that allows rendering
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
 * The renderables are requested internally by vxlRenderStrategy whenever a model of BIG_OBJECT or  MESH types
 * need to be rendered.
 * 
 * 
 * 
 * @constructor A Renderable is an intermediary object between a model and the rendering strategy that allows rendering
 * very complex models.
 * 
 * @param{vxlModel} model the model to be decomposed into renderable parts
  *  
 * @author Diego Cantor
 */

function vxlRenderable(model){
    
    
    if (model == undefined){
        throw('vxlRenderable: the model can not be undefined');
    }
    
    var type = model.type;
    
    
    if (type == undefined){
        if (type != vxl.def.model.type.BIG_DATA && 
            type != vxl.def.model.type.MESH){
            throw('vxlRenderable: the type of renderable is unknown');
        }
        else if (type == vxl.def.model.type.SIMPLE){
            throw('vxlRenderable: simple models do not require renderables!');
        }
    }
    
    this._model = model;
    
    this.parts = [];    
    
    this.update();
}


/**
 *  Updates the renderable based on changes in the underlying model. After updating, the 
 *  renderable parts will contain any changes to the geometry, colors or other model attributes
 */
vxlRenderable.prototype.update = function(){
    
    //clear parts
    this.parts = [];
    
    switch(this._model.type){
        case vxl.def.model.type.MESH:      this._processMesh();    break;
        case vxl.def.model.type.BIG_DATA : this._processBigData(); break;
    }
    
    return this.parts;
};

/**
 * This methods creates renderable parts from a mesh. The implementation is straight forward
 * given that a mesh does not share triangles. This is what we need to do flat shading and therefore
 * to perform cell color based picking.
 * 
 * 
 */
vxlRenderable.prototype._processMesh = function(){
    
    var model = this._model;
    
    var size = vxl.def.model.MAX_NUM_INDICES;
    
    var N = Math.floor(model.indices.length / size), R = model.indices.length % size;
    
    for (var i=0; i<N; i +=1){
        
        var part = new vxlModel(model.name+'-renderable-part-'+i);
        
        part.indices = this._reindex(model.indices.slice(i*size,i*size + size));
        part.vertices = model.vertices.slice(i*size*3, (i+1)*size*3 );
        
        if (model.normals && model.normals.length >0){ part.normals  = model.normals.slice(i*size*3, (i+1)*size*3);  }
        if (model.colors  && model.colors.length >0) { part.colors = model.colors.slice(i*size*3, (i+1)*size*3);     }
        
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
        
        if (model.normals && model.normals.length >0 ){ part.normals = model.normals.slice(N*size*3, N*size*3+R*3); }
        if (model.colors  && model.colors.length > 0) { part.colors  = model.colors.slice(N*size*3, N*size*3+R*3);  }
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

vxlRenderable.prototype._processBigData = function(){
    
};
