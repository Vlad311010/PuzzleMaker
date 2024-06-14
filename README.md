
This react application to generate jigsaw puzzles out of provided image.
Frontend written in react and backend in Python. The frontend and backend communicate through a Flask endpoint.

**PuzzleMaker** is an implementation of base React project which written with clean architecture and best practices.

## Screenshoots
![Screenshoot01](./src/images/screenshoot01.png)
![Screenshoot02](./src/images/screenshoot02.png)

## How to use
1. Install required dependencies run `npm install` and `pip install -r requirements.txt`
2. Run a backend execute following command from application root folder  
`python -m flask --app .\pythonServer\server.py run`

3. In the project directory run `npm start` to run the app.
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.  
The page will reload when you make changes.\
You may also see any lint errors in the console.

5. Enter all required parameters and press 'Create' button
6. Have fun

## Parameters


## Known issues
1. Scaling page after puzzle generation may lead to problems with puzzle piece snapping
