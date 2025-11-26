# FastAPI + Faster-Whisper backend
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System deps: ffmpeg for audio decoding, libgomp for OpenMP (ctranslate2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy app code
COPY app ./app

# Expose FastAPI port
EXPOSE 8000

# Persist model/cache downloads
ENV HF_HOME=/root/.cache/huggingface

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

