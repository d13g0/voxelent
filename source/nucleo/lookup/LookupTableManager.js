/**
 * Manages the lookup table files. The constructor will try to load all
 * the lookup tables defined in vxl.def.luts at once.
 * 
 * @class Manages the lookup tables
 * @constructor
 */
function vxlLookupTableManager(){
	this._hashmap = {};
	this._location = "";
	vxl.go.notifier.publish(vxl.events.DEFAULT_LUT_LOADED,this);
};

/**
 * Relative path to the webpage where lookup tables can be located.
 * @param {String} loc
 */
vxlLookupTableManager.prototype.setLocation = function(loc){
	this._location = loc;
};

/**
 * Load a lookup table file
 * @param {String} name the filename of the lookup table to load
 */
vxlLookupTableManager.prototype.load = function(name){
    if (this.isLoaded(name)) return;

	var manager    = this;
	var uri        =  this._location+'/'+name+'.lut';
	var nocacheuri = uri +'?nocache=' + (new Date()).getTime();

		
    var successHandler = function(manager,name){
        return function(payload, textStatus){
            manager._handle(name,payload);
        };
   };
   
   var errorHandler = function(uri){
       return function(request, status, error){
           if(error.code = 1012){
               alert('The file '+uri+' could not be accessed. \n\n'+
               'Please make sure that the path is correct and that you have the right pemissions');
           }
           else{
               alert ('There was a problem loading the file '+uri+'. HTTP error code:'+request.status);
           }       
        };
    };
	
    var request  = $.ajax({
        url         : nocacheuri,
        type        :"GET",
        dataType    : "json",
        success     : successHandler(manager,name),
        error       : errorHandler(uri)
    }); 
};

/**
 * Once the lookup table file is retrieved, this method adds it to the lookup table manager
 */
vxlLookupTableManager.prototype._handle = function (ID, payload) {
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
