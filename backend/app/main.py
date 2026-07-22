from keys import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.research import router as research_router


app = FastAPI(title="Multi-Agent Research Assistant API")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if settings.frontend_url:
    ALLOWED_ORIGINS.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(research_router, prefix="/api")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
