from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, daily_stats, eisenhower, pareto

app = FastAPI(title="StudyTimer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(daily_stats.router)
app.include_router(eisenhower.router)
app.include_router(pareto.router)


@app.get("/health")
def health():
    return {"status": "ok"}
