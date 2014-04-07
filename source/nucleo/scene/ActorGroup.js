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
*  Sometimes it makes sense to associate actors in a scene to perform operations as a unit.
*  For instance you can have a bicycle composed by several actors and you want to change 
*  its color or its position on the scene. You could accomplish that calling the respective
*  methods for each one of the actors that make part of the bicycle or you can create an
*  actor group named bycicle and call just the setColor and translate operations on the actor group.
* 
*  @class
*  @constructor
*  @author Diego Cantor
*/
function vxlActorGroup(scene, name, list){
    this.scene = scene;
    this.name = name;
    this.list = [];
    this.addList(list);
};

/**
 *  Add a list of actors to the actor group
 * @param {Object} list a list of actors
 */
vxlActorGroup.prototype.addList = function(list){
    var messages = [];
    
    for(var i=0, N = list.length; i <N; i+=1){
        var actor = list[i];
        if (actor instanceof vxlActor && actor.scene == this.scene){
            this.list.push(actor);
        }
        else if (typeof(actor) == 'string'){
            var actorObject  = this.scene.getActor(actor);
            if (actorObject != null){
                this.list.push(actorObject);
            }
            else{
                messages.push("Could not find actor: "+actor);
            }
        }
        else{
            messages.push("The object "+actor+" is not of the expected type (vxlActor, string)");
        }
    }
    
    if (messages.length != 0){
        this.list = [];
        throw new vxlActorGroupException(messages);
    }
    
};

/**
* Adds one actor to the actor group
* @param {vxlActor} actor the actor to be added
*/
vxlActorGroup.prototype.add = function(actor){
    var messages = [];

    if (actor instanceof vxlActor && actor.scene == this.scene){
        this.list.push(actor);
    }
    else if (typeof(actor) == 'string'){
        var actorObject  = this.scene.getActor(actor);
        if (actorObject != null){
            this.list.push(actorObject);
        }
        else{
            messages.push("Could not find actor: "+actor);
        }
    }
    else{
        messages.push("The object "+actor+" is not of the expected type (vxlActor, string)");
    }
    
    if (messages.length != 0){
        this.list = [];
        throw new vxlActorGroupException(messages);
    }
};

/**
 * Returns true if the actor is associated to this actor group. False otherwise
 */
vxlActorGroup.prototype.hasActor = function(actor){
    if (actor instanceof vxlActor){
        return (this.list.indexOf(actor)!=-1)
    }
    else if (typeof(actor)=='string'){
        var actorObject = this.scene.getActor(actor);
        return (actorObject != null);
    }
    
    else return false;
};

vxlActorGroup.prototype.remove = function(actor){
    var index = -1;
    if (actor instanceof vxlActor){
        index = this.list.indexOf(actor);
        
    }
    else if (typeof(actor)=='string'){
        actorObject = this.scene.getActor(actor);
        index = this.list.indexOf(actorObject);
    }   
   
    if (index !=1){
        this.list.splice(index,1);
    }
    else{
        throw new vxlActorGroupException(['the actor '+actor+' was not found in the group '+this.name]);
    }
};

/**
 * Resets the contents of this actor group
 */
vxlActorGroup.prototype.reset = function(list){
   this.list = [];
   if (list != undefined && list instanceof Array){
       this.addList(list);
   }  
};

/**
 * Returns the size of the actor group
 * @returns {Number} the lenght of the actor group
 */
vxlActorGroup.prototype.size = function(){
    return this.list.length;
};

/**
 * Set a property for actors in the group. Please notice that by design actor groups only 
 * set actor level properties instead of model level properties.
 * 
 */
vxlActorGroup.prototype.setProperty = function(property, value){
    for(var i=0, N = this.list.length; i<N; i+=1){
        this.list[i].setProperty(property,value,vxl.def.actor);
    }
    
    return this;
};

/**
 * Invoke an operation on the actors belonging to this group
 * @param {function} operation from vxlActor.prototype
 * @param {list} parameters
 */
vxlActorGroup.prototype._apply = function(operation, parameters){
   for(var i=0, N = this.list.length; i<N; i+=1){
        operation.apply(this.list[i], parameters);
    };
    
    return this;
};

/**
 * Flip normals
 */
vxlActorGroup.prototype.flipNormals = function(){
    return this._apply(vxlActor.prototype.flipNormals);
};

/**
 * Rotation on the X axis
 * @param {float} angle angle in degrees
 */
vxlActorGroup.prototype.rotateX = function(angle){
    return this._apply(vxlActor.prototype.rotateX, [angle]);
};

/**
 * Rotation on the Y axis
 * @param {float} angle angle in degrees
 */
vxlActorGroup.prototype.rotateY = function(angle){
    return this._apply(vxlActor.prototype.rotateY, [angle]);
};

/**
 * Rotation on the Z axis
 * @param {float} angle angle in degrees
 */
vxlActorGroup.prototype.rotateZ = function(angle){
    return this._apply(vxlActor.prototype.rotateZ, [angle]);
};

/**
 * Translation by a given vector
 */
vxlActorGroup.prototype.translate = function(x,y,z){
    return this._apply(vxlActor.prototype.translate, [x,y,z]);
};

/**
 * Sets the material diffuse color of the group
 * @param {list} color in rgb decimal format
 */
vxlActorGroup.prototype.setColor = function(color){
    return this.setProperty('color',color);
};

/**
 * Sets the lookup table for this group
 */
vxlActorGroup.prototype.setLookupTable = function(lutID, min, max){
    return this._apply(vxlActor.prototype.setLookupTable, [lutID, min,max]);
};

/**
 * Sets the opacity for this group
 */
vxlActorGroup.prototype.setOpacity = function(opacity){
    return this.setProperty('opacity', opacity);
};

/**
 * Sets the picker for this group
 * @see {vxlActor#setPicker}
 */
vxlActorGroup.prototype.setPicker = function(type, callback){
    return this._apply(vxlActor.prototype.setPicker,[type,callback]);
};

/**
 * Sets the position for this group
 * @see {vxlActor#setPosition}
 */
vxlActorGroup.prototype.setPosition = function(x,y,z){
    return this._apply(vxlActor.prototype.setPosition,[x,y,z]);
};

/**
 * Sets the scale for this group
 * @see {vxlActor#setScale}
 */
vxlActorGroup.prototype.setScale = function(x,y,z){
    return this._apply(vxlActor.prototype.setScale,[x,y,z]);
};

/**
 * Sets the shininess for this group
 * @see {vxlActor#setShininess}
 */
vxlActorGroup.prototype.setShininess = function(shine){
    return this.setProperty('shininess', shine);
};

/**
 * Sets the visibility for this group
 * @see {vxlActor#setVisibility}
 */
vxlActorGroup.prototype.setVisible = function(visible){
    return this.setProperty('visible', visible);
};


/**
 *  Sets the shading for this group
 * @see {vxlActor#setShading}
 */
vxlActorGroup.prototype.setShading = function(shading){
    return this.setProperty('shading', shading);
};

/**
 * Sets the visualization mode for this group
 * @see {vxlActor#setVisualizationMode}
 */
vxlActorGroup.prototype.setVisualizationMode = function(mode){
    return this._apply(vxlActor.prototype.setVisualizationMode, [mode]);
};




/**
 * Contains the explanation of why the actor group could not be created
 * @class
 * @author Diego Cantor
 */
function vxlActorGroupException(messages){
    this.messages = messages;
};
