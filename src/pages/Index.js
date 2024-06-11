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
  return (
    <>
      <UI />
      <Puzzle />
    </>
  );

 
}


