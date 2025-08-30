import React from 'react';

function App() {
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: 40 }}>
      <h1>grammair-flow</h1>
      <p>Backend diz: {message}</p>
    </div>
  );
}

export default App;
