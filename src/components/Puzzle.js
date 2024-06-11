import puzzleDataJson from "../puzzlePieces/puzzleData.json"
import PuzzlePiece from "./PuzzlePiece"
import { useState, useRef, useEffect } from 'react'



function createDictionary() {
    const dictionary = new Object();
    let limiter = 500;
    for (let idx in puzzleDataJson.pieces) {
        if (limiter <= 0)
            break;

        dictionary[idx] = {x:0, y:0, clientPosX: 0, clientPosY: 0, diffX: 0, diffY: 0};
        limiter--;
    }
    return dictionary;
}

export default function Puzzle({}) {
    let currentTarget = useRef(null);
    let updated = useRef(false);
    let dragStart = useRef({x:0, y:0});
    
    const [ineractionEnabled, setInteraction] = useState(true);
    const [puzzleData, setPuzzleData] = useState(createDictionary());
    const [connectedPieces, setConectedPieces] = useState([]);
    
    const puzzleSize = puzzleDataJson.puzzleSize;
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
      
    // Use require.context to load all images in the directory
    const images = importAll(require.context('../puzzlePieces/', false, /\.(png|jpe?g|svg)$/));
      
    

    useEffect(() => {
        function setClientPos() {
            const copy = structuredClone(puzzleData);
            for (let idx in puzzleData) {
                const element = getPieceElementByIdx(idx);
                const clientPos = getElementPositionClient(element);
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
            }
        })

        
        setClientPos();
        
    }, []);

    const puzzlePieces = [];
    for (let k in puzzleData) {
        puzzlePieces.push(
            <PuzzlePiece key={k} idx={k} image={images[`${k}.png`]} position={puzzleData[k]} disabled={!ineractionEnabled}
            onStart={onStartHandler} onStop={onStopHandler} onDrag={dragHandler} />
        );
    }
    
    return (
        <div className="PuzzleWindow bg-dark bg-gradient border-gradient" >
            {puzzlePieces}
        </div>
    )

    function disableInteractions(time) {
        // rapid clicks on puzzle piece may cause element displacing // fixed
        setInteraction(false);
        setTimeout(function() {
            setInteraction(true);
        }, time);
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


    function onStartHandler(e, dragData) {
        currentTarget.current = e.target;
        dragStart.current = { x: dragData.x, y: dragData.y };

        if (!updated.current) {
            const copy = structuredClone(puzzleData);
            for (let idx in puzzleData) {
                const element = getPieceElementByIdx(idx);
                const clientPos = getElementPositionClient(element);
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

    function onStopHandler(e, dragData) {
        const idx = getPieceIndex(currentTarget.current);
        const connected = getConnectedPieces(idx, true);
        if (connected.length === 0) { //  moving handled by moveConnectedPieces when moving connected group.
            recordPieceElementPos(currentTarget.current, dragData);
        }
        // recordPieceElementPos(currentTarget.current, dragData);
        
        // normalize drag connected pieces position
        // const idx = getPieceIndex(currentTarget.current);
        // moveConnectedPieces(getConnectedPieces(idx), dragData.x - dragStart.current.x, dragData.y - dragStart.current.y);
        
        
        const piecesToConnect = detectJoint(getPieceIndex(currentTarget.current), getElementPositionClient(currentTarget.current));
        for (let i = 0; i < piecesToConnect.length; i++) {
            if (areInTheSameConnectedGroup(getPieceIndex(currentTarget.current), piecesToConnect[i]))
                continue;

            connectPieces(getPieceIndex(currentTarget.current), piecesToConnect[i], dragData)
            break;
        }

        
        currentTarget.current = null;
    }

    function dragHandler(e, dragData) {
        const {deltaX, deltaY} = dragData;
        
        const idx = getPieceIndex(currentTarget.current);
        const connected = getConnectedPieces(idx, false);
        moveConnectedPieces(connected, deltaX, deltaY);

        if (!debugHighlight)
            return;

        if (detectJoint(idx, getElementPositionClient(currentTarget.current)).length === 0) {
            currentTarget.current.classList.remove("PuzzlePieceBorderHighlight");
        }
        else {
            currentTarget.current.classList.add("PuzzlePieceBorderHighlight");
        }

    }

    function getPieceIndex(piece) {
        return piece.getAttribute("idx");
    }

    function getPieceElementByIdx(idx) {
        return document.getElementById(idx);
    }

    function setPiecePosition(pieceIdx, absolutePos) {
        const setPiecePositionHelper = (data) => {
            let copy = structuredClone(data);
            copy[pieceIdx] = { 
                ...copy[pieceIdx],
                x: absolutePos.x, 
                y: absolutePos.y, 
                clientPosX: absolutePos.x - copy[pieceIdx].diffX, 
                clientPosY: absolutePos.y - copy[pieceIdx].diffY
                };
            return copy;
        }
                
        setPuzzleData(d => setPiecePositionHelper(d));
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
        const clientPos = getElementPositionClient(pieceElement);
        const pieceIdx = getPieceIndex(pieceElement);
        
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

    function calculateDistance(p1, p2) {
        return Math.sqrt( (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y) );
    }


    function getElementPositionClient(element) {
        /*const bounds = element.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const offsetX  = bounds.x - bodyRect.x;
        const offsetY = bounds.top - bodyRect.top;
        
        // return {x: bounds.x, y: bounds.top};
        return {x: offsetX, y: offsetY };*/
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return {
            x: rect.left + scrollLeft,
            y: rect.top + scrollTop
        }
    }

    function calculateJointPosition(elementPos, pieceIdx, jointToPieceIdx) {
        const jointsData = getJoinstData(pieceIdx);
        const jointPosition = { 'x': elementPos.x + jointsData[jointToPieceIdx].x, 'y': elementPos.y + jointsData[jointToPieceIdx].y };
        return jointPosition;
    }

    function getJointPosition(pieceIdx, jointToPieceIdx) {
        const { clientPosX, clientPosY } = puzzleData[pieceIdx]; // clientPosX, clientPosY from previous render (not synchronized)
        return calculateJointPosition({ x:clientPosX, y:clientPosY }, pieceIdx, jointToPieceIdx);
    }

    function getJointPositionSync(actualPos, pieceIdx, jointToPieceIdx) {
        return calculateJointPosition(actualPos, pieceIdx, jointToPieceIdx);
    }
    
    function detectJoint(pieceIdx, positionClient) {
        let possibleConnections = getJoinstData(pieceIdx)
        
        let connectTo = [];
        
        for (let key in possibleConnections) {
            if (! (puzzleData[key] ?? null)) {
                continue;
                }
                
            const { clientPosX, clientPosY } = puzzleData[key];
                
            const jointPositionMovedPiece = getJointPositionSync(positionClient, pieceIdx, key);
            const jointPositionOther = getJointPosition(key, pieceIdx);

            let distance = calculateDistance(jointPositionMovedPiece, jointPositionOther); 
            // console.log(pieceIdx, '->', key, distance, jointPositionMovedPiece, jointPositionOther);
            
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
            newConnectedPieces.push(merge(connected1, connected2));
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
            -Math.sign(jointOffsetX) * (puzzleDataJson.pieceSize.x)
        const offsetY = 
            -Math.sign(jointOffsetY) * (puzzleDataJson.pieceSize.y)
        
        /*
        console.log("dragged Diff", puzzleData[dragged].diffX, puzzleData[dragged].diffY);
        console.log("linetCPos", clientPosX, clientPosY);
        console.log("snapToPos", draggedToPosition.x, draggedToPosition.y);
        console.log("offset", offsetX, offsetY);
        */
        
        /*setPiecePosition(dragged, { 
            x: draggedToPosition.x + offsetX,
            y: draggedToPosition.y + offsetY
        });*/
        /*setPiecePosition(dragged, { 
            x: 0 + puzzleData[dragged].diffX,
            y: 0 + puzzleData[dragged].diffY
        });*/

        setPiecePositionAbsolute(dragged, { 
            x: draggedToPosition.x + offsetX,
            y: draggedToPosition.y + offsetY
        });

        // console.log(dragData.x);
        const deltaX = (dragData.x - puzzleData[dragged].diffX) - (draggedToPosition.x + offsetX);
        const deltaY = (dragData.y - puzzleData[dragged].diffY)- (draggedToPosition.y + offsetY);
        
        moveConnectedPieces(getConnectedPieces(dragged), -deltaX, -deltaY);
        
    }

    function disconnectAllPieces() {
        setConectedPieces([]);
    }

    function getJoinstData(pieceIdx) {
        return puzzleDataJson.pieces[pieceIdx]['joints'];
    }

    function merge(xs, ys) {
        const predicate = (a, b) => a === b;
        const c = [...xs]; 
        
        ys.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
        return c;
    }

    



}