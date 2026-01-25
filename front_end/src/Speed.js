import { useEffect, useState } from "react";

const Speed = () => {
    const [tyreSelection, setTyreSelection] = useState("0");
    const [chainringSelection, setChainringSelection] = useState("0");
    const [manualChainring, setManualChainring] = useState("");
    const [cassetteSelection, setCassetteSelection] = useState("0");
    const [manualCassette, setManualCassette] = useState("");
    const [minCadence, setMinCadence] = useState("60");
    const [maxCadence, setMaxCadence] = useState("120");
    const [cadenceIncrement, setCadenceIncrement] = useState("5");
    const [error, setError] = useState("");
    const [cassetteOptions, setCassetteOptions] = useState([]);
    const [chainringOptions, setChainringOptions] = useState([]);
    const [tyreOptions, setTyreOptions] = useState([]);
    const [cadences, setCadences] = useState([]);
    const [ratios, setRatios] = useState([]);
    const [results, setResults] = useState([]);
    const [slowSpeed, setSlowSpeed] = useState("20");
    const [fastSpeed, setFastSpeed] = useState("50");
    const unitOptions = {
        METRIC: 'Kph',
        IMPERIAL: 'Mph'
    };
    const [units, setUnits] = useState(unitOptions.METRIC);
    const [unitsCalculator, setUnitsCalculator] = useState(1);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    if (!API_BASE_URL) {
        throw new Error("REACT_APP_API_BASE_URL environment variable is not set.");
    }

    const hostname = `${window.location.protocol}//${window.location.hostname}`


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

        await loadCalculations(params);
    };

    const loadCalculations = async (params) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/calculate/speed?${params}`
            );

            const newUrl = `${window.location.pathname}?${params}`;
            window.history.replaceState({}, '', newUrl);

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
    };

    const checkValid = (input) => {
        if (/^[0-9,]*$/.test(input)) return true;
        return false;
    };

    const changeUnits = () => {
        if (units === unitOptions.METRIC ) {
            setUnits(unitOptions.IMPERIAL);
            setUnitsCalculator(1.609);
        } else {
            setUnits(unitOptions.METRIC);
            setUnitsCalculator(1);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [cassetteRes, chainringRes, tyresRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/cassettes`),
                    fetch(`${API_BASE_URL}/api/cranksets`),
                    fetch(`${API_BASE_URL}/api/tyres`),
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const cranksetId = params.get("crankset_id");
        const cassetteId = params.get("cassette_id");
        const manualChainringParam = params.get("manual_chainring");
        const manualCassetteParam = params.get("manual_cassette");
        const tyreId = params.get("tyre_id");
        const minCadence = params.get("min_cadence");
        const maxCadence = params.get("max_cadence");
        const cadenceIncrement = params.get("cadence_increment");

        if (cranksetId) setChainringSelection(cranksetId);
        if (cassetteId) setCassetteSelection(cassetteId);
        if (manualChainringParam) setManualChainring(manualChainringParam);
        if (manualCassetteParam) setManualCassette(manualCassetteParam);
        if (tyreId) setTyreSelection(tyreId);
        if (minCadence) setMinCadence(minCadence);
        if (maxCadence) setMaxCadence(maxCadence);
        if (cadenceIncrement) setCadenceIncrement(cadenceIncrement);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const hasChainring = params.get("crankset_id") || params.get("manual_chainring");
        const hasCassette = params.get("cassette_id") || params.get("manual_cassette");
        const hasTyre = params.get("tyre_id");

        if (hasChainring && hasCassette && hasTyre) {
            loadCalculations(params);
        }
    }, [chainringSelection, cassetteSelection, manualChainring, manualCassette]);


    return (
        <div className="overflow-x-hidden">
            <h1 className="mb-12 !text-[60px] font-medium p-4 text-black text-center">
                Speed
            </h1>

            <div className="text-white px-6 py-4 w-full max-w-[700px] mx-auto text-center mb-20 input-background">

                                <fieldset className="w-full md:w-fit inline-block mb-4 align-top px-2 text-left">
                    Tyre Selection:
                    <br/>
                    <select
                        value={tyreSelection}
                        onChange={(e) => setTyreSelection(e.target.value)}
                        className="w-full md:w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-200 text-lg md:text-base appearance-none"
                    >
                        <option defaultValue={true} disabled={true} value="0">-- Tyre --</option>

                        {tyreOptions.map((tyre) => (
                            <option key={tyre.id} value={tyre.id}>
                                {tyre.name}
                            </option>
                        ))}

                    </select>
                </fieldset>

                <fieldset className="w-full md:w-fit inline-block mb-4 align-top px-2 text-left">
                    Chainring Selection:
                    <br />
                    <select
                        value={chainringSelection}
                        onChange={(e) => setChainringSelection(e.target.value)}
                        className="w-full md:w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-200 text-lg md:text-base appearance-none"
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
                        className="w-full md:w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-200 text-lg md:text-base appearance-none"
                    />
                </fieldset>

                <fieldset className="w-full md:w-fit inline-block mb-4 align-top px-2 text-left">
                    Cassette Selection:
                    <br />
                    <select
                        value={cassetteSelection}
                        onChange={(e) => setCassetteSelection(e.target.value)}
                        className="w-full md:w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-200 text-lg md:text-base appearance-none"
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
                        className="w-full md:w-48 p-2 border border-blue-900 rounded bg-gray-700 text-gray-200 text-lg md:text-base appearance-none"
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
                        onClick={changeUnits} 
                        className="mt-4 bg-gray-400 min-w-36 text-white py-2 px-5 rounded shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Change Units
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="mt-4 bg-gray-400 min-w-36 text-white py-2 px-5 mx-5 rounded shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                        Submit
                    </button>
                    Slow
                    <input
                    type="number"
                    value={slowSpeed}
                    onChange={(e) => setSlowSpeed(e.target.value)}
                    className="w-16 flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400 h-7 ml-1 mr-4"
                    />

                    Fast
                    <input
                    type="number"
                    value={fastSpeed}
                    onChange={(e) => setFastSpeed(e.target.value)}
                    className="w-16 flex-1 p-2 border border-blue-900 rounded bg-gray-700 text-gray-400 h-7 ml-1"
                    />
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
                                    {results[ratioIdx].map((result, cadenceIdx) => {
                                        const backgroundColour =
                                            result <= slowSpeed
                                                ? "bg-red-600"
                                                : result >= fastSpeed
                                                ? "bg-green-600"
                                                : "bg-gray-600";
                                        return (
                                            <td
                                                key={cadenceIdx}
                                                className={`border-4 border-gray-800 p-1 ${backgroundColour}`}
                                            >
                                                {(result / unitsCalculator).toFixed(2)} {units}
                                            </td>
                                        );
                                    })}
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
    );
};

export default Speed;
