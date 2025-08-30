
FROM python:3.11-slim
WORKDIR /app

# Instalar dependências de sistema e R
RUN apt-get update && apt-get install -y \
	build-essential \
	python3-dev \
	python3-pip \
	python3-setuptools \
	python3-wheel \
	libffi-dev \
	libssl-dev \
	libxml2-dev \
	libxslt1-dev \
	libpq-dev \
	libbz2-dev \
	liblzma-dev \
	libz-dev \
	libreadline-dev \
	libsqlite3-dev \
	libgfortran5 \
	libopenblas-dev \
	liblapack-dev \
	gfortran \
	gcc \
	r-base \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
