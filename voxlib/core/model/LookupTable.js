
function vxlLookupTable(){
	this.ID = null;
	this.map = null;
	this.max = Number.MIN_VALUE;
	this.min = Number.MAX_VALUE;
}

vxlLookupTable.prototype.load = function(ID,payload){
	this.ID = ID;
	this.map = payload;
	for (var key in this.map) {
		var n = Number(key);
		if (n < this.min) {this.min = n;}
		else if (n >= this.max) {this.max = n;}
    }
}

vxlLookupTable.prototype.getColor = function(value){
	var l = this;
	var key = Math.round(value);
	if (key >= l.min && key <= l.max){
	    var c = [l.map[key][0],l.map[key][1],l.map[key][2],1.0];
		return c;
	}
	else if (key <l.min) { //truncate to min value
			return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2],1.0];
	}
	else if (key>l.max){ //truncate to max value
		return  [l.map[l.max][0],l.map[l.max][1],l.map[l.max][2],1.0];
	}
	else{
		alert('assertion error in getColor routine');
		return  [l.map[l.min][0],l.map[l.min][1],l.map[l.min][2],1.0];
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
		var value = s[i] * this.max / max;
		var cc = this.getColor(value);
		c.push(cc[0]);
		c.push(cc[1]);
		c.push(cc[2]);
		c.push(cc[3]);
	}
	
	return c;
}
