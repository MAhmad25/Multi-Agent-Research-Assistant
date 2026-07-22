# Multi Agent Research Assistant

Full-stack multi-agent research assistant that turns a user query into a structured research report through a search, read, and critique workflow.

<div class="display:flex;"><img src="https://i.ibb.co/h1KpCTj9/737-1x-shots-so.png" alt="737-1x-shots-so" border="0">
<img src="https://i.ibb.co/WpyrzWz3/507-1x-shots-so.png" alt="507-1x-shots-so" border="0">
</div>

## Overview

This project is built to reduce manual research time by orchestrating specialized agents instead of relying on a single model response.

The backend runs a three-stage pipeline:

1. Search agent finds relevant sources from the web.
2. Reader agent opens the most relevant pages and extracts usable content.
3. Critic agent refines the collected notes into a final report.

The frontend consumes streamed events over Server-Sent Events, so users can see each phase of the research process in real time.

## Key Features

- Multi-agent workflow with separated responsibilities for search, reading, and critique
- Real-time streaming updates for phase status, tool calls, and final output
- Prompt-engineered agent pipeline powered by LangChain
- OpenRouter-backed LLM responses
- Tavily-powered web search for source discovery
- Webpage content extraction and cleaning before report generation
- Markdown report rendering with grouped citations
- Copy-to-clipboard support for the final report
- Stop and reset controls for long-running research sessions

## Tech Stack

| Layer              | Tools                              | Purpose                                   |
| ------------------ | ---------------------------------- | ----------------------------------------- |
| Frontend           | React, TypeScript, Vite            | User interface and app shell              |
| UI                 | Tailwind CSS, Motion, Lucide React | Styling, motion, and icons                |
| Backend            | FastAPI, Python                    | API layer and streaming endpoint          |
| AI Orchestration   | LangChain                          | Agent creation and prompt-driven workflow |
| LLM Provider       | OpenRouter                         | Model access for agent responses          |
| Search             | Tavily                             | Web search and source discovery           |
| Content Extraction | BeautifulSoup, Requests            | Page reading and text cleaning            |
| Markdown           | React Markdown, remark-gfm         | Report rendering                          |

## Architecture

The system is split into two parts:

### Backend

- `search_agent` uses Tavily search to collect relevant sources.
- `reader_agent` fetches and cleans webpage content.
- `critic_agent` synthesizes the final report from the collected notes.
- `research_pipeline_stream.py` runs the pipeline on a background thread and emits structured events.
- `app/main.py` exposes the API and enables CORS for the frontend.

### Frontend

- `useResearch.ts` manages the run state and handles incoming stream events.
- `ResearchTimeline` shows each phase and its tool activity.
- `ReportView` renders the final report in Markdown and supports citations.
- `ChatInput` submits queries and provides stop/reset behavior for active runs.

## Environment Variables

Create `.env` files from the examples below.

### Backend `.env`

| Variable             | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `OPENROUTER_API_KEY` | API key used for OpenRouter LLM access                              |
| `TAVILY_API_KEY`     | API key used for web search                                         |
| `FRONTEND_URL`       | Optional frontend origin for CORS, for example the deployed app URL |

### Frontend `.env`

| Variable            | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL, default is `http://localhost:8000` |

## Local Setup

### 1. Backend

```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| `GET`  | `/api/health`          | Health check endpoint          |
| `POST` | `/api/research/stream` | Starts a streamed research run |

## Research Flow

1. The user submits a topic or question.
2. The backend creates a shared research state object.
3. The search agent gathers candidate sources.
4. The reader agent extracts and cleans source content.
5. The critic agent composes the final report.
6. The frontend updates the timeline and renders the report as the stream progresses.

## Project Structure

```text
backend/
  app/
  agents/
  prompts/
  tools/
  research_pipeline.py
  research_pipeline_stream.py
frontend/
  src/
    components/
    hooks/
    lib/
    types/
```

- Live demo: https://researcharena.vercel.app

## Notes

- The backend is designed around streaming output, not a single blocking response.
- The report is rendered in Markdown, which keeps the output readable and citation-friendly.
- The frontend can stop an active run and reset the workspace for a new query.

MIT Licence
