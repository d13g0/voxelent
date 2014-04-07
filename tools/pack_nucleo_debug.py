import platform, glob, sys
import subprocess
import fileinput
import pdb
from tempfile import mkstemp
from shutil import move, copy
from os import walk,path, close, remove, makedirs
import re


def debug():
    

    print 'Checking Nucleo with YUI compressor'
    print '-- START --'

    if platform.system() == 'Darwin' or platform.system() == 'Linux':
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
             'CameraInteractor', 
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
    
    
    vox_files = [path.join(root,name)
                 for root, dirs, files in walk(".."+SEP+"source"+SEP+"nucleo")
                 for name in files
                 if name.endswith(".js")]

    
    for f in vox_files:  #the separator replacements of this section always apply because we are calling java
        head, tail =  path.split(f)
        tail = str.replace(tail,'.js','')
        head = str.replace(head,'\\','//')
        
        print 'Checking ' + tail
        origin =  head + '/' + tail + '.js'
        subprocess.call(['java','-jar','yui.jar','--type', 'js', '--line-break', '500', origin,'-o','debug-result.js'])

    print ' -- END  --'
    
if __name__ == '__main__':
    debug()  #check if there is a compilation problem when running YUI compressor
    

