from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import get_db_client
from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/daily-stats", tags=["daily-stats"])
db = get_db_client()


class DailyStats(BaseModel):
    date: str
    focus_minutes: int
    tasks_completed: int


class FocusMinutesPayload(BaseModel):
    minutes: int


class TasksCompletedDeltaPayload(BaseModel):
    delta: int


def _today_row(authed: AuthedUser) -> dict:
    today = date.today().isoformat()
    resp = db.get(
        "/daily_stats",
        params={
            "select": "*",
            "user_id": f"eq.{authed.user_id}",
            "date": f"eq.{today}",
        },
        headers=authed.headers(),
    )
    resp.raise_for_status()
    rows = resp.json()
    if rows:
        return rows[0]
    return {
        "user_id": authed.user_id,
        "date": today,
        "focus_minutes": 0,
        "tasks_completed": 0,
    }


def _upsert_row(authed: AuthedUser, row: dict) -> None:
    resp = db.post(
        "/daily_stats",
        params={"on_conflict": "user_id,date"},
        headers={**authed.headers(), "Prefer": "resolution=merge-duplicates"},
        json=row,
    )
    resp.raise_for_status()


@router.get("/today", response_model=DailyStats)
def get_today(authed: AuthedUser = Depends(get_authed_user)):
    return _today_row(authed)


@router.get("/history", response_model=list[DailyStats])
def get_history(authed: AuthedUser = Depends(get_authed_user)):
    resp = db.get(
        "/daily_stats",
        params={
            "select": "date,focus_minutes,tasks_completed",
            "user_id": f"eq.{authed.user_id}",
            "order": "date",
        },
        headers=authed.headers(),
    )
    resp.raise_for_status()
    return resp.json()


@router.post("/focus-minutes", response_model=DailyStats)
def add_focus_minutes(
    payload: FocusMinutesPayload, authed: AuthedUser = Depends(get_authed_user)
):
    row = _today_row(authed)
    row["focus_minutes"] += payload.minutes
    _upsert_row(authed, row)
    return row


@router.post("/tasks-completed", response_model=DailyStats)
def adjust_tasks_completed(
    payload: TasksCompletedDeltaPayload, authed: AuthedUser = Depends(get_authed_user)
):
    row = _today_row(authed)
    row["tasks_completed"] = max(0, row["tasks_completed"] + payload.delta)
    _upsert_row(authed, row)
    return row
