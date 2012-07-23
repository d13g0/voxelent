/**
 * @class
 * @constructor
 */
function vxlLookupTable(){
	this.ID = null;
	this.map = null;
	this.max = Number.MIN_VALUE;
	this.min = Number.MAX_VALUE;
}

/**
 * Creates a lookup table
 * @param {String} ID the unique identifier of this lookup table in the system
 * @param {JSON} the JSON object that contains the lookup table entries. This JSON should follow Voxelent's syntax
 */
vxlLookupTable.prototype.load = function(ID,payload){
	this.ID = ID;
	this.map = payload;
	for (var key in this.map) {
		var n = Number(key);
		if (n < this.min) {this.min = n;}
		else if (n >= this.max) {this.max = n;}
    }
}

/**
 * Performs the lookup table value scaling to find the appropriate index according to the
 * number of entries and the extension of the scalar map determined by <code>min</code> and <code>max</code>
 */
vxlLookupTable.prototype._scale = function(value, min,max){
    return  value * this.max / max;
}


/**
 * Gets the correspondent color. To obtain the right entry, the scale method should be called first.
 */
vxlLookupTable.prototype.getColor = function(val, min, max){
    var value = this._scale(val, min,max);
	
	var l = this;
	var key = Math.round(value);
	
	if (key >= l.min && key <= l.max){
	    var c = [l.map[key][0],l.map[key][1],l.map[key][2]];
		return c;
	}
	
	else if (key <l.min) { //truncate to min value
			return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2]];
	}
	
	else if (key>l.max){ //truncate to max value
		return  [l.map[l.max][0],l.map[l.max][1],l.map[l.max][2]];
	}
	
	else{
		alert('assertion error in getColor routine');
		return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2]];
	}
		
}

/**
*
*	@param s array with scalar data
*	@param max range
*	@param min range
*	@returns unpacked colors translated through this lookup table 
*/
vxlLookupTable.prototype.getColors = function(s,min,max){
	var c = [];
	
	for(var i=0;i<s.length;i++){
		var cc = this.getColor(s[i], min, max);
		c.push(cc[0]);
		c.push(cc[1]);
		c.push(cc[2]);
	
	}
	
	return c;
}
