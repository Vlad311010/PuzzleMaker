import { useState, useEffect } from "react";
import Puzzle from "../components/Puzzle";
import UI from "../components/UI";
import ApiRequest from "../scrips/apiRequests";

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

  useEffect(() => {

    async function apiCall() {
      const apiResponse = await ApiRequest.createPuzzle();
      console.log(apiResponse);
    }
    apiCall();

    document.addEventListener("keydown", (event) => {
        if (event.key === 'a') {
            event.preventDefault();
            // ApiRequest.createPuzzle();
        }
    })

    apiCall();

  }, []);

  
  
  return (
    <>
      <UI seed={seed} setSeed={setSeed}/>
      <Puzzle seed={seed} />
    </>
  );

 
}


