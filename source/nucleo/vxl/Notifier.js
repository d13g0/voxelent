
vxl.go.notifier = new vxlNotifier();

/**
 * @class
 * @constructor
 */
function vxlNotifier(){
	this.targetList = {};
	this.sourceList = {};
    
};

vxlNotifier.prototype.addTarget = function(event,t){
	vxl.go.console('vxlNotifier: adding target for event '+event);
	var targetList = this.targetList;
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	targetList[event].push(t);
};


vxlNotifier.prototype.addSource = function(event,src){
	vxl.go.console('vxlNotifier: adding source for event '+event);
	var targetList = this.targetList;
	var sourceList = this.sourceList;
	
	if (sourceList[event]== undefined){
		sourceList[event] = src;
	}
	
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	
	$(document).bind(event, function(e,event,src,targetList){
		for (var index=0;index<targetList[event].length;index++){
			targetList[event][index].handleEvent(event,src);
		}
	});
};

vxlNotifier.prototype.fire = function(event){
	var targetList = this.targetList;
	var src = this.sourceList[event];
	vxl.go.console('vxlNotifier: firing ' +event);
	$(document).trigger(event,[event,src,targetList]);
};

vxlNotifier.prototype.getEvents = function(){
	var list = [];
	for (var event in this.sourceList){
		list.push(event);
	}
	return list;
};

vxlNotifier.prototype.getTargetsFor = function(event){
	var targets = this.targetList[event];
	var list = [];
	for (var index=0;index<targets.length;index++){
		list.push(getObjectName(targets[index]));
	}
	return list;
};


 

    



