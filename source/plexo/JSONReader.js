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

vxlJSONReader.prototype               = new vxlDataStreamReader();
vxlJSONReader.prototype.constructor   = vxlJSONReader;

/**
 * Reads data periodically from a JSON file. The source can be a php that returns the JSON
 * or a JSON file in the server itself.
 * @extends vxlDataStreamReader
 * @class
 */
function vxlJSONReader(){
    vxlDataStreamReader.call(this);
}; 

/**
 * @private
 */
vxlJSONReader.prototype._requestData = function(){
    
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
