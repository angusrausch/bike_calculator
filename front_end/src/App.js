import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import Ratio from './Ratio';
import Rollout from './Rollout';

function App() {

  return (
    <div className="bg-gray-900 text-white min-h-screen bg-cover flex">
      <Navbar />
      <div className='flex-grow p-4 transition-all duration-300 ease-in-out'>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/ratios' element={<Ratio/>}/>
            <Route path='/rollout' element={<Rollout/>}/>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
