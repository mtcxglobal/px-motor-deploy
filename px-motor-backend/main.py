from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # İleride sadece frontend domainini bırakırız
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"message": "pong"}


# ----- PX Motor endpoint şeması -----

class PxMessage(BaseModel):
    role: str
    content: str

class PxChatRequest(BaseModel):
    session_id: Optional[str] = None
    mode: Optional[str] = None
    messages: List[PxMessage]


class PxChatResponse(BaseModel):
    reply: str


@app.post("/api/px-chat", response_model=PxChatResponse)
def px_chat(req: PxChatRequest):
    # Şimdilik en sondaki kullanıcı mesajını alalım
    last_user_message = ""
    for m in reversed(req.messages):
        if m.role == "user":
            last_user_message = m.content
            break

    if not last_user_message:
        last_user_message = "(kullanıcı mesajı bulunamadı)"

    reply_text = f"PX Motor test yanıtı: Son kullanıcı mesajını aldım → '{last_user_message}'"

    return PxChatResponse(reply=reply_text)


# Eski basit test endpoint’in kalsın istersen
@app.post("/chat")
def simple_chat(payload: dict):
    message = payload.get("message", "")
    return {"reply": f"PX Motor basit test: '{message}'"}
