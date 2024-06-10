import { useEffect, useRef, useState } from "react";

export default function DraggableM({  target }) {
    const domElement = useRef(null);
    let dragStart = {x:0, y:0};
    let dragStartImgPos = {x:0, y:0};

    
    useEffect(() => {
        target.current.addEventListener("mousedown", handleDragStart);
        target.current.addEventListener("mouseup", handleDragEnd);

        return () => {
            target.current.removeEventListener("mousedown", handleDragStart);
            target.current.removeEventListener("mouseup", handleDragEnd);
        }
        
    }, [])
    

    function handleDragStart(e) {
        e.preventDefault();

        dragStart = {x: e.clientX, y: e.clientY}
        dragStartImgPos = getPosition(target.current);
        target.current.addEventListener("mousemove", handleDrag);
    }

    function handleDrag(e) {
        e.preventDefault();

        const mousePos = {x: e.clientX,  y: e.clientY};
        const dragDelta = {x: mousePos.x - dragStart.x, y: mousePos.y - dragStart.y}
        
        moveElementAnchored(target.current, dragStartImgPos, dragDelta);
    }

    
    function handleDragEnd(e) {
        e.preventDefault();

        target.current.removeEventListener("mousemove", handleDrag);
    }

    function moveElementAnchored(element, anchor, delta) {
        // const elementPos = getPosition(element);
        // const offset = {x: elementPos.x + delta.x, y: elementPos.y + delta.y};
        const newPos = {x: anchor.x + delta.x, y: anchor.y + delta.y};
        element.style.transform = `translate(${newPos.x}px,${newPos.y}px)`;
        // setPos({x: newPos.x, y: newPos.y});
    }

    function getPosition( element ) {
        var rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        };
    }
}