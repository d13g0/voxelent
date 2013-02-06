/*-------------------------------------------------------------------------
    This file is part of Voxelent's Plexo

    Plexo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation version 3.

    Plexo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Plexo.  If not, see <http://www.gnu.org/licenses/>.
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

/**
 * Sets the source and the callback properties.
 * @param {Object} source source
 * @param {Object} callback function that will be invoked when data is available
 */
vxlDataStreamReader.prototype.setup = function(source,callback){
    this.source = source;
    this.callback = callback;    
}

/**
 * Abstract method to be implemented by vxlDataStreamReader descendents
 * @private
 */
vxlDataStreamReader.prototype._requestData = function(){
    //abstract method to be implemented by its descendents    
};

/**
 * Starts querying for data
 * @param {Object} rate querying rate in milliseconds
 */
vxlDataStreamReader.prototype.start = function(rate){
    this.rate = rate>0?rate:this.rate;
    this.timerID = setInterval(
        (function(self){
            return function(){
                 self._requestData();
             }
         })
         (this), this.rate);
};

/**
 * Stops querying for data
 */
vxlDataStreamReader.prototype.stop = function(){
    clearInterval(this.timerID);
    this.timerID = -1;
};
