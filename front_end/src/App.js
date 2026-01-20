import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import Ratio from './Ratio';
import Rollout from './Rollout';
import Speed from './Speed';
import Map from './Map';
import BodyBackground from './BodyBackground';

function App() {

  return (
    <div className="text-white min-h-screen bg-cover flex">
      <BrowserRouter>
        <BodyBackground />
        <Navbar />
        <div className='flex-grow transition-all duration-300 ease-in-out'>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/ratios' element={<Ratio/>}/>
            <Route path='/rollout' element={<Rollout/>}/>
            <Route path='/speed' element={<Speed/>}/>
            <Route path='/map' element={<Map/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
