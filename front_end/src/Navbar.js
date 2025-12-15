const Navbar = () => {
    return (
        <div className="p-4 pt-8">
            <button id="menu-toggle-btn" className="nav-link flex items-center p-3 text-gray-300 hover:bg-gray-700 rounded-md w-full mb-4">
                <div className="flex-grow"></div>
                <i className="fa-solid fa-bars fa-fw text-2xl"></i>
            </button>

            <ul className="space-y-3">
                <li>
                <a href="/" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                    <i className="fa-solid fa-house fa-fw w-12 text-center text-2xl"></i>                        
                    <span className="link-text ml-4 whitespace-nowrap text-lg font-medium">Home</span>
                </a>
                </li>
                <li>
                <a href="/speed" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                    <i className="fa-solid fa-gauge-high fa-fw w-12 text-center text-2xl"></i>
                    <span className="link-text ml-4 whitespace-nowrap text-lg font-medium">Speed</span>
                </a>
                </li>
                <li>
                <a href="/ratios" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                    <i className="fa-solid fa-gears fa-fw w-12 text-center text-2xl"></i>
                    <span className="link-text ml-4 whitespace-nowrap text-lg font-medium">Ratios</span>
                </a>
                </li>
                <li>
                <a href="/rollout" className="nav-link flex items-center justify-start p-3 text-gray-300 hover:bg-gray-700 rounded-md">
                    <i className="fa-solid fa-tape fa-fw w-12 text-center text-2xl"></i>
                    <span className="link-text ml-4 whitespace-nowrap text-lg font-medium">Rollout</span>
                </a>
                </li>
            </ul>
        </div>
    );
}
 
export default Navbar;