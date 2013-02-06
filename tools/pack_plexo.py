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
    plexo = ['Network', 'SceneDescriptor', 'DataStreamReader','JSONReader']
    
    
    vox_files = [os.path.join(root,name)
                 for root, dirs, files in os.walk(".."+SEP+"source"+SEP+"plexo") #in windows replace / with \\
                 for name in files
                 if name.endswith(".js")]
    
    for f in vox_files:                         #the separator replacements of this section always apply because we are calling java
        head, tail =  os.path.split(f)
        tail = str.replace(tail,'.js','')
        head = str.replace(head,'\\','/')
        tdir = SLUG + '/' + head
        tdir = str.replace(tdir,'../','')
        
        print 'Processing ' + tail
        
        if not os.path.exists(tdir):
                os.makedirs(tdir)
        
        origin =  head + '/' + tail + '.js'
        target =  tdir + '/' + tail + VERSION_TAG + '.js'
        target_min =  tdir + '/' + tail + VERSION_TAG + '-min.js'
        subprocess.call(['java','-jar','yui.jar','--type', 'js', '--line-break', '500', origin, '-o',target_min])
        shutil.copy(origin, target); 
    
  
    hashmap = {}
    for root, dirs, files in os.walk(SLUG+SEP+"source"+SEP+"plexo"):
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
    buffer_min = ''
    for lkp in plexo:
        key = lkp + VERSION_TAG + '.js'
        key_min = lkp + VERSION_TAG + '-min.js'
        if key in hashmap:
            buffer += hashmap[key]
            print "Adding " + key + " to vox-plexo"+VERSION_TAG+".js"
        if key_min in hashmap:
            buffer_min += hashmap[key_min]
            print "Adding " + key_min + " to vox-plexo"+VERSION_TAG+"-min.js"    
    
    
    demos_dir = open('..'+SEP+'demos'+SEP+'lib'+SEP+'vox-plexo'+VERSION_TAG+'.js','w');
    demos_dir_min = open('..'+SEP+'demos'+SEP+'lib'+SEP+'vox-plexo'+VERSION_TAG+'-min.js','w');
    lib_dir   = open('..'+SEP+'downloads'+SEP+'vox-plexo'+VERSION_TAG+'.js','w');
    lib_dir_min = open('..'+SEP+'downloads'+SEP+'vox-plexo'+VERSION_TAG+'-min.js','w');
    
    
    
    demos_dir.write(buffer);
    demos_dir_min.write(buffer_min);
    lib_dir.write(buffer);
    lib_dir_min.write(buffer_min);
    
    
    demos_dir.close();
    demos_dir_min.close();
    lib_dir.close();
    lib_dir_min.close();
    print ' -- END PACKAGER --'
    
if __name__ == '__main__':
    pack(sys.argv[1])