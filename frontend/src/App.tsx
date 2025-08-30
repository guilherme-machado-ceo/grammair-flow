
import React, { useState } from 'react';

const styles = {
  main: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
    textAlign: 'center' as const,
    marginTop: 40,
    background: 'linear-gradient(135deg, #ff4400 0%, #00eaff 100%)',
    minHeight: '100vh',
    color: '#e5e5e5',
    paddingBottom: 80
  },
  header: {
    color: '#ff4400',
    fontWeight: 900,
    fontSize: 38,
    letterSpacing: 2,
    textShadow: '0 2px 8px #00eaff, 0 0px 2px #fff'
  },
  sub: {
    color: '#00eaff',
    fontWeight: 600,
    fontSize: 18,
    marginBottom: 24
  },
  form: {
    margin: '2em auto',
    maxWidth: 500,
    background: 'rgba(30,30,30,0.7)',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 16px #00eaff44'
  },
  textarea: {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #ff4400',
    padding: 12,
    fontSize: 16,
    background: '#222',
    color: '#fff',
    marginBottom: 8
  },
  button: {
    marginTop: 10,
    background: 'linear-gradient(90deg, #ff4400 0%, #00eaff 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 2px 8px #00eaff44',
    transition: 'background 0.2s'
  },
  result: {
    marginTop: 20,
    background: 'rgba(200,255,255,0.12)',
    padding: 20,
    borderRadius: 12,
    color: '#fff',
    boxShadow: '0 2px 8px #00eaff44',
    textAlign: 'left' as const
  },
  footer: {
    position: 'fixed' as const,
    left: 0,
    bottom: 0,
    width: '100%',
    background: 'linear-gradient(90deg, #ff4400 0%, #00eaff 100%)',
    color: '#e5e5e5',
    textAlign: 'center' as const,
    padding: '16px 0',
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: 1.5,
    boxShadow: '0 -2px 12px #00eaff44',
    zIndex: 100
  },
  grammExp: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 10,
    margin: '0 auto 32px',
    maxWidth: 700,
    padding: 20,
    fontSize: 17,
    boxShadow: '0 2px 8px #ff440044'
  }
};

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
    <div style={styles.main}>
      <h1 style={styles.header}>GrammAIr<sup style={{fontSize:14, color:'#fff'}}>®</sup> Flow</h1>
      <div style={styles.grammExp}>
        <b>GrammAIr®</b> é uma plataforma híbrida de análise gramatical que une linguística de corpus, inteligência artificial e ciência de dados. Projetada para integração com a linguagem R e acessível via API RESTful, a ferramenta oferece insights linguísticos robustos por meio de analytics descritivo, preditivo e prescritivo. Voltada a pesquisadores, educadores, desenvolvedores e empresas EdTech, a GrammAIr automatiza a compreensão e a correção da linguagem com base em evidência empírica e aprendizado de máquina.
      </div>
      <p style={styles.sub}>Backend diz: {message}</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          style={styles.textarea}
          placeholder="Digite um texto para análise..."
        />
        <br />
        <button type="submit" style={styles.button}>Analisar texto</button>
      </form>
      {result && (
        <div style={styles.result}>
          <h3 style={{color:'#e5e5e5', textShadow:'0 2px 8px #ff4400, 0 0px 2px #00eaff'}}>Resultado da análise</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      <footer style={styles.footer}>
        powered by Hubstry 20025 | Guilherme Gonçalves Machado
      </footer>
    </div>
  );
}

export default App;
