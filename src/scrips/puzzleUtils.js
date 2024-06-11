
export function calculateDistance(p1, p2) {
    return Math.sqrt( (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y) );
}

export function merge(xs, ys) {
    const predicate = (a, b) => a === b;
    const c = [...xs]; 
    
    ys.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c;
}



export function getPieceIndex(piece) {
    return piece.getAttribute("idx");
}

export function getPieceElementByIdx(idx) {
    return document.getElementById(idx);
}


export function getElementPositionClient(element) {
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
        x: rect.left + scrollLeft,
        y: rect.top + scrollTop
    }
}

export function getJoinstData(dataSource, pieceIdx) {
    return dataSource.pieces[pieceIdx]['joints'];
}

export function calculateJointPosition(dataSource, elementPos, pieceIdx, jointToPieceIdx) {
    const jointsData = getJoinstData(dataSource, pieceIdx);
    const jointPosition = { 'x': elementPos.x + jointsData[jointToPieceIdx].x, 'y': elementPos.y + jointsData[jointToPieceIdx].y };
    return jointPosition;
}

