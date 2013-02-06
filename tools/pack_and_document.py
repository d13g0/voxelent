import sys,pack_nucleo, pack_plexo, document

def pack_n_doc(VOX_VERSION_NUMBER):
    if len(str(VOX_VERSION_NUMBER)) == 0:
        print "No version indicated"
        return
    pack_nucleo.pack(VOX_VERSION_NUMBER)
    pack_plexo.pack(VOX_VERSION_NUMBER)
    document.document(VOX_VERSION_NUMBER)

if __name__ == '__main__':
    pack_n_doc(sys.argv[1])