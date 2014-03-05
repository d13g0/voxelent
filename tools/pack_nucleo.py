import platform, glob, sys
import subprocess
import fileinput
import pdb
from tempfile import mkstemp
from shutil import move, copy
from os import walk,path, close, remove, makedirs
import re

def updateDemoVersion(filename, version):
    '''
    Updates the voxelent version in all demos in the demo folder
    useful to test that the newer version does not break anything previously working
    '''
    #Create temp file
    fh, abs_path = mkstemp()
    new_file = open(abs_path,'w')
    old_file = open(filename)
    for line in old_file:
        subst = re.sub(r'(voxelent_v).+(.js)','voxelent_v%s.js'%version, line);
        new_file.write(line.replace(line, subst))
    #close temp file
    new_file.close()
    close(fh)
    old_file.close()
    #Remove original file
    remove(filename)
    #Move new file
    move(abs_path, filename)
    print("%s updated to version %s"%(filename,version))



def updateVersion(VOX_VERSION_NUMBER):
    '''
    Updates the version number in VXL.js and in the demos folder
    '''
    print '-- UPDATING VERSION IN FILES --'
    print('Updating VXL.js')
    once = True
    for line in fileinput.input('../source/nucleo/vxl/VXL.js',inplace=1):
        text = line.strip()
        if text.startswith('number') and once:
            sys.stdout.write("    number: '"+VOX_VERSION_NUMBER+"',\n")
            once = False
        else:
            sys.stdout.write(line)
    
    print('Updating Demos')    
    for r,d,f in walk("../demos"):
        for files in f:
            if files.endswith(".html"):
                 url = path.join(r,files)
                 updateDemoVersion(url,VOX_VERSION_NUMBER)
    print '-- END UPDATING VERSION IN FILES --'
     
     



def pack(VOX_VERSION_NUMBER):
    '''
    Creates ONE javascript file to be added to any web project. Actually
    the minified version is also created
    ''' 

    print 'Packaging Voxelent Nucleo. Version:' + str(VOX_VERSION_NUMBER)
    
    print '-- START PACKAGER --'
    VERSION_TAG = "_v"+str(VOX_VERSION_NUMBER)
    SLUG = "c4n3l4"
    OS = platform.system()

    if OS == 'Darwin' or OS == 'Linux':
        SEP = '/'
    else:
        SEP = '\\'
    

    #Here is one of the beauties of this script: It does not matter how the files are organized into folders. This will always be the order. regardless.
    nucleo = [
             'VXL',
             'Notifier', 
             'glMatrix',
             'Landmark',   
             'Camera',
             'CameraManager',
             'CameraInteractor', 
             'ViewInteractor', 
             'TrackerInteractor', 
             'PickerInteractor',
             'Transforms',
             'Program',
             'LambertProgram',
             'PhongProgram',
             'BlenderProgram',
             'BakeProgram',
             'ProgramManager',
             'Renderer',
             'RenderTarget',
             'Model',
             'Cell',
             'Mesh',  
             'Actor',
             'Picker', 
             'Engine',
             'ExternalEngine',
             'RenderEngine',
             'BlenderEngine',
             'BakeEngine',
             'Scene', 
             'Toys',
             'LookupTable', 
             'LookupTableManager', 
             'BoundingBox', 
             'Axis', 
             'Floor',
             'View', 
             'ModelManager', 
             'API', 
             'FrameAnimation',
             'VTKReader',
             'Texture',
             'Material',
             'Renderable',
             'ActorGroup'
              
    ]
    
    
    vox_files = [path.join(root,name)
                 for root, dirs, files in walk(".."+SEP+"source"+SEP+"nucleo")
                 for name in files
                 if name.endswith(".js")]

    for f in vox_files:                         #the separator replacements of this section always apply because we are calling java
        head, tail =  path.split(f)
        tail = str.replace(tail,'.js','')
        head = str.replace(head,'\\','//')
        tdir = SLUG + '/' + head
        tdir = str.replace(tdir,'../','')
        
        print 'Processing ' + tail
 
        if not path.exists(tdir):
            makedirs(tdir)
        
        origin =  head + '/' + tail + '.js'
        target =  tdir + '/' + tail + VERSION_TAG + '.js'
        target_min =  tdir + '/' + tail + VERSION_TAG + '-min.js'
        subprocess.call(['java','-jar','yui.jar','--type', 'js', '--line-break', '500', origin, '-o',target_min])
        copy(origin, target) 
    
   
    hashmap = {}
    for root, dirs, files in walk(SLUG+SEP+"source"+SEP+"nucleo"):
        for name in files:
    
            n = path.join(root,name)
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
    for lkp in nucleo:
        key = lkp + VERSION_TAG + '.js'
        key_min = lkp + VERSION_TAG + '-min.js'
        if key in hashmap:
            buffer += hashmap[key]
            print "Adding " + key + " to voxelent"+VERSION_TAG+".js"
        if key_min in hashmap:
            buffer_min += hashmap[key_min]
            print "Adding " + key_min + " to voxelent"+VERSION_TAG+"-min.js"
    
    demos_dir = open('..'+SEP+'demos'+SEP+'lib'+SEP+'voxelent'+VERSION_TAG+'.js','w');
    demos_dir_min = open('..'+SEP+'demos'+SEP+'lib'+SEP+'voxelent'+VERSION_TAG+'-min.js','w');
    lib_dir = open('..'+SEP+'downloads'+SEP+'voxelent'+VERSION_TAG+'.js','w');
    lib_dir_min = open('..'+SEP+'downloads'+SEP+'voxelent'+VERSION_TAG+'-min.js','w');
    
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
    updateVersion(sys.argv[1])

