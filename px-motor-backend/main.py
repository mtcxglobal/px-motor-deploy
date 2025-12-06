from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Şimdilik her yerden isteğe izin veriyoruz (ileride Render domainine daraltırız)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # ileride: ["https://px-motor-frontend.onrender.com"] yaparız
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"message": "pong"}
