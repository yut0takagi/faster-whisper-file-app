import requests
from fastapi import HTTPException

class LMStudioService:
    @staticmethod
    def generate_minutes(transcript: str, api_url: str, model_name: str):
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
{transcript}
"""
        try:
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

    @staticmethod
    def test_connection(api_url: str, model_name: str):
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

    @staticmethod
    def get_models(api_url: str):
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

lmstudio_service = LMStudioService()

