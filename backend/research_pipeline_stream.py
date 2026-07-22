"""
Streaming variant of research_pipeline.py.

research_pipeline.research() is used by the CLI (main.py) and stays untouched.
This module wraps the same three agents (search -> reader -> critic) but runs
them on a background thread and emits fine-grained events onto a queue as they
happen, so a FastAPI endpoint can forward them to the frontend in real time
over Server-Sent Events.

Event shapes (all dicts, JSON-serializable):
    {"type": "phase_start", "phase": "search" | "reader" | "critic"}
    {"type": "tool_call",   "phase": ..., "call_id": str, "tool": str, "detail": str}
    {"type": "tool_result", "phase": ..., "call_id": str}
    {"type": "tool_error",  "phase": ..., "call_id": str, "message": str}
    {"type": "phase_end",   "phase": ...}
    {"type": "final",       "report": str}
    {"type": "error",       "message": str}
    {"type": "done"}

Only raw, semantic facts are put on the queue - no display copy. The frontend
owns how each phase/tool is labeled and iconified.
"""

from __future__ import annotations

import ast
import queue
import threading
from typing import Iterator

from langchain_core.callbacks.base import BaseCallbackHandler

from agents.critic_agent import run_critic
from agents.reader_agent import run_reader
from agents.search_agent import run_search

PHASES = ("search", "reader", "critic")


def _stringify_tool_input(input_str: object) -> str:
    """LangChain passes tool input as a Python-repr'd string, e.g.
    "{'query': 'hello world'}" - not JSON. Pull out a clean display value."""
    text = str(input_str)
    try:
        parsed = ast.literal_eval(text)
    except (ValueError, SyntaxError):
        return text

    if isinstance(parsed, dict):
        for key in ("query", "url", "input", "__arg1"):
            if key in parsed:
                return str(parsed[key])
        values = list(parsed.values())
        return str(values[0]) if values else text

    return str(parsed)


class QueueCallbackHandler(BaseCallbackHandler):
    """Relays a single agent's tool calls onto the shared event queue."""

    def __init__(self, event_queue: "queue.Queue", phase: str):
        self.event_queue = event_queue
        self.phase = phase

    def on_tool_start(self, serialized, input_str, *, run_id=None, **kwargs):
        tool_name = (serialized or {}).get("name", "tool")
        self.event_queue.put(
            {
                "type": "tool_call",
                "phase": self.phase,
                "call_id": str(run_id),
                "tool": tool_name,
                "detail": _stringify_tool_input(input_str),
            }
        )

    def on_tool_end(self, output, *, run_id=None, **kwargs):
        self.event_queue.put(
            {
                "type": "tool_result",
                "phase": self.phase,
                "call_id": str(run_id),
            }
        )

    def on_tool_error(self, error, *, run_id=None, **kwargs):
        self.event_queue.put(
            {
                "type": "tool_error",
                "phase": self.phase,
                "call_id": str(run_id),
                "message": str(error)[:300],
            }
        )


def _run_pipeline(query: str, event_queue: "queue.Queue") -> None:
    state = {
        "query": query,
        "search_results": None,
        "research_notes": [],
        "final_report": None,
    }

    try:
        event_queue.put({"type": "phase_start", "phase": "search"})
        state = run_search(state, callbacks=[
                           QueueCallbackHandler(event_queue, "search")])
        event_queue.put({"type": "phase_end", "phase": "search"})

        event_queue.put({"type": "phase_start", "phase": "reader"})
        state = run_reader(state, callbacks=[
                           QueueCallbackHandler(event_queue, "reader")])
        event_queue.put({"type": "phase_end", "phase": "reader"})
        event_queue.put({"type": "phase_start", "phase": "critic"})
        state = run_critic(state, callbacks=[
                           QueueCallbackHandler(event_queue, "critic")])
        event_queue.put({"type": "phase_end", "phase": "critic"})

        event_queue.put({"type": "final", "report": state["final_report"]})
    except Exception as exc:  # noqa: BLE001 - surface any failure to the client
        event_queue.put({"type": "error", "message": str(exc)})
    finally:
        event_queue.put({"type": "done"})


def stream_research(query: str, heartbeat_interval: float = 15.0) -> Iterator[dict]:
    """Yields UI events as the pipeline runs on a background thread.

    A heartbeat event is yielded whenever nothing has happened for
    `heartbeat_interval` seconds, purely so the HTTP connection (and any
    proxy in front of it) doesn't get treated as idle and closed.
    """
    event_queue: "queue.Queue" = queue.Queue()
    thread = threading.Thread(target=_run_pipeline, args=(
        query, event_queue), daemon=True)
    thread.start()

    while True:
        try:
            event = event_queue.get(timeout=heartbeat_interval)
        except queue.Empty:
            yield {"type": "heartbeat"}
            continue

        yield event
        if event.get("type") == "done":
            break
