from r_analysis import r_stats, r_histogram, r_readability, r_cooccurrence


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from textblob import TextBlob
import logging
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import textstat
import nltk
from collections import Counter
import io
import base64

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    logger.info("Carregando modelo spaCy pt_core_news_sm...")
    nlp = spacy.load("pt_core_news_sm")
    logger.info("Modelo spaCy carregado com sucesso.")
except Exception as e:
    logger.error(f"Erro ao carregar spaCy: {e}")
    nlp = None

@app.get("/")
def read_root():
    return {"message": "Hello from grammair-flow backend!"}

class AnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_text(req: AnalyzeRequest):
    logger.info("Recebendo texto para análise.")
    if nlp is None:
        logger.error("Modelo spaCy não carregado.")
        return {"error": "Modelo spaCy não carregado."}
    try:
        doc = nlp(req.text)
        logger.info("spaCy processou o texto.")
        tokens = [
            {"text": token.text, "lemma": token.lemma_, "pos": token.pos_, "tag": token.tag_, "dep": token.dep_}
            for token in doc
        ]
        sentences = [sent.text for sent in doc.sents]
        blob = TextBlob(req.text)
        sentiment = blob.sentiment
        logger.info("TextBlob processou o texto.")

        # Estatísticas Python
        words = [token.text for token in doc if token.is_alpha]
        word_lengths = [len(w) for w in words]
        sentence_lengths = [len(sent.split()) for sent in sentences]
        stats = {
            "num_words": len(words),
            "num_sentences": len(sentences),
            "mean_word_length": np.mean(word_lengths) if word_lengths else 0,
            "median_word_length": np.median(word_lengths) if word_lengths else 0,
            "mean_sentence_length": np.mean(sentence_lengths) if sentence_lengths else 0,
            "median_sentence_length": np.median(sentence_lengths) if sentence_lengths else 0,
            "word_length_variance": np.var(word_lengths) if word_lengths else 0,
            "sentence_length_variance": np.var(sentence_lengths) if sentence_lengths else 0
        }

        # Histogramas (palavras por frase)
        plt.figure(figsize=(6, 3))
        sns.histplot(sentence_lengths, bins=10, kde=False, color='#00eaff')
        plt.title('Distribuição do comprimento das frases')
        plt.xlabel('Palavras por frase')
        plt.ylabel('Frequência')
        buf = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        hist_base64 = base64.b64encode(buf.read()).decode('utf-8')

        # Legibilidade
        readability = {
            "flesch_reading_ease": textstat.flesch_reading_ease(req.text),
            "gunning_fog": textstat.gunning_fog(req.text),
            "smog_index": textstat.smog_index(req.text),
            "automated_readability_index": textstat.automated_readability_index(req.text)
        }

        # Coocorrência (pares de palavras)
        bigrams = list(nltk.bigrams(words))
        bigram_freq = Counter(bigrams).most_common(10)
        bigram_freq = [
            {"pair": f"{w1} {w2}", "count": count}
            for (w1, w2), count in bigram_freq
        ]

        # N-gramas (trigramas)
        trigrams = list(nltk.trigrams(words))
        trigram_freq = Counter(trigrams).most_common(10)
        trigram_freq = [
            {"trigram": f"{w1} {w2} {w3}", "count": count}
            for (w1, w2, w3), count in trigram_freq
        ]

        # Sugestão contextual simples: identificar frases longas
        suggestions = []
        for sent in doc.sents:
            if len(sent.text.split()) > 25:
                suggestions.append(f"Frase longa detectada: '{sent.text[:40]}...' Considere dividir para maior clareza.")

        # --- Análises R robustas e isoladas ---
        r_results = {}
        # Estatísticas R
        try:
            r_results['stats_r'] = r_stats(words, sentences)
        except Exception as e:
            r_results['stats_r'] = {'error': str(e)}
        # Histograma R
        try:
            r_results['histogram_r'] = r_histogram(sentence_lengths)
        except Exception as e:
            r_results['histogram_r'] = {'error': str(e)}
        # Legibilidade R
        try:
            r_results['readability_r'] = r_readability(req.text)
        except Exception as e:
            r_results['readability_r'] = {'error': str(e)}
        # Coocorrência R
        try:
            r_results['cooccurrence_r'] = r_cooccurrence(words)
        except Exception as e:
            r_results['cooccurrence_r'] = {'error': str(e)}

        return {
            "tokens": tokens,
            "sentences": sentences,
            "sentiment": {"polarity": sentiment.polarity, "subjectivity": sentiment.subjectivity},
            "suggestions": suggestions,
            "stats": stats,
            "histogram_base64": hist_base64,
            "readability": readability,
            "bigrams": bigram_freq,
            "trigrams": trigram_freq,
            "r_analysis": r_results
        }
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        return {"error": str(e)}
