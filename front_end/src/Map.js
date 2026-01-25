import React, { useEffect, useState, useRef } from 'react';

const TapRackMap = () => {
    const mapRef = useRef(null);
    const googleMapInstance = useRef(null);
    const tapMapRef = useRef(new Map());
    const rackMapRef = useRef(new Map());
    const openInfoWindowRef = useRef(null);

    const [tapsMessage, setTapsMessage] = useState("");
    const [racksMessage, setRacksMessage] = useState("");
    const [error, setError] = useState(null);

    const hostname = `${window.location.protocol}//${window.location.hostname}`;

    const SC_TAPS_TYPE = {
        WO02: "Drinking Fountain",
        WO05: "Tap",
        WO06: "Bottle Refill Station"
    };

    const lonLatToWebMercator = (lon, lat) => {
        const RADIUS = 6378137.0;
        const x = lon * (Math.PI / 180) * RADIUS;
        const y = Math.log(Math.tan((Math.PI / 4) + (lat * (Math.PI / 180) / 2))) * RADIUS;
        return [x, y];
    };

    const createMarker = (lat, lng, label, content) => {
        if (!window.google) return;

        const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: googleMapInstance.current,
            label: label,
            icon: label === 'R' ? null : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        });

        const infowindow = new window.google.maps.InfoWindow({ content });

        marker.addListener('click', () => {
            if (openInfoWindowRef.current) {
                openInfoWindowRef.current.close();
            }
            infowindow.open(googleMapInstance.current, marker);
            openInfoWindowRef.current = infowindow;
        });

        return marker;
    };

    const placeTap = (tap) => {
        const tapMap = tapMapRef.current;
        if (tap.geometry) { // SC, MB & GC API
            if (tap.attributes.FeatureTypeCode) {
                const tapId = tap.attributes.OBJECTID + 2000000;
                if (!tapMap.has(tapId)) {
                    const tapType = SC_TAPS_TYPE[tap.attributes.FeatureTypeCode];
                    const marker = createMarker(parseFloat(tap.geometry.y), parseFloat(tap.geometry.x), 'T', `<strong>${tapType}</strong>`);
                    tapMap.set(tapId, marker);
                }
            } else if (tap.attributes.Water_Fountain) {
                const tapId = tap.attributes.OBJECTID + 3000000;
                if (!tapMap.has(tapId)) {
                    const marker = createMarker(parseFloat(tap.geometry.y), parseFloat(tap.geometry.x), 'T', `Within <strong>${tap.attributes.Description}</strong><br><small>Unable to get exact location</small>`);
                    tapMap.set(tapId, marker);
                }
            } else {
                const tapId = tap.attributes.OBJECTID + 1000000;
                if (!tapMap.has(tapId)) {
                    const marker = createMarker(parseFloat(tap.geometry.y), parseFloat(tap.geometry.x), 'T', `<strong>${tap.attributes.GIS_DESCRIPTION}</strong>`);
                    tapMap.set(tapId, marker);
                }
            }
        } else { // Brisbane API
            if (!tapMap.has(tap.objectid)) {
                const marker = createMarker(parseFloat(tap.y), parseFloat(tap.x), 'T', `<strong>${tap.item_description}</strong><br><small>${tap.park_name}</small>`);
                tapMap.set(tap.objectid, marker);
            }
        }
    };

    const placeRack = (rack) => {
        const rackMap = rackMapRef.current;
        const key = rack.latitude * rack.longitude * rack.capacity;
        if (!rackMap.has(key)) {
            const marker = createMarker(parseFloat(rack.latitude), parseFloat(rack.longitude), 'R', `<strong>${rack.rack_type} - Capacity: ${rack.capacity}</strong><br><small>${rack.location}</small>`);
            rackMap.set(key, marker);
        }
    };

    const checkMarkerNumbers = () => {
        if (tapMapRef.current.size > 450) {
            tapMapRef.current.forEach(marker => marker.setMap(null));
            tapMapRef.current = new Map();
        }
        if (rackMapRef.current.size > 350) {
            rackMapRef.current.forEach(marker => marker.setMap(null));
            rackMapRef.current = new Map();
        }
    };

    const fetchData = async (lat, lon) => {
        const [left, right] = lon;
        const [top, bottom] = lat;
        checkMarkerNumbers();
        let safeTapNumbers = true;

        const [xmin, ymax] = lonLatToWebMercator(left, top);
        const [xmax, ymin] = lonLatToWebMercator(right, bottom);
        const whereClause = "(FeatureTypeCode='WO02' OR FeatureTypeCode='WO05' OR FeatureTypeCode='WO06') AND UPPER(Status)='ACTIVE'";
        const geometry = `${xmin},${ymin},${xmax},${ymax}`;

        const tapFetches = [
            // Brisbane Taps
            fetch(`https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/park-drinking-fountain-tap-locations/records?where=x%3E${left}%20and%20x%3C${right}%20and%20y%3E${bottom}%20and%20y%3C${top}&limit=100`)
                .then(res => res.json())
                .then(data => {
                    data.results.forEach(placeTap);
                    if (data.results.length >= 100) safeTapNumbers = false;
                }).catch(console.error),

            // Gold Coast Taps
            fetch(`https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Tap/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=${left}%2C${top}%2C${right}%2C${bottom}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json&resultRecordCount=200`)
                .then(res => res.json())
                .then(data => {
                    data.features?.forEach(placeTap)
                    if (data.features.length >= 200) safeTapNumbers = false;
                }).catch(console.error),

            // Moreton Bay Taps
            fetch(`https://services-ap1.arcgis.com/152ojN3Ts9H3cdtl/arcgis/rest/services/MBRCParkDetails/FeatureServer/0/query?f=json&where=Water_Fountain='Yes'&geometry=${xmin},${ymin},${xmax},${ymax}&geometryType=esriGeometryEnvelope&inSR=3857&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=4326`)
                .then(res => res.json())
                .then(data => {
                    data.features?.forEach(placeTap)
                    if (data.features.length >= 100) safeTapNumbers = false;
                }).catch(console.error),

            // Sunshine Coast Taps
            fetch(`https://geopublic.scc.qld.gov.au/arcgis/rest/services/Structure/Structure_SCRC/MapServer/1/query?f=json&where=${encodeURIComponent(whereClause)}&geometry=${geometry}&geometryType=esriGeometryEnvelope&inSR=3857&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=4326&resultRecordCount=200`)
                .then(res => res.json())
                .then(data => {
                    data.features?.forEach(placeTap)
                    if (data.features.length >= 200) safeTapNumbers = false;
                }).catch(console.error)
        ];

        await Promise.all(tapFetches);

        setTapsMessage(
            safeTapNumbers ? "" : "Map too large. Zoom in to display all taps"
        );

        // Brisbane Racks
        fetch(`https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/bicycle-racks/records?where=longitude%3E${left}%20and%20longitude%3C${right}%20and%20latitude%3E${bottom}%20and%20latitude%3C${top}&limit=100`)
            .then(res => res.json())
            .then(data => {
                data.results.forEach(placeRack);
                setRacksMessage(data.results.length < 100 ? "" : "Map too large. Zoom in to display all racks");
            }).catch(console.error);
    };

    const addLocationButton = (map) => {
        if (!window.google || !window.google.maps) return;

        const controlDiv = document.createElement("div");
        const controlUI = document.createElement("button");

        controlUI.style.backgroundColor = "#fff";
        controlUI.style.border = "none";
        controlUI.style.width = "40px";
        controlUI.style.height = "40px";
        controlUI.style.borderRadius = "2px";
        controlUI.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
        controlUI.style.cursor = "pointer";
        controlUI.style.marginRight = "10px";
        controlUI.title = "Your Location";

        controlUI.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
                    <line x1="12" y1="1" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="23"></line>
                    <line x1="1" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="23" y2="12"></line>
                </svg>
            </div>`;

        controlUI.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    map.setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    map.setZoom(17);
                });
            }
        });

        controlDiv.appendChild(controlUI);

        const position = window.google.maps.ControlPosition 
            ? window.google.maps.ControlPosition.RIGHT_BOTTOM 
            : 9;

        map.controls[position].push(controlDiv);
    };

    useEffect(() => {
        fetch(`${hostname}:8080/get-google-maps-key`)
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${data.google_maps_key}&libraries=geometry`;
                script.async = true;
                script.onload = () => initMap();
                document.body.appendChild(script);
            })
            .catch(err => {
                console.error("CORS or Fetch error:", err);
                setError("Failed to load map API key from backend");
            });

        const initMap = () => {
            if (!mapRef.current) return;
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: -27.469705, lng: 153.025196 },
                zoom: 16,
                streetViewControl: false
            });

            addLocationButton(map);

            const params = new URLSearchParams(window.location.search);
            if (params.has("lng") && params.has("lat") && params.has("zoom")) {
                const paramsLocation = {
                    lat: parseFloat(params.get("lat")),
                    lng: parseFloat(params.get("lng"))
                };
                map.setCenter(paramsLocation);
                map.setZoom(parseFloat(params.get("zoom")));
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(userLocation);
                    new window.google.maps.Marker({
                        position: userLocation,
                        map: map,
                    });
                });
            }

            googleMapInstance.current = map;

            map.addListener('idle', () => {
                const bounds = map.getBounds();
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();

                fetchData([ne.lat(), sw.lat()], [sw.lng(), ne.lng()]);

                const center = map.getCenter();
                const zoom = map.getZoom();
                const params = new URLSearchParams({ lat: center.lat(), lng: center.lng(), zoom });
                window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
            });
        };
    }, []);

    // Viewport height adjustment for mobile
    useEffect(() => {
        const setMapVH = () => {
            if (mapRef.current) {
                const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                mapRef.current.style.height = `${vh}px`;
            }
        };
        window.addEventListener('resize', setMapVH);
        setMapVH();
        return () => window.removeEventListener('resize', setMapVH);
    }, []);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`min-h-screen bg-black bg-cover ${isMobile ? '' : ''}`} style={{ backgroundImage: "url('/static/calc/images/calc-background.jpeg')" }}>
            <div
                className={
                    `p-4 md:p-12 padded-outer` +
                    (isMobile
                        ? " fixed inset-0 z-40 p-0 m-0 bg-black/85 flex flex-col"
                        : " bg-[rgba(179,180,189,0.8)]")
                }
            >
                {error && (
                    <div className="mb-5 text-red-600 text-center">
                        <h4>{error}</h4>
                    </div>
                )}

                <h2 className={`text-xl font-bold ${isMobile ? "hidden" : ""}`}>Brisbane:</h2>
                <div className={`my-2 ${isMobile ? "hidden" : ""}`}>
                    <p>Red (R): Bike Racks</p>
                    <span className="text-xs text-gray-700">{racksMessage}</span>
                    <p>Blue (T): Taps</p>
                    <span className="text-xs text-gray-700">{tapsMessage}</span>
                </div>

                <div
                    className={
                        `bg-white p-2 text-black rounded-lg mt-4 shadow-xl` +
                        (isMobile ? " bg-transparent flex-1 p-0 m-0" : "")
                    }
                >
                    <div
                        id="map"
                        ref={mapRef}
                        className={`w-full ${isMobile ? "w-screen h-screen" : ""}`}
                        style={
                            isMobile
                                ? { width: '100vw', height: '100vh' }
                                : { height: '500px', minHeight: '400px' }
                        }
                    ></div>
                </div>

                <div className={`mt-4 space-y-1 ${isMobile ? "hidden" : ""}`}>
                    <small className="block">Data from <a href="https://www.brisbane.qld.gov.au/business-in-brisbane/business-opportunities/open-data" className="text-blue-600 underline">Brisbane Open Data</a></small>
                    <small className="block">Data from <a href="https://www.goldcoast.qld.gov.au/About-our-city/Digital-connectivity/Data-intelligence/City-of-Gold-Coast-Data-Portal" className="text-blue-600 underline">City of Gold Coast Data Portal</a></small>
                    <small className="block">Data from <a href="https://datahub.moretonbay.qld.gov.au" className="text-blue-600 underline">Datahub City of Moreton Bay</a></small>
                    <small className="block">Data from <a href="https://data.sunshinecoast.qld.gov.au" className="text-blue-600 underline">Open Data Sunshine Coast Council</a></small>
                </div>
            </div>
        </div>
    );
};

export default TapRackMap;