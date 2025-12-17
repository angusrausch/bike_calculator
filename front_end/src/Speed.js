import { useEffect, useState } from "react";

const Speed = () => {
    const [tyreSelection, setTyreSelection] = useState("0");
    const [chainringSelection, setChainringSelection] = useState("0");
    const [manualChainring, setManualChainring] = useState("");
    const [cassetteSelection, setCassetteSelection] = useState("0");
    const [manualCassette, setManualCassette] = useState("");
    const [minCadence, setMinCadence] = useState("60");
    const [maxCadence, setMaxCadence] = useState("120");
    const [cadenceIncrement, setCadenceIncrement] = useState("10");
    const [error, setError] = useState("");
    const [cassetteOptions, setCassetteOptions] = useState([]);
    const [chainringOptions, setChainringOptions] = useState([]);
    const [tyreOptions, setTyreOptions] = useState([]);
    const [cadences, setCadences] = useState([]);
    const [ratios, setRatios] = useState([]);
    const [results, setResults] = useState([]);


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

        if (/^[0-9]*$/.test(minCadence) && /^[0-9]*$/.test(maxCadence) && /^[0-9]*$/.test(cadenceIncrement)) {
            params.append("min_cadence", minCadence);
            params.append("max_cadence", maxCadence);
            params.append("cadence_increment", cadenceIncrement);
        } else {
            setError("Invalid Cadence Selections");
            return;
        }

        const argList = params.toString();
        await loadCalculations(argList);
    };

    const loadCalculations = async (argList) => {
        try {
            const params = new URLSearchParams(argList).toString();
            const response = await fetch(
                `http://localhost:8080/calculate/speed?${params}`
            );

            const calculations = await response.json();

            if (calculations && calculations.results && calculations.results.length > 0) {
                const ratios = calculations.chainrings.flatMap(chainring =>
                    calculations.sprockets.map(sprocket => `${chainring}/${sprocket}`)
                );
                setRatios(ratios);
                setCadences(calculations.cadences);
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
                Speed
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

                    <fieldset className="w-fit inline-block mb-4 align-top">
                        Cadence Selection:
                        <br/>
                        Min:<input type="number"value={minCadence} onChange={(e) => setMinCadence(e.target.value)} className="text-center flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"/><br/>
                        Max:<input type="number" value={maxCadence} onChange={(e) => setMaxCadence(e.target.value)} className="text-center flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"/><br/>
                        Increment:<input type="number" value={cadenceIncrement} onChange={(e) => setCadenceIncrement(e.target.value)} className="text-center flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400"/>
                    </fieldset>

                    <div className="w-full">
                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-gray-400 min-w-36 text-white py-2 px-5 rounded shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                            Submit
                        </button>
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
                                    {cadences.map((sprocket) => (
                                        <th key={sprocket} className="border-4 border-gray-800 p-1">{sprocket}</th>
                                    ))}
                                    <th className="border-4 border-gray-800 p-1">Ratios</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ratios.map((ratio, ratioIdx) => (
                                    <tr key={ratioIdx}>
                                        <th className="border-4 border-gray-800 p-1">{ratio}</th>
                                        {results[ratioIdx].map((result, cadenceIdx) => (
                                            <td key={cadenceIdx} className="border-4 border-gray-800 p-1 bg-gray-600">{result.toFixed(2)}</td>
                                        ))}
                                        <th className="border-4 border-gray-800 p-1">{ratio}</th>
                                    </tr>
                                ))}
                            </tbody>

                            <thead>
                                <tr>
                                    <th className="border-4 border-gray-800 p-1">Ratios</th>
                                    {cadences.map((sprocket) => (
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

export default Speed;
