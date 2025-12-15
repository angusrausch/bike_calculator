import '@fortawesome/fontawesome-free/css/all.min.css';

import './App.css';
import Navbar from './Navbar';
// import Home from './Home';
import Ratio from './Ratio';

function App() {

  return (
    <div className="bg-gray-900 text-white min-h-screen bg-cover flex">
      <Navbar />
      <div className='flex-grow p-4 transition-all duration-300 ease-in-out'>
        {/* <Home /> */}
        <Ratio />
      </div>
    </div>
  );
}

export default App;
