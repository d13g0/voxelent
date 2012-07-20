
vxl.go.notifier = new vxlNotifier();

/**
 * <p> 
 * Handles asynchronous communication among classes in Voxelent 
 * using a publisher-subscriber mechanism
 * </p>
 * 
 * @class
 * @constructor
 */
function vxlNotifier(){
	this.targetList = {};
	this.sourceList = {};
    
};

/**
 * <p>Used by any class to declare the events that the class will listen for.</p>
  
 * @param {Object} list
 * @param {Object} receiver
 */
vxlNotifier.prototype.subscribe = function(list,receiver){
	if (typeof(list)=='string'){
		this.addTarget(list,receiver);
	}
	else if (list instanceof Array){
		for (var i=0;i<list.length;i+=1){
			this.addTarget(list[i],receiver);
		}
	}
	else {
		throw 'vxlNotifier.receives: this method receives a string or a list of strings'
	}
};

/**
 * <p>Used by any class to declare the events that the class will generate</p> 
 * @param {Object} list
 * @param {Object} sender
 */
vxlNotifier.prototype.publish = function(list,sender){
	if (typeof(list)== 'string'){
		this.addSource(list,sender);
	}
	else if (list instanceof Array){
		for (var i=0;i<list.length;i+=1){
			this.addSource(list[i],sender);
		}
	}
	else {
		throw 'vxlNotifier.sends: this method receives a string or a list of strings'
	}
}


/**
 * Any class can use this method to tell the notifier that it will listen to 
 * a particular event.
 * 
 * @param {Object} event the event the class will listen to
 * @param {Object} target the object that will listen for the event
 */
vxlNotifier.prototype.addTarget = function(event, target){
	vxl.go.console('vxlNotifier: adding target for event '+event);
	var targetList = this.targetList;
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	targetList[event].push(target);
};


/**
 * Any class can use this method to tell the notifier that it will emit a particular event
 * 
 * @param {Object} event the event to emit
 * @param {Object} src the object that will emit the event
 */
vxlNotifier.prototype.addSource = function(event,src){
	vxl.go.console('vxlNotifier: adding source for event '+event);
	var targetList = this.targetList;
	var sourceList = this.sourceList;
	
	if (sourceList[event]== undefined){
		sourceList[event] = [];
	}
	
	if (targetList[event]== undefined){
		targetList[event] = [];
	}
	
	sourceList[event].push(src);
	
	$(document).bind(event, function(e,event,src,targetList){
		for (var index=0;index<targetList[event].length;index++){
			targetList[event][index].handleEvent(event,src);
		}
	});
};

/**
 * <p>Invoked by any class when it needs to emit an event that should be propagated to other
 * objects in the library</p>
 * 
 * <p>The notifier will first verify if the object emitting the event has been authorized to do so.
 * This is, the object should have registered using either <code>addSource</code> or <code>sends</code>.
 * After that, the notifier will retrieve a list of the objects that have registered as listeners of 
 * the particular event and fires the event to them using JQuery.
 * </p>
 *  
 * @param {Object} event
 * @param {Object} src
 */
vxlNotifier.prototype.fire = function(event, src){
	var targetList = this.targetList;
	
    var idx = this.sourceList[event].indexOf(src);
    if (idx == -1){
    	throw 'The source '+src+' is not registered to trigger the event '+event+'. Did you use vxlNotifier.addSource?';
    }
	vxl.go.console('vxlNotifier: firing ' +event);
	$(document).trigger(event,[event,src,targetList]);
};

/**
 * Gets a list of the events handled by this vxlNotifier 
 */
vxlNotifier.prototype.getEvents = function(){
	var list = [];
	for (var event in this.sourceList){
		list.push(event);
	}
	return list;
};


/**
 * Get a list of the objects that are currently registered to listen for a particular event 
 * @param {Object} event the event in question
 */
vxlNotifier.prototype.getTargetsFor = function(event){
	var targets = this.targetList[event];
	var list = [];
	for (var index=0;index<targets.length;index++){
		list.push(getObjectName(targets[index]));
	}
	return list;
};


 

    



