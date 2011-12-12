
var fps = {
	lastFireTime:undefined,
	time:undefined,
	slidingWindow:10,
	times:[],
	lastIdx:0,
	
	init:function(){
		for (var i=0; i<this.slidingWindow; ++i) {
			this.times[i]=0.0;
		}
	},

	update:function(duration){
		var S=0.0;
		this.times[this.lastIdx] = duration;
		this.lastIdx = (this.lastIdx+1)%this.slidingWindow; //ingenious
		for (var i=0; i<this.slidingWindow; ++i) { S += this.times[i]; }
		var A= Math.round(100000*this.slidingWindow/S)/100;
		$('#vxl-id-fps').html(A);
	}
}

//fps.init();
