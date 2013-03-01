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
 * @constructor
 * @class 
 * Picking in voxelent is based on colors. The vxlPicker class keeps track of the colors
 * in the scene that are used to identify objects and cells. The picker contains a map
 * that allows recognizing an object given a color.
 * @author Diego Cantor
 */
function vxlPicker(){
    this._map = {};
    
    this._hmap = [];
    
    for (var i=0;i<=256; i+=1){
        this._hmap[i] = [];
        for(var j=0;j<=256; j+=1){
            this._hmap[i][j] = [];
            for(var k=0;k<=256; k+=1){
                this._hmap[i][j][k] = null;
                }
        }
    }    
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
        
        var color; 
        do{
            color = this._getColor();
        } while(this._hmap[color[0]][color[1]][color[2]] != null);

        this._map[uid] =  color;
        this._hmap[color[0]][color[1]][color[2]] = uid;
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
    var v = 2;
    
    if (this._hmap[color[0]][color[1]][color[2]] != null){
        results.uid = this._hmap[color[0]][color[1]][color[2]];
        results.color = color;
        return results;
    }
    
        
    for (var i=-v;i<=v;i+=1){
        for (var j=-v;j<=v;j+=1){
            for (var k=-v;k<=v;k+=1){
                if (color[0]+i<0 || color[0]+i>256 || 
                    color[1]+j<0 || color[1]+j>256 || 
                    color[2]+k<0 || color[2]+k>256) continue;
                var closest_uid = this._hmap[color[0]+i][color[1]+j][color[2]+k];
                if (closest_uid != null){
                    results.uid = closest_uid;
                    results.color = [color[0]+i,color[1]+j,color[2]+k];
                    return results;
                }
            }
        }
    }
    return null;
            

};

/**
 * Defines a global picker 
 */
vxl.go.picker = new vxlPicker();

