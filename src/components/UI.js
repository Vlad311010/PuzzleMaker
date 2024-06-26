import { useRef } from "react";

export default function UI({size, setSeed, initialized, canInitiateRequest, handleShowOriginal, handleFileChange, createCallback}) {
    const seedInput = useRef(null);
    const rowsInput = useRef(null);
    const columnsInput = useRef(null);
    const scaleInput = useRef(null);
    const imageInput = useRef(null);
    

    const numbersOnlyRegex = /^\d*\d+$/;
    const number01Regex = /^(0(\.\d+)?|1(\.0+)?)$/


    const showOriginalBtn = imageInput.current?.files[0] ?
        <button onClick={handleShowOriginal} className="btn btn-outline-secondary btn me-2" style={{ width:'130px' }}>Show Original</button> 
        :
        <button onClick={handleShowOriginal} className="btn btn-outline-secondary btn me-2" style={{ width:'130px' }} disabled>Show Original</button> 

    const resetBtn = initialized ? 
        <button onClick={handleReset} autoComplete="off" className="btn btn-outline-warning">Reset</button> 
        :
        <button onClick={handleReset} autoComplete="off" className="btn btn-outline-warning" disabled>Reset</button> 

        
    const createBtn = canInitiateRequest ? 
        <button onClick={async (e) => handleCreateCallback(e)} className="btn btn-outline-success" style={{ width:'37%' }} >Create</button>
        :
        <button onClick={async (e) => handleCreateCallback(e)} className="btn btn-outline-success" style={{ width:'37%' }} disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="sr-only"> Create</span>
        </button>

    

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ width:'100%' }}>
            <div className="container-fluid">
                <span className="navbar-brand">PuzzleMaker1.0</span>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            {showOriginalBtn}
                        </li>
                        <form>
                            <li className="nav-item d-flex">
                                <span className="d-flex" style={{ width:'15%' }}>
                                    <input ref={seedInput} autoComplete="off" className="form-control-sm w-50 me-2"  placeholder="Seed" aria-label="Search"></input>
                                    {resetBtn}
                                </span>

                                <span className="d-flex" style={{ width:'25%' }}>
                                    <label htmlFor="sizeR" className="nav-link active">Puzzle Size:</label>
                                    <input id="sizeR" autoComplete="off" ref={rowsInput} className="form-control-sm w-25" placeholder={initialized ? size.rows : "R"} aria-label="SizeR"></input>
                                    <h4 type="text" className="text-white me-1">×</h4>
                                    <input ref={columnsInput} autoComplete="off" className="form-control-sm w-25" placeholder={initialized ? size.columns : "C"} aria-label="SizeC"></input>
                                </span>

                                <span className="d-flex" style={{ width:'20%' }}>
                                    <label htmlFor="Resize" className="nav-link active">Scale (optional):</label>
                                    <input ref={scaleInput} autoComplete="off" id="Resize" className="form-control-sm w-25 me-1" placeholder="0-1"></input>
                                </span>

                                <span className="d-flex" style={{ width:'35%' }}>
                                    <label htmlFor="formFile" className="nav-link active me-2">Image:</label>
                                    <input ref={imageInput} onChange={(e) => handleFileChange(e, e.target.files[0])} className="form-control h-100 me-2" type="file" id="formFile"></input>
                                    {createBtn}
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

    async function handleCreateCallback(e) {
        e.preventDefault();

        const rows = rowsInput.current.value.match(numbersOnlyRegex);
        const columns = columnsInput.current.value.match(numbersOnlyRegex);
        scaleInput.current.value = scaleInput.current.value.replace(',', '.');
        const scale = scaleInput.current.value.match(number01Regex);

        await createCallback(rows, columns, scale);
    }
}