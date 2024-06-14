import { useState, useRef } from "react";
import Puzzle from "../components/Puzzle";
import UI from "../components/UI";
import ApiRequest from "../scrips/apiRequests";
import PuzzleMock from "../components/PuzzleMock";
import ImagePreview from "../components/ImagePreview";

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
  const [showOriginal, setShowOriginal] = useState(false)
  
  const selectedImage = useRef(null);

  const showPuzzle = initialized ? <Puzzle seed={seed} /> : <PuzzleMock />
  const showOriginalImage = showOriginal ? <ImagePreview image={selectedImage.current} /> : <></>
  
  return (
    <>
      <UI setSeed={setSeed} size={puzzleSize} initialized={initialized} handleShowOriginal={handleShowOriginal} handleFileChange={onImageSelect} createCallback={handleCreate}/>
      {showOriginalImage}
      {showPuzzle}
    </>
  );

  
  function handleShowOriginal(e) {
    e.preventDefault();
    
    if (selectedImage.current)
      setShowOriginal(v => !v);
  }
  
  function onImageSelect(e, image) {
    e.preventDefault()
    selectedImage.current = image;
  }

  function handleCreate(rowsMatch, columnsMatch, scaleMatch) {
    if (selectedImage.current == null) {
      return;
    }

    if (rowsMatch && columnsMatch) {
      const formData = new Object();
      formData['rows'] = parseInt(rowsMatch[0]);
      formData['columns'] = parseInt(columnsMatch[0]);
      formData['image'] = selectedImage.current;
      formData['scale'] = scaleMatch ? parseFloat(scaleMatch[0]) : 1;
      generatePuzzle(formData);
    }
  }

  async function generatePuzzle(formData) {
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


