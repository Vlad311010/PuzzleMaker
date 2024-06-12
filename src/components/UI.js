import { useRef } from "react";

export default function UI({seed, setSeed}) {
    const seedInput = useRef(null);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <span className="navbar-brand">PuzzleMaker1.0</span>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <span className="nav-link me-2" >Show Original</span>
                        </li>
                        <li className="nav-item">
                            <form className="d-flex">
                                <input ref={seedInput} className="form-control me-2"  placeholder="Seed" aria-label="Search"></input>
                                <button onClick={handleStart}  className="btn btn-outline-success">Start</button>
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );


    function handleStart(e) {
        e.preventDefault();

        const inputSeed = seedInput.current.value.match(/^\d*\d+$/);
        if (!inputSeed)
            seedInput.current.value = 0;

        setSeed(parseInt(seedInput.current.value));
    }
}