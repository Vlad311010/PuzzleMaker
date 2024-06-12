from json import load
from sys import path as syspath
import os

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin



parameters = {}
with open('./programParameters.json') as f:
    parameters = load(f)

# importPuzzleMaker()
syspath.append(parameters['puzzle_maker_module'])
from puzzleMaker import PuzzleMaker

app = Flask(__name__)
CORS(app)


def callPuzzleMaker(rows, columns):
    puzzleMakerScript = os.path.join(parameters['puzzle_maker_module'], 'PuzzleMaker.py')
    args = f"{parameters['image']} {parameters['puzzle_images_save_folder']} -s {rows} {columns} --no-safe-mode"
    print(f'python {puzzleMakerScript} {args}')
    os.system(f'python {puzzleMakerScript} {args}')


@app.route('/createPuzzle', methods=['POST', 'OPTIONS'])
@cross_origin()
def createPuzzle():
    body = request.get_json()
    print(body)
    if PuzzleMaker.validateInput(parameters['image'], body['puzzleSize']['rows'], body['puzzleSize']['columns']):
        return 'Image size is too small or splitted in too many pieces', 400
    callPuzzleMaker(body['puzzleSize']['rows'], body['puzzleSize']['columns'])
    return body, 200
