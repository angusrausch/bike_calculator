import { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error("REACT_APP_API_BASE_URL environment variable is not set.");
}

const Ratio = () => {
    const [chainringSelection, setChainringSelection] = useState("0");
    const [manualChainring, setManualChainring] = useState("");
    const [cassetteSelection, setCassetteSelection] = useState("0");
    const [manualCassette, setManualCassette] = useState("");
    const [error, setError] = useState("");
    const [cassetteOptions, setCassetteOptions] = useState([]);
    const [chainringOptions, setChainringOptions] = useState([]);
    const [sprockets, setSprockets] = useState([]);
    const [chainrings, setChainrings] = useState([]);
    const [results, setResults] = useState([]);

    const handleSubmit = async () => {
        setError("");

        const params = new URLSearchParams();

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

        await loadCalculations(params);
    };

    const loadCalculations = async (params) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/calculate/ratio?${params}`
            );

            const newUrl = `${window.location.pathname}?${params}`;
            window.history.replaceState({}, '', newUrl);

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
    };

    const checkValid = (input) => {
        if (/^[0-9,]*$/.test(input)) return true;
        return false;
    }
    useEffect(() => {
        const loadData = async () => {
            try {
                const [cassetteRes, chainringRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/cassettes`),
                    fetch(`${API_BASE_URL}/api/cranksets`),
                ]);

                const [cassetteData, chainringData] = await Promise.all([
                    cassetteRes.json(),
                    chainringRes.json(),
                ]);

                if (!Array.isArray(cassetteData) || !Array.isArray(chainringData)) {
                    throw new Error("Invalid API response");
                }

                setCassetteOptions(cassetteData);
                setChainringOptions(chainringData);
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

        if (cranksetId) setChainringSelection(cranksetId);
        if (cassetteId) setCassetteSelection(cassetteId);
        if (manualChainringParam) setManualChainring(manualChainringParam);
        if (manualCassetteParam) setManualCassette(manualCassetteParam);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hasChainring = params.get("crankset_id") || params.get("manual_chainring");
        const hasCassette = params.get("cassette_id") || params.get("manual_cassette");

        if (hasChainring && hasCassette) {
            loadCalculations(params);
        }
    }, [chainringSelection, cassetteSelection, manualChainring, manualCassette]);

    return (
        <div className="overflow-x-hidden">
            <h1 className="mb-12 !text-[60px] font-medium p-4 text-black text-center">
                Ratios
            </h1>

            <div className="text-white px-4 py-4 w-full max-w-[700px] mx-auto text-center mb-20 input-background rounded-xl">

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

                <div className="w-full">
                    <button
                        onClick={handleSubmit}
                        className="mt-4 bg-gray-400 min-w-36 text-white py-2 px-5 rounded shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Submit
                    </button>
                </div>

                {error && <div className="text-red-400 mt-4">{error}</div>}
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
                                    {results[chainringIdx].slice(0).reverse().map((result, sprocketIdx) => (
                                        <td key={sprocketIdx} className="border-4 border-gray-800 p-1 bg-gray-600">{result.toFixed(2)}</td>
                                    ))}
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
    );
};

export default Ratio;
