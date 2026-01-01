import { useState } from "react";

const Navbar = () => {
    const [navbarWidth, setNavbarWidth] = useState("w-64")
    const [linkTextDisplay, setLinkTextDisplay] = useState("show")
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const changeSideBar = () => {
        if (navbarWidth == "w-64") {
            setNavbarWidth("w-20");
            setLinkTextDisplay("hidden");
        } else {
            setNavbarWidth("w-64");
            setLinkTextDisplay("show");
        }
    }

    const changeMobileSideBar = () => {
        
    }

    const navbar = (
        <ul className="space-y-3">
            <li>
            <a href="/" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                <i className="fa-solid fa-house fa-fw w-12 text-center text-2xl"></i>                        
                <span className={`ml-4 whitespace-nowrap text-lg font-medium ${linkTextDisplay}`}>Home</span>
            </a>
            </li>
            <li>
            <a href="/speed" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                <i className="fa-solid fa-gauge-high fa-fw w-12 text-center text-2xl"></i>
                <span className={`ml-4 whitespace-nowrap text-lg font-medium ${linkTextDisplay}`}>Speed</span>
            </a>
            </li>
            <li>
            <a href="/ratios" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                <i className="fa-solid fa-gears fa-fw w-12 text-center text-2xl"></i>
                <span className={`ml-4 whitespace-nowrap text-lg font-medium ${linkTextDisplay}`}>Ratios</span>
            </a>
            </li>
            <li>
            <a href="/rollout" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                <i className="fa-solid fa-tape fa-fw w-12 text-center text-2xl"></i>
                <span className={`ml-4 whitespace-nowrap text-lg font-medium ${linkTextDisplay}`}>Rollout</span>
            </a>
            </li>
        </ul>
    );

    if (window.innerWidth < 767) {
        return (
            <>
                {!mobileSidebarOpen && (
                    <button
                        aria-label="Open menu"
                        title="Open menu"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="fixed top-4 left-4 z-[9999] w-11 h-11 rounded-lg bg-gray-900 text-white border-none p-2 shadow-lg flex items-center justify-center"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                )}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 z-50"
                        aria-hidden="true"
                    >
                        <div
                            className="absolute inset-0 bg-black/60"
                            aria-hidden="true"
                            onClick={() => setMobileSidebarOpen(false)}
                        ></div>
                        <div className="relative h-full w-full overflow-auto">
                            <div className="mobile-sidebar-panel h-full bg-gray-900 text-white p-4 relative">
                                <button
                                    aria-label="Close menu"
                                    title="Close menu"
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className="absolute top-4 right-4 z-[10000] w-11 h-11 rounded-lg bg-gray-900 text-white border-none p-2 shadow-lg flex items-center justify-center"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                                        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                                {navbar}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    } else {
        return (
            <div className={`bg-gray-800 flex-shrink-0 transition-all duration-300 ease-in-out ${navbarWidth}`}>
                <div className="p-4 pt-8">
                    <button id="menu-toggle-btn" onClick={changeSideBar} className="nav-link flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded-md w-full mb-4">
                        <div className="flex-grow"></div>
                        <i className="fa-solid fa-bars fa-fw text-2xl"></i>
                    </button>
                    {navbar}
                </div>
            </div>
        );
    }
}
 
export default Navbar;