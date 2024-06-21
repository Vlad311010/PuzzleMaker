from math import ceil
from abc import ABC, abstractmethod, ABCMeta

from PIL import Image, ImageOps, ImageDraw

from Structures import Sides, Vector2


class JointBase(object, metaclass=ABCMeta):
    def __init__(self, jointImage:Image, jointOffset:tuple[int, int]) -> None:
        self.image:Image = jointImage
        self.offset:tuple[int, int] = jointOffset

    def _getColor(positive):
        return (255, 255, 255) if positive else (0, 0, 0)

    @classmethod
    @abstractmethod
    def new(cls, pieceWidth:int, pieceHeight:int, margin:int, side:Sides, positive:bool):
        # create class object instance with image, offset for insertion and joint generation parameters
        pass

    
class JointRectangle(JointBase):
    @classmethod
    def new(cls, pieceWidth:int, pieceHeight:int, margin:int, side:Sides, positive:bool):
        color = cls._getColor(positive)
        jointSize = ceil(min(pieceWidth, pieceHeight) * 0.40)
        mid = Vector2((pieceWidth + margin) // 2, (pieceHeight + margin) // 2)
        negativeOffset = margin // 2

        joint: Image
        offset: tuple[int, int]
        if (side == Sides.LEFT):
            joint = Image.new("RGB", size=(margin//2, jointSize), color=color)
            offset = Vector2((not positive) * negativeOffset, mid.y - (jointSize // 2))
        elif (side == Sides.RIGHT):
            joint = Image.new("RGB", size=(margin//2, jointSize), color=color)
            offset = Vector2(margin // 2 + pieceWidth + 1 - (not positive) * negativeOffset, mid.y - (jointSize // 2))
        elif (side == Sides.TOP):
            joint = Image.new("RGB", size=(jointSize, margin//2), color=color)
            offset = Vector2(mid.x - (jointSize // 2), (not positive) * negativeOffset)
        else: # (side == Sides.BOTTOM)
            joint = Image.new("RGB", size=(jointSize, margin//2), color=color)
            offset = Vector2(mid.x - (jointSize // 2), margin // 2 + pieceHeight + 1 - (not positive) * negativeOffset)

        return cls(joint, offset)
    

class JointTriangle(JointBase):
    @classmethod
    def new(cls, pieceWidth:int, pieceHeight:int, margin:int, side:Sides, positive:bool):
        color = cls._getColor(positive)
        jointSize = ceil(min(pieceWidth, pieceHeight) * 0.5)
        mid = Vector2((pieceWidth + margin) // 2, (pieceHeight + margin) // 2)
        negativeOffset = margin // 2

        joint: Image
        offset: tuple[int, int]
        if (side == Sides.LEFT):
            joint = Image.new("RGB", size=(margin//2, jointSize), color=cls._getColor(not positive))
            offset = Vector2((not positive) * negativeOffset, mid.y - (jointSize // 2))
            draw = ImageDraw.Draw(joint, "RGB")
            if positive:
                points = ((margin//2, 0), (margin//2, jointSize), (0, jointSize//2))
            else:
                points = ((0, 0), (0, jointSize), (margin//2, jointSize//2))
            draw.polygon(points, fill=color)
        elif (side == Sides.RIGHT):
            joint = Image.new("RGB", size=(margin//2, jointSize), color=cls._getColor(not positive))
            offset = Vector2(margin // 2 + pieceWidth + 1 - (not positive) * negativeOffset, mid.y - (jointSize // 2))
            draw = ImageDraw.Draw(joint, "RGB")
            if positive:
                points = ((0, 0), (0, jointSize), (margin//2, jointSize//2))
            else:
                points = ((margin//2, 0), (margin//2, jointSize), (0, jointSize//2))
            draw.polygon(points, fill=color)
        elif (side == Sides.TOP):
            joint = Image.new("RGB", size=(jointSize, margin//2), color=cls._getColor(not positive))
            offset = Vector2(mid.x - (jointSize // 2), (not positive) * negativeOffset)
            draw = ImageDraw.Draw(joint, "RGB")
            if positive:
                points = ((0, margin//2), (jointSize, margin//2), (jointSize//2, 0))
            else:
                points = ((0, 0), (jointSize, 0), (jointSize//2, margin//2))
            draw.polygon(points, fill=color)
        else: # (side == Sides.BOTTOM)
            joint = Image.new("RGB", size=(jointSize, margin//2), color=cls._getColor(not positive))
            offset = Vector2(mid.x - (jointSize // 2), margin // 2 + pieceHeight + 1 - (not positive) * negativeOffset)
            draw = ImageDraw.Draw(joint, "RGB")
            if positive:
                points = ((0, 0), (jointSize, 0), (jointSize//2, margin//2))
            else:
                points = ((0, margin//2), (jointSize, margin//2), (jointSize//2, 0))
            draw.polygon(points, fill=color)

        return cls(joint, offset)
    




