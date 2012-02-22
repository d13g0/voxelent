import sys,string,traceback, os.path, subprocess, shutil

def document(VOX_VERSION_NUMBER):
    if len(str(VOX_VERSION_NUMBER)) == 0:
        print "No version indicated"
        return
    print '-- START --'
    VERSION_TAG = ""+str(VOX_VERSION_NUMBER)+"";
    subprocess.call("java -jar jsdoc-toolkit\\jsrun.jar jsdoc-toolkit\\app\\run.js -D=\"version:"+VERSION_TAG+"\" -t=jsdoc-toolkit\\templates\\jsdoc -a -d=..\\docs -r=10 ..\\source\\nucleo\\")
    print ' -- END --'
    
if __name__ == '__main__':
    document(sys.argv[1])