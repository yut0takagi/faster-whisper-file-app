from pydantic import BaseModel

class TranscribeRequest(BaseModel):
    model_size: str = "base"
    language: str = "ja"

class GenerateMinutesRequest(BaseModel):
    transcript: str
    api_url: str
    model_name: str

