import sys,string,traceback, os.path, subprocess, shutil



def pack(VOX_VERSION_NUMBER):

    print 'Packaging Plexo. Version:' + str(VOX_VERSION_NUMBER)
    
    print '-- START --'
    VERSION_TAG = "_v"+str(VOX_VERSION_NUMBER)
    SLUG = "c4n3l4"
    OS = 'MAC'

    if OS == 'MAC':
        SEP = '/'
    else:
        SEP = '\\'
    
    
    minify = False
    #Here is one of the beauties of this script: It does not matter how the files are organized into folders. This will always be the order. regardless.
    plexo = ['Network', 'SceneDescriptor','CameraDescriptor']
    
    
    vox_files = [os.path.join(root,name)
                 for root, dirs, files in os.walk(".."+SEP+"source") #in windows replace / with \\
                 for name in files
                 if name.endswith(".js")]
    
    for f in vox_files:                         #the separator replacements of this section always apply because we are calling java
        head, tail =  os.path.split(f)
        tail = str.replace(tail,'.js','')
        head = str.replace(head,'\\','/')
        tdir = SLUG + '/' + head
        tdir = str.replace(tdir,'../','')
        
        if not os.path.exists(tdir):
                print "creating "+tdir
                os.makedirs(tdir)
        
        origin =  head + '/' + tail + '.js'
        target =  tdir + '/' + tail + VERSION_TAG + '.js'
        #print "Packing " + origin + ' into ' + target
        if (minify):
            subprocess.call("java -jar yui.jar --type js --line-break 500  "+ origin + " -o "+target)
        else:
            shutil.copy(origin, target); #test
    
  
    hashmap = {}
    for root, dirs, files in os.walk(SLUG+SEP+"source"):
        for name in files:
    
            n = os.path.join(root,name)
            #print 'opening '+ name
            try:
                f = open(n,'r')
                hashmap[name]= f.read()
            except IOError:
                    print 'error'
            finally:
                f.close()
    buffer = ''
    for lkp in plexo:
        key = lkp + VERSION_TAG + '.js'
        if key in hashmap:
            buffer += hashmap[key]
            print "Adding " + key + " to vox-plexo"+VERSION_TAG+".js"
            
    
    
    demos_dir = open('..'+SEP+'demos'+SEP+'lib'+SEP+'vox-plexo'+VERSION_TAG+'.js','w');
    lib_dir   = open('..'+SEP+'library'+SEP+'vox-plexo'+VERSION_TAG+'.js','w');
    net_dir   = open('..'+SEP+'..'+SEP+'..'+SEP+'vox-net'+SEP+'lib'+SEP+'vox-plexo'+VERSION_TAG+'.js','w');
    
    
    demos_dir.write(buffer);
    lib_dir.write(buffer);
    net_dir.write(buffer);
    
    demos_dir.close();
    lib_dir.close();
    net_dir.close();
    print ' -- END --'
    
if __name__ == '__main__':
    pack(sys.argv[1])