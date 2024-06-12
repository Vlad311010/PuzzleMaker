import { useRef } from "react";

export default function UI({seed, setSeed, size, initialized, onStart}) {
    const seedInput = useRef(null);
    const rowsInput = useRef(null);
    const columnsInput = useRef(null);

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
                            <span className="nav-link me-2">Show Original</span>
                        </li>
                        <li className="nav-item">
                            <form className="d-flex">
                                    <input ref={seedInput} className="form-control w-25 me-2"  placeholder="Seed" aria-label="Search"></input>
                                    {resetBtn}
                                    <span className="nav-link active">Size:</span>
                                    <span className="d-flex w-25">
                                        <input ref={rowsInput} className="form-control w-25" placeholder={initialized ? size.rows : "R"} aria-label="SizeR"></input>
                                        <h4 type="text" className="text-white">×</h4>
                                        <input ref={columnsInput} className="form-control w-25"  placeholder={initialized ? size.columns : "C"} aria-label="SizeC"></input>
                                    </span>
                                    <button onClick={handleStart} className="btn btn-outline-success" >Create</button>
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );


    function handleReset(e) {
        e.preventDefault();

        const inputSeed = seedInput.current.value.match(/^\d*\d+$/);
        if (!inputSeed)
            seedInput.current.value = 0;

        setSeed(parseInt(seedInput.current.value));
    }

    function handleStart(e) {
        e.preventDefault();

        const rows = rowsInput.current.value.match(/^\d*\d+$/);
        const columns = columnsInput.current.value.match(/^\d*\d+$/);

        if (rows && columns) {
            let rows =  parseInt(rowsInput.current.value)
            let columns = parseInt(columnsInput.current.value)
            if (rows < 2)
                rows = 2
            if (columns < 2)
                columns = 2

            onStart({rows: rows, columns: columns});
        }
    }
}