

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from textblob import TextBlob

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp = spacy.load("en_core_web_sm")

@app.get("/")
def read_root():
    return {"message": "Hello from grammair-flow backend!"}

class AnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze_text(req: AnalyzeRequest):
    doc = nlp(req.text)
    tokens = [
        {"text": token.text, "lemma": token.lemma_, "pos": token.pos_, "tag": token.tag_, "dep": token.dep_}
        for token in doc
    ]
    sentences = [sent.text for sent in doc.sents]
    blob = TextBlob(req.text)
    sentiment = blob.sentiment
    return {
        "original": req.text,
        "word_count": len(doc),
        "sentences": sentences,
        "tokens": tokens,
        "sentiment": {
            "polarity": sentiment.polarity,
            "subjectivity": sentiment.subjectivity
        },
        "insight": "Análise gramatical e de sentimento realizada com spaCy e TextBlob."
    }
