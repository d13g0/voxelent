vxl.demo = new demo();

 function demo(){
 }
   
 /*
 * First example
 * shows:
 * - mouse interaction
 * - solid color
 * - change color
 * - bounding box
 * - camera auto positions according to bounding box
 */
 demo.prototype.cone = function(e){
	vxl.api.resetScene();
	vxl.api.loadFile("cone.vtk");
 }
 
 /*
 * Second example
 * shows: 
 * - different colors
 * - transparency
 * - introduction to the 'Public API'
 * - picking lookup table (basic)
 */
 demo.prototype.cube = function(e){
	vxl.api.resetScene();
	vxl.api.loadFile("cube1.vtk");
 }
 
  demo.prototype.test = function(e){
	vxl.api.resetScene();
	vxl.api.loadFile("testcube.vtk");
 }
  
 /*
*  Third example
*  shows:
* - rendering a complex model
* - mesh view
* - set camera look points, save, retrieve, preset (up, left, right, down, 30x30, 45x45)
*/ 
 demo.prototype.bunny = function(e){
	vxl.api.resetScene();
	vxl.api.loadFileList(["bunny_0.vtk","bunny_1.vtk"]);
 }
 
 /*
 *	Four example
 *	shows:
 * - rendering of very complex models
 * - reindexing algorithm
 * - advance use of lookup tables
 * - change lookup tables
 */
 demo.prototype.brain = function(e){
	vxl.api.resetScene();
	var filelist = ["corticalmesh_rotated_0.vtk",
				  "corticalmesh_rotated_1.vtk",
				  "corticalmesh_rotated_2.vtk",
				  "corticalmesh_rotated_3.vtk",
				  "corticalmesh_rotated_4.vtk",
				  "corticalmesh_rotated_5.vtk"
				  ];
	vxl.api.loadFileList(filelist);
 }
 
 /*
 *	Fifth example
 *	shows:
 * - animation control 
 * - start, stop, rewind, goto, fforward
 * - animation rate
 * - mani
 */
 demo.prototype.heart = function(e){
	vxl.api.resetScene();
	vxl.go.animationFrames = 20;
	var filelist = ["MYO_01.vtk","RAV_01.vtk","LAA_01.vtk",
                    "MYO_02.vtk","RAV_02.vtk","LAA_02.vtk",
					"MYO_03.vtk","RAV_03.vtk","LAA_03.vtk",
					"MYO_04.vtk","RAV_04.vtk","LAA_04.vtk",
					"MYO_05.vtk","RAV_05.vtk","LAA_05.vtk",
					"MYO_06.vtk","RAV_06.vtk","LAA_06.vtk",
					"MYO_07.vtk","RAV_07.vtk","LAA_07.vtk",
					"MYO_08.vtk","RAV_08.vtk","LAA_08.vtk",
					"MYO_09.vtk","RAV_09.vtk","LAA_09.vtk",
					"MYO_10.vtk","RAV_10.vtk","LAA_10.vtk",
					"MYO_11.vtk","RAV_11.vtk","LAA_11.vtk",
					"MYO_12.vtk","RAV_12.vtk","LAA_12.vtk",
					"MYO_13.vtk","RAV_13.vtk","LAA_13.vtk",
					"MYO_14.vtk","RAV_14.vtk","LAA_14.vtk",
					"MYO_15.vtk","RAV_15.vtk","LAA_15.vtk",
					"MYO_16.vtk","RAV_16.vtk","LAA_16.vtk",
					"MYO_17.vtk","RAV_17.vtk","LAA_17.vtk",
					"MYO_18.vtk","RAV_18.vtk","LAA_18.vtk",
					"MYO_19.vtk","RAV_19.vtk","LAA_19.vtk",
					"MYO_20.vtk","RAV_20.vtk","LAA_20.vtk"
					],
	
	actortoframe = [1,1,1,
                      2,2,2,
					  3,3,3,
					  4,4,4,
					  5,5,5,
					  6,6,6,
					  7,7,7,
					  8,8,8,
					  9,9,9,
					  10,10,10,
					  11,11,11,
					  12,12,12,
					  13,13,13,
					  14,14,14,
					  15,15,15,
					  16,16,16,
					  17,17,17,
					  18,18,18,
					  19,19,19,
					  20,20,20];

	
	
	vxl.api.loadFileList(filelist);
	vxl.c.animation = new vxlAnimation();
	vxl.c.animation.setup(vxl.c.view,filelist,actortoframe);
    //vxl.c.animation.start();
    
 }
 
 
 demo.prototype.car = function(e){
	if (e == null) return;
	if (e < 0 || e > 180) return;
	var filelist = [];
	for (var i=1;i<e;i++){
		filelist.push('pr'+i+'.json');
		message('pr'+i+'.json');
	}
	vxl.api.resetScene();
	vxl.api.loadFileList(filelist);
	vxl.c.view.zNear = 10;
 }
 
 