


import Draggable, {DraggableCore} from 'react-draggable';
import { useEffect, useRef, useState } from 'react';
import PuzzlePiece from "../components/PuzzlePiece";
import Puzzle from "../components/Puzzle";

async function getMeta(url) {
  const img = new Image();
  img.src = url;
  await img.decode();  
  return img
};

async function getNaturalSize(url) {
  const img = await getMeta(url);
  return { width: img.naturalWidth, height: img.naturalHeight };
}



export default function Index() {
  const imgRef = useRef(null);
  const puzzlePiece = useRef(null);
  const puzzlePiece0 = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const grid = [5, 1];
  let connected = []

  /*useEffect(() => {
    async function getImageSize() {
      setImgSize(await getNaturalSize(puzzle00));
    }

    getImageSize();
  }, []);*/

  return (
    <>
      <Puzzle />
    </>
  );

 
}


