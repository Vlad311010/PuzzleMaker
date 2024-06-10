from Enums import Sides, Connection
from collections import namedtuple

Index = namedtuple('PuzzleIndex', ['row', 'column'])
Vector2 = namedtuple('Vector2', ['x', 'y'])

# class Vector2:
#     def __init__(self, x, y) -> None:
#         self.x = x
#         self.y = y

#     def __add__(self, o):
#         return Vector2(self.x + o.x, self.y + o.y)
    
#     def __sub__(self, o):
#         return Vector2(self.x - o.x, self.y - o.y)

#     def __floordiv__(self, other):
#         if isinstance(other, int):
#             return Vector2(self.x // other, self.y // other)
#         else:
#             raise TypeError("unsupported operand type(s) for +: '{}' and '{}'".format(self.__class__, type(other)))
        
#     def __mul__(self, other):
#         if isinstance(other, int):
#             return Vector2(self.x * other, self.y * other)
#         else:
#             raise TypeError("unsupported operand type(s) for +: '{}' and '{}'".format(self.__class__, type(other)))
    
#     def tupple(self):
#         return (self.x, self.y)


class PuzzlePiece:
    def __init__(self, row, column, edgesData=None) -> None:
        self.index = Index(row, column)

        if (not edgesData):
            self.edges = {
                Sides.TOP : Connection.UNDEFINED, 
                Sides.RIGHT : Connection.UNDEFINED, 
                Sides.BOTTOM : Connection.UNDEFINED, 
                Sides.LEFT : Connection.UNDEFINED
            }
        else:
            self.edges = edgesData

    def getConnectedPieceIndexes(self):
        connected = []
        for s, c in self.edges.items():
            if (c == Connection.IN or c == Connection.OUT):
                direction = Sides.sideToDirection(s)
                idx = Index(self.index.row + direction.row, self.index.column + direction.column)
                connected.append(idx)
        
        return connected
                

    def isDefined(self):
        return not (Connection.UNDEFINED in self.edges.values)
    
    def __str__(self) -> str:
        top = Connection.toString(self.edges[Sides.TOP])
        right = Connection.toString(self.edges[Sides.RIGHT])
        bottom = Connection.toString(self.edges[Sides.BOTTOM])
        left = Connection.toString(self.edges[Sides.LEFT])
        return f" {top} \n{left} {right}\n {bottom} "

