import sys,string,traceback, os.path, subprocess, shutil
print '-- START --'
VERSION_TAG = "_v0.2"
subprocess.call("java -jar jsdoc-toolkit\\jsrun.jar jsdoc-toolkit\\app\\run.js -t=jsdoc-toolkit\\templates\\jsdoc -a -d=..\\..\\out\jsdocs -r=10 ..\\voxlib\\core\\")
print ' -- END --'