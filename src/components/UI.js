import { useRef } from "react";

export default function UI({size, setSeed, initialized, handleShowOriginal, handleFileChange, createCallback}) {
    const seedInput = useRef(null);
    const rowsInput = useRef(null);
    const columnsInput = useRef(null);
    const scaleInput = useRef(null);
    const imageInput = useRef(null);
    

    const numbersOnlyRegex = /^\d*\d+$/;
    const number01Regex = /^(0(\.\d+)?|1(\.0+)?)$/

    const resetBtn = initialized ? 
        <button onClick={handleReset} className="btn btn-outline-warning">Reset</button> 
        :
        <button onClick={handleReset} className="btn btn-outline-warning" disabled>Reset</button> 

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <span className="navbar-brand">PuzzleMaker1.0</span>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <span onClick={handleShowOriginal} className="nav-link me-2" style={{ width:'120px' }}>Show Original</span>
                        </li>
                        <form>
                            <li className="nav-item d-flex">
                                <span className="d-flex" style={{ width:'20%' }}>
                                    <input ref={seedInput} className="form-control-sm w-50 me-2"  placeholder="Seed" aria-label="Search"></input>
                                    {resetBtn}
                                </span>

                                <span className="d-flex" style={{ width:'25%' }}>
                                    <label htmlFor="sizeR" className="nav-link active">Puzzle Size:</label>
                                    <input id="sizeR" ref={rowsInput} className="form-control-sm w-25" placeholder={initialized ? size.rows : "R"} aria-label="SizeR"></input>
                                    <h4 type="text" className="text-white me-1">×</h4>
                                    <input ref={columnsInput} className="form-control-sm w-25" placeholder={initialized ? size.columns : "C"} aria-label="SizeC"></input>
                                </span>

                                <span className="d-flex" style={{ width:'15%' }}>
                                    <label htmlFor="Resize" className="nav-link active">Scale (optional):</label>
                                    <input ref={scaleInput} id="Resize" className="form-control-sm w-25 me-1" placeholder="0-1"></input>
                                </span>

                                <span className="d-flex" style={{ width:'40%' }}>
                                    <label htmlFor="formFile" className="nav-link active me-2">Image:</label>
                                    <input ref={imageInput} onChange={(e) => handleFileChange(e, e.target.files[0])} className="form-control h-100 me-2" type="file" id="formFile"></input>
                                    <button onClick={handleCreateCallback} className="btn btn-outline-success" >Create</button>
                                </span>

                            </li>
                        </form>
                    </ul>
                </div>
            </div>
        </nav>
    );

    
    

    function handleReset(e) {
        e.preventDefault();

        const inputSeed = seedInput.current.value.match(numbersOnlyRegex);
        if (!inputSeed)
            seedInput.current.value = 0;

        setSeed(parseInt(seedInput.current.value));
    }

    function handleCreateCallback(e) {
        e.preventDefault();

        const rows = rowsInput.current.value.match(numbersOnlyRegex);
        const columns = columnsInput.current.value.match(numbersOnlyRegex);
        scaleInput.current.value = scaleInput.current.value.replace(',', '.');
        const scale = scaleInput.current.value.match(number01Regex);

        createCallback(rows, columns, scale);
    }
}