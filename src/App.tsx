

import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import About from './components/About';

interface AppProps {
  Router: React.ComponentType<any>;
  serverData?: unknown;
}

// App receives a Router component as prop for SSR/CSR flexibility and serverData for SSR POST
const App = ({ Router, serverData }: AppProps) => {
  return (
    <div className="main">
      <Router>
        <div className='app-header'>
          <nav style={{ marginBottom: 20 }}>
            <Link to="/" style={{ marginRight: 10 }}>Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </div>
        <div className="app-body">
          <Routes>
            <Route path="/" element={<Home serverData={serverData} />} />
            <Route path="/about" element={<About serverData={serverData} />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
