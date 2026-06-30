import logging

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import CORS_ORIGINS
from app.routers import auth, daily_stats, eisenhower, pareto

logger = logging.getLogger("studytimer")

app = FastAPI(title="StudyTimer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(daily_stats.router)
app.include_router(eisenhower.router)
app.include_router(pareto.router)


@app.exception_handler(httpx.HTTPStatusError)
async def httpx_status_handler(request: Request, exc: httpx.HTTPStatusError):
    # Forward the upstream HTTP status so the frontend can react correctly.
    # Most importantly, a 401 from Supabase (expired token) must reach the
    # frontend as 401 — not swallowed into 500 — so fetchWithAuth can trigger
    # a token refresh and retry automatically.
    status = exc.response.status_code
    logger.warning(
        "Upstream %s on %s %s", status, request.method, request.url.path
    )
    return JSONResponse(
        status_code=status,
        content={"detail": f"Upstream error {status}"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, _exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


@app.get("/health")
def health():
    return {"status": "ok"}
