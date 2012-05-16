import sys,vxl_packager_nucleo, vxl_documenter

def pack_n_doc(VOX_VERSION_NUMBER):
    if len(str(VOX_VERSION_NUMBER)) == 0:
        print "No version indicated"
        return
    vxl_packager_nucleo.pack(VOX_VERSION_NUMBER)
    vxl_documenter.document(VOX_VERSION_NUMBER)

if __name__ == '__main__':
    pack_n_doc(sys.argv[1])