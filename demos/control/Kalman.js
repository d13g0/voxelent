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
 * NOTE: This class requires sylvester.js and JQuery.js
 * @class implementation of the kalman filter
 * @constructor implements the kalman filter
 */
function vxlKalmanFilter(){
    this.decay = 0.003;
    this.R = Matrix.Diagonal([0.02, 0.02, 0.02]); 
    this.x = $M([[0],[0],[0],[0],[0],[0]]);
    this.P = Matrix.Random(6, 6);
    this.H = $M([[1, 0, 0, 0, 0, 0],[0, 1, 0, 0, 0 ,0],[0, 0, 1, 0, 0 ,0]]);
    this.I = Matrix.I(6);
    this.time = $.now();    
};

/**
 * Returns the filtered 3D data
 * @param {Object} xMeasure
 * @param {Object} yMeasure
 * @param {Object} zMeasure
 */
vxlKalmanFilter.prototype.filter = function (xMeasure, yMeasure, zMeasure){
    // change in time
    now = $.now();
    dt = now - this.time;
    this.time = now;

    // Derive the next state
    F = $M([[1, 0, 0, dt, 0,  0],
            [0, 1, 0, 0, dt,  0],
            [0, 0, 1, 0,  0, dt],
            [0, 0, 0, 1,  0,  0],
            [0, 0, 0, 0,  1,  0],
            [0, 0, 0, 0,  0,  1],
           ]);
   
    // decay confidence
    // to account for change in velocity
    var self = this;
    this.P = this.P.map(function(a) {
        return a * (1 + self.decay * dt);
    });
    
    // prediction
    this.x = F.x(this.x);
    this.P = F.x(this.P).x(F.transpose());

    // measurement update
    Z = $M([[xMeasure, yMeasure, zMeasure]]);
    y = Z.transpose().subtract(this.H.x(this.x));
    S = this.H.x(this.P).x(this.H.transpose()).add(this.R);
    K = this.P.x(this.H.transpose()).x(S.inverse());
    
    this.x = this.x.add(K.x(y));
    this.P = this.I.subtract(K.x(this.H)).x(this.P);
    
    return [this.x.e(1, 1),this.x.e(2, 1), this.x.e(3,1)];
};