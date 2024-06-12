import argparse

from PIL import Image

from ImageSplitter import ImageSplitter
from PuzzleMap import PuzzleMap


def main(args):
    puzzleMap = PuzzleMap(*args.size)
    puzzleMap.solvePuzzle()
    ImageSplitter.splitImage(args.file, args.savePath, puzzleMap, args.border, args.safeMode)
    # ImageSplitter.joinImages(args.savePath, *args.size, 40)

def validateInput(imgPath:str, rows, columns):
    puzzleMap = PuzzleMap(rows, columns)
    try:
        with Image.open(imgPath) as img:
            w, h = img.size
            pieceSize = (w / puzzleMap.columns, h / puzzleMap.rows)
            return pieceSize[0] <= 25 or pieceSize[1] <= 25
    except FileNotFoundError:
        return False


def arguments_parser():
    parser = argparse.ArgumentParser(prog='PuzzleMaker')
    parser.add_argument('file', metavar='F', type=str, help="file path to image")    
    parser.add_argument("savePath", metavar='P', type=str,
                        help="""absolute path to folder where all puzzle pieces will be stored 
                            (Warning: all *.png files stored in this folder may be deleted or overwritten)""")
    parser.add_argument("--safe-mode", type=bool, default=True, action=argparse.BooleanOptionalAction, dest="safeMode",
                        help="if dissabled program will delete all *.png files in 'savePath' before creating puzzle pieces")
    # parser.add_argument("-m", "--margin", type=int, default=40, metavar='') # temporary parameter
    parser.add_argument("-s", "--size",  nargs=2, type=int, default=[10, 10], metavar='')
    parser.add_argument("-b", "--border", type=int, default=1, metavar='',
                        help='size of puzzle piece border (0: no border)')

    args = parser.parse_args()
    
    return args


if (__name__ == "__main__"):    
    arguments = arguments_parser()
    main(arguments)

    # python PuzzleMaker.py C:\Users\Vlad\Desktop\testApp\puzzle\src\images\sampleImage00.png C:\Users\Vlad\Desktop\testApp\puzzle\src\puzzlePieces\ -s 8 8 --no-safe-mode 
    # python PuzzleMaker.py C:\Users\Vlad\Desktop\testApp\puzzle\src\images\sampleImage00.png .\src\puzzlePieces\ -s 8 8 --no-safe-mode 