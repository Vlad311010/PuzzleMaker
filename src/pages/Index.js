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
      <UI setSeed={setSeed} size={puzzleSize} initialized={initialized} onStart={hanldeStart}/>
      {showPuzzle}
      
    </>
  );

  async function hanldeStart(formData) {
    const responce = await apiCall(formData);
    if (Object.keys(responce).length === 0 || responce.code < 200 || responce.code >= 300) {
      setInitialized(false);
      return;
    }
      
    setPuzzleSize({rows: formData.rows, columns: formData.columns});
    setInitialized(true);
  }

  async function apiCall(formData) {
    const apiResponse = await ApiRequest.createPuzzle(formData);
    return apiResponse;
  }

 
}


