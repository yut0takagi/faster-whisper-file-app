# 🎧 Faster-Whisper File Transcriber

A lightweight Streamlit app that lets anyone **upload an audio file and receive a sentence‑split Japanese transcription in Markdown format**.
Runs entirely on your local machine—no keys, no OpenAI API, no server fees.

---

## ✨ Features

| Feature                | Description                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **📤 File upload**     | Accepts `.wav`, `.mp3`, `.m4a`, `.aac`, `.flac`, `.ogg`                                                             |
| **🚀 Faster‑Whisper**  | Uses [faster‑whisper](https://github.com/guillaumekln/faster-whisper) for 2‑3× CPU speed‑up (and optional GPU FP16) |
| **📊 Progress bar**    | Real‑time progress (% & processed seconds) while transcribing                                                       |
| **🔀 Model chooser**   | Select `tiny` / `base` / `small` / `medium` / `large` before running                                                |
| **📝 Markdown output** | Sentences split on `。！？!?`, converted to `.md` and downloadable                                                     |
| **🗑️ Auto cleanup**   | Temporary audio files deleted after each run                                                                        |

---

## 🖥️ Demo (GIF)

![demo gif](docs/demo.png)

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yut0takagi/faster-whisper-file-app.git
cd faster-whisper-file-app

# 2. Install deps (CPU‑only)
pip install -r requirements.txt

#  └── want GPU?  Make sure torch+CUDA is installed first, then:
#      pip install "faster-whisper[gpu]"

# 3. Launch the app (port 8501)
streamlit run whisper_file_app.py
```

> **Tip:** First run downloads the model (\~75 MB for `base`).  Subsequent runs are instant.

---

## 🐳 Docker

Build once, then run on port 8501:

```bash
# Build
docker build -t faster-whisper-file-app .

# Run (CPU)
docker run --rm -p 8501:8501 \
  -v fw_cache:/root/.cache \
  --name fw-app faster-whisper-file-app

# Optional: Run with NVIDIA GPU
# Requires recent NVIDIA drivers + nvidia-container-toolkit
docker run --rm -p 8501:8501 \
  --gpus all \
  -v fw_cache:/root/.cache \
  --name fw-app-gpu faster-whisper-file-app
```

Or use Compose:

```bash
docker compose up --build
# then visit http://localhost:8501
```

Models and tokenizer files are cached under `/root/.cache` and persisted via the named volume (`fw_cache` or `model_cache` in compose).

---

## 📂 Project Structure

```
├─ whisper_file_app.py   # Streamlit UI + transcribe logic
├─ requirements.txt      # faster‑whisper, streamlit, etc.
├─ README.md             # ← you are here
└─ docs/
   └─ demo.gif           # optional demo screenshot
```

---

## ⚙️ Environment Notes

| Hardware               | Recommended `compute_type`          |
| ---------------------- | ----------------------------------- |
| CPU only               | `int8` (auto‑selected)              |
| NVIDIA GPU             | `float16` (auto if CUDA present)    |
| Apple Silicon M‑series | works via CPU `int8` (no Metal yet) |

If faster‑whisper cannot detect a GPU, it silently falls back to `int8` CPU and shows a small warning; performance remains usable for 1‑10 min files.

---

## ✂️ Sentence Split Logic

```python
sentences = re.split(r"(?<=[。！？!?])", raw_text)
formatted  = "\n\n".join(s.strip() for s in sentences if s.strip())
```

Feel free to tweak the regex if you need tighter segmentation.

---

## 📜 License

MIT © 2025 \Yuto TAKAGI

---

## 🙏 Acknowledgements

* [faster‑whisper](https://github.com/guillaumekln/faster-whisper) – blazing‑fast Whisper inference
* [Streamlit](https://streamlit.io) – simplest way to build ML front‑ends
* [OpenAI Whisper models](https://github.com/openai/whisper) – base acoustic/language models
