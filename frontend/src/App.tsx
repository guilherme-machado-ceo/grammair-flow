// Mini glossário de siglas e métricas
const glossary: { [key: string]: string } = {
  'POS': 'Part-of-Speech (Classe gramatical da palavra, ex: substantivo, verbo, adjetivo, etc.)',
  'lemma': 'Forma canônica da palavra (ex: "correr" para "correndo")',
  'dep': 'Relação sintática (dependência) entre palavras na frase',
  'tag': 'Etiqueta gramatical detalhada atribuída pelo modelo',
  'polarity': 'Polaridade do sentimento: -1 (negativo) a 1 (positivo)',
  'subjectivity': 'Grau de subjetividade: 0 (objetivo) a 1 (subjetivo)',
  'num_words': 'Número total de palavras no texto',
  'num_sentences': 'Número total de frases',
  'mean_word_length': 'Comprimento médio das palavras',
  'median_word_length': 'Comprimento mediano das palavras',
  'mean_sentence_length': 'Comprimento médio das frases (em palavras)',
  'median_sentence_length': 'Comprimento mediano das frases (em palavras)',
  'word_length_variance': 'Variação do comprimento das palavras',
  'sentence_length_variance': 'Variação do comprimento das frases',
  'flesch_reading_ease': 'Índice de facilidade de leitura Flesch (quanto maior, mais fácil)',
  'gunning_fog': 'Índice Gunning Fog (estimativa de anos de escolaridade necessários)',
  'smog_index': 'Índice SMOG (estimativa de anos de escolaridade necessários)',
  'automated_readability_index': 'Índice de legibilidade automatizado',
  'bigrams': 'Pares de palavras que aparecem juntas com mais frequência',
  'trigrams': 'Sequências de três palavras mais frequentes',
};

function Glossary() {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{margin:'24px auto 0', maxWidth:700, textAlign:'left'}}>
      <button onClick={()=>setShow(!show)} style={{background:'#00eaff', color:'#222', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, cursor:'pointer', marginBottom:8}}>
        {show ? 'Ocultar glossário' : 'Mostrar glossário de termos'}
      </button>
      {show && (
        <div style={{background:'#222', color:'#fff', borderRadius:10, padding:18, boxShadow:'0 2px 8px #00eaff44', fontSize:16}}>
          <b>Glossário de termos e métricas:</b>
          <ul style={{marginTop:10, marginBottom:0, paddingLeft:22}}>
            {Object.entries(glossary).map(([sigla, desc]) => (
              <li key={sigla} style={{marginBottom:6}}><b>{sigla}:</b> {desc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
      // Visualização especial para resultados de R
      function RAnalysisView({ r }: { r: any }) {
        if (!r || Object.keys(r).length === 0) return null;
        return (
          <div style={{margin:'18px 0', background:'#222', borderRadius:10, padding:16, boxShadow:'0 2px 8px #00eaff44'}}>
            <b style={{color:'#00eaff'}}>Resultados de análise via R:</b>
            <ul style={{marginTop:10, marginBottom:0, paddingLeft:22}}>
              {Object.entries(r).map(([k,v]) => (
                <li key={k}><b>{k}:</b> {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}</li>
              ))}
            </ul>
          </div>
        );
      }
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
      <Glossary />
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
          {/* Estatísticas descritivas */}
          {result.stats && (
            <div style={{marginBottom:18}}>
              <b>Estatísticas do texto:</b>
              <ul style={{marginTop:6, marginBottom:0, paddingLeft:22}}>
                {Object.entries(result.stats).map(([k,v]) => (
                  <li key={k}><b>{k}:</b> {v}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Legibilidade */}
          {result.readability && (
            <div style={{marginBottom:18}}>
              <b>Índices de legibilidade:</b>
              <ul style={{marginTop:6, marginBottom:0, paddingLeft:22}}>
                {Object.entries(result.readability).map(([k,v]) => (
                  <li key={k}><b>{k}:</b> {v}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Histogramas */}
          {result.histogram_base64 && (
            <div style={{margin:'18px 0', textAlign:'center'}}>
              <b>Histograma do comprimento das frases:</b><br/>
              <img src={`data:image/png;base64,${result.histogram_base64}`} alt="Histograma" style={{maxWidth:'100%', borderRadius:10, marginTop:8}} />
            </div>
          )}
          {/* Coocorrência (bigrams) */}
          {result.bigrams && result.bigrams.length > 0 && (
            <div style={{marginBottom:18}}>
              <b>Pares de palavras mais frequentes (bigrams):</b>
              <ul style={{marginTop:6, marginBottom:0, paddingLeft:22}}>
                {result.bigrams.map((b:any, i:number) => (
                  <li key={i}><b>{b.pair}</b> — {b.count} ocorrências</li>
                ))}
              </ul>
            </div>
          )}
          {/* N-gramas (trigramas) */}
          {result.trigrams && result.trigrams.length > 0 && (
            <div style={{marginBottom:18}}>
              <b>Trigramas mais frequentes:</b>
              <ul style={{marginTop:6, marginBottom:0, paddingLeft:22}}>
                {result.trigrams.map((t:any, i:number) => (
                  <li key={i}><b>{t.trigram}</b> — {t.count} ocorrências</li>
                ))}
              </ul>
            </div>
          )}
          {/* Sentimento */}
          {result.sentiment && (
            <div style={{marginBottom:18}}>
              <b>Análise de sentimento:</b>
              <ul style={{marginTop:6, marginBottom:0, paddingLeft:22}}>
                <li><b>Polarity:</b> {result.sentiment.polarity}</li>
                <li><b>Subjectivity:</b> {result.sentiment.subjectivity}</li>
              </ul>
            </div>
          )}
          {/* Resultados de análise via R */}
          {result.r_analysis && <RAnalysisView r={result.r_analysis} />}
          {/* Tokens (POS tags, lemma, etc.) */}
          {result.tokens && result.tokens.length > 0 && (
            <div style={{marginBottom:18}}>
              <b>Tokens e classes gramaticais:</b>
              <div style={{overflowX:'auto', marginTop:8}}>
                <table style={{borderCollapse:'collapse', width:'100%', background:'#181818', color:'#fff', fontSize:15}}>
                  <thead>
                    <tr style={{background:'#00eaff22'}}>
                      <th style={{padding:'4px 10px', border:'1px solid #00eaff'}}>Palavra</th>
                      <th style={{padding:'4px 10px', border:'1px solid #00eaff'}}>Lemma</th>
                      <th style={{padding:'4px 10px', border:'1px solid #00eaff'}}>POS</th>
                      <th style={{padding:'4px 10px', border:'1px solid #00eaff'}}>Tag</th>
                      <th style={{padding:'4px 10px', border:'1px solid #00eaff'}}>Dep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.tokens.map((tok:any, i:number) => (
                      <tr key={i}>
                        <td style={{padding:'4px 10px', border:'1px solid #00eaff'}}>{tok.text}</td>
                        <td style={{padding:'4px 10px', border:'1px solid #00eaff'}}>{tok.lemma}</td>
                        <td style={{padding:'4px 10px', border:'1px solid #00eaff'}}>{tok.pos}</td>
                        <td style={{padding:'4px 10px', border:'1px solid #00eaff'}}>{tok.tag}</td>
                        <td style={{padding:'4px 10px', border:'1px solid #00eaff'}}>{tok.dep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      <footer style={styles.footer}>
        powered by Hubstry 2025 | Guilherme Gonçalves Machado
      </footer>
    </div>
  );
}

export default App;
