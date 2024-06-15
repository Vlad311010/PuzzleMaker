import Draggable from "react-draggable";
import { useRef } from "react";

function PuzzlePiece( {image, idx, position, onStart, onStop, onDrag} ) {
    const nodeRef = useRef(null);
    const grid = [1, 1];

    if (!image)
        return;

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
            <img id={idx} idx={idx} ref={nodeRef} src={'data:image/png;base64,'+image} draggable="false" className="Draggable">
            </img>    
        </Draggable>
    </>);
};


export default PuzzlePiece;