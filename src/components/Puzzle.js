import puzzleDataJson from "../puzzlePieces/puzzleData.json"
import PuzzlePiece from "./PuzzlePiece"
import { useState, useRef, useEffect } from 'react'
import * as utils from '../scrips/puzzleUtils'; 
import PRNG from "../scrips/prng";


function createDictionary(rng) {
    const dictionary = new Object();
    let limiter = 500;
    const pieces = Object.keys(puzzleDataJson.pieces);
    utils.shuffleArray(pieces, rng);
    for (let i = 0; i < pieces.length; i++) {
        const idx = pieces[i];
        if (limiter <= 0)
            break;

        dictionary[idx] = {x: 0, y:0, clientPosX: 0, clientPosY: 0, diffX: 0, diffY: 0};
        limiter--;
    }
    return dictionary;
}


export default function Puzzle({seed}) {
    const currentTarget = useRef(null);
    const updated = useRef(false);
    const dragStart = useRef({x:0, y:0});
    let rng = new PRNG(seed);
    
    const [puzzleData, setPuzzleData] = useState(createDictionary(rng));
    const [connectedPieces, setConectedPieces] = useState([]);

    
    const pieceSize = puzzleDataJson.pieceSize;
    const margin = puzzleDataJson.margin;
    const jointDetectionRadius = margin / 2;
    
    const debugHighlight = true;

    // console.log(puzzleDataJson);
    // console.log(puzzleData)
    // console.log(connectedPieces);

    const importAll = (requireContext) => {
        let images = {};
        requireContext.keys().forEach((key) => {
          images[key.replace('./', '')] = requireContext(key);
        });
        return images;
      };
      
    const images = importAll(require.context('../puzzlePieces/', false, /\.(png|jpe?g|svg)$/));

    useEffect(() => {
        function setClientPos() {
            const copy = structuredClone(puzzleData);
            for (let idx in puzzleData) {
                const element = utils.getPieceElementByIdx(idx);
                const clientPos = utils.getElementPositionClient(element);
                copy[idx] = {
                    ...copy[idx],
                    clientPosX: clientPos.x,
                    clientPosY: clientPos.y,
                    diffX: -clientPos.x,
                    diffY: -clientPos.y
                };
            }
            setPuzzleData(copy);
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === 'f') {
                event.preventDefault();
                disconnectAllPieces();
                // restartPuzzle(seed);
            }
        })

        restartPuzzle(seed);
        // setClientPos();
        
    }, [seed]);

    const puzzlePieces = [];
    for (let k in puzzleData) {
        puzzlePieces.push(
            <PuzzlePiece key={k} idx={k} image={images[`${k}.png`]} position={puzzleData[k]} 
            onStart={onStartHandler} onStop={onStopHandler} onDrag={dragHandler} />
        );
    }
    
    
    return (
        <div className="PuzzleWindow bg-dark bg-gradient border-gradient" >
            {puzzlePieces}
        </div>
    )

    function onStartHandler(e, dragData) {
        if (!e.target)
            return;

        currentTarget.current = e.target;
        dragStart.current = { x: dragData.x, y: dragData.y };

        if (!updated.current) {
            const copy = structuredClone(puzzleData);
            for (let idx in puzzleData) {
                const element = utils.getPieceElementByIdx(idx);
                const clientPos = utils.getElementPositionClient(element);
                copy[idx] = {
                    ...copy[idx],
                    clientPosX: clientPos.x,
                    clientPosY: clientPos.y,
                    diffX: -clientPos.x,
                    diffY: -clientPos.y
                };
            }
            setPuzzleData(copy);
        }
        updated.current = true;
    }

    function dragHandler(e, dragData) {
        if (!currentTarget.current)
            return;

        const {deltaX, deltaY} = dragData;
        
        const idx = utils.getPieceIndex(currentTarget.current);
        const connected = getConnectedPieces(idx, false);
        moveConnectedPieces(connected, deltaX, deltaY);

        if (!debugHighlight)
            return;

        const newJoints = detectJoint(idx, utils.getElementPositionClient(currentTarget.current))
            .filter(element => !getConnectedPieces(idx).includes(element));

        if (newJoints.length === 0) {
            currentTarget.current.classList.remove("PuzzlePieceBorderHighlight");
        }
        else {
            currentTarget.current.classList.add("PuzzlePieceBorderHighlight");
        }

    }

    function onStopHandler(e, dragData) {
        if (!currentTarget.current)
            return;
        
        const idx = utils.getPieceIndex(currentTarget.current);
        const connected = getConnectedPieces(idx, true);
        if (connected.length === 0) { //  moving handled by moveConnectedPieces when moving connected group.
            recordPieceElementPos(currentTarget.current, dragData);
        }
        
        const piecesToConnect = detectJoint(
            utils.getPieceIndex(currentTarget.current), 
            utils.getElementPositionClient(currentTarget.current)
        );

        for (let i = 0; i < piecesToConnect.length; i++) {
            if (areInTheSameConnectedGroup(utils.getPieceIndex(currentTarget.current), piecesToConnect[i]))
                continue;

            connectPieces(utils.getPieceIndex(currentTarget.current), piecesToConnect[i], dragData)
            break;
        }

        
        currentTarget.current = null;
    }

    function getConnectedPieces(originalPieceIdx, excludeSelf = true) {
        for (let i = 0; i < connectedPieces.length; i++) {
            if (connectedPieces[i].includes(originalPieceIdx))
                return excludeSelf ? connectedPieces[i].filter(idx => idx != originalPieceIdx) : connectedPieces[i];
        }
        return []
    }

    function getConnectedPiecesGroupIdx(groupMember) {
        for (let i = 0; i < connectedPieces.length; i++) {
            if (connectedPieces[i].includes(groupMember))
                return i;
        }
        return -1;
    }

    function areInTheSameConnectedGroup(pieceIdx1, pieceIdx2) {
        return getConnectedPiecesGroupIdx(pieceIdx1) != -1 && 
        getConnectedPiecesGroupIdx(pieceIdx1) === getConnectedPiecesGroupIdx(pieceIdx2);
    }


    function moveConnectedPieces(connected, deltaX, deltaY) {
        const moveConnectedPiecesHelper = (data) => {
            const copy = structuredClone(data);
            for (let i = 0; i < connected.length; i++) {
                copy[connected[i]] = {
                    ...copy[connected[i]],
                    x: copy[connected[i]].x + deltaX, 
                    y: copy[connected[i]].y + deltaY,
                    clientPosX: copy[connected[i]].clientPosX + deltaX,
                    clientPosY: copy[connected[i]].clientPosY + deltaY
                }
            }
            return copy;
        }
            
        if (!connected) 
            return;
        setPuzzleData(d => moveConnectedPiecesHelper(d));
    }


    function setPiecePositionAbsolute(pieceIdx, absolutePos) {
        const setPiecePositionHelper = (data) => {
            let copy = structuredClone(data);
            copy[pieceIdx] = { 
                ...copy[pieceIdx],
                x: absolutePos.x + copy[pieceIdx].diffX, 
                y: absolutePos.y + copy[pieceIdx].diffY,
                clientPosX: absolutePos.x, 
                clientPosY: absolutePos.y
                };
            return copy;
        }
                
        setPuzzleData(d => setPiecePositionHelper(d));
    }


    function recordPieceElementPos(pieceElement, dragData) {
        const {x, y} = dragData;
        const clientPos = utils.getElementPositionClient(pieceElement);
        const pieceIdx = utils.getPieceIndex(pieceElement);
        
        const recordPieceElementPosHelper = (data) => {
            const copy = structuredClone(data);
            copy[pieceIdx] = { 
                ...copy[pieceIdx],
                x: x,
                y: y,
                clientPosX: clientPos.x, 
                clientPosY: clientPos.y 
            };
            
            return copy;
        }
        setPuzzleData(d => recordPieceElementPosHelper(d));
    }


    function getJointPosition(pieceIdx, jointToPieceIdx) {
        const { clientPosX, clientPosY } = puzzleData[pieceIdx]; // clientPosX, clientPosY from previous render (not synchronized)
        return utils.calculateJointPosition(puzzleDataJson, { x:clientPosX, y:clientPosY }, pieceIdx, jointToPieceIdx);
    }

    function getJointPositionSync(actualPos, pieceIdx, jointToPieceIdx) {
        return utils.calculateJointPosition(puzzleDataJson, actualPos, pieceIdx, jointToPieceIdx);
    }
    
    function detectJoint(pieceIdx, positionClient) {
        let possibleConnections = utils.getJoinstData(puzzleDataJson, pieceIdx)
        let connectTo = [];
        
        for (let key in possibleConnections) {
            if (! (puzzleData[key] ?? null)) {
                continue;
            }
                
            const jointPositionMovedPiece = getJointPositionSync(positionClient, pieceIdx, key);
            const jointPositionOther = getJointPosition(key, pieceIdx);

            let distance = utils.calculateDistance(jointPositionMovedPiece, jointPositionOther); 
            
            if (distance < jointDetectionRadius) {
                connectTo.push(key);
            }
        }
        return connectTo;
    }

    function connectPieces(pieceIdx1, pieceIdx2, dragData) {
        let newConnectedPieces = structuredClone(connectedPieces);
        
        const connected1 = getConnectedPieces(pieceIdx1, false);
        const connected2 = getConnectedPieces(pieceIdx2, false);
        if (connected1.length > 0 && connected2.length > 0) {
            newConnectedPieces = newConnectedPieces.filter(e => !e.includes(pieceIdx1));
            newConnectedPieces = newConnectedPieces.filter(e => !e.includes(pieceIdx2));
            
            // newConnectedPieces.push(merge(connected1.flat(), connected2.flat()));
            newConnectedPieces.push(utils.merge(connected1, connected2));
        }
        else if (connected1.length > 0) {
            const idx = getConnectedPiecesGroupIdx(pieceIdx1);
            newConnectedPieces[idx].push(pieceIdx2);
        }
        else if (connected2.length > 0) {
            const idx = getConnectedPiecesGroupIdx(pieceIdx2);
            newConnectedPieces[idx].push(pieceIdx1);
        }
        else {
            newConnectedPieces.push([pieceIdx1, pieceIdx2]);
        }
        snapPieceTo(pieceIdx1, pieceIdx2, dragData);
        setConectedPieces(newConnectedPieces);
    }

    function snapPieceTo(dragged, draggedTo, dragData) {
        const { clientPosX, clientPosY } = puzzleData[draggedTo];
        const draggedToPosition = { x: clientPosX, y: clientPosY };
        const jointOffsetX = puzzleDataJson.pieces[dragged].joints[draggedTo].x;
        const jointOffsetY = puzzleDataJson.pieces[dragged].joints[draggedTo].y;
        
        const offsetX =
            -Math.sign(jointOffsetX) * (pieceSize.x)
        const offsetY = 
            -Math.sign(jointOffsetY) * (puzzleDataJson.pieceSize.y)
        

        setPiecePositionAbsolute(dragged, { 
            x: draggedToPosition.x + offsetX,
            y: draggedToPosition.y + offsetY
        });

        const deltaX = (dragData.x - puzzleData[dragged].diffX) - (draggedToPosition.x + offsetX);
        const deltaY = (dragData.y - puzzleData[dragged].diffY)- (draggedToPosition.y + offsetY);
        moveConnectedPieces(getConnectedPieces(dragged), -deltaX, -deltaY);
        
    }

    function disconnectAllPieces() {
        setConectedPieces([]);
    }

    function restartPuzzle(randomSeed) {
        randomSeed = randomSeed;
        disconnectAllPieces();
        rng = new PRNG(randomSeed);
        setPuzzleData(createDictionary(rng));
        updated.current = false;
    }

}