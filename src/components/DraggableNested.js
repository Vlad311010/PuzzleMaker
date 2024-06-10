import { useEffect, useRef, useState } from "react";

export default function DraggableNested({ childComponent }) {
    const child = childComponent();
    const elementRef = useRef(null);
    let dragStart = useRef({x:0, y:0});
    let dragStartImgPos = useRef({x:0, y:0});

    return <span ref={elementRef}>{child}</span>;

    function handleDragStart(e) {
        e.preventDefault();

        dragStart = {x: e.clientX, y: e.clientY}
        dragStartImgPos = getPosition(elementRef.current);
        
        elementRef.current.addEventListener("mousemove", handleDrag);
    }

    function handleDrag(e) {
        e.preventDefault();

        const mousePos = {x: e.clientX,  y: e.clientY};
        const dragDelta = {x: mousePos.x - dragStart.x, y: mousePos.y - dragStart.y}
        
        moveElementAnchored(elementRef.current, dragStartImgPos, dragDelta);
    }

    
    function handleDragEnd(e) {
        e.preventDefault();

        elementRef.current.removeEventListener("mousemove", handleDrag);
    }

    function moveElementAnchored(element, anchor, delta) {
        const newPos = {x: anchor.x + delta.x, y: anchor.y + delta.y};
        element.style.transform = `translate(${newPos.x}px,${newPos.y}px)`;
    }

    function getPosition( element ) {
        var rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        };
    }
}