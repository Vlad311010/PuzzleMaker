import os
import glob
from typing import Final
from json import dumps, dump
from math import ceil

from PIL import Image, ImageFilter, ImageOps 

from Structures import *
from PuzzleMap import PuzzleMap


class ImageSplitter:
    WHITE: Final[tuple[int, int, int]] = (255, 255, 255)
    BLACK: Final[tuple[int, int, int]] = (0, 0, 0)

    @classmethod
    def _makePuzzlePiece(cls, w:int, h:int, mw:int, mh:int, joints):
        def insertJoint(original:Image, jointImg:Image, x:int, y:int):
            original.paste(jointImg, (x, y))

        size = Vector2(w, h)
        margin = Vector2(mw, mh)
        mid = Vector2((size.x + margin.x) // 2, (size.y + margin.y) // 2)
        pieceSize = Vector2(size.x+margin.x, size.y+margin.y)

        im = Image.new(mode="RGBA", size=pieceSize, color=cls.WHITE)
        pixels = im.load()
        for x in range(im.size[0]):
            for y in range(im.size[1]):
                if (y < margin.y // 2 or y > size.y + margin.y // 2):
                    pixels[x, y] = cls.BLACK

                if (x < margin.x // 2 or x > size.x + margin.x // 2):
                    pixels[x, y] = cls.BLACK

        jointSize = ceil(min(w, h) * 0.45)
        jointHorizontalPositive = Image.new("RGB", size=(mw//2, jointSize), color=cls.WHITE)
        jointVerticalPositive = jointHorizontalPositive.resize((jointHorizontalPositive.size[1], jointHorizontalPositive.size[0]))
        jointHorizontalNegative = ImageOps.invert(jointHorizontalPositive)
        jointVerticalNegative = ImageOps.invert(jointVerticalPositive)

        negativeOffset = mw // 2
        
        if (joints[Sides.LEFT] == Connection.OUT):
            insertJoint(im, jointHorizontalPositive, 0, mid.y - (jointSize // 2))
        elif (joints[Sides.LEFT] == Connection.IN):
            insertJoint(im, jointHorizontalNegative, negativeOffset, mid.y - (jointSize // 2))

        if (joints[Sides.RIGHT] == Connection.OUT):
            insertJoint(im, jointHorizontalPositive, margin.x // 2 + size.x + 1, mid.y - (jointSize // 2))
        elif (joints[Sides.RIGHT] == Connection.IN):
            insertJoint(im, jointHorizontalNegative, margin.x // 2 + size.x + 1 - negativeOffset, mid.y - (jointSize // 2))

        if (joints[Sides.TOP] == Connection.OUT):
            insertJoint(im, jointVerticalPositive, mid.x - (jointSize // 2), 0)
        elif (joints[Sides.TOP] == Connection.IN):
            insertJoint(im, jointVerticalNegative, mid.x - (jointSize // 2), negativeOffset)

        if (joints[Sides.BOTTOM] == Connection.OUT):
            insertJoint(im, jointVerticalPositive, mid.x - (jointSize // 2), margin.y // 2 + size.y + 1)
        elif (joints[Sides.BOTTOM] == Connection.IN):
            insertJoint(im, jointVerticalNegative, mid.x - (jointSize // 2), margin.y // 2 + size.y + 1 - negativeOffset)

        # im.show()
        return im

    @staticmethod
    def _cut(img:Image, x, y, w, h):
        return img.crop((x, y, x + w, y + h))

    @staticmethod
    def _cutWithMargin(img:Image, x, y, w, h, m):
        return img.crop((x - m // 2, y - m // 2, x + w + m // 2, y + h + m // 2))

    @staticmethod
    def _maskImage(imagePiece, margin, joints):
        puzzleMask = ImageSplitter._makePuzzlePiece(imagePiece.size[0] - margin, imagePiece.size[1] - margin, margin, margin, joints).convert("L")
        imagePiece.putalpha(puzzleMask)
        return imagePiece

    @staticmethod
    def _replaceColor(img:Image, colorToReplace:tuple[int, int, int], replacer:tuple[int, int, int]):
        pixdata = img.load()
        for y in range(img.size[1]):
            for x in range(img.size[0]):
                if pixdata[x, y] == (*colorToReplace, 255):
                    pixdata[x, y] = (*replacer, 255)

    @staticmethod
    def _addBorder(img:Image, color:tuple[int, int, int], thickness:int = 1):
        if (thickness == 0):
            return img
        
        r, g, b, a = img.split()
        # find edges
        edges = a.filter(ImageFilter.FIND_EDGES)
        edges = edges.convert("RGBA")
        edgesEnchaced = edges.filter(ImageFilter.MaxFilter(thickness))
        edgesInvert = ImageOps.invert(edgesEnchaced.convert("L"))
        # color edges    
        ImageSplitter._replaceColor(edgesEnchaced, ImageSplitter.WHITE, color)
        # add edges to original image
        imgWithEdges = Image.composite(img, edgesEnchaced, edgesInvert)
        return imgWithEdges    

        
    @staticmethod
    def _clearFolder(folder:str):
        folder = folder.replace('/', os.path.sep)
        path = folder + '*.png' if folder[-1] == os.path.sep else folder + f'{os.path.sep}*.png'
        files = glob.glob(path)
        for f in files:
            os.remove(f)

    @staticmethod
    def splitImage(imgPath:str, saveFolder:str, puzzleMap:PuzzleMap, borderSize:int, safeMode:bool, scale:int=1):
        if (not safeMode):
            ImageSplitter._clearFolder(saveFolder)
    
        with Image.open(imgPath) as img:
            # img = img.resize((800, 800))
            # img = img.resize(fitTo)
            # img = img.resize((img.size[0] // 2, img.size[1] // 2))
            img = img.resize((ceil(img.size[0] * scale), ceil(img.size[1] * scale)))
            
            w, h = img.size
            pieceSize = Vector2(w / puzzleMap.columns, h / puzzleMap.rows)
            margin = ceil(min(pieceSize.x, pieceSize.y) * 0.6)
            stepX = pieceSize[0]
            stepY = pieceSize[1]
            y = 0
            for r in range(puzzleMap.rows):
                x = 0
                for c in range(puzzleMap.columns):
                    piece = ImageSplitter._cutWithMargin(img, x, y, pieceSize.x, pieceSize.y, margin)
                    piece = ImageSplitter._maskImage(piece, margin, puzzleMap.getPieceMap(r, c))
                    piece = ImageSplitter._addBorder(piece, (75,75,75), borderSize)
                    piece.save(saveFolder + f"{r}_{c}.png")
                    x += stepX
                y += stepY

            ImageSplitter.createSplitedImageMetadata(saveFolder, Vector2(puzzleMap.rows, puzzleMap.columns), pieceSize, margin, puzzleMap)
    

    @staticmethod
    def createSplitedImageMetadata(saveFolder:str, puzzleSize:Vector2, pieceSize:Vector2, margin:int, puzzleMap:PuzzleMap):
        def calculateJointsOffset(r, c):
            halfMarging = margin / 2
            jointOffsetStepOut = Vector2(pieceSize.x / 2 + halfMarging - halfMarging / 2, pieceSize.y / 2 + halfMarging - halfMarging / 2)
            jointOffsetStepIn = Vector2(pieceSize.x / 2 - halfMarging + halfMarging / 2, pieceSize.y / 2 - halfMarging + halfMarging / 2)
            
            joints = {}
            piece = puzzleMap.getPiece(r, c)
            connected:Index
            for connected in piece.getConnectedPieceIndexes():
                direction = Index(connected.row - r, connected.column - c)
                if (piece.edges[Sides.directionToSide(direction)] == Connection.OUT):
                    offset = { 'x': direction.column * jointOffsetStepOut.x, 'y': direction.row * jointOffsetStepOut.y }
                elif (piece.edges[Sides.directionToSide(direction)] == Connection.IN): # == Connection.IN
                    offset = { 'x': direction.column * jointOffsetStepIn.x, 'y': direction.row * jointOffsetStepIn.y }
                else:
                    raise Exception()
                    
                joints[f"{connected.row}_{connected.column}"] = offset

            return { "joints": joints }


        data = {
            "puzzleSize": { 'rows': puzzleSize[0], 'columns': puzzleSize[1] },
            "pieceSize": { 'x': pieceSize[0], 'y': pieceSize[1] },
            "margin": margin,
            "pieces": {}
        }

        saveFolder = saveFolder if saveFolder[-1] == os.path.sep else saveFolder + f'{os.path.sep}'
        path = saveFolder + 'puzzleData.json'
        
        for r in range(puzzleSize[0]):
            for c in range(puzzleSize[1]):
                data['pieces'][f'{r}_{c}'] = calculateJointsOffset(r, c)
                data['pieces'][f'{r}_{c}']['src'] = saveFolder + f'{r}_{c}.png'

        with open(path, 'w', encoding='utf-8') as f:
            dump(data, f, ensure_ascii=False, indent=4)


    
    @staticmethod
    def joinImages(imagesFolder, rows, columns, margin):
        path = imagesFolder + '*.png' if imagesFolder[-1] == os.path.sep else imagesFolder + f'{os.path.sep}*.png'
        files = glob.glob(path)
        pieceSize: tuple[int, int]
        with Image.open(files[0]) as img:
            pieceSize = img.size
        
        connectedImages = Image.new("RGBA", (pieceSize[0] * columns, pieceSize[1] * rows))

        for f in files:
            with Image.open(f) as img:
                r, c = map(int, f.split('\\')[-1].split('.')[0].split('_'))
                offsetX = 0 if (c == 0) else margin
                offsetY = 0 if (r == 0) else margin

                pastePosition = (pieceSize[0] * c - offsetX * c, pieceSize[1] * r - offsetY * r)
                connectedImages.paste(img, pastePosition, img)

        connectedImages.show()

        

    @staticmethod
    def test():
        with Image.open("./src/images/sampleImage00.png") as org:
            w, h = org.size
            joined = Image.new("RGBA", size=(200, 100))

            step = 100
            # img = cut(img, 400, 200, 140, 140)
            img = ImageSplitter._cutWithMargin(org, 400, 200, 100, 100, 40)
            # img2 = cutWithMargin(org, 500, 200, 100, 100, 40)
            edgesData = {
                            Sides.TOP : Connection.OUT, 
                            Sides.RIGHT : Connection.IN, 
                            Sides.BOTTOM : Connection.IN, 
                            Sides.LEFT : Connection.OUT
                        }
        
            img:Image = ImageSplitter._maskImage(img, 40, edgesData)

            img.show()

            # img = addBorder(img, (169,169,169))
            # img.show()
            # return 

            # r, g, b, a = img.split()
            # edges = a.filter(ImageFilter.FIND_EDGES)
            # # edges = gray_image.filter(ImageFilter.FIND_EDGES)
            # edges = edges.convert("RGBA")
            # edgesEnchaced = edges.filter(ImageFilter.MaxFilter(1))
            # # edges.show()
            # # edgesEnchaced.show()
            # edgesInvert = ImageOps.invert(edgesEnchaced.convert("L"))
            # # edgesEnchacedColored = edgesEnchaced.filter(ImageFilter.)
            # replaceColor(edgesEnchaced, WHITE, (105,105,105))
            # imgWithEdge = Image.composite(img, edgesEnchaced, edgesInvert)
            # imgWithEdge.show()

            # r, g, b, a = img.split()
            # rgb_image = Image.merge("RGB", (r, g, b))
            # gray_image = rgb_image.convert("L")
            # edges = gray_image.filter(ImageFilter.FIND_EDGES)
            # edges_rgba = edges.convert("RGBA")
            # edge_r, edge_g, edge_b, edge_a = edges_rgba.split()
            # final_image = Image.merge("RGBA", (edge_r, edge_g, edge_b, a))
            # final_image.show()

        # img2 = maskImage(img2, 40)

        # joined.paste(img, (0, 0))
        # joined.paste(img2, (100, 0))
        

        # img = maskImage(img, 40)
        # img = ImageOps.expand(img, border, fill="black")

        # puzzleMask = makePuzzlePiece(100, 100, 40, 40).convert("L")
        # img.putalpha(puzzleMask)
        
        # img.show()
        # img2.show()
        # joined.show()
            

if __name__ == "__main__":       
    # test()
    puzzleSize = (7, 7)
    puzzleMap = PuzzleMap(*puzzleSize)
    puzzleMap.solvePuzzle()
    SAVE_FOLDER = "C:\\Users\\Vlad\\Desktop\\testApp\\puzzle\\src\\puzzlePieces\\"
    margin = 35
    ImageSplitter.splitImage("./src/images/sampleImage00.png", SAVE_FOLDER, puzzleMap, 1, False)
    ImageSplitter.joinImages(SAVE_FOLDER, *puzzleSize, margin)