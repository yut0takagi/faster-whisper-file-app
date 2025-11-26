from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import tempfile
import pathlib
import re
import uuid
import requests
import json
from faster_whisper import WhisperModel
import asyncio
import os

app = FastAPI(title="Faster-Whisper API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://frontend:3000",  # Docker内部通信用
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# モデルキャッシュ
model_cache = {}

class TranscribeRequest(BaseModel):
    model_size: str = "base"
    language: str = "ja"

class GenerateMinutesRequest(BaseModel):
    transcript: str
    api_url: str
    model_name: str

def load_model(size: str):
    """モデルをロード（キャッシュあり）"""
    if size in model_cache:
        return model_cache[size]
    
    try:
        import torch
        if torch.cuda.is_available():
            model = WhisperModel(size, device="cuda", compute_type="float16")
        else:
            model = WhisperModel(size, device="cpu", compute_type="int8")
    except Exception:
        model = WhisperModel(size, device="cpu", compute_type="int8")
    
    model_cache[size] = model
    return model

@app.get("/")
async def root():
    return {"message": "Faster-Whisper API"}

@app.post("/api/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    model_size: str = "base",
    language: str = "ja"
):
    """音声ファイルを文字起こし"""
    try:
        # 一時ファイルに保存
        suffix = pathlib.Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # モデルをロード
        model = load_model(model_size)
        
        # 文字起こし実行
        segments, info = model.transcribe(tmp_path, language=language)
        total_sec = info.duration
        processed = 0.0
        texts = []
        
        # セグメントを収集
        for seg in segments:
            texts.append(seg.text.strip())
            processed = seg.end
        
        # 一時ファイルを削除
        os.remove(tmp_path)
        
        # テキストを整形
        raw_text = " ".join(texts)
        sentences = re.split(r"(?<=[。！？!?])", raw_text)
        formatted = "\n\n".join(s.strip() for s in sentences if s.strip())
        
        return {
            "success": True,
            "transcript": formatted,
            "raw_text": raw_text,
            "duration": total_sec,
            "language": info.language
        }
    except Exception as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-minutes")
async def generate_minutes(request: GenerateMinutesRequest):
    """議事録を生成"""
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
{request.transcript}
"""
    
    if not request.model_name:
        raise HTTPException(status_code=400, detail="モデル名が指定されていません")
    
    try:
        headers = {
            "Content-Type": "application/json"
        }
        response = requests.post(
            request.api_url,
            json={
                "model": request.model_name,
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
        return {
            "success": True,
            "minutes": result["choices"][0]["message"]["content"]
        }
    except requests.exceptions.HTTPError as e:
        error_text = e.response.text[:1000] if e.response.text else "レスポンス本文なし"
        raise HTTPException(
            status_code=e.response.status_code,
            detail={
                "error": str(e),
                "response": error_text
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-connection")
async def test_connection(api_url: str, model_name: str):
    """LMStudio APIへの接続をテスト"""
    if not model_name:
        raise HTTPException(status_code=400, detail="モデル名が指定されていません")
    
    try:
        headers = {
            "Content-Type": "application/json"
        }
        response = requests.post(
            api_url,
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 10
            },
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        return {
            "success": True,
            "message": "API接続成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_models(api_url: str):
    """利用可能なモデル一覧を取得"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(api_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        models_url = f"{base_url}/v1/models"
        
        response = requests.get(models_url, timeout=5)
        response.raise_for_status()
        result = response.json()
        
        if "data" in result:
            models = [model["id"] for model in result["data"]]
            return {
                "success": True,
                "models": models
            }
        return {
            "success": False,
            "models": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

