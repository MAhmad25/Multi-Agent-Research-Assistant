import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas import ResearchRequest
from research_pipeline_stream import stream_research

router = APIRouter()


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event)}\n\n"


def _event_generator(query: str):
    for event in stream_research(query):
        if event.get("type") == "heartbeat":
            yield ": keepalive\n\n"
        else:
            yield _sse(event)


@router.post("/research/stream")
def research_stream(payload: ResearchRequest) -> StreamingResponse:

    return StreamingResponse(
        _event_generator(payload.query),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
