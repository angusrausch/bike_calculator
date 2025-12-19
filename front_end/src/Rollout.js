import { useEffect, useState } from "react";

const Rollout = () => {
    const [tyreSelection, setTyreSelection] = useState("0");
    const [chainringSelection, setChainringSelection] = useState("0");
    const [manualChainring, setManualChainring] = useState("");
    const [cassetteSelection, setCassetteSelection] = useState("0");
    const [manualCassette, setManualCassette] = useState("");
    const [error, setError] = useState("");
    const [cassetteOptions, setCassetteOptions] = useState([]);
    const [chainringOptions, setChainringOptions] = useState([]);
    const [tyreOptions, setTyreOptions] = useState([]);
    const [sprockets, setSprockets] = useState([]);
    const [chainrings, setChainrings] = useState([]);
    const [results, setResults] = useState([]);
    const unitOptions = {
        METRIC: 'Meters',
        IMPERIAL: 'Inches'
    };
    const [units, setUnits] = useState(unitOptions.METRIC);
    const [unitsCalculator, setUnitsCalculator] = useState(1);
    const [rollout, setRollout] = useState("7");

    const handleSubmit = async () => {
        setError("");

        const params = new URLSearchParams();

        if (tyreSelection !== "0") {
            params.append("tyre_id", tyreSelection);
        } else {
            setError("No Tyre Selected");
            return;
        }

        if (chainringSelection !== "0") {
            params.append("crankset_id", chainringSelection);
        } else if (manualChainring.trim() !== "") {
            let chainring = manualChainring.trim();
            if (checkValid(chainring)) {
                params.append("manual_chainring", chainring);
            } else {
                setError("Invalid Manual Chainring");
            return;
            }
        } else {
            setError("No Chainring Selected");
            return;
        }

        if (cassetteSelection !== "0") {
            params.append("cassette_id", cassetteSelection);
        } else if (manualCassette.trim() !== "") {
            let cassette = manualCassette.trim();
            if (checkValid(cassette)) {
                params.append("manual_cassette", cassette);
            } else {
                setError("Invalid Manual Cassette");
            return;
            }
        } else {
            setError("No Cassette Selected");
            return;
        }

        const argList = params.toString();
        await loadCalculations(argList);
    };

    const loadCalculations = async (argList) => {
        try {
            const params = new URLSearchParams(argList).toString();
            const response = await fetch(
                `http://localhost:8080/calculate/rollout?${params}`
            );

            const calculations = await response.json();

            if (calculations && calculations.results && calculations.results.length > 0) {
                setSprockets(calculations.sprockets);
                setChainrings(calculations.chainrings);
                setResults(calculations.results);
            } else {
                throw new Error("No data found in searchData");
            }
        } catch (error) {
            console.error("Failed to fetch calculations:", error);
            throw error;
        }
    }

    const checkValid = (input) => {
        if (/^[0-9,]*$/.test(input)) return true;
        return false;
    }

    const changeUnits = () => {
        if (units === unitOptions.METRIC ) {
            setUnits(unitOptions.IMPERIAL);
            setUnitsCalculator(39.3701);
        } else {
            setUnits(unitOptions.METRIC)
            setUnitsCalculator(1);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cassetteRes, chainringRes, tyresRes] = await Promise.all([
                    fetch("http://localhost:8080/cassettes"),
                    fetch("http://localhost:8080/cranksets"),
                    fetch("http://localhost:8080/tyres"),
                ]);

                const [cassetteData, chainringData, tyreData] = await Promise.all([
                    cassetteRes.json(),
                    chainringRes.json(),
                    tyresRes.json()
                ]);

                if (!Array.isArray(cassetteData) || !Array.isArray(chainringData) || !Array.isArray(tyreData)) {
                    throw new Error("Invalid API response");
                }

                setCassetteOptions(cassetteData);
                setChainringOptions(chainringData);
                setTyreOptions(tyreData);
            } catch (err) {
                console.error(err);
                setError("Failed to load bike components");
            }
        };

        loadData();
    }, []);


    return (
        <div>
            <h1 className="mb-12 !text-[60px] font-medium p-4 text-black text-center">
                Rollout
            </h1>

            <div className="bg-black bg-cover h-screen">
                <div className="text-white px-6 py-4 w-4/5 mx-auto text-center mb-20 input-background">

                    <fieldset className="w-fit inline-block mb-4 align-top">
                        Tyre Selection:
                        <br/>
                        <select
                            value={tyreSelection}
                            onChange={(e) => setTyreSelection(e.target.value)}
                            className="flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"
                        >
                            <option defaultValue={true} disabled={true} value="0">-- Tyre --</option>

                            {tyreOptions.map((tyre) => (
                                <option key={tyre.id} value={tyre.id}>
                                    {tyre.name}
                                </option>
                            ))}

                        </select>
                    </fieldset>

                    <fieldset className="w-fit inline-block mb-4 align-top px-1">
                        Chainring Selection:
                        <br />
                        <select
                            value={chainringSelection}
                            onChange={(e) => setChainringSelection(e.target.value)}
                            className="flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"
                        >
                            <option value="0">-- Manual Input --</option>
                            {chainringOptions.map((chainring) => (
                                <option key={chainring.id} value={chainring.id}>
                                    {chainring.name}
                                </option>
                            ))}
                        </select>

                        <br />
                        <small>Manual Input:</small>
                        <br />
                        <input
                            type="text"
                            value={manualChainring}
                            onChange={(e) => setManualChainring(e.target.value)}
                            placeholder="Enter chainring teeth"
                            className="text-xs w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"
                        />
                    </fieldset>

                    <fieldset className="w-fit inline-block mb-4 align-top  px-1">
                        Cassette Selection:
                        <br />
                        <select
                            value={cassetteSelection}
                            onChange={(e) => setCassetteSelection(e.target.value)}
                            className="flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"
                        >
                            <option value="0">-- Manual Input --</option>
                            {cassetteOptions.map((cassette) => (
                                <option key={cassette.id} value={cassette.id}>
                                    {cassette.name}
                                </option>
                            ))}
                        </select>

                        <br />
                        <small>Manual Input:</small>
                        <br />
                        <input
                            type="text"
                            value={manualCassette}
                            onChange={(e) => setManualCassette(e.target.value)}
                            placeholder="Enter cassette cogs (e.g., 11,12,13)"
                            className="text-xs w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"
                        />
                    </fieldset>

                    <div className="w-full">
                        <button 
                            onClick={changeUnits} 
                            className="bg-gray-700 text-white px-4 py-2 rounded border border-blue-900 hover:bg-gray-600 transition-colors"
                        >
                            Change Units
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-gray-400 min-w-36 text-white py-2 px-5 rounded shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all mx-5"
                        >
                            Submit
                        </button>
                        Rollout
                        <input
                        type="number"
                        value={(rollout * unitsCalculator)}
                        onChange={(e) => setRollout(e.target.value / unitsCalculator)}
                        className="w-20 flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400 h-7 ml-1 mr-1"
                        />
                        {units}
                    </div>

                    {error && (
                        <div className="text-red-400 mt-4">
                            {error}
                        </div>
                    )}
                </div>

                {results.length > 0 && (
                    <div className="bg-gray-400 w-fit mx-auto border-4 border-gray-800">
                        <table>
                            <thead>
                                <tr>
                                    <th className="border-4 border-gray-800 p-1">Ratios</th>
                                    {sprockets.slice(0).reverse().map((sprocket) => (
                                        <th key={sprocket} className="border-4 border-gray-800 p-1">{sprocket}</th>
                                    ))}
                                    <th className="border-4 border-gray-800 p-1">Ratios</th>
                                </tr>
                            </thead>

                            <tbody>
                                {chainrings.map((chainring, chainringIdx) => (
                                    <tr key={chainringIdx}>
                                        <th className="border-4 border-gray-800 p-1">{chainring}</th>
                                        {results[chainringIdx].slice(0).reverse().map((result, sprocketIdx) => {
                                            const backgroundColour =
                                                result / 1000 < (rollout - 0.5)
                                                    ? "bg-gray-600"
                                                    : result / 1000 >= rollout - 0.5 && result / 1000 < rollout
                                                    ? "bg-green-600"
                                                    : "bg-red-600";

                                            return (
                                                <td
                                                    key={sprocketIdx}
                                                    className={`border-4 border-gray-800 p-1 ${backgroundColour}`}
                                                >
                                                    {(result / 1000 * unitsCalculator).toFixed(2)}
                                                </td>
                                            );
                                        })}
                                        <th className="border-4 border-gray-800 p-1">{chainring}</th>
                                    </tr>
                                ))}
                            </tbody>

                            <thead>
                                <tr>
                                    <th className="border-4 border-gray-800 p-1">Ratios</th>
                                    {sprockets.slice(0).reverse().map((sprocket) => (
                                        <th key={sprocket} className="border-4 border-gray-800 p-1">{sprocket}</th>
                                    ))}
                                    <th className="border-4 border-gray-800 p-1">Ratios</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rollout;
