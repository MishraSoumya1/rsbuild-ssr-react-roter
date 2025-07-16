import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export interface AboutProps {
  serverData?: unknown;
}

const About: React.FC<AboutProps> = ({ serverData }) => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/aboutData', { method: 'POST' });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '16px'
  };

  return (
    <div className="content">
      <h1>About</h1>
      <p>This is the About page.</p>
      <button
        onClick={() => navigate('/')}
        style={{ ...buttonStyle }}
      >
        Go to Home
      </button>
      <button onClick={fetchData} style={{ ...buttonStyle, backgroundColor: '#2e7d32', marginLeft: 10 }}>
        Fetch Data from Server
      </button>
      {typeof serverData === 'object' && serverData !== null && (
        <div className="server-data">
          <h2>Server Data:</h2>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </div>
      )}
      {data && (
        <div className="fetched-data-internally">
          <h2>Fetched Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default About;
