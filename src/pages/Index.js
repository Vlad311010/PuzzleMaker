import { useState, useEffect } from "react";
import Puzzle from "../components/Puzzle";
import UI from "../components/UI";
import ApiRequest from "../scrips/apiRequests";
import PuzzleMock from "../components/PuzzleMock";

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
  const [puzzleSize, setPuzzleSize] = useState({rows: 10, columns: 10});
  const [initialized, setInitialized] = useState(false)

  /*useEffect(() => {

    async function apiCall() {
      const apiResponse = await ApiRequest.createPuzzle(puzzleSize);
      console.log(apiResponse);
    }
    apiCall();

  }, []);
  */

  
  const showPuzzle = initialized ? <Puzzle seed={seed} /> : <PuzzleMock />
  
  return (
    <>
      <UI seed={seed} setSeed={setSeed} size={puzzleSize} initialized={initialized} onStart={hanldeStart}/>
      {showPuzzle}
      
    </>
  );

  async function hanldeStart(size) {
    const responce = await apiCall(size);
    if (Object.keys(responce).length === 0 || responce.code < 200 || responce.code >= 300) {
      setInitialized(false);
      return;
    }
      
    setPuzzleSize(size);
    setInitialized(true);
  }

  async function apiCall(size) {
    const apiResponse = await ApiRequest.createPuzzle(size);
    console.log(apiResponse);
    return apiResponse;
  }

 
}


