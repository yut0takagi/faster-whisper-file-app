# Lightweight Streamlit + faster-whisper runtime
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# System deps: ffmpeg for audio decoding, libgomp for OpenMP (ctranslate2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (better layer cache)
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy app code
COPY whisper_file_app.py ./
COPY readme.md ./

# Expose Streamlit default port
EXPOSE 8501

# Persist model/cache downloads by default to /root/.cache (mountable)
ENV HF_HOME=/root/.cache/huggingface

CMD ["streamlit", "run", "whisper_file_app.py", "--server.port=8501", "--server.address=0.0.0.0"]

