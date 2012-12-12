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
 * Reads data periodically from a data source
 * @class
 * @constructor
 */
function vxlDataStreamReader(){
    this.source = undefined;
    this.timerID = -1;
    this.rate = 50; //50ms by default
}; 

vxlDataStreamReader.prototype.setup = function(source,callback){
    this.source = source;
    this.callback = callback;    
}


vxlDataStreamReader.prototype.requestData = function(){
    
    var self = this;
    
    var successHandler = function(){
        return function(json, textStatus){
            if (json == null) return;
             self.callback(json);
            
       }
    };
    
    var errorHandler = function(){
        return function(request, status, error){}
     };

    //executes the AJAX request
    var request  = $.ajax({
        url         : self.source,
        type        :"GET",
        dataType    :"json",
        success     : successHandler(),
        error       : errorHandler()
    });  
};

vxlDataStreamReader.prototype.start = function(rate){
    this.rate = rate>0?rate:this.rate;
    this.timerID = setInterval(
        (function(self){
            return function(){
                 self.requestData();
             }
         })
         (this), this.rate);
};


vxlDataStreamReader.prototype.stop = function(){
    clearInterval(this.timerID);
    this.timerID = -1;
};
