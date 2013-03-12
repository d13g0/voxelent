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
 * The renderables are requested internally by vxlRenderStrategy whenever a model of BIG_OBJECT or  MESH types
 * need to be rendered.
 * 
 * 
 * 
 * @constructor A Renderable is an intermediary object between an actor and the rendering strategy that allows rendering
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
    this.update();
}


/**
 *  Updates the renderable based on changes in the underlying model. After updating, the 
 *  renderable parts will contain any changes to the geometry, colors or other model attributes
 */
vxlRenderable.prototype.update = function(){
    
    //clear parts
    this.parts = [];
    
    var model  = this.actor.getRenderableModel();
    
    if (model == undefined) return;
    
    switch(model.type){
        case vxl.def.model.type.MESH: this._processMesh(model); break;
        case vxl.def.model.type.BIG_DATA: this._processBigData(model); break;
    }
   
};

/**
 * This methods creates renderable parts from a mesh. The implementation is straight forward
 * given that a mesh does not share triangles. This is what we need to do flat shading and therefore
 * to perform cell color based picking.
 * 
 * 
 */
vxlRenderable.prototype._processMesh = function(model){
    
  

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


/***
 * Processing big data 
 * 
 * The idea here is read chunks of size 65K from the model index array. Then obtain vertex, normal, and color
 * arrays for each index in the chunk.
 * After that, the new part index is generated
 * 
 * 
 */
vxlRenderable.prototype._processBigData = function(model){
    
    
    
    var bigDataIndex = model.indices;
    
    var size = vxl.def.model.MAX_NUM_INDICES;
    
    var N = Math.floor(model.indices.length / size);
    var R = model.indices.length % size;
    
    var material = this.actor.material;
    
    //TODO: Be more clever about the partitioning. The arrays don't need to have 65K in lenght
    //what the specs means is that the max element in the array index is 65K.
    //this is because the index range goes up to 65535 as the highest index.
    
    for (var i=0; i<=N; i +=1){
        
        var part = new vxlModel(model.name+'-renderable-part-'+i);    
        var indexMap = [], localIndexArray = [], globalIndexArray = [], innerIndex = 0;
        
        if (i == N) {
            if ( R > 0){
                globalIndexArray = bigDataIndex.slice(i*size,i*size+R);
             }
             else{
                 break;
             }
        }
        else{
            globalIndexArray = bigDataIndex.slice(i*size,(i+1)*size);
        }
        
        if (material.colors && material.colors.length>0)  {  part.colors = [];   }   
        
        if (model.normals && model.normals.length>0){  part.normals = [];  }
        
        if (model.scalars && model.scalars.length>0){  part.scalars = [];  }
        
        for(var k=0,K = globalIndexArray.length; k<K; k+=1){
            //Get an index from the global index
            var outerIndex  = globalIndexArray[k];
            
            //if it has not been processed then process it.
            //Processing consist into adding data to the respective part arrays
            if (indexMap[outerIndex] == undefined){
                indexMap[outerIndex] = innerIndex;
                
                vertexInfo = this._getBigDataVertexInfo(outerIndex);
                part.vertices.push.apply(part.vertices, vertexInfo.coords);
                if (model.normals && model.normals.length>0){
 
                    part.normals.push.apply(part.normals, vertexInfo.normal);
                }
                if (material.colors && material.colors.length>0){
                    part.colors.push.apply(part.colors, vertexInfo.color);
                }
                if (model.scalars && model.scalars.length>0){
                    part.scalars.push(vertexInfo.scalar);
                }
                innerIndex +=1;
            }
            //write the new index to the part index array
            part.indices.push(indexMap[outerIndex]);
            
        }
        part.update();
        this.parts.push(part);
    }   
};

/**
 * Unlike meshes, Big Data models do not have picking colors associated
 * @param {Object} index
 * @private
 */
vxlRenderable.prototype._getBigDataVertexInfo = function(index){
    
    var material = this.actor.material;
    var model = this.actor.model;
    
    var vertexInfo = {};
    
    vertexInfo.coords = model.vertices.slice(index*3, index*3+3);
    
    if (model.normals){ vertexInfo.normal = model.normals.slice(index*3, index*3+3);}
    if (material.colors){  vertexInfo.color = material.colors.slice(index*3, index*3+3);}
    if (model.scalars){  vertexInfo.scalar = model.scalars[index];}
    
    return vertexInfo;
    
    
};