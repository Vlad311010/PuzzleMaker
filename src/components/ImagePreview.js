import Draggable from "react-draggable";

export default function ImagePreview({image}) {
    if (!image)
        return;

    const srcImage = URL.createObjectURL(image);
    return (
        <Draggable
            axis="both"
            grid={[5, 5]}
            scale={1}>
                <img draggable="false" className="ImagePreview Draggable" src={srcImage} ></img>
        </Draggable>
    ) 
}