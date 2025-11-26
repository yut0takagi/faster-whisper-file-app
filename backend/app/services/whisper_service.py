from faster_whisper import WhisperModel
import tempfile
import pathlib
import os
import re

class WhisperService:
    def __init__(self):
        self.model_cache = {}

    def load_model(self, size: str):
        """モデルをロード（キャッシュあり）"""
        if size in self.model_cache:
            return self.model_cache[size]
        
        try:
            import torch
            if torch.cuda.is_available():
                model = WhisperModel(size, device="cuda", compute_type="float16")
            else:
                model = WhisperModel(size, device="cpu", compute_type="int8")
        except Exception:
            model = WhisperModel(size, device="cpu", compute_type="int8")
        
        self.model_cache[size] = model
        return model

    async def transcribe(self, file_content: bytes, filename: str, model_size: str = "base", language: str = "ja"):
        tmp_path = None
        try:
            # 一時ファイルに保存
            suffix = pathlib.Path(filename).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(file_content)
                tmp_path = tmp.name
            
            # モデルをロード
            model = self.load_model(model_size)
            
            # 文字起こし実行
            segments, info = model.transcribe(tmp_path, language=language)
            
            texts = []
            # セグメントを収集
            for seg in segments:
                texts.append(seg.text.strip())
            
            # テキストを整形
            raw_text = " ".join(texts)
            sentences = re.split(r"(?<=[。！？!?])", raw_text)
            formatted = "\n\n".join(s.strip() for s in sentences if s.strip())
            
            return {
                "success": True,
                "transcript": formatted,
                "raw_text": raw_text,
                "duration": info.duration,
                "language": info.language
            }
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

whisper_service = WhisperService()

