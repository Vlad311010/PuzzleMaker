import { useState } from "react";
import Puzzle from "../components/Puzzle";
import UI from "../components/UI";
import ApiRequest from "../scrips/apiRequests";
import PuzzleMock from "../components/PuzzleMock";
import ImagePreview from "../components/ImagePreview";


export default function Index() {
  const [seed, setSeed] = useState(0);
  const [puzzleSize, setPuzzleSize] = useState({rows: 10, columns: 10});
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pieces, setPieces] = useState({});
  const [processingRequest, setProcessingRequest] = useState(false);

  const valid = pieces && Object.keys(pieces).length > 0; 
  const showPuzzle = valid ? <Puzzle seed={seed} pieces={pieces} /> : <PuzzleMock />
  const showOriginalImage = showOriginal ? <ImagePreview image={selectedImage} /> : <></>

  return (
    <>
      <UI setSeed={setSeed} size={puzzleSize} initialized={valid} canInitiateRequest={!processingRequest} handleShowOriginal={handleShowOriginal} handleFileChange={onImageSelect} createCallback={handleCreate}/>
      {showOriginalImage}
      {showPuzzle}
    </>
  );

  
  function handleShowOriginal(e) {
    e.preventDefault();
    
    if (selectedImage)
      setShowOriginal(v => !v);
  }
  
  function onImageSelect(e, image) {
    e.preventDefault();
    setSelectedImage(image);
  }

  async function handleCreate(rowsMatch, columnsMatch, scaleMatch) {
    if (selectedImage == null) {
      return;
    }

    if (rowsMatch && columnsMatch) {
      const formData = new Object();
      const rows = parseInt(rowsMatch[0]);
      const columns = parseInt(columnsMatch[0]);
      formData['rows'] = rows <= 1 ? 2 : rows;
      formData['columns'] = columns <= 1 ? 2 : columns; 
      formData['image'] = selectedImage;
      formData['scale'] = scaleMatch ? parseFloat(scaleMatch[0]) : 1;
      const responce = await generatePuzzle(formData);
      
      setProcessingRequest(false);
      setPieces(responce.files);
    }
  }

  async function generatePuzzle(formData) {
    const responce = await apiCall(formData);
    if (Object.keys(responce).length === 0 || responce.code < 200 || responce.code >= 300) {
      return [];
    }
     
    
    setPuzzleSize({rows: formData.rows, columns: formData.columns});
    return responce;
  }

  async function apiCall(formData) {
    setProcessingRequest(true);
    const apiResponse = await ApiRequest.createPuzzle(formData);
    return apiResponse;
  }

 
}


