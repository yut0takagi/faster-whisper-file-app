import streamlit as st
from streamlit_autorefresh import st_autorefresh
import sounddevice as sd
import threading
import queue
import json
import datetime
from vosk import Model, KaldiRecognizer

# ----------------- 設定 -----------------
SAMPLERATE   = 16000
BLOCKSIZE    = 8000          # 0.5 秒
CHANNELS     = 1
BUFFER_BYTES = 320000        # 10 秒分 (16 kHz * 2 byte * 10 秒)
MODEL_PATH   = "model-ja"
DEVICE_ID    = None          # 既定マイク

# ----------------- セッション初期化 -----------------
if "recording" not in st.session_state:
    st.session_state.recording = False
if "transcript" not in st.session_state:
    st.session_state.transcript = ""
if "debug_log" not in st.session_state:
    st.session_state.debug_log = ""

# ----------------- スレッド・キュー -----------------
record_evt   = threading.Event()
result_q     = queue.Queue()
debug_q      = queue.Queue()

# ----------------- 音声認識スレッド -----------------

def recognize_worker():
    print("DEBUG: 音声認識スレッド開始")
    rec = KaldiRecognizer(Model(MODEL_PATH), SAMPLERATE)
    with sd.RawInputStream(samplerate=SAMPLERATE, blocksize=BLOCKSIZE,
                           channels=CHANNELS, dtype="int16", device=DEVICE_ID) as stream:
        buf = b""
        while record_evt.is_set():
            data = bytes(stream.read(BLOCKSIZE)[0])
            buf += data
            debug_q.put(f"{datetime.datetime.now():%H:%M:%S} [DEBUG] recv {len(data)} bytes")
            print(f"{datetime.datetime.now():%H:%M:%S} [DEBUG] recv {len(data)} bytes")
            if len(buf) >= BUFFER_BYTES:
                now = datetime.datetime.now().strftime("%H:%M:%S")
                if rec.AcceptWaveform(buf):
                    txt = json.loads(rec.Result()).get("text", "")
                    if txt:
                        result_q.put(f"[{now}] {txt}")
                        debug_q.put(f"{now} [INFO] AcceptWaveform ✓")
                        print(f"{now} [INFO] AcceptWaveform ✓{txt}")
                else:
                    partial = json.loads(rec.PartialResult()).get("partial", "")
                    debug_q.put(f"{now} [PARTIAL] {partial}")
                    print(f"{now} [PARTIAL] {partial}")
                buf = b""
        print("DEBUG: 音声認識スレッド終了")
        # 終了時の残りバッファ
        if buf and rec.AcceptWaveform(buf):
            now = datetime.datetime.now().strftime("%H:%M:%S")
            txt = json.loads(rec.Result()).get("text", "")
            if txt:
                result_q.put(f"[{now}] {txt}")
                debug_q.put(f"{now} [INFO] Final flush ✓")

# ----------------- UI -----------------
st.title("🎙️ リアルタイム文字起こし（タイムスタンプ＆デバッグ）")

col1, col2 = st.columns(2)

def toggle_rec():
    if record_evt.is_set():
        record_evt.clear()
        st.session_state.recording = False
    else:
        record_evt.set()
        st.session_state.recording = True
        threading.Thread(target=recognize_worker, daemon=True).start()

col1.button("🔴 録音開始 / 停止", on_click=toggle_rec)

# 自動リフレッシュ（録音中のみ 1 秒間隔で UI 更新）
if st.session_state.recording:
    st_autorefresh(interval=1000, key="autorefr")

# キューから結果反映
while not result_q.empty():
    st.session_state.transcript += result_q.get() + "\n"
while not debug_q.empty():
    st.session_state.debug_log += debug_q.get() + "\n"

st.text_area("📝 書き起こし結果", st.session_state.transcript, height=250)
st.text_area("🐞 デバッグログ", st.session_state.debug_log, height=200)

st.caption("10 秒バッファで認識。録音中はデバッグにバイト数などを表示します。")