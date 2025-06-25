import streamlit as st
from faster_whisper import WhisperModel
import tempfile, pathlib, uuid, re, os
import time

st.set_page_config(page_title="Faster-Whisper Transcriber", page_icon="⏱️")

st.title("voice2text with Faster-Whisper")

st.markdown("""
1. 音声ファイルをアップロード
2. 進捗バーで処理状況を可視化
3. 結果を Markdown でダウンロード
""")

# -------- モデルロード（キャッシュ） --------
@st.cache_resource(show_spinner=True)
def load_model(size: str):
    try:
        import torch
        if torch.cuda.is_available():
            return WhisperModel(size, device="cuda", compute_type="float16")
    except Exception:
        pass
    return WhisperModel(size, device="cpu", compute_type="int8")

size_opt = st.selectbox("モデルサイズ", ["tiny", "base", "small", "medium", "large"], index=1)
model = load_model(size_opt)

uploaded = st.file_uploader("音声ファイルを選択", type=["wav", "mp3", "m4a", "aac", "flac", "ogg"])

if uploaded:
    suffix = pathlib.Path(uploaded.name).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(uploaded.read())
        tmp_path = pathlib.Path(tmp.name)

    st.info("文字起こし中…")
    progress = st.progress(0)
    status   = st.empty()

    segments, info = model.transcribe(str(tmp_path), language="ja")
    total_sec = info.duration
    processed = 0.0
    texts = []

    for seg in segments:
        texts.append(seg.text.strip())
        processed = seg.end  # 秒
        pct = min(processed / total_sec, 1.0)
        progress.progress(pct)
        status.write(f"{pct*100:5.1f}%  ({processed:.1f}s / {total_sec:.1f}s)")

    progress.progress(1.0)
    status.write("完了！")

    raw_text = " ".join(texts)
    sentences = re.split(r"(?<=[。！？!?])", raw_text)
    formatted = "\n\n".join(s.strip() for s in sentences if s.strip())  # 文＋空行

    md_name = f"transcript_{uuid.uuid4().hex[:8]}.md"
    md_path = pathlib.Path(tempfile.gettempdir()) / md_name
    md_path.write_text(formatted, encoding="utf-8")

    st.text_area("📝 プレビュー", formatted, height=300)
    st.download_button("📥 Markdown をダウンロード", md_path.read_bytes(), file_name=md_name, mime="text/markdown")

    os.remove(tmp_path)