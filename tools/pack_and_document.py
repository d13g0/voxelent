import sys,pack_nucleo, document_nucleo

def pack_n_doc(VOX_VERSION_NUMBER):
    if len(str(VOX_VERSION_NUMBER)) == 0:
        print "No version indicated"
        return
    pack_nucleo.pack(VOX_VERSION_NUMBER)
    document_nucleo.document(VOX_VERSION_NUMBER)

if __name__ == '__main__':
    pack_n_doc(sys.argv[1])