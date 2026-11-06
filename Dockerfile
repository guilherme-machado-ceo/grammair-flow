# Imagem única do GrammAIr Flow para o AWS Lambda.
# A interface React é compilada e servida pelo próprio FastAPI.
# O AWS Lambda Web Adapter traduz os eventos do Lambda em requisições HTTP.

# --- Etapa 1: compila a interface ---
FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
# Base vazia: a interface chama a API no mesmo endereço.
ENV VITE_API_BASE=""
RUN npm run build

# --- Etapa 2: backend em Python com R ---
FROM python:3.11-slim-bookworm
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        r-base r-base-dev build-essential gfortran \
        libcurl4-openssl-dev libssl-dev libxml2-dev libicu-dev \
        libfontconfig1-dev libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Pacotes de R usados em backend/r_analysis.py.
# O Posit Package Manager entrega binários para Debian 12 quando existem.
RUN Rscript -e "options(repos=c(CRAN='https://packagemanager.posit.co/cran/__linux__/bookworm/latest'), HTTPUserAgent=sprintf('R/%s R (%s)', getRversion(), paste(getRversion(), R.version\$platform, R.version\$arch, R.version\$os))); install.packages(c('quanteda','quanteda.textstats'), Ncpus=4); stopifnot(requireNamespace('quanteda.textstats', quietly=TRUE))"

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m spacy download pt_core_news_sm \
    && python -m nltk.downloader -d /usr/local/share/nltk_data cmudict

COPY backend/ ./
COPY --from=frontend /frontend/dist ./static

# Adaptador do Lambda (porta 8000 e verificação de prontidão em /health).
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_PORT=8000 \
    AWS_LWA_READINESS_CHECK_PATH=/health \
    HOME=/tmp TMPDIR=/tmp MPLCONFIGDIR=/tmp/matplotlib MPLBACKEND=Agg \
    PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
