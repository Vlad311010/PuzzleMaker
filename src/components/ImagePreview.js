
export default function ImagePreview({image}) {
    const srcImage = URL.createObjectURL(image);

    return (<>
        <img className="ImagePreview" src={srcImage}></img>
        </>) 
}