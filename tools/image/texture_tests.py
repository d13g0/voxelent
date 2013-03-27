'''
Created on Mar 25, 2013

@author: odin
'''

from PIL import Image, ImageDraw

size = 512, 1024

im = Image.new('RGB', size)

dr = ImageDraw.Draw(im)

dr.rectangle((0,0,512,512),"#57ff4f")
dr.rectangle((0,512,256,1024),"#0943ff")
dr.rectangle((256,512,512,1024),"#ff4300")

im.save('/Users/odin/Desktop/rectangle.png','PNG')

