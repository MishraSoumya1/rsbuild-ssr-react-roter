import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

function Home({ serverData }: { serverData?: any }) {
  const navigate = useNavigate();
  return (
    <div className="content">
      <h1>Home</h1>
      <p>Welcome to the Home page.</p>
      <button onClick={() => navigate('/about')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '16px'
        }}
      >Go to About</button>
      {serverData && (
        <div className="server-data">
          <h2>Server Data:</h2>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function About({ serverData }: { serverData?: any }) {
  const navigate = useNavigate();
  return (
    <div className="content">
      <h1>About</h1>
      <p>This is the About page.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '16px'
        }}
      >
        Go to Home
      </button>
      {serverData && (
        <div className="server-data">
          <h2>Server Data:</h2>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}



// App receives a Router component as prop for SSR/CSR flexibility and serverData for SSR POST
const App = ({ Router, serverData }: { Router: React.ComponentType<any>, serverData?: any }) => {
  return (
    <Router>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home serverData={serverData} />} />
        <Route path="/about" element={<About serverData={serverData} />} />
      </Routes>
    </Router>
  );
};

export default App;
