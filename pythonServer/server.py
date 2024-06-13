from json import load, loads
from sys import path as syspath
import os

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin



parameters = {}
with open('./programParameters.json') as f:
    parameters = load(f)

syspath.append(parameters['puzzle_maker_module'])
from puzzleMaker import PuzzleMaker

app = Flask(__name__)
CORS(app)


def callPuzzleMaker(image, rows, columns):
    PuzzleMaker.splitImage(image, rows, columns, parameters['puzzle_images_save_folder'], 1)


@app.route('/createPuzzle', methods=['POST', 'OPTIONS'])
@cross_origin()
def createPuzzle():
    body = loads(request.form['data'])
    image = request.files['image']
    if PuzzleMaker.validateInput(image, body['puzzleSize']['rows'], body['puzzleSize']['columns']):
        return jsonify({'errorMessage': 'Image size is too small or splitted in too many pieces'}), 400

    callPuzzleMaker(image, body['puzzleSize']['rows'], body['puzzleSize']['columns'])
    return body, 200
