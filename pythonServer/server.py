from json import load
from sys import path as syspath
import os

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin



def importPuzzleMaker():
    syspath.append(parameters['puzzle_maker_module'])
    from puzzleMaker import PuzzleMaker


parameters = {}
with open('./programParameters.json') as f:
    parameters = load(f)

importPuzzleMaker()


app = Flask(__name__)
CORS(app)


def callPuzzleMaker():
    puzzleMakerScript = os.path.join(parameters['puzzle_maker_module'], 'PuzzleMaker.py')
    args = f"{parameters['image']} {parameters['puzzle_images_save_folder']} -s {7} {7} -m {35} --no-safe-mode"
    print(f'python {puzzleMakerScript} {args}')
    os.system(f'python {puzzleMakerScript} {args}')


@app.route('/createPuzzle', methods=['POST', 'OPTIONS'])
@cross_origin()
def createPuzzle():
    callPuzzleMaker()
    # print("JSON", request.get_json())
    return parameters, 200
