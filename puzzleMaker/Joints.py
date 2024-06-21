from math import ceil
from abc import ABC, abstractmethod, ABCMeta

from PIL import Image, ImageOps

from Structures import Sides


class JointBase(object, metaclass=ABCMeta):
    def _getColor(positive):
        return (255, 255, 255) if positive else (0, 0, 0)

    @classmethod
    @abstractmethod
    def new(cls, pieceWidth:int, pieceHeight:int, margin:int, side:Sides, positive:bool):
        # create class instance with image and calculated offset for insertion
        pass

    

class JointRectangle(JointBase):
    @classmethod
    def new(cls, pieceWidth:int, pieceHeight:int, margin:int, side:Sides, positive:bool):
        color = cls._getColor(positive)
        jointSize = ceil(min(pieceWidth, pieceHeight) * 0.40)
        if (side == Sides.LEFT or side == Sides.RIGHT):
            joint = Image.new("RGB", size=(margin//2, jointSize), color=color)
        else:
            joint = Image.new("RGB", size=(jointSize, margin//2), color=color)
        
        return joint



