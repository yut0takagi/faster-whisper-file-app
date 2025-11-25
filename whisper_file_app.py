import streamlit as st
from faster_whisper import WhisperModel
import tempfile, pathlib, uuid, re, os
import time
import requests

st.set_page_config(page_title="Faster-Whisper Transcriber", page_icon="⏱️")

st.title("voice2text with Faster-Whisper")

st.markdown("""
1. 音声ファイルをアップロード
2. 進捗バーで処理状況を可視化
3. 結果を Markdown でダウンロード
4. 議事録としてまとめる（LMStudio API使用）
""")

# -------- LMStudio API設定 --------
st.sidebar.header("⚙️ 設定")
lmstudio_url = st.sidebar.text_input(
    "LMStudio API URL",
    value="http://localhost:1234/v1/chat/completions",
    help="LMStudioでAPIサーバーを起動した際のURLを入力してください"
)
enable_minutes = st.sidebar.checkbox("議事録を自動生成", value=False, help="文字起こし完了後に自動で議事録を生成します")
lmstudio_model = st.sidebar.text_input(
    "LMStudio モデル名",
    value="openai/gpt-oss-20b",
    help="LMStudioで利用可能なモデル名を入力してください（例: openai/gpt-oss-20b）"
)

# -------- 利用可能なモデルを取得する機能 --------
def get_available_models(api_url: str) -> list[str]:
    """LMStudio APIから利用可能なモデル一覧を取得"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(api_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        models_url = f"{base_url}/v1/models"
        
        response = requests.get(models_url, timeout=5)
        response.raise_for_status()
        result = response.json()
        
        if "data" in result:
            return [model["id"] for model in result["data"]]
        return []
    except Exception:
        return []

if st.sidebar.button("📋 利用可能なモデルを取得"):
    with st.sidebar:
        with st.spinner("モデル一覧を取得中..."):
            from urllib.parse import urlparse
            parsed = urlparse(lmstudio_url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            models = get_available_models(lmstudio_url)
            if models:
                st.success(f"利用可能なモデル:\n" + "\n".join(f"- {m}" for m in models))
                if not lmstudio_model and models:
                    st.info(f"💡 最初のモデル '{models[0]}' を自動設定しますか？")
            else:
                st.warning("モデル一覧の取得に失敗しました。手動でモデル名を入力してください。")

# -------- API接続テスト機能 --------
def test_api_connection(api_url: str, model_name: str) -> tuple[bool, str]:
    """LMStudio APIへの接続をテスト"""
    if not model_name:
        return False, "❌ エラー: モデル名が指定されていません。サイドバーでモデル名を入力してください。"
    
    try:
        # まず、ベースURLにアクセスできるか確認
        from urllib.parse import urlparse
        parsed = urlparse(api_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        
        # ヘルスチェック用の軽いリクエスト（POSTメソッドを明示）
        headers = {
            "Content-Type": "application/json"
        }
        test_response = requests.post(
            api_url,
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 10
            },
            headers=headers,
            timeout=10
        )
        test_response.raise_for_status()
        result = test_response.json()
        return True, f"✅ API接続成功\n\n使用URL: {api_url}\n使用モデル: {model_name}\nリクエストメソッド: POST"
    except requests.exceptions.ConnectionError as e:
        error_detail = str(e)
        return False, f"""❌ 接続失敗

**エラー詳細:**
{error_detail}

**確認事項:**
1. LMStudioの「Local Server」タブで「Start Server」ボタンが押されているか確認
2. サーバーが起動している場合、表示されているポート番号を確認（例: http://localhost:1234）
3. 現在のAPI URL: {api_url}
4. ポート番号が異なる場合は、サイドバーのAPI URLを変更してください

**LMStudioでの確認方法:**
- 右側の「Local Server」タブを開く
- 「Start Server」ボタンをクリック
- サーバーが起動すると、URLが表示されます（例: http://localhost:1234）
- そのURLに `/v1/chat/completions` を追加したものがAPI URLです"""
    except requests.exceptions.Timeout:
        return False, f"❌ タイムアウト: APIサーバーへの応答がありません（10秒以内に応答なし）\n\n使用URL: {api_url}\n\nサーバーが起動しているか、ポート番号が正しいか確認してください。"
    except requests.exceptions.HTTPError as e:
        error_text = e.response.text[:1000] if e.response.text else "レスポンス本文なし"
        # エラーメッセージから利用可能なモデルを抽出
        available_models = []
        if "Your models:" in error_text or "not found" in error_text.lower():
            import re
            # モデル名のパターンを探す（例: openai/gpt-oss-20b）
            model_pattern = r'([a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+(?::\d+)?)'
            found_models = re.findall(model_pattern, error_text)
            available_models = [m for m in found_models if '/' in m]
        
        error_msg = f"❌ HTTPエラー: {e.response.status_code} {e.response.reason}\n\n使用URL: {api_url}\n使用モデル: {model_name}\nリクエストメソッド: POST\n\n**エラー詳細:**\n{error_text}"
        if available_models:
            error_msg += f"\n\n💡 利用可能なモデル:\n" + "\n".join(f"- {m}" for m in available_models)
            error_msg += "\n\nサイドバーでモデル名を入力してください。"
        elif e.response.status_code == 400:
            error_msg += "\n\n💡 400 Bad Requestエラーの場合、以下の可能性があります:\n"
            error_msg += "1. リクエストの形式が正しくない\n"
            error_msg += "2. 必須パラメータが欠けている\n"
            error_msg += "3. モデル名が正しくない\n"
            error_msg += "4. LMStudioのAPIバージョンが異なる\n\n"
            error_msg += "LMStudioのログを確認して、詳細なエラー内容を確認してください。"
        return False, error_msg
    except requests.exceptions.RequestException as e:
        return False, f"❌ エラー: {str(e)}\n\n使用URL: {api_url}"

if st.sidebar.button("🔌 API接続をテスト"):
    with st.sidebar:
        with st.spinner("接続確認中..."):
            success, message = test_api_connection(lmstudio_url, lmstudio_model)
            if success:
                st.success(message)
            else:
                st.error(message)
                st.info("💡 ヒント: LMStudioの「Local Server」タブで表示されているURLを確認してください")

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

# -------- 議事録生成関数 --------
def generate_minutes(transcript_text: str, api_url: str, model_name: str) -> str:
    """LMStudio APIを使って議事録を生成"""
    prompt = f"""以下の文字起こしテキストを議事録として整理してください。
以下の形式で出力してください：

# 議事録

## 日時
（記載があれば）

## 出席者
（記載があれば）

## 議題
（記載があれば）

## 議事内容
（要点をまとめて）

## 決定事項
（記載があれば）

## アクションアイテム
（記載があれば）

## その他
（記載があれば）

---

文字起こしテキスト：
{transcript_text}
"""
    
    if not model_name:
        return "❌ エラー: モデル名が指定されていません。サイドバーでLMStudioのモデル名を入力してください。"
    
    try:
        # POSTメソッドを明示的に使用（ヘッダーも明示）
        headers = {
            "Content-Type": "application/json"
        }
        response = requests.post(
            api_url,
            json={
                "model": model_name,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2000
            },
            headers=headers,
            timeout=120
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError as e:
        return f"""❌ エラー: LMStudio APIへの接続に失敗しました。

**エラー内容:**
{str(e)}

**確認事項:**
1. LMStudioを開いているか確認してください
2. LMStudioのメニューから「Start Server」をクリックしてAPIサーバーを起動してください
3. サイドバーの「🔌 API接続をテスト」ボタンで接続を確認してください
4. API URLが正しいか確認してください（デフォルト: http://localhost:1234/v1/chat/completions）
5. ポート番号が変更されている場合は、LMStudioの設定を確認してください

**LMStudioでのAPIサーバー起動方法:**
- LMStudioを開く
- 上部メニューから「Server」→「Start Server」を選択
- または、右側の「Local Server」タブで「Start Server」ボタンをクリック"""
    except requests.exceptions.Timeout:
        return "❌ エラー: APIサーバーへの応答がタイムアウトしました。LMStudioが応答しているか確認してください。"
    except requests.exceptions.HTTPError as e:
        error_text = e.response.text[:1000] if e.response.text else "レスポンス本文なし"
        # エラーメッセージから利用可能なモデルを抽出
        available_models = []
        if "Your models:" in error_text or "not found" in error_text.lower():
            import re
            model_pattern = r'([a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+(?::\d+)?)'
            found_models = re.findall(model_pattern, error_text)
            available_models = [m for m in found_models if '/' in m]
        
        error_msg = f"❌ HTTPエラー: {e.response.status_code} {e.response.reason}\n\n使用URL: {api_url}\n使用モデル: {model_name}\n\n**エラー詳細:**\n{error_text}"
        if available_models:
            error_msg += f"\n\n💡 利用可能なモデル:\n" + "\n".join(f"- {m}" for m in available_models)
            error_msg += "\n\nサイドバーで正しいモデル名を入力してください。"
        elif e.response.status_code == 400:
            error_msg += "\n\n💡 400 Bad Requestエラーの場合、以下の可能性があります:\n"
            error_msg += "1. リクエストの形式が正しくない\n"
            error_msg += "2. 必須パラメータが欠けている\n"
            error_msg += "3. モデル名が正しくない\n"
            error_msg += "4. LMStudioのAPIバージョンが異なる\n\n"
            error_msg += "LMStudioのログを確認して、詳細なエラー内容を確認してください。"
        return error_msg
    except requests.exceptions.RequestException as e:
        # HTTPError以外のRequestExceptionの場合
        error_detail = str(e)
        if hasattr(e, 'response') and e.response is not None:
            error_detail += f"\n\nレスポンス: {e.response.text[:500]}"
        return f"❌ エラー: LMStudio APIへの接続に失敗しました。\n\n**エラー内容:**\n{error_detail}\n\n**確認事項:**\n1. API URLが正しいか確認してください\n2. LMStudioでAPIサーバーが起動しているか確認してください\n3. モデル名が正しいか確認してください"
    except KeyError as e:
        return f"❌ エラー: APIレスポンスの形式が予期しないものでした。\n\nエラー内容: {str(e)}\n\nレスポンス: {response.text}"

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

    # 議事録生成
    st.divider()
    st.subheader("📋 議事録生成")
    
    if enable_minutes:
        with st.spinner("議事録を生成中..."):
            minutes_text = generate_minutes(formatted, lmstudio_url, lmstudio_model)
    else:
        if st.button("🔍 議事録を生成"):
            with st.spinner("議事録を生成中..."):
                minutes_text = generate_minutes(formatted, lmstudio_url, lmstudio_model)
        else:
            minutes_text = None
    
    if minutes_text:
        st.text_area("📋 議事録プレビュー", minutes_text, height=400)
        
        minutes_name = f"minutes_{uuid.uuid4().hex[:8]}.md"
        minutes_path = pathlib.Path(tempfile.gettempdir()) / minutes_name
        minutes_path.write_text(minutes_text, encoding="utf-8")
        st.download_button("📥 議事録をダウンロード", minutes_path.read_bytes(), file_name=minutes_name, mime="text/markdown")

    os.remove(tmp_path)