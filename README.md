
# GrammAIr® Flow

GrammAIr® Flow é uma plataforma híbrida de análise gramatical, projetada para unir linguística de corpus, inteligência artificial e ciência de dados em um ambiente web moderno. O projeto nasce da necessidade de automatizar e aprofundar a compreensão da linguagem natural, oferecendo recursos avançados para pesquisadores, educadores, desenvolvedores e empresas EdTech.

## Propósito e Diferenciais

O objetivo central do GrammAIr® Flow é proporcionar uma análise linguística robusta, combinando técnicas de PLN (Processamento de Linguagem Natural) com modelos estatísticos e preditivos. A plataforma integra o poder do Python (FastAPI, spaCy, TextBlob) com o ecossistema científico do R, permitindo análises descritivas, preditivas e prescritivas, além de visualizações e relatórios customizados.

**Diferenciais:**
- Suporte completo ao português (spaCy pt_core_news_sm)
- Pipeline linguístico expansível: análise gramatical, sentimento, sugestões contextuais e integração com R
- Interface web responsiva e estilizada (React + Vite)
- Containerização via Docker para fácil deploy
- CI/CD automatizado com GitHub Actions
- Pronto para integração com APIs externas e módulos de IA

## Tecnologias Utilizadas

- **Backend:** FastAPI (Python), spaCy, TextBlob, rpy2 (integração com R)
- **Frontend:** React (TypeScript, Vite), CSS customizado
- **Infraestrutura:** Docker, GitHub Actions (CI/CD)

## Benefícios

- Automatiza a análise e correção gramatical baseada em evidência empírica
- Permite integração com scripts e pacotes estatísticos do R
- Gera insights linguísticos para pesquisa, ensino e aplicações EdTech
- Facilidade de uso via API RESTful e interface web

## Como rodar localmente

1. Clone o repositório:
	```
	git clone https://github.com/guilherme-machado-ceo/grammair-flow.git
	```
2. Instale as dependências do backend:
	```
	cd backend
	python -m venv venv
	venv\Scripts\activate  # Windows
	pip install -r requirements.txt
	python -m spacy download pt_core_news_sm
	```
3. Instale as dependências do frontend:
	```
	cd ../frontend
	npm install
	npm run dev
	```
4. Inicie o backend:
	```
	cd ../backend
	uvicorn main:app --reload --host 0.0.0.0 --port 8000
	```

## Autor
Guilherme Gonçalves Machado | Hubstry Deep Tech 2025
