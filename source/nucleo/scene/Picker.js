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
 * Picking in voxelent is based on colors. The vxlPicker class keeps track of the colors
 * in the scene that are used to identify objects and cells. The picker contains a map
 * that allows recognizing an object given a color.
 */
function vxlPicker(){
    this._map = {};
    this._colors = [];
 
};


/**
 * Generates a color that has not been assigned to any object or cell in the scene
 */
vxlPicker.prototype._getColor = function(){
    
    function getN(){
        var x =  Math.floor(Math.random()*256);
        if (x == 0) 
            return getN();
        else
            return x;
    };
    
 
    return [getN(), getN(), getN()];
};
  
/**
 * 
 */
vxlPicker.prototype.color2decimal = function(color){
    r = Math.round((color[0]/256)*100)/100;
    g = Math.round((color[1]/256)*100)/100;
    b = Math.round((color[2]/256)*100)/100;
    return [r,g,b];
}  


/**
 * @param {Object} obj an object that can be either a vxlCell or a vxlActor
 */
vxlPicker.prototype.getColorFor = function(obj){
    
    var uid = obj.UID;
    
    if (uid == null || uid  == undefined){
        alert("vxlPicker.getColor: invalid object");
        return;
    }
    
    if(!this._map[uid]){
        
        var color, key; 
        do{
            color = this._getColor();
            key = color[0] + ':' + color[1] + ':' + color[2];
        } while(this._colors.indexOf(key) != -1);

        this._map[uid] =  color;
        this._colors.push(key);
    }
    return this.color2decimal(color);
};

/**
 * Checks if the color passed as a parameter correspond to any UID (object,cell) assigned in the picker
 * If so, it returns an object with the results
 * If not, it returns null indicating the query was unsuccessful.
 * @param {Array} color
 * 
 */
vxlPicker.prototype.query = function(color){
    
    var distance = 100;
    var closest_uid = undefined;
    var results = {}
    
    for (uid in this._map){
         var c = this._map[uid];
         var currDistance  = (Math.abs(c[0]-color[0])+Math.abs(c[1]-color[1])+Math.abs(c[2]-color[2]));
         if (currDistance < distance){
             distance = currDistance;
             closest_uid = uid;
         }
    }
    
    if (distance <=6){ //@TODO: this heuristic needs improvement.
        results.uid = closest_uid;
        results.distance = distance;
        results.color = this._map[closest_uid];
        return results;
    }
    else{
        return null;
    }
};

/**
 * Defines a global picker 
 */
vxl.go.picker = new vxlPicker();

