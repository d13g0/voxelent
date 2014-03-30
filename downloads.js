var list = []

function getDownloads(then){
list = [];
$.get("https://api.github.com/repos/d13g0/voxelent/contents/downloads", 
    function( data,list ) {
        N = data.length;
        //var con = $("div.post-content");
        for(var i=0; i<N; i+=1){
            name = data[i]['name'];
            if (name == 'voxelent_v0.89.js' ||
                name.startsWith('vox-gui') || 
                name.startsWith('vox-plexo')){
                continue;
                }
            var url = "https://raw.githubusercontent.com/d13g0/voxelent/master/";
            url = url + data[i]['path'];
            list.push([name,url]);
        }
        then();
    });
};

function listAllVersions(){
    var con = $("div.post-content");
    N = list.length;
    for (var i =0; i <N; i +=1){
        name = list[i][0];
        url = list[i][1];
        con.append("<a href='"+url+"' download>"+name+"</a>");
        con.append("<br/>");
    }
};

function listCurrentVersion(){
}
