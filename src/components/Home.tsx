import { useNavigate } from 'react-router-dom';
import React from 'react';

export interface HomeProps {
  serverData?: unknown;
}

const Home: React.FC<HomeProps> = ({ serverData }) => {
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
      {typeof serverData === 'object' && serverData !== null && (
        <div className="server-data">
          <h2>Server Data:</h2>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
