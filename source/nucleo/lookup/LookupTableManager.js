/**
 * Manages the lookup table files. The constructor will try to load all
 * the lookup tables defined in vxl.def.luts at once.
 * 
 * @class Manages the lookup tables
 * @constructor
 */
function vxlLookupTableManager(){
	this.lutTimerID = 0;
	this._hashmap = {};
	this.location = "";
	vxl.go.notifier.publish(vxl.events.DEFAULT_LUT_LOADED,this);
};

vxlLookupTableManager.prototype.setLocation = function(loc){
	this.location = loc;
}

/**
 * Load a lookup table file
 * @param {String} name the filename of the lookup table to load
 */
vxlLookupTableManager.prototype.load = function(name){
		var self = this;
		if (this.isLoaded(name)) return;

	    var request = new XMLHttpRequest();
	    request.open("GET", this.location+'/'+name+'.lut');
	    request.onreadystatechange = function() {
	      if (request.readyState == 4) {
		    if(request.status == 404) {
				alert (name + ' does not exist');
				vxl.go.console('LookupTableManager: '+name + ' does not exist');
			 }
			else {
				self.handle(name,JSON.parse(request.responseText));
			}
		  }
	    };
		request.send();
};
/**
 * Once the lookup table file is retrieved, this method adds it to the lookup table manager
 */
vxlLookupTableManager.prototype.handle = function (ID, payload) {
	var lut = new vxlLookupTable();
	lut.load(ID,payload);
	this._hashmap[ID] = lut;
	
	if (lut.ID == vxl.def.lut.main){
		vxl.go.notifier.fire(vxl.events.DEFAULT_LUT_LOADED, this);
	}
};
/**
 * Check if a lookup table has been loaded by this lookup table manager
 * @param {String} ID the id of the table to check
 */
vxlLookupTableManager.prototype.isLoaded = function(ID){
	return this._hashmap[ID] != undefined;
};

/**
 * Retrieves a lookup table
 * @param {String} ID id of the lookup table to retrieve
 */
vxlLookupTableManager.prototype.get = function(ID){
	return this._hashmap[ID];
};

/**
 * Returns a list with the names of all of the lookup tables that have been loaded.
 * @returns {Array} an array with the names of the lookup tables that have been loaded
 */
vxlLookupTableManager.prototype.getAllLoaded = function(){
    var tables = [];
    for(lut in this._hashmap){
        tables.push(this._hashmap[lut].ID);
    }
    return tables;
};

/**
 * Checks if all the lookup tables have been loaded
 */
vxlLookupTableManager.prototype.allLoaded = function(){
    var size = 0;
	for(lut in this._hashmap){
        size++;
    }
	return (vxl.def.lut.list.length == size);
};

/**
 * Loads all the lookup tables defined in vxl.def.luts
 */
vxlLookupTableManager.prototype.loadAll = function(){
	for(var i=0;i<vxl.def.lut.list.length;i++){
		this.load(vxl.def.lut.list[i]);
	}
};

/**
 * Creates the global lookup table manager and load all the lookup tables at once
 */
vxl.go.lookupTableManager = new vxlLookupTableManager();
