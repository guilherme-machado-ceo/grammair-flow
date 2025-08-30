

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from textblob import TextBlob
import logging
import rpy2.robjects as robjects
from rpy2.robjects.packages import importr
from rpy2.robjects import StrVector

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

        # Sugestão contextual simples: identificar frases longas
        suggestions = []
        for sent in doc.sents:
            if len(sent.text.split()) > 25:
                suggestions.append(f"Frase longa detectada: '{sent.text[:40]}...' Considere dividir para maior clareza.")

        # Integração real com R: análise de frequência de palavras
        try:
            logger.info("Executando análise de frequência de palavras em R...")
            # Divide o texto em palavras
            words = [token.text for token in doc if token.is_alpha]
            r_words = StrVector(words)
            robjects.r('library(dplyr)')
            robjects.r('library(tibble)')
            robjects.r('library(tidyr)')
            robjects.r('library(stringr)')
            robjects.globalenv['words'] = r_words
            freq_table = robjects.r('as.data.frame(table(words))')
            freq_table = robjects.r('freq_table[order(-freq_table$Freq),]')
            # Pega as 5 palavras mais frequentes
            top_words = robjects.r('head(freq_table, 5)')
            top_words_dict = {
                'word': list(top_words[0]),
                'freq': list(top_words[1])
            }
            logger.info(f"Top palavras R: {top_words_dict}")
        except Exception as rerr:
            logger.error(f"Erro na integração com R: {rerr}")
            top_words_dict = {"error": str(rerr)}

        return {
            "original": req.text,
            "word_count": len(doc),
            "sentences": sentences,
            "tokens": tokens,
            "sentiment": {
                "polarity": sentiment.polarity,
                "subjectivity": sentiment.subjectivity
            },
            "suggestions": suggestions,
            "r_analysis": top_words_dict,
            "insight": "Análise gramatical, de sentimento (pt-br) e frequência de palavras via R."
        }
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        return {"error": str(e)}
