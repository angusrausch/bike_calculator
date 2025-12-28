import { useState } from "react";

const Navbar = () => {
    const [navbarWidth, setNavbarWidth] = useState("w-64")
    const [linkTextDisplay, setLinkTextDisplay] = useState("show")

    const changeSideBar = () => {
        if (navbarWidth == "w-64") {
            setNavbarWidth("w-20");
            setLinkTextDisplay("hidden");
        } else {
            setNavbarWidth("w-64");
            setLinkTextDisplay("show");
        }
    }

    return (
        <div className={`bg-gray-800 flex-shrink-0 transition-all duration-300 ease-in-out ${navbarWidth}`}>
            <div className="p-4 pt-8">
                <button id="menu-toggle-btn" onClick={changeSideBar} className="nav-link flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded-md w-full mb-4">
                    <div className="flex-grow"></div>
                    <i className="fa-solid fa-bars fa-fw text-2xl"></i>
                </button>

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
            </div>
        </div>
    );
}
 
export default Navbar;