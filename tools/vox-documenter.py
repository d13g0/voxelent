import sys,string,traceback, os.path, subprocess, shutil
print '-- START --'
VERSION_TAG = "0.86"
subprocess.call("java -jar jsdoc-toolkit\\jsrun.jar jsdoc-toolkit\\app\\run.js -D=\"version:"+VERSION_TAG+"\" -t=jsdoc-toolkit\\templates\\jsdoc -a -d=..\\docs -r=10 ..\\source\\nucleo\\")
print ' -- END --'