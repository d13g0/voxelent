import platform, glob, sys
import subprocess
import fileinput
import pdb
from tempfile import mkstemp
from shutil import move, copy
from os import walk, close, remove, makedirs
from os.path import join as pjoin
from os.path import split as psplit
import re

GNU_LICENCE = ("""/*================================================================================
  This is Voxelent's Nucleo Framework [%s]

  Nucleo is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation version 3.

  Nucleo is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Nucleo.  If not, see http://www.gnu.org/licenses/.
  
  WELCOME
                                                  ,     ,
                                                 (\____/)             [ ]
                                                  (_oo_)             (   )
                                                    (-)               |>|
                                                  __||__    \)     __/===\__
                                               []/______\[] /     //| o=o |\\
                                               / \______/ \/    <]  | o=o |  [>
                                              /    /__\             \=====/
                                             (\   /____\            / / | \ \
                                             
                                                   /--\           <_________>

================================================================================*/
        
""")

def update_version_in_demos(filename, version):
    '''
    Updates the voxelent version in all demos in the demo folder
    useful to test that the newer version does not break anything previously working
    '''
    
    lines = open(filename,'r').readlines()
    newlines = []
    
    
    for line in lines:
        subst = re.sub(r'(voxelent_v).+(.js)','voxelent_v%s.js'%version, line);
        newlines.append(line.replace(line, subst))
    
    out = open(filename,'w')
    out.writelines(newlines);
    out.close();


def update_version(VOX_VERSION_NUMBER):
    '''
    Updates the version number in VXL.js and in the demos folder
    '''
  
    print('      Updating VXL.js')
    once = True
    for line in fileinput.input('../source/nucleo/vxl/VXL.js',inplace=1):
        text = line.strip()
        if text.startswith('number') and once:
            sys.stdout.write("    number: '"+VOX_VERSION_NUMBER+"',\n")
            once = False
        else:
            sys.stdout.write(line)
    
    print('      Updating Demos')    
    for r,d,f in walk("../demos"):
        for files in f:
            if files.endswith(".html"):
                url = pjoin(r,files)
                update_version_in_demos(url,VOX_VERSION_NUMBER)
   
     



def pack(VOX_VERSION_NUMBER):
    '''
    Creates ONE javascript file to be added to any web project. (Actually
    the minified version is also created)
    ''' 
    print
    print 'Packaging Voxelent Nucleo. Version:' + str(VOX_VERSION_NUMBER)
    print
    
    print '-- START PACKAGER --'
    VERSION_TAG = "_v"+str(VOX_VERSION_NUMBER)
    OS = platform.system()

    if OS == 'Darwin' or OS == 'Linux':
        SEP = '/'
    else:
        SEP = '\\'
    

    #Here is one of the beauties of this script: It does not matter how the files are organized into folders. 
    #This will always be the order. regardless.
    nucleo = [
             'VXL',
             'Notifier', 
             'gl-matrix',
             'Landmark',   
             'Camera',
             'CameraManager',
             'ViewInteractor', 
             'TrackerInteractor', 
             'PickerInteractor',
             'Transforms',
             'Program',
             'LambertProgram',
             'PhongProgram',
             'BakeProgram',
             'DashProgram',
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
             'ActorGroup',
             'Silo',
             'DashEngine'
    ]
    
    #Join them all
    hashmap = {}
    
    vox_files = [pjoin(root,name)
                 for root, dirs, files in walk(".."+SEP+"source"+SEP+"nucleo")
                 for name in files
                 if name.endswith(".js")]

    print 'Processing: ',
    for vfile in vox_files: #the separator replacements of this section always apply because we are calling java
        folder, name =  psplit(vfile)
        name = str.replace(name,'.js','')
        folder = str.replace(folder,'\\','//')
        if name in nucleo:
            print '+',
            
            f = open(vfile,'r')
            hashmap[name]= f.read()
            f.close()
    
    print '\n'
    
    full_buffer = GNU_LICENCE%str(VOX_VERSION_NUMBER)

    for item in nucleo:
        if item not in hashmap:
            print 'ERROR'
            print 'There is not file associated to item '+item+'. Please check.'
            return
        full_buffer += hashmap[item]
    
    vox_location = '..'+SEP+'downloads'+SEP+'voxelent'+VERSION_TAG+'.js'
    vox_location_min = '..'+SEP+'downloads'+SEP+'voxelent'+VERSION_TAG+'-min.js'    
    
    vox_lib = open(vox_location,'w');
    vox_lib.write(full_buffer);
    vox_lib.close();
    
    print
    print '-----------------------------------------------------------------------------------------'
    print '      Voxelent Nucleo %s is now available at %s'%(VERSION_TAG,vox_location)
    
    print '      minifying ...'
    subprocess.call(['java','-jar','yui.jar','--type', 'js', '--line-break', '500', vox_location, '-o',vox_location_min])
    
    vox_min = open(vox_location_min,'r')
    contents = vox_min.read()
    vox_min.close()
    vox_min = open(vox_location_min,'w')
    contents = GNU_LICENCE%str(VOX_VERSION_NUMBER) + contents
    vox_min.write(contents)
    vox_min.close()

    print '      MINIFIED version %s is now available at %s'%(VERSION_TAG,vox_location_min)
    print '-----------------------------------------------------------------------------------------'
    print
    
    print 'Updating Files...'
    vox_location_demos = '..'+SEP+'demos'+SEP+'lib'+SEP+'voxelent'+VERSION_TAG+'.js'
    copy(vox_location, vox_location_demos);
    update_version(sys.argv[1])
    print '...Files Updated.'
    print
    print ' -- END PACKAGER --'
    
if __name__ == '__main__':
    
    pack(sys.argv[1])
    
