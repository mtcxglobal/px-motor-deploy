from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PX Motor Backend")

# Şimdilik basit CORS: her yerden erişime izin veriyoruz
# Bunu prod'a çıkınca sıkılaştıracağız.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # sonra buraya frontend adresini yazacağız
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/px/run")
async def run_px(payload: dict):
    """
    Şimdilik sadece gelen veriyi geri döndüren demo endpoint.
    Buraya senin PX hesaplama mantığını adım adım taşıyacağız.
    """
    # Buraya ileride gerçek PX motor hesaplarını ekleyeceğiz.
    return {
        "ok": True,
        "message": "PX motor demo cevabı",
        "received": payload,
    }
