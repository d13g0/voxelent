function vxlLookupTableManager(){
	this.lutTimerID = 0;
	this.tables = [];
	vxl.go.notifier.addSource('vxl.event.default_lut_loaded',this);
    
}

vxlLookupTableManager.prototype.load = function(name){
		var self = this;
		if (this.isLoaded(name)) return;

		//message('Requesting '+name+'...');
	    var request = new XMLHttpRequest();
	    request.open("GET", vxl.def.lutFolder+'/'+name+'.lut');
	    request.onreadystatechange = function() {
	      if (request.readyState == 4) {
		    if(request.status == 404) {
				alert (name + ' does not exist');
				message(name + ' does not exist');
			 }
			else {
				self.handle(name,JSON.parse(request.responseText));
			}
		  }
	    }
		request.send();
}

vxlLookupTableManager.prototype.handle = function (ID, payload) {
	var lut = new vxlLookupTable();
	lut.load(ID,payload);
	this.tables.push(lut);
	
	if (lut.ID == vxl.def.lut){
		vxl.go.notifier.fire('vxl.event.default_lut_loaded');
	}
}

vxlLookupTableManager.prototype.isLoaded = function(ID){
	for(var i=0;i<this.tables.length;i++){
		if (this.tables[i].ID == ID) return true;
	}
	return false;
}

vxlLookupTableManager.prototype.get = function(ID){
	for(var i=0;i<this.tables.length;i++){
		if (this.tables[i].ID == ID) return this.tables[i];
	}
	return null;
}

vxlLookupTableManager.prototype.getAllLoaded = function(){
    var tablenames = [];
    for(var i=0;i<this.tables.length;i++){
        tablenames[i] = this.tables[i].ID;
    }
    return tablenames;
}

vxlLookupTableManager.prototype.allLoaded = function(){
	//think of a timeout to alter this state in the case not all tables are loaded (can this happen?)
	return (vxl.def.luts.length == this.tables.length);
}

vxlLookupTableManager.prototype.loadAll = function(){
	for(var i=0;i<vxl.def.luts.length;i++){
		this.load(vxl.def.luts[i]);
	}
}


vxl.go.lookupTableManager = new vxlLookupTableManager();
vxl.go.lookupTableManager.loadAll();