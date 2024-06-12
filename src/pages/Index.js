import { useState } from "react";
import Puzzle from "../components/Puzzle";
import UI from "../components/UI";

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
  const [seed, setSeed] =  useState(0);

  console.log('index', seed);
  return (
    <>
      <script src="svg.js"></script>
      <UI seed={seed} setSeed={setSeed}/>
      <Puzzle seed={seed} />
    </>
  );

 
}


