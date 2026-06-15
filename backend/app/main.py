"""
Eason Music Clinic — FastAPI Backend
=====================================
Fan-made music prescription API. No database, no AI model — just
JSON data, keyword matching, and a lot of heart.

Run with:
    uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.prescription import router


app = FastAPI(
    title="陈医生音乐门诊 API",
    description="Eason Music Clinic — A fan-made music prescription service.",
    version="1.0.0",
)

# CORS: allow frontend dev server + production URL from env
import os
from dotenv import load_dotenv
load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL,
        # Vercel preview deployments
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "陈医生音乐门诊",
        "status": "陈医生正在值班中",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
