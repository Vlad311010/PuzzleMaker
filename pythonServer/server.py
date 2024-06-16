from json import load, loads
from sys import path as syspath
from os import listdir
from os.path import isfile, join, sep, commonpath
import glob
from zipfile import ZipFile
import pathlib

from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS, cross_origin



parameters = {}
with open('./serverParameters.json') as f:
    parameters = load(f)

syspath.append(parameters['puzzle_maker_module'])
from puzzleMaker import PuzzleMaker

app = Flask(__name__)
CORS(app)


def callPuzzleMaker(image, rows, columns, scale):
    PuzzleMaker.splitImage(image, rows, columns, parameters['save_folder'], 1, scale)


@app.route('/createPuzzle', methods=['POST', 'OPTIONS'])
@cross_origin()
def createPuzzle():
    body = loads(request.form['data'])
    image = request.files['image']
    if PuzzleMaker.validateInput(image, body['puzzleSize']['rows'], body['puzzleSize']['columns'], body['scale']):
        return jsonify({'errorMessage': 'Image size is too small or splitted in too many pieces'}), 400

    callPuzzleMaker(image, body['puzzleSize']['rows'], body['puzzleSize']['columns'], body['scale'])
    createPiecesZip()
    # print(pathlib.Path(__file__).resolve())
    # saveFolderAbsolutePath = join(pathlib.Path().resolve(), sep.join(parameters['save_folder'].split(sep)[1:]))
    # print("Absolute", saveFolderAbsolutePath)
    # commonPath = commonpath([saveFolderAbsolutePath, pathlib.Path().resolve()])
    # print("Common", commonPath)
    # saveFolderRelative = saveFolderAbsolutePath.replace(commonPath, ".")
    # print("Relative", saveFolderRelative)
    # return send_file(saveFolderAbsolutePath, mimetype='application/zip')

    # with open(join(parameters['save_folder'], parameters['zip_file_name']), 'rb') as responceFile:
    # response = make_response(send_file(r'C:\Users\Vlad\Desktop\testApp\puzzle\pythonServer\generatedData\pieces.zip', mimetype='application/zip'))
    # response.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    # return response
    return send_file(r'C:\Users\Vlad\Desktop\testApp\puzzle\pythonServer\generatedData\pieces.zip', mimetype='application/zip')
    # return body, 200


def createPiecesZip():
    folderPath = parameters['save_folder'].replace('/', sep)
    folderPath = join(folderPath, '*.png')
    with ZipFile(join(parameters['save_folder'], parameters['zip_file_name']), 'w') as zipfile:
        zipfile.write(join(parameters['save_folder'], 'puzzleData.json'), arcname='puzzleData.json')
        for file in glob.glob(folderPath):
            fileName = file.split(sep)[-1]
            zipfile.write(file, arcname=fileName)
            