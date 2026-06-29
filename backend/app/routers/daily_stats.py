from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.deps import AuthedUser, get_authed_user

router = APIRouter(prefix="/daily-stats", tags=["daily-stats"])


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
    result = (
        authed.client.table("daily_stats")
        .select("*")
        .eq("user_id", authed.user_id)
        .eq("date", today)
        .maybe_single()
        .execute()
    )
    if result and result.data:
        return result.data
    return {
        "user_id": authed.user_id,
        "date": today,
        "focus_minutes": 0,
        "tasks_completed": 0,
    }


@router.get("/today", response_model=DailyStats)
def get_today(authed: AuthedUser = Depends(get_authed_user)):
    return _today_row(authed)


@router.get("/history", response_model=list[DailyStats])
def get_history(authed: AuthedUser = Depends(get_authed_user)):
    result = (
        authed.client.table("daily_stats")
        .select("date, focus_minutes, tasks_completed")
        .eq("user_id", authed.user_id)
        .order("date")
        .execute()
    )
    return result.data


@router.post("/focus-minutes", response_model=DailyStats)
def add_focus_minutes(
    payload: FocusMinutesPayload, authed: AuthedUser = Depends(get_authed_user)
):
    row = _today_row(authed)
    row["focus_minutes"] += payload.minutes
    authed.client.table("daily_stats").upsert(row).execute()
    return row


@router.post("/tasks-completed", response_model=DailyStats)
def adjust_tasks_completed(
    payload: TasksCompletedDeltaPayload, authed: AuthedUser = Depends(get_authed_user)
):
    row = _today_row(authed)
    row["tasks_completed"] = max(0, row["tasks_completed"] + payload.delta)
    authed.client.table("daily_stats").upsert(row).execute()
    return row
