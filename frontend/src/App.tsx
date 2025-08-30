import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);

  React.useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: 40 }}>
      <h1>grammair-flow</h1>
      <p>Backend diz: {message}</p>
      <form onSubmit={handleSubmit} style={{ margin: '2em auto', maxWidth: 400 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          style={{ width: '100%' }}
          placeholder="Digite um texto para análise..."
        />
        <br />
        <button type="submit" style={{ marginTop: 10 }}>Analisar texto</button>
      </form>
      {result && (
        <div style={{ marginTop: 20, background: '#f5f5f5', padding: 20, borderRadius: 8 }}>
          <h3>Resultado da análise</h3>
          <pre style={{ textAlign: 'left' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
