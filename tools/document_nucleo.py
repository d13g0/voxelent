import platform, sys,string,traceback, os.path, subprocess, shutil

def document(VOX_VERSION_NUMBER):
    if len(str(VOX_VERSION_NUMBER)) == 0:
        print "No version indicated"
        return
    print '-- START DOCUMENTER --'
    VERSION_TAG = ""+str(VOX_VERSION_NUMBER)+"";
   
    OS = platform.system()
    
    if OS == 'Darwin' or OS == 'Linux':
        SEP = '/'
    else:
        SEP = '\\'
        
    subprocess.call(['java','-jar','jsdoc-toolkit'+SEP+'jsrun.jar', 'jsdoc-toolkit'+SEP+'app'+SEP+'run.js', '-D=\"version:'+VERSION_TAG+'\"', '-t=jsdoc-toolkit'+SEP+'templates'+SEP+'jsdoc', '-a','-E=glMatrix.js' ,'-d=..'+SEP+'docs', '-r=10', '..'+SEP+'source'+SEP+'nucleo'])
    print ' -- END DOCUMENTER --'
    
if __name__ == '__main__':
    document(sys.argv[1])