import Draggable from "react-draggable";
import { useRef } from "react";

function PuzzlePiece( {image, idx, position, onStart, onStop, onDrag} ) {
    const nodeRef = useRef(null);
    const grid = [1, 1];
    

    return (<>
        <Draggable
        axis="both"
        bounds="parent"
        nodeRef={nodeRef}
        position={position}
        grid={grid}
        onStart={onStart}
        onStop={onStop}
        onDrag={onDrag}
        scale={1}>
            <img id={idx} idx={idx} ref={nodeRef} src={image} draggable="false" className="Focused Draggable">
            </img>    
        </Draggable>
    </>);
};


export default PuzzlePiece;