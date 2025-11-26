from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.requests import GenerateMinutesRequest
from app.services.whisper_service import whisper_service
from app.services.lmstudio_service import lmstudio_service

router = APIRouter()

@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    model_size: str = "base",
    language: str = "ja"
):
    """音声ファイルを文字起こし"""
    try:
        content = await file.read()
        return await whisper_service.transcribe(
            content, 
            file.filename, 
            model_size, 
            language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-minutes")
async def generate_minutes(request: GenerateMinutesRequest):
    """議事録を生成"""
    if not request.model_name:
        raise HTTPException(status_code=400, detail="モデル名が指定されていません")
    
    return lmstudio_service.generate_minutes(
        request.transcript,
        request.api_url,
        request.model_name
    )

@router.get("/test-connection")
async def test_connection(api_url: str, model_name: str):
    """LMStudio APIへの接続をテスト"""
    if not model_name:
        raise HTTPException(status_code=400, detail="モデル名が指定されていません")
    
    return lmstudio_service.test_connection(api_url, model_name)

@router.get("/models")
async def get_models(api_url: str):
    """利用可能なモデル一覧を取得"""
    return lmstudio_service.get_models(api_url)

